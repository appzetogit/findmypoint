const BusinessRequest = require('../models/BusinessRequest');
const ListingFee = require('../models/ListingFee');
const razorpayService = require('../services/razorpayService');
const Transaction = require('../models/Transaction');
const whatsappService = require('../services/whatsappService');

// @desc    Get current configured listing fee
// @route   GET /api/business-requests/fee
// @access  Public
const getFee = async (req, res) => {
  try {
    let fee = await ListingFee.findOne();
    if (!fee) {
      // Safe create if not found
      fee = await ListingFee.create({ amount: 500 });
    }
    res.status(200).json({ success: true, amount: fee.amount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update listing fee configuration
// @route   POST /api/business-requests/fee
// @access  Private/Admin
const saveFee = async (req, res) => {
  const { amount } = req.body;
  if (amount === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide an amount' });
  }

  try {
    const feeAmount = Number(amount);
    if (isNaN(feeAmount) || feeAmount < 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a valid non-negative number' });
    }

    // Safe update/upsert
    let fee = await ListingFee.findOne();
    if (!fee) {
      fee = new ListingFee({ amount: feeAmount });
    } else {
      fee.amount = feeAmount;
    }
    await fee.save();

    res.status(200).json({
      success: true,
      message: 'Listing fee updated successfully',
      amount: fee.amount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all business requests
// @route   GET /api/business-requests
// @access  Private/Admin
const getRequests = async (req, res) => {
  try {
    const requests = await BusinessRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new business request (saves as Pending and creates Razorpay order)
// @route   POST /api/business-requests
// @access  Public / Optional Auth
const createRequest = async (req, res) => {
  try {

    // 1. Fetch current fee
    let fee = await ListingFee.findOne();
    const feeAmount = fee ? Number(fee.amount) || 0 : 500;

    // 2. Save request in database as Pending
    const newRequest = new BusinessRequest({
      ...req.body,
      userId: req.user && req.user._id ? req.user._id : undefined,
      amountPaid: feeAmount,
      paymentStatus: feeAmount > 0 ? 'Pending' : 'Paid'
    });
    const savedRequest = await newRequest.save();

    // 3. Create Razorpay order if fee > 0
    let order = null;
    if (feeAmount > 0) {
      try {
        const orderData = {
          amount: feeAmount,
          receipt: `rcpt_req_${savedRequest._id.toString().slice(-6)}_${Date.now().toString().slice(-4)}`,
          notes: {
            requestId: savedRequest._id.toString(),
            userId: req.user && req.user._id ? req.user._id.toString() : 'guest'
          }
        };

        order = await razorpayService.createOrder(orderData);

        // Save order ID to request document
        savedRequest.razorpayOrderId = order.id;
        await savedRequest.save();
      } catch (orderErr) {
        console.error('⚠️ Razorpay order creation error:', orderErr.message);
        // If razorpay fails, still return request with warning so user is informed
        return res.status(201).json({
          success: true,
          request: savedRequest,
          order: null,
          warning: 'Request saved, but payment gateway initialization is pending.'
        });
      }
    }

    // 4. Handle WhatsApp notifications
    const targetWa = savedRequest.whatsappNumber || savedRequest.contactNumber;
    if (targetWa) {
      if (feeAmount === 0 || savedRequest.paymentStatus === 'Paid') {
        // Free listing or immediate Paid: dispatch Paid notification
        whatsappService.sendBusinessLeadNotification({
          phone: targetWa,
          ownerName: savedRequest.ownerName,
          businessName: savedRequest.businessName,
          category: savedRequest.category,
          requestId: savedRequest._id ? savedRequest._id.toString().slice(-6) : 'REQ',
          amount: 0,
          status: 'Paid'
        }).then(waRes => {
          console.log(`✅ [WhatsApp] Free listing registration confirmed for ${targetWa}. MsgId:`, waRes?.response);
        }).catch(waErr => {
          console.warn(`⚠️ [WhatsApp] Lead notification failed:`, waErr.message);
        });
      } else {
        // Fee > 0: set a 60-second fallback timer to notify if payment remains pending
        setTimeout(async () => {
          try {
            const freshRequest = await BusinessRequest.findById(savedRequest._id);
            if (freshRequest && freshRequest.paymentStatus === 'Pending' && !freshRequest.pendingNotified) {
              freshRequest.pendingNotified = true;
              await freshRequest.save();

              const timerWa = freshRequest.whatsappNumber || freshRequest.contactNumber;
              if (timerWa) {
                whatsappService.sendBusinessLeadNotification({
                  phone: timerWa,
                  ownerName: freshRequest.ownerName,
                  businessName: freshRequest.businessName,
                  category: freshRequest.category,
                  requestId: freshRequest._id ? freshRequest._id.toString().slice(-6) : 'REQ',
                  amount: freshRequest.amountPaid,
                  status: 'Pending'
                }).then(waRes => {
                  console.log(`✅ [WhatsApp] Pending lead registration reminder sent (timer) to ${timerWa}. MsgId:`, waRes?.response);
                }).catch(waErr => {
                  console.warn(`⚠️ [WhatsApp] Pending lead notification failed:`, waErr.message);
                });
              }
            }
          } catch (timerErr) {
            console.warn('[WhatsApp] Error in pending timer check:', timerErr.message);
          }
        }, 60000);
      }
    }

    res.status(201).json({
      success: true,
      request: savedRequest,
      order: order ? {
        ...order,
        keyId: process.env.RAZORPAY_KEY_ID?.trim() || order.keyId || ''
      } : null
    });
  } catch (error) {
    console.error('❌ Error creating business request:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create business request' });
  }
};

// @desc    Verify Razorpay payment and activate listing request (sets to Paid)
// @route   POST /api/business-requests/verify-payment
// @access  Public / Optional Auth
const verifyPayment = async (req, res) => {
  const { requestId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!requestId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Please provide all verification details (requestId, razorpayOrderId, razorpayPaymentId, razorpaySignature)' });
  }

  try {
    // 1. Verify Razorpay signature
    const isValid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    // 2. Update database request status
    const request = await BusinessRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Business request not found' });
    }

    request.paymentStatus = 'Paid';
    request.razorpayOrderId = razorpayOrderId;
    request.razorpayPaymentId = razorpayPaymentId;
    await request.save();

    // 3. Create a transaction record in database
    try {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(100 + Math.random() * 900);
      const txnId = `TXN-${today}-${rand}`;

      const timestamp = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + `, ` + new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      await Transaction.create({
        id: txnId,
        timestamp,
        description: `Field Work Listing Fee - ${request.businessName}`,
        businessName: request.businessName,
        amount: request.amountPaid,
        type: 'credit',
        paymentMethod: 'card', // Razorpay payment
        status: 'Completed',
        userId: request.userId || (req.user ? req.user._id : undefined)
      });
      console.log(`✅ Transaction log created successfully for listing request: ${request.businessName}`);
    } catch (txnError) {
      console.error('⚠️ Failed to log transaction in database:', txnError.message);
    }

    // 4. Dispatch WhatsApp Payment Confirmed notification to owner
    const targetWa = request.whatsappNumber || request.contactNumber;
    if (targetWa) {
      whatsappService.sendBusinessLeadNotification({
        phone: targetWa,
        ownerName: request.ownerName,
        businessName: request.businessName,
        category: request.category,
        requestId: request._id ? request._id.toString().slice(-6) : 'REQ',
        amount: request.amountPaid,
        status: 'Paid'
      }).then(waRes => {
        console.log(`✅ [WhatsApp] Field work listing payment confirmation sent to ${targetWa}. MsgId:`, waRes?.response);
      }).catch(waErr => {
        console.warn(`⚠️ [WhatsApp] Field work listing payment notification failed:`, waErr.message);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and request submitted successfully.',
      data: request
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

// @desc    Get or create a Razorpay order for a pending request
// @route   POST /api/business-requests/:id/payment-order
// @access  Public / Optional Auth
const getPaymentOrder = async (req, res) => {
  try {
    const request = await BusinessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Business request not found' });
    }

    if (request.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This business request has already been paid.' });
    }

    const feeAmount = request.amountPaid || 500;

    // Create a new Razorpay order
    const orderData = {
      amount: feeAmount,
      receipt: `rcpt_req_${request._id.toString().slice(-6)}_${Date.now().toString().slice(-4)}`,
      notes: {
        requestId: request._id.toString(),
        userId: request.userId ? request.userId.toString() : (req.user && req.user._id ? req.user._id.toString() : 'guest')
      }
    };

    const order = await razorpayService.createOrder(orderData);

    // Save/update the order ID to the request document
    request.razorpayOrderId = order.id;
    await request.save();

    res.status(200).json({
      success: true,
      order: {
        ...order,
        keyId: process.env.RAZORPAY_KEY_ID?.trim() || order.keyId || ''
      }
    });
  } catch (error) {
    console.error('❌ Error generating payment order:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate payment order' });
  }
};

// @desc    Delete a business request
// @route   DELETE /api/business-requests/:id
// @access  Private/Admin
const deleteRequest = async (req, res) => {
  try {
    const request = await BusinessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Business request not found' });
    }

    // Safe targeted delete by ID
    await BusinessRequest.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Business request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger instant pending notification (when user skips/closes payment modal)
// @route   POST /api/business-requests/:id/notify-pending
// @access  Public / Optional Auth
const notifyPending = async (req, res) => {
  try {
    const request = await BusinessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.paymentStatus === 'Pending' && !request.pendingNotified) {
      request.pendingNotified = true;
      await request.save();

      const targetWa = request.whatsappNumber || request.contactNumber;
      if (targetWa) {
        whatsappService.sendBusinessLeadNotification({
          phone: targetWa,
          ownerName: request.ownerName,
          businessName: request.businessName,
          category: request.category,
          requestId: request._id ? request._id.toString().slice(-6) : 'REQ',
          amount: request.amountPaid,
          status: 'Pending'
        }).then(waRes => {
          console.log(`✅ [WhatsApp] Pending lead registration notification sent (modal dismiss/skip) to ${targetWa}. MsgId:`, waRes?.response);
        }).catch(waErr => {
          console.warn(`⚠️ [WhatsApp] Pending lead notification failed:`, waErr.message);
        });
      }
    }

    res.status(200).json({ success: true, message: 'Pending notification handled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFee,
  saveFee,
  getRequests,
  createRequest,
  verifyPayment,
  getPaymentOrder,
  notifyPending,
  deleteRequest
};
