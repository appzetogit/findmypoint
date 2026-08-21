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
    const seedCategories = [
      {
        label: "Spa point",
        img: "/uploads/categories/1783756227699_kus2x9cf4.jpg",
        subcategories: [
          { label: "Ayurvedic Spa", icon: "/uploads/categories/1783756248847_s4qrail0u.jpg" },
          { label: "Beauty Spa", icon: "/uploads/categories/1783756267177_nnlow8p5k.jpg" },
          { label: "Massage Center", icon: "/uploads/categories/1783756465234_wyjx9tqyv.jpg" }
        ]
      },
      {
        label: "Tour Point",
        img: "/uploads/categories/1783771893603_0zcwnkv64.jpg",
        subcategories: [
          "India", "Nepal", "Sri Lanka", "Bangladesh", "Indonesia", "Dubai", "UK", "USA", "Australia", "Japan", "China", "Russia", "Maldives", "Bhutan", "Myanmar", "Thailand", "France", "Germany", "Saudi Arabia", "South Africa", "Switzerland"
        ].map(s => ({ label: s, icon: '' }))
      },
      {
        label: "Find My Point",
        img: "/uploads/categories/findmypoint.png",
        subcategories: [
          "Accountant", "Automobile", "Beauty Parlour", "Construction", "Cosmetic Center", "Courier Center", "Electrical Center", "Electronics Center", "Event Management", "Fashion Center", "Fast food Center", "Restaurant Center", "Movies Center", "Fitness Centre", "Flower Centre", "Fruit & Sweet Center", "Furniture Centre", "Garments Centre", "Gift Center", "Goods & Accessories", "Grocery Center", "Hardware Center", "Hostel", "Jewellery Center", "Legal Services", "Marble & Tiles Center", "Petrol Pump Centre", "Printing Press", "Pump & Motor", "Real Estate", "Recharge Point", "Repair Center", "Salon & Spa", "Shoes Point", "Shopping Mall", "Spectacles Centre", "Sports Goods", "Studio Centre", "Tailor Center", "Tea & Tiffin Centre", "Textile Centre", "Vehicle Showroom", "Water Supplier", "Wholesale Point", "Wine Point"
        ].map(s => ({ label: s, icon: '' }))
      },
      {
        label: "Job Point",
        img: "/uploads/categories/jobpoint.png",
        subcategories: [
          "Accounting", "Bank", "BPO", "ETC", "FRESHER", "Government", "Health Care", "HR", "IIM", "IIT", "Industrial", "IT", "International", "Judicial", "Manufacturing Unit", "Marketing", "Official", "Petrol Pump", "Sales", "Security", "Teacher", "Worker", "Home Care", "Delivery"
        ].map(s => ({ label: s, icon: '' }))
      },
      {
        label: "Service Point",
        img: "/uploads/categories/servicepoint.png",
        subcategories: [
          "AC Repair", "Builder", "Care Taker", "Carpenter", "CCTV Repair & Installation", "Contractor", "Cook", "Driver", "Dry Cleaners", "Electrical & Electronic", "Home Teacher", "House Cleaner", "Home interior & Decoration", "Labour", "Maid", "Marble & Tiles Repair", "Microwave Oven Repair", "Mobile & Computer Repair", "Paint Man & Repair", "Plaster & Ceiling Repair", "Plumber Repair", "Refrigerator Repair", "TV Repair", "Washing Machine Repair", "Water tank Repair"
        ].map(s => ({ label: s, icon: '' }))
      },
      {
        label: "Education Point",
        img: "/uploads/categories/educationpoint.png",
        subcategories: [
          "Coaching Center", "College", "Computer Center", "Diploma College", "Engineering College", "ITI", "Institute Center", "Medical College", "Nursing & Pathology Institute", "Play School", "School", "University"
        ].map(s => ({ label: s, icon: '' }))
      },
      {
        label: "Health Care Point",
        img: "/uploads/categories/healthcarepoint.png",
        subcategories: [
          "Animal Care", "CHC & PHC", "Clinic", "Doctors", "Hospital", "Medicine Store", "Nursing Home", "Pathology", "Pharmacy"
        ].map(s => ({ label: s, icon: '' }))
      },
      {
        label: "Hotel Point",
        img: "/uploads/categories/hotelpoint.png",
        subcategories: []
      },
      {
        label: "Doctor Point",
        img: "/uploads/categories/doctorpoint.svg",
        subcategories: []
      },
      {
        label: "Garments Point",
        img: "/uploads/categories/garmentspoint.svg",
        subcategories: []
      },
      {
        label: "Astrologer Point",
        img: "/uploads/categories/astrologerpoint.svg",
        subcategories: []
      },
      {
        label: "Product Point",
        img: "/uploads/categories/productpoint.svg",
        subcategories: []
      },
      {
        label: "Food Point",
        img: "/uploads/categories/foodpoint.svg",
        subcategories: []
      }
    ];
    let seededCategoriesCount = 0;
    let updatedCategoriesCount = 0;
    for (const cat of seedCategories) {
      const existing = await Category.findOne({ label: cat.label });
      if (!existing) {
        await Category.create(cat);
        seededCategoriesCount++;
      } else if ((!existing.subcategories || existing.subcategories.length === 0) && cat.subcategories && cat.subcategories.length > 0) {
        existing.subcategories = cat.subcategories;
        await existing.save();
        updatedCategoriesCount++;
      }
    }
    console.log(`Seeded ${seededCategoriesCount} new Categories. Updated ${updatedCategoriesCount} existing Categories with subcategories.`);

    console.log('Database seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDB();
