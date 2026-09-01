import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  MapPin,
  Star,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Navigation,
  Clock,
  Check,
  BadgeCheck,
  Crown,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  ShieldCheck,
  Loader2,
  ThumbsUp,
  Zap,
  Tag,
  Percent,
} from "lucide-react";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";
import { BusinessListingData } from "../data/businessesData";
import { LazyImage } from "../components/ui/LazyImage";
import { calculateDistanceKm, formatDistance, getCurrentUserLocation, reverseGeocodeCoords } from "../utils/googleMaps";
import Footer from "./Footer";

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.13 7.38C8.94 7.38 8.64 7.45 8.38 7.73C8.12 8.02 7.39 8.7 7.39 10.08C7.39 11.46 8.4 12.78 8.54 12.97C8.68 13.16 10.5 16.12 13.38 17.24C15.77 18.17 16.26 17.98 16.79 17.93C17.32 17.89 18.49 17.24 18.73 16.57C18.97 15.9 18.97 15.33 18.9 15.21C18.83 15.09 18.64 15.02 18.35 14.88C18.06 14.74 16.65 14.05 16.39 13.95C16.13 13.86 15.94 13.81 15.75 14.1C15.56 14.39 15.01 15.02 14.85 15.21C14.68 15.4 14.52 15.42 14.23 15.28C13.94 15.14 13.01 14.83 11.91 13.85C11.05 13.09 10.47 12.14 10.3 11.86C10.14 11.57 10.28 11.41 10.43 11.27C10.56 11.14 10.72 10.92 10.87 10.75C11.01 10.58 11.06 10.46 11.16 10.27C11.25 10.08 11.2 9.91 11.13 9.77C11.06 9.63 10.49 8.24 10.25 7.67C10.02 7.12 9.79 7.19 9.62 7.18C9.46 7.18 9.3 7.38 9.13 7.38Z" />
  </svg>
);

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

// Individual Search Result Card Component
interface SearchResultCardProps {
  biz: BusinessListingData;
  selectedCity: string;
  onBusinessSelect: (idOrSlug: string) => void;
  onBookNow?: (idOrSlug: string) => void;
  onOpenEnquiry: (biz: BusinessListingData) => void;
}

