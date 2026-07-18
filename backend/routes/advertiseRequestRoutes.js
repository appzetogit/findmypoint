const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/advertiseRequestController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Public route to submit advertise request
router.post('/', createRequest);

// Protected Admin routes
router.get('/', adminProtect, getRequests);
router.put('/:id', adminProtect, updateRequestStatus);
router.delete('/:id', adminProtect, deleteRequest);

module.exports = router;
