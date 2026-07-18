const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const ProductOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // custom transaction ID (e.g. txn-178394...)
  businessId: { type: String, required: true }, // reference slug of the business
  businessName: { type: String },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, default: '' },
  orderItems: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  timestamp: { type: String, required: true } // Date formatted string
}, { timestamps: true });

module.exports = mongoose.model('ProductOrder', ProductOrderSchema);
