const Banner = require('../models/Banner');

// @desc    Get all slides and cards (Public)
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const slides = await Banner.find({ type: 'slide' }).sort({ order: 1 });
    const cards = await Banner.find({ type: 'card' }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      slides,
      cards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update banners of a specific type (Admin)
// @route   POST /api/banners/save
// @access  Private/Admin
const saveBanners = async (req, res) => {
  const { type, banners } = req.body;

  if (!type || !['slide', 'card'].includes(type) || !Array.isArray(banners)) {
    return res.status(400).json({ success: false, message: 'Please provide type ("slide" or "card") and banners array.' });
  }

  try {
    // Delete existing banners of this type
    await Banner.deleteMany({ type });

    // Format new banners to insert
    const bannerDocs = banners.map((b, idx) => {
      const doc = {
        type,
        title: b.title,
        img: b.img || '',
        categoryName: b.categoryName || null,
        order: idx
      };

      if (type === 'slide') {
        doc.tag = b.tag || '';
        doc.description = b.description || '';
      } else {
        doc.subtitle = b.subtitle || '';
        doc.gradient = b.gradient || '';
        doc.themeColor = b.themeColor || '';
      }

      return doc;
    });

    await Banner.insertMany(bannerDocs);

    // Fetch and return the updated banners list
    const updated = await Banner.find({ type }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: `${type === 'slide' ? 'Slides' : 'Cards'} saved successfully.`,
      banners: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBanners,
  saveBanners
};
