const Business = require('../models/Business');
const Enquiry = require('../models/Enquiry');

// @desc    Get all businesses with optional search and filters
// @route   GET /api/businesses
// @access  Public
const getBusinesses = async (req, res) => {
  try {
    const { search, category, subcategory, location } = req.query;
    let query = {};

    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (subcategory) {
      query.subCategoryLine = { $regex: new RegExp(subcategory, 'i') };
    }

    if (location) {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } },
        { location: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const businesses = await Business.find(query);
    res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single business by slug ID
// @route   GET /api/businesses/:id
// @access  Public
const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new business listing
// @route   POST /api/businesses
// @access  Private
const createBusiness = async (req, res) => {
  try {
    // Generate slug ID if not provided
    if (!req.body.id) {
      req.body.id = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Check if ID is unique
    const existing = await Business.findOne({ id: req.body.id });
    if (existing) {
      req.body.id = `${req.body.id}-${Date.now().toString().slice(-4)}`;
    }

    const business = new Business({
      ...req.body,
      clientPassword: req.body.password || undefined, // Store plain text for admin reference
      owner: req.user ? req.user._id : undefined
    });

    const createdBusiness = await business.save();
    res.status(201).json({ success: true, data: createdBusiness });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a business listing
// @route   PUT /api/businesses/:id
// @access  Private
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    // Check permission: Admin always allowed. Business owner allowed for their own business. Regular users blocked.
    const isAdmin = req.user.isAdmin === true;
    const isOwnBusiness = req.user.isBusiness === true && req.user.businessId === req.params.id;
    const isOwner = business.owner && business.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwnBusiness && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this business' });
    }

    if (req.body.password) {
      req.body.clientPassword = req.body.password; // Store plain text before hashing
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedBusiness = await Business.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedBusiness });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a business listing
// @route   DELETE /api/businesses/:id
// @access  Private
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    // Check permission (Admin or Owner)
    if (req.user.isAdmin === false && business.owner && business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this business' });
    }

    await Business.deleteOne({ id: req.params.id });
    res.status(200).json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a review to a business
// @route   POST /api/businesses/:id/reviews
// @access  Public (or Private depending on policy, we will extract user information if logged in)
const addBusinessReview = async (req, res) => {
  const { userName, rating, reviewText, userEmail, bookingId } = req.body;

  if (!userName || !rating || !reviewText) {
    return res.status(400).json({ success: false, message: 'Please provide name, rating, and review text' });
  }

  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Extract colors/initials for aesthetic consistency
    const initial = userName.charAt(0).toUpperCase();
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-fuchsia-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600'
    ];
    const userColor = colors[Math.floor(Math.random() * colors.length)];

    const newReview = {
      userName,
      userInitial: initial,
      userColor,
      rating: Number(rating),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      reviewText,
      userEmail: userEmail || ''
    };

    business.reviews.push(newReview);
    
    // Recalculate average rating and count
    const totalReviews = business.reviews.length;
    const totalRatingSum = business.reviews.reduce((sum, item) => sum + item.rating, 0);
    
    business.reviewCount = totalReviews;
    business.rating = Number((totalRatingSum / totalReviews).toFixed(1));

    await business.save();

    if (bookingId) {
      try {
        const BookingModel = require('../models/Booking');
        await BookingModel.findOneAndUpdate({ id: bookingId }, { isReviewed: true });
      } catch (err) {
        console.error('Failed to update booking isReviewed status:', err);
      }
    }

    res.status(201).json({ success: true, rating: business.rating, reviewCount: business.reviewCount, data: business.reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a business review
// @route   DELETE /api/businesses/:id/reviews/:reviewId
// @access  Private (Admin only)
const deleteBusinessReview = async (req, res) => {
  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Remove review
    business.reviews = business.reviews.filter(rev => rev._id.toString() !== req.params.reviewId);

    // Recalculate
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
    res.status(200).json({ success: true, rating: business.rating, reviewCount: business.reviewCount, data: business.reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle booking disabled status for a business
// @route   POST /api/businesses/:id/booking-disable
// @access  Private
const toggleBookingDisable = async (req, res) => {
  const { isDisabled } = req.body;

  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Check permission
    if (req.user.isAdmin === false && business.owner && business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    business.isBookingDisabled = isDisabled;
    await business.save();

    res.status(200).json({ success: true, isBookingDisabled: business.isBookingDisabled });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit business enquiry
// @route   POST /api/businesses/:id/enquire
// @access  Public
const submitEnquiry = async (req, res) => {
  const { name, email, phone, message, subject } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please provide name, phone, and message' });
  }

  try {
    const business = await Business.findOne({ id: req.params.id });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const enquiry = await Enquiry.create({
      businessId: business.id,
      businessName: business.name,
      name,
      email: email || '',
      phone,
      message,
      subject: subject || `Enquiry for ${business.name}`,
      userId: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate business and get token
// @route   POST /api/businesses/login
// @access  Public
const loginBusiness = async (req, res) => {
  const { email, phone, id, password } = req.body;

  if ((!email && !phone && !id) || !password) {
    return res.status(400).json({ success: false, message: 'Please provide credentials and password' });
  }

  try {
    let query = {};
    if (id) query.id = id;
    else if (email) query.email = email;
    else if (phone) query.phone = phone;

    const business = await Business.findOne(query);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    if (!business.password) {
      return res.status(400).json({ success: false, message: 'No password set for this business' });
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: business._id, isBusiness: true, businessId: business.id },
      process.env.JWT_SECRET || 'jwtsecret',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      data: {
        id: business.id,
        name: business.name,
        email: business.email,
        phone: business.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change business account password
// @route   PUT /api/businesses/change-password
// @access  Private (Business token required)
const changeBusinessPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
  }

  try {
    // req.business is set by authMiddleware when a business JWT is used
    const businessId = req.business?._id || req.user?._id;
    if (!businessId) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found.' });
    }

    if (!business.password) {
      return res.status(400).json({ success: false, message: 'No password set for this business account.' });
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, business.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Hash new password and save via direct update to bypass pre-save hook (which would double-hash)
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await Business.findByIdAndUpdate(businessId, {
      $set: {
        password: hashedNewPassword,
        clientPassword: newPassword // Store plain text for admin reference
      }
    });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all enquiries for a businessId
// @route   GET /api/businesses/:id/enquiries
// @access  Private (Client/Admin Auth)
const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ businessId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle enquiry read status / update status
// @route   PUT /api/businesses/:id/enquiries/:enquiryId
// @access  Private (Client/Admin Auth)
const updateEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    // Toggle read status if provided or toggle by default
    if (req.body.read !== undefined) {
      enquiry.read = req.body.read;
    } else {
      enquiry.read = !enquiry.read;
    }
    if (req.body.status) {
      enquiry.status = req.body.status;
    }
    await enquiry.save();
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete single enquiry
// @route   DELETE /api/businesses/:id/enquiries/:enquiryId
// @access  Private (Client/Admin Auth)
const deleteEnquiry = async (req, res) => {
  try {
    const result = await Enquiry.findByIdAndDelete(req.params.enquiryId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all enquiries for a businessId
// @route   DELETE /api/businesses/:id/enquiries
// @access  Private (Client/Admin Auth)
const clearEnquiries = async (req, res) => {
  try {
    await Enquiry.deleteMany({ businessId: req.params.id });
    res.status(200).json({ success: true, message: 'All enquiries cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
