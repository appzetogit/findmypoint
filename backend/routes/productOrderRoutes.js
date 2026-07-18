const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  deleteOrder,
  clearOrders
} = require('../controllers/productOrderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:businessId', protect, createOrder); // Requires logged-in customer
router.get('/:businessId', protect, getOrders); // Protected fetch
router.delete('/:businessId/:orderId', protect, deleteOrder); // Protected delete single
router.delete('/:businessId', protect, clearOrders); // Protected clear all

module.exports = router;
