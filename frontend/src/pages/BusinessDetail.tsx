import { useState, useEffect, useReducer } from "react";
import {
  MapPin, Clock, ArrowLeft, Bookmark, Share2,
  CheckCircle, MessageSquare, Phone, ArrowRight, Star,
  Globe, ShieldCheck, ChevronDown, ChevronUp, Send, Navigation, X, Check
} from "lucide-react";
import logoImg from "@/assets/logo.jpeg";
import { businessesData, BusinessListingData } from "../data/businessesData";
import Footer from "./Footer";

// Types and Reducers for Booking Flow
interface BookingState {
  modalOpen: boolean;
  submitted: boolean;
  step: "form" | "payment" | "success";
  form: {
    name: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
  };
}

type BookingAction =
  | { type: "SET_MODAL"; open: boolean }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "SET_STEP"; step: "form" | "payment" | "success" }
  | { type: "UPDATE_FORM"; fields: Partial<BookingState["form"]> }
  | { type: "RESET"; username: string };

const initialBookingState = (username: string): BookingState => ({
  modalOpen: false,
  submitted: false,
  step: "form",
  form: {
    name: username || "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "Dinner (07:00 PM - 11:00 PM)",
    guests: "2"
  }
});

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_MODAL":
      return { ...state, modalOpen: action.open };
    case "SET_SUBMITTED":
      return { ...state, submitted: action.value };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "UPDATE_FORM":
      return { ...state, form: { ...state.form, ...action.fields } };
    case "RESET":
      return initialBookingState(action.username);
    default:
      return state;
  }
}

// Types and Reducers for Checkout Flow
interface CheckoutState {
  modalOpen: boolean;
  submitted: boolean;
  step: "form" | "payment" | "success";
  form: {
    name: string;
    phone: string;
    address: string;
    type: string;
    notes: string;
  };
}

type CheckoutAction =
  | { type: "SET_MODAL"; open: boolean }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "SET_STEP"; step: "form" | "payment" | "success" }
  | { type: "UPDATE_FORM"; fields: Partial<CheckoutState["form"]> }
  | { type: "RESET"; username: string };

const initialCheckoutState = (username: string): CheckoutState => ({
  modalOpen: false,
  submitted: false,
  step: "form",
  form: {
    name: username || "",
    phone: "",
    address: "",
    type: "Delivery",
    notes: ""
  }
});

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_MODAL":
      return { ...state, modalOpen: action.open };
    case "SET_SUBMITTED":
      return { ...state, submitted: action.value };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "UPDATE_FORM":
      return { ...state, form: { ...state.form, ...action.fields } };
    case "RESET":
      return initialCheckoutState(action.username);
    default:
      return state;
  }
}

// Types and Reducers for Payment
interface PaymentState {
  method: "upi" | "card" | "netbanking";
  upiId: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  processing: boolean;
}

type PaymentAction =
  | { type: "SET_METHOD"; method: "upi" | "card" | "netbanking" }
  | { type: "SET_FIELD"; field: "upiId" | "cardNumber" | "cardExpiry" | "cardCvv"; value: string }
  | { type: "SET_PROCESSING"; value: boolean }
  | { type: "RESET" };

const initialPaymentState: PaymentState = {
  method: "upi",
  upiId: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  processing: false
};

function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case "SET_METHOD":
      return { ...state, method: action.method };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_PROCESSING":
      return { ...state, processing: action.value };
    case "RESET":
      return initialPaymentState;
    default:
      return state;
  }
}

interface BusinessDetailPageProps {
  businessId: string;
  onBack: () => void;
  onBusinessSelect?: (id: string) => void;
  scrollToReview?: boolean;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  username?: string | null;
}

