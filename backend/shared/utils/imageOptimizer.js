const FOLDER_PROFILES = {
  'profile-images': { maxWidth: 400, maxHeight: 400, quality: 80 },
  'menu-items': { maxWidth: 800, maxHeight: 800, quality: 75 },
  'banners': { maxWidth: 1200, maxHeight: 600, quality: 78 },
  default: { maxWidth: 800, maxHeight: 800, quality: 75 },
};

let JimpInstance = null;

async function getJimp() {
  if (!JimpInstance) {
    try {
      const jimpModule = await import('jimp');
      JimpInstance = jimpModule.Jimp || jimpModule.default || jimpModule;
    } catch (err) {
      console.warn('⚠️ Dynamic import of jimp failed, trying require:', err.message);
      // Fallback if require is possible/needed
      JimpInstance = require('jimp');
    }
  }
  return JimpInstance;
}

function detectMimeType(buffer) {
  if (!buffer || buffer.length < 4) return 'unknown';
  const b = buffer;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return 'image/webp';
  return 'unknown';
}

async function compressImage(inputBuffer, opts = {}) {
  const originalSize = inputBuffer.length;
  if (opts.isVideo) {
    return { buffer: inputBuffer, originalSize, compressedSize: originalSize, mimeType: 'video/mp4', extension: 'mp4' };
  }

  // Parse clean extension from originalExtension option
  let clientExt = opts.originalExtension || 'jpg';
  if (clientExt.includes('svg')) {
    clientExt = 'svg';
  } else if (clientExt === 'jpeg') {
    clientExt = 'jpg';
  } else {
    clientExt = clientExt.split('+')[0].split('/')[0];
  }

  const mimeType = detectMimeType(inputBuffer);
  
  const folderKey = opts.folder || 'default';
  const { maxWidth, maxHeight, quality } = FOLDER_PROFILES[folderKey] || FOLDER_PROFILES.default;

  try {
    const Jimp = await getJimp();
    const image = await Jimp.read(inputBuffer);
    const origW = image.bitmap.width;
    const origH = image.bitmap.height;

    if (origW > maxWidth || origH > maxHeight) {
      image.scaleToFit({ w: maxWidth, h: maxHeight });
    }

    if (mimeType === 'image/gif') {
      const outBuffer = await image.getBuffer('image/gif');
      return { buffer: outBuffer, originalSize, compressedSize: outBuffer.length, mimeType: 'image/gif', extension: 'gif' };
    }

    if (mimeType === 'image/webp') {
      try {
        const outBuffer = await image.getBuffer('image/webp');
        return { buffer: outBuffer, originalSize, compressedSize: outBuffer.length, mimeType: 'image/webp', extension: 'webp' };
      } catch (webpErr) {
        return { buffer: inputBuffer, originalSize, compressedSize: originalSize, mimeType: 'image/webp', extension: 'webp' };
      }
    }

    let outputMime = 'image/jpeg';
    let outputExt = 'jpg';

    // Preserve PNG transparency
    const hasAlpha = mimeType === 'image/png' && image.bitmap.data.some((v, i) => i % 4 === 3 && v < 255);
    if (hasAlpha) {
      outputMime = 'image/png';
      outputExt = 'png';
    }

    let outBuffer = outputMime === 'image/jpeg' 
      ? await image.getBuffer('image/jpeg', { quality }) 
      : await image.getBuffer('image/png');

    return {
      buffer: outBuffer,
      originalSize,
      compressedSize: outBuffer.length,
      mimeType: outputMime,
      extension: outputExt,
    };
  } catch (err) {
    console.error('❌ Jimp Error: Falling back to raw buffer:', err.message);
    const finalMime = mimeType !== 'unknown' ? mimeType : `image/${clientExt}`;
    return { 
      buffer: inputBuffer, 
      originalSize, 
      compressedSize: originalSize, 
      mimeType: finalMime, 
      extension: clientExt 
    };
  }
}

module.exports = {
  compressImage
};
