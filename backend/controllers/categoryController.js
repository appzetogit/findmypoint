const Category = require('../models/Category');
const Article = require('../models/Article');
const Business = require('../models/Business');
const TouristPlace = require('../models/TouristPlace');

// @desc    Get all categories with subcategories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { label, img } = req.body;

  if (!label || !img) {
    return res.status(400).json({ success: false, message: 'Please provide category label and image.' });
  }

  try {
    const categoryExists = await Category.findOne({ label });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({
      label,
      img,
      subcategories: []
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a category (label or image)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  const { label, img } = req.body;

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const oldLabel = category.label;

    if (label) category.label = label;
    if (img) category.img = img;

    const updatedCategory = await category.save();

    // If category label was updated, propagate the change to related collections
    if (label && label !== oldLabel) {
      await Article.updateMany({ category: oldLabel }, { $set: { category: label } });
      await Business.updateMany({ category: oldLabel }, { $set: { category: label, categoryLine: label } });
      await TouristPlace.updateMany(
        { 'categories.name': oldLabel },
        { $set: { 'categories.$.name': label } }
      );
    }

    res.status(200).json({
      success: true,
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const categoryLabel = category.label;

    await Category.deleteOne({ _id: req.params.id });

    // Unlink associated articles, businesses, and tourist places
    await Article.updateMany({ category: categoryLabel }, { $set: { category: 'Uncategorized' } });
    await Business.updateMany({ category: categoryLabel }, { $set: { category: 'Uncategorized', categoryLine: 'Uncategorized' } });
    await TouristPlace.updateMany(
      {},
      { $pull: { categories: { name: categoryLabel } } }
    );

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully and associated data unlinked.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a subcategory to a category
// @route   POST /api/categories/:categoryId/subcategories
// @access  Private/Admin
const addSubcategory = async (req, res) => {
  const { label, icon } = req.body;
  const { categoryId } = req.params;

  if (!label) {
    return res.status(400).json({ success: false, message: 'Subcategory label is required.' });
  }

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if subcategory already exists under this category
    const subcatExists = category.subcategories.some(
      (sub) => sub.label.toLowerCase() === label.toLowerCase()
    );

    if (subcatExists) {
      return res.status(400).json({ success: false, message: 'Subcategory already exists under this category.' });
    }

    category.subcategories.push({ label, icon: icon || '' });
    await category.save();

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a subcategory under a category
// @route   PUT /api/categories/:categoryId/subcategories/:subLabel
// @access  Private/Admin
const updateSubcategory = async (req, res) => {
  const { label, icon } = req.body;
  const { categoryId, subLabel } = req.params;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const subcategory = category.subcategories.find(
      (sub) => sub.label === subLabel
    );

    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found under this category.' });
    }

    let labelChanged = false;
    // If changing name, check for duplicates
    if (label && label.toLowerCase() !== subLabel.toLowerCase()) {
      const duplicateExists = category.subcategories.some(
        (sub) => sub.label.toLowerCase() === label.toLowerCase()
      );
      if (duplicateExists) {
        return res.status(400).json({ success: false, message: 'Subcategory with new name already exists.' });
      }
      subcategory.label = label;
      labelChanged = true;
    }

    if (icon !== undefined) {
      subcategory.icon = icon;
    }

    await category.save();

    // If subcategory label was updated, propagate to Business.subCategoryLine
    if (labelChanged && label) {
      await Business.updateMany({ subCategoryLine: subLabel }, { $set: { subCategoryLine: label } });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a subcategory from a category
// @route   DELETE /api/categories/:categoryId/subcategories/:subLabel
// @access  Private/Admin
const deleteSubcategory = async (req, res) => {
  const { categoryId, subLabel } = req.params;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const initialLength = category.subcategories.length;
    category.subcategories = category.subcategories.filter(
      (sub) => sub.label !== subLabel
    );

    if (category.subcategories.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Subcategory not found under this category.' });
    }

    await category.save();

    // Clear subCategoryLine for all businesses that were using the deleted subcategory
    await Business.updateMany({ subCategoryLine: subLabel }, { $set: { subCategoryLine: '' } });

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete multiple categories
// @route   POST /api/categories/delete-bulk
// @access  Private/Admin
const deleteCategoriesBulk = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide an array of category IDs to delete.' });
  }

  try {
    const categoriesToDelete = await Category.find({ _id: { $in: ids } });
    const labels = categoriesToDelete.map(c => c.label);

    const result = await Category.deleteMany({ _id: { $in: ids } });

    // Unlink associated articles, businesses, and tourist places
    await Article.updateMany({ category: { $in: labels } }, { $set: { category: 'Uncategorized' } });
    await Business.updateMany({ category: { $in: labels } }, { $set: { category: 'Uncategorized', categoryLine: 'Uncategorized' } });
    await TouristPlace.updateMany(
      {},
      { $pull: { categories: { name: { $in: labels } } } }
    );

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} categories deleted successfully and associated data unlinked.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategoriesBulk,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory
};
