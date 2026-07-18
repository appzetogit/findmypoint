const AdvertiseRequest = require('../models/AdvertiseRequest');

// @desc    Create a new advertise request
// @route   POST /api/advertise-requests
// @access  Public
const createRequest = async (req, res) => {
  try {
    const { businessName, category, city, email, mobile } = req.body;
    if (!businessName || !category || !email || !mobile) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const newRequest = await AdvertiseRequest.create({
      businessName,
      category,
      city: city || 'Mumbai',
      email,
      mobile
    });
    res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all advertise requests
// @route   GET /api/advertise-requests
// @access  Private/Admin
const getRequests = async (req, res) => {
  try {
    const requests = await AdvertiseRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update advertise request status
// @route   PUT /api/advertise-requests/:id
// @access  Private/Admin
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Contacted', 'Approved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const request = await AdvertiseRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete advertise request
// @route   DELETE /api/advertise-requests/:id
// @access  Private/Admin
const deleteRequest = async (req, res) => {
  try {
    const request = await AdvertiseRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequestStatus,
  deleteRequest
};
