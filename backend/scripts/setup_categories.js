const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Category = require('../models/Category');

const artifactDir = 'C:\\Users\\admin\\.gemini\\antigravity-ide\\brain\\e102da8e-5719-4963-bdc6-6e023ff780a0';
const targetDir = path.join(__dirname, '../public/uploads/categories');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy generated images
const generatedImageMap = {
  findmypoint: 'cat_findmypoint_1786423122407.png',
  jobpoint: 'cat_jobpoint_1786423137104.png',
  servicepoint: 'cat_servicepoint_1786423153040.png',
  educationpoint: 'cat_educationpoint_1786423168428.png',
  healthcarepoint: 'cat_healthcarepoint_1786423180629.png',
  hotelpoint: 'cat_hotelpoint_1786423194275.png'
};

for (const [key, filename] of Object.entries(generatedImageMap)) {
  const srcPath = path.join(artifactDir, filename);
  const destPath = path.join(targetDir, `${key}.png`);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}

// Vector SVGs
function createSvgLogo(categoryName, bgGradient, iconSvg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient[0]}"/>
      <stop offset="100%" stop-color="${bgGradient[1]}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#bgGrad)"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.15"/>
  <circle cx="256" cy="256" r="170" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.1"/>
  <g filter="url(#shadow)" transform="translate(0, 0)">
    ${iconSvg}
  </g>
