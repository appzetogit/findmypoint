const express = require('express');
const router = express.Router();
const {
  getTermsConditions,
  saveTermsConditions,
  getPrivacyPolicy,
  savePrivacyPolicy
} = require('../controllers/policyController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

router.get('/terms', getTermsConditions);
router.post('/terms', adminProtect, saveTermsConditions);

router.get('/privacy', getPrivacyPolicy);
router.post('/privacy', adminProtect, savePrivacyPolicy);

module.exports = router;
