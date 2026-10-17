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
  isClient: { type: Boolean, default: false }, // Business owner / client
  fcmToken: { type: String, default: null }, // Primary / latest active FCM token
  webFcmToken: { type: String, default: null }, // Dedicated Web browser FCM token
  apkFcmToken: { type: String, default: null }, // Dedicated Android APK FCM token
  fcmTokens: [{
    token: { type: String, required: true },
    device: { type: String, default: 'web' }, // 'web', 'apk', 'desktop-web', 'mobile-web', 'android-apk'
    platform: { type: String, default: 'web' }, // 'web', 'android', 'ios'
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
