const express = require('express');
const router = express.Router();
const { getAbout, saveAbout } = require('../controllers/aboutController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Get about settings (public)
router.get('/', getAbout);

// Save/update about settings (admin only)
router.post('/save', adminProtect, saveAbout);

module.exports = router;
