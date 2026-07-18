const AdvertiseConfig = require('../models/AdvertiseConfig');

// @desc    Get advertise page config
// @route   GET /api/advertise-config
// @access  Public
const getAdvertiseConfig = async (req, res) => {
  try {
    let config = await AdvertiseConfig.findOne();
    if (!config) {
      // Create one with default values if not exists
      config = await AdvertiseConfig.create({});
    }
    res.status(200).json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update advertise page config
// @route   POST /api/advertise-config/save
// @access  Private/Admin
const saveAdvertiseConfig = async (req, res) => {
  try {
    let config = await AdvertiseConfig.findOne();
    if (!config) {
      config = new AdvertiseConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }

    await config.save();
    res.status(200).json({ success: true, message: 'Advertise page configurations saved successfully.', config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdvertiseConfig,
  saveAdvertiseConfig
};
