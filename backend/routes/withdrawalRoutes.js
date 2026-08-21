const express = require('express');
const router = express.Router();
const {
  getWithdrawals,
  getWithdrawalsByBusiness,
  createWithdrawal,
  updateWithdrawalStatus
} = require('../controllers/withdrawalController');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Client and Admin accessible routes
router.get('/', protect, getWithdrawals);
router.get('/business/:businessId', protect, getWithdrawalsByBusiness);
router.post('/', protect, createWithdrawal);

// Admin-only approval route
router.put('/:id/status', adminProtect, updateWithdrawalStatus);

module.exports = router;
