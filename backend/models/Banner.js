const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['slide', 'card'],
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  // Slide specific fields
  tag: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  // Card specific fields
  subtitle: {
    type: String,
    default: ''
  },
  gradient: {
    type: String,
    default: ''
  },
  themeColor: {
    type: String,
    default: ''
  },
  // Common fields
  img: {
    type: String,
    default: ''
  },
  categoryName: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
