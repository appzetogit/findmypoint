const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerUser,
  directLogin,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateUserFavorites,
  updateFcmToken,
  removeFcmToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// OTP-specific rate limiters
const otpSendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 5 minutes before retrying.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many attempts. Please wait 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (with rate limiting)
router.post('/direct-login', authLimiter, directLogin);
router.post('/refresh-token', refreshToken);
router.post('/send-otp', otpSendLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/register', authLimiter, registerUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/address', protect, addUserAddress);
router.put('/address/:addressId', protect, updateUserAddress);
router.delete('/address/:addressId', protect, deleteUserAddress);
router.put('/favorites', protect, updateUserFavorites);

// FCM Token management
router.post('/fcm-token', protect, updateFcmToken);
router.delete('/fcm-token', protect, removeFcmToken);

module.exports = router;
