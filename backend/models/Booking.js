const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // BK001 etc.
  businessId: { type: String }, // Reference to business slug
  businessName: { type: String, required: true },
  category: { type: String },
  service: { type: String, default: '' }, // Service / order title (may be empty for product orders)
  date: { type: String, default: '' }, // YYYY-MM-DD
  time: { type: String, default: '' }, // e.g. "07:00 PM"
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed'], default: 'pending' },
  amount: { type: Number, required: true },
  location: { type: String },

  // Customer contact details captured at checkout
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  customerAddress: { type: String, default: '' },

  // Line items for cart / product orders: [{ name, quantity, price }]
  items: { type: [mongoose.Schema.Types.Mixed], default: [] },

  // Full dynamic form payload. Any field the client adds to their booking
  // form in future is stored here automatically without a schema change.
  formData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Booking type keeps product orders and service bookings distinguishable
  bookingType: { type: String, enum: ['service', 'product', 'appointment', 'room'], default: 'service' },

  // Payment details from Razorpay
  paymentId: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  paymentStatus: { type: String, default: 'pending' },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
