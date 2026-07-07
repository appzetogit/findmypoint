import needsGrocery from "@/assets/needs_grocery.png";
import beautySpa from "@/assets/beauty_spa.png";
import serviceAc from "@/assets/service_ac.png";

export interface ProductService {
  name: string;
  price: string;
  img: string;
  desc: string;
  addedDate?: string;
}

export interface UserReview {
  userName: string;
  userInitial: string;
  userColor: string;
  rating: number;
  date: string;
  reviewText: string;
  image?: string;
  userEmail?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SimilarListing {
  id: string;
  name: string;
  location: string;
  rating: number;
  img: string;
  category: string;
}

export interface BusinessListingData {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
  phone: string;
  address: string;
  timings: string;
  openStatus: string;
  website: string;
  images: string[];
  description: string;
  products: ProductService[];
  reviews: UserReview[];
  faqs: FAQItem[];
  similarListings: SimilarListing[];
  // Extra fields from Admin Entry Form
  whatsapp?: string;
  extraNumbers?: string[];
  branches?: string[];
  openTime?: string;
  closeTime?: string;
  holidayTime?: string;
  officers?: { name: string; designation: string }[];
  facilities?: string[];
  email?: string;
  videoLink?: string;
  locationLink?: string;
  othersDestination?: string;
  subCategoryLine?: string;
  categoryLine?: string;
  highlightsName?: string;
  isVerified?: boolean;
  isBookingDisabled?: boolean;
  bookingButtonLabel?: string;
  isTimingMandatory?: boolean;
  country?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pincode?: string;
}

export const businessesData: BusinessListingData[] = [
  {
    id: "vishal-mega-mart",
    name: "Vishal Mega Mart",
    location: "South Tukoganj - Indore",
    category: "Supermarket & Groceries",
    rating: 4.8,
    reviewCount: 128,
    phone: "+91 98765 43210",
    address: "Scheme 54, Near Tukoganj Square, South Tukoganj, Indore, Madhya Pradesh - 452001",
    timings: "10:00 AM - 10:00 PM (Daily)",
    openStatus: "Open Now",
    website: "https://www.vishalmegamart.com",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Vishal Mega Mart is India's leading Fashion led hypermarket. It offers a wide range of fashion clothing, grocery, and household utility items at affordable prices. It provides an excellent one-stop shopping experience to catering to all household needs under one roof. With multiple outlets in Indore, the South Tukoganj branch is loved for its vast inventory and regular discounts.",
    products: [
      {
        name: "Fresh Farm",
        price: "₹50 / kg",
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
        desc: "Direct from local farms, fresh green vegetables, potatoes, onions, and seasonal items.",
      },
      {
        name: "Pastaa",
        price: "₹349 / pack",
        img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
        desc: "Includes 5kg premium basmati rice, 2kg organic pulses, and 1L cold-pressed mustard oil.",
      },
      {
        name: "T-Shirt",
        price: "₹499 each",
        img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=400&q=80",
        desc: "100% combed cotton, breathable fabric available in 6 trending colors and all sizes.",
      },
      {
        name: "Maggiee",
        price: "₹899 / set",
        img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80",
        desc: "Includes frying pan, kadhai with glass lid, and flat tawa with scratch-proof coating.",
      },
    ],
    reviews: [
      {
        userName: "Tarun pratap Singh",
        userInitial: "T",
        userColor: "from-blue-500 to-indigo-600",
        rating: 5,
        date: "24 Jun 2026",
        reviewText:
          "Vishal Mega Mart is a convenient one-stop shop for all your needs. With easily accessible locations, it offers a wide range of products at affordable prices. Whether you're looking for garments, groceries or household items, this store has it all.",
        image: needsGrocery,
        userEmail: "tarun.singh@example.com",
      },
      {
        userName: "Ankita Sen",
        userInitial: "A",
        userColor: "from-purple-500 to-fuchsia-600",
        rating: 4,
        date: "12 May 2026",
        reviewText:
          "Great discount on home utilities and groceries. The billing lines can get long on Sunday evenings, but the staff handles it well. Extremely cost-effective!",
        userEmail: "ankita.sen@example.com",
      },
      {
        userName: "Rohan Gupta",
        userInitial: "R",
        userColor: "from-emerald-500 to-teal-600",
        rating: 5,
        date: "18 Apr 2026",
        reviewText:
          "Excellent parking space, friendly helpers, and clean sections. They have a massive apparel section which is surprisingly fashionable for the price!",
        userEmail: "rohan.gupta@example.com",
      },
    ],
    faqs: [
      {
        question: "Does Vishal Mega Mart South Tukoganj have home delivery?",
        answer:
          "Yes, they provide home delivery for orders above ₹999 within a 5km radius. You can also place orders via their official app.",
      },
      {
        question: "What are the accepted payment methods?",
        answer:
          "They accept cash, credit cards, debit cards, UPI payments (Paytm, Google Pay, PhonePe), and Sodexo meal coupons.",
      },
      {
        question: "Is parking available at this location?",
        answer:
          "Yes, there is free underground and street-level parking available for two-wheelers and four-wheelers.",
      },
    ],
    similarListings: [
      {
        id: "reliance-smart-bazaar",
        name: "Reliance Smart Bazaar",
        location: "Vijay Nagar - Indore",
        rating: 4.6,
        img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80",
        category: "Supermarket & Groceries",
      },
      {
        id: "d-mart-nipania",
        name: "D-Mart Nipania",
        location: "Nipania - Indore",
        rating: 4.7,
        img: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80",
        category: "Supermarket & Groceries",
      },
    ],
  },
  {
    id: "sunny-chilled-water",
    name: "Sunny Chilled Water",
    location: "Nandlalpura - Indore",
    category: "Chilled Water Supplier",
    rating: 4.9,
    reviewCount: 95,
    phone: "+91 99999 88888",
    address: "12, Water Depot Lane, Nandlalpura, Indore, Madhya Pradesh - 452007",
    timings: "8:00 AM - 9:00 PM (Daily)",
    openStatus: "Open Now",
    website: "https://www.sunnywaterindore.com",
    images: [
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610970881699-44a5587caaec?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Sunny Chilled Water is the most trusted bulk RO and mineral water provider in Nandlalpura and surrounding residential areas in Indore. They supply high-quality reverse osmosis filtered water chilled to perfection, perfect for corporate events, wedding parties, or daily domestic consumption.",
    products: [
      {
        name: "20 Litre RO Chilled Water Can",
        price: "₹40 / can",
        img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80",
        desc: "20L heavy duty sealed plastic can containing chilled RO water with balanced minerals.",
      },
      {
        name: "Manual Tabletop Water Dispenser",
        price: "₹350 each",
        img: "https://images.unsplash.com/photo-1585250918486-ee90e1f7448d?auto=format&fit=crop&w=400&q=80",
        desc: "Robust plastic manual pump dispenser stand for 20L cans, easy to install and wash.",
      },
      {
        name: "500ml Bottled Water (Box of 24)",
        price: "₹150 / box",
        img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
        desc: "Hygienically packaged 500ml mineral water bottles, perfect for wedding catering and parties.",
      },
    ],
    reviews: [
      {
        userName: "Raj kalwani",
        userInitial: "R",
        userColor: "from-emerald-500 to-teal-600",
        rating: 5,
        date: "23 Jun 2026",
        reviewText:
          "Excellent behaviour by staff and owner and excellent service. Very prompt delivery of water cans. Always reliable and highly recommended for parties and daily usage.",
        image: beautySpa,
        userEmail: "raj.kalwani@example.com",
      },
      {
        userName: "Preeti Jha",
        userInitial: "P",
        userColor: "from-rose-500 to-pink-600",
        rating: 5,
        date: "05 Jun 2026",
        reviewText:
          "I've been ordering daily drinking water cans from Sunny Water for over two years now. The water is clean, has a sweet natural taste, and delivery is never delayed!",
        userEmail: "preeti.jha@example.com",
      },
    ],
    faqs: [
      {
        question: "What is the minimum order quantity for home delivery?",
        answer:
          "The minimum order quantity for free delivery in Nandlalpura is 2 water cans (20L). For smaller quantities, a small transit fee of ₹10 applies.",
      },
      {
        question: "Do you supply water for large-scale wedding events?",
        answer:
          "Yes! We specialize in bulk event supply. We can deliver up to 500 cans and 200 boxes of bottled water. Please reserve 3 days in advance.",
      },
    ],
    similarListings: [
      {
        id: "riya-chilled-water",
        name: "Riya Chilled Water",
        location: "Agrasen Square - Indore",
        rating: 4.7,
        img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=200&q=80",
        category: "Chilled Water Supplier",
      },
    ],
  },
  {
    id: "riya-chilled-water",
    name: "Riya Chilled Water",
    location: "Agrasen Square - Indore",
    category: "Chilled Water Supplier",
    rating: 4.7,
    reviewCount: 62,
    phone: "+91 98888 77777",
    address: "24, Agrasen Square, Main Road, Indore, Madhya Pradesh - 452001",
    timings: "7:00 AM - 10:00 PM (Daily)",
    openStatus: "Open Now",
    website: "https://www.riyachilledwater.com",
    images: [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "Riya Chilled Water offers premium reverse osmosis water filtration services. Centrally located near Agrasen Square, they have delivery vans available 24/7 to supply chilled and normal drinking water cans to restaurants, cafes, hostels, and residential clients.",
    products: [
      {
        name: "20L RO Water Can (Agrasen special)",
        price: "₹45 / can",
        img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80",
        desc: "Filtered through a multi-stage RO filter, UV sanitized, and enriched with alkaline minerals.",
      },
      {
        name: "Automatic Water Dispenser Pump (USB)",
        price: "₹450 each",
        img: "https://images.unsplash.com/photo-1610970881699-44a5587caaec?auto=format&fit=crop&w=400&q=80",
        desc: "Rechargeable electric pump that fits easily on 20L cans, one-touch button operation.",
      },
    ],
    reviews: [
      {
        userName: "vikash",
        userInitial: "V",
        userColor: "from-purple-500 to-fuchsia-600",
        rating: 5,
        date: "20 Jun 2026",
        reviewText:
          "They provide you the best reverse osmosis quality of water in the entire agrasen square area. They have very polite staff and many delivery vehicles to parcel your cane within your time.",
        image: serviceAc,
        userEmail: "vikash@example.com",
      },
      {
        userName: "Sanjay Nair",
        userInitial: "S",
        userColor: "from-blue-500 to-indigo-600",
        rating: 4.5,
        date: "02 Jun 2026",
        reviewText:
          "Very reasonable pricing and quick service. Cans are washed and sanitized, which is a major hygiene plus. Keep it up!",
        userEmail: "sanjay.nair@example.com",
      },
    ],
    faqs: [
      {
        question: "Is there a refund on the empty can deposit?",
        answer:
          "Yes, there is a refundable deposit of ₹150 per can if you do not have an empty can to swap.",
      },
    ],
    similarListings: [
      {
        id: "sunny-chilled-water",
        name: "Sunny Chilled Water",
        location: "Nandlalpura - Indore",
        rating: 4.9,
        img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=200&q=80",
        category: "Chilled Water Supplier",
      },
    ],
  },
];

const generatedStore: Record<string, BusinessListingData[]> = {};

export function getBusinessesForSubcategory(
  category: string,
  subcategory: string,
): BusinessListingData[] {
  const key = `${category}-${subcategory}`;
  if (generatedStore[key]) {
    return generatedStore[key];
  }

  const list: BusinessListingData[] = [];
  const locations = [
    "Andheri West - Mumbai",
    "Bandra West - Mumbai",
    "Vijay Nagar - Indore",
    "South Tukoganj - Indore",
  ];

  const imagesMap: Record<string, string[]> = {
    "Spa Point": [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
    ],
    "Tour Point": [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    ],
    "Job Point": [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    ],
    "Service Point": [
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    ],
    "Education Point": [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    ],
    "Health Care Point": [
      "https://images.unsplash.com/photo-1538108176447-280586497d96?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    ],
    "Hotel Point": [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    ],
    "Doctor Point": [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
    ],
    "Garments Point": [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
    ],
    "Astrologer Point": [
      "https://images.unsplash.com/photo-1515942400753-44ad825964f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
    ],
    "Product Point": [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=800&q=80",
    ],
    "Food Point": [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    ],
    "Courier Point": [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=800&q=80",
    ],
    "Car Rental Point": [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    ],
  };

  const selectedImages = imagesMap[category] || [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
  ];

  const prefix = subcategory.replace(/\s+/g, "");
  let businessNames = [
    `Apex ${subcategory} Hub`,
    `Elite ${subcategory} Services`,
    `National ${subcategory} Company`,
    `Royal ${subcategory} & Solutions`,
  ];

  const isFood = category === "Food Point";
  if (isFood) {
    businessNames = [
      `The Royal Grand ${subcategory === "Restaurants" ? "Bistro" : subcategory}`,
      `Spice Garden ${subcategory === "Restaurants" ? "Diner" : subcategory}`,
      `Urban Kitchen ${subcategory === "Restaurants" ? "Restaurant" : subcategory}`,
      `The Daily Food ${subcategory === "Restaurants" ? "Cafe" : subcategory}`,
    ];
  }

  const foodProducts = [
    [
      {
        name: "Paneer Tikka Butter Masala",
        price: "₹349",
        img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
        desc: "Creamy, rich tomato-butter gravy with char-grilled soft cottage cheese cubes.",
      },
      {
        name: "Butter Naan & Dal Makhani Combo",
        price: "₹289",
        img: "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&w=400&q=80",
        desc: "Slow-cooked black lentils in butter & cream served with hot clay-oven flatbread.",
      },
    ],
    [
      {
        name: 'Deluxe Veggie Cheese Pizza (10")',
        price: "₹399",
        img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
        desc: "Fresh dough hand-tossed and loaded with mozzarella, sweet corn, bell peppers, and mushrooms.",
      },
      {
        name: "Loaded Cheese Fries with Garlic Mayo",
        price: "₹189",
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
        desc: "Crispy skin-on french fries topped with liquid cheese sauce and fresh chives.",
      },
    ],
    [
      {
        name: "Hunan Veg Fried Rice & Manchurian",
        price: "₹279",
        img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80",
        desc: "Stir-fried basmati rice with crunchy vegetables paired with spicy soya sauce vegetable balls.",
      },
      {
        name: "Steamed Vegetable Momos (8 Pcs)",
        price: "₹149",
        img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80",
        desc: "Thin-wrapper dumplings stuffed with cabbage, carrot, and onion, served with spicy red chili dip.",
      },
    ],
    [
      {
        name: "Chocolate Fudge Lava Cake",
        price: "₹199",
        img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80",
        desc: "Soft chocolate cake with warm, liquid chocolate inside. Served with vanilla bean ice cream.",
      },
      {
        name: "Classic Virgin Mojito & Cold Brew",
        price: "₹159",
        img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
        desc: "Refreshing muddled mint leaves, lime wedges, simple syrup topped with soda and cold brew.",
      },
    ],
  ];

  for (let i = 0; i < 4; i++) {
    const id = `dynamic-${prefix.toLowerCase()}-${i + 1}`;
    const name = businessNames[i];
    const loc = locations[i];
    const rating = parseFloat((4.0 + Math.random() * 0.9).toFixed(1));
    const reviewsCount = Math.floor(15 + Math.random() * 180);
    const phone = `+91 98${Math.floor(10 + Math.random() * 89)}${Math.floor(10 + Math.random() * 89)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const address = isFood
      ? `${12 + i * 8}, Food Street, Near Food Court Plaza, ${loc}`
      : `${12 + i * 8}, Main Hub Commercial Street, Near City Center, ${loc}`;
    const website = `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
    const desc = isFood
      ? `${name} is a renowned culinary destination offering standard premium ${subcategory} foods in ${loc.split(" - ")[1]}. We focus on raw quality, delicious recipes, and highly hygienic preparations. Experience food fine-dining at its best.`
      : `${name} is a leading provider of premium ${subcategory} services in ${loc.split(" - ")[1]}. With a team of highly experienced professionals and state-of-the-art equipment, they guarantee maximum satisfaction and top-tier quality for all their clients. Contact them today for queries.`;

    const item: BusinessListingData = {
      id,
      name,
      location: loc,
      category: `${category} > ${subcategory}`,
      rating,
      reviewCount: reviewsCount,
      phone,
      address,
      timings: isFood ? "11:00 AM - 11:00 PM (Daily)" : "09:30 AM - 08:30 PM (Mon - Sat)",
      openStatus: "Open Now",
      website,
      images: [selectedImages[0], selectedImages[1], selectedImages[0]],
      description: desc,
      products: isFood
        ? foodProducts[i]
        : category === "Hotel Point"
          ? [
              {
                name: "Deluxe AC Room",
                price: `₹${1999 + i * 300} / night`,
                img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80",
                desc: "Comfortable deluxe room with queen size bed, central AC, free Wi-Fi, smart TV and 24/7 room service.",
              },
              {
                name: "Super Deluxe Room (Balcony)",
                price: `₹${2999 + i * 400} / night`,
                img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
                desc: "Premium room featuring a private balcony with city views, king-sized bed, mini-fridge and complimentary buffet breakfast.",
              },
              {
                name: "Luxury Family Suite",
                price: `₹${4499 + i * 600} / night`,
                img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
                desc: "Spacious two-bedroom suite with a separate living area, dedicated workspace, mini-bar, and high-priority room service.",
              },
            ]
          : category === "Health Care Point" &&
              (subcategory === "Doctors" || subcategory === "Dentists" || subcategory === "Clinics")
            ? [
                {
                  name: "Morning Slot Consultation (09:00 AM - 01:00 PM)",
                  price: `₹${300 + i * 50}`,
                  img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
                  desc: "Morning consulting appointment. Pre-booking helps to minimize OPD waiting times in the clinic.",
                },
                {
                  name: "Evening Slot Consultation (05:00 PM - 08:30 PM)",
                  price: `₹${400 + i * 50}`,
                  img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
                  desc: "Evening consulting appointment. Best option for working professionals and school children.",
                },
                {
                  name: "Priority / Emergency Walk-in Slot",
                  price: `₹${800 + i * 100}`,
                  img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80",
                  desc: "Immediate priority checkup or emergency consultation with minimal wait time and direct room entry.",
                },
              ]
            : [
                {
                  name: `Standard ${subcategory} Package`,
                  price: `₹${499 + i * 250} onwards`,
                  img: selectedImages[0],
                  desc: `Full professional package for standard ${subcategory} requirements.`,
                },
                {
                  name: `Premium ${subcategory} Assistance`,
                  price: `₹${999 + i * 500} / service`,
                  img: selectedImages[1],
                  desc: `Top-tier dedicated expert assistance for complex or bulk requirements.`,
                },
              ],
      reviews: [
        {
          userName: "Anish Patel",
          userInitial: "A",
          userColor: "from-blue-500 to-cyan-500",
          rating: Math.floor(rating),
          date: "10 days ago",
          reviewText: `Really great experience with ${name}. The work was completed on time, and their staff was polite and highly professional. Highly recommended!`,
          userEmail: "anish.patel@example.com",
        },
        {
          userName: "Shreya Sen",
          userInitial: "S",
          userColor: "from-pink-500 to-purple-500",
          rating: 5,
          date: "1 month ago",
          reviewText: `Super service! Reasonable prices and quick turnaround time. Definitely going to hire them again.`,
          userEmail: "shreya.sen@example.com",
        },
      ],
      faqs: [
        {
          question: `Do you provide customized solutions for ${subcategory}?`,
          answer: `Yes, we tailor all our ${subcategory} packages according to your budget and specific needs.`,
        },
        {
          question: "What are your standard working hours?",
          answer:
            "We are open from 09:30 AM to 08:30 PM, Monday through Saturday. Closed on Sundays.",
        },
      ],
      similarListings: [],
    };

    list.push(item);

    if (!businessesData.some((b) => b.id === id)) {
      businessesData.push(item);
    }
  }

  list.forEach((item) => {
    item.similarListings = list
      .filter((l) => l.id !== item.id)
      .map((l) => ({
        id: l.id,
        name: l.name,
        location: l.location,
        rating: l.rating,
        img: l.images[0],
        category: l.category,
      }));
  });

  generatedStore[key] = list;
  return list;
}

// Default verify status
businessesData.forEach((biz) => {
  biz.isVerified = !biz.id.startsWith("custom-");
});

// Load custom businesses from localStorage if running in browser
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("fmp_custom_businesses");
    if (saved) {
      const customBiz = JSON.parse(saved);
      if (Array.isArray(customBiz)) {
        customBiz.forEach((biz) => {
          const idx = businessesData.findIndex((b) => b.id === biz.id);
          if (idx > -1) {
            businessesData[idx] = biz;
          } else {
            businessesData.push(biz);
          }
        });
      }
    }
  } catch (e) {
    console.error("Failed to load custom businesses from localStorage", e);
  }

  // Apply overrides
  try {
    const overrides = localStorage.getItem("fmp_verified_statuses");
    if (overrides) {
      const parsed = JSON.parse(overrides);
      businessesData.forEach((biz) => {
        if (parsed[biz.id] !== undefined) {
          biz.isVerified = parsed[biz.id];
        }
      });
    }
  } catch (e) {
    console.error("Failed to apply verification status overrides", e);
  }

  // Apply booking disabled overrides
  try {
    const overrides = localStorage.getItem("fmp_booking_disabled_statuses");
    if (overrides) {
      const parsed = JSON.parse(overrides);
      businessesData.forEach((biz) => {
        if (parsed[biz.id] !== undefined) {
          biz.isBookingDisabled = parsed[biz.id];
        }
      });
    }
  } catch (e) {
    console.error("Failed to apply booking disable status overrides", e);
  }
}
