const Transaction = require('../models/Transaction');

// @desc    Get user transactions (All for Admin, user-specific for regular users)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    let query = {};
    if (!req.user.isAdmin) {
      query = { userId: req.user._id };
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a transaction log
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const { description, businessName, businessId, bookingId, customerName, details, amount, type, paymentMethod, status } = req.body;

  if (amount === undefined || !type || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Please provide amount, type, and paymentMethod' });
  }

  try {
    // Generate simple ID TXN-YYYYMMDD-xxx
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

    const transaction = await Transaction.create({
      id: txnId,
      timestamp,
      description: description || details || 'Booking Payment',
      businessName: businessName || '',
      businessId: businessId || '',
      bookingId: bookingId || '',
      customerName: customerName || 'Guest',
      details: details || description || 'Booking Payment',
      amount,
      type,
      paymentMethod,
      status: status || 'Completed',
      userId: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions by businessId
// @route   GET /api/transactions/business/:businessId
// @access  Private (Client/Admin Auth)
const getTransactionsByBusiness = async (req, res) => {
  try {
    const transactions = await Transaction.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refund a transaction by txnId
// @route   PUT /api/transactions/:txnId/refund
// @access  Private (Client/Admin Auth)
const refundTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.txnId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    transaction.status = 'Refunded';
    await transaction.save();
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionsByBusiness,
  refundTransaction
};
