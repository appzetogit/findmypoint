const fs = require('fs');
const path = require('path');
const { compressImage } = require('./imageOptimizer');

const backendDir = path.resolve(__dirname, '../..'); // Resolves to the backend root directory

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

      // Dynamic path guarantee
      const targetDir = path.join(backendDir, 'public', 'uploads', folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      const filename = `${uniqueId}.${fileExtension}`;
      const filepath = path.join(targetDir, filename);

      fs.writeFile(filepath, finalBuffer, (err) => {
        if (err) return reject(err);
        const relativeUrl = `/uploads/${folder}/${filename}`;
        
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
