const mongoose = require('mongoose');

const PolicySectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  icon: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const PrivacyPolicySchema = new mongoose.Schema({
  lastUpdated: { type: String, default: 'July 2026' },
  sections: [PolicySectionSchema]
}, { timestamps: true });

module.exports = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);
