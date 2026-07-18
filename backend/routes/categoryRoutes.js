const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategoriesBulk,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory
} = require('../controllers/categoryController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Public routes
router.get('/', getCategories);

// Protected Admin routes
router.post('/', adminProtect, createCategory);
router.post('/delete-bulk', adminProtect, deleteCategoriesBulk);
router.put('/:id', adminProtect, updateCategory);
router.delete('/:id', adminProtect, deleteCategory);

router.post('/:categoryId/subcategories', adminProtect, addSubcategory);
router.put('/:categoryId/subcategories/:subLabel', adminProtect, updateSubcategory);
router.delete('/:categoryId/subcategories/:subLabel', adminProtect, deleteSubcategory);

module.exports = router;
