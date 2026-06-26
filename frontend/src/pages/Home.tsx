import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, MapPin, ChevronRight, Star, Phone,
  ArrowRight, BadgeCheck, TrendingUp, ChevronLeft, Navigation, X, Clock
} from "lucide-react";
import logoImg from "@/assets/logo.jpeg";
import heroFeatured from "@/assets/hero-featured.jpg";
import catWedding from "@/assets/cat-wedding.jpg";
import catRealestate from "@/assets/cat-realestate.jpg";
import catDoctors from "@/assets/cat-doctors.jpg";
import catRepairs from "@/assets/cat-repairs.jpg";
import catInterior from "@/assets/cat-interior.jpg";
import catDining from "@/assets/cat-dining.jpg";
import Footer from "./Footer";

import weddingBanquet from "@/assets/wedding_banquet.png";
import weddingJewellery from "@/assets/wedding_jewellery.png";
import weddingCaterer from "@/assets/wedding_caterer.png";
import beautyParlour from "@/assets/beauty_parlour.png";
import beautySpa from "@/assets/beauty_spa.png";
import beautySalon from "@/assets/beauty_salon.png";
import serviceAc from "@/assets/service_ac.png";
import serviceCar from "@/assets/service_car.png";
import serviceBike from "@/assets/service_bike.png";
import needsMovie from "@/assets/needs_movie.png";
import needsGrocery from "@/assets/needs_grocery.png";
import needsElectrician from "@/assets/needs_electrician.png";

import touristUjjain from "@/assets/tourist_ujjain.png";
import touristUdaipur from "@/assets/tourist_udaipur.png";
import touristAhmedabad from "@/assets/tourist_ahmedabad.png";
import touristNashik from "@/assets/tourist_nashik.png";
import touristJaipur from "@/assets/tourist_jaipur.png";
import touristMumbai from "@/assets/tourist_mumbai.png";

import spapoint from "@/assets/category/spapoint.png";
import tourpoint from "@/assets/category/tourpoint.png";
import jobpoint from "@/assets/category/job.png";
import servicepoint from "@/assets/category/service.png";
import educationpoint from "@/assets/category/education.png";
import healthcarepoint from "@/assets/category/healthcarepoint.png";
import hotelpoint from "@/assets/category/hotelpoint.png";
import doctorpoint from "@/assets/category/doctorpoint.png";
import garmentspoint from "@/assets/category/garmentspoint.png";
import astrologypoint from "@/assets/category/astrologypoint.png";
import productpoint from "@/assets/category/productpoint.png";
import foodpoint from "@/assets/category/foodpoint.png";
import courierpoint from "@/assets/category/courierpoint.png";
import carrentalpoint from "@/assets/category/carrentalpoint.png";

const categories = [
  { img: spapoint, label: "Spa Point" },
  { img: tourpoint, label: "Tour Point" },
  { img: jobpoint, label: "Job Point" },
  { img: servicepoint, label: "Service Point" },
  { img: educationpoint, label: "Education Point" },
  { img: healthcarepoint, label: "Health Care Point" },
  { img: hotelpoint, label: "Hotel Point" },
  { img: doctorpoint, label: "Doctor Point" },
  { img: garmentspoint, label: "Garments Point" },
  { img: astrologypoint, label: "Astrologer Point" },
  { img: productpoint, label: "Product Point" },
  { img: foodpoint, label: "Food Point" },
  { img: courierpoint, label: "Courier Point" },
  { img: carrentalpoint, label: "Car Rental Point" },
];

const subcategorySections = [
  {
    title: "Wedding Requisites",
    items: [
      { img: weddingBanquet, label: "Banquet Halls", categoryName: "Hotel Point", subcategoryName: "Banquet Halls" },
      { img: weddingJewellery, label: "Bridal Requisite", categoryName: "Garments Point", subcategoryName: "Bridal Requisite" },
      { img: weddingCaterer, label: "Caterers", categoryName: "Food Point", subcategoryName: "Caterers" },
    ],
  },
  {
    title: "Beauty & Spa",
    items: [
      { img: beautyParlour, label: "Beauty Parlours", categoryName: "Spa Point", subcategoryName: "Beauty Parlours" },
      { img: beautySpa, label: "Spa & Massages", categoryName: "Spa Point", subcategoryName: "Spa & Massages" },
      { img: beautySalon, label: "Salons", categoryName: "Spa Point", subcategoryName: "Salons" },
    ],
  },
  {
    title: "Repairs & Services",
    items: [
      { img: serviceAc, label: "AC Service", categoryName: "Service Point", subcategoryName: "AC Service" },
      { img: serviceCar, label: "Car Service", categoryName: "Service Point", subcategoryName: "Car Service" },
      { img: serviceBike, label: "Bike Service", categoryName: "Service Point", subcategoryName: "Bike Service" },
    ],
  },
  {
    title: "Daily Needs",
    items: [
      { img: needsMovie, label: "Movies", categoryName: "Product Point", subcategoryName: "Movies" },
      { img: needsGrocery, label: "Grocery", categoryName: "Product Point", subcategoryName: "Grocery" },
      { img: needsElectrician, label: "Electricians", categoryName: "Service Point", subcategoryName: "Electricians" },
    ],
  },
];

