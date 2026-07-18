const express = require('express');
const router = express.Router();
const {
  getFormConfig,
  saveFormConfig,
  getSubmissions,
  createSubmission,
  deleteSubmission,
  clearSubmissions,
  getClientStats
} = require('../controllers/serviceFormController');
const { protect } = require('../middleware/authMiddleware');

// Get stats
router.get('/stats/overview', protect, getClientStats);

// Form configuration routes
router.get('/:businessId', getFormConfig);
router.post('/:businessId', protect, saveFormConfig);

// Submissions routes
router.get('/:businessId/submissions', protect, getSubmissions);
router.post('/:businessId/submissions', protect, createSubmission); // Requires logged-in customer
router.delete('/:businessId/submissions/:submissionId', protect, deleteSubmission);
router.delete('/:businessId/submissions', protect, clearSubmissions);

module.exports = router;
