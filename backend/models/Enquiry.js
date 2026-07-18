const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  businessId: { type: String, required: true }, // e.g. "vishal-mega-mart"
  businessName: { type: String },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  subject: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['New', 'Contacted', 'Closed'], default: 'New' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', EnquirySchema);
