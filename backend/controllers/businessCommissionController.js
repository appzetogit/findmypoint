const BusinessCommission = require('../models/BusinessCommission');

// @desc    Get all business commission configurations
// @route   GET /api/business-commissions
// @access  Public
const getCommissions = async (req, res) => {
  try {
    const commissions = await BusinessCommission.find();
    res.status(200).json({ success: true, count: commissions.length, data: commissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save or Update a business commission configuration
// @route   POST /api/business-commissions
// @access  Private/Admin
const saveCommission = async (req, res) => {
  const { businessId, commissionRate } = req.body;

  if (!businessId || commissionRate === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide businessId and commissionRate' });
  }

  try {
    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({ success: false, message: 'Commission rate must be a number between 0 and 100' });
    }

    // Safe upsert operation
    const commission = await BusinessCommission.findOneAndUpdate(
      { businessId },
      { commissionRate: rate },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Commission rate updated successfully',
      data: commission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCommissions,
  saveCommission
};
