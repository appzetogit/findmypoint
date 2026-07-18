const mongoose = require('mongoose');

const FormFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  optionsInput: { type: String },
  checkboxMode: { type: String, enum: ['single', 'multiple'] },
  selectMode: { type: String, enum: ['single', 'multiple'] }
}, { _id: false });

const ServiceFormConfigSchema = new mongoose.Schema({
  businessId: { type: String, required: true, unique: true }, // Slug reference to the business
  fields: [FormFieldSchema],
  bookNowEnabled: { type: Boolean, default: true },
  formTitle: { type: String, default: 'Book Our Services' },
  formDescription: { type: String, default: 'Fill in the details below to book or enquire.' }
}, { timestamps: true });

module.exports = mongoose.model('ServiceFormConfig', ServiceFormConfigSchema);
