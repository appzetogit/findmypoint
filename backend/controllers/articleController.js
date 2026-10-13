const mongoose = require('mongoose');
const Article = require('../models/Article');

const getArticleQuery = (param) => {
  const isNum = !isNaN(Number(param)) && param !== '' && !isNaN(parseInt(param, 10));
  const isObjectId = mongoose.isValidObjectId(param);
  return {
    $or: [
      ...(isNum ? [{ id: Number(param) }] : []),
      ...(isObjectId ? [{ _id: param }] : [])
    ]
  };
};

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single article by numeric ID or ObjectId
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = async (req, res) => {
  try {
    const query = getArticleQuery(req.params.id);
    if (!query.$or || query.$or.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    const article = await Article.findOne(query);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Admin only)
const createArticle = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can perform this action' });
    }

    // Auto increment id if not provided
    if (req.body.id === undefined) {
      const lastArticle = await Article.findOne().sort({ id: -1 });
      req.body.id = lastArticle ? lastArticle.id + 1 : 0;
    }

    const article = await Article.create(req.body);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private (Admin only)
const updateArticle = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can perform this action' });
    }

    const query = getArticleQuery(req.params.id);
    if (!query.$or || query.$or.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const article = await Article.findOneAndUpdate(
      query,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private (Admin only)
const deleteArticle = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can perform this action' });
    }

    const query = getArticleQuery(req.params.id);
    if (!query.$or || query.$or.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const result = await Article.findOneAndDelete(query);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.status(200).json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
