const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Category = require('../models/Category');

const subcategoriesData = {
  "Find My Point": [
    "Accountant",
    "Automobile",
    "Beauty Parlour",
    "Construction",
    "Cosmetic Center",
    "Courier Center",
    "Electrical Center",
    "Electronics Center",
    "Event Management",
    "Fashion Center",
    "Fast food Center",
    "Restaurant Center",
    "Movies Center",
    "Fitness Centre",
    "Flower Centre",
    "Fruit & Sweet Center",
    "Furniture Centre",
    "Garments Centre",
    "Gift Center",
    "Goods & Accessories",
    "Grocery Center",
    "Hardware Center",
    "Hostel",
    "Jewellery Center",
    "Legal Services",
    "Marble & Tiles Center",
    "Petrol Pump Centre",
    "Printing Press",
    "Pump & Motor",
    "Real Estate",
    "Recharge Point",
    "Repair Center",
    "Salon & Spa",
    "Shoes Point",
    "Shopping Mall",
    "Spectacles Centre",
    "Sports Goods",
    "Studio Centre",
    "Tailor Center",
    "Tea & Tiffin Centre",
    "Textile Centre",
    "Vehicle Showroom",
    "Water Supplier",
    "Wholesale Point",
    "Wine Point"
  ],
  "Job Point": [
    "Accounting",
    "Bank",
    "BPO",
    "ETC",
    "FRESHER",
    "Government",
    "Health Care",
    "HR",
    "IIM",
    "IIT",
    "Industrial",
    "IT",
    "International",
    "Judicial",
    "Manufacturing Unit",
    "Marketing",
    "Official",
    "Petrol Pump",
    "Sales",
    "Security",
    "Teacher",
    "Worker",
    "Home Care",
    "Delivery"
  ],
  "Service Point": [
    "AC Repair",
    "Builder",
    "Care Taker",
    "Carpenter",
    "CCTV Repair & Installation",
    "Contractor",
    "Cook",
    "Driver",
    "Dry Cleaners",
    "Electrical & Electronic",
    "Home Teacher",
    "House Cleaner",
    "Home interior & Decoration",
    "Labour",
    "Maid",
    "Marble & Tiles Repair",
    "Microwave Oven Repair",
    "Mobile & Computer Repair",
    "Paint Man & Repair",
    "Plaster & Ceiling Repair",
    "Plumber Repair",
    "Refrigerator Repair",
    "TV Repair",
    "Washing Machine Repair",
    "Water tank Repair"
  ],
  "Education Point": [
    "Coaching Center",
    "College",
    "Computer Center",
    "Diploma College",
    "Engineering College",
    "ITI",
    "Institute Center",
    "Medical College",
    "Nursing & Pathology Institute",
    "Play School",
    "School",
    "University"
  ],
  "Health Care Point": [
    "Animal Care",
    "CHC & PHC",
    "Clinic",
    "Doctors",
    "Hospital",
    "Medicine Store",
    "Nursing Home",
    "Pathology",
    "Pharmacy"
  ],
  "Tour Point": [
    "India",
    "Nepal",
    "Sri Lanka",
    "Bangladesh",
    "Indonesia",
    "Dubai",
    "UK",
    "USA",
    "Australia",
    "Japan",
    "China",
    "Russia",
    "Maldives",
    "Bhutan",
    "Myanmar",
    "Thailand",
    "France",
    "Germany",
    "Saudi Arabia",
    "South Africa",
    "Switzerland"
  ]
};

async function injectSubcategories() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/findmypoint';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Injecting subcategories...');

    for (const [catLabel, subList] of Object.entries(subcategoriesData)) {
      const formattedSubs = subList.map(item => ({ label: item, icon: '' }));
      
      const updatedCat = await Category.findOneAndUpdate(
        { label: catLabel },
        { $set: { subcategories: formattedSubs } },
        { returnDocument: 'after', upsert: true }
      );
      
      console.log(`Updated "${catLabel}": ${updatedCat.subcategories.length} subcategories injected.`);
    }

    console.log('\n--- VERIFYING ALL CATEGORIES IN DB ---');
    const allCats = await Category.find({});
    allCats.forEach(c => {
      console.log(`- ${c.label}: ${c.subcategories.length} subcategories`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error injecting subcategories:', error);
    process.exit(1);
  }
}

injectSubcategories();
