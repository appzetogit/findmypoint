const ServiceFormConfig = require('../models/ServiceFormConfig');
const ServiceBookingSubmission = require('../models/ServiceBookingSubmission');

// @desc    Get form configuration by businessId
// @route   GET /api/service-forms/:businessId
// @access  Public
const getFormConfig = async (req, res) => {
  try {
    const config = await ServiceFormConfig.findOne({ businessId: req.params.businessId });
    if (!config) {
      return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update form configuration by businessId
// @route   POST /api/service-forms/:businessId
// @access  Private (Client/Admin Auth)
const saveFormConfig = async (req, res) => {
  try {
    const { fields, bookNowEnabled, formTitle, formDescription } = req.body;
    const businessId = req.params.businessId;

    let config = await ServiceFormConfig.findOne({ businessId });

    if (config) {
      config.fields = fields;
      config.bookNowEnabled = bookNowEnabled;
      config.formTitle = formTitle;
      config.formDescription = formDescription;
      await config.save();
    } else {
      config = await ServiceFormConfig.create({
        businessId,
        fields,
        bookNowEnabled,
        formTitle,
        formDescription
      });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking submissions for a businessId
// @route   GET /api/service-forms/:businessId/submissions
// @access  Private (Client/Admin Auth)
const getSubmissions = async (req, res) => {
  try {
    const submissions = await ServiceBookingSubmission.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new booking submission
// @route   POST /api/service-forms/:businessId/submissions
// @access  Public
const createSubmission = async (req, res) => {
  try {
    const { businessName, data } = req.body;
    const businessId = req.params.businessId;

    if (!data) {
      return res.status(400).json({ success: false, message: 'Submission data is required' });
    }

    const formatDateTimeDMY = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const submission = await ServiceBookingSubmission.create({
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId,
      businessName: businessName || '',
      data,
      timestamp: formatDateTimeDMY(new Date())
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking submission
// @route   DELETE /api/service-forms/:businessId/submissions/:submissionId
// @access  Private (Client/Admin Auth)
const deleteSubmission = async (req, res) => {
  try {
    const result = await ServiceBookingSubmission.findOneAndDelete({
      id: req.params.submissionId,
      businessId: req.params.businessId
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.status(200).json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all booking submissions for a businessId
// @route   DELETE /api/service-forms/:businessId/submissions
// @access  Private (Client/Admin Auth)
const clearSubmissions = async (req, res) => {
  try {
    await ServiceBookingSubmission.deleteMany({ businessId: req.params.businessId });
    res.status(200).json({ success: true, message: 'All submissions cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stats for client dashboard (number of bookings and enquiries)
// @route   GET /api/service-forms/stats/overview
// @access  Private
const getClientStats = async (req, res) => {
  try {
    const Business = require('../models/Business');
    const Enquiry = require('../models/Enquiry');

    // Find businesses belonging to this user
    let query = {};
    if (req.user && !req.user.isAdmin) {
      // User is client owner
      if (req.user.isBusiness) {
        query = { id: req.user.businessId };
      } else {
        query = { owner: req.user._id };
      }
    }

    const businesses = await Business.find(query);
    const businessSlugs = businesses.map(b => b.id);

    // Sum up submissions and enquiries
    const submissionCount = await ServiceBookingSubmission.countDocuments({ businessId: { $in: businessSlugs } });
    const enquiriesCount = await Enquiry.countDocuments({ businessId: { $in: businessSlugs } });

    res.status(200).json({
      success: true,
      data: {
        bookings: submissionCount,
        enquiries: enquiriesCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFormConfig,
  saveFormConfig,
  getSubmissions,
  createSubmission,
  deleteSubmission,
  clearSubmissions,
  getClientStats
};
