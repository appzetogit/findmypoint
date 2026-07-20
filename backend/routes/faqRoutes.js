const express = require('express');
const router = express.Router();
const { syncBusinessFAQs, getBusinessFAQs } = require('../controllers/faqController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes end-to-end
router.put('/business/:businessId', protect, syncBusinessFAQs);
router.get('/business/:businessId', getBusinessFAQs);

module.exports = router;
