const mongoose = require('mongoose');
const Business = require('../models/Business');
const Enquiry = require('../models/Enquiry');
const { slugify, generateBusinessSlugs } = require('../utils/slugify');

// Escape special regex characters to prevent ReDoS attacks (SEC-009)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper to sanitize business object for public responses
const sanitizePublicBusiness = (business) => {
  if (!business) return null;
  const obj = business.toObject ? business.toObject() : { ...business };
  delete obj.password;
  delete obj.clientPassword;
  delete obj.__v;
  return obj;
};

// @desc    Get all businesses with optional search and filters
// @route   GET /api/businesses
// @access  Public
const getBusinesses = async (req, res) => {
  try {
    const { search, category, subcategory, location, status, admin } = req.query;
    let query = {};

    // Default to published for public queries; allow admin override with ?status=
    if (status) {
      query.status = status;
    } else if (!admin) {
      // Public listings: only show published businesses
      query.status = 'published';
    }

    if (category) {
      query.category = { $regex: new RegExp(escapeRegex(category), 'i') };
    }

    if (subcategory) {
      query.subCategoryLine = { $regex: new RegExp(escapeRegex(subcategory), 'i') };
    }

    if (location) {
      query.location = { $regex: new RegExp(escapeRegex(location), 'i') };
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: new RegExp(safeSearch, 'i') } },
        { category: { $regex: new RegExp(safeSearch, 'i') } },
        { location: { $regex: new RegExp(safeSearch, 'i') } },
        { description: { $regex: new RegExp(safeSearch, 'i') } },
      ];
    }

    const businesses = await Business.find(query);
    const sanitized = businesses.map(sanitizePublicBusiness);
    res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public business by SEO path: /{city}/{locality}/{slug}
// @route   GET /api/businesses/public/:city/:locality/:slug
// @access  Public
const getPublicBusinessByPath = async (req, res) => {
  try {
    const citySlug = slugify(req.params.city);
    const localitySlug = slugify(req.params.locality);
    const slug = slugify(req.params.slug);

    // 1. Direct match on current slugs
    const business = await Business.findOne({
      citySlug,
      localitySlug,
      slug
    });

    if (business) {
      if (business.status === 'deleted') {
        return res.status(410).json({
          success: false,
          statusCode: 410,
          message: 'This business listing has been permanently deleted.'
        });
      }

      if (business.status === 'draft' || business.status === 'suspended') {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Business profile is not publicly available.'
        });
      }

      return res.status(200).json({
        success: true,
        data: sanitizePublicBusiness(business)
      });
    }

    // 2. Search in previousSlugs (for 301 redirection)
    const oldBusiness = await Business.findOne({
      'previousSlugs.citySlug': citySlug,
      'previousSlugs.localitySlug': localitySlug,
      'previousSlugs.slug': slug
    });

    if (oldBusiness && oldBusiness.canonicalUrl) {
      return res.status(200).json({
        success: true,
        redirect: true,
        statusCode: 301,
        canonicalUrl: oldBusiness.canonicalUrl,
        data: sanitizePublicBusiness(oldBusiness)
      });
    }

    // 3. Fallback: Search by business slug only
    const slugOnlyMatch = await Business.findOne({ slug, status: 'published' });
    if (slugOnlyMatch && slugOnlyMatch.canonicalUrl) {
      return res.status(200).json({
        success: true,
        redirect: true,
        statusCode: 301,
        canonicalUrl: slugOnlyMatch.canonicalUrl,
        data: sanitizePublicBusiness(slugOnlyMatch)
      });
    }

    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: 'Business listing not found.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single business by slug ID or _id
