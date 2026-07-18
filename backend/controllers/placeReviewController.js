const TouristPlaceReview = require('../models/TouristPlaceReview');
const TouristPlace = require('../models/TouristPlace');

// @desc    Get all reviews for a place
// @route   GET /api/place-reviews/:placeName
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await TouristPlaceReview.find({ placeName: req.params.placeName })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a review for a place
// @route   POST /api/place-reviews/:placeName
// @access  Public
const addReview = async (req, res) => {
  try {
    const { userName, userInitial, userColor, rating, reviewText } = req.body;

    if (!userName || !reviewText) {
      return res.status(400).json({ success: false, message: 'Name and review text are required.' });
    }

    const review = await TouristPlaceReview.create({
      placeName: req.params.placeName,
      userName,
      userInitial: userInitial || userName.charAt(0).toUpperCase(),
      userColor: userColor || 'from-blue-500 to-indigo-600',
      rating: rating || 5,
      reviewText,
    });

    // Recalculate real avg rating + count and sync back to TouristPlace
    const stats = await TouristPlaceReview.aggregate([
      { $match: { placeName: req.params.placeName } },
      {
        $group: {
          _id: '$placeName',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const { avgRating, count } = stats[0];
      await TouristPlace.findOneAndUpdate(
        { name: req.params.placeName },
        {
          rating: Math.round(avgRating * 10) / 10, // round to 1 decimal
          reviewsCount: count,
        }
      );
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getReviews, addReview };
