const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Business = require('../models/Business');
const TouristPlace = require('../models/TouristPlace');
const Article = require('../models/Article');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const HelpTicket = require('../models/HelpTicket');
const Category = require('../models/Category');

const seedUsers = [];

const seedBusinesses = [];

const seedTouristPlaces = [];

const seedArticles = [];

const seedBookings = [];

const seedTransactions = [];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/findmypoint';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Starting database seeding...');

    console.log('Database wiping disabled. Proceeding with safe upsert seeding...');

    // Seed Users safely (only if they don't exist by email)
    let seededUsersCount = 0;
    for (const u of seedUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
        seededUsersCount++;
      }
    }
    console.log(`Seeded ${seededUsersCount} new Users.`);

    // Find all users to map owners or bookings
    const allUsers = await User.find({});
    const priya = allUsers.find(u => u.firstName === "Priya");
    const rahul = allUsers.find(u => u.firstName === "Rahul");
    const raj = allUsers.find(u => u.firstName === "Raj");

    // Seed Businesses safely (only if they don't exist by ID)
    const mappedBusinesses = seedBusinesses.map(biz => {
      if (biz.id === "royal-banquet-hall" && raj) {
        return { ...biz, owner: raj._id };
      }
      if (biz.id === "sharma-ac-service" && priya) {
        return { ...biz, owner: priya._id };
      }
      return biz;
    });
    let seededBusinessesCount = 0;
    for (const biz of mappedBusinesses) {
      const existing = await Business.findOne({ id: biz.id });
      if (!existing) {
        await Business.create(biz);
        seededBusinessesCount++;
      }
    }
    console.log(`Seeded ${seededBusinessesCount} new Businesses.`);

    // Seed Bookings safely (only if they don't exist by ID)
    const mappedBookings = seedBookings.map(b => {
      return { ...b, userId: rahul ? rahul._id : undefined };
    });
    let seededBookingsCount = 0;
    for (const b of mappedBookings) {
      const existing = await Booking.findOne({ id: b.id });
      if (!existing) {
        await Booking.create(b);
        seededBookingsCount++;
      }
    }
    console.log(`Seeded ${seededBookingsCount} new Bookings.`);

    // Seed Transactions safely (only if they don't exist by ID)
    const mappedTxns = seedTransactions.map(t => {
      return { ...t, userId: rahul ? rahul._id : undefined };
    });
    let seededTxnsCount = 0;
    for (const t of mappedTxns) {
      const existing = await Transaction.findOne({ id: t.id });
      if (!existing) {
        await Transaction.create(t);
        seededTxnsCount++;
      }
    }
    console.log(`Seeded ${seededTxnsCount} new Transactions.`);

    // Seed Tourist Places safely (only if they don't exist by name)
    let seededTouristPlacesCount = 0;
    for (const place of seedTouristPlaces) {
      const existing = await TouristPlace.findOne({ name: place.name });
      if (!existing) {
        await TouristPlace.create(place);
        seededTouristPlacesCount++;
      }
    }
    console.log(`Seeded ${seededTouristPlacesCount} new Tourist Places.`);

    // Seed Articles safely (only if they don't exist by ID)
    let seededArticlesCount = 0;
    for (const art of seedArticles) {
      const existing = await Article.findOne({ id: art.id });
      if (!existing) {
        await Article.create(art);
        seededArticlesCount++;
      }
    }
    console.log(`Seeded ${seededArticlesCount} new Articles.`);

    // Seed Categories safely (only if they don't exist by label)
    const seedCategories = [];
    let seededCategoriesCount = 0;
    for (const cat of seedCategories) {
      const existing = await Category.findOne({ label: cat.label });
      if (!existing) {
        await Category.create(cat);
        seededCategoriesCount++;
      }
    }
    console.log(`Seeded ${seededCategoriesCount} new Categories.`);

    console.log('Database seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDB();
