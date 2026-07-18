const mongoose = require('mongoose');

const PlaceItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number },
  reviewsCount: { type: Number },
  image: { type: String },
  desc: { type: String },
  tags: [{ type: String }],
  price: { type: String },
  businessId: { type: String }
}, { _id: false });

const CategoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String }
}, { _id: false });

const FAQItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const TouristPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  coverImage: { type: String },
  images: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  description: { type: String },
  categories: [CategoryItemSchema],
  temples: [PlaceItemSchema],
  hotels: [PlaceItemSchema],
  restaurants: [PlaceItemSchema],
  spas: [PlaceItemSchema],
  activities: [PlaceItemSchema],
  faqs: [FAQItemSchema],
  bestTime: { type: String },
  idealDuration: { type: String },
  nearestAirport: { type: String },
  localTransport: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TouristPlace', TouristPlaceSchema);
