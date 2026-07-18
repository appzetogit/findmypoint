const express = require('express');
const router = express.Router();
const { getBanners, saveBanners } = require('../controllers/bannerController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Public route to get all slides and cards
router.get('/', getBanners);

// Protected admin route to save slides or cards
router.post('/save', adminProtect, saveBanners);

module.exports = router;
