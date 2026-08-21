const express = require('express');
const router = express.Router();
const {
  getBookings,
  createBooking,
  updateBookingStatus,
  collectPayment,
  refundBooking,
  deleteBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All booking routes require authentication

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/collect-payment', collectPayment);
router.put('/:id/refund', refundBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
