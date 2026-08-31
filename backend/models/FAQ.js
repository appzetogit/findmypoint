const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  businessId: { type: String, default: null }, // References business slug id (null for platform/Help Center FAQs)
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('FAQ', FAQSchema);

