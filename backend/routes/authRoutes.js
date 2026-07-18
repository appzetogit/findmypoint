const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerUser,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateUserFavorites
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/address', protect, addUserAddress);
router.put('/address/:addressId', protect, updateUserAddress);
router.delete('/address/:addressId', protect, deleteUserAddress);
router.put('/favorites', protect, updateUserFavorites);

module.exports = router;
