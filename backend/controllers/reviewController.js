const Review = require('../models/Review');
const Business = require('../models/Business');
const Booking = require('../models/Booking');

// @desc    Add a review to a business
// @route   POST /api/reviews OR POST /api/businesses/:id/reviews
// @access  Public
const addReview = async (req, res) => {
  const { userName, rating, reviewText, userEmail, bookingId } = req.body;
  const businessId = req.params.id || req.body.businessId;

  if (!businessId || !userName || !rating || !reviewText) {
    return res.status(400).json({ success: false, message: 'Please provide businessId, name, rating, and review text' });
  }

  try {
    const business = await Business.findOne({ id: businessId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // 1. Create a dedicated Review document in database
    const review = await Review.create({
      bookingId: bookingId || '',
      businessId,
      userId: req.user ? req.user._id : null,
      userName: userName.trim(),
      userEmail: userEmail || '',
      rating: Number(rating),
      reviewText: reviewText.trim()
    });

    // 2. Add review to the embedded reviews array in Business for backward compatibility
    const initial = userName.charAt(0).toUpperCase();
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-fuchsia-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600'
    ];
    const userColor = colors[Math.floor(Math.random() * colors.length)];

    const embeddedReview = {
      _id: review._id,
      userName: userName.trim(),
      userInitial: initial,
      userColor,
      rating: Number(rating),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      reviewText: reviewText.trim(),
      userEmail: userEmail || ''
    };

    business.reviews.push(embeddedReview);

    // Recalculate average rating and count on business
    const totalReviews = business.reviews.length;
    const totalRatingSum = business.reviews.reduce((sum, item) => sum + item.rating, 0);
    
    business.reviewCount = totalReviews;
    business.rating = Number((totalRatingSum / totalReviews).toFixed(1));

    await business.save();

    // 3. Mark booking as reviewed if bookingId is provided
    if (bookingId) {
      try {
        await Booking.findOneAndUpdate({ id: bookingId }, { isReviewed: true });
      } catch (err) {
        console.error('Failed to update booking isReviewed status:', err);
      }
    }

    res.status(201).json({ 
      success: true, 
      rating: business.rating, 
      reviewCount: business.reviewCount, 
      data: review 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a business
// @route   GET /api/reviews/business/:businessId
// @access  Public
const getBusinessReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id OR DELETE /api/businesses/:id/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  const reviewId = req.params.reviewId || req.params.id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const business = await Business.findOne({ id: review.businessId });
    if (business) {
      // Remove from embedded business reviews array
      business.reviews = business.reviews.filter(rev => rev._id.toString() !== review._id.toString());
      
      const totalReviews = business.reviews.length;
      if (totalReviews > 0) {
        const totalRatingSum = business.reviews.reduce((sum, item) => sum + item.rating, 0);
        business.reviewCount = totalReviews;
        business.rating = Number((totalRatingSum / totalReviews).toFixed(1));
      } else {
        business.reviewCount = 0;
        business.rating = 0;
      }
      await business.save();
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addReview, getBusinessReviews, deleteReview };
