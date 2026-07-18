const mongoose = require('mongoose');

const HeroSubcategoryItemSchema = new mongoose.Schema({
  img: { type: String, default: '' },
  label: { type: String, required: true },
  categoryName: { type: String, required: true },
  subcategoryName: { type: String, required: true }
}, { _id: false });

const HeroSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [HeroSubcategoryItemSchema],
  order: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('HeroSection', HeroSectionSchema);
