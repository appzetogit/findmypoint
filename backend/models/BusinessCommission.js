const mongoose = require('mongoose');

const BusinessCommissionSchema = new mongoose.Schema({
  businessId: {
    type: String,
    required: true,
    unique: true
  },
  commissionRate: {
    type: Number,
    required: true,
    default: 10
  }
}, { timestamps: true });

module.exports = mongoose.model('BusinessCommission', BusinessCommissionSchema);