export default function BusinessDetailPage({ businessId, onBack, onBusinessSelect, scrollToReview, onSignInClick, onProfileClick, username }: BusinessDetailPageProps) {
  const business: BusinessListingData | undefined = businessesData.find((b) => b.id === businessId);

  // Fallback if not found
  const currentBiz = business || businessesData[0];

  const [bookingState, dispatchBooking] = useReducer(bookingReducer, initialBookingState(username || ""));
  const { modalOpen: bookingModalOpen, submitted: bookingSubmitted, step: bookingStep, form: bookingForm } = bookingState;

  const [checkoutState, dispatchCheckout] = useReducer(checkoutReducer, initialCheckoutState(username || ""));
  const { modalOpen: checkoutModalOpen, submitted: checkoutSubmitted, step: checkoutStep, form: checkoutForm } = checkoutState;

  const [paymentState, dispatchPayment] = useReducer(paymentReducer, initialPaymentState);
  const { method: paymentMethod, upiId, cardNumber, cardExpiry, cardCvv, processing: paymentProcessing } = paymentState;

  const [prevBusinessId, setPrevBusinessId] = useState(businessId);
  const [uiState, setUiState] = useState({
    revealPhone: false,
    activeFaqIndex: null as number | null,
    productSearch: "",
    bookmarked: false,
    enquirySubmitted: false
  });

  if (businessId !== prevBusinessId) {
    setPrevBusinessId(businessId);
    setUiState(prev => ({
      ...prev,
      revealPhone: false,
      enquirySubmitted: false,
      activeFaqIndex: null,
      productSearch: ""
    }));
  }

  const { revealPhone, activeFaqIndex, productSearch, bookmarked, enquirySubmitted } = uiState;

  // Food menu cart state
  const [cart, setCart] = useState<Record<string, number>>({});

  const getBookingPrice = () => {
    if (currentBiz.category.includes("Hotel Point")) {
      const room = bookingForm.guests || "";
      if (room.includes("1,999")) return 1999;
      if (room.includes("2,999")) return 2999;
      if (room.includes("4,499")) return 4499;
      return 1999;
    }
    if (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")) {
      const slot = bookingForm.time || "";
      if (slot.includes("300")) return 300;
      if (slot.includes("400")) return 400;
      if (slot.includes("800")) return 800;
      return 300;
    }
    return 250; // Restaurant table deposit
  };

  // Dynamic calculations for cart totals
  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalCartPrice = Object.entries(cart).reduce((sum, [name, qty]) => {
    const item = currentBiz.products.find(p => p.name === name);
    if (!item) return sum;
    const priceNum = parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
    return sum + priceNum * qty;
  }, 0);

  const addToCart = (itemName: string) => {
    setCart(prev => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + 1
    }));
  };

  const removeFromCart = (itemName: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemName] > 1) {
        newCart[itemName] -= 1;
      } else {
        delete newCart[itemName];
      }
      return newCart;
    });
  };

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    mobile: "",
    email: "",
    message: `Hi, I am interested in your services. Please contact me.`
  });

  // Scroll to top when ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [businessId]);

  // Scroll to reviews section if navigated from home review click
  useEffect(() => {
    if (scrollToReview) {
      const timer = setTimeout(() => {
        const element = document.getElementById("reviews-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [scrollToReview, businessId]);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.mobile) {
      alert("Please fill in your Name and Mobile Number.");
      return;
    }
    setUiState(prev => ({ ...prev, enquirySubmitted: true }));
    setTimeout(() => {
      setEnquiryForm({
        name: "",
        mobile: "",
        email: "",
        message: `Hi, I am interested in your services. Please contact me.`
      });
    }, 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentBiz.name,
        text: currentBiz.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Business link copied to clipboard!");
    }
  };

  // Filter products based on search term
  const filteredProducts = currentBiz.products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.desc.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-6">
          <button onClick={onBack} className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition group-hover:bg-secondary">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-muted-foreground transition group-hover:text-foreground">Back</span>
          </button>

          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="flex items-center">
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-8 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          <div className="hidden md:flex ml-auto flex-1 max-w-md items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-[var(--shadow-card)]">
            <input
              type="text"
              placeholder={`Search in ${currentBiz.name}...`}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto md:ml-0">
            <button 
              onClick={() => onBack()}
              className="px-4 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground"
            >
              Home
            </button>
            <button className="hidden sm:block rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold transition hover:bg-secondary">
              Discover
            </button>
            {!username && (
              <button 
                onClick={onSignInClick}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-pointer"
              >
                Sign In
              </button>
            )}
            {username && (
              <button 
                onClick={onProfileClick}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer font-bold text-xs bg-primary"
                title="Open Profile Menu"
              >
                {username.charAt(0).toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Gallery Collage Section */}
      <div className="bg-secondary/40 border-b border-border py-4">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 h-[240px] sm:h-[320px] overflow-hidden rounded-3xl border border-border/80 shadow-md">
            
            {/* Main large image */}
            <div className="col-span-1 sm:col-span-6 h-full relative group overflow-hidden">
              <img 
                src={currentBiz.images[0]} 
                alt={`${currentBiz.name} main`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
            </div>

            {/* Side columns */}
            <div className="hidden sm:grid sm:col-span-6 grid-cols-2 gap-4 h-full">
              {currentBiz.images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="h-full relative group overflow-hidden bg-secondary">
                  <img 
                    src={img} 
                    alt={`${currentBiz.name} detail ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                </div>
              ))}
              {currentBiz.images.length < 3 && (
                <div className="h-full bg-card border-2 border-dashed border-border/70 rounded-2xl flex items-center justify-center text-muted-foreground font-semibold text-xs text-center p-4">
                  No additional photos available
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Breadcrumb & Ratings summary row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <nav className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:text-primary transition-colors">Home</a>
            <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
            <span className="hover:text-primary transition-colors cursor-pointer">{currentBiz.location.split(" - ")[1] || "Indore"}</span>
            <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
            <span className="hover:text-primary transition-colors cursor-pointer">{currentBiz.category}</span>
            <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
            <span className="text-foreground font-extrabold">{currentBiz.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
              {currentBiz.rating} <Star className="h-3.5 w-3.5 fill-white stroke-none" />
            </span>
            <span className="text-xs font-bold text-muted-foreground">{currentBiz.reviewCount} Ratings</span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <ShieldCheck className="h-3.5 w-3.5 fill-emerald-500 text-white" /> Verified
            </span>
          </div>
        </div>

        {/* Business Title Header */}
        <div className="border-b border-border pb-6 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-black tracking-tight leading-none">
              {currentBiz.name}
            </h1>
            <p className="text-muted-foreground text-sm font-semibold mt-2 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-rose-500" /> {currentBiz.address}
            </p>
            <div className="flex items-center gap-4 text-xs font-bold mt-3 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-accent" /> Timings: {currentBiz.timings}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase border border-emerald-100">
                {currentBiz.openStatus}
              </span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => {
                const el = document.getElementById("send-enquiry-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-md cursor-pointer"
            >
              Enquire Now
            </button>

            {(currentBiz.category.includes("Food Point") || currentBiz.category.toLowerCase().includes("restaurant") || currentBiz.category.includes("Hotel Point") || currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")) && (
              <button 
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowStr = tomorrow.toISOString().split("T")[0];
                  dispatchBooking({ type: "RESET", username: username || "" });
                  dispatchBooking({
                    type: "UPDATE_FORM",
                    fields: {
                      name: username || "", 
                      phone: "",
                      date: new Date().toISOString().split("T")[0],
                      guests: currentBiz.category.includes("Hotel Point") ? "Deluxe AC Room (₹1,999/night)" : "2",
                      time: currentBiz.category.includes("Hotel Point") 
                        ? tomorrowStr 
                        : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")) 
                          ? "Morning Slot Consultation (09:00 AM - 01:00 PM) (Fee: ₹300)" 
                          : "Dinner (07:00 PM - 11:00 PM)"
                    }
                  });
                  dispatchBooking({ type: "SET_MODAL", open: true });
                  dispatchPayment({ type: "RESET" });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md cursor-pointer"
              >
                <Check className="h-4 w-4" /> 
                {currentBiz.category.includes("Hotel Point") 
                  ? "Book Room" 
                  : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? "Book Appointment" : "Book Table")}
              </button>
            )}
            <button 
              onClick={() => setUiState(prev => ({ ...prev, revealPhone: !prev.revealPhone }))}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-xs font-bold text-foreground hover:bg-secondary transition shadow-sm cursor-pointer"
            >
              <Phone className="h-4 w-4 text-accent" /> 
              {revealPhone ? currentBiz.phone : "Show Number"}
            </button>
            <a 
              href={`https://wa.me/${currentBiz.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#25d366]/30 bg-[#25d366]/5 hover:bg-[#25d366] hover:text-white transition-all shadow-sm cursor-pointer text-[#25d366]"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 1.968 13.91 .94 11.997.94c-5.442 0-9.867 4.371-9.871 9.8.001 1.83.483 3.61 1.398 5.183L2.5 21.082l5.147-1.33c-.007.005-.007.005 0 0zm9.967-6.758c-.31-.154-1.834-.894-2.115-.995-.28-.102-.485-.153-.687.154-.202.307-.783.995-.96 1.198-.177.205-.355.23-.665.077-1.127-.565-1.953-.972-2.73-1.637-.777-.665-1.28-1.488-1.433-1.753-.153-.307-.016-.473.138-.626.14-.138.31-.36.467-.538.153-.18.204-.307.307-.512.102-.205.05-.384-.025-.538-.077-.154-.687-1.637-.94-2.253-.247-.6-.5-.518-.688-.528-.178-.01-.383-.01-.588-.01-.205 0-.538.077-.82.384-.282.307-1.077 1.05-1.077 2.561 0 1.51 1.1 2.97 1.253 3.176.154.205 2.164 3.266 5.244 4.581.733.313 1.306.499 1.75.64.737.234 1.408.201 1.94.122.592-.088 1.834-.74 2.09-1.455.257-.717.257-1.332.18-1.456-.076-.124-.282-.201-.592-.356z" />
              </svg>
            </a>
            <button 
              onClick={handleShare}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition shadow-sm text-muted-foreground cursor-pointer"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={() => setUiState(prev => ({ ...prev, bookmarked: !prev.bookmarked }))}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition shadow-sm cursor-pointer ${bookmarked ? "text-amber-500 border-amber-200 bg-amber-50/20" : "text-muted-foreground border-border bg-card hover:bg-secondary"}`}
            >
              <Bookmark className={`h-4.5 w-4.5 ${bookmarked ? "fill-amber-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Main Grid: Content on Left (8 cols), Sticky Form & Similar Listings on Right (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Info & Tab Sections */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* About Business description */}
            <div className="prose max-w-none">
              <h3 className="text-lg font-black text-foreground mb-3 uppercase tracking-wider text-left border-b border-border/40 pb-2">
                About {currentBiz.name}
              </h3>
              <p className="text-[13px] text-muted-foreground/95 font-semibold leading-relaxed">
                {currentBiz.description}
              </p>
            </div>

            {/* Photos Section */}
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-foreground mb-3 uppercase tracking-wider text-left border-b border-border/40 pb-2">
                Photos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentBiz.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm bg-secondary group">
                    <img 
                      src={img} 
                      alt={`${currentBiz.name} gallery ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Products & Services Catalog */}
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-black text-foreground uppercase tracking-wider text-left">
                  {currentBiz.category.includes("Food Point") || currentBiz.category.toLowerCase().includes("restaurant") ? "Menu & Special Dishes" : "Products & Services"}
                </h3>
                <div className="relative w-full sm:max-w-xs">
                  <input 
                    type="text"
                    placeholder="Search in catalog..."
                    value={productSearch}
                    onChange={(e) => setUiState(prev => ({ ...prev, productSearch: e.target.value }))}
                    className="w-full bg-card border border-border rounded-full py-1.5 pl-4 pr-10 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                  />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                currentBiz.category.includes("Food Point") || currentBiz.category.toLowerCase().includes("restaurant") ? (
                  // Food List View
                  <div className="flex flex-col gap-4">
                    {filteredProducts.map((prod, idx) => {
                      const qty = cart[prod.name] || 0;
                      return (
                        <div key={idx} className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 shadow-[var(--shadow-card)] hover:shadow-md hover:border-primary/10 transition duration-300">
                          {/* Left: Food Image */}
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                            <img src={prod.img} alt={prod.name} className="h-full w-full object-cover" />
                          </div>

                          {/* Middle: Details */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm sm:text-base font-black text-foreground line-clamp-1">
                                {prod.name}
                              </h4>
                              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                                {prod.price}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground/80 mt-1 sm:mt-1.5 leading-relaxed line-clamp-2">
                              {prod.desc}
                            </p>
                          </div>

                          {/* Right: Add / Quantity Controls */}
                          <div className="shrink-0 pl-2">
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => addToCart(prod.name)}
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
                              >
                                Add +
                              </button>
                            ) : (
                              <div className="flex items-center border border-emerald-600/30 bg-emerald-50 text-emerald-700 rounded-xl overflow-hidden shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(prod.name)}
                                  className="px-3 py-1.5 text-xs font-black hover:bg-emerald-100 transition cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-black min-w-6 text-center select-none">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addToCart(prod.name)}
                                  className="px-3 py-1.5 text-xs font-black hover:bg-emerald-100 transition cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // General Grid View
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filteredProducts.map((prod, idx) => (
                      <div key={idx} className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:border-primary/20 transition-all duration-300">
                        <div className="aspect-[16/10] overflow-hidden bg-secondary border-b border-border">
                          <img 
                            src={prod.img} 
                            alt={prod.name} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                              {prod.name}
                            </h4>
                            <span className="text-xs font-extrabold text-emerald-600 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {prod.price}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed flex-1 line-clamp-2">
                            {prod.desc}
                          </p>
                          <button 
                            type="button"
                            onClick={() => {
                              setEnquiryForm(prev => ({
                                ...prev,
                                message: `Hi, I am interested in your product/service: "${prod.name}". Please share the quotation and availability details.`
                              }));
                              document.getElementById("send-enquiry-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="mt-4 w-full bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-bold py-2 rounded-xl border border-border/80 transition-colors cursor-pointer text-center"
                          >
                            Enquire Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground text-xs font-bold">
                  No products or services found matching "{productSearch}"
                </div>
              )}
            </div>

            {/* Ratings & Reviews Section */}
            <div id="reviews-section" className="flex flex-col scroll-mt-28">
              <h3 className="text-lg font-black text-foreground uppercase tracking-wider text-left border-b border-border/40 pb-3 mb-6">
                Ratings & Reviews
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-secondary/25 border border-border/60 rounded-3xl p-6 mb-8 shadow-sm">
                
                {/* Visual average card */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center md:border-r border-border/60 py-4 pr-4">
                  <span className="text-5xl font-black text-foreground leading-none">{currentBiz.rating}</span>
                  <div className="flex items-center gap-0.5 mt-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`h-4.5 w-4.5 ${idx < Math.floor(currentBiz.rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground mt-2">{currentBiz.reviewCount} user ratings</span>
                </div>

                {/* Progress breakdown */}
                <div className="md:col-span-8 flex flex-col gap-2">
                  {[
                    { label: "5 Star", percent: 80 },
                    { label: "4 Star", percent: 12 },
                    { label: "3 Star", percent: 6 },
                    { label: "2 Star", percent: 2 },
                    { label: "1 Star", percent: 0 }
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-bold">
                      <span className="w-12 text-muted-foreground shrink-0">{row.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden border border-border/30">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all" 
                          style={{ width: `${row.percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground/80 shrink-0">{row.percent}%</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Reviews list */}
              <div className="flex flex-col gap-6">
                {currentBiz.reviews.map((rev, idx) => (
                  <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Reviewer Row */}
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-tr ${rev.userColor} shadow-inner`}>
                          {rev.userInitial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-foreground">{rev.userName}</span>
                          <span className="text-[10px] font-bold text-muted-foreground mt-0.5">Verified Reviewer</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-muted-foreground">{rev.date}</span>

                    </div>

                    {/* Stars Row */}
                    <div className="flex items-center gap-0.5 mt-3">
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <Star 
                          key={sIdx} 
                          className={`h-3.5 w-3.5 ${sIdx < rev.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`}
                        />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-muted-foreground/95 leading-relaxed font-semibold mt-3 italic">
                      "{rev.reviewText}"
                    </p>

                    {/* Review attached image */}
                    {rev.image && (
                      <div className="mt-4 aspect-[16/9] max-w-sm rounded-2xl overflow-hidden border border-border bg-secondary shadow-sm">
                        <img 
                          src={rev.image} 
                          alt="Review attachment" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Expandable FAQs Section */}
            {currentBiz.faqs.length > 0 && (
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-foreground uppercase tracking-wider text-left border-b border-border/40 pb-3 mb-6">
                  Frequently Asked Questions
                </h3>
                
                <div className="flex flex-col gap-3">
                  {currentBiz.faqs.map((faq, idx) => {
                    const isActive = activeFaqIndex === idx;
                    return (
                      <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)]">
                        <button 
                          onClick={() => setUiState(prev => ({ ...prev, activeFaqIndex: isActive ? null : idx }))}
                          className="w-full px-6 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-black text-foreground hover:bg-secondary/40 transition-colors"
                        >
                          <span>{faq.question}</span>
                          {isActive ? <ChevronUp className="h-4.5 w-4.5 text-accent" /> : <ChevronDown className="h-4.5 w-4.5 text-accent" />}
                        </button>
                        {isActive && (
                          <div className="px-6 pb-4 pt-1 text-xs text-muted-foreground font-semibold leading-relaxed border-t border-border/30 bg-secondary/10">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sidebar Form & Similar Listings */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
            
            {/* Send Enquiry Form */}
            <div id="send-enquiry-section" className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] scroll-mt-28">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Send Enquiry</h4>
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>

              {enquirySubmitted ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h5 className="text-xs font-black text-foreground mt-2">Enquiry Sent Successfully!</h5>
                  <p className="text-[10px] text-muted-foreground/80 font-bold max-w-[200px] leading-relaxed mt-1">
                    The business representative will get back to you on your provided contact details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="enquiryName" className="text-[10px] font-bold text-muted-foreground uppercase">Your Name</label>
                    <input 
                      id="enquiryName"
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="enquiryMobile" className="text-[10px] font-bold text-muted-foreground uppercase">Mobile Number</label>
                    <input 
                      id="enquiryMobile"
                      type="tel" 
                      placeholder="10-digit number"
                      value={enquiryForm.mobile}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="enquiryEmail" className="text-[10px] font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
                    <input 
                      id="enquiryEmail"
                      type="email" 
                      placeholder="name@example.com"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="enquiryMessage" className="text-[10px] font-bold text-muted-foreground uppercase">Message</label>
                    <textarea 
                      id="enquiryMessage"
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" /> Submit Enquiry
                  </button>
                </form>
              )}
            </div>

            {/* People Also Viewed Widget */}
            {currentBiz.similarListings.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-widest">People Also Viewed</h4>
                </div>

                <div className="flex flex-col gap-4">
                  {currentBiz.similarListings.map((sim) => (
                    <div 
                      key={sim.id}
                      onClick={() => onBusinessSelect && onBusinessSelect(sim.id)}
                      className="group flex items-start gap-3 cursor-pointer"
                    >
                      <div className="h-14 w-20 rounded-lg overflow-hidden bg-secondary border border-border shadow-sm shrink-0">
                        <img 
                          src={sim.img} 
                          alt={sim.name} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent leading-none">
                          {sim.category.split(" & ")[0]}
                        </span>
                        <h5 className="text-[11.5px] font-black text-foreground leading-snug group-hover:text-primary transition-colors mt-1 line-clamp-2">
                          {sim.name}
                        </h5>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-muted-foreground">
                          <span className="flex items-center gap-0.5 text-amber-500">
                            {sim.rating} <Star className="h-3 w-3 fill-current" />
                          </span>
                          <span>• {sim.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Table Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => dispatchBooking({ type: "SET_MODAL", open: false })}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {bookingStep === "form" && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!bookingForm.name || !bookingForm.phone) {
                  alert("Please fill in your Name and Phone Number.");
                  return;
                }
                dispatchBooking({ type: "SET_STEP", step: "payment" });
              }}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  {currentBiz.category.includes("Hotel Point") 
                    ? "Book a Room" 
                    : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? "Book an Appointment" : "Book a Table")}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {currentBiz.category.includes("Hotel Point") 
                    ? "Reserve your room stay at " 
                    : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? "Schedule your consultation at " : "Reserve your table at ")}
                  <span className="font-bold text-primary">{currentBiz.name}</span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="bookingName" className="block text-xs font-bold text-foreground/80 mb-1.5">Contact Name*</label>
                    <input
                      id="bookingName"
                      type="text"
                      required
                      value={bookingForm.name}
                      onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { name: e.target.value } })}
                      placeholder="Enter booking name"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="bookingPhone" className="block text-xs font-bold text-foreground/80 mb-1.5">Phone Number*</label>
                    <input
                      id="bookingPhone"
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { phone: e.target.value } })}
                      placeholder="Enter mobile number"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bookingDate" className="block text-xs font-bold text-foreground/80 mb-1.5">
                        {currentBiz.category.includes("Hotel Point") 
                          ? "Check-in Date*" 
                          : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? "Appointment Date*" : "Preferred Date*")}
                      </label>
                      <input
                        id="bookingDate"
                        type="date"
                        required
                        value={bookingForm.date}
                        onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { date: e.target.value } })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="bookingGuests" className="block text-xs font-bold text-foreground/80 mb-1.5">
                        {currentBiz.category.includes("Hotel Point") 
                          ? "Room Standard Preferred*" 
                          : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? "Patient Age*" : "No. of Guests*")}
                      </label>
                      {currentBiz.category.includes("Hotel Point") ? (
                        <select
                          id="bookingGuests"
                          value={bookingForm.guests}
                          onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { guests: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent animate-none"
                        >
                          <option value="Deluxe AC Room (₹1,999/night)">Deluxe AC Room (₹1,999/night)</option>
                          <option value="Super Deluxe Room (Balcony) (₹2,999/night)">Super Deluxe Room (Balcony) (₹2,999/night)</option>
                          <option value="Luxury Family Suite (₹4,499/night)">Luxury Family Suite (₹4,499/night)</option>
                        </select>
                      ) : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? (
                        <input
                          id="bookingGuests"
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 28"
                          value={bookingForm.guests}
                          onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { guests: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                        />
                      ) : (
                        <select
                          id="bookingGuests"
                          value={bookingForm.guests}
                          onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { guests: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent animate-none"
                        >
                          <option value="1">1 Person</option>
                          <option value="2">2 Persons</option>
                          <option value="4">4 Persons</option>
                          <option value="6">6 Persons</option>
                          <option value="8">8 Persons</option>
                          <option value="10+">10+ Persons</option>
                        </select>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bookingTime" className="block text-xs font-bold text-foreground/80 mb-1.5">
                      {currentBiz.category.includes("Hotel Point") 
                        ? "Stay Check-out Date*" 
                        : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? "Appointment Slot*" : "Time Slot*")}
                    </label>
                    {currentBiz.category.includes("Hotel Point") ? (
                      <input
                        id="bookingTime"
                        type="date"
                        required
                        value={bookingForm.time}
                        onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { time: e.target.value } })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    ) : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")) ? (
                      <select
                        id="bookingTime"
                        value={bookingForm.time}
                        onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { time: e.target.value } })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                      >
                        <option value="Morning Slot Consultation (09:00 AM - 01:00 PM) (Fee: ₹300)">Morning Slot (09:00 AM - 01:00 PM) (Fee: ₹300)</option>
                        <option value="Evening Slot Consultation (05:00 PM - 08:30 PM) (Fee: ₹400)">Evening Slot (05:00 PM - 08:30 PM) (Fee: ₹400)</option>
                        <option value="Priority / Emergency Walk-in Slot (Fee: ₹800)">Priority / Emergency Slot (Fee: ₹800)</option>
                      </select>
                    ) : (
                      <select
                        id="bookingTime"
                        value={bookingForm.time}
                        onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { time: e.target.value } })}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                      >
                        <option value="Lunch (12:00 PM - 03:00 PM)">Lunch (12:00 PM - 03:00 PM)</option>
                        <option value="High Tea (04:00 PM - 06:00 PM)">High Tea (04:00 PM - 06:00 PM)</option>
                        <option value="Dinner (07:00 PM - 11:00 PM)">Dinner (07:00 PM - 11:00 PM)</option>
                      </select>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                >
                  Proceed to Pay ₹{getBookingPrice()}
                </button>
              </form>
            )}

            {bookingStep === "payment" && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Secure Payment Gateway</h3>
                    <p className="text-[10px] text-muted-foreground">Transactions are encrypted securely</p>
                  </div>
                </div>

                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3.5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Booking Deposit Amount</span>
                    <span className="text-[11px] font-semibold text-foreground/80 mt-0.5">{currentBiz.name}</span>
                  </div>
                  <span className="text-2xl font-black text-foreground">₹{getBookingPrice()}</span>
                </div>

                {paymentProcessing ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-foreground mt-2">Processing Payment Securely...</span>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed mx-auto">Do not reload the page or close this modal</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Select Payment Method</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => dispatchPayment({ type: "SET_METHOD", method: "upi" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "upi" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          UPI / QR
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatchPayment({ type: "SET_METHOD", method: "card" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "card" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Card
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatchPayment({ type: "SET_METHOD", method: "netbanking" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "netbanking" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Net Banking
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "upi" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="bookingUpiId" className="block text-xs font-bold text-foreground/80 mb-1.5">Enter UPI ID</label>
                          <input
                            id="bookingUpiId"
                            type="text"
                            placeholder="username@okaxis, user@upi..."
                            required
                            value={upiId}
                            onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "upiId", value: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/30">
                          <span className="text-[10px] font-semibold leading-relaxed">Or scan any UPI QR code in your payment app to complete purchase.</span>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label htmlFor="bookingCardNumber" className="block text-xs font-bold text-foreground/80 mb-1.5">Card Number</label>
                          <input
                            id="bookingCardNumber"
                            type="text"
                            maxLength={19}
                            placeholder="4111 2222 3333 4444"
                            required
                            value={cardNumber}
                            onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "cardNumber", value: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="bookingCardExpiry" className="block text-xs font-bold text-foreground/80 mb-1.5">Expiry Date</label>
                            <input
                              id="bookingCardExpiry"
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              required
                              value={cardExpiry}
                              onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "cardExpiry", value: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label htmlFor="bookingCardCvv" className="block text-xs font-bold text-foreground/80 mb-1.5">CVV Code</label>
                            <input
                              id="bookingCardCvv"
                              type="password"
                              maxLength={3}
                              placeholder="***"
                              required
                              value={cardCvv}
                              onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "cardCvv", value: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="bookingBank" className="block text-xs font-bold text-foreground/80 mb-1.5">Select Bank</label>
                          <select id="bookingBank" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent">
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
                        if (paymentMethod === "upi" && !upiId) {
                          alert("Please enter a valid UPI ID.");
                          return;
                        }
                        if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
                          alert("Please fill in Card Details.");
                          return;
                        }
                        dispatchPayment({ type: "SET_PROCESSING", value: true });
                        setTimeout(() => {
                          dispatchPayment({ type: "SET_PROCESSING", value: false });
                          dispatchBooking({ type: "SET_STEP", step: "success" });
                          dispatchBooking({ type: "SET_SUBMITTED", value: true });
                        }, 2000);
                      }}
                      className="w-full mt-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md text-center"
                    >
                      Pay ₹{getBookingPrice()} & Complete Booking
                    </button>
                  </div>
                )}
              </div>
            )}

            {bookingStep === "success" && (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">
                  {currentBiz.category.includes("Hotel Point") 
                    ? "Room Stay Reserved!" 
                    : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? "Appointment Confirmed!" : "Table Reserved!")}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {currentBiz.category.includes("Hotel Point") ? (
                    <span>Your room stay reservation at <span className="font-semibold text-primary">{currentBiz.name}</span> ({bookingForm.guests}) for check-in on {bookingForm.date} is confirmed!</span>
                  ) : (currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point") ? (
                    <span>Your consultation appointment at <span className="font-semibold text-primary">{currentBiz.name}</span> on {bookingForm.date} has been scheduled!</span>
                  ) : (
                    <span>Your table reservation at <span className="font-semibold text-primary">{currentBiz.name}</span> for {bookingForm.guests} guests on {bookingForm.date} is confirmed!</span>
                  ))}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto no-scrollbar">
            <button
              onClick={() => dispatchCheckout({ type: "SET_MODAL", open: false })}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {checkoutStep === "form" && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!checkoutForm.name || !checkoutForm.phone) {
                  alert("Please fill in your Name and Phone Number.");
                  return;
                }
                dispatchCheckout({ type: "SET_STEP", step: "payment" });
              }}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  Checkout & Place Order
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Completing order with <span className="font-bold text-primary">{currentBiz.name}</span>
                </p>

                {/* Items summary */}
                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3 mb-4 space-y-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Order Details</span>
                  {Object.entries(cart).map(([name, qty]) => {
                    const item = currentBiz.products.find(p => p.name === name);
                    if (!item) return null;
                    const priceNum = parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
                    return (
                      <div key={name} className="flex justify-between items-center text-xs text-foreground/90 font-medium">
                        <span>{name} <span className="text-muted-foreground font-semibold">x{qty}</span></span>
                        <span>₹{priceNum * qty}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-border/70 pt-2 flex justify-between items-center text-sm font-bold text-foreground">
                    <span>Total Amount</span>
                    <span>₹{totalCartPrice}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="checkoutName" className="block text-xs font-bold text-foreground/80 mb-1.5">Your Name*</label>
                    <input
                      id="checkoutName"
                      type="text"
                      required
                      value={checkoutForm.name}
                      onChange={(e) => dispatchCheckout({ type: "UPDATE_FORM", fields: { name: e.target.value } })}
                      placeholder="Enter customer name"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkoutPhone" className="block text-xs font-bold text-foreground/80 mb-1.5">Phone Number*</label>
                    <input
                      id="checkoutPhone"
                      type="tel"
                      required
                      value={checkoutForm.phone}
                      onChange={(e) => dispatchCheckout({ type: "UPDATE_FORM", fields: { phone: e.target.value } })}
                      placeholder="Enter mobile number"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkoutAddress" className="block text-xs font-bold text-foreground/80 mb-1.5">Delivery Address*</label>
                    <textarea
                      id="checkoutAddress"
                      required
                      rows={2}
                      value={checkoutForm.address}
                      onChange={(e) => dispatchCheckout({ type: "UPDATE_FORM", fields: { address: e.target.value } })}
                      placeholder="Provide complete home/office address..."
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkoutNotes" className="block text-xs font-bold text-foreground/80 mb-1.5">Cooking Notes (Optional)</label>
                    <input
                      id="checkoutNotes"
                      type="text"
                      value={checkoutForm.notes}
                      onChange={(e) => dispatchCheckout({ type: "UPDATE_FORM", fields: { notes: e.target.value } })}
                      placeholder="e.g. Make it extra spicy, no onions..."
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                >
                  Proceed to Pay ₹{totalCartPrice}
                </button>
              </form>
            )}

            {checkoutStep === "payment" && (
              <div className="space-y-5 text-left animate-fade-in">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Secure Payment Gateway</h3>
                    <p className="text-[10px] text-muted-foreground">Transactions are encrypted securely</p>
                  </div>
                </div>

                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3.5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Order Amount</span>
                    <span className="text-[11px] font-semibold text-foreground/80 mt-0.5">{currentBiz.name}</span>
                  </div>
                  <span className="text-2xl font-black text-foreground">₹{totalCartPrice}</span>
                </div>

                {paymentProcessing ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-foreground mt-2">Processing Payment Securely...</span>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed mx-auto">Do not reload the page or close this modal</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Select Payment Method</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => dispatchPayment({ type: "SET_METHOD", method: "upi" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "upi" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          UPI / QR
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatchPayment({ type: "SET_METHOD", method: "card" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "card" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Card
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatchPayment({ type: "SET_METHOD", method: "netbanking" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "netbanking" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Net Banking
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "upi" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="checkoutUpiId" className="block text-xs font-bold text-foreground/80 mb-1.5">Enter UPI ID</label>
                          <input
                            id="checkoutUpiId"
                            type="text"
                            placeholder="username@okaxis, user@upi..."
                            required
                            value={upiId}
                            onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "upiId", value: e.target.value })}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/30">
                          <span className="text-[10px] font-semibold leading-relaxed">Or scan any UPI QR code in your payment app to complete purchase.</span>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label htmlFor="checkoutCardNumber" className="block text-xs font-bold text-foreground/80 mb-1.5">Card Number</label>
                          <input
                            id="checkoutCardNumber"
                            type="text"
                            maxLength={19}
                            placeholder="4111 2222 3333 4444"
                            required
                            value={cardNumber}
                            onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "cardNumber", value: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="checkoutCardExpiry" className="block text-xs font-bold text-foreground/80 mb-1.5">Expiry Date</label>
                            <input
                              id="checkoutCardExpiry"
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              required
                              value={cardExpiry}
                              onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "cardExpiry", value: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label htmlFor="checkoutCardCvv" className="block text-xs font-bold text-foreground/80 mb-1.5">CVV Code</label>
                            <input
                              id="checkoutCardCvv"
                              type="password"
                              maxLength={3}
                              placeholder="***"
                              required
                              value={cardCvv}
                              onChange={(e) => dispatchPayment({ type: "SET_FIELD", field: "cardCvv", value: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="checkoutBank" className="block text-xs font-bold text-foreground/80 mb-1.5">Select Bank</label>
                          <select id="checkoutBank" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent">
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
                        if (paymentMethod === "upi" && !upiId) {
                          alert("Please enter a valid UPI ID.");
                          return;
                        }
                        if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
                          alert("Please fill in Card Details.");
                          return;
                        }
                        dispatchPayment({ type: "SET_PROCESSING", value: true });
                        setTimeout(() => {
                          dispatchPayment({ type: "SET_PROCESSING", value: false });
                          dispatchCheckout({ type: "SET_STEP", step: "success" });
                          dispatchCheckout({ type: "SET_SUBMITTED", value: true });
                          setCart({});
                        }, 2000);
                      }}
                      className="w-full mt-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md text-center"
                    >
                      Pay ₹{totalCartPrice} & Complete Order
                    </button>
                  </div>
                )}
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">
                  Order Confirmed!
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your order has been placed with <span className="font-semibold text-primary">{currentBiz.name}</span>. Order ID: <span className="font-bold text-foreground">#FMP-{Math.floor(1000 + Math.random() * 9000)}</span>. You will receive an SMS confirmation shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Checkout Bar */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-primary border-t border-border p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] z-40 animate-fade-in-up">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4 text-white">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold opacity-90">{totalCartItems} Item{totalCartItems > 1 ? 's' : ''} Selected</span>
              <span className="text-lg font-black leading-tight">Total: ₹{totalCartPrice}</span>
            </div>
            <button
              onClick={() => {
                dispatchCheckout({ type: "RESET", username: username || "" });
                dispatchCheckout({ type: "SET_MODAL", open: true });
                dispatchPayment({ type: "RESET" });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


