const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ''
  },
  paragraph1: {
    type: String,
    default: ''
  },
  paragraph2: {
    type: String,
    default: ''
  },
  paragraph3: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('About', AboutSchema);
