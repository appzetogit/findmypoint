const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  label: { type: String, required: true },
  icon: { type: String, default: '' } // Base64 or image URL/emoji
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true },
  img: { type: String, required: true }, // Base64 or image URL/path
  subcategories: [subcategorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
