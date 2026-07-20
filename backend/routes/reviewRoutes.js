const express = require('express');
const router = express.Router();
const { addReview, getBusinessReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes end-to-end
router.post('/', addReview);
router.get('/business/:businessId', getBusinessReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
