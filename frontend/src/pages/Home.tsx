import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  Phone,
  ArrowRight,
  BadgeCheck,
  TrendingUp,
  ChevronLeft,
  Navigation,
  X,
  Clock,
  Bell,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowUp,
  User,
  Building2,
  Tag,
  Loader2,
  Sparkles,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import catInterior from "@/assets/cat-interior.jpg";
import catDining from "@/assets/cat-dining.jpg";
import Footer from "./Footer";
import { loadAboutData, AboutData } from "../data/aboutData";
import { useCategories } from "../context/CategoryContext";
import { getCategoryImage } from "../utils/categoryImages";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";
import { getCurrentUserLocation, reverseGeocodeCoords, calculateDistanceKm, formatDistance, loadGoogleMapsScript, geocodeLocation } from "../utils/googleMaps";
import { LazyImage } from "../components/ui/LazyImage";
import MobileSearchPage from "./MobileSearchPage";
import MobileLocationPage from "./MobileLocationPage";


import beautySpa from "@/assets/beauty_spa.png";
import serviceAc from "@/assets/service_ac.png";





// categories array exported dynamically for legacy compatibility
export const categories: any[] = [];




const touristPlaces: any[] = [];

const heroCards: any[] = [];
const heroSlides: any[] = [];

interface HomePageProps {
  onArticleClick: (id: number) => void;
  onReviewClick: (id: string) => void;
  onPlaceClick?: (placeName: string) => void;
  onCategoryClick?: (categoryName: string, subcategoryName?: string) => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  onAdvertiseClick?: () => void;
  username?: string | null;
  onShowAllCategories?: () => void;
  onLogout?: () => void;
  onEditProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onHelpClick?: () => void;
  onMyReviewsClick?: () => void;
  onSavedBusinessesClick?: () => void;
  onPrivacyPolicyClick?: () => void;
  onTermsConditionsClick?: () => void;
  onPopularServiceClick?: (id: string) => void;
  onBusinessSelect?: (id: string) => void;
}

// City-specific area data for location dropdown
const cityAreas: Record<string, { trending: string[]; recent: string[] }> = {
  Mumbai: {
    trending: [
      "Bandra West, Mumbai",
      "Andheri West, Mumbai",
      "Colaba, Mumbai",
      "Powai, Mumbai",
      "Juhu, Mumbai",
      "Worli, Mumbai",
      "Dadar, Mumbai",
    ],
    recent: ["Bandra, Mumbai"],
  },
  Indore: {
    trending: [
      "Vijay Nagar, Indore",
      "Vijay Nagar Road Vijay Nagar, Indore",
      "Bhawar Kuan, Indore",
      "Khajrana, Indore",
      "Sudama Nagar, Indore",
      "Mhow, Indore",
      "MG Road, Indore",
    ],
    recent: ["Chhoti Gwaltoli, Indore"],
  },
  Ujjain: {
    trending: [
      "Mahakal Marg, Ujjain",
      "Freeganj, Ujjain",
      "Dewas Gate, Ujjain",
      "Ram Ghat, Ujjain",
    ],
    recent: [],
  },
  Pune: {
    trending: [
      "Koregaon Park, Pune",
      "Viman Nagar, Pune",
      "Hinjewadi, Pune",
      "Kothrud, Pune",
      "Baner, Pune",
    ],
    recent: [],
  },
  Jaipur: {
    trending: [
      "Malviya Nagar, Jaipur",
      "C-Scheme, Jaipur",
      "Mansarovar, Jaipur",
      "Vaishali Nagar, Jaipur",
      "Tonk Road, Jaipur",
    ],
    recent: [],
  },
};

const availableCities = [
  "Mumbai",
  "Indore",
  "Pune",
  "Jaipur",
  "Ujjain",
  "Ahmedabad",
  "Nashik",
  "Udaipur",
];

