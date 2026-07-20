const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
  businessId: { type: String, required: true }, // References business slug id
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', FAQSchema);
