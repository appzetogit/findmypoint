const mongoose = require('mongoose');

const TouristPlaceReviewSchema = new mongoose.Schema({
  placeName: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userInitial: { type: String },
  userColor: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  reviewText: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TouristPlaceReview', TouristPlaceReviewSchema);
