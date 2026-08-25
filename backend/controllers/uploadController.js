const fs = require('fs');
const path = require('path');
const { uploadToLocal } = require('../shared/utils/cloudinaryService');

const backendDir = path.resolve(__dirname, '..');

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

/**
 * Direct upload endpoint used by local environment and migration scripts
 * to write files directly to server uploads folder (/var/www/uploads).
 */
const directUpload = async (req, res) => {
  try {
    const expectedSecret = process.env.UPLOAD_SYNC_SECRET || 'fmp_uploads_secret_key_2026';
    const providedSecret = req.headers['x-upload-secret'] || req.body.secret;

    if (!providedSecret || providedSecret !== expectedSecret) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Invalid or missing upload secret' });
    }

    let folder = req.body.folder || 'default';
    // Sanitize folder to prevent directory traversal
    folder = folder.replace(/[^a-zA-Z0-9_\-]/g, '');

    let filename = req.body.filename;
    let fileBuffer = null;

    if (req.file) {
      fileBuffer = req.file.buffer;
      if (!filename) filename = req.file.originalname;
    } else if (req.body.base64Data) {
      fileBuffer = Buffer.from(req.body.base64Data, 'base64');
    }

    if (!fileBuffer || !filename) {
      return res.status(400).json({ success: false, message: 'Missing file data or filename' });
    }

    // Sanitize filename to prevent directory traversal
    filename = path.basename(filename).replace(/[^a-zA-Z0-9_.\-]/g, '');

    const uploadsBaseDir = process.env.UPLOADS_DIR || 
      (process.platform === 'linux' && fs.existsSync('/var/www/uploads') ? '/var/www/uploads' : path.join(backendDir, 'public', 'uploads'));

    const targetDir = path.join(uploadsBaseDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, filename);
    fs.writeFileSync(targetPath, fileBuffer);

    const relativeUrl = `/uploads/${folder}/${filename}`;

    return res.status(200).json({
      success: true,
      message: 'File saved directly to server',
      data: {
        secure_url: relativeUrl,
        url: relativeUrl,
        folder,
        filename,
        bytes: fileBuffer.length
      }
    });
  } catch (error) {
    console.error('❌ directUpload error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadImage,
  directUpload
};

