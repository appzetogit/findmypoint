const Footer = require('../models/Footer');

// @desc    Get footer data
// @route   GET /api/footer
// @access  Public
const getFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    res.status(200).json({ success: true, footer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update footer data
// @route   POST /api/footer/save
// @access  Private/Admin
const saveFooter = async (req, res) => {
  const { tagline, socials, playstoreUrl, appstoreUrl, copyright } = req.body;
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = new Footer({
        tagline,
        socials,
        playstoreUrl,
        appstoreUrl,
        copyright
      });
    } else {
      footer.tagline = tagline !== undefined ? tagline : footer.tagline;
      footer.socials = socials !== undefined ? socials : footer.socials;
      footer.playstoreUrl = playstoreUrl !== undefined ? playstoreUrl : footer.playstoreUrl;
      footer.appstoreUrl = appstoreUrl !== undefined ? appstoreUrl : footer.appstoreUrl;
      footer.copyright = copyright !== undefined ? copyright : footer.copyright;
    }

    await footer.save();
    res.status(200).json({ success: true, message: 'Footer settings saved successfully.', footer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFooter,
  saveFooter
};
