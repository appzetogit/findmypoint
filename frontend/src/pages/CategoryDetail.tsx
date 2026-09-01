import { useState, useEffect, useReducer, useMemo, useRef } from "react";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  Phone,
  MessageSquare,
  BadgeCheck,
  ChevronRight,
  Clock,
  User,
  X,
  Check,
  ShieldCheck,
  Loader2,
  Map as MapIcon,
  List as ListIcon,
  Navigation,
  SlidersHorizontal,
  Building2,
  Tag,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { BusinessListingData } from "../data/businessesData";
import { useCategories } from "../context/CategoryContext";
import { API_BASE_URL, RAZORPAY_KEY_ID } from "../config";
import { getSubcategoryEmoji } from "../utils/categoryImages";
import { calculateDistanceKm, formatDistance, getCurrentUserLocation, reverseGeocodeCoords } from "../utils/googleMaps";
import CategoryMapView from "../components/map/CategoryMapView";
import { LazyImage } from "../components/ui/LazyImage";





interface CategoryDetailPageProps {
  categoryName: string;
  initialSubcategory?: string | null;
  onBack: () => void;
  onBusinessSelect: (id: string) => void;
  onBookNow?: (id: string) => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  username?: string | null;
  onSearchSubmit?: (query: string, location?: string) => void;
}

// Types and Reducers for Booking Flow
interface BookingState {
  modalOpen: boolean;
  selectedBiz: BusinessListingData | null;
  submitted: boolean;
  step: "form" | "payment" | "success";
  form: Record<string, string>;
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
  upiId: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  processing: boolean;
}

type BookingAction =
  | { type: "OPEN_MODAL"; biz: BusinessListingData; form: Record<string, string> }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "SET_STEP"; step: "form" | "payment" | "success" }
  | { type: "UPDATE_FORM"; fields: Record<string, string> }
  | { type: "SET_PAYMENT_METHOD"; method: "upi" | "card" | "netbanking" | "cod" }
  | {
    type: "SET_PAYMENT_FIELD";
    field: "upiId" | "cardNumber" | "cardExpiry" | "cardCvv";
    value: string;
  }
  | { type: "SET_PROCESSING"; value: boolean }
  | { type: "RESET" };

const initialBookingState: BookingState = {
  modalOpen: false,
  selectedBiz: null,
  submitted: false,
  step: "form",
  form: {},
  paymentMethod: "upi",
  upiId: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  processing: false,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "OPEN_MODAL":
      return {
        ...initialBookingState,
        modalOpen: true,
        selectedBiz: action.biz,
        form: action.form,
      };
    case "CLOSE_MODAL":
      return { ...state, modalOpen: false };
    case "SET_SUBMITTED":
      return { ...state, submitted: action.value };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "UPDATE_FORM":
      return { ...state, form: { ...state.form, ...action.fields } };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };
    case "SET_PAYMENT_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_PROCESSING":
      return { ...state, processing: action.value };
    case "RESET":
      return initialBookingState;
    default:
      return state;
  }
}

// Types and Reducers for Enquiry Flow
interface EnquiryState {
  modalOpen: boolean;
  selectedBiz: BusinessListingData | null;
  submitted: boolean;
  form: {
    name: string;
    phone: string;
    email: string;
    message: string;
  };
}

type EnquiryAction =
  | { type: "OPEN_MODAL"; biz: BusinessListingData; message: string }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "UPDATE_FORM"; fields: Partial<EnquiryState["form"]> }
  | { type: "RESET"; username: string };

const initialEnquiryState = (username: string): EnquiryState => ({
  modalOpen: false,
  selectedBiz: null,
  submitted: false,
  form: {
    name: username || "",
    phone: "",
    email: "",
    message: "",
  },
});

function enquiryReducer(state: EnquiryState, action: EnquiryAction): EnquiryState {
  switch (action.type) {
    case "OPEN_MODAL":
      return {
        ...state,
        modalOpen: true,
        selectedBiz: action.biz,
        submitted: false,
        form: {
          name: state.form.name,
          phone: "",
          email: "",
          message: action.message,
        },
      };
    case "CLOSE_MODAL":
      return { ...state, modalOpen: false };
    case "SET_SUBMITTED":
      return { ...state, submitted: action.value };
    case "UPDATE_FORM":
      return { ...state, form: { ...state.form, ...action.fields } };
    case "RESET":
      return initialEnquiryState(action.username);
    default:
      return state;
  }
}

