const mongoose = require('mongoose');

const AdvertiseConfigSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    default: ''
  },
  heroSubtitle: {
    type: String,
    default: ''
  },
  formTitle: {
    type: String,
    default: ''
  },
  formSubtitle: {
    type: String,
    default: ''
  },
  benefit1: {
    type: String,
    default: ''
  },
  benefit2: {
    type: String,
    default: ''
  },
  benefit3: {
    type: String,
    default: ''
  },
  benefit4: {
    type: String,
    default: ''
  },
  section2Title: {
    type: String,
    default: ''
  },
  section2Subtitle: {
    type: String,
    default: ''
  },
  stat1Value: {
    type: String,
    default: ''
  },
  stat1Label: {
    type: String,
    default: ''
  },
  stat2Value: {
    type: String,
    default: ''
  },
  stat2Label: {
    type: String,
    default: ''
  },
  stat3Value: {
    type: String,
    default: ''
  },
  stat3Label: {
    type: String,
    default: ''
  },
  ctaTitle: {
    type: String,
    default: ''
  },
  ctaDesc: {
    type: String,
    default: ''
  },
  ctaBtnText: {
    type: String,
    default: ''
  },
  badge1Value: {
    type: String,
    default: ''
  },
  badge1Label: {
    type: String,
    default: ''
  },
  badge2Value: {
    type: String,
    default: ''
  },
  badge2Label: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('AdvertiseConfig', AdvertiseConfigSchema);
