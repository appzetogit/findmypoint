require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { compressImage } = require('../shared/utils/imageOptimizer');

const uploadsDir = path.join(__dirname, '../public/uploads');
const productionUrl = (process.env.PRODUCTION_URL || 'https://findmypoint.app').replace(/\/$/, '');
const uploadSecret = process.env.UPLOAD_SYNC_SECRET || 'fmp_uploads_secret_key_2026';

const isDryRun = process.argv.includes('--dry-run');
const convertToWebp = process.argv.includes('--convert-webp');

async function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

async function uploadFileToServer(fullFilePath) {
  const relativeFromUploads = path.relative(uploadsDir, fullFilePath);
  const parts = relativeFromUploads.split(path.sep);
  
  const folder = parts.length > 1 ? parts[0] : 'default';
  let filename = path.basename(fullFilePath);
  let fileBuffer = fs.readFileSync(fullFilePath);

  if (convertToWebp && !filename.endsWith('.webp') && !filename.endsWith('.svg') && !filename.endsWith('.mp4')) {
    try {
      const ext = path.extname(filename).replace('.', '');
      const compressed = await compressImage(fileBuffer, { folder, originalExtension: ext });
      fileBuffer = compressed.buffer;
      filename = filename.replace(/\.[^/.]+$/, "") + '.webp';
    } catch (e) {
      console.warn(`⚠️ Failed to convert ${filename} to webp: ${e.message}`);
    }
  }

  if (isDryRun) {
    console.log(`[DRY RUN] Would upload: Folder="${folder}", File="${filename}", Size=${(fileBuffer.length / 1024).toFixed(2)} KB`);
    return { success: true, folder, filename, dryRun: true };
  }

  const base64Data = fileBuffer.toString('base64');
  
  const response = await axios.post(`${productionUrl}/api/upload/direct`, {
    folder,
    filename,
    base64Data
  }, {
    headers: {
      'x-upload-secret': uploadSecret,
      'Content-Type': 'application/json'
    },
    timeout: 45000
  });

  return { success: true, folder, filename, data: response.data };
}

async function run() {
  console.log('====================================================');
  console.log('🚀 FindmyPoint Uploads Server Migration Tool');
  console.log('====================================================');
  console.log(`📁 Local Uploads Directory: ${uploadsDir}`);
  console.log(`🌐 Target Server: ${productionUrl}/api/upload/direct`);
  console.log(`🔑 Secret Key Configured: ${uploadSecret ? 'YES (' + uploadSecret.slice(0, 4) + '...)' : 'NO'}`);
  console.log(`⚙️  Mode: ${isDryRun ? 'DRY RUN (No files uploaded)' : 'LIVE SYNC'}`);
  console.log(`🔄 Auto WebP Conversion: ${convertToWebp ? 'ENABLED' : 'DISABLED (Preserving original names)'}`);
  console.log('----------------------------------------------------\n');

  if (!fs.existsSync(uploadsDir)) {
    console.error(`❌ Uploads directory not found: ${uploadsDir}`);
    process.exit(1);
  }

  const allFiles = await getAllFiles(uploadsDir);
  console.log(`📊 Found total ${allFiles.length} files across all subdirectories.\n`);

  if (allFiles.length === 0) {
    console.log('✨ No files to sync.');
    process.exit(0);
  }

  let successCount = 0;
  let failCount = 0;
  const folderStats = {};

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const progress = `[${i + 1}/${allFiles.length}]`;
    
    try {
      const result = await uploadFileToServer(file);
      folderStats[result.folder] = (folderStats[result.folder] || 0) + 1;
      successCount++;
      if (!isDryRun) {
        console.log(`✅ ${progress} Uploaded: ${result.folder}/${result.filename}`);
      }
      
      // Slight delay between uploads to prevent network congestion
      if (!isDryRun) {
        await new Promise(r => setTimeout(r, 100));
      }
    } catch (err) {
      failCount++;
      const relativeFromUploads = path.relative(uploadsDir, file);
      console.error(`❌ ${progress} Failed: ${relativeFromUploads} -> ${err.response?.data?.message || err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log('📈 SYNC SUMMARY');
  console.log('====================================================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed:     ${failCount}`);
  console.log('\n📂 Breakdown by Folder:');
  for (const [folder, count] of Object.entries(folderStats)) {
    console.log(`   - ${folder.padEnd(20)}: ${count} files`);
  }
  console.log('====================================================\n');
}

run().catch(err => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
