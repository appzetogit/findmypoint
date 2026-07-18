const mongoose = require('mongoose');

const ListingFeeSchema = new mongoose.Schema({
  amount: { type: Number, required: true, default: 500 }
}, { timestamps: true });

module.exports = mongoose.model('ListingFee', ListingFeeSchema);
