const express = require('express');
const router = express.Router();
const { getAdvertiseConfig, saveAdvertiseConfig } = require('../controllers/advertiseConfigController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Get advertise page config (public)
router.get('/', getAdvertiseConfig);

// Save/update config (admin only)
router.post('/save', adminProtect, saveAdvertiseConfig);

module.exports = router;
