const mongoose = require('mongoose');

const AdvertiseRequestSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  city: {
    type: String,
    default: 'Mumbai'
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Approved'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('AdvertiseRequest', AdvertiseRequestSchema);
