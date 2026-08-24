const express = require('express');
const router = express.Router();
const {
  getBusinesses,
  getPublicBusinessByPath,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  toggleBookingDisable,
  submitEnquiry,
  loginBusiness,
  changeBusinessPassword,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  clearEnquiries,
  getNearbyBusinesses,
  geocodeBusiness
} = require('../controllers/businessController');
const { addReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBusinesses);
router.get('/nearby', getNearbyBusinesses);
router.post('/login', loginBusiness);
router.get('/public/:city/:locality/:slug', getPublicBusinessByPath);
router.get('/:id', getBusinessById);
router.post('/:id/reviews', addReview);
router.post('/:id/enquire', submitEnquiry);

// Protected routes
router.put('/change-password', protect, changeBusinessPassword);
router.post('/', protect, createBusiness);
router.put('/:id', protect, updateBusiness);
router.delete('/:id', protect, deleteBusiness);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);
router.post('/:id/booking-disable', protect, toggleBookingDisable);
router.post('/:id/geocode', protect, geocodeBusiness);

// Enquiry routes for client dashboard
router.get('/:id/enquiries', protect, getEnquiries);
router.put('/:id/enquiries/:enquiryId', protect, updateEnquiryStatus);
router.delete('/:id/enquiries/:enquiryId', protect, deleteEnquiry);
router.delete('/:id/enquiries', protect, clearEnquiries);

module.exports = router;
