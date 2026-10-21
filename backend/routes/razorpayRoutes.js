const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getKey } = require('../controllers/razorpayController');

router.get('/key', getKey);
router.post('/order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
