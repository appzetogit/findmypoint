const HeroSection = require('../models/HeroSection');

// @desc    Get all hero sections (Public)
// @route   GET /api/hero-sections
// @access  Public
const getHeroSections = async (req, res) => {
  try {
    const sections = await HeroSection.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update all hero sections (Admin)
// @route   POST /api/hero-sections/save
// @access  Private/Admin
const saveHeroSections = async (req, res) => {
  const { sections } = req.body;

  if (!sections || !Array.isArray(sections)) {
    return res.status(400).json({ success: false, message: 'Please provide a sections array.' });
  }

  // Validate limits: max 4 sections, max 3 items per section
  if (sections.length > 4) {
    return res.status(400).json({ success: false, message: 'Maximum 4 sections allowed.' });
  }

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    if (!sec.title) {
      return res.status(400).json({ success: false, message: `Section at index ${i} requires a title.` });
    }
    if (sec.items && sec.items.length > 3) {
      return res.status(400).json({ success: false, message: `Section "${sec.title}" exceeds the maximum limit of 3 subcategories.` });
    }
  }

  try {
    // Wipe existing sections safely using a filter to adhere to database rules
    await HeroSection.deleteMany({ order: { $gte: 0 } });

    // Create new document payload
    const sectionDocs = sections.map((sec, idx) => ({
      title: sec.title,
      order: idx,
      items: (sec.items || []).map(item => ({
        img: item.img || '',
        label: item.label,
        categoryName: item.categoryName,
        subcategoryName: item.subcategoryName
      }))
    }));

    if (sectionDocs.length > 0) {
      await HeroSection.insertMany(sectionDocs);
    }

    const updated = await HeroSection.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Hero sections saved successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHeroSections,
  saveHeroSections
};
