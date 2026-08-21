const TouristPlace = require('../models/TouristPlace');

// Escape special regex characters to prevent ReDoS attacks (SEC-014)
const escapeRegex = (str) => (str ? String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '');

// @desc    Get all tourist places
// @route   GET /api/tourist-places
// @access  Public
const getTouristPlaces = async (req, res) => {
  try {
    const places = await TouristPlace.find({});
    res.status(200).json({ success: true, count: places.length, data: places });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single tourist place by name
// @route   GET /api/tourist-places/:name
// @access  Public
const getTouristPlaceByName = async (req, res) => {
  try {
    const safeName = escapeRegex(req.params.name);
    // Search case insensitively by name
    const place = await TouristPlace.findOne({ name: { $regex: new RegExp(`^${safeName}$`, 'i') } });

    if (!place) {
      return res.status(404).json({ success: false, message: 'Tourist destination not found' });
    }

    res.status(200).json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new tourist place destination
// @route   POST /api/tourist-places
// @access  Private (Admin only)
const createTouristPlace = async (req, res) => {
  try {
    const exists = await TouristPlace.findOne({ name: req.body.name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Tourist place name already exists' });
    }

    const place = await TouristPlace.create(req.body);
    res.status(201).json({ success: true, data: place });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update tourist place destination
// @route   PUT /api/tourist-places/:name
// @access  Private (Admin only)
const updateTouristPlace = async (req, res) => {
  try {
    const safeName = escapeRegex(req.params.name);
    const place = await TouristPlace.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${safeName}$`, 'i') } },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!place) {
      return res.status(404).json({ success: false, message: 'Tourist place not found' });
    }

    res.status(200).json({ success: true, data: place });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete tourist place destination
// @route   DELETE /api/tourist-places/:name
// @access  Private (Admin only)
const deleteTouristPlace = async (req, res) => {
  try {
    const safeName = escapeRegex(req.params.name);
    const result = await TouristPlace.findOneAndDelete({ name: { $regex: new RegExp(`^${safeName}$`, 'i') } });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Tourist place not found' });
    }

    res.status(200).json({ success: true, message: 'Tourist place deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTouristPlaces,
  getTouristPlaceByName,
  createTouristPlace,
  updateTouristPlace,
  deleteTouristPlace
};
