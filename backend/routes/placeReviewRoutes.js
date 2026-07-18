const express = require('express');
const router = express.Router();
const { getReviews, addReview } = require('../controllers/placeReviewController');

// GET all reviews for a place (public)
router.get('/:placeName', getReviews);

// POST submit a new review (public)
router.post('/:placeName', addReview);

module.exports = router;
