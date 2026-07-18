const BusinessRequest = require('../models/BusinessRequest');
const ListingFee = require('../models/ListingFee');
const razorpayService = require('../services/razorpayService');
const Transaction = require('../models/Transaction');

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
// @access  Private
const createRequest = async (req, res) => {
  try {
    // 1. Fetch current fee
    let fee = await ListingFee.findOne();
    const feeAmount = fee ? fee.amount : 500;

    // 2. Save request in database as Pending
    const newRequest = new BusinessRequest({
      ...req.body,
      userId: req.user._id,
      amountPaid: feeAmount,
      paymentStatus: 'Pending'
    });
    const savedRequest = await newRequest.save();

    // 3. Create Razorpay order
    const orderData = {
      amount: feeAmount,
      receipt: `rcpt_req_${savedRequest._id}_${Date.now().toString().slice(-4)}`,
      notes: {
        requestId: savedRequest._id.toString(),
        userId: req.user._id.toString()
      }
    };

    const order = await razorpayService.createOrder(orderData);

    // Save order ID to request document
    savedRequest.razorpayOrderId = order.id;
    await savedRequest.save();

    res.status(201).json({
      success: true,
      request: savedRequest,
      order
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment and activate listing request (sets to Paid)
// @route   POST /api/business-requests/verify-payment
// @access  Private
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
        userId: request.userId
      });
      console.log(`✅ Transaction log created successfully for listing request: ${request.businessName}`);
    } catch (txnError) {
      console.error('⚠️ Failed to log transaction in database:', txnError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and request submitted successfully.',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or create a Razorpay order for a pending request
// @route   POST /api/business-requests/:id/payment-order
// @access  Private
const getPaymentOrder = async (req, res) => {
  try {
    const request = await BusinessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Business request not found' });
    }

    if (request.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This business request has already been paid.' });
    }

    // Create a new Razorpay order
    const orderData = {
      amount: request.amountPaid || 500,
      receipt: `rcpt_req_${request._id}_${Date.now().toString().slice(-4)}`,
      notes: {
        requestId: request._id.toString(),
        userId: request.userId ? request.userId.toString() : req.user._id.toString()
      }
    };

    const order = await razorpayService.createOrder(orderData);

    // Save/update the order ID to the request document
    request.razorpayOrderId = order.id;
    await request.save();

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

module.exports = {
  getFee,
  saveFee,
  getRequests,
  createRequest,
  verifyPayment,
  getPaymentOrder,
  deleteRequest
};