const servicesData = {
  Trending: [
    { img: catRepairs, title: "Emergency Plumbers", desc: "Verified 24/7 specialists" },
    { img: catInterior, title: "Interior Designers", desc: "Award-winning studios" },
    { img: catDoctors, title: "Doctors & Clinics", desc: "Book trusted specialists" },
    { img: catRealestate, title: "Real Estate Agents", desc: "Curated property experts" },
  ],
  Urgent: [
    { img: serviceAc, title: "AC Repair & Service", desc: "Quick fixing & maintenance" },
    { img: needsElectrician, title: "Expert Electricians", desc: "Prompt resolution of faults" },
    { img: serviceCar, title: "Car & Bike Repair", desc: "On-road breakdown assistance" },
    { img: catDoctors, title: "Urgent Medical Care", desc: "Immediate doctor consults" },
  ],
  "Near You": [
    { img: catDining, title: "Top Restaurants & Cafes", desc: "Best food options nearby" },
    { img: beautySalon, title: "Salons & Spas", desc: "Top rated local wellness" },
    { img: weddingBanquet, title: "Banquet & Marriage Halls", desc: "Stunning event spaces nearby" },
    { img: needsGrocery, title: "Grocery & Supermarkets", desc: "Fresh supplies delivered fast" },
  ],
};


const touristPlaces = [
  { img: touristUjjain, title: "Ujjain", link: "#" },
  { img: touristUdaipur, title: "Udaipur", link: "#" },
  { img: touristAhmedabad, title: "Ahmedabad", link: "#" },
  { img: touristNashik, title: "Nashik", link: "#" },
  { img: touristJaipur, title: "Jaipur", link: "#" },
  { img: touristMumbai, title: "Mumbai", link: "#" },
  { img: catInterior, title: "Pune", link: "#" },
  { img: catWedding, title: "Agra", link: "#" },
];

const recentReviews = [
  {
    id: "vishal-mega-mart",
    businessName: "Vishal Mega Mart",
    location: "South Tukoganj - Indore",
    businessImg: needsGrocery,
    userName: "Tarun pratap Singh",
    userInitial: "T",
    userColor: "from-blue-500 to-indigo-600",
    rating: 5,
    reviewText: "Vishal Mega Mart is a convenient one-stop shop for all your needs. With easily accessible locations, it offers a wide range of products at affordable prices. Whether you're looking for garments, groceries or household items, this store has it all.",
    whatsappLink: "https://wa.me/919999999999"
  },
  {
    id: "sunny-chilled-water",
    businessName: "Sunny Chilled Water",
    location: "Nandlalpura - Indore",
    businessImg: beautySpa,
    userName: "Raj kalwani",
    userInitial: "R",
    userColor: "from-emerald-500 to-teal-600",
    rating: 5,
    reviewText: "Excellent behaviour by staff and owner and excellent service. Very prompt delivery of water cans. Always reliable and highly recommended for parties and daily usage.",
    whatsappLink: "https://wa.me/919999999999"
  },
  {
    id: "riya-chilled-water",
    businessName: "Riya Chilled Water",
    location: "Agrasen Square - Indore",
    businessImg: serviceAc,
    userName: "vikash",
    userInitial: "V",
    userColor: "from-purple-500 to-fuchsia-600",
    rating: 5,
    reviewText: "They provide you the best reverse osmosis quality of water in the entire agrasen square area. They have very polite staff and many delivery vehicles to parcel your cane within your time.",
    whatsappLink: "https://wa.me/919999999999"
  },
  {
    id: "sagar-wedding-banquet",
    businessName: "Sagar Wedding Banquet",
    location: "Vijay Nagar - Indore",
    businessImg: weddingBanquet,
    userName: "Sandeep Patel",
    userInitial: "S",
    userColor: "from-amber-500 to-orange-600",
    rating: 5,
    reviewText: "Absolutely beautiful banquet hall. The catering service was superb, decorations were top-notch, and the staff was extremely professional. Made our wedding memorable!",
    whatsappLink: "https://wa.me/919999999999"
  },
  {
    id: "vogue-beauty-salon",
    businessName: "Vogue Beauty Salon",
    location: "Old Palasia - Indore",
    businessImg: beautySalon,
    userName: "Shan",
    userInitial: "S",
    userColor: "from-rose-500 to-pink-600",
    rating: 5,
    reviewText: "Very good service. Timing was perfect and the quality of facial and haircut is excellent. Pure hygienic conditions and polite behaviour of therapists.",
    whatsappLink: "https://wa.me/919999999999"
  }
];

