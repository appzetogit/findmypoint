const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Business = require('../models/Business');
const { slugify } = require('../utils/slugify');

// Helper to verify caller owns the business listing or is an Admin
const verifyBusinessAccess = async (req, businessId) => {
  if (!req.user) return false;
  if (req.user.isAdmin === true) return true;
  if (req.user.isBusiness === true && req.user.businessId === businessId) return true;
  if (req.user._id) {
    const isObjectId = mongoose.isValidObjectId(businessId);
    const business = await Business.findOne({
      $or: [
        { id: businessId },
        { slug: slugify(businessId) },
        ...(isObjectId ? [{ _id: businessId }] : [])
      ]
    });
    if (business && (
      (business.owner && business.owner.toString() === req.user._id.toString()) ||
      (req.user.isBusiness && req.user.businessId === business.id)
    )) {
      return true;
    }
  }
  return false;
};

// @desc    Get user transactions (All for Admin, user-specific for regular users)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    let query = {};
    if (!req.user.isAdmin) {
      query = { userId: req.user._id };

      // Ensure any bookings by this user without a transaction entry are auto-synced
      try {
        const userBookings = await Booking.find({ userId: req.user._id });
        if (userBookings && userBookings.length > 0) {
          for (const booking of userBookings) {
            let existing = await Transaction.findOne({ bookingId: booking.id });
            if (!existing) {
              const bDate = new Date(booking.createdAt || Date.now());
              const dateStr = bDate.toISOString().slice(0, 10).replace(/-/g, '');
              const txnId = `TXN-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
              const timestamp = bDate.toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
              }) + `, ` + bDate.toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', hour12: true
              });
              const isPaid = booking.paymentId || booking.paymentStatus === 'paid';
              const isRefunded = booking.paymentStatus === 'refunded';
              await Transaction.create({
                id: txnId,
                timestamp,
                description: booking.service ? `${booking.service}` : `Booking - ${booking.businessName}`,
                businessName: booking.businessName || '',
                businessId: booking.businessId || '',
                bookingId: booking.id,
                customerName: booking.customerName || 'Customer',
                details: booking.service ? `${booking.service} at ${booking.businessName}` : `Payment for ${booking.businessName}`,
                amount: booking.amount,
                type: isRefunded ? 'credit' : 'debit',
                paymentMethod: booking.paymentMethod || 'Online',
                status: isRefunded ? 'Refunded' : (isPaid ? 'Completed' : 'Pending'),
                userId: booking.userId,
                createdAt: booking.createdAt || new Date()
              });
            } else {
              let modified = false;
              if (booking.paymentStatus === 'refunded' && existing.status !== 'Refunded') {
                existing.status = 'Refunded';
                modified = true;
              }
              if (existing.type === 'credit' && existing.status !== 'Refunded') {
                existing.type = 'debit';
                modified = true;
              }
              if (modified) {
                await existing.save();
              }
            }
          }
        }
      } catch (syncErr) {
        console.error('Error auto-syncing bookings to transactions:', syncErr.message);
      }
    }

    // Optional source filter (?source=help_center or ?source=business)
    if (req.query.source) {
      if (req.query.source === 'business') {
        query.source = { $ne: 'help_center' };
      } else {
        query.source = req.query.source;
      }
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
  const {
    description,
    businessName,
    businessId,
    bookingId,
    customerName,
    customerEmail,
    customerPhone,
    details,
    amount,
    type,
    paymentMethod,
    status,
    tag,
    source,
    razorpayPaymentId,
    razorpayOrderId
  } = req.body;

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

    // Prevent duplicates if a transaction for this bookingId or razorpayPaymentId already exists
    if (bookingId) {
      const existing = await Transaction.findOne({ bookingId });
      if (existing) {
        existing.status = status || existing.status;
        existing.amount = amount !== undefined ? amount : existing.amount;
        existing.paymentMethod = paymentMethod || existing.paymentMethod;
        existing.description = description || existing.description;
        existing.details = details || existing.details;
        if (customerEmail) existing.customerEmail = customerEmail;
        if (customerPhone) existing.customerPhone = customerPhone;
        if (tag) existing.tag = tag;
        if (source) existing.source = source;
        if (req.user && !existing.userId) {
          existing.userId = req.user._id;
        }
        await existing.save();
        return res.status(200).json({ success: true, data: existing });
      }
    }

    if (razorpayPaymentId) {
      const existingTxn = await Transaction.findOne({ razorpayPaymentId });
      if (existingTxn) {
        return res.status(200).json({ success: true, data: existingTxn });
      }
    }

    const transaction = await Transaction.create({
      id: txnId,
      timestamp,
      description: description || details || 'Booking Payment',
      businessName: businessName || '',
      businessId: businessId || '',
      bookingId: bookingId || '',
      customerName: customerName || 'Guest',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      details: details || description || 'Booking Payment',
      amount,
      type: type || 'debit',
      paymentMethod,
      status: status || 'Completed',
      tag: tag || '',
      source: source || 'business',
      razorpayPaymentId: razorpayPaymentId || '',
      razorpayOrderId: razorpayOrderId || '',
      userId: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions by businessId
// @route   GET /api/transactions/business/:businessId
// @access  Private (Client Owner / Admin Auth)
const getTransactionsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to view transactions for this business' });
    }

    const transactions = await Transaction.find({ businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Booking = require('../models/Booking');

// @desc    Refund a transaction by txnId
// @route   PUT /api/transactions/:txnId/refund
// @access  Private (Client Owner / Admin Auth)
const refundTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ id: req.params.txnId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const hasAccess = await verifyBusinessAccess(req, transaction.businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to refund this transaction' });
    }

    transaction.status = 'Refunded';
    await transaction.save();

    // BUG-002 fix: Synchronize matching booking if bookingId is attached
    if (transaction.bookingId) {
      try {
        await Booking.findOneAndUpdate(
          { id: transaction.bookingId },
          {
            $set: {
              paymentStatus: 'refunded',
              status: 'cancelled'
            }
          }
        );
      } catch (bkErr) {
        console.error('Warning: Failed to sync refunded status to booking:', bkErr.message);
      }
    }

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
