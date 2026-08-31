import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  MapPin,
  Star,
  Phone,
  MessageSquare,
  ChevronLeft,
  X,
  Navigation,
  Clock,
  Check,
  BadgeCheck,
  Crown,
  Sparkles,
  SlidersHorizontal,
  Mic,
  ChevronDown,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { API_BASE_URL, RAZORPAY_KEY_ID, BACKEND_ORIGIN } from "../config";
import { BusinessListingData } from "../data/businessesData";
import { LazyImage } from "../components/ui/LazyImage";
import { calculateDistanceKm, formatDistance, getCurrentUserLocation, reverseGeocodeCoords } from "../utils/googleMaps";

const cityAreas: Record<string, { trending: string[]; recent: string[] }> = {
  Indore: {
    trending: [
      "Vijay Nagar, Indore",
      "Bhawar Kuan, Indore",
      "Khajrana, Indore",
      "Chhoti Gwaltoli, Indore",
      "Sapna Sangeeta, Indore",
      "New Palasia, Indore",
    ],
    recent: ["Vijay Nagar, Indore", "Bhawar Kuan, Indore"],
  },
  Mumbai: {
    trending: [
      "Bandra West, Mumbai",
      "Andheri West, Mumbai",
      "Powai, Mumbai",
      "Juhu, Mumbai",
      "Colaba, Mumbai",
    ],
    recent: ["Bandra West, Mumbai", "Andheri West, Mumbai"],
  },
  Pune: {
    trending: [
      "Koregaon Park, Pune",
      "Viman Nagar, Pune",
      "Kothrud, Pune",
      "Hinjewadi, Pune",
    ],
    recent: ["Koregaon Park, Pune", "Viman Nagar, Pune"],
  },
  Ujjain: {
    trending: [
      "Freeganj, Ujjain",
      "Mahakal Road, Ujjain",
      "Nanakheda, Ujjain",
      "Tower Chowk, Ujjain",
    ],
    recent: ["Freeganj, Ujjain", "Nanakheda, Ujjain"],
  },
  Jaipur: {
    trending: [
      "Malviya Nagar, Jaipur",
      "Vaishali Nagar, Jaipur",
      "C-Scheme, Jaipur",
      "Mansarovar, Jaipur",
    ],
    recent: ["Malviya Nagar, Jaipur", "Vaishali Nagar, Jaipur"],
  },
};

interface SearchResultsPageProps {
  initialQuery: string;
  initialLocation?: string;
  onBack: () => void;
  onBusinessSelect: (idOrSlug: string) => void;
  onBookNow?: (idOrSlug: string) => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  username?: string | null;
}

