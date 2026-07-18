const express = require('express');
const router = express.Router();
const {
  getFee,
  saveFee,
  getRequests,
  createRequest,
  verifyPayment,
  getPaymentOrder,
  deleteRequest
} = require('../controllers/businessRequestController');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Listing fee endpoints
router.get('/fee', getFee);
router.post('/fee', adminProtect, saveFee);

// Business request endpoints
router.get('/', adminProtect, getRequests);
router.post('/', protect, createRequest);
router.post('/verify-payment', protect, verifyPayment);
router.post('/:id/payment-order', protect, getPaymentOrder);
router.delete('/:id', adminProtect, deleteRequest);

module.exports = router;
