const About = require('../models/About');

// @desc    Get about settings
// @route   GET /api/about
// @access  Public
const getAbout = async (req, res) => {
  try {
    const about = await About.findOne();
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update about settings
// @route   POST /api/about/save
// @access  Private/Admin
const saveAbout = async (req, res) => {
  const { title, paragraph1, paragraph2, paragraph3 } = req.body;
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About({
        title,
        paragraph1,
        paragraph2,
        paragraph3
      });
    } else {
      about.title = title !== undefined ? title : about.title;
      about.paragraph1 = paragraph1 !== undefined ? paragraph1 : about.paragraph1;
      about.paragraph2 = paragraph2 !== undefined ? paragraph2 : about.paragraph2;
      about.paragraph3 = paragraph3 !== undefined ? paragraph3 : about.paragraph3;
    }

    await about.save();
    res.status(200).json({ success: true, message: 'About settings saved successfully.', about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAbout,
  saveAbout
};
