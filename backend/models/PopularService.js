const mongoose = require('mongoose');

const PopularServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    trim: true
  },
  img: {
    type: String // Base64 representation of image
  },
  tab: {
    type: String,
    required: true,
    enum: ['Trending', 'Near You']
  },
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('PopularService', PopularServiceSchema);
