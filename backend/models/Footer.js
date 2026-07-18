const mongoose = require('mongoose');

const SocialLinkItemSchema = new mongoose.Schema({
  id: {
    type: String,
    enum: ['facebook', 'youtube', 'instagram', 'linkedin', 'x'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const FooterSchema = new mongoose.Schema({
  tagline: {
    type: String,
    default: ''
  },
  socials: [SocialLinkItemSchema],
  playstoreUrl: {
    type: String,
    default: ''
  },
  appstoreUrl: {
    type: String,
    default: ''
  },
  copyright: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Footer', FooterSchema);
