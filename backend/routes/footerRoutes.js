const express = require('express');
const router = express.Router();
const { getFooter, saveFooter } = require('../controllers/footerController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Get footer settings (public)
router.get('/', getFooter);

// Save/update footer settings (admin only)
router.post('/save', adminProtect, saveFooter);

module.exports = router;