const relatedArticles = [
  {
    title: "Good Food at Your Doorstep: Explore the Best Cloud Kitchens in Indore",
    category: "Food & Dining",
    readTime: "4 min read",
    img: catDining,
    desc: "Discover the culinary revolution sweeping Indore. From gourmet fusion to traditional home-cooked delights, explore the top-rated cloud kitchens delivering directly to your home.",
    link: "#"
  },
  {
    title: "Top 5 Interior Design Trends Transforming Modern Homes in Indore",
    category: "Home Decor",
    readTime: "5 min read",
    img: catInterior,
    desc: "Discover how modern homeowners in Indore are blending traditional heritage with contemporary minimalist styles. We highlight key design elements and tips from top local experts.",
    link: "#"
  },
  {
    title: "Bridal Makeup Artists in Manik Bagh Road: Best Names for Your Big Day",
    category: "Wedding Style",
    readTime: "6 min read",
    img: weddingJewellery,
    desc: "Your wedding day deserves nothing less than perfection. We review the most talented bridal makeup artists on Manik Bagh Road known for their flawless and elegant makeovers.",
    link: "#"
  }
];

const heroCards = [
  {
    title: "REPAIRS &\nSERVICES",
    subtitle: "Get Nearest Vendor",
    img: catRepairs,
    gradient: "from-[#1e3d75] to-[#12274d]",
    themeColor: "group-hover:text-[#1e3d75]",
    categoryName: "Service Point"
  },
  {
    title: "Hotel\npoint",
    subtitle: "Finest Agents",
    img: catRealestate,
    gradient: "from-[#635bff] to-[#483fd3]",
    themeColor: "group-hover:text-[#635bff]",
    categoryName: "Hotel Point"
  },
  {
    title: "DOCTORS",
    subtitle: "Book Now",
    img: catDoctors,
    gradient: "from-[#008f5d] to-[#006b44]",
    themeColor: "group-hover:text-[#008f5d]",
    categoryName: "Doctor Point"
  },
];

const heroSlides = [
  {
    tag: "# FEATURED SPOTLIGHT",
    title: "Discover the city's\nfinest establishments.",
    description: "Search across 5.3 crore+ verified businesses, professionals and services — curated for quality.",
    img: heroFeatured,
    categoryName: null
  },
  {
    tag: "# WEDDING REQUISITES",
    title: "Plan your dream\nwedding day with us.",
    description: "Find top-rated banquet halls, caterers, decorators, and bridal makeup services.",
    img: catWedding,
    categoryName: "Spa Point"
  },
  {
    tag: "# FOOD & DINING",
    title: "Satisfy your cravings\nwith delicious food.",
    description: "Explore the best local restaurants, cafés, fast food joints, and cloud kitchens.",
    img: catDining,
    categoryName: "Food Point"
  },
  {
    tag: "# TRAVEL & TOURS",
    title: "Explore premium\ntravel destinations.",
    description: "Book custom holiday packages, car rentals, and luxury stays effortlessly.",
    img: touristUdaipur,
    categoryName: "Tour Point"
  }
];

interface HomePageProps {
  onArticleClick: (id: number) => void;
  onReviewClick: (id: string) => void;
  onPlaceClick?: (placeName: string) => void;
  onCategoryClick?: (categoryName: string, subcategoryName?: string) => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  onAdvertiseClick?: () => void;
  username?: string | null;
}

// City-specific area data for location dropdown
const cityAreas: Record<string, { trending: string[]; recent: string[] }> = {
  Mumbai: {
    trending: ["Bandra West, Mumbai", "Andheri West, Mumbai", "Colaba, Mumbai", "Powai, Mumbai", "Juhu, Mumbai", "Worli, Mumbai", "Dadar, Mumbai"],
    recent: ["Bandra, Mumbai"]
  },
  Indore: {
    trending: ["Vijay Nagar, Indore", "Vijay Nagar Road Vijay Nagar, Indore", "Bhawar Kuan, Indore", "Khajrana, Indore", "Sudama Nagar, Indore", "Mhow, Indore", "MG Road, Indore"],
    recent: ["Chhoti Gwaltoli, Indore"]
  },
  Ujjain: {
    trending: ["Mahakal Marg, Ujjain", "Freeganj, Ujjain", "Dewas Gate, Ujjain", "Ram Ghat, Ujjain"],
    recent: []
  },
  Pune: {
    trending: ["Koregaon Park, Pune", "Viman Nagar, Pune", "Hinjewadi, Pune", "Kothrud, Pune", "Baner, Pune"],
    recent: []
  },
  Jaipur: {
    trending: ["Malviya Nagar, Jaipur", "C-Scheme, Jaipur", "Mansarovar, Jaipur", "Vaishali Nagar, Jaipur", "Tonk Road, Jaipur"],
    recent: []
  },
};