export default function CategoryDetailPage({
  categoryName,
  initialSubcategory,
  onBack,
  onBusinessSelect,
  onBookNow,
  onSignInClick,
  onProfileClick,
  username,
  onSearchSubmit,
}: CategoryDetailPageProps) {
  const { subcategoriesData, subcatIcons } = useCategories();
  // Get all subcategories for this category dynamically from context/database
  const subcategories = useMemo(
    () => subcategoriesData[categoryName] || [],
    [subcategoriesData, categoryName]
  );

  const [prevCategory, setPrevCategory] = useState(categoryName);
  const [prevInitialSubcat, setPrevInitialSubcat] = useState(initialSubcategory);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  // Set active subcategory dynamically
  const [activeSubcategory, setActiveSubcategory] = useState<string>(
    initialSubcategory && subcategories.includes(initialSubcategory)
      ? initialSubcategory
      : subcategories[0] || "",
  );

  useEffect(() => {
    if (subcategories.length > 0 && (!activeSubcategory || !subcategories.includes(activeSubcategory))) {
      if (initialSubcategory && subcategories.includes(initialSubcategory)) {
        setActiveSubcategory(initialSubcategory);
      } else {
        setActiveSubcategory(subcategories[0]);
      }
    }
  }, [subcategories, initialSubcategory]);

  if (categoryName !== prevCategory || initialSubcategory !== prevInitialSubcat) {
    setPrevCategory(categoryName);
    setPrevInitialSubcat(initialSubcategory);
    setActiveSubcategory(
      initialSubcategory && subcategories.includes(initialSubcategory)
        ? initialSubcategory
        : subcategories[0] || "",
    );
  }

  const [listings, setListings] = useState<BusinessListingData[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Fetch real businesses from API whenever category or subcategory changes
  useEffect(() => {
    setListingsLoading(true);
    let url = `${API_BASE_URL}/businesses?category=${encodeURIComponent(categoryName)}`;
    if (activeSubcategory) {
      url += `&subcategory=${encodeURIComponent(activeSubcategory)}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setListings(data.data);
        } else {
          setListings([]);
        }
      })
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, [categoryName, activeSubcategory]);

  // View mode and Sort state
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<"default" | "distance" | "rating" | "reviews">("default");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    try {
      const saved = localStorage.getItem("fmp_user_coords:v1");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Location selector state dynamically initialized from real saved user location or detected GPS
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    try {
      const savedCity =
        localStorage.getItem("fmp_selected_city:v1") ||
        localStorage.getItem("fmp_selected_location") ||
        localStorage.getItem("fmp_selected_city");
      if (savedCity) return savedCity;

      const coords = localStorage.getItem("fmp_user_coords:v1");
      if (coords) {
        const parsed = JSON.parse(coords);
        return parsed.shortName || parsed.area || parsed.city || "";
      }
    } catch {}
    return "";
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [desktopLocationQuery, setDesktopLocationQuery] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fmp_recent_locations:v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const locationRef = useRef<HTMLDivElement>(null);

  // If no city has been saved yet, auto-detect user's live real location via GPS
  useEffect(() => {
    if (!selectedCity) {
      getCurrentUserLocation()
        .then(async (coords) => {
          if (coords) {
            setUserCoords(coords);
            localStorage.setItem("fmp_user_coords:v1", JSON.stringify(coords));
            const loc = await reverseGeocodeCoords(coords.lat, coords.lng);
            if (loc) {
              const name =
                loc.shortName ||
                (loc.area && loc.city ? `${loc.area}, ${loc.city}` : loc.city) ||
                loc.formattedAddress ||
                "";
              if (name) {
                setSelectedCity(name);
                localStorage.setItem("fmp_selected_city:v1", name);
                localStorage.setItem("fmp_selected_location", name);
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [selectedCity]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      const coords = await getCurrentUserLocation();
      if (coords) {
        setUserCoords(coords);
        localStorage.setItem("fmp_user_coords:v1", JSON.stringify(coords));
        const loc = await reverseGeocodeCoords(coords.lat, coords.lng);
        if (loc && loc.city) {
          const areaStr = loc.area ? `${loc.area}, ${loc.city}` : loc.city;
          handleSelectArea(areaStr);
        }
      }
    } catch (err) {
      console.error("GPS detection failed:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  // Dynamic sliding placeholder phrases without hardcoded mock cities
  const searchPlaceholders = useMemo(
    () => [
      activeSubcategory ? `Search in ${activeSubcategory}` : `Search in ${categoryName}`,
      selectedCity ? `Search in ${selectedCity}` : "Search near me",
      "Restaurants",
      "Hotels",
      "Ayurvedic Spa",
      "Doctors",
      "Hospitals",
      "Beauty Parlour",
      "Electricians",
      "Plumbers",
      "Car Rentals",
      "Coaching Classes",
      "Gym & Fitness",
      "Dentists",
      "Local Businesses",
    ],
    [activeSubcategory, categoryName, selectedCity]
  );

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => prev + 1);
    }, 2800);
    return () => clearInterval(timer);
  }, [searchPlaceholders.length]);

  useEffect(() => {
    if (placeholderIndex === searchPlaceholders.length) {
      const resetTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setPlaceholderIndex(0);
      }, 550);
      return () => clearTimeout(resetTimeout);
    }
  }, [placeholderIndex, searchPlaceholders.length]);

  useEffect(() => {
    if (placeholderIndex === 0 && !isTransitioning) {
      const t = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [placeholderIndex, isTransitioning]);

  // Search states grouped to reduce useState count
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    subcatQuery: "",
  });
  const { query: searchQuery, subcatQuery: subcatSearch } = searchFilters;

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { businesses: [], subcategories: [] };

    const words = q
      .split(/\s+/)
      .map((w) => w.trim())
      .filter(
        (w) =>
          w.length > 1 &&
          !["in", "at", "near", "me", "the", "and", "or", "for", "to", "of"].includes(w)
      );

    const matchedBiz = listings
      .filter((b) => {
        const searchableText = [
          b.name,
          b.location,
          b.address,
          (b as any).cityTown,
          (b as any).district,
          (b as any).state,
          (b as any).pincode,
          b.category,
          (b as any).subcategory,
          (b as any).subCategoryLine,
          (b as any).highlightsName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (words.length > 1) {
          return words.every((word) => searchableText.includes(word));
        }
        return searchableText.includes(q);
      })
      .slice(0, 6);

    const matchedSubcats = subcategories
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 4);

    return { businesses: matchedBiz, subcategories: matchedSubcats };
  }, [searchQuery, listings, subcategories]);

  const [bookingState, dispatchBooking] = useReducer(bookingReducer, initialBookingState);
  const {
    modalOpen: bookingModalOpen,
    selectedBiz: selectedBizForBooking,
    submitted: bookingSubmitted,
    step: bookingStep,
    form: bookingForm,
    paymentMethod,
    upiId,
    cardNumber,
    cardExpiry,
    cardCvv,
    processing: paymentProcessing,
  } = bookingState;

  const [enquiryState, dispatchEnquiry] = useReducer(
    enquiryReducer,
    initialEnquiryState(username || ""),
  );
  const {
    modalOpen: enquiryModalOpen,
    selectedBiz: selectedBizForEnquiry,
    submitted: enquirySubmitted,
    form: enquiryForm,
  } = enquiryState;

  const getBookingPrice = () => {
    if (!selectedBizForBooking) return 0;
    if (categoryName === "Hotel Point") {
      const room = bookingForm.roomType || "";
      if (room.includes("1,999")) return 1999;
      if (room.includes("2,999")) return 2999;
      if (room.includes("4,499")) return 4499;
      return 1999;
    }
    if (categoryName === "Health Care Point" || categoryName === "Doctor Point") {
      const slot = bookingForm.timeslot || "";
      if (slot.includes("300")) return 300;
      if (slot.includes("400")) return 400;
      if (slot.includes("800")) return 800;
      return 300;
    }
    if (categoryName === "Spa Point") return 999;
    if (categoryName === "Tour Point") return 14999;
    if (categoryName === "Car Rental Point") return 2499;
    if (categoryName === "Service Point") return 599;
    if (categoryName === "Education Point") return 1200;
    return 499;
  };

  const handleRazorpayPayment = async (
    amount: number,
    onSuccess: (paymentId: string) => void | Promise<void>
  ) => {
    dispatchBooking({ type: "SET_PROCESSING", value: true });
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      dispatchBooking({ type: "SET_PROCESSING", value: false });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const orderData = await res.json();
      if (!orderData.success || !orderData.data) {
        alert("Failed to initiate payment with Razorpay.");
        dispatchBooking({ type: "SET_PROCESSING", value: false });
        return;
      }

      const { id: order_id, amount: order_amount, currency } = orderData.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order_amount,
        currency,
        name: "FindmyPoint",
        description: "Booking Payment for " + (selectedBizForBooking?.name || "Services"),
        order_id,
        handler: async function (response: any) {
          dispatchBooking({ type: "SET_PROCESSING", value: true });
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            dispatchBooking({ type: "SET_PROCESSING", value: false });
            if (verifyData.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            dispatchBooking({ type: "SET_PROCESSING", value: false });
            alert("Error verifying payment signature.");
          }
        },
        modal: {
          ondismiss: function () {
            dispatchBooking({ type: "SET_PROCESSING", value: false });
          }
        },
        prefill: {
          name: bookingForm.name || username || "Customer",
          contact: bookingForm.phone || ""
        },
        theme: {
          color: "#6366f1"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      dispatchBooking({ type: "SET_PROCESSING", value: false });
      alert("Payment gateway connection failed.");
    }
  };

  // Phone reveal states
  const [prevSubcatKey, setPrevSubcatKey] = useState(`${categoryName}-${activeSubcategory}`);
  const [revealedPhoneIds, setRevealedPhoneIds] = useState<Record<string, boolean>>({});

  const currentSubcatKey = `${categoryName}-${activeSubcategory}`;
  if (currentSubcatKey !== prevSubcatKey) {
    setPrevSubcatKey(currentSubcatKey);
    setRevealedPhoneIds({});
  }

  // Generate or load listings whenever active subcategory changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryName, activeSubcategory]);

  // Handle changing subcategory
  const handleSubcategorySelect = (subcat: string) => {
    setActiveSubcategory(subcat);
  };

  // Handle Sort selection with auto-geolocation trigger for distance
  const handleSortChange = (newSort: "default" | "distance" | "rating" | "reviews") => {
    setSortBy(newSort);
    if (newSort === "distance" && !userCoords && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          try {
            localStorage.setItem("fmp_user_coords:v1", JSON.stringify(coords));
          } catch (e) {}
        },
        (err) => {
          console.warn("Geolocation permission not granted:", err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Process listings with distance and sorting
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
        return { ...b, distance: dist * 1000 };
      }
      return b;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const words = q
        .split(/\s+/)
        .map((w) => w.trim())
        .filter(
          (w) =>
            w.length > 1 &&
            !["in", "at", "near", "me", "the", "and", "or", "for", "to", "of"].includes(w)
        );

      list = list.filter((biz) => {
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
          (biz as any).highlightsName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (words.length > 1) {
          return words.every((word) => searchableText.includes(word));
        }
        return searchableText.includes(q);
      });
    }

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
  }, [listings, searchQuery, sortBy, userCoords]);

  const filteredListings = processedListings;

  // Filter subcategories list based on user search
  const filteredSubcategories = subcategories.filter((sub) =>
    sub.toLowerCase().includes(subcatSearch.toLowerCase()),
  );

  // Handle revealing contact number
  const togglePhoneReveal = (id: string) => {
    setRevealedPhoneIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle opening enquiry modal
  const openEnquiryModal = (biz: BusinessListingData) => {
    dispatchEnquiry({
      type: "OPEN_MODAL",
      biz,
      message: `Hi, I want to enquire about ${activeSubcategory} services from ${biz.name}.`,
    });
  };

  // Handle submitting enquiry
  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.phone) {
      alert("Please fill in your Name and Phone Number.");
      return;
    }
    dispatchEnquiry({ type: "SET_SUBMITTED", value: true });

    if (selectedBizForEnquiry) {
      // Send enquiry to backend API
      fetch(`${API_BASE_URL}/businesses/${selectedBizForEnquiry.id}/enquire`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: enquiryForm.name,
          phone: enquiryForm.phone,
          email: enquiryForm.email || "",
          message: enquiryForm.message || "",
          subject: `Enquiry for ${selectedBizForEnquiry.name}`
        })
      }).then(res => res.json())
        .then(data => {
          if (data.success) {
            window.dispatchEvent(new Event("storage"));
          }
        }).catch(err => console.error("Enquiry submit failed:", err));
    }

    setTimeout(() => {
      dispatchEnquiry({ type: "CLOSE_MODAL" });
    }, 2500);
  };

  // Order/submission creation requires a logged-in customer; openBookingModal
  // already gates on `username`, so a token should exist by submit time.
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("fmp_user_token") || localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  // Persist a booking/order into the Booking DB model so it shows up in customer's My Bookings
  const saveBookingToDb = (opts: {
    id: string;
    amount: number;
    paymentId: string;
    paymentMethod?: string;
    paymentStatus?: string;
    bookingType?: string;
    serviceName?: string;
    formData?: Record<string, any>;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
    date?: string;
    time?: string;
  }) => {
    const userToken = localStorage.getItem("fmp_user_token") || localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    if (!userToken || !selectedBizForBooking) return;

    fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        id: opts.id,
        businessId: selectedBizForBooking.id,
        businessName: selectedBizForBooking.name,
        category: selectedBizForBooking.category,
        service: opts.serviceName || "",
        date: opts.date || "",
        time: opts.time || "",
        amount: opts.amount,
        location: selectedBizForBooking.location || selectedBizForBooking.address || "",
        customerName: opts.customerName || "",
        customerPhone: opts.customerPhone || "",
        customerEmail: opts.customerEmail || "",
        customerAddress: opts.customerAddress || "",
        items: opts.items || [],
        formData: opts.formData || {},
        bookingType: opts.bookingType || "service",
        paymentId: opts.paymentId,
        paymentMethod: opts.paymentMethod || "Razorpay Gateway",
        paymentStatus: opts.paymentStatus || "paid",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.error("Booking save failed:", data.message);
        }
      })
      .catch((err) => console.error("Booking save request failed:", err));
  };

  // Handle opening booking modal
  const openBookingModal = (biz: BusinessListingData) => {
    if (!username) {
      alert("Please sign in to book. You need an account to make a booking.");
      onSignInClick?.();
      return;
    }
    dispatchBooking({
      type: "OPEN_MODAL",
      biz,
      form: {
        name: username || "",
        phone: "",
        email: "",
        date: new Date().toISOString().split("T")[0],
        persons: "1",
        travelers: "1",
        guests: "1",
        roomType: categoryName === "Hotel Point" ? "Deluxe AC Room (₹1,999/night)" : "",
        timeslot:
          categoryName === "Health Care Point" || categoryName === "Doctor Point"
            ? "Morning Slot Consultation (09:00 AM - 01:00 PM) (Fee: ₹300)"
            : "",
      },
    });
  };

  const [chosenPaymentChoice, setChosenPaymentChoice] = useState<"online" | "cod">("online");

  const executeDirectCodBooking = async () => {
    if (!selectedBizForBooking) return;

    const amount = getBookingPrice();
    dispatchBooking({ type: "SET_STEP", step: "success" });
    dispatchBooking({ type: "SET_SUBMITTED", value: true });

    const dataToSave: Record<string, any> = {
      "Full Name": bookingForm.name,
      "Phone Number": bookingForm.phone,
      "Date": bookingForm.date || new Date().toISOString().split("T")[0],
      "Persons/Guests/Travelers": bookingForm.persons || bookingForm.guests || bookingForm.travelers || "1",
      "Room/Timeslot/Package": bookingForm.roomType || bookingForm.timeslot || bookingForm.package || "General Selection",
    };

    try {
      const profRes = await fetch(`${API_BASE_URL}/auth/profile`, { headers: getAuthHeaders() });
      const profData = await profRes.json();
      if (profData.success && profData.user) {
        const prof = profData.user;
        const fullName = [prof.firstName, prof.lastName].filter(Boolean).join(" ");
        if (!dataToSave["Full Name"] && !dataToSave["Customer Name"] && !dataToSave["Your Name"] && !dataToSave["Name"] && fullName) dataToSave["Full Name"] = fullName;
        if (!dataToSave["Phone Number"] && !dataToSave["Phone"] && !dataToSave["Mobile"] && !dataToSave["Mobile Number"] && prof.mobile1) dataToSave["Phone Number"] = prof.mobile1;
        if (!dataToSave["Email"] && !dataToSave["Email Address"] && prof.email) dataToSave["Email"] = prof.email;
      }
    } catch (_) { }

    const formatDateTimeDMY = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      const hrs = String(date.getHours()).padStart(2, "0");
      const mins = String(date.getMinutes()).padStart(2, "0");
      return `${d}/${m}/${y} ${hrs}:${mins}`;
    };

    const bookingId = `BK${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
    setConfirmedOrderId(bookingId);

    fetch(`${API_BASE_URL}/service-forms/${selectedBizForBooking.id}/submissions`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: bookingId,
        businessName: selectedBizForBooking.name,
        data: dataToSave
      })
    }).then(res => res.json())
      .then(data => {
        const details = selectedBizForBooking.category.includes("Hotel Point")
          ? "Room Stay Reservation Deposit"
          : selectedBizForBooking.category.includes("Health Care Point") || selectedBizForBooking.category.includes("Doctor Point")
            ? "Appointment Consultation Fee"
            : "Table Booking Deposit";

        fetch(`${API_BASE_URL}/transactions`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            description: details,
            businessName: selectedBizForBooking.name,
            businessId: selectedBizForBooking.id,
            bookingId: bookingId,
            customerName: dataToSave["Full Name"] || bookingForm.name || "Guest",
            details,
            amount,
            type: "credit",
            paymentMethod: "COD",
            status: "Pending"
          })
        }).then(res => res.json())
          .then(txData => {
            if (txData.success) {
              window.dispatchEvent(new Event("storage"));
            }
          }).catch(err => console.error("API transaction failed:", err));

        saveBookingToDb({
          id: bookingId,
          amount,
          paymentId: "COD",
          paymentMethod: "COD",
          paymentStatus: "pending",
          bookingType: selectedBizForBooking.category.includes("Hotel Point")
            ? "room"
            : selectedBizForBooking.category.includes("Health Care Point") || selectedBizForBooking.category.includes("Doctor Point")
              ? "appointment"
              : "service",
          serviceName: selectedBizForBooking.category.includes("Hotel Point")
            ? "Room Stay Reservation"
            : selectedBizForBooking.category.includes("Health Care Point") || selectedBizForBooking.category.includes("Doctor Point")
              ? "Appointment Consultation"
              : "Table Booking",
          formData: dataToSave,
          customerName: dataToSave["Full Name"] || bookingForm.name || "Guest",
          customerPhone: dataToSave["Phone Number"] || bookingForm.phone || "",
          customerEmail: dataToSave["Email"] || "",
          date: bookingForm.date || "",
          time: bookingForm.time || "",
        });
      }).catch(err => console.error("API booking submission failed:", err));
  };

  // Handle submitting booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) {
      alert("Please fill in your Name and Phone Number.");
      return;
    }
    if (chosenPaymentChoice === "cod") {
      executeDirectCodBooking();
    } else {
      dispatchBooking({ type: "SET_STEP", step: "payment" });
      dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "upi" });
    }
  };

  // Custom fields renderer for booking based on category
  const renderBookingFields = () => {
    const handleFieldChange = (field: string, value: string) => {
      dispatchBooking({ type: "UPDATE_FORM", fields: { [field]: value } });
    };

    switch (categoryName) {
      case "Spa Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingSpaDate"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Booking Date*
                </label>
                <input
                  id="bookingSpaDate"
                  type="date"
                  required
                  value={bookingForm.date || ""}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingSpaPersons"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  No. of Persons*
                </label>
                <input
                  id="bookingSpaPersons"
                  type="number"
                  min="1"
                  required
                  value={bookingForm.persons || "1"}
                  onChange={(e) => handleFieldChange("persons", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="bookingSpaPackage"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Spa Treatment Preferred*
              </label>
              <select
                id="bookingSpaPackage"
                required
                value={bookingForm.package || ""}
                onChange={(e) => handleFieldChange("package", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Select Treatment</option>
                <option value="Aromatherapy Relaxing Massage">Aromatherapy Relaxing Massage</option>
                <option value="Thai Herbal Compression Spa">Thai Herbal Compression Spa</option>
                <option value="Deep Tissue Muscle Relief">Deep Tissue Muscle Relief</option>
                <option value="Luxury Facial Care Combo">Luxury Facial Care Combo</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="bookingSpaTimeslot"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Preferred Time Slot*
              </label>
              <select
                id="bookingSpaTimeslot"
                required
                value={bookingForm.timeslot || ""}
                onChange={(e) => handleFieldChange("timeslot", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Select Time Slot</option>
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
              </select>
            </div>
          </>
        );

      case "Tour Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingTourDate"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Travel Date*
                </label>
                <input
                  id="bookingTourDate"
                  type="date"
                  required
                  value={bookingForm.date || ""}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingTourTravelers"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  No. of Travelers*
                </label>
                <input
                  id="bookingTourTravelers"
                  type="number"
                  min="1"
                  required
                  value={bookingForm.travelers || "1"}
                  onChange={(e) => handleFieldChange("travelers", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingTourDuration"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Package Duration*
                </label>
                <select
                  id="bookingTourDuration"
                  required
                  value={bookingForm.duration || ""}
                  onChange={(e) => handleFieldChange("duration", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Option</option>
                  <option value="3 Days / 2 Nights">3 Days / 2 Nights</option>
                  <option value="5 Days / 4 Nights">5 Days / 4 Nights</option>
                  <option value="7 Days / 6 Nights">7 Days / 6 Nights</option>
                  <option value="12 Days Grand Tour">12 Days Grand Tour</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="bookingTourHotelClass"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Accommodation Class*
                </label>
                <select
                  id="bookingTourHotelClass"
                  required
                  value={bookingForm.hotelClass || ""}
                  onChange={(e) => handleFieldChange("hotelClass", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Hotel Tier</option>
                  <option value="Budget Hotel">Budget Stay</option>
                  <option value="3-Star Hotel">3-Star Premium Hotel</option>
                  <option value="5-Star Hotel">5-Star Luxury Resort</option>
                </select>
              </div>
            </div>
          </>
        );

      case "Job Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingJobExperience"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Experience Level*
                </label>
                <select
                  id="bookingJobExperience"
                  required
                  value={bookingForm.experience || ""}
                  onChange={(e) => handleFieldChange("experience", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Experience</option>
                  <option value="Fresher / Intern">Fresher / Intern</option>
                  <option value="1 - 2 Years">1 - 2 Years</option>
                  <option value="3 - 5 Years">3 - 5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="bookingJobNoticePeriod"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Notice Period*
                </label>
                <select
                  id="bookingJobNoticePeriod"
                  required
                  value={bookingForm.noticePeriod || ""}
                  onChange={(e) => handleFieldChange("noticePeriod", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Notice Period</option>
                  <option value="Immediate Joiner">Immediate Joiner</option>
                  <option value="15 Days Notice">15 Days Notice</option>
                  <option value="30 Days Notice">30 Days Notice</option>
                  <option value="2 Months notice">2 Months notice</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="bookingJobPosition"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Applied Position (Preset)
              </label>
              <input
                id="bookingJobPosition"
                type="text"
                readOnly
                value={activeSubcategory}
                className="w-full rounded-xl border border-border bg-secondary/35 px-3.5 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="bookingJobResume"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Resume Drive Link / Bio*
              </label>
              <textarea
                id="bookingJobResume"
                required
                rows={2}
                value={bookingForm.resume || ""}
                onChange={(e) => handleFieldChange("resume", e.target.value)}
                placeholder="Google Drive, Dropbox, or text bio with contact summary..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
              />
            </div>
          </>
        );

      case "Service Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingServiceDate"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Service Date*
                </label>
                <input
                  id="bookingServiceDate"
                  type="date"
                  required
                  value={bookingForm.date || ""}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingServiceTimeslot"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Time Preference*
                </label>
                <select
                  id="bookingServiceTimeslot"
                  required
                  value={bookingForm.timeslot || ""}
                  onChange={(e) => handleFieldChange("timeslot", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Time Preference</option>
                  <option value="Morning Slot (9:00 AM - 12:00 PM)">
                    Morning Slot (9 AM - 12 PM)
                  </option>
                  <option value="Afternoon Slot (12:00 PM - 04:00 PM)">
                    Afternoon Slot (12 PM - 4 PM)
                  </option>
                  <option value="Evening Slot (04:00 PM - 08:00 PM)">
                    Evening Slot (4 PM - 8 PM)
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="bookingServiceIssue"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Service Description / Concern*
              </label>
              <input
                id="bookingServiceIssue"
                type="text"
                required
                value={bookingForm.issue || ""}
                onChange={(e) => handleFieldChange("issue", e.target.value)}
                placeholder="Briefly state the issue (e.g. AC compressor failure, leaking tap)"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label
                htmlFor="bookingServiceAddress"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Service Address*
              </label>
              <textarea
                id="bookingServiceAddress"
                required
                rows={2}
                value={bookingForm.address || ""}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="Enter complete doorstep address..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
              />
            </div>
          </>
        );

      case "Education Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingEduStudentAge"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Student Age*
                </label>
                <input
                  id="bookingEduStudentAge"
                  type="number"
                  required
                  value={bookingForm.studentAge || ""}
                  onChange={(e) => handleFieldChange("studentAge", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingEduStudentClass"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Class / Standard*
                </label>
                <input
                  id="bookingEduStudentClass"
                  type="text"
                  required
                  value={bookingForm.studentClass || ""}
                  onChange={(e) => handleFieldChange("studentClass", e.target.value)}
                  placeholder="e.g. 10th CBSE, B.Tech 2nd Year, Nursery"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="bookingEduBatchTimings"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Preferred Batch Timing*
              </label>
              <select
                id="bookingEduBatchTimings"
                required
                value={bookingForm.batchTimings || ""}
                onChange={(e) => handleFieldChange("batchTimings", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Select Batch</option>
                <option value="Morning Batch (8:00 AM - 12:00 PM)">
                  Morning Batch (8 AM - 12 PM)
                </option>
                <option value="Evening Batch (4:00 PM - 08:00 PM)">
                  Evening Batch (4 PM - 8 PM)
                </option>
                <option value="Weekend Batch (Sat & Sun)">Weekend Batch (Sat & Sun)</option>
              </select>
            </div>
          </>
        );

      case "Health Care Point":
      case "Doctor Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingHealthPatientAge"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Patient Age*
                </label>
                <input
                  id="bookingHealthPatientAge"
                  type="number"
                  required
                  value={bookingForm.patientAge || ""}
                  onChange={(e) => handleFieldChange("patientAge", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingHealthDate"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Appointment Date*
                </label>
                <input
                  id="bookingHealthDate"
                  type="date"
                  required
                  value={bookingForm.date || ""}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="bookingHealthTimeslot"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Appointment Slot*
              </label>
              <select
                id="bookingHealthTimeslot"
                required
                value={bookingForm.timeslot || ""}
                onChange={(e) => handleFieldChange("timeslot", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Select Slot</option>
                <option value="Morning Slot Consultation (09:00 AM - 01:00 PM) (Fee: ₹300)">
                  Morning Slot (09:00 AM - 01:00 PM) (Fee: ₹300)
                </option>
                <option value="Evening Slot Consultation (05:00 PM - 08:30 PM) (Fee: ₹400)">
                  Evening Slot (05:00 PM - 08:30 PM) (Fee: ₹400)
                </option>
                <option value="Priority / Emergency Walk-in Slot (Fee: ₹800)">
                  Priority / Emergency Slot (Fee: ₹800)
                </option>
              </select>
            </div>
            <div>
              <label
                htmlFor="bookingHealthSymptoms"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Chief Complaint / Symptoms*
              </label>
              <textarea
                id="bookingHealthSymptoms"
                required
                rows={2}
                value={bookingForm.symptoms || ""}
                onChange={(e) => handleFieldChange("symptoms", e.target.value)}
                placeholder="Describe details (fever, body pain, routine health checkup...)"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
              />
            </div>
          </>
        );

      case "Hotel Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingHotelDate"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Check-in Date*
                </label>
                <input
                  id="bookingHotelDate"
                  type="date"
                  required
                  value={bookingForm.date || ""}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingHotelCheckoutDate"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Check-out Date*
                </label>
                <input
                  id="bookingHotelCheckoutDate"
                  type="date"
                  required
                  value={bookingForm.checkoutDate || ""}
                  onChange={(e) => handleFieldChange("checkoutDate", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingHotelGuests"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  No. of Guests*
                </label>
                <input
                  id="bookingHotelGuests"
                  type="number"
                  min="1"
                  required
                  value={bookingForm.guests || "1"}
                  onChange={(e) => handleFieldChange("guests", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingHotelRoomType"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Room Standard Preferred*
                </label>
                <select
                  id="bookingHotelRoomType"
                  required
                  value={bookingForm.roomType || ""}
                  onChange={(e) => handleFieldChange("roomType", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Room</option>
                  <option value="Deluxe AC Room (₹1,999/night)">
                    Deluxe AC Room (₹1,999/night)
                  </option>
                  <option value="Super Deluxe Room (Balcony) (₹2,999/night)">
                    Super Deluxe Room (Balcony) (₹2,999/night)
                  </option>
                  <option value="Luxury Family Suite (₹4,499/night)">
                    Luxury Family Suite (₹4,499/night)
                  </option>
                </select>
              </div>
            </div>
          </>
        );

      case "Car Rental Point":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingCarDate"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Rental Start Date*
                </label>
                <input
                  id="bookingCarDate"
                  type="date"
                  required
                  value={bookingForm.date || ""}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="bookingCarDuration"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Duration Required*
                </label>
                <select
                  id="bookingCarDuration"
                  required
                  value={bookingForm.duration || ""}
                  onChange={(e) => handleFieldChange("duration", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Duration</option>
                  <option value="1 Day rental">1 Day rental</option>
                  <option value="3 Days rental">3 Days rental</option>
                  <option value="5 Days rental">5 Days rental</option>
                  <option value="1 Week or More">1 Week or More</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingCarType"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Vehicle Tier*
                </label>
                <select
                  id="bookingCarType"
                  required
                  value={bookingForm.carType || ""}
                  onChange={(e) => handleFieldChange("carType", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Vehicle Class</option>
                  <option value="Hatchback (Standard)">Hatchback (Standard)</option>
                  <option value="Sedan (Premium Comfort)">Sedan (Premium Comfort)</option>
                  <option value="SUV (7 Seater Family)">SUV (7 Seater Family)</option>
                  <option value="Luxury Sedan (Rolls/Audi)">Luxury Sedan (Rolls/Audi)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="bookingCarDriverOption"
                  className="block text-xs font-bold text-foreground/80 mb-1.5"
                >
                  Driver Option*
                </label>
                <select
                  id="bookingCarDriverOption"
                  required
                  value={bookingForm.driverOption || ""}
                  onChange={(e) => handleFieldChange("driverOption", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Option</option>
                  <option value="Self Drive">Self Drive</option>
                  <option value="Chauffeur Driven (With Driver)">
                    Chauffeur Driven (With Driver)
                  </option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div>
              <label
                htmlFor="bookingDefaultDate"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Preferred Date*
              </label>
              <input
                id="bookingDefaultDate"
                type="date"
                required
                value={bookingForm.date || ""}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label
                htmlFor="bookingDefaultRequirements"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Specific Requirements / Details*
              </label>
              <input
                id="bookingDefaultRequirements"
                type="text"
                required
                value={bookingForm.requirements || ""}
                onChange={(e) => handleFieldChange("requirements", e.target.value)}
                placeholder="Quantity, variations, size, special instructions..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label
                htmlFor="bookingDefaultAddress"
                className="block text-xs font-bold text-foreground/80 mb-1.5"
              >
                Booking / Delivery Address*
              </label>
              <textarea
                id="bookingDefaultAddress"
                required
                rows={2}
                value={bookingForm.address || ""}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="Please enter your complete address details"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="h-screen md:h-auto md:min-h-screen w-full bg-background flex flex-col overflow-hidden md:overflow-visible text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl shrink-0">
        <div className="mx-auto flex h-14 sm:h-16 md:h-20 max-w-7xl items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-6 w-full">
          <button
            onClick={onBack}
            className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border border-border/80 bg-card hover:bg-secondary transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-foreground" />
          </button>

          <a href="/" className="hidden md:flex items-center shrink-0">
            <LazyImage
              src={logoImg}
              alt="FindMyPoint Logo"
              priority={true}
              showSkeleton={false}
              className="h-7 sm:h-8 w-auto shrink-0"
              imgClassName="h-7 sm:h-8 w-auto object-contain shrink-0"
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          {/* Search bar inside subcategory page */}
          <div className="relative flex flex-1 items-center gap-1.5 sm:gap-2.5 md:gap-3 rounded-xl border border-border bg-card px-3 sm:px-4 py-1.5 md:py-2.5 shadow-[var(--shadow-card)] max-w-2xl lg:max-w-3xl min-w-0">
            {/* Clickable Location Selector */}
            <div ref={locationRef} className="hidden sm:block relative shrink-0">
              <button
                type="button"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-1.5 md:gap-2 border-r border-border pr-3 md:pr-4 pl-1 py-1 text-xs sm:text-sm hover:text-primary transition-colors cursor-pointer group max-w-[190px] sm:max-w-[260px] md:max-w-[320px] shrink-0"
                title={`Current Location: ${selectedCity}`}
              >
                <MapPin className="h-4 w-4 text-accent group-hover:text-primary transition-colors shrink-0" />
                <span className="font-semibold text-foreground/90 truncate">
                  {detectingGps ? "Detecting..." : selectedCity || "Select Location"}
                </span>
                <ChevronRight
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${showLocationDropdown ? "rotate-90" : ""}`}
                />
              </button>

              {/* Location Dropdown Modal */}
              {showLocationDropdown && (
                <div className="fixed inset-x-4 top-20 sm:absolute sm:top-[calc(100%+12px)] sm:left-0 sm:min-w-[360px] sm:w-auto bg-card border border-border rounded-2xl shadow-2xl z-[60] text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Location Search Bar Header */}
                  <div className="p-3 border-b border-border/60 bg-secondary/30">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card shadow-xs focus-within:border-primary transition-all">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={desktopLocationQuery}
                        onChange={(e) => setDesktopLocationQuery(e.target.value)}
                        placeholder="Search city, area or locality..."
                        className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground text-foreground min-w-0"
                        autoFocus
                      />
                      {desktopLocationQuery && (
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
                          setShowLocationDropdown(false);
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
                    <div className="p-2 max-h-[280px] overflow-y-auto no-scrollbar space-y-1">
                      {/* Filtered Area Matches from registered businesses */}
                      {listings
                        .map((b: any) => b.location || b.cityTown || b.district)
                        .filter((loc: string, idx: number, arr: string[]) => loc && arr.indexOf(loc) === idx && loc.toLowerCase().includes(desktopLocationQuery.toLowerCase()))
                        .map((loc: string, idx: number) => (
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
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectArea(desktopLocationQuery.trim());
                          setDesktopLocationQuery("");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer text-left group border-t border-border/40 mt-1"
                      >
                        <Search className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-xs font-bold text-primary truncate">
                          Search for "{desktopLocationQuery.trim()}"
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 space-y-1 max-h-[340px] overflow-y-auto no-scrollbar">
                      {/* Detect Live GPS */}
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingGps}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/40 border border-blue-200/60 transition cursor-pointer group disabled:opacity-60"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Navigation className={`h-4 w-4 fill-current ${detectingGps ? "animate-spin" : ""}`} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            {detectingGps ? "Detecting Live Location..." : "Refresh Live GPS Location"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Auto-detects your current address
                          </span>
                        </div>
                      </button>

                      {/* Recent Locations */}
                      {recentLocations.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1">
                            Recent Locations
                          </p>
                          {recentLocations.slice(0, 5).map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => handleSelectArea(loc)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer text-left"
                            >
                              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-[13px] font-semibold text-foreground">{loc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Search Input Form with sliding ticker */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowSuggestions(false);
                if (searchQuery.trim() && onSearchSubmit) {
                  onSearchSubmit(searchQuery.trim(), selectedCity);
                }
              }}
              className="flex flex-1 items-center min-w-0 gap-2 relative"
            >
              <button
                type="submit"
                className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition shrink-0 cursor-pointer"
                title="Search"
              >
                <Search className="h-4 w-4 md:h-4.5 md:w-4.5 text-muted-foreground" />
              </button>
              <div className="relative flex-1 flex items-center min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchFilters((prev) => ({ ...prev, query: e.target.value }))}
                  className="flex-1 bg-transparent px-1.5 py-1 text-xs sm:text-sm md:text-base outline-none text-foreground w-full min-w-0 relative z-10"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                  aria-label="Search listings"
                />
                {!searchQuery && (
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 overflow-hidden pointer-events-none px-1.5">
                    <div
                      className={`flex flex-col w-full ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
                      style={{
                        transform: `translateY(-${placeholderIndex * 24}px)`,
                      }}
                    >
                      {[...searchPlaceholders, searchPlaceholders[0]].map((text, idx) => (
                        <div
                          key={idx}
                          className="h-6 leading-6 flex items-center text-xs sm:text-sm md:text-base text-muted-foreground/80 truncate w-full font-normal shrink-0"
                        >
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchFilters((prev) => ({ ...prev, query: "" }))}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer z-10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && (searchSuggestions.businesses.length > 0 || searchSuggestions.subcategories.length > 0) && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-border rounded-2xl shadow-2xl p-3 z-50 text-left max-h-[380px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {searchSuggestions.subcategories.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                      <Tag className="h-3 w-3 text-purple-500" />
                      <span>Subcategories</span>
                    </div>
                    <div className="space-y-0.5">
                      {searchSuggestions.subcategories.map((sub) => (
                        <div
                          key={sub}
                          onClick={() => {
                            setActiveSubcategory(sub);
                            setSearchFilters((prev) => ({ ...prev, query: "" }));
                            setShowSuggestions(false);
                          }}
                          className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-secondary/70 rounded-xl cursor-pointer text-xs font-semibold text-foreground transition-colors"
                        >
                          <Search className="h-3 w-3 text-muted-foreground" />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchSuggestions.businesses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                      <Building2 className="h-3 w-3 text-indigo-500" />
                      <span>Businesses ({searchSuggestions.businesses.length})</span>
                    </div>
                    <div className="space-y-1">
                      {searchSuggestions.businesses.map((biz) => (
                        <div
                          key={biz.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            onBusinessSelect(biz.canonicalUrl || biz.id);
                          }}
                          className="flex items-center gap-2.5 p-2 hover:bg-secondary/70 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 bg-secondary">
                            <LazyImage
                              src={biz.images?.[0] || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=150&q=80"}
                              alt={biz.name}
                              className="h-full w-full"
                              imgClassName="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{biz.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{biz.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User profile action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0">
            {username ? (
              <button
                onClick={onProfileClick}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold hover:bg-secondary cursor-pointer shrink-0"
              >
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-[10px] sm:text-[11px] font-bold text-white uppercase shrink-0">
                  {username.charAt(0)}
                </div>
                <span className="hidden md:inline max-w-[120px] truncate text-foreground/80">{username}</span>
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="flex items-center gap-1 rounded-full bg-primary px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer shrink-0"
              >
                <User className="h-3.5 w-3.5" /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-6">
        {/* Breadcrumb / Title */}
        <div className="hidden md:flex mb-3 md:mb-5 flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground pl-0.5">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={onBack}>
            Home
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground/70">{categoryName}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-primary">{activeSubcategory}</span>
        </div>

        <div className="flex flex-row w-full gap-3 sm:gap-4 md:gap-6">
          {/* Left Panel: Subcategories Selector */}
          <aside className="w-[80px] sm:w-[90px] md:w-52 lg:w-60 xl:w-64 shrink-0 border-r md:border-none border-border/80 bg-secondary/15 md:bg-transparent flex flex-col md:block overflow-hidden md:overflow-visible h-full md:h-auto">
            <div className="md:sticky md:top-28 md:rounded-2xl md:border md:border-border/80 md:bg-card md:p-3.5 lg:p-4 md:shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden md:overflow-visible h-full md:h-auto w-full bg-transparent md:bg-card">
              {/* Desktop-only header/search */}
              <div className="hidden md:block">
                <h3 className="font-serif text-base lg:text-lg font-bold mb-2.5 pl-1">Subcategories</h3>
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Filter subcategories..."
                    value={subcatSearch}
                    onChange={(e) =>
                      setSearchFilters((prev) => ({ ...prev, subcatQuery: e.target.value }))
                    }
                    className="w-full rounded-xl border border-border bg-background py-1.5 pl-8 pr-2.5 text-xs outline-none focus:border-accent transition-colors"
                    aria-label="Filter subcategories"
                  />
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Subcategories list */}
              <div className="flex-1 md:flex-none md:max-h-[380px] md:overflow-y-auto no-scrollbar flex flex-col p-0 md:gap-1">
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((subcat) => {
                    const isSelected = activeSubcategory === subcat;
                    return (
                      <button
                        key={subcat}
                        onClick={() => handleSubcategorySelect(subcat)}
                        className={`relative transition-all duration-300 cursor-pointer border-b border-border/20 md:border md:rounded-xl shrink-0 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start text-center md:text-left ${isSelected
                            ? "text-accent bg-background md:bg-primary md:border-primary md:text-primary-foreground font-black md:font-bold shadow-none md:shadow-sm"
                            : "text-muted-foreground md:text-foreground/80 bg-transparent md:bg-background border-transparent md:border-border hover:bg-secondary/10 md:hover:bg-secondary md:hover:text-primary"
                          } px-1 sm:px-2 py-3 md:px-3 lg:px-3.5 md:py-2 gap-1 md:gap-2 text-[10px] sm:text-[11px] md:text-xs lg:text-[13px]`}
                      >
                        {/* Active vertical indicator line on mobile */}
                        {isSelected && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r md:hidden" />
                        )}
                        {/* Subcategory Icon (Mobile only) */}
                        <span className="text-xl md:hidden shrink-0 flex items-center justify-center">
                          {subcatIcons[subcat] ? (
                            <LazyImage
                              src={subcatIcons[subcat]}
                              alt={subcat}
                              className="h-5 w-5 rounded-md overflow-hidden"
                              imgClassName="h-full w-full object-contain"
                            />
                          ) : (
                            getSubcategoryEmoji(categoryName, subcat)
                          )}
                        </span>
                        <span className="line-clamp-2 md:line-clamp-none leading-tight md:leading-normal">
                          {subcat}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center w-full">
                    No matches found
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Right Panel: Business Listings */}
          <section className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between gap-3 mb-4 md:mb-5 w-full">
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate leading-tight">
                  Top {activeSubcategory} in {categoryName}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  {listingsLoading
                    ? "Loading listings..."
                    : `Showing ${filteredListings.length} verified listing${filteredListings.length !== 1 ? 's' : ''} ready to assist you.`}
                </p>
              </div>

              {/* View & Sort Controls */}
              <div className="shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="bg-card border border-border text-foreground text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs outline-none cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <option value="default">Default Sort</option>
                  <option value="distance">📍 Nearest to Me</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="reviews">💬 Most Reviewed</option>
                </select>
              </div>
            </div>

            {/* Map View Mode Render */}
            {viewMode === "map" ? (
              <CategoryMapView
                businesses={filteredListings}
                onBusinessSelect={onBusinessSelect}
                userCoords={userCoords}
              />
            ) : listingsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground">
                  {searchQuery ? "No businesses match your search" : "No businesses registered yet"}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {searchQuery
                    ? "Try a different keyword or clear the search."
                    : `No verified ${activeSubcategory} businesses have been registered for this area yet. Check back soon!`}
                </p>
              </div>
            ) : (
              <div key={activeSubcategory} className="flex flex-col gap-3 sm:gap-4 md:gap-5 animate-fade-in-up">
                {filteredListings.map((biz) => {
                  const distKm = biz.distance ? biz.distance / 1000 : null;
                  const distFormatted = distKm ? formatDistance(distKm) : null;
                  return (
                    <div key={biz.id}>
                      {/* Mobile View Compact Card (< sm) */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onBusinessSelect(biz.canonicalUrl || biz.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onBusinessSelect(biz.canonicalUrl || biz.id);
                          }
                        }}
                        className="sm:hidden group flex flex-col overflow-hidden rounded-xl border border-border bg-card p-2.5 gap-2 transition-all duration-300 cursor-pointer block no-underline text-inherit"
                      >
                        {/* Top part: Image + Info Row */}
                        <div className="flex flex-row gap-2.5 items-start w-full">
                          {/* Image */}
                          <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-secondary shrink-0">
                            <LazyImage
                              src={biz.images[0]}
                              alt={biz.name}
                              className="h-full w-full"
                              imgClassName="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-start">
                            <div className="flex items-center justify-between gap-1">
                              <h2 className="font-serif text-xs font-bold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                                {biz.name}
                              </h2>
                            </div>

                            {/* Ratings */}
                            <div className="mt-0.5 flex items-center gap-1">
                              <div className="flex items-center gap-0.5 rounded bg-amber-500 px-1 py-[1px] text-[8.5px] font-black text-white shrink-0">
                                <span>{biz.rating}</span>
                                <Star className="h-2 w-2 fill-current" />
                              </div>
                              <span className="text-[9px] font-semibold text-muted-foreground">
                                {biz.reviewCount} Ratings
                              </span>
                            </div>

                            {/* Address & Timings */}
                            <div className="mt-1 space-y-0.5 text-[10px] text-foreground/80">
                              <p className="flex items-start gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-tight">{biz.address}</span>
                              </p>
                              <p className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3 text-muted-foreground/80 shrink-0" />
                                <span className="line-clamp-1">{biz.timings}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Horizontal Buttons Row */}
                        <div className="flex flex-row items-center gap-1 pt-1.5 border-t border-border/40 w-full">
                          <a
                            href={`tel:${biz.phone.replace(/[^0-9+]/g, "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-0.5 rounded-lg border border-border bg-background py-1 text-[9px] font-bold text-foreground cursor-pointer whitespace-nowrap"
                          >
                            <Phone className="h-2.5 w-2.5 text-accent" />
                            Call
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEnquiryModal(biz);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-0.5 rounded-lg bg-primary py-1 text-[9px] font-bold text-primary-foreground cursor-pointer shadow-sm whitespace-nowrap"
                          >
                            <MessageSquare className="h-2.5 w-2.5" />
                            Enquire
                          </button>

                          {(() => {
                            const bookNowEnabled = !biz.isBookingDisabled;
                            return bookNowEnabled ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onBookNow) {
                                    onBookNow(biz.id);
                                  } else {
                                    openBookingModal(biz);
                                  }
                                }}
                                className="flex-1 inline-flex items-center justify-center gap-0.5 rounded-lg bg-emerald-600 py-1 text-[9px] font-bold text-white cursor-pointer shadow-sm whitespace-nowrap"
                              >
                                <Check className="h-2.5 w-2.5" />
                                {biz.bookingButtonLabel || "Book"}
                              </button>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      {/* Tablet/Desktop View Rich Card (>= sm) */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onBusinessSelect(biz.canonicalUrl || biz.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onBusinessSelect(biz.canonicalUrl || biz.id);
                          }
                        }}
                        className="hidden sm:flex group flex-row overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4 lg:p-4.5 transition-all duration-300 hover:border-primary/20 hover:shadow-md cursor-pointer block no-underline text-inherit"
                      >
                        {/* Left: Listing Image */}
                        <div className="relative h-36 w-36 sm:h-38 sm:w-44 md:h-40 md:w-48 lg:h-44 lg:w-56 overflow-hidden rounded-xl bg-secondary shrink-0">
                          <LazyImage
                            src={biz.images[0]}
                            alt={biz.name}
                            className="h-full w-full"
                            imgClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Right: Info details */}
                        <div className="flex flex-1 flex-col justify-between ml-3 sm:ml-4 lg:ml-5 min-w-0">
                          <div>
                            {/* Title & Badges in elegant stacked layout */}
                            <div className="space-y-1">
                              <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground transition-colors leading-snug">
                                {biz.name}
                              </h2>

                              {/* Badges & Rating Row */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <div className="flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] sm:text-xs font-black text-white shrink-0">
                                  <span>{biz.rating}</span>
                                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">
                                  {biz.reviewCount} Ratings
                                </span>

                                {biz.isVerified ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Verified
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* Address & Timings */}
                            <div className="mt-2.5 space-y-1 text-xs sm:text-[13px] text-foreground/80">
                              <p className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{biz.address}</span>
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/80 shrink-0" />
                                  <span>{biz.timings}</span>
                                </div>
                                <span className="font-bold text-emerald-600 text-[11px] sm:text-xs shrink-0">
                                  • Open Now
                                </span>
                              </div>
                              {categoryName === "Hotel Point" && biz.products && biz.products[0] && (
                                <p className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs sm:text-[13px] mt-1">
                                  <span>
                                    Rooms starting from:{" "}
                                    <span className="underline">{biz.products[0].price}</span>
                                  </span>
                                </p>
                              )}
                              {(categoryName === "Health Care Point" ||
                                categoryName === "Doctor Point") &&
                                biz.products &&
                                biz.products[0] && (
                                  <p className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs sm:text-[13px] mt-1">
                                    <span>
                                      OPD Consult Fee:{" "}
                                      <span className="underline">{biz.products[0].price}</span>
                                    </span>
                                  </p>
                                )}
                            </div>
                          </div>

                          {/* Actions buttons: Responsive single line */}
                          <div className="mt-3 sm:mt-4 flex flex-nowrap items-center gap-1.5 sm:gap-2 pt-2.5 border-t border-border/50 overflow-x-auto no-scrollbar">
                            <a
                              href={`tel:${biz.phone.replace(/[^0-9+]/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-border bg-background px-2.5 sm:px-3.5 md:px-4 py-1.5 text-[10px] sm:text-[11px] md:text-xs font-bold text-foreground transition-all hover:bg-secondary cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent" />
                              Call
                            </a>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEnquiryModal(biz);
                              }}
                              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-primary px-3 sm:px-4 md:px-5 py-1.5 text-[10px] sm:text-[11px] md:text-xs font-bold text-primary-foreground transition-all hover:bg-primary/95 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                            >
                              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Enquire Now
                            </button>

                            {(() => {
                              const bookNowEnabled = !biz.isBookingDisabled;
                              return bookNowEnabled ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onBookNow) {
                                      onBookNow(biz.id);
                                    } else {
                                      openBookingModal(biz);
                                    }
                                  }}
                                  className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-emerald-600 px-3 sm:px-4 md:px-5 py-1.5 text-[10px] sm:text-[11px] md:text-xs font-bold text-white transition-all hover:bg-emerald-700 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                                >
                                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {biz.bookingButtonLabel || "Book"}
                                </button>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Enquiry Modal */}
      {enquiryModalOpen && selectedBizForEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="relative w-full h-full sm:h-auto max-w-none sm:max-w-md rounded-none sm:rounded-2xl border-0 sm:border border-border bg-card p-5 sm:p-6 shadow-2xl animate-fade-in-up max-h-full sm:max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => dispatchEnquiry({ type: "CLOSE_MODAL" })}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {!enquirySubmitted ? (
              <form onSubmit={handleEnquirySubmit}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">Send Enquiry</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Send your enquiry to{" "}
                  <span className="font-bold text-primary">{selectedBizForEnquiry.name}</span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="enquiryName"
                      className="block text-xs font-bold text-foreground/80 mb-1.5"
                    >
                      Your Name*
                    </label>
                    <input
                      id="enquiryName"
                      type="text"
                      required
                      value={enquiryForm.name}
                      onChange={(e) =>
                        dispatchEnquiry({ type: "UPDATE_FORM", fields: { name: e.target.value } })
                      }
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enquiryPhone"
                      className="block text-xs font-bold text-foreground/80 mb-1.5"
                    >
                      Phone Number*
                    </label>
                    <input
                      id="enquiryPhone"
                      type="tel"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) =>
                        dispatchEnquiry({ type: "UPDATE_FORM", fields: { phone: e.target.value } })
                      }
                      placeholder="Enter 10-digit mobile number"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enquiryEmail"
                      className="block text-xs font-bold text-foreground/80 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="enquiryEmail"
                      type="email"
                      value={enquiryForm.email}
                      onChange={(e) =>
                        dispatchEnquiry({ type: "UPDATE_FORM", fields: { email: e.target.value } })
                      }
                      placeholder="Enter your email (optional)"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enquiryMessage"
                      className="block text-xs font-bold text-foreground/80 mb-1.5"
                    >
                      Message / Requirements
                    </label>
                    <textarea
                      id="enquiryMessage"
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) =>
                        dispatchEnquiry({
                          type: "UPDATE_FORM",
                          fields: { message: e.target.value },
                        })
                      }
                      placeholder="Describe your requirements..."
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer shadow-md"
                >
                  Submit Enquiry
                </button>
              </form>
            ) : (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">Enquiry Sent!</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your requirements have been successfully sent to{" "}
                  <span className="font-semibold text-primary">{selectedBizForEnquiry.name}</span>.
                  They will call you back shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && selectedBizForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md my-auto rounded-3xl sm:rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => dispatchBooking({ type: "CLOSE_MODAL" })}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {bookingStep === "form" && (
              <form onSubmit={handleBookingSubmit}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">Book Services</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure booking with{" "}
                  <span className="font-bold text-primary">{selectedBizForBooking.name}</span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="bookingContactName"
                      className="block text-xs font-bold text-foreground/80 mb-1.5"
                    >
                      Contact Name*
                    </label>
                    <input
                      id="bookingContactName"
                      type="text"
                      required
                      value={bookingForm.name || ""}
                      onChange={(e) =>
                        dispatchBooking({ type: "UPDATE_FORM", fields: { name: e.target.value } })
                      }
                      placeholder="Enter customer name"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bookingPhone"
                      className="block text-xs font-bold text-foreground/80 mb-1.5"
                    >
                      Phone Number*
                    </label>
                    <input
                      id="bookingPhone"
                      type="tel"
                      required
                      value={bookingForm.phone || ""}
                      onChange={(e) =>
                        dispatchBooking({ type: "UPDATE_FORM", fields: { phone: e.target.value } })
                      }
                      placeholder="Enter mobile number"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  {/* Render custom fields based on current category */}
                  {renderBookingFields()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
                  <button
                    type="submit"
                    onClick={() => setChosenPaymentChoice("online")}
                    className="w-full rounded-xl bg-emerald-600 py-3.5 px-3 text-[11px] sm:text-xs font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md flex items-center justify-between gap-1.5 whitespace-nowrap overflow-hidden"
                  >
                    <span className="whitespace-nowrap truncate">💳 Pay Online</span>
                    <span className="opacity-90 whitespace-nowrap shrink-0">₹{getBookingPrice()}</span>
                  </button>
                  <button
                    type="submit"
                    onClick={() => setChosenPaymentChoice("cod")}
                    className="w-full rounded-xl bg-amber-600 py-3.5 px-3 text-[11px] sm:text-xs font-bold text-white hover:bg-amber-700 transition-all cursor-pointer shadow-md flex items-center justify-between gap-1.5 whitespace-nowrap overflow-hidden"
                  >
                    <span className="whitespace-nowrap truncate">💵 Cash on Delivery</span>
                    <span className="opacity-90 whitespace-nowrap shrink-0">₹{getBookingPrice()}</span>
                  </button>
                </div>
              </form>
            )}

            {bookingStep === "payment" && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Secure Payment Gateway
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Transactions are encrypted with SSL security
                    </p>
                  </div>
                </div>

                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3.5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Booking Deposit Amount
                    </span>
                    <span className="text-[11px] font-semibold text-foreground/80 mt-0.5">
                      {selectedBizForBooking.name}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-foreground">₹{getBookingPrice()}</span>
                </div>

                {paymentProcessing ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-foreground mt-2">
                      Processing Payment Securely...
                    </span>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed mx-auto">
                      Do not reload the page or close this modal
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">
                        Select Payment Method
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "upi" })
                          }
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "upi" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          UPI / QR
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "card" })
                          }
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "card" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Card
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "netbanking" })
                          }
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "netbanking" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Net Banking
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "cod" })
                          }
                          className={`py-2 text-[10px] sm:text-[10.5px] font-bold border rounded-xl cursor-pointer whitespace-nowrap ${paymentMethod === "cod" ? "bg-amber-600 border-amber-600 text-white" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          <span className="whitespace-nowrap">💵 Cash on Delivery</span>
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "cod" && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300 font-semibold space-y-1">
                        <p className="font-bold">Pay Cash on Service (COD)</p>
                        <p className="text-[11px] opacity-90">Pay ₹{getBookingPrice()} directly in cash when you arrive or receive the service.</p>
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor="bookingUpiId"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            Enter UPI ID
                          </label>
                          <input
                            id="bookingUpiId"
                            type="text"
                            placeholder="username@okaxis, user@upi..."
                            required
                            value={upiId}
                            onChange={(e) =>
                              dispatchBooking({
                                type: "SET_PAYMENT_FIELD",
                                field: "upiId",
                                value: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/30">
                          <span className="text-[10px] font-semibold leading-relaxed">
                            Or scan any UPI QR code in your payment app to complete purchase.
                          </span>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label
                            htmlFor="bookingCardNumber"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            Card Number
                          </label>
                          <input
                            id="bookingCardNumber"
                            type="text"
                            maxLength={19}
                            placeholder="4111 2222 3333 4444"
                            required
                            value={cardNumber}
                            onChange={(e) =>
                              dispatchBooking({
                                type: "SET_PAYMENT_FIELD",
                                field: "cardNumber",
                                value: e.target.value
                                  .replace(/\s?/g, "")
                                  .replace(/(\d{4})/g, "$1 ")
                                  .trim(),
                              })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="bookingCardExpiry"
                              className="block text-xs font-bold text-foreground/80 mb-1.5"
                            >
                              Expiry Date
                            </label>
                            <input
                              id="bookingCardExpiry"
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              required
                              value={cardExpiry}
                              onChange={(e) =>
                                dispatchBooking({
                                  type: "SET_PAYMENT_FIELD",
                                  field: "cardExpiry",
                                  value: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="bookingCardCvv"
                              className="block text-xs font-bold text-foreground/80 mb-1.5"
                            >
                              CVV Code
                            </label>
                            <input
                              id="bookingCardCvv"
                              type="password"
                              maxLength={3}
                              placeholder="***"
                              required
                              value={cardCvv}
                              onChange={(e) =>
                                dispatchBooking({
                                  type: "SET_PAYMENT_FIELD",
                                  field: "cardCvv",
                                  value: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor="bookingBankSelect"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            Select Bank
                          </label>
                          <select
                            id="bookingBankSelect"
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          >
                            <option>State Bank of India (SBI)</option>
                            <option>HDFC Bank</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const amount = getBookingPrice();
                        const isCOD = paymentMethod === "cod";

                        const completeBookingFlow = async (paymentId: string) => {
                          dispatchBooking({ type: "SET_STEP", step: "success" });
                          dispatchBooking({ type: "SET_SUBMITTED", value: true });

                          if (selectedBizForBooking) {
                            const dataToSave: Record<string, any> = {
                              "Full Name": bookingForm.name,
                              "Phone Number": bookingForm.phone,
                              "Date": bookingForm.date || new Date().toISOString().split("T")[0],
                              "Persons/Guests/Travelers": bookingForm.persons || bookingForm.guests || bookingForm.travelers || "1",
                              "Room/Timeslot/Package": bookingForm.roomType || bookingForm.timeslot || bookingForm.package || "General Selection",
                            };

                            try {
                              const profRes = await fetch(`${API_BASE_URL}/auth/profile`, { headers: getAuthHeaders() });
                              const profData = await profRes.json();
                              if (profData.success && profData.user) {
                                const prof = profData.user;
                                const fullName = [prof.firstName, prof.lastName].filter(Boolean).join(" ");
                                if (!dataToSave["Full Name"] && !dataToSave["Customer Name"] && !dataToSave["Your Name"] && !dataToSave["Name"] && fullName) dataToSave["Full Name"] = fullName;
                                if (!dataToSave["Phone Number"] && !dataToSave["Phone"] && !dataToSave["Mobile"] && !dataToSave["Mobile Number"] && prof.mobile1) dataToSave["Phone Number"] = prof.mobile1;
                                if (!dataToSave["Email"] && !dataToSave["Email Address"] && prof.email) dataToSave["Email"] = prof.email;
                              }
                            } catch (_) { }

                            const formatDateTimeDMY = (date: Date) => {
                              const d = String(date.getDate()).padStart(2, "0");
                              const m = String(date.getMonth() + 1).padStart(2, "0");
                              const y = date.getFullYear();
                              const hrs = String(date.getHours()).padStart(2, "0");
                              const mins = String(date.getMinutes()).padStart(2, "0");
                              return `${d}/${m}/${y} ${hrs}:${mins}`;
                            };

                            const bookingId = `BK${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
                            setConfirmedOrderId(bookingId);

                            fetch(`${API_BASE_URL}/service-forms/${selectedBizForBooking.id}/submissions`, {
                              method: "POST",
                              headers: getAuthHeaders(),
                              body: JSON.stringify({
                                id: bookingId,
                                businessName: selectedBizForBooking.name,
                                data: dataToSave
                              })
                            }).then(res => res.json())
                              .then(data => {
                                const details = selectedBizForBooking.category.includes("Hotel Point")
                                  ? "Room Stay Reservation Deposit"
                                  : selectedBizForBooking.category.includes("Health Care Point") || selectedBizForBooking.category.includes("Doctor Point")
                                    ? "Appointment Consultation Fee"
                                    : "Table Booking Deposit";

                                fetch(`${API_BASE_URL}/transactions`, {
                                  method: "POST",
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({
                                    description: details,
                                    businessName: selectedBizForBooking.name,
                                    businessId: selectedBizForBooking.id,
                                    bookingId: bookingId,
                                    customerName: dataToSave["Full Name"] || bookingForm.name || "Guest",
                                    details,
                                    amount,
                                    type: "credit",
                                    paymentMethod: isCOD ? "COD" : "Razorpay Gateway",
                                    status: isCOD ? "Pending" : "Completed"
                                  })
                                }).then(res => res.json())
                                  .then(txData => {
                                    if (txData.success) {
                                      window.dispatchEvent(new Event("storage"));
                                    }
                                  }).catch(err => console.error("API transaction failed:", err));

                                saveBookingToDb({
                                  id: bookingId,
                                  amount,
                                  paymentId: isCOD ? "COD" : paymentId,
                                  paymentMethod: isCOD ? "COD" : "Online",
                                  paymentStatus: isCOD ? "pending" : "paid",
                                  bookingType: selectedBizForBooking.category.includes("Hotel Point")
                                    ? "room"
                                    : selectedBizForBooking.category.includes("Health Care Point") || selectedBizForBooking.category.includes("Doctor Point")
                                      ? "appointment"
                                      : "service",
                                  serviceName: selectedBizForBooking.category.includes("Hotel Point")
                                    ? "Room Stay Reservation"
                                    : selectedBizForBooking.category.includes("Health Care Point") || selectedBizForBooking.category.includes("Doctor Point")
                                      ? "Appointment Consultation"
                                      : "Table Booking",
                                  formData: dataToSave,
                                  customerName: dataToSave["Full Name"] || bookingForm.name || "Guest",
                                  customerPhone: dataToSave["Phone Number"] || bookingForm.phone || "",
                                  customerEmail: dataToSave["Email"] || "",
                                  date: bookingForm.date || "",
                                  time: bookingForm.time || "",
                                });
                              }).catch(err => console.error("API booking submission failed:", err));
                          }
                        };

                        if (isCOD) {
                          completeBookingFlow("COD");
                        } else {
                          handleRazorpayPayment(amount, completeBookingFlow);
                        }
                      }}
                      className="w-full mt-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md text-center"
                    >
                      {paymentMethod === "cod" ? "Confirm Booking (Cash on Delivery)" : `Pay ₹${getBookingPrice()} & Complete Booking`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {bookingStep === "success" && (
              <div className="py-8 text-center flex flex-col items-center justify-center my-auto">
                <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-xs">
                  <Check className="h-8 w-8 stroke-[3px]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1.5">
                  Booking Confirmed!
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Your booking has been placed with{" "}
                  <span className="font-semibold text-primary">{selectedBizForBooking.name}</span>. Booking ID:{" "}
                  <span className="font-bold text-foreground">
                    #{confirmedOrderId || "BK-7689"}
                  </span>
                  . You will receive an SMS confirmation shortly.
                </p>
                <button
                  type="button"
                  onClick={() => dispatchBooking({ type: "CLOSE_MODAL" })}
                  className="mt-6 w-full max-w-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-2.5 shadow-md transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