export default function HomePage({
  onArticleClick,
  onReviewClick,
  onPlaceClick,
  onCategoryClick,
  onSignInClick,
  onProfileClick,
  onAdvertiseClick,
  username,
  onShowAllCategories,
  onLogout,
  onEditProfileClick,
  onNotificationsClick,
  onHelpClick,
  onMyReviewsClick,
  onSavedBusinessesClick,
  onPrivacyPolicyClick,
  onTermsConditionsClick,
  onPopularServiceClick,
  onBusinessSelect,
}: HomePageProps) {
  const { categories, subcategoriesData } = useCategories();

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    return `${BACKEND_ORIGIN}${img}`;
  };
  const [isMobile, setIsMobile] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [allPlaces, setAllPlaces] = useState<any[]>([]);
  const [aboutData, setAboutData] = useState<AboutData>(loadAboutData);
  const [allHeroCards, setAllHeroCards] = useState<any[]>(heroCards);
  const [allHeroSlides, setAllHeroSlides] = useState<any[]>(heroSlides);
  const [articlesFromApi, setArticlesFromApi] = useState<any[]>([]);
  const [dynamicHeroSections, setDynamicHeroSections] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<any | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("fmp_nearby_radius_km:v1");
      return saved ? parseFloat(saved) : 5;
    } catch {
      return 5;
    }
  });

  // Real-time functional search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    businesses: any[];
    categories: { category: string; subcategory?: string }[];
    touristPlaces: any[];
  }>({ businesses: [], categories: [], touristPlaces: [] });

  const [recentSearchTerms, setRecentSearchTerms] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("fmp_recent_search_terms:v1") || "[]");
    } catch {
      return [];
    }
  });

  const saveSearchTerm = (term: string) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearchTerms.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearchTerms(updated);
    localStorage.setItem("fmp_recent_search_terms:v1", JSON.stringify(updated));
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearchTerms([]);
    localStorage.removeItem("fmp_recent_search_terms:v1");
  };

  // Perform live search when searchQuery changes
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults({ businesses: [], categories: [], touristPlaces: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      const q = trimmed.toLowerCase();

      // 1. Search Categories & Subcategories
      const matchedCategories: { category: string; subcategory?: string }[] = [];
      const catList = Array.isArray(categories) ? categories : [];
      catList.forEach((catObj: any) => {
        const catName = typeof catObj === "string" ? catObj : (catObj?.label || catObj?.title || catObj?.name || "");
        if (!catName) return;

        if (catName.toLowerCase().includes(q)) {
          matchedCategories.push({ category: catName });
        }

        const subcats = subcategoriesData?.[catName] || [];
        subcats.forEach((sub: string) => {
          if (sub.toLowerCase().includes(q) && !matchedCategories.some(m => m.category === catName && m.subcategory === sub)) {
            matchedCategories.push({ category: catName, subcategory: sub });
          }
        });
      });

      // 2. Search Tourist Places
      const matchedPlaces = allPlaces.filter((p: any) =>
        p.title && p.title.toLowerCase().includes(q)
      ).slice(0, 4);

      // 3. Search Real Businesses from Backend API
      let matchedBusinesses: any[] = [];
      try {
        const res = await fetch(`${API_BASE_URL}/businesses?search=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          matchedBusinesses = json.data.slice(0, 6);
        }
      } catch (e) {
        console.error("Search API error:", e);
      }

      setSearchResults({
        businesses: matchedBusinesses,
        categories: matchedCategories.slice(0, 6),
        touristPlaces: matchedPlaces,
      });
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery, categories, subcategoriesData, allPlaces]);

  const handleSearchResultClick = (type: "business" | "category" | "place", data: any) => {
    setUiState((prev) => ({ ...prev, showSuggestions: false }));
    if (type === "business") {
      saveSearchTerm(data.name);
      if (onBusinessSelect) {
        onBusinessSelect(data.id);
      }
    } else if (type === "category") {
      saveSearchTerm(data.subcategory ? `${data.category} - ${data.subcategory}` : data.category);
      if (onCategoryClick) {
        onCategoryClick(data.category, data.subcategory);
      }
    } else if (type === "place") {
      saveSearchTerm(data.title);
      if (onPlaceClick) {
        onPlaceClick(data.title);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    saveSearchTerm(searchQuery.trim());
    setUiState((prev) => ({ ...prev, showSuggestions: false }));

    if (searchResults.businesses.length > 0) {
      handleSearchResultClick("business", searchResults.businesses[0]);
    } else if (searchResults.categories.length > 0) {
      handleSearchResultClick("category", searchResults.categories[0]);
    } else if (searchResults.touristPlaces.length > 0) {
      handleSearchResultClick("place", searchResults.touristPlaces[0]);
    } else if (onCategoryClick && categories.length > 0) {
      const firstCat =
        typeof categories[0] === "string"
          ? categories[0]
          : ((categories[0] as any)?.label || (categories[0] as any)?.name || (categories[0] as any)?.title || "Hotel Point");
      onCategoryClick(firstCat);
    }
  };

  const sectionsToRender = dynamicHeroSections;

  const resolveItemImage = (imgStr: string) => {
    if (!imgStr) return "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80";
    return imgStr;
  };

  const loadHeroData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/banners`);
      const data = await res.json();
      if (data.success) {
        const mappedSlides = data.slides.map((s: any, idx: number) => ({
          ...s,
          img: s.img || heroSlides[idx]?.img || ""
        }));
        const mappedCards = data.cards.map((c: any, idx: number) => ({
          ...c,
          img: c.img || heroCards[idx]?.img || ""
        }));
        setAllHeroCards(mappedCards);
        setAllHeroSlides(mappedSlides);
      } else {
        setAllHeroCards(heroCards);
        setAllHeroSlides(heroSlides);
      }
    } catch (e) {
      console.error("Failed to load hero data:", e);
      setAllHeroCards(heroCards);
      setAllHeroSlides(heroSlides);
    }
  };

  const loadAbout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/about`);
      const data = await res.json();
      if (data.success && data.about) {
        setAboutData(data.about);
      } else {
        setAboutData(loadAboutData());
      }
    } catch (e) {
      console.error("Failed to load about data from backend:", e);
      setAboutData(loadAboutData());
    }
  };

  const loadPlaces = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tourist-places`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((p: any) => ({
          img: p.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
          title: p.name,
          link: "#"
        }));
        setAllPlaces(mapped);
      } else {
        setAllPlaces([]);
      }
    } catch (e) {
      console.error("Failed to load tourist places:", e);
      setAllPlaces([]);
    }
  };

  useEffect(() => {
    loadHeroData();

    const handleSync = () => {
      loadHeroData();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("fmp_banners_changed", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("fmp_banners_changed", handleSync);
    };
  }, []);

  useEffect(() => {
    loadAbout();

    const handleStorage = () => {
      loadAbout();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("fmp_about_changed", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("fmp_about_changed", handleStorage);
    };
  }, []);

  useEffect(() => {
    loadPlaces();

    const handleSync = () => {
      loadPlaces();
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("fmp_places_changed", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("fmp_places_changed", handleSync);
    };
  }, []);

  // Load articles from API
  useEffect(() => {
    fetch(`${API_BASE_URL}/articles`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setArticlesFromApi(
            data.data.map((a: any) => ({
              id: a.id,
              title: a.title,
              category: a.category,
              readTime: a.readTime || "",
              img: a.mainImage || "",
              desc: a.introParagraphs?.[0] || "",
              link: "#",
            }))
          );
        }
      })
      .catch((e) => console.error("Failed to load articles:", e));
  }, []);

  // Fetch configured hero sections from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/hero-sections`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDynamicHeroSections(data.data);
        }
      })
      .catch((e) => console.error("Failed to load hero sections:", e));
  }, []);

  // Fetch recent reviews dynamically from all businesses + localStorage
  useEffect(() => {
    fetch(`${API_BASE_URL}/businesses`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAllBusinesses(data.data);
          const reviewsList: any[] = [];
          data.data.forEach((biz: any) => {
            // Get DB reviews
            const dbReviews = Array.isArray(biz.reviews) ? biz.reviews : [];

            // Get local reviews from localStorage
            let localReviews: any[] = [];
            try {
              const saved = localStorage.getItem(`fmp_custom_reviews:${biz.id}`);
              if (saved) {
                localReviews = JSON.parse(saved);
              }
            } catch (e) {
              console.error("Failed to load local reviews for", biz.id, e);
            }

            // Combine both, avoiding duplicates by userName + reviewText
            const combined = [...localReviews, ...dbReviews];
            const seen = new Set<string>();
            const uniqueReviews: any[] = [];

            combined.forEach((rev: any) => {
              const key = `${rev.userName}-${rev.reviewText}`;
              if (!seen.has(key)) {
                seen.add(key);
                uniqueReviews.push(rev);
              }
            });

            uniqueReviews.forEach((rev: any) => {
              reviewsList.push({
                id: biz.id,
                reviewId: rev._id || rev.reviewId || "",
                businessName: biz.name,
                location: biz.location,
                businessImg: biz.images?.[0] || "",
                userName: rev.userName,
                userInitial: rev.userInitial || (rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"),
                userColor: rev.userColor || "from-blue-500 to-indigo-600",
                rating: rev.rating || 5,
                reviewText: rev.reviewText,
                whatsappLink: biz.whatsapp ? `https://wa.me/${biz.whatsapp.replace(/[+\s]+/g, "")}` : "https://wa.me/919999999999",
                date: rev.date
              });
            });
          });

          // Sort reviews: newest first. We use ObjectId timestamp hex parsing first, fallback to Date string parsing.
          reviewsList.sort((a, b) => {
            const timeA = a.reviewId && a.reviewId.length === 24 ? parseInt(a.reviewId.substring(0, 8), 16) * 1000 : 0;
            const timeB = b.reviewId && b.reviewId.length === 24 ? parseInt(b.reviewId.substring(0, 8), 16) * 1000 : 0;
            if (timeA && timeB) {
              return timeB - timeA;
            }
            const dateA = a.date ? Date.parse(a.date) : 0;
            const dateB = b.date ? Date.parse(b.date) : 0;
            if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB)) {
              return dateB - dateA;
            }
            return 0;
          });

          setRecentReviews(reviewsList.slice(0, 10));
        }
      })
      .catch((e) => console.error("Failed to load recent reviews:", e));
  }, []);

  // Fetch popular services dynamically
  useEffect(() => {
    fetch(`${API_BASE_URL}/popular-services`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setPopularServices(data.data);
        }
      })
      .catch((e) => console.error("Failed to load popular services:", e));
  }, []);

  // Fetch public platform settings (dynamic nearbyRadiusKm)
  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/public-settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings?.nearbyRadiusKm) {
          setNearbyRadiusKm(data.settings.nearbyRadiusKm);
          localStorage.setItem("fmp_nearby_radius_km:v1", String(data.settings.nearbyRadiusKm));
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // UI states grouped to reduce useState count
  const [uiState, setUiState] = useState({
    showSuggestions: false,
    activeTab: "Near You" as "Near You" | "Trending" | "Urgent",
    activeSlide: 0,
  });
  const { showSuggestions, activeTab, activeSlide } = uiState;

  // User GPS Coordinates
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    try {
      const saved = localStorage.getItem("fmp_user_coords:v1");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Location state grouped to reduce useState count
  const [locationState, setLocationState] = useState({
    selectedCity: (() => {
      try {
        const savedCity = localStorage.getItem("fmp_selected_city:v1");
        if (savedCity) return savedCity;
        const saved = localStorage.getItem("fmp_user_coords:v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.shortName || parsed.area || parsed.city || "Indore";
        }
      } catch { }
      return "Indore";
    })(),
    showLocationDropdown: false,
    recentLocations: (() => {
      try {
        return JSON.parse(localStorage.getItem("fmp_recent_locations:v1") || "[]");
      } catch {
        return [];
      }
    })() as string[],
  });
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileLocation, setShowMobileLocation] = useState(false);
  const [desktopLocationQuery, setDesktopLocationQuery] = useState("");
  const [desktopOnlineLocations, setDesktopOnlineLocations] = useState<{ title: string; subtitle?: string; fullAddress: string }[]>([]);
  const [isSearchingDesktopLocation, setIsSearchingDesktopLocation] = useState(false);
  const desktopLocationDebounceRef = useRef<any>(null);

  useEffect(() => {
    const cleanQuery = desktopLocationQuery.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      setDesktopOnlineLocations([]);
      setIsSearchingDesktopLocation(false);
      return;
    }

    if (desktopLocationDebounceRef.current) {
      clearTimeout(desktopLocationDebounceRef.current);
    }

    setIsSearchingDesktopLocation(true);

    desktopLocationDebounceRef.current = setTimeout(async () => {
      try {
        const googleLoaded = await loadGoogleMapsScript();
        if (googleLoaded && (window as any).google?.maps?.places?.AutocompleteService) {
          const service = new (window as any).google.maps.places.AutocompleteService();
          service.getPlacePredictions(
            {
              input: cleanQuery,
              componentRestrictions: { country: "in" },
            },
            (predictions: any[], status: string) => {
              if (status === "OK" && predictions && predictions.length > 0) {
                const results = predictions.map((p) => ({
                  title: p.structured_formatting?.main_text || p.description,
                  subtitle: p.structured_formatting?.secondary_text || "",
                  fullAddress: p.description || p.structured_formatting?.main_text,
                }));
                setDesktopOnlineLocations(results);
                setIsSearchingDesktopLocation(false);
                return;
              }
              fetchDesktopOsm(cleanQuery);
            }
          );
          return;
        }

        await fetchDesktopOsm(cleanQuery);
      } catch (err) {
        console.warn("Desktop location search error:", err);
        setIsSearchingDesktopLocation(false);
      }
    }, 280);

    return () => {
      if (desktopLocationDebounceRef.current) clearTimeout(desktopLocationDebounceRef.current);
    };
  }, [desktopLocationQuery]);

  const fetchDesktopOsm = async (q: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=in&addressdetails=1&limit=8`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const results = data.map((item: any) => {
          const addr = item.address || {};
          const mainTitle =
            addr.suburb ||
            addr.neighbourhood ||
            addr.city_district ||
            addr.city ||
            addr.town ||
            addr.village ||
            item.name ||
            q;
          const secondary = [
            addr.city || addr.town || addr.county,
            addr.state,
          ]
            .filter(Boolean)
            .join(", ");

          return {
            title: mainTitle,
            subtitle: secondary || item.display_name,
            fullAddress: secondary ? `${mainTitle}, ${secondary}` : item.display_name,
          };
        });
        setDesktopOnlineLocations(results);
      } else {
        setDesktopOnlineLocations([]);
      }
    } catch {
      setDesktopOnlineLocations([]);
    } finally {
      setIsSearchingDesktopLocation(false);
    }
  };

  const filteredDesktopLocations = useMemo(() => {
    const q = desktopLocationQuery.trim().toLowerCase();
    if (!q) return [];
    const all = [
      "Vijay Nagar, Indore",
      "Bhawar Kuan, Indore",
      "Khajrana, Indore",
      "Sudama Nagar, Indore",
      "Mhow, Indore",
      "MG Road, Indore",
      "New Palasia, Indore",
      "Kanadia Road, Indore",
      "Rau, Indore",
      "Navlakha, Indore",
      "Old Palasia, Indore",
      "Annapurna, Indore",
      "Rajwada, Indore",
      "Geeta Bhawan, Indore",
      "Sapna Sangeeta, Indore",
      "AB Road, Indore",
      "Scheme 54, Indore",
      "Scheme 78, Indore",
      "Mahalaxmi Nagar, Indore",
      "Chhoti Gwaltoli, Indore",
      "Bada Sarafa, Indore",
      "LIG Colony, Indore",
      "Bypass Road, Indore",
      "Airport Road, Indore",
      "Bicholi Mardana, Indore",
      "Super Corridor, Indore",
      "Khandwa Road, Indore",
      "Indore, Madhya Pradesh",
      "Bhopal, Madhya Pradesh",
      "Ujjain, Madhya Pradesh",
      "Dewas, Madhya Pradesh",
      "Gwalior, Madhya Pradesh",
      "Jabalpur, Madhya Pradesh",
      "Ratlam, Madhya Pradesh",
      "Khandwa, Madhya Pradesh",
      "Pithampur, Madhya Pradesh",
      "Sagar, Madhya Pradesh",
      "Satna, Madhya Pradesh",
      "Rewa, Madhya Pradesh",
      "Mumbai, Maharashtra",
      "Pune, Maharashtra",
      "Nagpur, Maharashtra",
      "Delhi, NCR",
      "New Delhi, NCR",
      "Noida, Uttar Pradesh",
      "Gurgaon, Haryana",
      "Bangalore, Karnataka",
      "Hyderabad, Telangana",
      "Chennai, Tamil Nadu",
      "Kolkata, West Bengal",
      "Ahmedabad, Gujarat",
      "Surat, Gujarat",
      "Jaipur, Rajasthan",
      "Lucknow, Uttar Pradesh",
      "Goa",
    ];
    return Array.from(new Set(all)).filter((loc) => loc.toLowerCase().includes(q)).slice(0, 8);
  }, [desktopLocationQuery]);

  const { selectedCity, showLocationDropdown, recentLocations } = locationState;
  const locationRef = useRef<HTMLDivElement>(null);

  const handleSelectArea = useCallback(
    async (area: string) => {
      const updated = [area, ...recentLocations.filter((l) => l !== area)].slice(0, 5);
      setLocationState((prev) => ({
        ...prev,
        selectedCity: area,
        recentLocations: updated,
        showLocationDropdown: false,
      }));
      localStorage.setItem("fmp_recent_locations:v1", JSON.stringify(updated));
      localStorage.setItem("fmp_selected_city:v1", area);

      // Dynamically forward-geocode the chosen location without mock data
      try {
        const coords = await geocodeLocation(area);
        if (coords) {
          setUserCoords(coords);
          localStorage.setItem(
            "fmp_user_coords:v1",
            JSON.stringify({ ...coords, city: area, shortName: area })
          );
        }
      } catch (err) {
        console.warn("Dynamic geocode error for area:", area, err);
      }
    },
    [recentLocations],
  );

  const [detectingGps, setDetectingGps] = useState(false);

  const handleDetectLocation = useCallback(async () => {
    setDetectingGps(true);
    try {
      const pos = await getCurrentUserLocation();
      if (!pos) {
        setDetectingGps(false);
        return;
      }

      const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
      const detectedCity = geocoded?.city || "Indore";
      const detectedArea = geocoded?.area || "";
      const shortName = geocoded?.shortName || (detectedArea ? `${detectedArea}, ${detectedCity}` : detectedCity);
      const fullAddress = geocoded?.formattedAddress || shortName;

      setUserCoords({ lat: pos.lat, lng: pos.lng });
      localStorage.setItem(
        "fmp_user_coords:v1",
        JSON.stringify({
          lat: pos.lat,
          lng: pos.lng,
          city: detectedCity,
          area: detectedArea,
          shortName,
          formattedAddress: fullAddress,
        })
      );

      setLocationState((prev) => {
        const updatedRecent = [shortName, ...prev.recentLocations.filter((l) => l !== shortName)].slice(0, 5);
        localStorage.setItem("fmp_recent_locations:v1", JSON.stringify(updatedRecent));
        localStorage.setItem("fmp_selected_city:v1", shortName);
        return {
          ...prev,
          selectedCity: shortName,
          recentLocations: updatedRecent,
          showLocationDropdown: false,
        };
      });
    } catch (err) {
      console.error("[Home] Failed to detect location:", err);
    } finally {
      setDetectingGps(false);
    }
  }, []);

  // Auto-detect live GPS location on initial visit
  useEffect(() => {
    const saved = localStorage.getItem("fmp_user_coords:v1");
    if (!saved && typeof navigator !== "undefined" && navigator.geolocation) {
      handleDetectLocation();
    }
  }, [handleDetectLocation]);

  // Close location dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationState((prev) => ({ ...prev, showLocationDropdown: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setUiState((prev) => ({ ...prev, activeSlide: (prev.activeSlide + 1) % allHeroSlides.length }));
    }, 5000);
    return () => clearInterval(timer);
  }, [allHeroSlides.length]);

  // Tourist places scroll controls
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll states grouped to reduce useState count
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true,
    canScrollReviewsLeft: false,
    canScrollReviewsRight: true,
  });
  const { canScrollLeft, canScrollRight, canScrollReviewsLeft, canScrollReviewsRight } =
    scrollState;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setScrollState((prev) => ({
        ...prev,
        canScrollLeft: scrollLeft > 10,
        canScrollRight: scrollLeft + clientWidth < scrollWidth - 10,
      }));
    }
  };

  // Recent reviews scroll controls
  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  const checkReviewsScroll = () => {
    if (reviewsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = reviewsScrollRef.current;
      setScrollState((prev) => ({
        ...prev,
        canScrollReviewsLeft: scrollLeft > 10,
        canScrollReviewsRight: scrollLeft + clientWidth < scrollWidth - 10,
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

  const activeServices = useMemo(() => {
    return popularServices.filter((s) => s.tab === activeTab);
  }, [popularServices, activeTab]);

  // Compute businesses within dynamic radius (strictly respects admin configured radius e.g. 3 KM)
  const nearbyBusinesses = useMemo(() => {
    if (!Array.isArray(allBusinesses) || allBusinesses.length === 0) return [];

    const uLat = userCoords?.lat;
    const uLng = userCoords?.lng;
    const radiusLimit = Number(nearbyRadiusKm) > 0 ? Number(nearbyRadiusKm) : 5;
    const curLoc = (selectedCity || "").toLowerCase().trim();

    const withDistance = allBusinesses.map((biz: any) => {
      const bLat = parseFloat(biz.latitude || biz.lat);
      const bLng = parseFloat(biz.longitude || biz.lng);

      let distanceKm = 9999;
      let hasExactDistance = false;

      if (uLat && uLng && !isNaN(bLat) && !isNaN(bLng) && bLat !== 0 && bLng !== 0) {
        distanceKm = calculateDistanceKm(uLat, uLng, bLat, bLng);
        hasExactDistance = true;
      } else {
        const bizLoc = (biz.location || biz.address || biz.cityTown || "").toLowerCase();
        if (bizLoc && curLoc && (bizLoc.includes(curLoc) || curLoc.includes(bizLoc))) {
          distanceKm = 1.0;
          hasExactDistance = true;
        }
      }

      return {
        ...biz,
        distanceKm,
        hasExactDistance,
        formattedDistance: hasExactDistance ? formatDistance(distanceKm) : "",
      };
    });

    // STRICT: Only return businesses that are legitimately within the specified radius
    const withinRadius = withDistance.filter((biz) => biz.hasExactDistance && biz.distanceKm <= radiusLimit);
    withinRadius.sort((a, b) => a.distanceKm - b.distanceKm);

    return withinRadius;
  }, [allBusinesses, userCoords, selectedCity, nearbyRadiusKm]);

  const resolveServiceImage = (imgStr?: string) => {
    if (!imgStr) return "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80";
    if (imgStr.startsWith("data:") || imgStr.startsWith("http")) return imgStr;
    return `${BACKEND_ORIGIN}${imgStr}`;
  };

  // Render Full-Screen Mobile Location Page (Priority so it opens from Search or Home)
  if (showMobileLocation) {
    return (
      <MobileLocationPage
        onBack={() => setShowMobileLocation(false)}
        selectedCity={selectedCity}
        onSelectLocation={(location) => {
          handleSelectArea(location);
          setShowMobileLocation(false);
        }}
      />
    );
  }

  // Render Full-Screen Mobile Search Page
  if (showMobileSearch) {
    return (
      <MobileSearchPage
        onBack={() => setShowMobileSearch(false)}
        selectedCity={selectedCity}
        onOpenLocation={() => setShowMobileLocation(true)}
        onBusinessSelect={(id) => {
          setShowMobileSearch(false);
          onBusinessSelect?.(id);
        }}
        onCategorySelect={(categoryName, subcategoryName) => {
          setShowMobileSearch(false);
          onCategoryClick?.(categoryName, subcategoryName);
        }}
        onPlaceSelect={(placeName) => {
          setShowMobileSearch(false);
          onPlaceClick?.(placeName);
        }}
        allBusinesses={allBusinesses}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex flex-col lg:flex-row h-auto lg:h-20 max-w-7xl items-stretch lg:items-center gap-3 lg:gap-8 px-4 md:px-6 py-3 lg:py-0 w-full">
          {/* Mobile Top Navigation Row (Profile, Logo, Bell) */}
          <div className="flex items-center justify-between lg:contents w-full">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center shrink-0"
            >
              <LazyImage
                src={logoImg}
                alt="FindMyPoint Logo"
                priority={true}
                showSkeleton={false}
                className="h-6 md:h-8 w-auto shrink-0"
                imgClassName="h-6 md:h-8 w-auto object-contain shrink-0"
                style={{ mixBlendMode: "multiply" }}
              />
            </a>

            {/* Right: Notification Bell */}
            <div className="lg:hidden shrink-0 flex items-center gap-2">
              <button
                onClick={() => onNotificationsClick?.()}
                className="relative flex h-8.5 w-8.5 items-center justify-center text-foreground hover:text-primary transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5 text-foreground/85" />
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-accent" />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 w-full items-center gap-1.5 md:gap-2 rounded-full border border-border bg-card px-2 py-1 md:py-1.5 shadow-[var(--shadow-card)] max-w-3xl">
            {/* Clickable Location Selector (hidden on mobile, visible on tablet/desktop) */}
            <div ref={locationRef} className="hidden sm:block relative shrink-0">
              <button
                onClick={() =>
                  setLocationState((prev) => ({
                    ...prev,
                    showLocationDropdown: !prev.showLocationDropdown,
                  }))
                }
                title={`Current Location: ${selectedCity}`}
                className="flex items-center gap-1.5 md:gap-2 border-r border-border pl-1.5 pr-2.5 md:px-3.5 py-1 text-xs md:text-sm hover:text-primary transition-colors cursor-pointer group max-w-[180px] sm:max-w-[280px] md:max-w-[340px]"
              >
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-accent group-hover:text-primary transition-colors shrink-0" />
                <span className="font-semibold truncate">
                  {detectingGps ? "Detecting..." : selectedCity}
                </span>
                <ChevronRight
                  className={`h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${showLocationDropdown ? "rotate-90" : ""}`}
                />
              </button>

              {/* Location Dropdown */}
              {showLocationDropdown && (
                <div className="fixed inset-x-4 top-20 sm:absolute sm:top-[calc(100%+12px)] sm:left-0 sm:min-w-[360px] sm:w-auto bg-white border border-border rounded-2xl shadow-2xl z-[60] text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Location Search Bar Header */}
                  <div className="p-3 border-b border-border/60 bg-secondary/30">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={desktopLocationQuery}
                        onChange={(e) => setDesktopLocationQuery(e.target.value)}
                        placeholder="Search city, area or locality..."
                        className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground text-foreground min-w-0"
                        autoFocus
                      />
                      {isSearchingDesktopLocation && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                      )}
                      {desktopLocationQuery && !isSearchingDesktopLocation && (
                        <button
                          type="button"
                          onClick={() => setDesktopLocationQuery("")}
                          className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setLocationState((prev) => ({ ...prev, showLocationDropdown: false }));
                          setDesktopLocationQuery("");
                        }}
                        className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition cursor-pointer shrink-0"
                        title="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {desktopLocationQuery.trim() ? (
                    /* CASE 1: Query is Active (Live Filtered Locations) */
                    <div className="p-2 max-h-[320px] overflow-y-auto no-scrollbar space-y-1">
                      {/* Live API Results */}
                      {desktopOnlineLocations.length > 0 &&
                        desktopOnlineLocations.map((item, idx) => (
                          <button
                            key={`api-${idx}`}
                            type="button"
                            onClick={() => {
                              handleSelectArea(item.fullAddress || item.title);
                              setDesktopLocationQuery("");
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer text-left group"
                          >
                            <MapPin className="h-3.5 w-3.5 text-accent shrink-0 group-hover:text-primary" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}

                      {/* Local Matches */}
                      {filteredDesktopLocations.length > 0 &&
                        filteredDesktopLocations.map((loc, idx) => (
                          <button
                            key={`loc-${idx}`}
                            type="button"
                            onClick={() => {
                              handleSelectArea(loc);
                              setDesktopLocationQuery("");
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer text-left group"
                          >
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary" />
                            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {loc}
                            </span>
                          </button>
                        ))}

                      {!isSearchingDesktopLocation &&
                        desktopOnlineLocations.length === 0 &&
                        filteredDesktopLocations.length === 0 && (
                          <div className="py-6 text-center text-xs text-muted-foreground">
                            No locations found for "{desktopLocationQuery}"
                          </div>
                        )}
                    </div>
                  ) : (
                    /* CASE 2: Query is Empty -> Detect Location, Recent & Trending */
                    <div className="p-3 space-y-1 max-h-[380px] overflow-y-auto no-scrollbar">
                      {/* Detect Location Button */}
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingGps}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-900/50 transition cursor-pointer group disabled:opacity-60"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
                          <Navigation className={`h-4 w-4 fill-current ${detectingGps ? "animate-spin" : ""}`} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-black text-blue-700 dark:text-blue-300">
                            {detectingGps ? "Detecting Live Location..." : "Refresh Live GPS Location"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Auto-detects your current address & neighborhood
                          </span>
                        </div>
                      </button>

                      {/* Recent Locations */}
                      {(recentLocations.length > 0 ||
                        (cityAreas[selectedCity]?.recent?.length ?? 0) > 0) && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between px-3 mb-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Recent Locations
                              </p>
                              {recentLocations.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLocationState((prev) => ({ ...prev, recentLocations: [] }));
                                    localStorage.removeItem("fmp_recent_locations:v1");
                                  }}
                                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                >
                                  Clear All
                                </button>
                              )}
                            </div>
                            {[...recentLocations, ...(cityAreas[selectedCity]?.recent || [])]
                              .filter((v, i, a) => a.indexOf(v) === i)
                              .slice(0, 3)
                              .map((loc) => (
                                <button
                                  key={loc}
                                  type="button"
                                  onClick={() => handleSelectArea(loc)}
                                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer"
                                >
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-[13px] font-semibold text-foreground">
                                    {loc}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}

                      {/* Trending Areas */}
                      <div className="pt-2 pb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1">
                          Trending Areas
                        </p>
                        {(
                          cityAreas[selectedCity]?.trending || [
                            `Central ${selectedCity}`,
                            `North ${selectedCity}`,
                            `South ${selectedCity}`,
                          ]
                        ).map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => handleSelectArea(area)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer"
                          >
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-[13px] font-semibold text-foreground">{area}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Trigger Button (Clicking opens full-screen MobileSearchPage) */}
            <button
              type="button"
              onClick={() => setShowMobileSearch(true)}
              className="sm:hidden flex flex-1 items-center gap-2 px-1 py-1 text-xs text-muted-foreground w-full cursor-pointer text-left"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <Search className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-foreground/75">
                Search businesses, categories, services in {selectedCity}…
              </span>
            </button>

            {/* Desktop Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 items-center min-w-0 gap-1.5 md:gap-2">
              <button
                type="submit"
                className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 shrink-0 cursor-pointer"
                title="Search"
              >
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
                )}
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search businesses, categories, services in ${selectedCity}…`}
                className="flex-1 bg-transparent px-1 md:px-2 py-1 text-xs md:text-sm outline-none placeholder:text-muted-foreground w-0 min-w-0"
                onFocus={() => setUiState((prev) => ({ ...prev, showSuggestions: true }))}
                onBlur={() =>
                  setTimeout(() => setUiState((prev) => ({ ...prev, showSuggestions: false })), 250)
                }
              />
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 text-left max-h-[460px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {/* CASE 1: Query is Active (Live Results) */}
                {searchQuery.trim().length > 0 ? (
                  <div className="space-y-4">
                    {/* 1. Businesses Section */}
                    {searchResults.businesses.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Verified Businesses ({searchResults.businesses.length})</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.businesses.map((biz) => (
                            <div
                              key={biz.id}
                              onClick={() => handleSearchResultClick("business", biz)}
                              className="flex items-center gap-3 p-2 hover:bg-secondary/70 rounded-xl cursor-pointer transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-border/60">
                                <LazyImage
                                  src={biz.images?.[0] || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=150&q=80"}
                                  alt={biz.name}
                                  className="h-full w-full"
                                  imgClassName="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                    {biz.name}
                                  </span>
                                  {biz.isVerified && (
                                    <BadgeCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {biz.category?.split(">")[0]?.trim()} · {biz.location || biz.address}
                                </p>
                              </div>
                              {biz.rating ? (
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                                  ★ {biz.rating}
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Categories & Subcategories Section */}
                    {searchResults.categories.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          <Tag className="h-3.5 w-3.5 text-blue-500" />
                          <span>Categories & Services</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.categories.map((c, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSearchResultClick("category", c)}
                              className="flex items-center gap-3 py-2 px-2.5 hover:bg-secondary/70 rounded-xl cursor-pointer transition-colors group"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                                <Search className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                  {c.subcategory ? `${c.subcategory}` : c.category}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  In {c.category}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Tourist Places Section */}
                    {searchResults.touristPlaces.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                          <span>Destinations</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.touristPlaces.map((place, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSearchResultClick("place", place)}
                              className="flex items-center gap-3 p-2 hover:bg-secondary/70 rounded-xl cursor-pointer transition-colors group"
                            >
                              <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0">
                                <LazyImage
                                  src={place.img}
                                  alt={place.title}
                                  className="h-full w-full"
                                  imgClassName="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate block">
                                  {place.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  Tourist Destination
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results state */}
                    {!isSearching &&
                      searchResults.businesses.length === 0 &&
                      searchResults.categories.length === 0 &&
                      searchResults.touristPlaces.length === 0 && (
                        <div className="py-8 text-center">
                          <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                          <p className="text-xs font-bold text-foreground">
                            No matches found for "{searchQuery}"
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Try searching for a business name, service, or locality
                          </p>
                        </div>
                      )}
                  </div>
                ) : (
                  /* CASE 2: Empty Query (Recent & Real Trending Categories) */
                  <div className="space-y-3">
                    {/* Recent Searches */}
                    {recentSearchTerms.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2 px-1">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" /> Recent Searches
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-primary hover:underline lowercase font-bold text-xs tracking-normal cursor-pointer"
                          >
                            clear all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {recentSearchTerms.map((term, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSearchQuery(term)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold transition border border-border/60 cursor-pointer"
                            >
                              <Search className="h-3 w-3 text-muted-foreground" />
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Real Dynamic Categories (Zero Dummy Data) */}
                    <div>
                      <div className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mt-2 mb-2 px-1 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Explore Popular Categories</span>
                      </div>
                      <div className="space-y-1">
                        {(Array.isArray(categories) ? categories.slice(0, 7) : []).map((catItem: any, idx: number) => {
                          const catTitle = typeof catItem === "string" ? catItem : (catItem?.label || catItem?.title || catItem?.name || "");
                          if (!catTitle) return null;

                          return (
                            <div
                              key={idx}
                              onClick={() => handleSearchResultClick("category", { category: catTitle })}
                              className="flex items-center gap-3 py-2 px-2 hover:bg-secondary/70 rounded-xl cursor-pointer transition-colors group"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <TrendingUp className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                  {catTitle}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  Browse verified listings
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-3 sm:pt-10 w-full pb-0 sm:pb-0">
        {/* Promo Banner — mobile only */}
        {allHeroSlides.length > 0 && (
          <section className="block sm:hidden mb-4">
            {/* Mobile Hero Slideshow */}
            <div className="relative w-full overflow-hidden rounded-2xl shadow-lg" style={{ height: "160px" }}>
              {allHeroSlides.map((slide, index) => {
                const isActive = activeSlide === index;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                  >
                    <LazyImage
                      src={getImageUrl(slide.img)}
                      alt={slide.tag || "Hero Slide"}
                      priority={index === 0}
                      className="absolute inset-0 h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 via-primary/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 text-primary-foreground">
                      {slide.tag && (
                        <div className="mb-1.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-accent">
                          {slide.tag}
                        </div>
                      )}
                      <h2 className="font-serif text-lg leading-tight whitespace-pre-line mb-1.5">
                        {slide.title}
                      </h2>
                      <p className="text-[11px] text-primary-foreground/80 leading-relaxed line-clamp-2">
                        {slide.description}
                      </p>
                      {slide.categoryName && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategoryClick?.(slide.categoryName!);
                          }}
                          className="mt-3 w-fit bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-full text-[11px] font-bold transition shadow cursor-pointer"
                        >
                          Explore Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Navigation Dots */}
              {allHeroSlides.length > 1 && (
                <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
                  {allHeroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setUiState((prev) => ({ ...prev, activeSlide: index }))}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === index ? "w-5 bg-accent" : "w-1.5 bg-white/50"
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Hero */}
        {(allHeroSlides.length > 0 || allHeroCards.length > 0) && (
          <section className="hidden sm:grid grid-cols-12 gap-5 items-stretch">
            {allHeroSlides.length > 0 && (
              <div className={`group relative col-span-12 overflow-hidden rounded-3xl ${allHeroCards.length > 0 ? "lg:col-span-7" : ""
                } min-h-[190px] lg:min-h-[250px]`}>
                {allHeroSlides.map((slide, index) => {
                  const isActive = activeSlide === index;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                        }`}
                    >
                      <LazyImage
                        src={getImageUrl(slide.img)}
                        alt={slide.tag || "Hero Slide"}
                        priority={index === 0}
                        className="absolute inset-0 h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/95 via-primary/45 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground text-left">
                        {slide.tag && (
                          <div className="mb-2.5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                            {slide.tag}
                          </div>
                        )}
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
                {allHeroSlides.length > 1 && (
                  <div className="absolute bottom-5 right-6 z-20 flex gap-2">
                    {allHeroSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setUiState((prev) => ({ ...prev, activeSlide: index }))}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === index ? "w-6 bg-accent" : "w-2 bg-white/50 hover:bg-white"
                          }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}


              </div>
            )}

            {allHeroCards.length > 0 && (
              <div className={`col-span-12 ${allHeroSlides.length > 0 ? "lg:col-span-5" : ""
                } grid grid-cols-1 sm:grid-cols-3 gap-4`}>
                {allHeroCards.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => onCategoryClick?.(card.categoryName)}
                    className={`group relative flex flex-col justify-between text-left overflow-hidden rounded-2xl bg-gradient-to-b ${card.gradient} p-5 text-white shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 min-h-[130px] sm:min-h-[170px] md:min-h-[190px] cursor-pointer`}
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
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-r-lg bg-black/15 text-white backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:w-24 group-hover:bg-white ${card.themeColor}`}
                      >
                        <span className="max-w-0 opacity-0 overflow-hidden text-[11px] font-bold uppercase tracking-wider transition-all duration-500 ease-in-out group-hover:max-w-16 group-hover:opacity-100 group-hover:mr-1">
                          Explore
                        </span>
                        <ChevronRight className="h-4 w-4 stroke-[3px] shrink-0" />
                      </div>
                    </div>

                    {/* Character/Object Cutout Image */}
                    {card.img && (
                      <div className="absolute bottom-[-16px] right-0 w-[92%] h-[85%] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-1">
                        <LazyImage
                          src={getImageUrl(card.img)}
                          alt={card.title}
                          priority={true}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover object-top mix-blend-normal opacity-95"
                          style={{
                            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                            WebkitMaskImage:
                              "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mt-3 sm:mt-8">
          <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-7 sm:gap-x-4 sm:gap-y-8">
            {(!isMobile || isCategoriesExpanded ? categories : categories.slice(0, 11)).map(
              ({ img, label }) => (
                <button
                  key={label}
                  onClick={() => onCategoryClick?.(label)}
                  className="group flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="h-11 w-11 sm:h-20 sm:w-20 transition-all duration-300 group-hover:scale-110">
                    <LazyImage
                      src={getCategoryImage(label, img)}
                      alt={label}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] sm:text-[13px] font-semibold leading-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">
                    {label}
                  </span>
                </button>
              ),
            )}
            {isMobile && !isCategoriesExpanded && (
              <button
                onClick={onShowAllCategories}
                className="group flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-in fade-in zoom-in duration-200"
              >
                <div className="h-11 w-11 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-foreground shadow-sm transition-all duration-300 group-hover:scale-110">
                  <ChevronDown className="h-5 w-5 text-accent stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold leading-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">
                  Show More
                </span>
              </button>
            )}
            {isMobile && isCategoriesExpanded && (
              <button
                onClick={() => setIsCategoriesExpanded(false)}
                className="group flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-in fade-in zoom-in duration-200"
              >
                <div className="h-11 w-11 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-foreground shadow-sm transition-all duration-300 group-hover:scale-110">
                  <ChevronUp className="h-5 w-5 text-accent stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold leading-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">
                  Show Less
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Subcategories Grid */}
        <section className="mt-4 sm:mt-8 md:mt-10">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
            {sectionsToRender.map((sec, secIdx) => (
              <div
                key={sec._id || `${sec.title}-${secIdx}`}
                className="rounded-2xl border-none sm:border border-border/60 bg-transparent sm:bg-card p-1 sm:p-6 shadow-none sm:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <h3 className="text-base sm:text-[17px] font-bold text-foreground mb-1.5 sm:mb-4 pl-0.5">
                  {sec.title}
                </h3>
                <div className="grid grid-cols-3 gap-5">
                  {sec.items.map((item: any, itemIdx: number) => (
                    <div
                      key={item._id || `${item.label}-${itemIdx}`}
                      onClick={() => onCategoryClick?.(item.categoryName, item.subcategoryName)}
                      className="group flex flex-col items-center gap-1.5 sm:gap-2.5 cursor-pointer"
                    >
                      <LazyImage
                        src={resolveItemImage(item.img)}
                        alt={item.label}
                        className="w-full aspect-[1.45] overflow-hidden rounded-xl bg-secondary shadow-sm"
                        imgClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
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
        <section className="mt-4 sm:mt-8 md:mt-10 rounded-3xl border-none sm:border border-border bg-transparent sm:bg-card p-1 sm:p-6 md:p-8">
          <div className="mb-4 sm:mb-6 flex flex-row items-center justify-between gap-2 w-full">
            <div>
              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-accent whitespace-nowrap">
                Popular Services
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              {(["Near You", "Trending"] as const).map((t) => {
                const isActive = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setUiState((prev) => ({ ...prev, activeTab: t }))}
                    className={`rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold cursor-pointer transition-all duration-300 ${isActive
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

          <div className="relative overflow-hidden -mx-4 sm:mx-0">
            <div
              key={activeTab}
              className="flex sm:grid overflow-x-auto sm:overflow-x-visible scroll-smooth sm:scroll-auto gap-1.5 sm:gap-5 w-full no-scrollbar sm:grid-cols-2 lg:grid-cols-4 py-2 px-4 sm:px-0 sm:p-0 sm:m-0 animate-fade-in-up"
              style={{ scrollbarWidth: "none" }}
            >
              {activeTab === "Near You" ? (
                nearbyBusinesses.length === 0 ? (
                  <div className="col-span-4 py-10 text-center text-muted-foreground italic text-xs w-full flex flex-col items-center justify-center gap-2">
                    <MapPin className="h-8 w-8 text-rose-500/40" />
                    <span>No businesses found within {nearbyRadiusKm} km of {selectedCity || "your location"}.</span>
                  </div>
                ) : (
                  nearbyBusinesses.map((biz: any) => {
                    const bizHref = biz.canonicalUrl || (biz.citySlug && biz.localitySlug && biz.slug ? `/${biz.citySlug}/${biz.localitySlug}/${biz.slug}` : `/business/${biz.id || biz._id}`);
                    return (
                      <a
                        key={biz._id || biz.id}
                        href={bizHref}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onBusinessSelect) {
                            onBusinessSelect(bizHref);
                          } else if (onCategoryClick) {
                            onCategoryClick(biz.category);
                          }
                        }}
                        className="group overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-background transition hover:shadow-[var(--shadow-elegant)] shrink-0 w-[45%] sm:w-full cursor-pointer flex flex-col justify-between block no-underline text-inherit"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                          <LazyImage
                            src={resolveItemImage(biz.images?.[0])}
                            alt={biz.name}
                            fallbackSrc="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                            className="h-full w-full"
                            imgClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />

                          {/* Rating Badge on top right */}
                          {biz.rating && (
                            <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
                              <Star className="h-2.5 w-2.5 fill-white stroke-none" />
                              <span>{biz.rating}</span>
                            </div>
                          )}

                          {/* Desktop View Overlay */}
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/95 to-transparent hidden sm:block" />
                          <div className="absolute bottom-3 left-4 right-4 text-primary-foreground hidden sm:block">
                            <div className="font-serif text-base lg:text-lg leading-tight font-bold truncate">{biz.name}</div>
                            <div className="text-xs opacity-90 mt-0.5 truncate">{biz.categoryLine || biz.category || "Local Business"}</div>
                          </div>
                        </div>

                        <div className="p-2 sm:p-4 flex items-center justify-between">
                          {/* Desktop View Bottom Bar */}
                          <div className="hidden sm:flex items-center justify-between w-full">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[140px]">
                              <BadgeCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                              <span className="truncate">{biz.location || biz.cityTown || "Verified"}</span>
                            </div>
                            <button className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition group-hover:bg-accent group-hover:text-accent-foreground cursor-pointer shrink-0">
                              <Phone className="h-3 w-3" /> View Detail
                            </button>
                          </div>

                          {/* Mobile View Bottom Bar */}
                          <div className="flex sm:hidden flex-col text-left w-full">
                            <span className="text-[11px] font-bold text-foreground/95 leading-tight truncate">
                              {biz.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate mt-0.5">
                              {biz.location || biz.category}
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })
                )
              ) : (
                activeServices.length === 0 ? (
                  <div className="col-span-4 py-8 text-center text-muted-foreground italic text-xs w-full">
                    No popular services available for this tab.
                  </div>
                ) : (
                  activeServices.map((s: any) => (
                    <div
                      key={s._id}
                      onClick={() => onPopularServiceClick ? onPopularServiceClick(s._id) : setSelectedServiceForModal(s)}
                      className="group overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-background transition hover:shadow-[var(--shadow-elegant)] shrink-0 w-[30.5%] sm:w-full cursor-pointer"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <LazyImage
                          src={resolveServiceImage(s.img)}
                          alt={s.title}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        {/* Desktop View Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/95 to-transparent hidden sm:block" />
                        <div className="absolute bottom-3 left-4 right-4 text-primary-foreground hidden sm:block">
                          <div className="font-serif text-lg leading-tight font-bold">{s.title}</div>
                          <div className="text-xs opacity-85 mt-0.5">{s.desc}</div>
                        </div>
                      </div>
                      <div className="p-2 sm:p-4 flex items-center justify-between">
                        {/* Desktop View Bottom Bar */}
                        <div className="hidden sm:flex items-center justify-between w-full">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BadgeCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                            <span>Verified providers</span>
                          </div>
                          <button className="inline-flex items-center gap-0.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition group-hover:bg-accent group-hover:text-accent-foreground cursor-pointer shrink-0">
                            <Phone className="h-3 w-3" /> Enquire
                          </button>
                        </div>

                        {/* Mobile View Bottom Bar */}
                        <div className="flex sm:hidden flex-col items-center text-center w-full">
                          <span className="text-[10px] font-bold text-foreground/95 leading-tight line-clamp-2">
                            {s.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </section>

        {/* Explore Top Tourist Places Section */}
        <section className="mt-4 sm:mt-8 md:mt-10 mb-4 sm:mb-6">
          <div className="relative rounded-2xl border-none sm:border border-border/50 bg-transparent sm:bg-card p-1 sm:p-5 shadow-none sm:shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
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
                className="absolute left-[-20px] top-[55%] -translate-y-1/2 z-30 hidden sm:flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-foreground stroke-[2.5px]" />
              </button>
            )}

            {/* Right navigation arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-[-20px] top-[55%] -translate-y-1/2 z-30 hidden sm:flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-foreground stroke-[2.5px]" />
              </button>
            )}

            {/* Sliding Carousel Wrapper */}
            <div className="relative overflow-hidden -mx-4 sm:mx-0">
              <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-3 sm:gap-4 w-full no-scrollbar py-2 px-4 sm:px-0"
                style={{ scrollbarWidth: "none" }}
              >
                {allPlaces.map((place) => (
                  <div
                    key={place.title}
                    onClick={() => onPlaceClick?.(place.title)}
                    className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-6 rounded-none sm:rounded-xl border-none sm:border border-border/40 bg-transparent sm:bg-background/20 p-0 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] snap-start shrink-0 w-[28%] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] cursor-pointer"
                  >
                    <LazyImage
                      src={place.img}
                      alt={place.title}
                      className="w-full sm:h-28 sm:w-28 aspect-square sm:aspect-auto overflow-hidden rounded-xl bg-secondary shrink-0"
                      imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                      <span className="text-xs sm:text-[20px] font-semibold sm:font-bold text-foreground/90 group-hover:text-primary transition-colors duration-300 mt-1 sm:mt-0">
                        {place.title}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-0.5 text-xs sm:text-[15px] font-bold text-accent mt-1 transition-all duration-300 group-hover:translate-x-0.5">
                        Explore <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3px]" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity / Reviews Section */}
        {recentReviews.length > 0 && (
          <section className="mt-4 sm:mt-8 md:mt-10 mb-2 sm:mb-4">
            <div className="relative rounded-2xl border-none sm:border border-border/50 bg-transparent sm:bg-card p-1 sm:p-5 shadow-none sm:shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-extrabold text-foreground tracking-tight">
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
                  className="absolute left-[-20px] top-[55%] -translate-y-1/2 z-30 hidden sm:flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground stroke-[2.5px]" />
                </button>
              )}

              {/* Right navigation arrow */}
              {canScrollReviewsRight && (
                <button
                  onClick={() => scrollReviews("right")}
                  className="absolute right-[-20px] top-[55%] -translate-y-1/2 z-30 hidden sm:flex h-12 w-10 items-center justify-center bg-white border border-border/60 shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-xl cursor-pointer hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-foreground stroke-[2.5px]" />
                </button>
              )}

              {/* Sliding Carousel Wrapper */}
              <div className="relative overflow-hidden -mx-4 sm:mx-0">
                <div
                  ref={reviewsScrollRef}
                  className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-2 w-full no-scrollbar py-2 px-4 sm:px-0"
                  style={{ scrollbarWidth: "none" }}
                >
                  {recentReviews.map((review, i) => (
                    <div
                      key={i}
                      onClick={() => onReviewClick(review.id)}
                      className="group flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border/40 bg-background/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-primary/20 hover:bg-card snap-start shrink-0 w-[46%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] cursor-pointer"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-1.5 p-2.5 sm:p-5">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] sm:text-base font-extrabold text-foreground tracking-tight leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                            {review.businessName}
                          </span>
                          <span className="text-[8.5px] sm:text-[11px] font-medium text-muted-foreground mt-0.5 line-clamp-1">
                            {review.location}
                          </span>
                        </div>

                        {/* WhatsApp Button */}
                        <a
                          href={review.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-0.5 px-1 py-0.5 sm:px-2.5 sm:py-1 border border-[#25d366]/30 text-[#25d366] font-bold text-[7.5px] sm:text-[10px] rounded-md sm:rounded-lg bg-[#25d366]/5 hover:bg-[#25d366] hover:text-white hover:border-[#25d366] transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
                        >
                          <svg
                            className="h-2 w-2 sm:h-3 sm:w-3 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 1.968 13.91 .94 11.997.94c-5.442 0-9.867 4.371-9.871 9.8.001 1.83.483 3.61 1.398 5.183L2.5 21.082l5.147-1.33c-.007.005-.007.005 0 0zm9.967-6.758c-.31-.154-1.834-.894-2.115-.995-.28-.102-.485-.153-.687.154-.202.307-.783.995-.96 1.198-.177.205-.355.23-.665.077-1.127-.565-1.953-.972-2.73-1.637-.777-.665-1.28-1.488-1.433-1.753-.153-.307-.016-.473.138-.626.14-.138.31-.36.467-.538.153-.18.204-.307.307-.512.102-.205.05-.384-.025-.538-.077-.154-.687-1.637-.94-2.253-.247-.6-.5-.518-.688-.528-.178-.01-.383-.01-.588-.01-.205 0-.538.077-.82.384-.282.307-1.077 1.05-1.077 2.561 0 1.51 1.1 2.97 1.253 3.176.154.205 2.164 3.266 5.244 4.581.733.313 1.306.499 1.75.64.737.234 1.408.201 1.94.122.592-.088 1.834-.74 2.09-1.455.257-.717.257-1.332.18-1.456-.076-.124-.282-.201-.592-.356z" />
                          </svg>
                          WhatsApp
                        </a>
                      </div>

                      {/* Image */}
                      <LazyImage
                        src={getImageUrl(review.businessImg)}
                        alt={review.businessName}
                        className="relative aspect-[16/8] sm:aspect-[16/9] w-full overflow-hidden bg-secondary border-y border-border/40"
                        imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Review Info */}
                      <div className="p-2.5 sm:p-5 flex flex-col flex-1">
                        {/* User Row */}
                        <div className="flex items-center gap-1.5 sm:gap-3">
                          <div
                            className={`h-5 w-5 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[8px] sm:text-xs font-black text-white shadow-inner bg-gradient-to-tr ${review.userColor}`}
                          >
                            {review.userInitial}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9.5px] sm:text-[13px] font-bold text-foreground leading-tight">
                              {review.userName}
                            </span>
                            <span className="text-[7.5px] sm:text-[10px] font-semibold text-muted-foreground mt-0.5 leading-none">
                              Wrote a review
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mt-1.5 sm:mt-3">
                          {Array.from({ length: review.rating }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-amber-500 fill-amber-500 stroke-[1.5px]"
                            />
                          ))}
                        </div>

                        {/* Review Text */}
                        <p className="text-[9.5px] sm:text-[12px] text-muted-foreground/90 mt-1.5 sm:mt-2.5 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-3 italic flex-1">
                          "{review.reviewText}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Articles Section */}
        <section className="mt-2 sm:mt-4 md:mt-6 mb-0 sm:mb-20">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-2xl font-extrabold text-foreground tracking-tight font-serif">
                Related Articles
              </h2>
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            </div>
          </div>

          <div className="relative overflow-hidden -mx-4 sm:mx-0">
            <div
              className="flex sm:grid overflow-x-auto sm:overflow-x-visible scroll-smooth sm:scroll-auto snap-x sm:snap-none snap-mandatory gap-2 sm:gap-8 w-full no-scrollbar sm:grid-cols-2 lg:grid-cols-3 py-2 px-4 sm:px-0 sm:p-0 sm:m-0"
              style={{ scrollbarWidth: "none" }}
            >
              {articlesFromApi.map((article, index) => (
                <a
                  key={index}
                  href={article.link}
                  onClick={(e) => {
                    e.preventDefault();
                    onArticleClick(article.id);
                  }}
                  className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border/40 bg-card/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer snap-start shrink-0 w-[46%] sm:w-full"
                >
                  {/* Image Container with Tag */}
                  <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-secondary">
                    <LazyImage
                      src={article.img}
                      alt={article.title}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-1.5 left-1.5 sm:top-4 sm:left-4 rounded-lg bg-black/45 backdrop-blur-md px-1.5 py-0.5 sm:px-3 sm:py-1.5 text-[7px] sm:text-[9px] font-black uppercase tracking-wider text-white border border-white/10 shadow-sm z-10">
                      {article.category}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-2 sm:p-6 flex flex-col flex-1">
                    <div className="text-[7px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 sm:mb-2.5">
                      {article.readTime}
                    </div>

                    <h3 className="font-serif text-[10px] sm:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h3>

                    <p
                      className="hidden sm:block text-[13px] text-muted-foreground/80 mt-3 leading-relaxed line-clamp-4"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.desc}
                    </p>

                    <div className="hidden sm:flex mt-6 pt-4 border-t border-border/40 items-center justify-between text-xs font-bold text-primary group-hover:text-accent transition-colors duration-300 mt-auto">
                      <span>Explore Article</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Info & Download App Section */}
        <section className="hidden sm:block mt-12 md:mt-16 mb-12 md:mb-16 text-left border-t border-border/40 pt-10">
          {/* Bottom Content Area: SEO Text */}
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight leading-snug">
              {aboutData.title}
            </h3>

            <div className="mt-5 space-y-4 text-[13px] text-muted-foreground/80 leading-relaxed font-semibold">
              <p>
                {aboutData.paragraph1.includes("FindmyPoint")
                  ? aboutData.paragraph1.split("FindmyPoint").map((chunk, i, arr) => (
                    <span key={i}>
                      {chunk}
                      {i < arr.length - 1 && (
                        <span className="font-extrabold text-foreground">FindmyPoint</span>
                      )}
                    </span>
                  ))
                  : aboutData.paragraph1}
              </p>
              <p>{aboutData.paragraph2}</p>
              <p>{aboutData.paragraph3}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Popular Services Linked Businesses Modal */}
      {selectedServiceForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-background rounded-3xl border border-border max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-zoom-in">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  {selectedServiceForModal.title}
                </h3>
                {selectedServiceForModal.desc && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedServiceForModal.desc}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedServiceForModal(null)}
                className="h-8 w-8 rounded-xl bg-secondary hover:bg-destructive hover:text-destructive-foreground text-muted-foreground flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Business List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {!selectedServiceForModal.businesses || selectedServiceForModal.businesses.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground italic text-xs">
                  No businesses are currently linked to this service.
                </div>
              ) : (
                selectedServiceForModal.businesses.map((biz: any, idx: number) => {
                  const bizImg = biz.images?.[0] || "";
                  const resolvedImg = bizImg
                    ? (bizImg.startsWith("data:") || bizImg.startsWith("http")
                      ? bizImg
                      : `${BACKEND_ORIGIN}${bizImg}`)
                    : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80";

                  return (
                    <div
                      key={biz.id || biz._id || idx}
                      className="p-4 rounded-2xl border border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm transition-all duration-300 flex items-start gap-4"
                    >
                      {/* Business Image */}
                      <LazyImage
                        src={resolvedImg}
                        alt={biz.name}
                        className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-border bg-secondary"
                        imgClassName="h-full w-full object-cover"
                      />

                      {/* Business Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate leading-snug">
                          {biz.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {biz.location}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center text-amber-500 shrink-0">
                            <Star className="h-3 w-3 fill-amber-500" />
                            <span className="text-xs font-black ml-0.5">
                              {biz.rating ? biz.rating.toFixed(1) : "0.0"}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            ({biz.reviewCount || 0} reviews)
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3.5">
                          <button
                            onClick={() => {
                              setSelectedServiceForModal(null);
                              onReviewClick(biz.id);
                            }}
                            className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                          >
                            View Details
                          </button>

                          {biz.whatsapp && (
                            <a
                              href={`https://wa.me/${biz.whatsapp.replace(/[+\s]+/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="h-7 px-2.5 rounded-lg border border-border text-emerald-600 dark:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <Phone className="h-2.5 w-2.5" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer close */}
            <div className="px-6 py-4 border-t border-border bg-secondary/30 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedServiceForModal(null)}
                className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
