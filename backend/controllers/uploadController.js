const { uploadToLocal } = require('../shared/utils/cloudinaryService');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'uploads';
    const result = await uploadToLocal(req.file.buffer, { folder });

    res.status(200).json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadImage
};
