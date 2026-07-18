const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Protected routes (Admin only checks are enforced in the controller)
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

module.exports = router;