function SearchResultCard({
  biz,
  selectedCity,
  onBusinessSelect,
  onBookNow,
  onOpenEnquiry,
}: SearchResultCardProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Photos resolution
  const photos = useMemo(() => {
    const raw = Array.isArray(biz.images) && biz.images.length > 0 ? biz.images : [];
    if (raw.length > 0) {
      return raw.map((img) =>
        img.startsWith("data:") || img.startsWith("http") ? img : `${BACKEND_ORIGIN}${img}`
      );
    }
    return [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    ];
  }, [biz.images]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const distFormatted = biz.distanceKm ? formatDistance(biz.distanceKm) : null;
  const phoneRaw = biz.phone?.replace(/[^0-9+]/g, "") || "9999999999";
  const whatsappRaw = (biz.whatsapp || biz.phone || "9999999999").replace(/[^0-9+]/g, "");

  // Tags
  const tags = useMemo(() => {
    const list: string[] = [];
    const lowerName = (biz.name || "").toLowerCase();
    if (lowerName.includes("girls")) list.push("Girls");
    else if (lowerName.includes("boys")) list.push("Boys");

    if (biz.category && !list.includes(biz.category)) list.push(biz.category);
    if ((biz as any).subcategory && !list.includes((biz as any).subcategory)) {
      list.push((biz as any).subcategory);
    }
    if (biz.subCategoryLine && !list.includes(biz.subCategoryLine)) {
      list.push(biz.subCategoryLine);
    }
    if (Array.isArray(biz.facilities)) {
      biz.facilities.slice(0, 3).forEach((f) => {
        if (f && !list.includes(f)) list.push(f);
      });
    }
    return list.slice(0, 4);
  }, [biz]);

  // Review Quote
  const reviewQuote = useMemo(() => {
    if (biz.reviews && biz.reviews.length > 0 && biz.reviews[0]?.reviewText) {
      return biz.reviews[0].reviewText;
    }
    if (biz.description) {
      return biz.description;
    }
    return `${biz.name} is a top choice for customers in ${selectedCity || "Indore"}. Clean, well-maintained and prompt service.`;
  }, [biz, selectedCity]);

  return (
    <div
      onClick={() => onBusinessSelect(biz.canonicalUrl || biz.id)}
      className="py-4 sm:py-5 border-b border-border/70 transition-all cursor-pointer group"
    >
      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on md and up >= 768px): Exact Justdial Style Layout */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-row items-stretch gap-5 lg:gap-6">
        {/* Left Column: Image Carousel / Slider with Slide Arrows */}
        <div className="relative w-64 lg:w-72 h-52 lg:h-56 shrink-0 rounded-xl overflow-hidden bg-secondary border border-border/40 group/img select-none">
          <LazyImage
            src={photos[activePhotoIdx]}
            alt={`${biz.name} photo ${activePhotoIdx + 1}`}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover group-hover/img:scale-105 transition-transform duration-500"
          />

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100 cursor-pointer shadow-md z-10"
                title="Previous Image"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-90 group-hover/img:opacity-100 cursor-pointer shadow-md z-10"
                title="Next Image"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold z-10">
                {activePhotoIdx + 1}/{photos.length}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Business Info & Actions */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 space-y-2">
          <div className="space-y-2">
            {/* Title Row with Thumbs Up Badge */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ThumbsUp className="h-3.5 w-3.5 fill-current" />
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {biz.name}
              </h2>
            </div>

            {/* Rating, Reviews, Trust & Verified Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1 rounded bg-[#13803d] dark:bg-emerald-600 px-2 py-0.5 text-xs font-black text-white shrink-0">
                <span>{biz.rating || "4.5"}</span>
                <Star className="h-3 w-3 fill-current text-white" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground shrink-0">
                {biz.reviewCount || (biz.reviews ? biz.reviews.length : "0")} Ratings
              </span>

              {biz.isVerified !== false && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20 shrink-0">
                  <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                  Verified
                </span>
              )}

              {parseFloat(String(biz.rating || 0)) >= 4.5 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20 shrink-0">
                  <Star className="h-3 w-3 fill-current text-orange-500" />
                  Top Rated
                </span>
              )}
            </div>

            {/* Address Row */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{biz.address || biz.location || "Main Road"}</span>
            </div>

            {/* Tags / Subcategories Row */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md bg-secondary/80 text-foreground/80 text-xs font-medium border border-border/50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Review Snippet Quote */}
            <div className="flex items-center gap-1.5 text-xs text-foreground/80 pt-0.5">
              <span className="text-red-500 dark:text-rose-400 text-sm leading-none shrink-0">💬</span>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                <strong className="text-foreground font-medium">"{reviewQuote}"</strong>
                {biz.reviews && biz.reviews.length > 0 && (
                  <span className="ml-1.5 text-muted-foreground font-normal">
                    {biz.reviews.length} {biz.reviews.length === 1 ? "Suggestion" : "Suggestions"}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons Row: Original 3 Buttons (Call, Enquire, Book) */}
          <div className="flex items-center gap-2.5 pt-2 flex-wrap">
            {/* Call Button */}
            <a
              href={`tel:${phoneRaw}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground py-2 px-5 text-xs lg:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-accent" />
              <span>Call</span>
            </a>

            {/* Enquire Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEnquiry(biz);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-5 text-xs lg:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Enquire</span>
            </button>

            {/* Book Button (if enabled) */}
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
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-5 text-xs lg:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{biz.bookingButtonLabel || "Book"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEW (Visible on < md screen): Exact Preserved Mobile Layout       */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col gap-2.5">
        {/* Photo Slider */}
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

        {/* Rating, Review Count, Trust & Verified Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-black text-white shrink-0">
            <span>{biz.rating || "4.1"}</span>
            <Star className="h-2.5 w-2.5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            {biz.reviewCount || (biz.reviews ? biz.reviews.length : "0")} Ratings
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

        {/* User Review Snippet Quote */}
        <div className="flex items-start gap-1.5 text-xs text-foreground/80 pt-0.5">
          <span className="text-red-500 dark:text-rose-400 text-sm leading-none shrink-0 mt-0.5">💬</span>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground font-normal">
            {reviewQuote}
          </p>
        </div>

        {/* Action Buttons Row: Mobile 3-Button Layout */}
        <div className="flex flex-row items-center gap-1.5 pt-2 border-t border-border/40 w-full">
          <a
            href={`tel:${phoneRaw}`}
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
              onOpenEnquiry(biz);
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
    </div>
  );
}

export default function SearchResultsPage({
  initialQuery,
  initialLocation,
  onBack,
  onBusinessSelect,
  onBookNow,
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
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close modals/dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSortDropdown(false);
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
        const fallbackRes = await fetch(
          `${API_BASE_URL}/businesses?search=${encodeURIComponent(queryTerm.trim())}`
        );
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

  // Collect available Categories / Genders and Amenities for filter dropdowns
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((b) => {
      const lowerName = (b.name || "").toLowerCase();
      if (lowerName.includes("girls")) set.add("Girls");
      if (lowerName.includes("boys")) set.add("Boys");
      if (b.category) set.add(b.category);
      if ((b as any).subcategory) set.add((b as any).subcategory);
      if (b.subCategoryLine) set.add(b.subCategoryLine);
    });
    return Array.from(set).slice(0, 8);
  }, [listings]);

  const availableAmenities = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((b) => {
      if (Array.isArray(b.facilities)) {
        b.facilities.forEach((f) => f && set.add(f));
      }
    });
    if (set.size === 0) {
      ["AC", "WiFi", "Parking", "Card Payment", "CCTV", "Spa", "Massage"].forEach((a) => set.add(a));
    }
    return Array.from(set).slice(0, 8);
  }, [listings]);

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
          return (
            words.every((word) => searchableText.includes(word)) ||
            words.some((word) => searchableText.includes(word))
          );
        }
        return words.some((word) => searchableText.includes(word));
      });

      if (matchedList.length > 0) {
        list = matchedList;
      }
    }

    // 1. Filter: Top Rated (Rating >= 4.0)
    if (filterTopRated) {
      list = list.filter((b) => (parseFloat(String(b.rating || 0)) || 0) >= 4.0);
    }

    // 2. Filter: Verified (Only verified businesses)
    if (filterVerified) {
      list = list.filter((b) => {
        return b.isVerified === true || String(b.isVerified).toLowerCase() === "true" || (b as any).isVerified === 1;
      });
    }

    // 3. Filter: Open Now (Currently open based on openStatus & hours)
    if (filterOpenNow) {
      list = list.filter((b) => {
        const status = (b.openStatus || "").toLowerCase();
        if (status.includes("closed")) return false;
        if (status.includes("open")) return true;

        if (b.openTime && b.closeTime) {
          const now = new Date();
          const currentMins = now.getHours() * 60 + now.getMinutes();
          const parseTimeToMins = (t: string) => {
            const [hh, mm] = t.split(":").map(Number);
            return (hh || 0) * 60 + (mm || 0);
          };
          const startMins = parseTimeToMins(b.openTime);
          const endMins = parseTimeToMins(b.closeTime);
          if (endMins >= startMins) {
            return currentMins >= startMins && currentMins <= endMins;
          } else {
            return currentMins >= startMins || currentMins <= endMins;
          }
        }
        return true;
      });
    }

    // 4. Sorting logic
    if (sortBy === "distance") {
      list.sort((a, b) => {
        const distA = typeof a.distance === "number" && !isNaN(a.distance) ? a.distance : Infinity;
        const distB = typeof b.distance === "number" && !isNaN(b.distance) ? b.distance : Infinity;
        if (distA !== distB) return distA - distB;
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        return rB - rA;
      });
    } else if (sortBy === "rating") {
      list.sort((a, b) => {
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        if (rB !== rA) return rB - rA;
        const rcA = Number(a.reviewCount || (Array.isArray(a.reviews) ? a.reviews.length : 0)) || 0;
        const rcB = Number(b.reviewCount || (Array.isArray(b.reviews) ? b.reviews.length : 0)) || 0;
        return rcB - rcA;
      });
    } else if (sortBy === "reviews") {
      list.sort((a, b) => {
        const rcA = Number(a.reviewCount || (Array.isArray(a.reviews) ? a.reviews.length : 0)) || 0;
        const rcB = Number(b.reviewCount || (Array.isArray(b.reviews) ? b.reviews.length : 0)) || 0;
        if (rcB !== rcA) return rcB - rcA;
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        return rB - rA;
      });
    } else if (sortBy === "default") {
      list.sort((a, b) => {
        const vA = (a.isVerified === true || String(a.isVerified).toLowerCase() === "true" || (a as any).isVerified === 1) ? 1 : 0;
        const vB = (b.isVerified === true || String(b.isVerified).toLowerCase() === "true" || (b as any).isVerified === 1) ? 1 : 0;
        if (vB !== vA) return vB - vA;
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        if (rB !== rA) return rB - rA;
        const rcA = Number(a.reviewCount || (Array.isArray(a.reviews) ? a.reviews.length : 0)) || 0;
        const rcB = Number(b.reviewCount || (Array.isArray(b.reviews) ? b.reviews.length : 0)) || 0;
        return rcB - rcA;
      });
    }

    return list;
  }, [
    listings,
    submittedQuery,
    sortBy,
    filterTopRated,
    filterVerified,
    filterOpenNow,
    userCoords,
  ]);

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
    const wildcard = searchBanners.filter(
      (b) => (b.searchQuery === "*" || !b.searchQuery) && b.img
    );
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
      {/* ========================================================================= */}
      {/* Sticky Header with Justdial / FindMyPoint Search Bar & Location Selector  */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl shrink-0 shadow-xs">
        <div className="mx-auto max-w-6xl w-full px-3 sm:px-6 py-2.5 flex flex-col gap-2">
          {/* Top Row: Back button, Location Selector & Search Input */}
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <button
              onClick={onBack}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors cursor-pointer shrink-0"
              title="Go Back"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>

            {/* Desktop Location Selector (Justdial Style) */}
            <div className="relative hidden md:block shrink-0">
              <button
                type="button"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-secondary/70 text-xs sm:text-sm font-semibold text-foreground cursor-pointer shadow-xs min-w-[170px] justify-between"
              >
                <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                  <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
                  <span className="truncate">{selectedCity || "Select City"}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </div>

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
                placeholder="Search businesses, services, hostels, spa..."
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
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0 transition flex items-center gap-1"
                title="Search"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Location Bar Row on Mobile (< md) */}
          <div className="flex md:hidden items-center justify-between text-xs px-1 text-muted-foreground relative">
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
          </div>

          {/* Location Dropdown Modal */}
          {showLocationDropdown && (
            <div
              ref={locationDropdownRef}
              className="absolute top-full left-3 md:left-14 max-w-sm w-[90vw] mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 p-3 text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
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
                    "Sapna Sangeeta, Indore",
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
      </header>

      {/* ========================================================================= */}
      {/* Main Content Area: Search Filters, Banners, and Listing Cards             */}
      {/* ========================================================================= */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-6 py-4 space-y-4">
        {/* Search Promotional Multiple Banner Carousel / Slider */}
        {matchingSearchBanners.length > 0 && (
          <div className="relative w-full">
            <div className="relative w-full overflow-hidden rounded-2xl shadow-xs border border-border/40 bg-card">
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
                    className="w-full shrink-0 cursor-pointer hover:opacity-95 overflow-hidden"
                  >
                    <img
                      src={
                        banner.img.startsWith("data:") || banner.img.startsWith("http")
                          ? banner.img
                          : `${BACKEND_ORIGIN}${banner.img}`
                      }
                      alt={banner.searchQuery || "Search Banner"}
                      className="w-full h-28 sm:h-36 md:h-44 lg:h-52 object-cover block"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters & Sort Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {/* Custom Sort Dropdown */}
          <div ref={sortDropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                sortBy !== "default"
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border bg-card hover:bg-secondary text-foreground"
              }`}
            >
              <span>
                {sortBy === "rating"
                  ? "Top Rated"
                  : sortBy === "reviews"
                  ? "Most Reviewed"
                  : sortBy === "distance"
                  ? "Nearest Distance"
                  : "Sort by: Default"}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                  showSortDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-card border border-border rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95">
                {[
                  { id: "default", label: "Default" },
                  { id: "rating", label: "Top Rated" },
                  { id: "reviews", label: "Most Reviewed" },
                  { id: "distance", label: "Nearest Distance" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id as any);
                      setShowSortDropdown(false);
                      if (opt.id === "distance" && !userCoords) {
                        handleDetectLocation();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      sortBy === opt.id
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Top Rated Pill */}
          <button
            type="button"
            onClick={() => setFilterTopRated(!filterTopRated)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-all shadow-2xs ${
              filterTopRated
                ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500/30"
                : "border-border bg-card text-foreground/80 hover:bg-secondary"
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
            <span>Top Rated</span>
            {filterTopRated && <X className="h-3 w-3 ml-0.5 text-amber-600 dark:text-amber-400" />}
          </button>

          {/* Verified Pill */}
          <button
            type="button"
            onClick={() => setFilterVerified(!filterVerified)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-all shadow-2xs ${
              filterVerified
                ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-500/30"
                : "border-border bg-card text-foreground/80 hover:bg-secondary"
            }`}
          >
            <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
            <span>Verified</span>
            {filterVerified && <X className="h-3 w-3 ml-0.5 text-blue-500" />}
          </button>

          {/* Open Now Pill */}
          <button
            type="button"
            onClick={() => setFilterOpenNow(!filterOpenNow)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-all shadow-2xs ${
              filterOpenNow
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30"
                : "border-border bg-card text-foreground/80 hover:bg-secondary"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            <span>Open Now</span>
            {filterOpenNow && <X className="h-3 w-3 ml-0.5 text-emerald-500" />}
          </button>

          {/* Reset All Filters button */}
          {(filterTopRated || filterVerified || filterOpenNow || sortBy !== "default") && (
            <button
              type="button"
              onClick={() => {
                setFilterTopRated(false);
                setFilterVerified(false);
                setFilterOpenNow(false);
                setSortBy("default");
              }}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline px-2 py-1 cursor-pointer shrink-0 ml-1"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Heading Title (Popular [Query] in [Location]) */}
        <div className="pt-1 pb-0.5 flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-bold text-foreground">
            Popular {submittedQuery || "Businesses"} in {selectedCity || "your area"}
          </h1>
          {processedListings.length > 0 && (
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Showing {processedListings.length} {processedListings.length === 1 ? "result" : "results"}
            </span>
          )}
        </div>

        {/* Listings Container */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Finding best businesses for you...
            </p>
          </div>
        ) : processedListings.length === 0 ? (
          <div className="min-h-[45vh] flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-border/50 space-y-3">
            <div className="h-12 w-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-foreground">No businesses found matching your criteria</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try clearing some filters or searching for another service or location.
            </p>
            <button
              onClick={() => {
                setFilterTopRated(false);
                setFilterVerified(false);
                setFilterOpenNow(false);
                setSortBy("default");
              }}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-primary/90 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {processedListings.map((biz) => (
              <SearchResultCard
                key={biz.id || (biz as any)._id}
                biz={biz}
                selectedCity={selectedCity}
                onBusinessSelect={onBusinessSelect}
                onBookNow={onBookNow}
                onOpenEnquiry={(bizToEnquire) => {
                  setEnquiryModalBiz(bizToEnquire);
                  setEnquirySubmitted(false);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* ========================================================================= */}
      {/* Enquiry Modal                                                             */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* Booking Modal                                                             */}
      {/* ========================================================================= */}
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
