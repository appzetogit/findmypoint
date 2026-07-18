const express = require('express');
const router = express.Router();
const { getHeroSections, saveHeroSections } = require('../controllers/heroSectionController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

router.get('/', getHeroSections);
router.post('/save', adminProtect, saveHeroSections);

module.exports = router;
