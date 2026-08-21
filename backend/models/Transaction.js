const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // TXN-20260702-001 etc.
  timestamp: { type: String }, // e.g. "02 Jul 2026, 10:15 AM"
  description: { type: String, required: true },
  businessName: { type: String, default: '' },
  businessId: { type: String, default: '' }, // e.g. "ayurvedic-spa"
  bookingId: { type: String, default: '' }, // e.g. "sub-xxxx"
  customerName: { type: String, default: 'Guest' },
  details: { type: String, default: '' },
  amount: { type: Number, required: true },
  type: { type: String, default: 'credit' }, // 'debit', 'credit', 'Order'
  paymentMethod: { type: String, default: 'Online' }, // 'COD', 'Razorpay Gateway', 'upi', etc.
  status: { type: String, default: 'Completed' }, // 'Completed', 'Pending', 'Refunded', 'Failed'
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// PERF-003: Indexes for fast lookup queries
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ businessId: 1 });
TransactionSchema.index({ bookingId: 1 });
TransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
