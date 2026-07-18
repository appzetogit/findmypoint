const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  deleteUser,
  updateUser
} = require('../../controllers/admin/adminController');
const { adminProtect } = require('../../middleware/adminAuthMiddleware');

// Public routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// Protected routes
router.get('/profile', adminProtect, getAdminProfile);
router.put('/profile', adminProtect, updateAdminProfile);

// User Management routes
router.get('/users', adminProtect, getAllUsers);
router.put('/users/:id', adminProtect, updateUser);
router.delete('/users/:id', adminProtect, deleteUser);

module.exports = router;
