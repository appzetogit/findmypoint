import touristUjjain from "@/assets/tourist_ujjain.png";
import touristUdaipur from "@/assets/tourist_udaipur.png";
import touristAhmedabad from "@/assets/tourist_ahmedabad.png";
import touristNashik from "@/assets/tourist_nashik.png";
import touristJaipur from "@/assets/tourist_jaipur.png";
import touristMumbai from "@/assets/tourist_mumbai.png";

export interface PlaceItem {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  image: string;
  desc: string;
  tags: string[];
  price?: string;
  businessId?: string; // Optional: Link to a business page if we want
}

export interface TouristPlaceDetailData {
  name: string;
  coverImage: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  tags: string[];
  description: string;
  categories: { name: string; icon: string }[];
  temples: PlaceItem[];
  hotels: PlaceItem[];
  restaurants: PlaceItem[];
  spas: PlaceItem[];
  activities: PlaceItem[];
  faqs: { question: string; answer: string }[];
}

export const touristPlacesData: Record<string, TouristPlaceDetailData> = {
  Ujjain: {
    name: "Ujjain",
    coverImage: touristUjjain,
    images: [
      touristUjjain,
      "https://images.unsplash.com/photo-1627896157734-4d7d4388f24b?auto=format&fit=crop&w=800&q=80", // Mahakal corridor
      "https://images.unsplash.com/photo-1601999109332-542b18dbec57?auto=format&fit=crop&w=800&q=80", // Ghats
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"  // Local temple
    ],
    rating: 4.9,
    reviewsCount: 1845,
    tags: ["Pilgrimage", "Spiritual", "Historical", "Ancient City"],
    description: "Ujjain is one of the holiest cities in Hinduism, located on the banks of the Shipra River in Madhya Pradesh. Famous for the Mahakaleshwar Jyotirlinga temple, it is one of the four sites for the Kumbh Mela pilgrimage. Steeped in history, spirituality, and ancient Indian astronomy, Ujjain attracts millions of seekers and tourists annually.",
    categories: [
      { name: "Temples", icon: "🕌" },
      { name: "Hotels", icon: "🏨" },
      { name: "Food Point", icon: "🍲" },
      { name: "Spas", icon: "💆" },
      { name: "Shopping", icon: "🛍️" },
      { name: "Sightseeing", icon: "📸" }
    ],
    temples: [
      {
        id: "mahakaleshwar",
        name: "Mahakaleshwar Jyotirlinga",
        rating: 4.9,
        reviewsCount: 1540,
        image: "https://images.unsplash.com/photo-1627896157734-4d7d4388f24b?auto=format&fit=crop&w=500&q=80",
        desc: "One of the 12 sacred Jyotirlingas, famous for its grand Bhasma Aarti.",
        tags: ["Must Visit", "Historic"]
      },
      {
        id: "kal-bhairav",
        name: "Kal Bhairav Temple",
        rating: 4.8,
        reviewsCount: 920,
        image: "https://images.unsplash.com/photo-1601999109332-542b18dbec57?auto=format&fit=crop&w=500&q=80",
        desc: "Ancient temple where liquor is offered as prasad to the deity.",
        tags: ["Unique Ritual", "Crowded"]
      },
      {
        id: "harsiddhi",
        name: "Harsiddhi Temple",
        rating: 4.8,
        reviewsCount: 650,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80",
        desc: "One of the 51 Shaktipeethas, known for its beautiful lamp towers.",
        tags: ["Shaktipeeth", "Beautiful evening"]
      },
      {
        id: "mangalnath",
        name: "Mangalnath Temple",
        rating: 4.7,
        reviewsCount: 480,
        image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=500&q=80",
        desc: "Considered the birthplace of planet Mars, highly auspicious for rituals.",
        tags: ["Spiritual", "Astro-significance"]
      }
    ],
    hotels: [
      {
        id: "hotel-atharv",
        name: "Hotel Atharv Ujjain",
        rating: 4.6,
        reviewsCount: 310,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
        desc: "Modern luxury hotel located close to the Mahakal Temple corridor.",
        price: "₹3,200/night onwards",
        tags: ["Premium", "Near Temple"]
      },
      {
        id: "anjushree",
        name: "Anjushree Luxury Resort",
        rating: 4.7,
        reviewsCount: 520,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=80",
        desc: "5-star resort with luxury amenities, swimming pool and fine dining.",
        price: "₹5,500/night onwards",
        tags: ["Resort", "Luxury"]
      },
      {
        id: "hotel-mahakal-ashray",
        name: "Hotel Mahakal Ashray",
        rating: 4.3,
        reviewsCount: 180,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=500&q=80",
        desc: "Budget-friendly hotel offering clean rooms and excellent service.",
        price: "₹1,500/night onwards",
        tags: ["Budget", "Family Friendly"]
      }
    ],
    restaurants: [
      {
        id: "svarana-restauraunt",
        name: "Swaran Restaurant",
        rating: 4.5,
        reviewsCount: 420,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
        desc: "Authentic Malwa thali and North Indian vegetarian specialties.",
        price: "₹300/person",
        tags: ["Pure Veg", "Family Room"]
      },
      {
        id: "damru-wala",
        name: "Shree Ganga Restaurant",
        rating: 4.4,
        reviewsCount: 290,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80",
        desc: "Famous for Ujjaini Sev Parmal, Kachori and sweets.",
        price: "₹150/person",
        tags: ["Local Taste", "Quick Bites"]
      },
      {
        id: "empire-restaurant",
        name: "Empire Restaurant Ujjain",
        rating: 4.2,
        reviewsCount: 160,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80",
        desc: "Multi-cuisine vegetarian menu near railway station.",
        price: "₹250/person",
        tags: ["Multi-cuisine", "Cozy"]
      }
    ],
    spas: [
      {
        id: "sagar-spa",
        name: "Ayurveda Wellness Spa",
        rating: 4.7,
        reviewsCount: 88,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80",
        desc: "Traditional Shirodhara and Panchakarma ayurvedic massage therapy.",
        price: "₹1,200 onwards",
        tags: ["Ayurvedic", "Professional"]
      },
      {
        id: "vogue-beauty-spa-ujn",
        name: "Vogue Beauty Spa",
        rating: 4.5,
        reviewsCount: 65,
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=500&q=80",
        desc: "Unwind with customized body massages and reflexology.",
        price: "₹1,500 onwards",
        tags: ["Modern Spa", "Relaxing"]
      }
    ],
    activities: [
      {
        id: "ramghat-aarti",
        name: "Shipra River Aarti at Ram Ghat",
        rating: 4.9,
        reviewsCount: 2100,
        image: "https://images.unsplash.com/photo-1601999109332-542b18dbec57?auto=format&fit=crop&w=500&q=80",
        desc: "Witness the divine Shipra River evening aarti with hundreds of floating lamps.",
        price: "Free",
        tags: ["Must Experience", "Evening"]
      },
      {
        id: "mahakal-corridor-walk",
        name: "Mahakal Lok Corridor Walk",
        rating: 4.9,
        reviewsCount: 3400,
        image: "https://images.unsplash.com/photo-1627896157734-4d7d4388f24b?auto=format&fit=crop&w=500&q=80",
        desc: "Explore the newly built, majestic corridor filled with murals and sandstone sculptures of Lord Shiva.",
        price: "Free",
        tags: ["Architectural Wonder", "Night View"]
      }
    ],
    faqs: [
      {
        question: "What is the best time to visit Ujjain?",
        answer: "The best time to visit Ujjain is from October to March when the weather is pleasant. Devotees also flock during Shravan month (July-August) and Kartik Mela."
      },
      {
        question: "How can I book Bhasma Aarti at Mahakaleshwar Temple?",
        answer: "Bhasma Aarti can be booked online via the official Ujjain Mahakaleshwar Temple website (up to 30 days in advance) or offline at the counter one day prior on a first-come, first-served basis."
      },
      {
        question: "What famous dishes should I try in Ujjain?",
        answer: "Do not miss Ujjaini Sev, Kachoris, Poha-Jalebi, and Rabdi at Tower Chowk and local street food hubs."
      }
    ]
  },
  Udaipur: {
    name: "Udaipur",
    coverImage: touristUdaipur,
    images: [
      touristUdaipur,
      "https://images.unsplash.com/photo-1562280963-8a54756e04da?auto=format&fit=crop&w=800&q=80", // Lake Palace
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80", // City Palace
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80"  // Jag Mandir
    ],
    rating: 4.8,
    reviewsCount: 2200,
    tags: ["Lakes", "Romantic", "Heritage", "Palaces"],
    description: "Known as the 'City of Lakes' and the 'Venice of the East', Udaipur is a picturesque historic capital of the Mewar Kingdom in Rajasthan. Surrounded by the beautiful Aravalli Hills, it is famous for its stunning lakes, majestic palaces, gorgeous gardens, and rich cultural heritage.",
    categories: [
      { name: "Sightseeing", icon: "📸" },
      { name: "Hotels", icon: "🏨" },
      { name: "Food Point", icon: "🍲" },
      { name: "Shopping", icon: "🛍️" },
      { name: "Spas", icon: "💆" }
    ],
    temples: [
      {
        id: "jagdish-temple",
        name: "Jagdish Temple",
        rating: 4.7,
        reviewsCount: 780,
        image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=500&q=80",
        desc: "Large Indo-Aryan temple built in 1651, decorated with fine carvings.",
        tags: ["Historic", "Architecture"]
      }
    ],
    hotels: [
      {
        id: "taj-lake-palace",
        name: "Taj Lake Palace Udaipur",
        rating: 4.9,
        reviewsCount: 890,
        image: "https://images.unsplash.com/photo-1562280963-8a54756e04da?auto=format&fit=crop&w=500&q=80",
        desc: "World-famous heritage hotel situated in the middle of Lake Pichola.",
        price: "₹35,000/night onwards",
        tags: ["Luxury", "Iconic"]
      },
      {
        id: "oberoi-udaivilas",
        name: "The Oberoi Udaivilas",
        rating: 4.9,
        reviewsCount: 1100,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=80",
        desc: "Award-winning ultra-luxury hotel on the banks of Lake Pichola.",
        price: "₹40,000/night onwards",
        tags: ["Super Premium", "Palatial"]
      }
    ],
    restaurants: [
      {
        id: "amrai-restaurant",
        name: "Ambrai Restaurant",
        rating: 4.6,
        reviewsCount: 1200,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
        desc: "Fine dining restaurant offering premium views of City Palace and Lake Pichola.",
        price: "₹1,200/person",
        tags: ["Lake View", "Romantic"]
      }
    ],
    spas: [
      {
        id: "jiva-spa",
        name: "Jiva Spa at Taj",
        rating: 4.8,
        reviewsCount: 120,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80",
        desc: "Signature Indian spa treatments and holistic body therapies.",
        price: "₹3,500 onwards",
        tags: ["Luxury Spa", "Wellness"]
      }
    ],
    activities: [
      {
        id: "boat-ride-pichola",
        name: "Boat Ride on Lake Pichola",
        rating: 4.8,
        reviewsCount: 3100,
        image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=500&q=80",
        desc: "Enjoy a scenic boat cruise during sunset to view palaces from the water.",
        price: "₹400 onwards",
        tags: ["Sunset View", "Must Do"]
      }
    ],
    faqs: [
      {
        question: "How many days are enough for Udaipur?",
        answer: "Usually 2 to 3 days are sufficient to cover major attractions like City Palace, Lake Pichola, Sajjangarh Monsoon Palace, and Saheliyon-ki-Bari."
      }
    ]
  },
  Ahmedabad: {
    name: "Ahmedabad",
    coverImage: touristAhmedabad,
    images: [
      touristAhmedabad,
      "https://images.unsplash.com/photo-1603258591833-28f09fb93d7c?auto=format&fit=crop&w=800&q=80", // Adalaj
      "https://images.unsplash.com/photo-1599830889502-36c535728a50?auto=format&fit=crop&w=800&q=80", // Gandhi Ashram
      "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=800&q=80"  // Kankaria
    ],
    rating: 4.7,
    reviewsCount: 1400,
    tags: ["Heritage", "Business", "Modern City", "UNESCO Site"],
    description: "Ahmedabad is Gujarat's largest city and India's first UNESCO World Heritage City. Located on the banks of the Sabarmati River, it is famous for its Gandhi heritage (Sabarmati Ashram), spectacular architecture (Adalaj Stepwell), vibrant textiles, and delicious Gujarati cuisine.",
    categories: [
      { name: "Sightseeing", icon: "📸" },
      { name: "Hotels", icon: "🏨" },
      { name: "Food Point", icon: "🍲" },
      { name: "Shopping", icon: "🛍️" }
    ],
    temples: [
      {
        id: "akshardham",
        name: "Akshardham Temple (Gandhinagar)",
        rating: 4.8,
        reviewsCount: 1800,
        image: touristAhmedabad,
        desc: "Majestic temple complex with light and sound show, close to Ahmedabad.",
        tags: ["Cultural Complex", "Must Visit"]
      }
    ],
    hotels: [
      {
        id: "hyatt-regency",
        name: "Hyatt Regency Ahmedabad",
        rating: 4.6,
        reviewsCount: 890,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
        desc: "Premium luxury hotel overlooking the Sabarmati Riverfront.",
        price: "₹6,000/night onwards",
        tags: ["Business", "River View"]
      }
    ],
    restaurants: [
      {
        id: "vishalla",
        name: "Vishalla Restaurant",
        rating: 4.7,
        reviewsCount: 1500,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
        desc: "Traditional village-style outdoor restaurant serving authentic Gujarati Thali.",
        price: "₹800/person",
        tags: ["Gujarati Thali", "Rustic Experience"]
      }
    ],
    spas: [
      {
        id: "serena-spa",
        name: "Serena Spa",
        rating: 4.5,
        reviewsCount: 42,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80",
        desc: "Refreshing body massages and steam therapies.",
        price: "₹1,800 onwards",
        tags: ["Relaxation"]
      }
    ],
    activities: [
      {
        id: "sabarmati-ashram",
        name: "Sabarmati Ashram Visit",
        rating: 4.8,
        reviewsCount: 2800,
        image: "https://images.unsplash.com/photo-1599830889502-36c535728a50?auto=format&fit=crop&w=500&q=80",
        desc: "Explore Mahatma Gandhi's historical residence and archives on the river bank.",
        price: "Free",
        tags: ["Gandhi Legacy", "Historical"]
      }
    ],
    faqs: [
      {
        question: "Is Ahmedabad a safe city?",
        answer: "Yes, Ahmedabad is consistently ranked as one of the safest cities in India for tourists and residents alike."
      }
    ]
  },
  Nashik: {
    name: "Nashik",
    coverImage: touristNashik,
    images: [
      touristNashik,
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80", // Vineyards
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80", // Temples
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"  // Godavari
    ],
    rating: 4.6,
    reviewsCount: 950,
    tags: ["Wine Capital", "Pilgrimage", "Temples", "Nature"],
    description: "Nashik is an ancient holy city in Maharashtra, situated on the banks of the Godavari River. Known as the 'Wine Capital of India' due to its numerous vineyards, Nashik is also famous for hosting the Kumbh Mela and its linkages with the Hindu epic Ramayana.",
    categories: [
      { name: "Temples", icon: "🕌" },
      { name: "Hotels", icon: "🏨" },
      { name: "Food Point", icon: "🍲" },
      { name: "Wine Tours", icon: "🍷" }
    ],
    temples: [
      {
        id: "trimbakeshwar",
        name: "Trimbakeshwar Shiva Temple",
        rating: 4.8,
        reviewsCount: 1600,
        image: touristNashik,
        desc: "One of the 12 Jyotirlingas, featuring a unique three-faced linga.",
        tags: ["Sacred", "Jyotirlinga"]
      }
    ],
    hotels: [
      {
        id: "sula-source",
        name: "The Source at Sula",
        rating: 4.8,
        reviewsCount: 650,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=500&q=80",
        desc: "Beautiful resort located inside India's premier Sula Vineyards.",
        price: "₹8,500/night onwards",
        tags: ["Vineyard Resort", "Premium"]
      }
    ],
    restaurants: [
      {
        id: "sadhana-chulivarchli",
        name: "Sadhana Restaurant",
        rating: 4.5,
        reviewsCount: 980,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80",
        desc: "Extremely popular for authentic Maharashtrian Chulivarchi Misal Pav.",
        price: "₹150/person",
        tags: ["Famous Misal", "Spicy"]
      }
    ],
    spas: [
      {
        id: "sula-spa",
        name: "Vinotherapy Spa at Sula",
        rating: 4.7,
        reviewsCount: 45,
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=500&q=80",
        desc: "Unique relaxation treatments utilizing grape-seed oils and extracts.",
        price: "₹2,500 onwards",
        tags: ["Vinotherapy", "Luxury"]
      }
    ],
    activities: [
      {
        id: "wine-tasting-sula",
        name: "Sula Vineyards Wine Tour",
        rating: 4.7,
        reviewsCount: 2200,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=500&q=80",
        desc: "Take a guided vineyard tour and tasting session of award-winning wines.",
        price: "₹400 onwards",
        tags: ["Wine Tasting", "Scenic"]
      }
    ],
    faqs: [
      {
        question: "Is Trimbakeshwar temple close to Nashik?",
        answer: "Yes, Trimbakeshwar is about 28 km (approx. 45-50 minutes drive) from main Nashik city."
      }
    ]
  },
  Jaipur: {
    name: "Jaipur",
    coverImage: touristJaipur,
    images: [
      touristJaipur,
      "https://images.unsplash.com/photo-1599661046289-e318978db67a?auto=format&fit=crop&w=800&q=80", // Hawa Mahal
      "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80", // Amber Fort
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80"  // Jal Mahal
    ],
    rating: 4.8,
    reviewsCount: 3100,
    tags: ["Pink City", "Palaces", "Heritage", "Shopping"],
    description: "Jaipur, the capital of Rajasthan, is known globally as the 'Pink City' due to the distinctive color of its buildings. A UNESCO World Heritage site, it forms the Golden Triangle tourist circuit along with Delhi and Agra. It is celebrated for its colossal forts, grand palaces, opulent history, and colorful bazaars.",
    categories: [
      { name: "Forts & Palaces", icon: "🏰" },
      { name: "Hotels", icon: "🏨" },
      { name: "Food Point", icon: "🍲" },
      { name: "Shopping", icon: "🛍️" }
    ],
    temples: [
      {
        id: "govind-devji",
        name: "Govind Dev Ji Temple",
        rating: 4.9,
        reviewsCount: 1400,
        image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=500&q=80",
        desc: "Famous historical temple of Lord Krishna inside the City Palace complex.",
        tags: ["Devotional", "Must Visit"]
      }
    ],
    hotels: [
      {
        id: "rambagh-palace",
        name: "Rambagh Palace Jaipur",
        rating: 4.9,
        reviewsCount: 1450,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
        desc: "Former palace of the Maharaja of Jaipur, now a legendary luxury heritage hotel.",
        price: "₹38,000/night onwards",
        tags: ["Royal Heritage", "Ultra Luxury"]
      }
    ],
    restaurants: [
      {
        id: "laxmi-misthan-bhandar",
        name: "Laxmi Misthan Bhandar (LMB)",
        rating: 4.4,
        reviewsCount: 2200,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80",
        desc: "Famous sweetshop and restaurant in Johri Bazaar, renowned for Rajasthani Pyaaz Kachori and Rajasthani Thali.",
        price: "₹400/person",
        tags: ["Rajasthani Thali", "Legendary Sweets"]
      }
    ],
    spas: [
      {
        id: "serene-palace-spa",
        name: "The Palace Spa",
        rating: 4.7,
        reviewsCount: 88,
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=500&q=80",
        desc: "Indulge in royal Ayurvedic facial and full body massages.",
        price: "₹3,000 onwards",
        tags: ["Royal Spa", "Ayurveda"]
      }
    ],
    activities: [
      {
        id: "amber-fort-tour",
        name: "Amer Fort Guided Tour & Light Show",
        rating: 4.8,
        reviewsCount: 4500,
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=500&q=80",
        desc: "Walk through the stunning gates and mirror palace (Sheesh Mahal) of Amer Fort.",
        price: "₹100 onwards",
        tags: ["Historic Fort", "Sound & Light"]
      }
    ],
    faqs: [
      {
        question: "Why is Jaipur called the Pink City?",
        answer: "In 1876, Maharaja Sawai Ram Singh ordered the entire city to be painted pink (the color of hospitality) to welcome Albert Edward, Prince of Wales."
      }
    ]
  },

  Mumbai: {
    name: "Mumbai",
    coverImage: touristMumbai,
    images: [
      touristMumbai,
      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewsCount: 9420,
    tags: ["Metropolitan", "Coastal", "Bollywood", "Financial Capital"],
    description: "Mumbai, the City of Dreams, is India's financial, commercial, and entertainment capital. Perched on the Arabian Sea coast, it boasts iconic landmarks like the Gateway of India, Marine Drive's Queen's Necklace, and the vibrant Dharavi. A melting pot of cultures, it offers world-class dining, heritage architecture, Bollywood studios, and a nightlife that never sleeps.",
    categories: [
      { name: "Landmarks", icon: "🏛️" },
      { name: "Hotels", icon: "🏨" },
      { name: "Restaurants", icon: "🍽️" },
      { name: "Spas", icon: "💆" },
      { name: "Shopping", icon: "🛍️" },
      { name: "Beaches", icon: "🏖️" }
    ],
    temples: [
      {
        id: "gateway-of-india",
        name: "Gateway of India",
        rating: 4.8,
        reviewsCount: 12400,
        image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=500&q=80",
        desc: "Iconic 26-metre basalt arch monument overlooking the Arabian Sea, built in 1924 to commemorate the visit of King George V.",
        tags: ["Must Visit", "Historic"]
      },
      {
        id: "siddhivinayak-temple",
        name: "Siddhivinayak Temple",
        rating: 4.9,
        reviewsCount: 8700,
        image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=500&q=80",
        desc: "One of the most visited and richest temples in Mumbai, dedicated to Lord Ganesha. A must-visit spiritual experience.",
        tags: ["Spiritual", "Famous"]
      },
      {
        id: "elephanta-caves",
        name: "Elephanta Caves",
        rating: 4.7,
        reviewsCount: 5300,
        image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=500&q=80",
        desc: "UNESCO World Heritage Site — ancient rock-cut cave temples dedicated to Lord Shiva, accessible by ferry from the Gateway.",
        tags: ["UNESCO", "Heritage"]
      },
      {
        id: "marine-drive",
        name: "Marine Drive (Queen's Necklace)",
        rating: 4.9,
        reviewsCount: 15600,
        image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=500&q=80",
        desc: "A stunning 3.6 km arc boulevard along the coastline — magical at night when streetlights resemble a sparkling necklace.",
        tags: ["Iconic", "Scenic Walk"]
      }
    ],
    hotels: [
      {
        id: "taj-mahal-palace",
        name: "Taj Mahal Palace Hotel",
        rating: 4.9,
        reviewsCount: 7200,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
        desc: "Legendary 5-star heritage hotel opposite the Gateway of India, offering unparalleled luxury since 1903.",
        price: "₹28,000/night onwards",
        tags: ["Heritage", "Ultra Luxury"]
      },
      {
        id: "trident-nariman-point",
        name: "Trident Nariman Point",
        rating: 4.7,
        reviewsCount: 4100,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=80",
        desc: "Modern 5-star hotel with panoramic sea views, close to business districts and Marine Drive.",
        price: "₹12,000/night onwards",
        tags: ["Sea View", "Premium"]
      },
      {
        id: "ibis-mumbai",
        name: "Ibis Mumbai Airport",
        rating: 4.3,
        reviewsCount: 2800,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=500&q=80",
        desc: "Smart and comfortable 4-star hotel near the international terminal, perfect for transit travelers.",
        price: "₹4,500/night onwards",
        tags: ["Business", "Airport Nearby"]
      }
    ],
    restaurants: [
      {
        id: "trishna-mumbai",
        name: "Trishna",
        rating: 4.8,
        reviewsCount: 3200,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
        desc: "Legendary seafood restaurant in Fort area — butter garlic crab is an absolute must-try.",
        price: "₹1,800/person",
        tags: ["Seafood", "Iconic"]
      },
      {
        id: "leopold-cafe",
        name: "Leopold Café",
        rating: 4.5,
        reviewsCount: 6100,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80",
        desc: "Historic café near the Gateway of India established in 1871 — a Colaba institution serving multi-cuisine.",
        price: "₹800/person",
        tags: ["Heritage Café", "Colaba"]
      },
      {
        id: "cream-centre",
        name: "Cream Centre",
        rating: 4.6,
        reviewsCount: 2400,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80",
        desc: "Iconic Mumbai vegetarian restaurant famous for Sizzlers and Continental cuisine since 1962.",
        price: "₹700/person",
        tags: ["Pure Veg", "Classic"]
      }
    ],
    spas: [
      {
        id: "jiva-spa-taj",
        name: "Jiva Spa at Taj Mahal Palace",
        rating: 4.9,
        reviewsCount: 520,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80",
        desc: "Award-winning luxury spa inspired by Indian traditions. Signature treatments include Navadha Pranayama and deep tissue massage.",
        price: "₹8,000 onwards",
        tags: ["Luxury", "Holistic"]
      },
      {
        id: "four-fountains-spa",
        name: "Four Fountains Spa",
        rating: 4.5,
        reviewsCount: 890,
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=500&q=80",
        desc: "Affordable urban wellness centre with Swedish massage, aromatherapy and de-stress packages.",
        price: "₹1,200 onwards",
        tags: ["Value", "Urban Wellness"]
      }
    ],
    activities: [
      {
        id: "dharavi-tour",
        name: "Dharavi Slum Walking Tour",
        rating: 4.7,
        reviewsCount: 3100,
        image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=500&q=80",
        desc: "Eye-opening guided tour through Asia's largest slum — witness the resilient spirit of Mumbai's working community.",
        price: "₹600/person",
        tags: ["Cultural", "Eye-Opening"]
      },
      {
        id: "bollywood-studio-tour",
        name: "Film City Bollywood Studio Tour",
        rating: 4.6,
        reviewsCount: 2200,
        image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=500&q=80",
        desc: "Explore Bollywood sets, outdoor shooting locations and live film productions at Mumbai's iconic Film City studio.",
        price: "₹1,200/person",
        tags: ["Bollywood", "Entertainment"]
      },
      {
        id: "juhu-beach-evening",
        name: "Juhu Beach Evening Stroll",
        rating: 4.4,
        reviewsCount: 8900,
        image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=500&q=80",
        desc: "Mumbai's most famous beach where Bollywood stars live nearby — enjoy Pani Puri, Bhel Puri and stunning sunsets.",
        price: "Free",
        tags: ["Beach", "Street Food"]
      }
    ],
    faqs: [
      {
        question: "What is the best time to visit Mumbai?",
        answer: "October to February is the best time to visit Mumbai, when the weather is pleasant and cooler. Monsoon season (June-September) makes the city lush green but heavy rains can disrupt travel."
      },
      {
        question: "How do I get around Mumbai?",
        answer: "Mumbai has an excellent local train network (Western, Central, and Harbour lines) which is the fastest way to travel. Auto-rickshaws operate in the suburbs, while taxis and app cabs like Ola/Uber are available citywide."
      },
      {
        question: "What is Mumbai famous for?",
        answer: "Mumbai is famous for being India's financial capital, home of Bollywood (Hindi film industry), street food like Vada Pav and Pav Bhaji, Marine Drive, the Gateway of India, and its incredibly diverse and resilient spirit."
      }
    ]
  }
};