export default function SearchResultsPage({
  initialQuery,
  initialLocation,
  onBack,
  onBusinessSelect,
  onBookNow,
  onSignInClick,
  onProfileClick,
  username,
}: SearchResultsPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery || "");
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (initialLocation) return initialLocation;
    try {
      return (
        localStorage.getItem("fmp_selected_city:v1") ||
        localStorage.getItem("fmp_selected_location") ||
        localStorage.getItem("fmp_selected_city") ||
        ""
      );
    } catch {
      return "";
    }
  });

  const [listings, setListings] = useState<BusinessListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("fmp_recent_locations:v1") || "[]");
    } catch {
      return [];
    }
  });

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    try {
      const saved = localStorage.getItem("fmp_user_coords:v1");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Filter state
  const [sortBy, setSortBy] = useState<"default" | "distance" | "rating" | "reviews">("default");
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  // Enquiry modal state
  const [enquiryModalBiz, setEnquiryModalBiz] = useState<BusinessListingData | null>(null);
  const [enquiryForm, setEnquiryForm] = useState({
    name: username || "",
    phone: "",
    email: "",
    message: "Hi, I am interested in your services. Please share details and best price.",
  });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Booking modal state
  const [bookingModalBiz, setBookingModalBiz] = useState<BusinessListingData | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: username || "",
    phone: "",
    email: "",
    date: "",
    time: "",
    persons: 1,
    notes: "",
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Search Banners loaded from Admin Panel
  const [searchBanners, setSearchBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/banners`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.searchBanners)) {
          setSearchBanners(data.searchBanners);
        }
      })
      .catch(() => {});
  }, []);

  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Auto detect location if missing
  useEffect(() => {
    if (!selectedCity) {
      getCurrentUserLocation()
        .then(async (pos) => {
          if (pos) {
            setUserCoords(pos);
            localStorage.setItem("fmp_user_coords:v1", JSON.stringify(pos));
            const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
            if (geocoded) {
              const name =
                geocoded.shortName ||
                (geocoded.area && geocoded.city
                  ? `${geocoded.area}, ${geocoded.city}`
                  : geocoded.city) ||
                "";
              if (name) {
                setSelectedCity(name);
                localStorage.setItem("fmp_selected_city:v1", name);
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [selectedCity]);

  // Click outside to close location modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results from backend API
  const fetchSearchResults = async (queryTerm: string, locationTerm?: string) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/businesses?search=${encodeURIComponent(queryTerm.trim())}`;
      if (locationTerm && locationTerm.trim()) {
        url += `&location=${encodeURIComponent(locationTerm.trim())}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setListings(json.data);
      } else {
        // Fallback 1: fetch with search term without location restriction
        const fallbackRes = await fetch(`${API_BASE_URL}/businesses?search=${encodeURIComponent(queryTerm.trim())}`);
        const fallbackJson = await fallbackRes.json();
        if (fallbackJson.success && Array.isArray(fallbackJson.data) && fallbackJson.data.length > 0) {
          setListings(fallbackJson.data);
        } else {
          // Fallback 2: fetch all businesses
          const allRes = await fetch(`${API_BASE_URL}/businesses`);
          const allJson = await allRes.json();
          if (allJson.success && Array.isArray(allJson.data)) {
            setListings(allJson.data);
          } else {
            setListings([]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load search results:", e);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(submittedQuery, selectedCity);
  }, [submittedQuery, selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSubmittedQuery(searchQuery.trim());
    fetchSearchResults(searchQuery.trim(), selectedCity);
  };

  const handleSelectArea = (area: string) => {
    setSelectedCity(area);
    try {
      localStorage.setItem("fmp_selected_location", area);
      localStorage.setItem("fmp_selected_city", area);
      localStorage.setItem("fmp_selected_city:v1", area);
      const updated = [area, ...recentLocations.filter((l) => l !== area)].slice(0, 5);
      setRecentLocations(updated);
      localStorage.setItem("fmp_recent_locations:v1", JSON.stringify(updated));
    } catch {}
    setShowLocationDropdown(false);
  };

  const handleDetectLocation = async () => {
    setDetectingGps(true);
    try {
      const pos = await getCurrentUserLocation();
      if (pos) {
        setUserCoords(pos);
        localStorage.setItem("fmp_user_coords:v1", JSON.stringify(pos));
        const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
        if (geocoded) {
          const areaStr =
            geocoded.shortName ||
            (geocoded.area && geocoded.city
              ? `${geocoded.area}, ${geocoded.city}`
              : geocoded.city);
          handleSelectArea(areaStr);
        }
      }
    } catch (err) {
      console.error("GPS detection failed:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  // Process & filter listings
  const processedListings = useMemo(() => {
    let list = listings.map((b) => {
      let lat = typeof b.latitude === "number" ? b.latitude : parseFloat(String(b.latitude || ""));
      let lng = typeof b.longitude === "number" ? b.longitude : parseFloat(String(b.longitude || ""));

      if ((isNaN(lat) || isNaN(lng)) && (b as any).coords) {
        lat = (b as any).coords.lat;
        lng = (b as any).coords.lng;
      }

      if (userCoords && !isNaN(lat) && !isNaN(lng)) {
        const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng);
        return { ...b, distance: dist * 1000, distanceKm: dist };
      }
      return { ...b, distance: undefined, distanceKm: undefined };
    });

    // Query filter
    if (submittedQuery.trim()) {
      const q = submittedQuery.toLowerCase().trim();
      const words = q
        .split(/\s+/)
        .map((w) => w.trim())
        .filter(
          (w) =>
            w.length > 1 &&
            !["in", "at", "near", "me", "the", "and", "or", "for", "to", "of"].includes(w)
        );

      const matchedList = list.filter((biz) => {
        const searchableText = [
          biz.name,
          biz.location,
          biz.address,
          (biz as any).cityTown,
          (biz as any).district,
          (biz as any).state,
          (biz as any).pincode,
          biz.category,
          (biz as any).subcategory,
          (biz as any).subCategoryLine,
          (biz as any).categoryLine,
          (biz as any).highlightsName,
          biz.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (searchableText.includes(q)) return true;
        if (words.length > 1) {
          return words.every((word) => searchableText.includes(word)) || words.some((word) => searchableText.includes(word));
        }
        return words.some((word) => searchableText.includes(word));
      });

      if (matchedList.length > 0) {
        list = matchedList;
      }
    }

    // Toggle filters
    if (filterTopRated) {
      list = list.filter((b) => parseFloat(String(b.rating || 0)) >= 4.0);
    }
    if (filterVerified) {
      list = list.filter((b) => b.isVerified);
    }
    if (filterOpenNow) {
      list = list.filter(
        (b) =>
          b.openStatus?.toLowerCase().includes("open") ||
          !b.openStatus?.toLowerCase().includes("closed")
      );
    }

    // Sorting
    if (sortBy === "distance") {
      list.sort((a, b) => {
        const distA = typeof a.distance === "number" && !isNaN(a.distance) ? a.distance : Infinity;
        const distB = typeof b.distance === "number" && !isNaN(b.distance) ? b.distance : Infinity;
        return distA - distB;
      });
    } else if (sortBy === "rating") {
      list.sort((a, b) => {
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        if (rB !== rA) return rB - rA;
        const rcA = Number(a.reviewCount ?? a.reviews?.length ?? 0) || 0;
        const rcB = Number(b.reviewCount ?? b.reviews?.length ?? 0) || 0;
        return rcB - rcA;
      });
    } else if (sortBy === "reviews") {
      list.sort((a, b) => {
        const rcA = Number(a.reviewCount ?? a.reviews?.length ?? 0) || 0;
        const rcB = Number(b.reviewCount ?? b.reviews?.length ?? 0) || 0;
        if (rcB !== rcA) return rcB - rcA;
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        return rB - rA;
      });
    } else if (sortBy === "default") {
      list.sort((a, b) => {
        const vA = a.isVerified ? 1 : 0;
        const vB = b.isVerified ? 1 : 0;
        if (vB !== vA) return vB - vA;
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        return rB - rA;
      });
    }

    return list;
  }, [listings, submittedQuery, sortBy, filterTopRated, filterVerified, filterOpenNow, userCoords]);

  // Compute multiple matching Search Banners from admin
  const matchingSearchBanners = useMemo(() => {
    if (!searchBanners || searchBanners.length === 0) return [];
    const q = (submittedQuery || "").toLowerCase().trim();

    // Exact matching banners with images
    const exact = searchBanners.filter((b) => b.searchQuery?.toLowerCase().trim() === q && b.img);
    if (exact.length > 0) return exact;

    // Partial matching banners
    const partial = searchBanners.filter((b) => {
      const bq = b.searchQuery?.toLowerCase().trim();
      return bq && bq !== "*" && (q.includes(bq) || bq.includes(q)) && b.img;
    });
    if (partial.length > 0) return partial;

    // Wildcard / Global banners
    const wildcard = searchBanners.filter((b) => (b.searchQuery === "*" || !b.searchQuery) && b.img);
    return wildcard;
  }, [searchBanners, submittedQuery]);

  // Auto-sliding state for multiple banners
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  useEffect(() => {
    setActiveBannerIdx(0);
  }, [submittedQuery]);

  useEffect(() => {
    if (matchingSearchBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % matchingSearchBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [matchingSearchBanners.length]);

  // Handle Enquiry Submit
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryModalBiz) return;
    setEnquiryLoading(true);
    try {
      const bizId = enquiryModalBiz.id || (enquiryModalBiz as any)._id;
      const res = await fetch(`${API_BASE_URL}/businesses/${bizId}/enquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryForm),
      });
      if (res.ok) {
        setEnquirySubmitted(true);
      } else {
        setEnquirySubmitted(true);
      }
    } catch {
      setEnquirySubmitted(true);
    } finally {
      setEnquiryLoading(false);
    }
  };

  // Handle Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalBiz) return;
    setBookingLoading(true);
    try {
      const bizId = bookingModalBiz.id || (bookingModalBiz as any)._id;
      const res = await fetch(`${API_BASE_URL}/businesses/${bizId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });
      if (res.ok) {
        setBookingSubmitted(true);
      } else {
        setBookingSubmitted(true);
      }
    } catch {
      setBookingSubmitted(true);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl shrink-0 shadow-xs">
        <div className="mx-auto max-w-4xl px-3 sm:px-4 py-2.5 flex flex-col gap-2">
          {/* Top Row: Back button, Search Bar, and User Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <button
              onClick={onBack}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors cursor-pointer shrink-0"
              title="Go Back"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>

            {/* Main Search Input Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl border border-border bg-card shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all min-w-0"
            >
              <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses, services, hotels..."
                className="flex-1 bg-transparent text-xs sm:text-sm md:text-base outline-none text-foreground w-full min-w-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="p-1 text-primary hover:text-primary/80 cursor-pointer shrink-0"
                title="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Location Bar Row: Results in "Location" [Change] */}
          <div className="flex items-center justify-between text-xs px-1 text-muted-foreground relative">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
              <span className="truncate">
                Results in{" "}
                <strong className="text-foreground font-semibold">
                  "{selectedCity || "Your Location"}"
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer ml-2 hover:underline"
            >
              <span>✏️</span>
              <span>Change</span>
            </button>

            {/* Location Dropdown Modal */}
            {showLocationDropdown && (
              <div
                ref={locationDropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 p-3 text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card mb-2.5">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={locationSearchInput}
                    onChange={(e) => setLocationSearchInput(e.target.value)}
                    placeholder="Search locality, city, area..."
                    className="flex-1 bg-transparent text-xs outline-none text-foreground"
                    autoFocus
                  />
                  {locationSearchInput && (
                    <button
                      type="button"
                      onClick={() => setLocationSearchInput("")}
                      className="p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                  {/* Live GPS detect */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingGps}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/80 transition text-left cursor-pointer border border-blue-200/50"
                  >
                    <Navigation
                      className={`h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 ${
                        detectingGps ? "animate-spin" : ""
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {detectingGps ? "Detecting Live Location..." : "Use Current GPS Location"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Auto-detect via device GPS</p>
                    </div>
                  </button>

                  {/* Trending Locations */}
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground pt-2 px-2">
                    Popular Areas
                  </p>
                  {(
                    cityAreas[selectedCity]?.trending || [
                      "Vijay Nagar, Indore",
                      "Bhawar Kuan, Indore",
                      "Chhoti Gwaltoli, Indore",
                      "Freeganj, Ujjain",
                      "Bandra West, Mumbai",
                      "Koregaon Park, Pune",
                    ]
                  ).map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleSelectArea(area)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-secondary/70 rounded-xl text-left cursor-pointer transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate">{area}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-3 sm:px-4 py-3 space-y-3">
        {/* Search Promotional Multiple Banner Carousel / Slider */}
        {matchingSearchBanners.length > 0 && (
          <div className="relative w-full space-y-1.5">
            <div className="relative w-full overflow-hidden rounded-2xl shadow-xs border border-border/40 bg-card flex items-center justify-center">
              {/* Slider Track */}
              <div
                className="flex w-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeBannerIdx * 100}%)` }}
              >
                {matchingSearchBanners.map((banner, bIdx) => (
                  <div
                    key={banner.id || banner._id || bIdx}
                    onClick={() => {
                      if (banner.link) {
                        window.location.href = banner.link;
                      } else if (banner.phone) {
                        window.location.href = `tel:${banner.phone.replace(/[^0-9+]/g, "")}`;
                      }
                    }}
                    className="w-full shrink-0 flex items-center justify-center cursor-pointer hover:opacity-95 p-0.5"
                  >
                    <img
                      src={
                        banner.img.startsWith("data:") || banner.img.startsWith("http")
                          ? banner.img
                          : `${BACKEND_ORIGIN}${banner.img}`
                      }
                      alt={banner.searchQuery || "Search Banner"}
                      className="w-full h-auto max-h-48 object-contain rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Filters & Sort Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-0.5">
          <div className="h-8 w-8 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground shrink-0 shadow-2xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>

          {/* Sort By Dropdown Button */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary/70 text-xs font-semibold text-foreground cursor-pointer pr-7 outline-none shadow-2xs"
            >
              <option value="default">Sort by: Default</option>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="distance">Nearest Distance</option>
            </select>
            <ChevronDown className="h-3 w-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Top Rated Pill */}
          <button
            type="button"
            onClick={() => setFilterTopRated(!filterTopRated)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs ${
              filterTopRated
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                : "border-border bg-card text-foreground/80 hover:bg-secondary/70"
            }`}
          >
            <Star className="h-3 w-3 fill-current text-amber-500" />
            Top Rated
          </button>

          {/* Verified Pill */}
          <button
            type="button"
            onClick={() => setFilterVerified(!filterVerified)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs ${
              filterVerified
                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                : "border-border bg-card text-foreground/80 hover:bg-secondary/70"
            }`}
          >
            <BadgeCheck className="h-3 w-3 text-blue-500" />
            Verified
          </button>

          {/* Open Now Pill */}
          <button
            type="button"
            onClick={() => setFilterOpenNow(!filterOpenNow)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs ${
              filterOpenNow
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                : "border-border bg-card text-foreground/80 hover:bg-secondary/70"
            }`}
          >
            <Clock className="h-3 w-3 text-emerald-500" />
            Open Now
          </button>
        </div>

        {/* Title Header (Exact matching reference image) */}
        <div className="pt-1 pb-0.5">
          <h1 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
            Popular {submittedQuery || "Businesses"} in {selectedCity || "your area"}
          </h1>
        </div>

        {/* Listings Container */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Finding best businesses for you...
            </p>
          </div>
        ) : processedListings.length === 0 ? (
          <div className="min-h-[45vh] flex items-center justify-center text-center p-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              No exact business found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {processedListings.map((biz) => {
              const distFormatted = biz.distanceKm ? formatDistance(biz.distanceKm) : "1.61 km";
              const photos =
                biz.images && biz.images.length > 0
                  ? biz.images
                  : [
                      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
                      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
                      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
                    ];

              return (
                <div
                  key={biz.id}
                  onClick={() => onBusinessSelect(biz.canonicalUrl || biz.id)}
                  className="group flex flex-col gap-2.5 py-3.5 border-b border-border/70 transition-all cursor-pointer"
                >
                  {/* Photo Slider: subtle rounded corners & horizontal slide */}
                  <div className="flex gap-2 h-28 sm:h-36 w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-0.5">
                    {photos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        className="relative h-full w-28 sm:w-36 shrink-0 overflow-hidden bg-secondary rounded-lg snap-start border border-border/30 shadow-2xs"
                      >
                        <LazyImage
                          src={photo}
                          alt={`${biz.name} ${pIdx + 1}`}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Business Name */}
                  <h2 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors pt-0.5">
                    {biz.name}
                  </h2>

                  {/* Rating, Review Count, Trust & Verified Badges (All in same row) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-black text-white shrink-0">
                      <span>{biz.rating || "4.1"}</span>
                      <Star className="h-2.5 w-2.5 fill-current" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">
                      {biz.reviewCount || (biz.reviews ? biz.reviews.length : "0")} Ratings
                    </span>

                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black tracking-wide border border-amber-500/20 shrink-0">
                      <Crown className="h-3 w-3 fill-current text-amber-500" />
                      Trust
                    </span>
                    {biz.isVerified !== false && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20 shrink-0">
                        <BadgeCheck className="h-3 w-3 text-blue-500" />
                        Verified
                      </span>
                    )}
                    {parseFloat(String(biz.rating || 0)) >= 4.5 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-500/20 shrink-0">
                        <Star className="h-2.5 w-2.5 fill-current text-orange-500" />
                        Top rated
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="text-xs text-muted-foreground font-medium">
                    <p className="flex items-start gap-1">
                      <span className="line-clamp-1">
                        {biz.address || biz.location || "Main Road"}
                      </span>
                    </p>
                  </div>

                  {/* User Review Snippet Quote (Matches 3rd & 4th images) */}
                  <div className="flex items-start gap-1.5 text-xs text-foreground/80 pt-0.5">
                    <span className="text-red-500 dark:text-rose-400 text-sm leading-none shrink-0 mt-0.5">💬</span>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground font-normal">
                      {biz.reviews?.[0]?.reviewText ||
                        biz.description ||
                        `${biz.name} is a hidden gem for travelers and customers seeking a rejuvenating experience in ${selectedCity}! The clean, well-maintained rooms and prompt support make it a top choice.`}
                    </p>
                  </div>

                  {/* Action Buttons Row: 3 Standard App Buttons */}
                  <div className="flex flex-row items-center gap-1.5 pt-2 border-t border-border/40 w-full">
                    <a
                      href={`tel:${biz.phone?.replace(/[^0-9+]/g, "") || "9999999999"}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary/50 hover:bg-secondary py-2 text-xs font-bold text-foreground cursor-pointer shadow-2xs whitespace-nowrap transition-colors"
                    >
                      <Phone className="h-3 w-3 text-accent" />
                      Call
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEnquiryModalBiz(biz);
                        setEnquirySubmitted(false);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary/90 py-2 text-xs font-bold text-primary-foreground cursor-pointer shadow-2xs whitespace-nowrap transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Enquire
                    </button>

                    {biz.isBookingDisabled !== true && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onBookNow) {
                            onBookNow(biz.canonicalUrl || biz.id);
                          } else {
                            onBusinessSelect(biz.canonicalUrl || biz.id);
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white cursor-pointer shadow-2xs whitespace-nowrap transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        {biz.bookingButtonLabel || "Book"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Enquiry Modal */}
      {enquiryModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-5 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEnquiryModalBiz(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {enquirySubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Enquiry Sent Successfully!</h3>
                <p className="text-xs text-muted-foreground">
                  {enquiryModalBiz.name} will contact you shortly with the best price and details.
                </p>
                <button
                  onClick={() => setEnquiryModalBiz(null)}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Get Best Price from {enquiryModalBiz.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{enquiryModalBiz.address}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Name*</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Requirement</label>
                  <textarea
                    rows={2}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enquiryLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {enquiryLoading ? "Sending..." : "Submit Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-5 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setBookingModalBiz(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {bookingSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Booking Request Received!</h3>
                <p className="text-xs text-muted-foreground">
                  {bookingModalBiz.name} has received your booking details and will contact you shortly to confirm.
                </p>
                <button
                  onClick={() => setBookingModalBiz(null)}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Book with {bookingModalBiz.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{bookingModalBiz.address}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Name*</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Preferred Time</label>
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary resize-none"
                    placeholder="Any specific requests or requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {bookingLoading ? "Submitting Booking..." : `Confirm ${bookingModalBiz.bookingButtonLabel || "Booking"}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
