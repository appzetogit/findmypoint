const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // TXN-20260702-001 etc.
  timestamp: { type: String }, // e.g. "02 Jul 2026, 10:15 AM"
  description: { type: String, required: true },
  businessName: { type: String },
  businessId: { type: String }, // e.g. "ayurvedic-spa"
  bookingId: { type: String }, // e.g. "sub-xxxx"
  customerName: { type: String },
  details: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'Razorpay Gateway'], required: true },
  status: { type: String, enum: ['Completed', 'Refunded', 'Failed'], default: 'Completed' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
