const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bookingId: { type: String, default: '' },
  businessId: { type: String, required: true }, // References business slug id
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
