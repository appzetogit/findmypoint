const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    businessId: {
      type: String,
      required: true,
      index: true
    },
    businessName: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    method: {
      type: String,
      enum: ['bank', 'upi'],
      required: true
    },
    target: {
      type: String,
      required: true
    },
    bankDetails: {
      holderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifsc: { type: String, default: '' }
    },
    upiId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Processing', 'Completed', 'Failed'],
      default: 'Processing',
      index: true
    },
    timestamp: {
      type: String,
      required: true
    },
    processedAt: {
      type: Date
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
