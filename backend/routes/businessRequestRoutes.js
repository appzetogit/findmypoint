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
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Listing fee endpoints
router.get('/fee', getFee);
router.post('/fee', adminProtect, saveFee);

// Business request endpoints
router.get('/', adminProtect, getRequests);
router.post('/', optionalProtect, createRequest);
router.post('/verify-payment', optionalProtect, verifyPayment);
router.post('/:id/payment-order', optionalProtect, getPaymentOrder);
router.delete('/:id', adminProtect, deleteRequest);

module.exports = router;
