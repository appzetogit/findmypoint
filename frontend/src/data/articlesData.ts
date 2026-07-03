export interface BusinessDetail {
  id: string;
  name: string;
  images: string[];
  description: string;
  quote?: string;
  foodRange?: string;
  mustTry?: string;
  priceForTwo?: string;
  timings?: string;
  address?: string;
  rating?: number;
}

export interface Recommendation {
  title: string;
  img: string;
  desc?: string;
  link?: string;
}

export interface ArticleData {
  id: number;
  title: string;
  category: string;
  readTime: string;
  views: string;
  commentsCount: number;
  mainImage: string;
  galleryImages: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
    verified: boolean;
    date: string;
  };
  introParagraphs: string[];
  businesses: BusinessDetail[];
  tags: string[];
  recommendations: Recommendation[];
}

export const articlesData: ArticleData[] = [
  {
    id: 0,
    title: "Good Food at Your Doorstep: Explore the Best Cloud Kitchens in Indore",
    category: "Food & Dining",
    readTime: "5 Min Read",
    views: "1.2k views",
    commentsCount: 8,
    mainImage:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    ],
    author: {
      name: "Prachi Mishra",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      role: "Food Specialist & Writer",
      verified: true,
      date: "2 Jul 22",
    },
    introParagraphs: [
      "If road trip food adventures are highly prioritized by food lovers, home-delivered food is no less. It eliminates the need for a sit-down restaurant that saves on overhead costs such as rent and decor. Cloud kitchens allow creators to easily produce food with low initial investments, while offering customers to taste different cuisines. All culinary experiments can be done without any financial burden. They have reduced the way we think of dining and food delivery, somewhere details lie.",
      "The cloud kitchen is the brainchild of Travis Kalanick, the co-founder of Uber. He was inspired by the fast-paced lifestyle of the modern world that grew along with the phone market in 2013, which launched cloud kitchens, causing a revolution in the food industry. He managed the way we prepare and deliver food. The visual feel layout style represents or handles virtual restaurants, presenting a multicar format linked to the kitchen, cloud kitchens do not have a physical restaurant, space for customers to dine in. They operate solely for delivery orders. From a main restaurant, a kitchen spaces, depot, and listing functions. The concept is simpler than that, specialized on preparing delicious meals for delivery.",
      "Today, cloud kitchens are everywhere, in every city and town. Indore, being the powerhouse of delicious snacks, is also hosting the premium ones. Cloud kitchens have changed the way people of Indore have been enjoying their favourite foods. It is delicious, tasty and classic, so you get minimum time to step out and dine in. Here's where cloud kitchens comes into the picture. If you are in Indore and want to find a quick smart solution to solve your hunger pangs, then let us help with that. Check this list of the top cloud kitchens in Indore to order your favourite food right to your doorstep.",
    ],
    businesses: [
      {
        id: "fusion-cloud-kitchen",
        name: "Fusion Cloud Kitchen",
        images: [
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
        ],
        description:
          "Fusion Cloud Kitchen excels in providing authentic cuisines infused with rich flavours. This cloud kitchen takes pride in serving tasty, fresh foods. Their menu is full of options, the food is delicious, wholesome, and homemade, with values like Warmth, Trust, Taste, and more. Fusion Cloud Kitchen gets your food order with extra care, and the packaging with a personal touch adds a cherry to the cake. If you ever order food from this cloud kitchen, we recommend about the quality as they are known for serving food in decent, wholesome portions. A Google review by Dev Soulmade Academy:",
        quote:
          "It was a wonderful experience all food items is randomly ordered from them and they taste fantastic. 10/10 in everything - service, delivery, food.",
        foodRange: "To order Indian, Chinese, Italian, Salads, Sandwiches, desserts & more...",
        mustTry: "Gourmet burgers, pasta...",
        priceForTwo: "Rs 400 approx",
        timings: "12:00 am - 4:00 am and 12:00 pm - 12:00 am",
        address: "123/21, Vijay Nagar, Indore, Madhya Pradesh",
        rating: 5,
      },
      {
        id: "talwalkar-eat-out",
        name: "Talwalkar Eat Out",
        images: [
          "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        ],
        description:
          "Talwalkar Eat Out focuses on serving delicious Indian home style meals and street food snacks. If you are looking for classic Indore taste like Poha, Jalebi, samosas, and high quality lunch thalis, this is the perfect place. They use organic ingredients and make sure everything is freshly prepared. A Google review by Dev Soulmade Academy:",
        quote:
          "Extremely hygienic food. Love the taste of their specialized Poha and customized sandwiches. Highly recommended.",
        foodRange: "North Indian, Fast Food, Street Food, Beverages",
        mustTry: "Special Indori Poha, Paneer Tikka Sandwich",
        priceForTwo: "Rs 350 approx",
        timings: "8:00 am - 10:00 pm",
        address: "45, Manik Bagh Road, Indore, Madhya Pradesh",
        rating: 4.8,
      },
    ],
    tags: [
      "cloud kitchen",
      "cloud kitchen in indore",
      "best cloud kitchen in indore",
      "tiffin service in indore",
      "best tiffin service in indore",
      "food & beverage",
      "tiffin service indore",
    ],
    recommendations: [
      {
        title: "Best of the Best New Restaurants in Indore You Must Visit Right Now",
        img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80",
      },
      {
        title: "Aesthetic Cafes in Indore for Your Next Date Night or Hangout",
        img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80",
      },
      {
        title: "A Taste of Italy: Where to Find the Best Pasta & Pizza in Indore",
        img: "https://images.unsplash.com/photo-1534080391025-2776c34a4579?auto=format&fit=crop&w=150&q=80",
      },
      {
        title: "Top Bakeries in Indore: Guilt-free Cakes and Pastries for the Sweet Tooth",
        img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80",
      },
    ],
  },
  {
    id: 1,
    title: "Top 5 Interior Design Trends Transforming Modern Homes in Indore",
    category: "Home Decor",
    readTime: "5 Min Read",
    views: "980 views",
    commentsCount: 3,
    mainImage:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80",
    ],
    author: {
      name: "Kabir Mehta",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      role: "Architect & Interior Designer",
      verified: true,
      date: "14 Jun 22",
    },
    introParagraphs: [
      "Indore is seeing a major real estate boom, and with it, homeowners are moving away from traditional design templates to contemporary spaces that reflect their unique tastes. Modern design trends in Indore are striking a balance between cozy comfort and visual elegance.",
      "In this article, we outline the top 5 design trends that are dominating residential interiors in Indore, from local apartments in Vijay Nagar to villas in Bypass Road.",
    ],
    businesses: [
      {
        id: "decocraft-architects",
        name: "DecoCraft Architects",
        images: [
          "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
        ],
        description:
          "DecoCraft Architects is known for bringing minimalist European designs to Indore. They focus on clean lines, neutral colors, and maximizing natural light. Whether it's a modular kitchen or a complete living space overhaul, their attention to details is unmatched.",
        quote:
          "They turned our old 3BHK flat into a spacious, modern oasis. Highly professional team!",
        foodRange: "Services: Modular Kitchens, Living Room Decor, Complete Renovation",
        mustTry: "Minimalist Wooden Partition Designs, Hidden Storage Solutions",
        priceForTwo: "Rs. 5,000 consult fee",
        timings: "10:00 am - 7:00 pm (Mon-Sat)",
        address: "Block B, Sunrise Tower, Vijay Nagar, Indore",
        rating: 4.9,
      },
    ],
    tags: [
      "interior designer",
      "home decor indore",
      "best interior designer in indore",
      "modular kitchen indore",
      "home renovation",
    ],
    recommendations: [
      {
        title: "How to Choose the Right Wall Colors for Your Home: Expert Tips",
        img: "https://images.unsplash.com/photo-1562184560-a11b7cf7c169?auto=format&fit=crop&w=150&q=80",
      },
      {
        title: "Top 5 Furniture Markets in Indore to Buy Premium Decor on a Budget",
        img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80",
      },
    ],
  },
  {
    id: 2,
    title: "Bridal Makeup Artists in Manik Bagh Road: Best Names for Your Big Day",
    category: "Wedding Style",
    readTime: "6 Min Read",
    views: "2.1k views",
    commentsCount: 15,
    mainImage:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
    ],
    author: {
      name: "Ritu Sharma",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      role: "Bridal Stylist & Reviewer",
      verified: true,
      date: "28 May 22",
    },
    introParagraphs: [
      "Your wedding day is one of the most memorable days of your life, and looking your absolute best is non-negotiable. Bridal makeup has evolved from heavy paint to glowing, HD-ready makeovers that look natural and radiant in photos.",
      "Manik Bagh Road in Indore has become a hub for high-end beauty parlours and bridal specialists. We review the top names to book for your wedding events.",
    ],
    businesses: [
      {
        id: "glam-glow-studio",
        name: "Glam & Glow Studio",
        images: [
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        ],
        description:
          "Glam & Glow Studio, managed by senior artist Ritu Pal, is highly recommended for Airbrush and HD bridal makeup. They offer customized packages including hair styling, draping, and nail extension. They use premium international brands like MAC, NARS, and Huda Beauty.",
        quote:
          "Loved my bridal makeup! It stayed fresh all night, and I received so many compliments.",
        foodRange: "Services: Bridal Makeup, Engagement Makeup, Party Makeup, Hair styling",
        mustTry: "HD Airbrush Bridal Makeup Package",
        priceForTwo: "Rs. 15,000 onwards",
        timings: "9:00 am - 8:00 pm (Open all days)",
        address: "78, Manik Bagh Road, Opposite Canara Bank, Indore",
        rating: 5,
      },
    ],
    tags: [
      "bridal makeup",
      "makeup artist indore",
      "best makeup artist in manik bagh",
      "beauty parlour indore",
      "wedding look",
    ],
    recommendations: [
      {
        title: "Choosing Your Bridal Lehenga: Best Designers and Shops in Indore",
        img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=150&q=80",
      },
      {
        title: "Pre-Bridal Skincare Routines: When to Start & Recommended Clinics in Indore",
        img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=150&q=80",
      },
    ],
  },
];
