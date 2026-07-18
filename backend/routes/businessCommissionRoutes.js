const express = require('express');
const router = express.Router();
const { getCommissions, saveCommission } = require('../controllers/businessCommissionController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Get all commission rates (public)
router.get('/', getCommissions);

// Save or update commission rate (admin only)
router.post('/', adminProtect, saveCommission);

module.exports = router;
