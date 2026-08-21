/**
 * Migration Script: Populate SEO Slugs and Canonical URLs for all existing businesses
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { slugify, generateBusinessSlugs } = require('../utils/slugify');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Business = require('../models/Business');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const businesses = await Business.find({});
    console.log(`Found ${businesses.length} businesses to inspect.`);

    let updatedCount = 0;
    const usedSlugs = new Set();

    for (const biz of businesses) {
      let { citySlug, localitySlug, slug, canonicalUrl } = generateBusinessSlugs(biz);

      // Resolve duplicate collision
      let uniqueSlug = slug;
      let counter = 1;
      let fullKey = `${citySlug}/${localitySlug}/${uniqueSlug}`;

      while (usedSlugs.has(fullKey)) {
        uniqueSlug = `${slug}-${counter}`;
        fullKey = `${citySlug}/${localitySlug}/${uniqueSlug}`;
        counter++;
      }
      usedSlugs.add(fullKey);
      slug = uniqueSlug;
      canonicalUrl = `/${citySlug}/${localitySlug}/${slug}`;

      biz.citySlug = citySlug;
      biz.localitySlug = localitySlug;
      biz.slug = slug;
      biz.canonicalUrl = canonicalUrl;
      if (!biz.status) biz.status = 'published';
      if (biz.isIndexable === undefined) biz.isIndexable = true;
      if (!biz.businessType) biz.businessType = 'LocalBusiness';

      await biz.save();
      updatedCount++;
      console.log(`Updated [${biz.name}] -> Canonical: ${canonicalUrl}`);
    }

    console.log(`Successfully migrated ${updatedCount} businesses.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
