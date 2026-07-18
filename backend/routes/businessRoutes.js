const express = require('express');
const router = express.Router();
const {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  addBusinessReview,
  deleteBusinessReview,
  toggleBookingDisable,
  submitEnquiry,
  loginBusiness,
  changeBusinessPassword,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  clearEnquiries
} = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBusinesses);
router.post('/login', loginBusiness);
router.get('/:id', getBusinessById);
router.post('/:id/reviews', addBusinessReview);
router.post('/:id/enquire', submitEnquiry);

// Protected routes
router.put('/change-password', protect, changeBusinessPassword);
router.post('/', protect, createBusiness);
router.put('/:id', protect, updateBusiness);
router.delete('/:id', protect, deleteBusiness);
router.delete('/:id/reviews/:reviewId', protect, deleteBusinessReview);
router.post('/:id/booking-disable', protect, toggleBookingDisable);

// Enquiry routes for client dashboard
router.get('/:id/enquiries', protect, getEnquiries);
router.put('/:id/enquiries/:enquiryId', protect, updateEnquiryStatus);
router.delete('/:id/enquiries/:enquiryId', protect, deleteEnquiry);
router.delete('/:id/enquiries', protect, clearEnquiries);

module.exports = router;
