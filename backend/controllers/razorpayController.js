const razorpayService = require('../services/razorpayService');
const Transaction = require('../models/Transaction');

// @desc    Get Razorpay Public Key ID from environment
// @route   GET /api/razorpay/key
// @access  Public
const getKey = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';
    if (!keyId) {
      return res.status(500).json({
        success: false,
        message: 'RAZORPAY_KEY_ID is not configured in backend environment variables (.env)'
      });
    }
    res.status(200).json({
      success: true,
      keyId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Razorpay Order
// @route   POST /api/razorpay/order
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // In INR

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const order = await razorpayService.createOrder({
      amount: Number(amount),
      receipt: `rcpt_${Date.now()}`
    });

    const keyId = process.env.RAZORPAY_KEY_ID?.trim() || '';

    res.status(200).json({
      success: true,
      data: {
        ...order,
        keyId
      },
      keyId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/razorpay/verify
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      payerName,
      payerEmail,
      payerPhone,
      source,
      tag,
      description,
      details
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment fields for verification' });
    }

    const isValid = razorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (isValid) {
      let createdTransaction = null;

      // Auto-create transaction for Help Center payments or direct payment requests
      if (source === 'help_center' || tag === 'By Help Center' || (amount && Number(amount) > 0)) {
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

          // Check if already created
          const existing = await Transaction.findOne({ razorpayPaymentId: razorpay_payment_id });
          if (!existing) {
            createdTransaction = await Transaction.create({
              id: txnId,
              timestamp,
              description: description || 'Help Center Payment / Contribution',
              businessName: 'Help Center',
              businessId: 'help_center',
              customerName: payerName || 'Online User',
              customerEmail: payerEmail || '',
              customerPhone: payerPhone || '',
              details: details || 'Official Direct Payment via Help Center Razorpay Gateway',
              amount: Number(amount) || 0,
              type: 'credit',
              paymentMethod: 'Razorpay Gateway',
              status: 'Completed',
              tag: tag || 'By Help Center',
              source: source || 'help_center',
              razorpayPaymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id
            });
          } else {
            createdTransaction = existing;
          }
        } catch (dbErr) {
          console.error('Failed to auto-record transaction in verifyPayment:', dbErr);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          transaction: createdTransaction
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getKey,
  createOrder,
  verifyPayment
};