// @route   GET /api/businesses/:id
// @access  Public
const getBusinessById = async (req, res) => {
  try {
    const idParam = req.params.id;
    const isObjectId = mongoose.isValidObjectId(idParam);

    const business = await Business.findOne({
      $or: [
        { id: idParam },
        { slug: slugify(idParam) },
        ...(isObjectId ? [{ _id: idParam }] : [])
      ]
    });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    // Respect status — do not expose deleted or suspended businesses publicly (BUG-010)
    if (business.status === 'deleted') {
      return res.status(410).json({ success: false, message: 'This business listing has been permanently deleted.' });
    }
    if (business.status === 'suspended') {
      return res.status(404).json({ success: false, message: 'Business profile is currently unavailable.' });
    }

    res.status(200).json({ success: true, data: sanitizePublicBusiness(business) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new business listing
// @route   POST /api/businesses
// @access  Private
const createBusiness = async (req, res) => {
  try {
    const slugInfo = generateBusinessSlugs(req.body);
    let { citySlug, localitySlug, slug, canonicalUrl } = slugInfo;

    // Check duplicate slug collision in same city and locality
    let uniqueSlug = slug;
    let counter = 1;
    while (await Business.findOne({ citySlug, localitySlug, slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    slug = uniqueSlug;
    canonicalUrl = `/${citySlug}/${localitySlug}/${slug}`;

    if (!req.body.id) {
      req.body.id = slug;
    }

    const business = new Business({
      ...req.body,
      citySlug,
      localitySlug,
      slug,
      canonicalUrl,
      status: req.body.status || 'published',
      isIndexable: req.body.isIndexable !== undefined ? req.body.isIndexable : true,
      businessType: req.body.businessType || 'LocalBusiness',
      clientPassword: req.body.password || undefined,
      owner: req.user ? req.user._id : undefined
    });

    const createdBusiness = await business.save();
    res.status(201).json({ success: true, data: sanitizePublicBusiness(createdBusiness) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a business listing
// @route   PUT /api/businesses/:id
// @access  Private
const updateBusiness = async (req, res) => {
  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    const business = await Business.findOne({
      $or: [
        { id: req.params.id },
        { slug: slugify(req.params.id) },
        ...(isObjectId ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    // Check permission: Admin always allowed. Business owner allowed for their own business.
    const isAdmin = req.user.isAdmin === true;
    const isOwnBusiness = req.user.isBusiness === true && req.user.businessId === business.id;
    const isOwner = business.owner && business.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwnBusiness && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this business' });
    }

    // Check if location/name changed to update slug & canonicalUrl
    const updatedData = { ...req.body };
    const mergedData = {
      name: updatedData.name || business.name,
      location: updatedData.location || business.location,
      cityTown: updatedData.cityTown || business.cityTown,
      district: updatedData.district || business.district,
      state: updatedData.state || business.state,
      id: business.id
    };

    const newSlugs = generateBusinessSlugs(mergedData);
    let newCanonicalUrl = newSlugs.canonicalUrl;

    if (newCanonicalUrl !== business.canonicalUrl && business.canonicalUrl) {
      // Store current slug in previousSlugs
      if (!business.previousSlugs) business.previousSlugs = [];
      business.previousSlugs.push({
        citySlug: business.citySlug,
        localitySlug: business.localitySlug,
        slug: business.slug,
        fullPath: business.canonicalUrl,
        changedAt: new Date()
      });

      // Ensure new slug is unique
      let uniqueSlug = newSlugs.slug;
      let counter = 1;
      while (await Business.findOne({
        _id: { $ne: business._id },
        citySlug: newSlugs.citySlug,
        localitySlug: newSlugs.localitySlug,
        slug: uniqueSlug
      })) {
        uniqueSlug = `${newSlugs.slug}-${counter}`;
        counter++;
      }
      newSlugs.slug = uniqueSlug;
      newCanonicalUrl = `/${newSlugs.citySlug}/${newSlugs.localitySlug}/${newSlugs.slug}`;

      updatedData.citySlug = newSlugs.citySlug;
      updatedData.localitySlug = newSlugs.localitySlug;
      updatedData.slug = newSlugs.slug;
      updatedData.canonicalUrl = newCanonicalUrl;
      updatedData.previousSlugs = business.previousSlugs;
    }

    if (req.body.password) {
      updatedData.clientPassword = req.body.password;
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      business._id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: sanitizePublicBusiness(updatedBusiness) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a business listing
// @route   DELETE /api/businesses/:id
// @access  Private
const deleteBusiness = async (req, res) => {
  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    const business = await Business.findOne({
      $or: [
        { id: req.params.id },
        { slug: slugify(req.params.id) },
        ...(isObjectId ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    // Check permission (Admin or Owner)
    if (req.user.isAdmin === false && business.owner && business.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this business' });
    }

    await Business.findByIdAndDelete(business._id);
    res.status(200).json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const { addReview, deleteReview } = require('./reviewController');

// @desc    Add a review to a business (delegated to reviewController)
const addBusinessReview = addReview;

// @desc    Delete a business review (delegated to reviewController)
const deleteBusinessReview = deleteReview;


// @desc    Toggle booking disabled status for a business
// @route   POST /api/businesses/:id/booking-disable
// @access  Private
const toggleBookingDisable = async (req, res) => {
  const { isDisabled } = req.body;

  try {
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    const business = await Business.findOne({
      $or: [
        { id: req.params.id },
        { slug: slugify(req.params.id) },
        ...(isObjectId ? [{ _id: req.params.id }] : [])
      ]
    });

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
    const isObjectId = mongoose.isValidObjectId(req.params.id);
    const business = await Business.findOne({
      $or: [
        { id: req.params.id },
        { slug: slugify(req.params.id) },
        ...(isObjectId ? [{ _id: req.params.id }] : [])
      ]
    });

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
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT secret missing' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: business._id, isBusiness: true, businessId: business.id },
      secret,
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
    const businessId = req.params.id;
    const isAuthorizedAdmin = req.user && req.user.isAdmin;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && req.user.businessId === businessId;

    if (!isAuthorizedAdmin && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to view enquiries for this business' });
    }

    const enquiries = await Enquiry.find({ businessId }).sort({ createdAt: -1 });
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
    const businessId = req.params.id;
    const isAuthorizedAdmin = req.user && req.user.isAdmin;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && req.user.businessId === businessId;

    if (!isAuthorizedAdmin && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to update enquiries for this business' });
    }

    const enquiry = await Enquiry.findOne({ _id: req.params.enquiryId, businessId });
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
    const businessId = req.params.id;
    const isAuthorizedAdmin = req.user && req.user.isAdmin;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && req.user.businessId === businessId;

    if (!isAuthorizedAdmin && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete enquiries for this business' });
    }

    const result = await Enquiry.findOneAndDelete({ _id: req.params.enquiryId, businessId });
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
    const businessId = req.params.id;
    const isAuthorizedAdmin = req.user && req.user.isAdmin;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && req.user.businessId === businessId;

    if (!isAuthorizedAdmin && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to clear enquiries for this business' });
    }

    await Enquiry.deleteMany({ businessId });
    res.status(200).json({ success: true, message: 'All enquiries cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBusinesses,
  getPublicBusinessByPath,
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
