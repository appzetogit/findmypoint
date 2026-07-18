const { uploadToLocal } = require('../shared/utils/cloudinaryService');

async function resolveBase64Fields(obj, folderName) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Matches data:image/png;base64,... or data:image/jpeg;base64,...
    const matches = obj.match(/^data:image\/([a-zA-Z0-9+.#\-]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      try {
        const uploadResult = await uploadToLocal(buffer, { 
          folder: folderName,
          originalExtension: matches[1]
        });
        return uploadResult.secure_url;
      } catch (err) {
        console.error('❌ Failed to upload base64 image to local storage:', err.message);
        return obj;
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const resolvedArray = [];
    for (const item of obj) {
      resolvedArray.push(await resolveBase64Fields(item, folderName));
    }
    return resolvedArray;
  }

  if (typeof obj === 'object') {
    if (Buffer.isBuffer(obj)) return obj;
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        let currentFolder = folderName;
        // Map specific keys to specific folder profiles
        if (key === 'avatar') {
          currentFolder = 'profile-images';
        } else if (key === 'banner' || key === 'coverImage' || key === 'mainImage') {
          currentFolder = 'banners';
        }
        newObj[key] = await resolveBase64Fields(obj[key], currentFolder);
      }
    }
    return newObj;
  }

  return obj;
}

const base64UploadMiddleware = async (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    let folder = 'default';
    const path = req.originalUrl || req.url;
    if (path.includes('/categories')) {
      folder = 'categories';
    } else if (path.includes('/businesses')) {
      folder = 'menu-items';
    } else if (path.includes('/tourist-places')) {
      folder = 'banners';
    } else if (path.includes('/articles')) {
      folder = 'banners';
    } else if (path.includes('/employees')) {
      folder = 'employees';
    } else if (path.includes('/banners')) {
      folder = 'banners';
    }

    try {
      req.body = await resolveBase64Fields(req.body, folder);
    } catch (err) {
      console.error('❌ base64UploadMiddleware Error:', err);
    }
  }
  next();
};

module.exports = base64UploadMiddleware;
