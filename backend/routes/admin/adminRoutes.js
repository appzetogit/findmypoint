const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
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

const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/login', adminLoginLimiter, loginAdmin);

// Admin registration — DISABLED in production to prevent unauthorized admin creation.
// Use `node scripts/seed-admin.js` to create admin accounts.
if (process.env.NODE_ENV !== 'production') {
  router.post('/register', registerAdmin);
} else {
  router.post('/register', (req, res) => {
    res.status(403).json({ success: false, message: 'Admin registration is disabled in production.' });
  });
}

// Protected routes
router.get('/profile', adminProtect, getAdminProfile);
router.put('/profile', adminProtect, updateAdminProfile);

// User Management routes
router.get('/users', adminProtect, getAllUsers);
router.put('/users/:id', adminProtect, updateUser);
router.delete('/users/:id', adminProtect, deleteUser);

module.exports = router;
