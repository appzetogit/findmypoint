const express = require('express');
const router = express.Router();
const {
  getPopularServices,
  getPopularServiceById,
  createPopularService,
  updatePopularService,
  deletePopularService
} = require('../controllers/popularServiceController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPopularServices);
router.get('/:id', getPopularServiceById);

// Protected routes (Admin only)
router.post('/', protect, createPopularService);
router.put('/:id', protect, updatePopularService);
router.delete('/:id', protect, deletePopularService);

module.exports = router;
