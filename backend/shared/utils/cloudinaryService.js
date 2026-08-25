const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { compressImage } = require('./imageOptimizer');

const backendDir = path.resolve(__dirname, '../..'); // Resolves to the backend root directory

/**
 * Uploads an image or file.
 * In local development: Converts to WebP and uploads directly to the live server (/var/www/uploads).
 * In production: Converts to WebP and writes directly to UPLOADS_DIR (/var/www/uploads).
 */
function uploadToLocal(buffer, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const folder = options.folder || 'uploads';
      const isVideo = options.resource_type === 'video';

      let finalBuffer = buffer;
      let fileExtension = isVideo ? 'mp4' : (options.originalExtension ? options.originalExtension.split('+')[0].split('/')[0] : 'jpg');
      if (fileExtension === 'jpeg') fileExtension = 'jpg';

      if (!isVideo) {
        try {
          const compressed = await compressImage(buffer, { 
            folder, 
            originalExtension: options.originalExtension 
          });
          finalBuffer = compressed.buffer;
          fileExtension = compressed.extension;
        } catch (compErr) {
          console.warn('⚠️ Compression skipped:', compErr.message);
        }
      }

      const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      const filename = `${uniqueId}.${fileExtension}`;
      const relativeUrl = `/uploads/${folder}/${filename}`;

      const productionUrl = (process.env.PRODUCTION_URL || '').replace(/\/$/, '');
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadSecret = process.env.UPLOAD_SYNC_SECRET || 'fmp_uploads_secret_key_2026';

      // ─── LOCAL DEV MODE: Upload directly to live server ──────────────────────
      if (!isProduction && productionUrl) {
        try {
          console.log(`🌐 [Local Dev] Uploading ${filename} directly to server: ${productionUrl}/api/upload/direct`);
          const base64Data = finalBuffer.toString('base64');
          
          await axios.post(`${productionUrl}/api/upload/direct`, {
            folder,
            filename,
            base64Data
          }, {
            headers: {
              'x-upload-secret': uploadSecret,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });

          console.log(`✅ [Local Dev] Successfully uploaded ${relativeUrl} directly to server`);

          return resolve({
            secure_url: relativeUrl,
            url: relativeUrl,
            public_id: `${folder}/${filename.replace('.' + fileExtension, '')}`,
            bytes: finalBuffer.length,
            format: fileExtension
          });
        } catch (remoteErr) {
          console.error('❌ Failed to upload directly to live server:', remoteErr.response?.data || remoteErr.message);
          // If fallback local save is enabled, write locally as safety net
          if (process.env.LOCAL_DEV_FALLBACK_SAVE === 'true') {
            console.warn('⚠️ Falling back to local disk write due to remote upload error...');
          } else {
            return reject(new Error(`Failed to upload to remote server (${productionUrl}): ${remoteErr.response?.data?.message || remoteErr.message}`));
          }
        }
      }

      // ─── PRODUCTION SERVER MODE / FALLBACK LOCAL DISK ─────────────────────────
      const uploadsBaseDir = process.env.UPLOADS_DIR || 
        (process.platform === 'linux' && fs.existsSync('/var/www/uploads') ? '/var/www/uploads' : path.join(backendDir, 'public', 'uploads'));

      const targetDir = path.join(uploadsBaseDir, folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filepath = path.join(targetDir, filename);

      fs.writeFile(filepath, finalBuffer, (err) => {
        if (err) return reject(err);
        
        resolve({
          secure_url: relativeUrl,
          url: relativeUrl,
          public_id: `${folder}/${filename.replace('.' + fileExtension, '')}`,
          bytes: finalBuffer.length,
          format: fileExtension
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  uploadToLocal
};

