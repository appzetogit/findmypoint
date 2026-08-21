const Withdrawal = require('../models/Withdrawal');

// @desc    Get all withdrawals (Admin sees all, Client sees own)
// @route   GET /api/withdrawals
// @access  Private
const getWithdrawals = async (req, res) => {
  try {
    let query = {};
    if (!req.user.isAdmin) {
      if (req.user.isBusiness) {
        query = { businessId: req.user.businessId };
      } else {
        query = { userId: req.user._id };
      }
    }

    const withdrawals = await Withdrawal.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: withdrawals.length, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get withdrawals for a specific business
// @route   GET /api/withdrawals/business/:businessId
// @access  Private
const getWithdrawalsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const isAuthorizedAdmin = req.user && req.user.isAdmin;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && req.user.businessId === businessId;

    if (!isAuthorizedAdmin && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to view withdrawals for this business' });
    }

    const withdrawals = await Withdrawal.find({ businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Transaction = require('../models/Transaction');
const BusinessCommission = require('../models/BusinessCommission');

// Helper to calculate withdrawable balance for a business
const calculateWithdrawableBalance = async (businessId) => {
  const transactions = await Transaction.find({ businessId });
  const completedTxns = transactions.filter(t => t.status === 'Completed');
  const salesVolume = completedTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const commissionDoc = await BusinessCommission.findOne({ businessId });
  const commissionRate = commissionDoc ? commissionDoc.commissionRate : 10;
  const adminEarnings = (salesVolume * commissionRate) / 100;
  const netEarnings = Math.max(0, salesVolume - adminEarnings);

  const withdrawals = await Withdrawal.find({
    businessId,
    status: { $in: ['Completed', 'Processing'] }
  });
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  return Math.max(0, netEarnings - totalWithdrawn);
};

// @desc    Create a new withdrawal request
// @route   POST /api/withdrawals
// @access  Private
const createWithdrawal = async (req, res) => {
  const {
    businessId,
    businessName,
    amount,
    method,
    target,
    bankDetails,
    upiId
  } = req.body;

  if (!businessId || !amount || !method || !target) {
    return res.status(400).json({ success: false, message: 'Please provide businessId, amount, method, and target' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Withdrawal amount must be a positive number' });
  }

  try {
    const isAuthorizedAdmin = req.user && req.user.isAdmin;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && req.user.businessId === businessId;

    if (!isAuthorizedAdmin && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to request withdrawal for this business' });
    }

    // BUG-003: Server-side overdraft protection
    if (!isAuthorizedAdmin) {
      const availableBalance = await calculateWithdrawableBalance(businessId);
      if (numAmount > availableBalance) {
        return res.status(400).json({
          success: false,
          message: `Withdrawal amount ₹${numAmount} exceeds your current withdrawable balance of ₹${availableBalance.toFixed(2)}.`
        });
      }
    }

    const withdrawalId = `WD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const withdrawal = await Withdrawal.create({
      id: withdrawalId,
      businessId,
      businessName: businessName || '',
      userId: req.user ? req.user._id : undefined,
      amount: numAmount,
      method,
      target,
      bankDetails: bankDetails || {},
      upiId: upiId || '',
      status: 'Processing',
      timestamp
    });

    res.status(201).json({ success: true, data: withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update withdrawal status (Approve / Reject by Admin)
// @route   PUT /api/withdrawals/:id/status
// @access  Private/Admin
const updateWithdrawalStatus = async (req, res) => {
  const { status, adminNotes } = req.body;

  if (!status || !['Completed', 'Failed', 'Processing'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    const withdrawal = await Withdrawal.findOne({ id: req.params.id });

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal record not found' });
    }

    withdrawal.status = status;
    if (adminNotes !== undefined) withdrawal.adminNotes = adminNotes;
    if (status === 'Completed' || status === 'Failed') {
      withdrawal.processedAt = new Date();
    }

    await withdrawal.save();
    res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWithdrawals,
  getWithdrawalsByBusiness,
  createWithdrawal,
  updateWithdrawalStatus
};
