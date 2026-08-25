let sharp = null;
try {
  sharp = require('sharp');
} catch (err) {
  console.warn('⚠️ Sharp native binary not found or still installing:', err.message);
}

const FOLDER_PROFILES = {
  'profile-images': { maxWidth: 1200, maxHeight: 1200, quality: 85 },
  'menu-items': { maxWidth: 2560, maxHeight: 2560, quality: 85 },
  'banners': { maxWidth: 2560, maxHeight: 2560, quality: 85 },
  'categories': { maxWidth: 1200, maxHeight: 1200, quality: 85 },
  'tourist-places': { maxWidth: 2560, maxHeight: 2560, quality: 85 },
  'articles': { maxWidth: 2560, maxHeight: 2560, quality: 85 },
  'employees': { maxWidth: 1200, maxHeight: 1200, quality: 85 },
  default: { maxWidth: 2560, maxHeight: 2560, quality: 85 },
};

function detectMimeType(buffer) {
  if (!buffer || buffer.length < 4) return 'unknown';
  const b = buffer;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return 'image/webp';
  return 'unknown';
}

/**
 * Optimizes and converts any input image to WebP format using Sharp.
 * Preserves SVG and video formats.
 */
async function compressImage(inputBuffer, opts = {}) {
  const originalSize = inputBuffer.length;
  if (opts.isVideo) {
    return { buffer: inputBuffer, originalSize, compressedSize: originalSize, mimeType: 'video/mp4', extension: 'mp4' };
  }

  let clientExt = opts.originalExtension || 'jpg';
  if (clientExt.includes('svg')) {
    return { buffer: inputBuffer, originalSize, compressedSize: originalSize, mimeType: 'image/svg+xml', extension: 'svg' };
  }

  const folderKey = opts.folder || 'default';
  const { maxWidth, maxHeight, quality } = FOLDER_PROFILES[folderKey] || FOLDER_PROFILES.default;

  try {
    if (!sharp) {
      try { sharp = require('sharp'); } catch (e) {}
    }

    if (!sharp) {
      throw new Error('Sharp is not installed or available');
    }

    const pipeline = sharp(inputBuffer, { failOnError: false })
      .rotate() // Automatically orient based on EXIF
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: quality || 85,
        effort: 4,
        lossless: false,
        nearLossless: false
      });

    const outBuffer = await pipeline.toBuffer();

    return {
      buffer: outBuffer,
      originalSize,
      compressedSize: outBuffer.length,
      mimeType: 'image/webp',
      extension: 'webp'
    };
  } catch (sharpErr) {
    console.warn('⚠️ Sharp optimization error, falling back to raw buffer:', sharpErr.message);
    const mimeType = detectMimeType(inputBuffer);
    const finalMime = mimeType !== 'unknown' ? mimeType : `image/${clientExt}`;
    return {
      buffer: inputBuffer,
      originalSize,
      compressedSize: originalSize,
      mimeType: finalMime,
      extension: clientExt === 'jpeg' ? 'jpg' : clientExt
    };
  }
}

module.exports = {
  compressImage
};

