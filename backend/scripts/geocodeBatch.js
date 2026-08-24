/**
 * geocodeBatch.js
 * One-time or maintenance script to geocode all businesses in MongoDB that don't have lat/lng yet.
 * Run with: node scripts/geocodeBatch.js
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Business = require('../models/Business');
const { geocodeAddress, buildGeoPoint } = require('../services/geocodingService');

async function runBatch() {
  await connectDB();
  console.log('Connected to MongoDB. Starting batch geocoding...');

  const businesses = await Business.find({
    $or: [
      { latitude: null },
      { longitude: null },
      { latitude: { $exists: false } },
      { location_geo: { $exists: false } }
    ]
  });

  console.log(`Found ${businesses.length} businesses needing geocoding.`);

  let successCount = 0;
  let failCount = 0;

  for (const biz of businesses) {
    const addressParts = [
      biz.address,
      biz.location,
      biz.cityTown,
      biz.district,
      biz.state,
      'India'
    ].filter(Boolean);

    if (addressParts.length === 0) {
      console.log(`[SKIP] Business "${biz.name}" (${biz.id}) has no address.`);
      failCount++;
      continue;
    }

    const query = addressParts.join(', ');
    try {
      console.log(`Geocoding "${biz.name}": ${query}`);
      const res = await geocodeAddress(query);
      if (res && res.lat && res.lng) {
        biz.latitude = res.lat;
        biz.longitude = res.lng;
        biz.placeId = res.placeId || '';
        biz.location_geo = buildGeoPoint(res.lat, res.lng);
        await biz.save();
        console.log(`  -> SUCCESS: ${res.lat}, ${res.lng} (${res.formattedAddress})`);
        successCount++;
      } else {
        console.log(`  -> NO RESULTS for "${biz.name}"`);
        failCount++;
      }
    } catch (err) {
      console.error(`  -> ERROR for "${biz.name}":`, err.message);
      failCount++;
    }

    // Rate limiting delay (150ms between requests)
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nBatch Geocoding Finished!`);
  console.log(`Successfully Geocoded: ${successCount}`);
  console.log(`Failed / Skipped: ${failCount}`);

  await mongoose.connection.close();
  process.exit(0);
}

runBatch().catch(err => {
  console.error('Fatal error in batch geocoding:', err);
  process.exit(1);
});
