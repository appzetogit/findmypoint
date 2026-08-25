const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { uploadImage, directUpload } = require('../controllers/uploadController');

const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // max 100 uploads per 5 minutes per IP
  message: { success: false, message: 'Upload limit exceeded. Please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
      'video/mp4',
      'video/webm'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, GIF, SVG, and MP4 files are allowed.'));
    }
  }
});

// Upload route with error handler
router.post('/', uploadLimiter, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds the 25MB limit.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadImage);

// Direct / Sync upload route (used by local environment and scripts to save directly to server uploads folder)
router.post('/direct', (req, res, next) => {
  // If incoming payload is JSON (e.g. from sync script), pass directly
  if (req.is('json') || (req.headers['content-type'] && req.headers['content-type'].includes('application/json'))) {
    return directUpload(req, res, next);
  }
  // Otherwise parse as multipart form data
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    directUpload(req, res, next);
  });
});

module.exports = router;

