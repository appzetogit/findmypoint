const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  landlineStd: { type: String },
  landlineNum: { type: String },
  tag: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  title: { type: String },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String },
  dobDD: { type: String },
  dobMM: { type: String },
  dobYYYY: { type: String },
  maritalStatus: { type: String },
  occupation: { type: String },
  mobile1: { type: String, required: true, unique: true }, // Main mobile number
  mobile2: { type: String }, // WhatsApp number or alternate
  email: { type: String },
  avatar: { type: String },
  addresses: [AddressSchema],
  selectedFavorites: [{ type: String }], // Favorite categories or business IDs
  isAdmin: { type: Boolean, default: false },
  isClient: { type: Boolean, default: false } // Business owner / client
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
