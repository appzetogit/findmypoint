const PopularService = require('../models/PopularService');

// @desc    Get all popular services
// @route   GET /api/popular-services
// @access  Public
const getPopularServices = async (req, res) => {
  try {
    const services = await PopularService.find({})
      .populate('businesses')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new popular service
// @route   POST /api/popular-services
// @access  Private (Admin only)
const createPopularService = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can perform this action' });
    }

    const { title, desc, img, tab, businesses } = req.body;
    if (!title || !tab) {
      return res.status(400).json({ success: false, message: 'Title and Tab are required' });
    }

    const service = await PopularService.create({
      title,
      desc,
      img,
      tab,
      businesses: businesses || []
    });

    const populated = await PopularService.findById(service._id).populate('businesses');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update popular service
// @route   PUT /api/popular-services/:id
// @access  Private (Admin only)
const updatePopularService = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can perform this action' });
    }

    const service = await PopularService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('businesses');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Popular service not found' });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete popular service
// @route   DELETE /api/popular-services/:id
// @access  Private (Admin only)
const deletePopularService = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can perform this action' });
    }

    const service = await PopularService.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Popular service not found' });
    }

    res.status(200).json({ success: true, message: 'Popular service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single popular service by ID
// @route   GET /api/popular-services/:id
// @access  Public
const getPopularServiceById = async (req, res) => {
  try {
    const service = await PopularService.findById(req.params.id).populate('businesses');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Popular service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPopularServices,
  getPopularServiceById,
  createPopularService,
  updatePopularService,
  deletePopularService
};
