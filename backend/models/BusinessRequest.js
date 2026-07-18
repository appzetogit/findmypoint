const mongoose = require('mongoose');

const BusinessRequestSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  category: { type: String, required: true },
  ownerName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  email: { type: String, required: true },
  addressDetails: { type: String, required: true },
  photos: [{ type: String }],
  openTime: { type: String },
  closeTime: { type: String },
  isTimeMandatory: { type: Boolean, default: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  area: { type: String, required: true },
  town: { type: String, required: true },
  city: { type: String },
  pinCode: { type: String, required: true },
  employeeName: { type: String, default: 'None' },
  amountPaid: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('BusinessRequest', BusinessRequestSchema);
