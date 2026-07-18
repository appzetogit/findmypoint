const TermsConditions = require('../models/TermsConditions');
const PrivacyPolicy = require('../models/PrivacyPolicy');

// @desc    Get Terms & Conditions
// @route   GET /api/policies/terms
// @access  Public
const getTermsConditions = async (req, res) => {
  try {
    let terms = await TermsConditions.findOne();
    if (!terms) {
      terms = {
        lastUpdated: '',
        sections: []
      };
    }
    res.status(200).json({ success: true, terms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Terms & Conditions
// @route   POST /api/policies/terms
// @access  Private/Admin
const saveTermsConditions = async (req, res) => {
  const { lastUpdated, sections } = req.body;
  try {
    let terms = await TermsConditions.findOne();
    if (terms) {
      terms.lastUpdated = lastUpdated !== undefined ? lastUpdated : terms.lastUpdated;
      terms.sections = sections !== undefined ? sections : terms.sections;
      await terms.save();
    } else {
      terms = await TermsConditions.create({ lastUpdated, sections });
    }
    res.status(200).json({ success: true, terms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Privacy Policy
// @route   GET /api/policies/privacy
// @access  Public
const getPrivacyPolicy = async (req, res) => {
  try {
    let privacy = await PrivacyPolicy.findOne();
    if (!privacy) {
      privacy = {
        lastUpdated: '',
        sections: []
      };
    }
    res.status(200).json({ success: true, privacy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Privacy Policy
// @route   POST /api/policies/privacy
// @access  Private/Admin
const savePrivacyPolicy = async (req, res) => {
  const { lastUpdated, sections } = req.body;
  try {
    let privacy = await PrivacyPolicy.findOne();
    if (privacy) {
      privacy.lastUpdated = lastUpdated !== undefined ? lastUpdated : privacy.lastUpdated;
      privacy.sections = sections !== undefined ? sections : privacy.sections;
      await privacy.save();
    } else {
      privacy = await PrivacyPolicy.create({ lastUpdated, sections });
    }
    res.status(200).json({ success: true, privacy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTermsConditions,
  saveTermsConditions,
  getPrivacyPolicy,
  savePrivacyPolicy
};