</svg>`;
}

const remainingSvgs = {
  doctorpoint: createSvgLogo('Doctor Point', ['#06b6d4', '#0284c7'], `
    <path d="M256 70 C190 70 136 124 136 190 C136 270 256 420 256 420 C256 420 376 270 376 190 C376 124 322 70 256 70 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="256" cy="180" r="65" fill="#0284c7"/>
    <rect x="241" y="140" width="30" height="80" rx="6" fill="#ffffff"/>
    <rect x="216" y="165" width="80" height="30" rx="6" fill="#ffffff"/>
  `),
  garmentspoint: createSvgLogo('Garments Point', ['#ec4899', '#be185d'], `
    <path d="M256 70 C190 70 136 124 136 190 C136 270 256 420 256 420 C256 420 376 270 376 190 C376 124 322 70 256 70 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="256" cy="180" r="65" fill="#be185d"/>
    <path d="M256 135 C246 135 238 143 238 153 C238 163 246 170 256 170 L285 185 L227 185 L200 220 L312 220 Z" fill="#ffffff"/>
  `),
  astrologerpoint: createSvgLogo('Astrologer Point', ['#8b5cf6', '#5b21b6'], `
    <path d="M256 70 C190 70 136 124 136 190 C136 270 256 420 256 420 C256 420 376 270 376 190 C376 124 322 70 256 70 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="256" cy="180" r="65" fill="#5b21b6"/>
    <path d="M256 125 L267 158 L302 158 L274 179 L285 212 L256 191 L227 212 L238 179 L210 158 L245 158 Z" fill="#facc15"/>
    <circle cx="256" cy="180" r="45" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4"/>
  `),
  productpoint: createSvgLogo('Product Point', ['#10b981', '#047857'], `
    <path d="M256 70 C190 70 136 124 136 190 C136 270 256 420 256 420 C256 420 376 270 376 190 C376 124 322 70 256 70 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="256" cy="180" r="65" fill="#047857"/>
    <path d="M220 140 H292 L305 220 H207 Z" fill="#ffffff"/>
    <path d="M236 140 C236 125 245 115 256 115 C267 115 276 125 276 140" fill="none" stroke="#ffffff" stroke-width="6"/>
  `),
  foodpoint: createSvgLogo('Food Point', ['#ef4444', '#b91c1c'], `
    <path d="M256 70 C190 70 136 124 136 190 C136 270 256 420 256 420 C256 420 376 270 376 190 C376 124 322 70 256 70 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="256" cy="180" r="65" fill="#b91c1c"/>
    <path d="M210 200 C210 160 302 160 302 200 Z" fill="#ffffff"/>
    <rect x="200" y="202" width="112" height="12" rx="4" fill="#ffffff"/>
    <circle cx="256" cy="152" r="8" fill="#ffffff"/>
  `)
};

for (const [key, svgContent] of Object.entries(remainingSvgs)) {
  const destPath = path.join(targetDir, `${key}.svg`);
  fs.writeFileSync(destPath, svgContent, 'utf8');
}

const newCategories = [
  {
    label: "Find My Point",
    img: "/uploads/categories/findmypoint.png",
    subcategories: [
      "Accountant", "Automobile", "Beuti Parlour", "Construction", "Cosmetic Center", "Courier Center", "Electrical Center", "Electronics Center", "Event Management", "Fashion Center", "Fast food Center", "Restaurant Center", "Movies Center", "Fitness Centre", "Flower Centre", "Fruit & Sweet Center", "Furniture Centre", "Germents Centre", "Gift Center", "Goods & Accessories", "Grocery Center", "Hardwares Center", "Hostel", "Jewellery Center", "Legal Services", "Marble & Tiles Center", "Petro Pump Centre", "Printing Press", "Pump & Motor", "Real Estate", "Recharge Point", "Repair Center", "Salon & Spa", "Shoes Point", "Shoping Mall", "Spectacles Centre", "Sports Goods", "Studio Centre", "Tailor Center", "Tea & Tiffin Centre", "Textile Centre", "Vehicle Showroom", "Water Supplier", "Wholesale Point", "Wine Point"
    ].map(s => ({ label: s, icon: '' }))
  },
  {
    label: "Job Point",
    img: "/uploads/categories/jobpoint.png",
    subcategories: [
      "Accounting", "Bank", "BPO", "ETC", "FRESHER", "Government", "Health Care", "HR", "IIM", "IIT", "Industrial", "IT", "International", "Judicial", "Manufacturing Unit", "Marketing", "Official", "Petrol Pump", "Sales", "Security", "Teacher", "Worker", "Home Care", "Delevery"
    ].map(s => ({ label: s, icon: '' }))
  },
  {
    label: "Service Point",
    img: "/uploads/categories/servicepoint.png",
    subcategories: [
      "AC Repair", "Builder", "Care Taker", "Carpenter", "CC tv Repair & Installation", "Contractor", "Cook", "Driver", "Dry Cleaners", "Electrical & Electronic", "Home Teacher", "House Cleaner", "Home interior & Decoration", "Labour", "Maid", "Marble & Tiles Repair", "Microwava Oven Repair", "Mobile & Computer Repair", "Paint Man & Repair", "Plaster & Ceiling Repair", "Plumber Repair", "Refrigerator Repair", "TV Repair", "Washing Machine Repair", "Water tank Repair"
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
    img: "/uploads/categories/doctorpoint.png",
    subcategories: []
  },
  {
    label: "Garments Point",
    img: "/uploads/categories/garmentspoint.png",
    subcategories: []
  },
  {
    label: "Astrologer Point",
    img: "/uploads/categories/astrologerpoint.png",
    subcategories: []
  },
  {
    label: "Product Point",
    img: "/uploads/categories/productpoint.png",
    subcategories: []
  },
  {
    label: "Food Point",
    img: "/uploads/categories/foodpoint.png",
    subcategories: []
  }
];

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/findmypoint';
    await mongoose.connect(mongoUri);

    for (const cat of newCategories) {
      await Category.findOneAndUpdate(
        { label: cat.label },
        { $set: { label: cat.label, img: cat.img, subcategories: cat.subcategories } },
        { returnDocument: 'after', upsert: true }
      );
    }

    // Also handle Tour Point subcategories
    const tourSubs = [
      "India", "Nepal", "Sri Lanka", "Bangladesh", "Indonesia", "Dubai", "UK", "USA", "Australia", "Japan", "China", "Rusia", "Maldives", "Bhutan", "Myanmar", "Thailand", "France", "Germany", "Saudi Arabia", "South Africa", "Switzerland"
    ].map(s => ({ label: s, icon: '' }));
    await Category.findOneAndUpdate(
      { label: "Tour Point" },
      { $set: { subcategories: tourSubs } },
      { returnDocument: 'after' }
    );

    console.log('Categories & subcategories setup completed!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