const availableCities = ["Mumbai", "Indore", "Pune", "Jaipur", "Ujjain", "Ahmedabad", "Nashik", "Udaipur"];

export default function HomePage({ onArticleClick, onReviewClick, onPlaceClick, onCategoryClick, onSignInClick, onProfileClick, onAdvertiseClick, username }: HomePageProps) {
  // UI states grouped to reduce useState count
  const [uiState, setUiState] = useState({
    showSuggestions: false,
    activeTab: "Trending" as "Trending" | "Urgent" | "Near You",
    activeSlide: 0
  });
  const { showSuggestions, activeTab, activeSlide } = uiState;
  
  // Location state grouped to reduce useState count
  const [locationState, setLocationState] = useState({
    selectedCity: "Mumbai",
    showLocationDropdown: false,
    recentLocations: (() => {
      try { return JSON.parse(localStorage.getItem("fmp_recent_locations:v1") || "[]"); } catch { return []; }
    })() as string[]
  });
  const { selectedCity, showLocationDropdown, recentLocations } = locationState;
  const locationRef = useRef<HTMLDivElement>(null);
  
  const handleSelectArea = useCallback((area: string) => {
    const updated = [area, ...recentLocations.filter(l => l !== area)].slice(0, 5);
    setLocationState(prev => ({
      ...prev,
      recentLocations: updated,
      showLocationDropdown: false
    }));
    localStorage.setItem("fmp_recent_locations:v1", JSON.stringify(updated));
  }, [recentLocations]);
  
  const handleDetectLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationState(prev => ({
            ...prev,
            selectedCity: "Mumbai",
            showLocationDropdown: false
          }));
        },
        () => {
          setLocationState(prev => ({
            ...prev,
            showLocationDropdown: false
          }));
        }
      );
    }
  }, []);
  
  // Close location dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationState(prev => ({ ...prev, showLocationDropdown: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setUiState((prev) => ({ ...prev, activeSlide: (prev.activeSlide + 1) % heroSlides.length }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  // Tourist places scroll controls
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll states grouped to reduce useState count
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true,
    canScrollReviewsLeft: false,
    canScrollReviewsRight: true
  });
  const { canScrollLeft, canScrollRight, canScrollReviewsLeft, canScrollReviewsRight } = scrollState;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollState(prev => ({
        ...prev,
        canScrollLeft: scrollLeft > 10,
        canScrollRight: scrollLeft + clientWidth < scrollWidth - 10
      }));
    }
  };

  // Recent reviews scroll controls
  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  const checkReviewsScroll = () => {
    if (reviewsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = reviewsScrollRef.current;
      setScrollState(prev => ({
        ...prev,
        canScrollReviewsLeft: scrollLeft > 10,
        canScrollReviewsRight: scrollLeft + clientWidth < scrollWidth - 10
      }));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    const rel = reviewsScrollRef.current;

    const handleScroll = () => checkScroll();
    const handleReviewsScroll = () => checkReviewsScroll();
    const handleResize = () => {
      checkScroll();
      checkReviewsScroll();
    };

    if (el) el.addEventListener("scroll", handleScroll, { passive: true });
    if (rel) rel.addEventListener("scroll", handleReviewsScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => {
      checkScroll();
      checkReviewsScroll();
    }, 100);

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
      if (rel) rel.removeEventListener("scroll", handleReviewsScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).offsetWidth
        : 280;
      const gap = 16;
      const scrollAmount = cardWidth + gap;

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollReviews = (direction: "left" | "right") => {
    if (reviewsScrollRef.current) {
      const container = reviewsScrollRef.current;
      const cardWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).offsetWidth
        : 350;
      const gap = 16;
      const scrollAmount = cardWidth + gap;

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-6">
          <a href="/" className="flex items-center">
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-8 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          <div className="relative ml-auto flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 shadow-[var(--shadow-card)] max-w-2xl">
            
            {/* Clickable Location Selector */}
            <div ref={locationRef} className="relative">
              <button
                onClick={() => setLocationState(prev => ({ ...prev, showLocationDropdown: !prev.showLocationDropdown }))}
                className="flex items-center gap-2 border-r border-border px-3 py-1.5 text-sm hover:text-primary transition-colors cursor-pointer group"
              >
                <MapPin className="h-4 w-4 text-accent group-hover:text-primary transition-colors" />
                <span className="font-semibold whitespace-nowrap">{selectedCity}</span>
                <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${showLocationDropdown ? 'rotate-90' : ''}`} />
              </button>

              {/* Location Dropdown */}
              {showLocationDropdown && (
                <div className="absolute top-[calc(100%+12px)] left-0 min-w-[340px] bg-white border border-border rounded-2xl shadow-2xl z-[60] text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/60">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Select Location</span>
                    <button onClick={() => setLocationState(prev => ({ ...prev, showLocationDropdown: false }))} className="p-1 rounded-lg hover:bg-secondary transition cursor-pointer">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="p-3 space-y-1">
                    {/* Detect Location */}
                    <button
                      onClick={handleDetectLocation}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition cursor-pointer group"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Navigation className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-blue-600">Detect My Location</span>
                    </button>

                    {/* City Switcher */}
                    <div className="pt-2 pb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-2">Switch City</p>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {availableCities.map(city => (
                          <button
                            key={city}
                            onClick={() => setLocationState(prev => ({ ...prev, selectedCity: city }))}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                              selectedCity === city
                                ? "bg-primary text-white border-primary"
                                : "bg-secondary border-border text-foreground hover:border-primary/40"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent Locations */}
                    {(recentLocations.length > 0 || (cityAreas[selectedCity]?.recent?.length ?? 0) > 0) && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between px-3 mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Locations</p>
                          {recentLocations.length > 0 && (
                            <button
                              onClick={() => { setLocationState(prev => ({ ...prev, recentLocations: [] })); localStorage.removeItem("fmp_recent_locations:v1"); }}
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >Clear All</button>
                          )}
                        </div>
                        {[...recentLocations, ...(cityAreas[selectedCity]?.recent || [])]
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .slice(0, 3)
                          .map(loc => (
                            <button
                              key={loc}
                              onClick={() => handleSelectArea(loc)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer"
                            >
                              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-[13px] font-semibold text-foreground">{loc}</span>
                            </button>
                          ))
                        }
                      </div>
                    )}

                    {/* Trending Areas */}
                    <div className="pt-2 pb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1">Trending Areas</p>
                      {(cityAreas[selectedCity]?.trending || [
                        `Central ${selectedCity}`,
                        `North ${selectedCity}`,
                        `South ${selectedCity}`
                      ]).map(area => (
                        <button
                          key={area}
                          onClick={() => handleSelectArea(area)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer"
                        >
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-[13px] font-semibold text-foreground">{area}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder={`Search doctors, restaurants, services in ${selectedCity}…`}
              className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              onFocus={() => setUiState(prev => ({ ...prev, showSuggestions: true }))}
              onBlur={() => setTimeout(() => setUiState(prev => ({ ...prev, showSuggestions: false })), 200)}
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90">
              <Search className="h-4 w-4" />
            </button>

            {showSuggestions && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-border rounded-2xl shadow-xl p-5 z-50 text-left max-h-[420px] overflow-y-auto">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  <span>Recent Searches</span>
                  <button className="text-primary hover:underline lowercase font-semibold text-xs tracking-normal">Clear All</button>
                </div>
                
                {/* Recent search item */}
                <div className="flex items-center gap-3 py-1.5 px-2 hover:bg-secondary/60 rounded-xl cursor-pointer transition-colors duration-200">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-foreground">Car Rental</span>
                    <span className="text-[11px] text-muted-foreground">Category</span>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-2 px-1">
                  Trending Searches
                </div>

                {/* Trending items */}
                {[
                  "Hostels For Women",
                  "Hostels",
                  "Gynaecologist & Obstetrician Doctors",
                  "Real Estate Agents",
                  "Dentists",
                  "Banquet Halls",
                  "Car Rental"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 py-1.5 px-2 hover:bg-secondary/60 rounded-xl cursor-pointer transition-colors duration-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground shrink-0">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-foreground">{item}</span>
                      <span className="text-[11px] text-muted-foreground">Category</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <button 
              onClick={onAdvertiseClick}
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground cursor-pointer"
            >
              Advertise
            </button>
            {!username && (
              <button 
                onClick={onSignInClick}
                className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-secondary cursor-pointer"
              >
                Sign In
              </button>
            )}
            {username && (
              <button 
                onClick={onProfileClick}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer ml-1 font-bold text-xs bg-primary"
                title="Open Profile Menu"
              >
                {username.charAt(0).toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-10">
        {/* Hero */}
        <section className="grid grid-cols-12 gap-5 items-stretch">
          <div className="group relative col-span-12 overflow-hidden rounded-3xl lg:col-span-7 min-h-[300px] lg:min-h-0 lg:h-auto">
            {heroSlides.map((slide, index) => {
              const isActive = activeSlide === index;
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <img
                    src={slide.img}
                    alt={slide.tag}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/95 via-primary/45 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground text-left">
                    <div className="mb-2.5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      {slide.tag}
                    </div>
                    <h1 className="font-serif text-2xl leading-[1.1] sm:text-3xl lg:text-3xl xl:text-4xl whitespace-pre-line mb-2">
                      {slide.title}
                    </h1>
                    <p className="max-w-md text-xs text-primary-foreground/85 leading-relaxed sm:text-sm">
                      {slide.description}
                    </p>
                    {slide.categoryName && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCategoryClick?.(slide.categoryName!);
                        }}
                        className="mt-4 w-fit bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-xs font-bold transition shadow-md cursor-pointer hover:scale-102"
                      >
                        Explore Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Navigation Dots */}
            <div className="absolute bottom-5 right-6 z-20 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setUiState(prev => ({ ...prev, activeSlide: index }))}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === index ? "w-6 bg-accent" : "w-2 bg-white/50 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Prev/Next buttons */}
            <button
              onClick={() => setUiState((prev) => ({ ...prev, activeSlide: (prev.activeSlide - 1 + heroSlides.length) % heroSlides.length }))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/25 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setUiState((prev) => ({ ...prev, activeSlide: (prev.activeSlide + 1) % heroSlides.length }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/25 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {heroCards.map((card, i) => (
              <button
                key={i}
                onClick={() => onCategoryClick?.(card.categoryName)}
                className={`group relative flex flex-col justify-between text-left overflow-hidden rounded-2xl bg-gradient-to-b ${card.gradient} p-5 text-white shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] cursor-pointer`}
              >
                {/* Text Content */}
                <div className="relative z-10">
                  <div className="whitespace-pre-line text-sm font-black tracking-wider uppercase opacity-95 sm:text-base leading-tight">
                    {card.title}
                  </div>
                  <div className="mt-1.5 text-[10px] font-medium opacity-80 leading-tight sm:text-xs">
                    {card.subtitle}
                  </div>
                </div>

                {/* Spacer */}
                <div className="mt-auto h-8" />

                {/* Arrow Button */}
                <div className="absolute left-0 bottom-5 z-20">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-r-lg bg-black/15 text-white backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:w-24 group-hover:bg-white ${card.themeColor}`}>
                    <span className="max-w-0 opacity-0 overflow-hidden text-[11px] font-bold uppercase tracking-wider transition-all duration-500 ease-in-out group-hover:max-w-16 group-hover:opacity-100 group-hover:mr-1">
                      Explore
                    </span>
                    <ChevronRight className="h-4 w-4 stroke-[3px] shrink-0" />
                  </div>
                </div>

                {/* Character/Object Cutout Image */}
                <div className="absolute bottom-[-16px] right-0 w-[92%] h-[85%] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-1">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="h-full w-full object-cover object-top mix-blend-normal opacity-95"
                    style={{
                      maskImage: "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)"
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>


        <section className="mt-8">
          <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-7">
            {categories.map(({ img, label }) => (
              <button
                key={label}
                onClick={() => onCategoryClick?.(label)}
                className="group flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="h-20 w-20 transition-all duration-300 group-hover:scale-110">
                  <img src={img} alt={label} className="h-full w-full object-contain" />
                </div>
                <span className="text-[13px] font-semibold leading-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Subcategories Grid */}
        <section className="mt-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {subcategorySections.map((sec) => (
              <div key={sec.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h3 className="text-[17px] font-bold text-foreground mb-4 pl-0.5">{sec.title}</h3>
                <div className="grid grid-cols-3 gap-5">
                  {sec.items.map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onCategoryClick?.(item.categoryName, item.subcategoryName)}
                      className="group flex flex-col items-center gap-2.5 cursor-pointer"
                    >
                      <div className="w-full aspect-[1.45] overflow-hidden rounded-xl bg-secondary shadow-sm">
                        <img
                          src={item.img}
                          alt={item.label}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <span className="text-[13px] font-medium text-foreground/80 group-hover:text-primary transition-colors duration-300 text-center leading-tight">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services / Quote section */}
        <section className="mt-20 rounded-3xl border border-border bg-card p-8 sm:p-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Popular Services</div>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Get connected in minutes</h2>
            </div>
            <div className="flex gap-2">
              {(["Trending", "Urgent", "Near You"] as const).map((t) => {
                const isActive = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setUiState(prev => ({ ...prev, activeTab: t }))}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm scale-105"
                        : "border-border text-muted-foreground bg-background hover:border-muted-foreground/60 hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div key={activeTab} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
            {servicesData[activeTab].map((s) => (
              <div key={s.title} className="group overflow-hidden rounded-2xl border border-border bg-background transition hover:shadow-[var(--shadow-elegant)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={s.img} alt={s.title} loading="lazy" width={800} height={500} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/90 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-primary-foreground">
                    <div className="font-serif text-lg leading-tight">{s.title}</div>
                    <div className="text-xs opacity-80">{s.desc}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                    Verified providers
                  </div>
                  <button className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition group-hover:bg-accent group-hover:text-accent-foreground cursor-pointer">
                    <Phone className="h-3 w-3" /> Enquire
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* Trending chips */}
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Live now</div>
              <h2 className="mt-2 font-serif text-3xl">Trending searches near you</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "Paying Guest Accommodations", "Co-working Spaces", "Tax Consultants",
              "Banquet Halls", "Cinema Halls", "Water Suppliers", "Driving Schools",
              "Packers & Movers", "Event Organisers", "Wedding Photographers",
              "Luxury Car Rental", "Yoga Classes",
            ].map((t) => (
              <button key={t} className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm transition hover:border-accent hover:bg-secondary">
                <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent" />
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Explore Top Tourist Places Section */}
        <section className="mt-20 mb-10">
          <div className="relative rounded-2xl border border-border/50 bg-card p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                Explore Top Tourist Places
              </h2>
              <span className="inline-flex items-center rounded bg-[#ff3838] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white select-none animate-pulse">
                NEW
              </span>
            </div>

            {/* Left navigation arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-[-20px] top-[55%] -translate-y-1/2 z-30 flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-foreground stroke-[2.5px]" />
              </button>
            )}

            {/* Right navigation arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-[-20px] top-[55%] -translate-y-1/2 z-30 flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-foreground stroke-[2.5px]" />
              </button>
            )}

            {/* Sliding Carousel Wrapper */}
            <div className="relative overflow-hidden w-full">
              <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 w-full no-scrollbar py-2 px-1 -mx-1"
                style={{ scrollbarWidth: "none" }}
              >
                {touristPlaces.map((place) => (
                  <div
                    key={place.title}
                    onClick={() => onPlaceClick?.(place.title)}
                    className="group flex items-center gap-6 rounded-xl border border-border/40 bg-background/20 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] snap-start shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] cursor-pointer"
                  >
                    <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-xl shadow-sm shrink-0 bg-secondary">
                      <img
                        src={place.img}
                        alt={place.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg sm:text-[20px] font-bold text-foreground/90 group-hover:text-primary transition-colors duration-300">
                        {place.title}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-sm sm:text-[15px] font-bold text-accent mt-1 transition-all duration-300 group-hover:translate-x-0.5">
                        Explore <ChevronRight className="h-3.5 w-3.5 stroke-[3px]" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity / Reviews Section */}
        <section className="mt-16 mb-16">
          <div className="relative rounded-2xl border border-border/50 bg-card p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                Recent Activity
              </h2>
              <span className="inline-flex items-center rounded bg-primary px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white select-none">
                REVIEWS
              </span>
            </div>

            {/* Left navigation arrow */}
            {canScrollReviewsLeft && (
              <button
                onClick={() => scrollReviews("left")}
                className="absolute left-[-20px] top-[55%] -translate-y-1/2 z-30 flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-foreground stroke-[2.5px]" />
              </button>
            )}

            {/* Right navigation arrow */}
            {canScrollReviewsRight && (
              <button
                onClick={() => scrollReviews("right")}
                className="absolute right-[-20px] top-[55%] -translate-y-1/2 z-30 flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-foreground stroke-[2.5px]" />
              </button>
            )}

            {/* Sliding Carousel Wrapper */}
            <div className="relative overflow-hidden w-full">
              <div
                ref={reviewsScrollRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 w-full no-scrollbar py-2 px-1 -mx-1"
                style={{ scrollbarWidth: "none" }}
              >
                {recentReviews.map((review, i) => (
                  <div
                    key={i}
                    onClick={() => onReviewClick(review.id)}
                    className="group flex flex-col justify-between rounded-2xl border border-border/40 bg-background/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-primary/20 hover:bg-card snap-start shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 p-5">
                      <div className="flex flex-col min-w-0">
                        <span className="text-base font-extrabold text-foreground tracking-tight leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                          {review.businessName}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground mt-0.5 line-clamp-1">
                          {review.location}
                        </span>
                      </div>
                      
                      {/* WhatsApp Button */}
                      <a
                        href={review.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#25d366]/30 text-[#25d366] font-bold text-[10px] rounded-lg bg-[#25d366]/5 hover:bg-[#25d366] hover:text-white hover:border-[#25d366] transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
                      >
                        <svg
                          className="h-3 w-3 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 1.968 13.91 .94 11.997.94c-5.442 0-9.867 4.371-9.871 9.8.001 1.83.483 3.61 1.398 5.183L2.5 21.082l5.147-1.33c-.007.005-.007.005 0 0zm9.967-6.758c-.31-.154-1.834-.894-2.115-.995-.28-.102-.485-.153-.687.154-.202.307-.783.995-.96 1.198-.177.205-.355.23-.665.077-1.127-.565-1.953-.972-2.73-1.637-.777-.665-1.28-1.488-1.433-1.753-.153-.307-.016-.473.138-.626.14-.138.31-.36.467-.538.153-.18.204-.307.307-.512.102-.205.05-.384-.025-.538-.077-.154-.687-1.637-.94-2.253-.247-.6-.5-.518-.688-.528-.178-.01-.383-.01-.588-.01-.205 0-.538.077-.82.384-.282.307-1.077 1.05-1.077 2.561 0 1.51 1.1 2.97 1.253 3.176.154.205 2.164 3.266 5.244 4.581.733.313 1.306.499 1.75.64.737.234 1.408.201 1.94.122.592-.088 1.834-.74 2.09-1.455.257-.717.257-1.332.18-1.456-.076-.124-.282-.201-.592-.356z" />
                        </svg>
                        WhatsApp
                      </a>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary border-y border-border/40">
                      <img
                        src={review.businessImg}
                        alt={review.businessName}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Review Info */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* User Row */}
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-inner bg-gradient-to-tr ${review.userColor}`}>
                          {review.userInitial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-foreground leading-tight">
                            {review.userName}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground mt-0.5 leading-none">
                            Wrote a review
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mt-3">
                        {Array.from({ length: review.rating }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className="h-3.5 w-3.5 text-amber-500 fill-amber-500 stroke-[1.5px]"
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-[12px] text-muted-foreground/90 mt-2.5 leading-relaxed line-clamp-3 italic flex-1">
                        "{review.reviewText}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles Section */}
        <section className="mt-16 mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-serif">
                Related Articles
              </h2>
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>
            <a
              href="#"
              className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-accent transition-all duration-300"
            >
              Explore more
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedArticles.map((article, index) => (
              <a
                key={index}
                href={article.link}
                onClick={(e) => {
                  e.preventDefault();
                  onArticleClick(index);
                }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
              >
                {/* Image Container with Tag */}
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <img
                    src={article.img}
                    alt={article.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 rounded-lg bg-black/45 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white border border-white/10 shadow-sm">
                    {article.category}
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    {article.readTime}
                  </div>
                  
                  <h3 className="font-serif text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-[13px] text-muted-foreground/80 mt-3 leading-relaxed line-clamp-3">
                    {article.desc}
                  </p>

                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-primary group-hover:text-accent transition-colors duration-300 mt-auto">
                    <span>Explore Article</span>
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* SEO Info & Download App Section */}
        <section className="mt-16 mb-16 text-left border-t border-border/40 pt-10">
          {/* Bottom Content Area: SEO Text */}
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight leading-snug">
              One-Stop for All Local Businesses, Services, & Stores Nearby Across India
            </h3>
            
            <div className="mt-5 space-y-4 text-[13px] text-muted-foreground/80 leading-relaxed font-semibold">
              <p>
                Welcome to <span className="font-extrabold text-foreground">FindmyPoint</span>, your "one stop shop" where you are assisted with day-to-day and exclusive planning and purchasing activities. We take pride in our curated search listings, advanced search filters, and the fact that we own a strong, verified hold on local business information pan India.
              </p>
              <p>
                Our service extends from providing address and contact details of business establishments around the country, to making orders and reservations for leisure, medical, financial, travel and domestic purposes. We enlist business information across varied sectors like Hotels, Restaurants, Auto Care, Home Decor, Personal and Pet Care, Fitness, Insurance, Real Estate, Sports, Schools, etc. from all over the country. Holding information right from major cities like Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Ahmedabad and Pune, our reach stretches out to other smaller cities across the country too.
              </p>
              <p>
                Our "Free Listing" feature gives a platform to showcase varied specialities. We then furnish you with the information via web and mobile application as well as create a space for you to share your experiences through our "Rate & Review" feature. Through the "Best Deals" and "Live Quotes", we make sure that you are offered the best bargains in the market.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
