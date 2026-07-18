import { useState, useEffect, useReducer, useMemo } from "react";

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
  MapPin,
  Clock,
  ArrowLeft,
  Bookmark,
  Share2,
  CheckCircle,
  MessageSquare,
  Phone,
  ArrowRight,
  Star,
  Globe,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Send,
  Navigation,
  X,
  Check,
  Mail,
  Video,
  Sparkles,
  User,
  Plus,
  Compass,
  Camera,
  ShoppingCart,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { BusinessListingData, UserReview } from "../data/businessesData";
import Footer from "./Footer";
import { API_BASE_URL } from "../config";

function formatDateTimeDMY(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, "0");
  return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
}

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
    guests: "2",
  },
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
    notes: "",
  },
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
  processing: false,
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

interface TimePickerInputProps {
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
}

function TimePickerInput({ required, value, onChange }: TimePickerInputProps) {
  const parseTimeValue = (val: string) => {
    if (!val) return { hour: "", minute: "", ampm: "" };
    let match = val.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      return {
        hour: match[1].padStart(2, "0"),
        minute: match[2],
        ampm: match[3].toUpperCase(),
      };
    }
    match = val.match(/^(\d{2}):(\d{2})$/);
    if (match) {
      let h24 = parseInt(match[1]);
      let m = match[2];
      let ampm = h24 >= 12 ? "PM" : "AM";
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      return {
        hour: String(h12).padStart(2, "0"),
        minute: m,
        ampm,
      };
    }
    return { hour: "", minute: "", ampm: "" };
  };

  const { hour, minute, ampm } = parseTimeValue(value);

  const updateVal = (h: string, m: string, ap: string) => {
    if (h && m && ap) {
      onChange(`${h}:${m} ${ap}`);
    } else {
      onChange("");
    }
  };

  return (
    <div className="flex gap-2">
      <select
        required={required}
        value={hour}
        onChange={(e) => updateVal(e.target.value, minute, ampm)}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent cursor-pointer text-foreground"
      >
        <option value="">Hour</option>
        {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <select
        required={required}
        value={minute}
        onChange={(e) => updateVal(hour, e.target.value, ampm)}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent cursor-pointer text-foreground"
      >
        <option value="">Min</option>
        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        required={required}
        value={ampm}
        onChange={(e) => updateVal(hour, minute, e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent cursor-pointer text-foreground"
      >
        <option value="">AM/PM</option>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

interface BusinessDetailPageProps {
  businessId: string;
  onBack: () => void;
  onBusinessSelect?: (id: string) => void;
  scrollToReview?: boolean;
  scrollToMenu?: boolean;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  username?: string | null;
}

export default function BusinessDetailPage({
  businessId,
  onBack,
  onBusinessSelect,
  scrollToReview,
  scrollToMenu,
  onSignInClick,
  onProfileClick,
  username,
}: BusinessDetailPageProps) {
  const [currentBiz, setCurrentBiz] = useState<BusinessListingData>({} as BusinessListingData);
  const [bizLoading, setBizLoading] = useState(true);
  const [bizNotFound, setBizNotFound] = useState(false);

  useEffect(() => {
    setBizLoading(true);
    setBizNotFound(false);
    fetch(`http://localhost:5000/api/businesses/${businessId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        const raw = data.data || data;
        // Normalize: ensure all array fields default to [] when missing
        const normalized: BusinessListingData = {
          ...raw,
          reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
          products: Array.isArray(raw.products) ? raw.products : [],
          faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
          images: Array.isArray(raw.images) ? raw.images : [],
          similarListings: Array.isArray(raw.similarListings) ? raw.similarListings : [],
          extraNumbers: Array.isArray(raw.extraNumbers) ? raw.extraNumbers : [],
          branches: Array.isArray(raw.branches) ? raw.branches : [],
          facilities: Array.isArray(raw.facilities) ? raw.facilities : [],
          officers: Array.isArray(raw.officers) ? raw.officers : [],
        };
        setCurrentBiz(normalized);
        setBizLoading(false);
      })
      .catch(() => {
        setBizNotFound(true);
        setBizLoading(false);
      });
  }, [businessId]);

  const [bookingState, dispatchBooking] = useReducer(
    bookingReducer,
    initialBookingState(username || ""),
  );
  const {
    modalOpen: bookingModalOpen,
    submitted: bookingSubmitted,
    step: bookingStep,
    form: bookingForm,
  } = bookingState;

  const [customFormConfig, setCustomFormConfig] = useState<{
    fields: any[];
    formTitle: string;
    formDescription: string;
    bookNowEnabled: boolean;
  } | null>(null);

  const [customFormValues, setCustomFormValues] = useState<Record<string, any>>({});
  const [openCustomDropdowns, setOpenCustomDropdowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentBiz?.id) {
      const loadCustomForm = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/service-forms/${currentBiz.id}`);
          const data = await res.json();
          if (data.success && data.data) {
            const parsed = data.data;
            setCustomFormConfig(parsed);
            // Initialize values
            const initialVals: Record<string, any> = {};
            parsed.fields.forEach((f: any) => {
              if (f.type === "checkbox") {
                if (f.checkboxMode === "multiple") {
                  initialVals[f.label] = [];
                } else {
                  initialVals[f.label] = false;
                }
              } else if (f.type === "select" && f.selectMode === "multiple") {
                initialVals[f.label] = [];
              } else {
                initialVals[f.label] = "";
              }
            });
            setCustomFormValues(initialVals);
          } else {
            setCustomFormConfig(null);
          }
        } catch (e) {
          setCustomFormConfig(null);
        }
      };

      loadCustomForm();
    }
  }, [currentBiz?.id]);

  const [checkoutState, dispatchCheckout] = useReducer(
    checkoutReducer,
    initialCheckoutState(username || ""),
  );
  const {
    modalOpen: checkoutModalOpen,
    submitted: checkoutSubmitted,
    step: checkoutStep,
    form: checkoutForm,
  } = checkoutState;

  const [paymentState, dispatchPayment] = useReducer(paymentReducer, initialPaymentState);
  const {
    method: paymentMethod,
    upiId,
    cardNumber,
    cardExpiry,
    cardCvv,
    processing: paymentProcessing,
  } = paymentState;

  const [prevBusinessId, setPrevBusinessId] = useState(businessId);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [uiState, setUiState] = useState({
    revealPhone: false,
    activeFaqIndex: null as number | null,
    productSearch: "",
    bookmarked: false,
    enquirySubmitted: false,
    enquiryModalOpen: false,
  });



  const { revealPhone, activeFaqIndex, productSearch, bookmarked, enquirySubmitted, enquiryModalOpen } = uiState;

  // Food menu cart state
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCheckoutTotal, setCartCheckoutTotal] = useState<number | null>(null);

  const handleRazorpayPayment = async (
    amount: number,
    onSuccess: (paymentId: string) => void | Promise<void>
  ) => {
    dispatchPayment({ type: "SET_PROCESSING", value: true });
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      dispatchPayment({ type: "SET_PROCESSING", value: false });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const orderData = await res.json();
      if (!orderData.success || !orderData.data) {
        alert("Failed to initiate payment with Razorpay.");
        dispatchPayment({ type: "SET_PROCESSING", value: false });
        return;
      }

      const { id: order_id, amount: order_amount, currency } = orderData.data;

      const options = {
        key: "rzp_test_S3IcSS1NbymL6D",
        amount: order_amount,
        currency,
        name: "FindmyPoint",
        description: "Payment for " + (currentBiz?.name || "Services"),
        order_id,
        handler: async function (response: any) {
          dispatchPayment({ type: "SET_PROCESSING", value: true });
          try {
            const verifyRes = await fetch("http://localhost:5000/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            dispatchPayment({ type: "SET_PROCESSING", value: false });
            if (verifyData.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            dispatchPayment({ type: "SET_PROCESSING", value: false });
            alert("Error verifying payment signature.");
          }
        },
        modal: {
          ondismiss: function () {
            dispatchPayment({ type: "SET_PROCESSING", value: false });
          }
        },
        prefill: {
          name: customFormValues["Full Name"] || customFormValues["Your Name"] || customFormValues["Name"] || bookingForm.name || checkoutForm.name || username || "Customer",
          contact: customFormValues["Phone Number"] || customFormValues["Phone"] || customFormValues["Mobile"] || customFormValues["Mobile Number"] || bookingForm.phone || checkoutForm.phone || ""
        },
        theme: {
          color: "#6366f1"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      dispatchPayment({ type: "SET_PROCESSING", value: false });
      alert("Payment gateway connection failed.");
    }
  };

  // Persist a booking/order into the Booking DB model so it shows up in the
  // Order/submission creation now requires a logged-in customer. Buttons that
  // open the booking/checkout modals already gate on `username`, so a token
  // should exist here — but read it fresh in case it expired mid-session.
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("fmp_user_token") || localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  // customer's "My Bookings" page. `formData` carries the full dynamic form
  // payload, so any field the client adds to their booking form in future is
  // stored automatically without a schema change.
  const saveBookingToDb = (opts: {
    id?: string;
    amount: number;
    paymentId: string;
    bookingType?: "service" | "product" | "appointment" | "room";
    serviceName?: string;
    formData?: Record<string, any>;
    items?: Array<{ name: string; quantity: number; price?: number }>;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    date?: string;
    time?: string;
  }) => {
    const userToken = localStorage.getItem("fmp_user_token") || localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    // Only logged-in customers have a "My Bookings" list to attach this to.
    if (!userToken) return;

    fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        id: opts.id,
        businessId: currentBiz.id,
        businessName: currentBiz.name,
        category: currentBiz.category,
        service: opts.serviceName || "",
        date: opts.date || "",
        time: opts.time || "",
        amount: opts.amount,
        location: currentBiz.location || currentBiz.address || "",
        customerName: opts.customerName || "",
        customerPhone: opts.customerPhone || "",
        customerEmail: opts.customerEmail || "",
        customerAddress: opts.customerAddress || "",
        items: opts.items || [],
        formData: opts.formData || {},
        bookingType: opts.bookingType || "service",
        paymentId: opts.paymentId,
        paymentMethod: "Razorpay Gateway",
        paymentStatus: "paid",
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

  // Reviews Form & Custom Reviews State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newName, setNewName] = useState(username || "");
  const [newEmail, setNewEmail] = useState("");
  const [newText, setNewText] = useState("");
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);
  const [customReviews, setCustomReviews] = useState<UserReview[]>([]);

  const [deletedReviews, setDeletedReviews] = useState<string[]>([]);

  const loadDeletedReviews = () => {
    try {
      const saved = localStorage.getItem("fmp_deleted_reviews");
      if (saved) {
        setDeletedReviews(JSON.parse(saved));
      } else {
        setDeletedReviews([]);
      }
    } catch (e) {}
  };

  if (businessId !== prevBusinessId) {
    setPrevBusinessId(businessId);
    setCart({});
    setCartCheckoutTotal(null);
    setCartOpen(false);
    setUiState((prev) => ({
      ...prev,
      revealPhone: false,
      enquirySubmitted: false,
      activeFaqIndex: null,
      productSearch: "",
    }));
  }

  useEffect(() => {
    loadDeletedReviews();
    const handleStorage = () => {
      loadDeletedReviews();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fmp_custom_reviews:${currentBiz.id}`);
      if (saved) {
        setCustomReviews(JSON.parse(saved));
      } else {
        setCustomReviews([]);
      }
    } catch (e) {
      console.error("Failed to load custom reviews", e);
    }
  }, [currentBiz.id]);

  const allReviews = useMemo(() => {
    const combined = [...customReviews, ...(currentBiz.reviews || [])];
    const unique: UserReview[] = [];
    const seen = new Set<string>();
    
    combined.forEach(r => {
      const key = `${r.userName}-${r.reviewText}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    });

    return unique.filter(r => {
      const key = `${currentBiz.id}:${r.userName}:${r.reviewText}`;
      return !deletedReviews.includes(key);
    });
  }, [customReviews, currentBiz.reviews, deletedReviews, currentBiz.id]);

  const totalReviewCount = useMemo(() => {
    const deletedStaticCount = (currentBiz.reviews || []).filter(r => {
      const key = `${currentBiz.id}:${r.userName}:${r.reviewText}`;
      return deletedReviews.includes(key);
    }).length;
    const deletedCustomCount = customReviews.filter(r => {
      const key = `${currentBiz.id}:${r.userName}:${r.reviewText}`;
      return deletedReviews.includes(key);
    }).length;

    return Math.max(0, (currentBiz.reviewCount || 0) + customReviews.length - deletedStaticCount - deletedCustomCount);
  }, [currentBiz.reviewCount, customReviews, deletedReviews, currentBiz.id, currentBiz.reviews]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      alert("Please select a rating!");
      return;
    }
    if (!newName.trim() || !newText.trim()) {
      alert("Please fill in your name and review comment!");
      return;
    }
    
    const colors = [
      "from-indigo-500 to-purple-600",
      "from-emerald-500 to-teal-650",
      "from-rose-500 to-pink-600",
      "from-amber-500 to-orange-500",
      "from-blue-500 to-indigo-600"
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newReview: UserReview = {
      userName: newName.trim(),
      userInitial: newName.trim().charAt(0).toUpperCase() || "A",
      userColor: randomColor,
      rating: newRating,
      date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      reviewText: newText.trim(),
      userEmail: newEmail.trim() || undefined,
    };

    // Post to backend database
    fetch(`${API_BASE_URL}/businesses/${currentBiz.id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userName: newReview.userName,
        rating: newReview.rating,
        reviewText: newReview.reviewText,
        userEmail: newReview.userEmail
      })
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.data) {
        setCurrentBiz((prev) => ({
          ...prev,
          reviews: data.data,
          rating: data.rating,
          reviewCount: data.reviewCount
        }));
      }
    })
    .catch((err) => {
      console.error("Failed to submit review to backend:", err);
    });
    
    const updated = [newReview, ...customReviews];
    setCustomReviews(updated);
    
    try {
      localStorage.setItem(`fmp_custom_reviews:${currentBiz.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save custom review", err);
    }
    
    // Reset Form
    setNewRating(0);
    setNewEmail("");
    setNewText("");
    setReviewSubmittedSuccess(true);
    setTimeout(() => {
      setReviewSubmittedSuccess(false);
    }, 2000);
  };

  const getBookingPrice = () => {
    if (cartCheckoutTotal !== null) {
      return cartCheckoutTotal;
    }
    if (currentBiz.category.includes("Hotel Point")) {
      const room = bookingForm.guests || "";
      if (room.includes("1,999")) return 1999;
      if (room.includes("2,999")) return 2999;
      if (room.includes("4,499")) return 4499;
      return 1999;
    }
    if (
      currentBiz.category.includes("Health Care Point") ||
      currentBiz.category.includes("Doctor Point")
    ) {
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
    const item = (currentBiz.products || []).find((p) => p.name === name);
    if (!item) return sum;
    const priceNum = parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
    return sum + priceNum * qty;
  }, 0);

  const addToCart = (itemName: string) => {
    setCart((prev) => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + 1,
    }));
  };

  const removeFromCart = (itemName: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemName] > 1) {
        newCart[itemName] -= 1;
      } else {
        delete newCart[itemName];
      }
      return newCart;
    });
  };

  const handleCartCheckout = () => {
    if (Object.keys(cart).length === 0) return;
    const itemsSummary = Object.entries(cart)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(", ");
    setCartCheckoutTotal(totalCartPrice);
    dispatchBooking({ type: "RESET", username: username || "" });
    dispatchBooking({
      type: "UPDATE_FORM",
      fields: {
        name: username || "",
        phone: "",
        date: new Date().toISOString().split("T")[0],
        guests: itemsSummary,
        time: currentBiz.category.includes("Hotel Point")
          ? new Date(Date.now() + 86400000).toISOString().split("T")[0]
          : "07:00 PM",
      },
    });
    setCartOpen(false);
    dispatchBooking({ type: "SET_MODAL", open: true });
  };

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    mobile: "",
    email: "",
    message: `Hi, I am interested in your services. Please contact me.`,
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

  // Scroll to menu/booking section when navigated via Book Now
  useEffect(() => {
    if (scrollToMenu) {
      const timer = setTimeout(() => {
        const element = document.getElementById("menu-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [scrollToMenu, businessId]);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.mobile) {
      alert("Please fill in your Name and Mobile Number.");
      return;
    }
    setUiState((prev) => ({ ...prev, enquirySubmitted: true }));

    // Send enquiry to backend API
    fetch(`http://localhost:5000/api/businesses/${currentBiz.id}/enquire`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: enquiryForm.name,
        phone: enquiryForm.mobile,
        email: enquiryForm.email || "",
        message: enquiryForm.message || "",
        subject: `Enquiry for ${currentBiz.name}`
      })
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          window.dispatchEvent(new Event("storage"));
        }
      }).catch(err => console.error("Enquiry submit failed:", err));

    setTimeout(() => {
      setEnquiryForm({
        name: "",
        mobile: "",
        email: "",
        message: `Hi, I am interested in your services. Please contact me.`,
      });
    }, 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: currentBiz.name,
          text: currentBiz.description,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Business link copied to clipboard!");
    }
  };

  // Filter products based on search term
  const filteredProducts = (currentBiz.products || []).filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.desc.toLowerCase().includes(productSearch.toLowerCase()),
  );

  // Show loading state while fetching
  if (bizLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="animate-spin text-5xl mb-4">⏳</div>
        <p className="text-gray-500">Loading business details...</p>
      </div>
    );
  }

  // Show not-found if business doesn't exist
  if (bizNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Business Not Found</h2>
        <p className="text-gray-500 mb-6">The business listing you are looking for does not exist or has been removed.</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="relative sm:sticky top-0 left-0 right-0 z-40 border-0 sm:border-b sm:border-border bg-secondary/40 sm:bg-background/85 sm:backdrop-blur-xl">
        <div className="mx-auto flex h-12 sm:h-16 md:h-20 max-w-7xl items-center gap-3 md:gap-8 px-4 md:px-6 w-full">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="flex items-center shrink-0"
          >
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-7 md:h-8 w-auto object-contain shrink-0"
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

          <div className="hidden md:flex items-center gap-2.5 ml-auto md:ml-0 shrink-0">
            <button
              onClick={() => onBack()}
              className="hidden sm:inline-block px-4 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground cursor-pointer"
            >
              Home
            </button>
            <button className="hidden md:inline-block rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold transition hover:bg-secondary cursor-pointer">
              Discover
            </button>
            {!username && (
              <button
                onClick={onSignInClick}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-pointer shrink-0"
              >
                Sign In
              </button>
            )}
            {username && (
              <button
                onClick={onProfileClick}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer font-bold text-xs bg-primary shrink-0"
                title="Open Profile Menu"
              >
                {username.charAt(0).toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Gallery Collage Section */}
      <div className="bg-secondary/40 border-b border-border pt-3 pb-4 sm:py-4">
        <div className="mx-auto max-w-7xl px-6 w-full flex flex-col gap-3">
          {/* Back Button */}
          <div className="flex justify-start">
            <button
              onClick={onBack}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition group-hover:bg-secondary shrink-0">
                <ArrowLeft className="h-4.5 w-4.5 md:h-5 md:w-5 text-foreground" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground transition group-hover:text-foreground font-sans">
                Back
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 h-[180px] sm:h-[320px] overflow-hidden rounded-3xl border border-border/80 shadow-md">
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
      <main className="mx-auto max-w-7xl px-6 py-8 w-full">
        {/* Breadcrumb & Ratings summary row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <nav className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
              className="hover:text-primary transition-colors"
            >
              Home
            </a>
            <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
            <span className="hover:text-primary transition-colors cursor-pointer">
              {currentBiz.location.split(" - ")[1] || "Indore"}
            </span>
            <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
            <span className="hover:text-primary transition-colors cursor-pointer">
              {currentBiz.category}
            </span>
            <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
            <span className="text-foreground font-extrabold">{currentBiz.name}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
              {currentBiz.rating} <Star className="h-3.5 w-3.5 fill-white stroke-none" />
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {totalReviewCount} Ratings
            </span>
            {currentBiz.isVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <ShieldCheck className="h-3.5 w-3.5 fill-emerald-500 text-white" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-slate-500 bg-slate-55 border border-slate-200 px-2 py-0.5 rounded-md">
                Unverified
              </span>
            )}
          </div>
        </div>

        {/* Business Title Header */}
        <div className="border-b border-border pb-6 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 text-left">
            {currentBiz.highlightsName && (
              <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm mb-2.5">
                <Sparkles className="h-3.5 w-3.5" /> {currentBiz.highlightsName}
              </div>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 dark:text-white font-black tracking-tight leading-none">
              {currentBiz.name}
            </h1>
            <p className="text-muted-foreground text-sm font-semibold mt-2 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-rose-500" /> {currentBiz.address}
            </p>

            {(currentBiz.categoryLine || currentBiz.subCategoryLine) && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {currentBiz.categoryLine && (
                  <span className="text-[9px] uppercase font-black tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 px-2 py-0.5 rounded-md">
                    {currentBiz.categoryLine}
                  </span>
                )}
                {currentBiz.subCategoryLine && (
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-600 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                    {currentBiz.subCategoryLine}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs font-bold mt-3.5 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-accent" /> Timings: {currentBiz.timings}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase border border-emerald-100">
                {currentBiz.openStatus}
              </span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto md:shrink-0">
            {/* Buttons Row: Call, Enquire, Book */}
            <div className="flex flex-row items-center gap-1.5 w-full sm:w-auto">
              <a
                href={`tel:${currentBiz.phone.replace(/[^0-9+]/g, "")}`}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-card py-2.5 px-2 text-[10px] sm:text-xs font-bold text-foreground hover:bg-secondary transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Phone className="h-3 w-3 text-accent shrink-0" />
                Call
              </a>

              <button
                onClick={() => {
                  setEnquiryForm({ name: "", mobile: "", email: "", message: "Hi, I am interested in your services. Please contact me." });
                  setUiState((prev) => ({ ...prev, enquiryModalOpen: true, enquirySubmitted: false }));
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-[#0f172a] dark:bg-slate-800 py-2.5 px-2 text-[10px] sm:text-xs font-bold text-white transition shadow-sm hover:scale-[1.02] cursor-pointer whitespace-nowrap"
              >
                Enquire Now
              </button>

              {!currentBiz.isBookingDisabled && (
                <button
                  onClick={() => {
                    const element = document.getElementById("menu-section");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-emerald-600 py-2.5 px-2 text-[10px] sm:text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm hover:scale-[1.02] cursor-pointer whitespace-nowrap"
                >
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {currentBiz.bookingButtonLabel
                      ? currentBiz.bookingButtonLabel
                      : (customFormConfig
                          ? (customFormConfig.formTitle || "Book Now")
                          : (currentBiz.category.includes("Hotel Point")
                              ? "Book Room"
                              : currentBiz.category.includes("Health Care Point") ||
                                  currentBiz.category.includes("Doctor Point")
                                ? "Book Appointment"
                                : "Book Table"))}
                  </span>
                </button>
              )}
            </div>

            {/* Circular Social/Bookmark/Direction Row */}
            <div className="flex flex-row items-center gap-2 mt-1 sm:mt-0">
              <a
                href={`https://wa.me/${currentBiz.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#25d366]/30 bg-[#25d366]/5 hover:bg-[#25d366] hover:text-white transition-all shadow-sm cursor-pointer text-[#25d366]"
                title="Chat on WhatsApp"
              >
                <svg
                  className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 1.968 13.91 .94 11.997.94c-5.442 0-9.867 4.371-9.871 9.8.001 1.83.483 3.61 1.398 5.183L2.5 21.082l5.147-1.33c-.007.005-.007.005 0 0zm9.967-6.758c-.31-.154-1.834-.894-2.115-.995-.28-.102-.485-.153-.687.154-.202.307-.783.995-.96 1.198-.177.205-.355.23-.665.077-1.127-.565-1.953-.972-2.73-1.637-.777-.665-1.28-1.488-1.433-1.753-.153-.307-.016-.473.138-.626.14-.138.31-.36.467-.538.153-.18.204-.307.307-.512.102-.205.05-.384-.025-.538-.077-.154-.687-1.637-.94-2.253-.247-.6-.5-.518-.688-.528-.178-.01-.383-.01-.588-.01-.205 0-.538.077-.82.384-.282.307-1.077 1.05-1.077 2.561 0 1.51 1.1 2.97 1.253 3.176.154.205 2.164 3.266 5.244 4.581.733.313 1.306.499 1.75.64.737.234 1.408.201 1.94.122.592-.088 1.834-.74 2.09-1.455.257-.717.257-1.332.18-1.456-.076-.124-.282-.201-.592-.356z" />
                </svg>
              </a>
              <button
                onClick={handleShare}
                className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition shadow-sm text-muted-foreground cursor-pointer"
                title="Share"
              >
                <Share2 className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
              </button>
              <button
                onClick={() => setUiState((prev) => ({ ...prev, bookmarked: !prev.bookmarked }))}
                className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border transition shadow-sm cursor-pointer ${bookmarked ? "text-amber-500 border-amber-200 bg-amber-50/20" : "text-muted-foreground border-border bg-card hover:bg-secondary"}`}
                title="Save"
              >
                <Bookmark
                  className={`h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 ${bookmarked ? "fill-amber-500" : ""}`}
                />
              </button>
              {/* Direction Button */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentBiz.name + ", " + currentBiz.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition shadow-sm text-muted-foreground hover:text-primary cursor-pointer"
                title="Directions"
              >
                <Compass className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-blue-600 dark:text-blue-400" />
              </a>
            </div>
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
              <p className="text-[13px] text-muted-foreground/95 font-semibold leading-relaxed text-left">
                {currentBiz.description}
              </p>

              {currentBiz.othersDestination && (
                <div className="mt-4 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/25 dark:border-amber-900/35 rounded-2xl p-4 text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-2.5 text-left">
                  <span className="text-amber-500 text-sm leading-none mt-0.5">💡</span>
                  <div>
                    <span className="block font-black text-amber-800 dark:text-amber-400 text-[10px] uppercase tracking-wider">
                      Highlight Info
                    </span>
                    <p className="mt-0.5">{currentBiz.othersDestination}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Tour Section if present */}
            {currentBiz.videoLink && (
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-left border-b border-border/40 pb-2 flex items-center gap-2">
                  <Video className="h-5 w-5 text-rose-500" /> Video Tour & Promo
                </h3>
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-border shadow-md bg-black">
                  <iframe
                    src={
                      currentBiz.videoLink.includes("watch?v=")
                        ? currentBiz.videoLink.replace("watch?v=", "embed/").split("&")[0]
                        : currentBiz.videoLink.includes("youtu.be/")
                          ? currentBiz.videoLink
                              .replace("youtu.be/", "youtube.com/embed/")
                              .split("?")[0]
                          : currentBiz.videoLink
                    }
                    title={`${currentBiz.name} Video Tour`}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Business Officers if present */}
            {currentBiz.officers && currentBiz.officers.length > 0 && (
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-left border-b border-border/40 pb-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" /> Key Management & Officers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentBiz.officers.map((off, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 bg-transparent sm:bg-card border-none sm:border sm:border-border p-2 sm:p-3.5 rounded-none sm:rounded-2xl shadow-none sm:shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shrink-0">
                        {off.name.charAt(0)}
                      </div>
                      <div className="text-left min-w-0">
                        <span className="block font-bold text-sm text-slate-900 dark:text-white truncate">
                          {off.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider mt-0.5">
                          {off.designation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Branches if present */}
            {currentBiz.branches && currentBiz.branches.length > 0 && (
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-left border-b border-border/40 pb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-500" /> Business Branches
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentBiz.branches.map((branch, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-transparent sm:bg-secondary/25 border-none sm:border sm:border-border/60 p-2 sm:p-3.5 rounded-none sm:rounded-2xl"
                    >
                      <span className="text-rose-500 mt-0.5 text-sm">📍</span>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                          Branch #{idx + 1}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                          {branch}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Facilities if present */}
            {currentBiz.facilities && currentBiz.facilities.length > 0 && (
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-left border-b border-border/40 pb-2 flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" /> Facilities & Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentBiz.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-905 px-3.5 py-1.5 rounded-xl shadow-sm"
                    >
                      <span className="text-emerald-500 text-xs font-black">✓</span> {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Section */}
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-foreground mb-3 uppercase tracking-wider text-left border-b border-border/40 pb-2">
                Photos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentBiz.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm bg-secondary group"
                  >
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
            <div id="menu-section" className="flex flex-col scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-black text-foreground uppercase tracking-wider text-left">
                  {currentBiz.category.includes("Food Point") ||
                  currentBiz.category.toLowerCase().includes("restaurant")
                    ? "Menu & Special Dishes"
                    : "Products & Services"}
                </h3>
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Search in catalog..."
                    value={productSearch}
                    onChange={(e) =>
                      setUiState((prev) => ({ ...prev, productSearch: e.target.value }))
                    }
                    className="w-full bg-card border border-border rounded-full py-1.5 pl-4 pr-10 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                  />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                currentBiz.category.includes("Food Point") ||
                currentBiz.category.toLowerCase().includes("restaurant") ? (
                  // Food List View
                  <div className="flex flex-col gap-4">
                    {filteredProducts.map((prod, idx) => {
                      const qty = cart[prod.name] || 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-transparent sm:bg-card rounded-none sm:rounded-2xl border-none sm:border sm:border-border p-2 sm:p-4 shadow-none sm:shadow-[var(--shadow-card)] hover:shadow-none sm:hover:shadow-md sm:hover:border-primary/10 transition duration-300"
                        >
                          {/* Left: Food Image */}
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                            <img
                              src={prod.img}
                              alt={prod.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Middle: Details */}
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-sm sm:text-base font-black text-foreground line-clamp-2 leading-tight">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed line-clamp-2">
                              {prod.desc}
                            </p>
                          </div>

                          {/* Right: Add / Quantity Controls */}
                          <div className="shrink-0 pl-2 flex flex-col items-end gap-1.5 justify-center">
                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                              {prod.price}
                            </span>
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => addToCart(prod.name)}
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
                              >
                                Add +
                              </button>
                            ) : (
                              <div className="flex items-center justify-between border border-emerald-600 bg-white text-emerald-600 rounded-full px-3 py-1 w-24 h-[34px] text-xs font-bold shadow-sm select-none">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(prod.name)}
                                  className="hover:text-emerald-800 active:scale-90 font-black cursor-pointer text-sm w-6 h-6 flex items-center justify-center transition border-none bg-transparent"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs min-w-[12px] text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => addToCart(prod.name)}
                                  className="hover:text-emerald-800 active:scale-90 font-black cursor-pointer text-sm w-6 h-6 flex items-center justify-center transition border-none bg-transparent"
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
                  // General List View (menu-style)
                  <div className="flex flex-col gap-4">
                    {filteredProducts.map((prod, idx) => {
                      const qty = cart[prod.name] || 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-transparent sm:bg-card rounded-none sm:rounded-2xl border-none sm:border sm:border-border p-2 sm:p-4 shadow-none sm:shadow-[var(--shadow-card)] hover:shadow-none sm:hover:shadow-md sm:hover:border-primary/10 transition duration-300"
                        >
                          {/* Left: Product Image */}
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                            <img
                              src={prod.img}
                              alt={prod.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Middle: Details */}
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-sm sm:text-base font-black text-foreground line-clamp-2 leading-tight">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed line-clamp-2">
                              {prod.desc}
                            </p>
                          </div>

                          {/* Right: Add to Cart Button / Quantity Selector */}
                          <div className="shrink-0 pl-2 flex flex-col items-end gap-1.5 justify-center">
                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                              {prod.price}
                            </span>
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  addToCart(prod.name);
                                  setCartOpen(true);
                                }}
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-2.5 py-1.5 text-[10.5px] font-bold transition cursor-pointer shadow-sm active:scale-95 whitespace-nowrap border-none"
                              >
                                <ShoppingCart className="h-3 w-3" />
                                Add to Cart
                              </button>
                            ) : (
                              <div className="flex items-center justify-between border border-emerald-600 bg-white text-emerald-600 rounded-full px-3 py-1 w-24 h-[34px] text-xs font-bold shadow-sm select-none">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(prod.name)}
                                  className="hover:text-emerald-800 active:scale-90 font-black cursor-pointer text-sm w-6 h-6 flex items-center justify-center transition border-none bg-transparent"
                                >
                                  &minus;
                                </button>
                                <span className="font-bold text-xs min-w-[12px] text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => addToCart(prod.name)}
                                  className="hover:text-emerald-800 active:scale-90 font-black cursor-pointer text-sm w-6 h-6 flex items-center justify-center transition border-none bg-transparent"
                                >
                                  &#43;
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-transparent sm:bg-secondary/25 border-none sm:border sm:border-border/60 rounded-none sm:rounded-3xl p-2 sm:p-6 mb-8 shadow-none sm:shadow-sm">
                {/* Visual average card */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center md:border-r border-border/60 py-4 pr-4">
                  <span className="text-5xl font-black text-foreground leading-none">
                    {currentBiz.rating}
                  </span>
                  <div className="flex items-center gap-0.5 mt-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4.5 w-4.5 ${idx < Math.floor(currentBiz.rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground mt-2">
                    {totalReviewCount} user ratings
                  </span>
                </div>

                {/* Progress breakdown */}
                <div className="md:col-span-8 flex flex-col gap-2">
                  {[
                    { label: "5 Star", percent: 80 },
                    { label: "4 Star", percent: 12 },
                    { label: "3 Star", percent: 6 },
                    { label: "2 Star", percent: 2 },
                    { label: "1 Star", percent: 0 },
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-bold">
                      <span className="w-12 text-muted-foreground shrink-0">{row.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden border border-border/30">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${row.percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground/80 shrink-0">
                        {row.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews list */}
              <div className="flex flex-col gap-6">
                {allReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="bg-transparent sm:bg-card rounded-none sm:rounded-2xl border-none border-b border-border/40 sm:border sm:border-border p-2 sm:p-5 shadow-none sm:shadow-[var(--shadow-card)] pb-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Reviewer Row */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-tr ${rev.userColor} shadow-inner`}
                        >
                          {rev.userInitial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-foreground">{rev.userName}</span>
                          <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                            {rev.userEmail || "Verified Reviewer"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-muted-foreground">
                        {rev.date}
                      </span>
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


          </div>

          {/* RIGHT COLUMN: Sidebar Form & Similar Listings */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
            {/* Send Enquiry Form removed — now shown as modal on Enquire Now click */}

            {/* Business Extra Contact Information */}
            {(currentBiz.email ||
              currentBiz.website ||
              currentBiz.whatsapp ||
              (currentBiz.extraNumbers && currentBiz.extraNumbers.length > 0)) && (
              <div className="bg-transparent sm:bg-card rounded-none sm:rounded-2xl border-none sm:border sm:border-border p-2 sm:p-6 shadow-none sm:shadow-[var(--shadow-card)] text-left">
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Contact Information
                  </h4>
                  <Phone className="h-4.5 w-4.5 text-indigo-500" />
                </div>

                <div className="space-y-4">
                  {/* Website */}
                  {currentBiz.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                          Official Website
                        </span>
                        <a
                          href={currentBiz.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-bold break-all block mt-0.5 text-left"
                        >
                          {currentBiz.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {currentBiz.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 text-left">
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                          Email Address
                        </span>
                        <a
                          href={`mailto:${currentBiz.email}`}
                          className="text-xs text-slate-900 dark:text-white hover:text-primary font-bold break-all block mt-0.5 text-left"
                        >
                          {currentBiz.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Whatsapp */}
                  {currentBiz.whatsapp && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-4.5 w-4.5 text-[#25d366] fill-current shrink-0 mt-0.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 1.968 13.91 .94 11.997.94c-5.442 0-9.867 4.371-9.871 9.8.001 1.83.483 3.61 1.398 5.183L2.5 21.082l5.147-1.33c-.007.005-.007.005 0 0zm9.967-6.758c-.31-.154-1.834-.894-2.115-.995-.28-.102-.485-.153-.687.154-.202.307-.783.995-.96 1.198-.177.205-.355.23-.665.077-1.127-.565-1.953-.972-2.73-1.637-.777-.665-1.28-1.488-1.433-1.753-.153-.307-.016-.473.138-.626.14-.138.31-.36.467-.538.153-.18.204-.307.307-.512.102-.205.05-.384-.025-.538-.077-.154-.687-1.637-.94-2.253-.247-.6-.5-.518-.688-.528-.178-.01-.383-.01-.588-.01-.205 0-.538.077-.82.384-.282.307-1.077 1.05-1.077 2.561 0 1.51 1.1 2.97 1.253 3.176.154.205 2.164 3.266 5.244 4.581.733.313 1.306.499 1.75.64.737.234 1.408.201 1.94.122.592-.088 1.834-.74 2.09-1.455.257-.717.257-1.332.18-1.456-.076-.124-.282-.201-.592-.356z" />
                      </svg>
                      <div className="min-w-0 text-left">
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                          WhatsApp Us
                        </span>
                        <a
                          href={`https://wa.me/${currentBiz.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:underline font-bold block mt-0.5 text-left"
                        >
                          {currentBiz.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Extra Numbers */}
                  {currentBiz.extraNumbers && currentBiz.extraNumbers.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 text-left">
                        <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                          Extra Contact Numbers
                        </span>
                        <div className="flex flex-col gap-1.5 mt-1">
                          {currentBiz.extraNumbers.map((num, idx) => (
                            <a
                              key={idx}
                              href={`tel:${num}`}
                              className="text-xs text-slate-950 dark:text-white hover:text-primary font-bold block text-left"
                            >
                              {num}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* People Also Viewed Widget */}
            {currentBiz.similarListings.length > 0 && (
              <div className="bg-transparent sm:bg-card rounded-none sm:rounded-2xl border-none sm:border sm:border-border p-2 sm:p-6 shadow-none sm:shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                    People Also Viewed
                  </h4>
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

            {/* Write a Review Widget */}
            <div id="write-review-form" className="bg-transparent sm:bg-card rounded-none sm:rounded-2xl border-none sm:border sm:border-border p-2 sm:p-6 shadow-none sm:shadow-[var(--shadow-card)] text-left scroll-mt-28 mt-6">
              <div className="border-b border-border/30 pb-3 mb-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500/10" /> Write a Review
                </h4>
              </div>
              
              {reviewSubmittedSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/30 dark:border-emerald-900/40 rounded-2xl p-5 text-center text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
                  Review submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                      Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, sIdx) => {
                          const starValue = sIdx + 1;
                          const isLit = starValue <= (hoverRating || newRating);
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onMouseEnter={() => setHoverRating(starValue)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setNewRating(starValue)}
                              className="p-0.5 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                            >
                              <Star
                                className={`h-5 w-5 transition-all ${
                                  isLit 
                                    ? "text-amber-500 fill-amber-500" 
                                    : "text-muted-foreground/35 hover:text-amber-500/70"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.2 rounded border border-amber-250/35">
                        {(() => {
                          const activeRate = hoverRating || newRating;
                          if (activeRate === 5) return "Excellent";
                          if (activeRate === 4) return "Very Good";
                          if (activeRate === 3) return "Good";
                          if (activeRate === 2) return "Average";
                          if (activeRate === 1) return "Poor";
                          return "Select Rating";
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                      Name *
                    </label>
                    <input
                      id="review-name-input"
                      type="text"
                      required
                      placeholder="Your Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-border outline-none focus:border-indigo-500 transition-all font-semibold shadow-sm"
                    />
                  </div>

                  {/* Email field (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-border outline-none focus:border-indigo-500 transition-all font-semibold shadow-sm"
                    />
                  </div>

                  {/* Comment Area */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                      Comment *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share details of your experience..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-border outline-none focus:border-indigo-500 transition-all font-semibold shadow-sm resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setNewRating(0);
                        setNewText("");
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary text-[11px] font-bold transition cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Expandable FAQs Section */}
            {currentBiz.faqs.length > 0 && (
              <div className="bg-transparent sm:bg-card rounded-none sm:rounded-2xl border-none sm:border sm:border-border p-2 sm:p-6 shadow-none sm:shadow-[var(--shadow-card)] text-left mt-6">
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                    Frequently Asked Questions
                  </h4>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  {currentBiz.faqs.map((faq, idx) => {
                    const isActive = activeFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="bg-transparent sm:bg-card rounded-none sm:rounded-xl border-none border-b border-border/40 sm:border sm:border-border overflow-hidden shadow-none sm:shadow-sm"
                      >
                        <button
                          onClick={() =>
                            setUiState((prev) => ({
                              ...prev,
                              activeFaqIndex: isActive ? null : idx,
                            }))
                          }
                          className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-foreground hover:bg-secondary/40 transition-colors"
                        >
                          <span className="leading-snug">{faq.question}</span>
                          {isActive ? (
                            <ChevronUp className="h-4 w-4 text-accent shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-accent shrink-0 ml-2" />
                          )}
                        </button>
                        {isActive && (
                          <div className="px-4 pb-3 pt-1 text-[11px] text-muted-foreground font-semibold leading-relaxed border-t border-border/30 bg-secondary/10">
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customFormConfig) {
                    let valid = true;
                    customFormConfig.fields.forEach((f: any) => {
                      if (f.required) {
                        const val = customFormValues[f.label];
                        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0) || val === false) {
                          valid = false;
                        }
                      }
                    });
                    if (!valid) {
                      alert("Please fill in all required fields.");
                      return;
                    }
                  } else {
                    if (!bookingForm.name || !bookingForm.phone) {
                      alert("Please fill in your Name and Phone Number.");
                      return;
                    }
                  }

                  const amount = getBookingPrice();
                  handleRazorpayPayment(amount, async (paymentId) => {
                    dispatchBooking({ type: "SET_STEP", step: "success" });
                    dispatchBooking({ type: "SET_SUBMITTED", value: true });
                    setCart({});

                    let dataToSave: Record<string, any> = {};
                    if (customFormConfig) {
                      dataToSave = { ...customFormValues };
                    } else {
                      dataToSave = {
                        "Full Name": bookingForm.name,
                        "Phone Number": bookingForm.phone,
                        "Date": bookingForm.date,
                        "Guests/Room/Age": bookingForm.guests,
                        "Time/Check-out/Slot": bookingForm.time,
                      };
                    }

                    // Always inject logged-in customer details from backend
                    try {
                      const profRes = await fetch("http://localhost:5000/api/auth/profile", { headers: getAuthHeaders() });
                      const profData = await profRes.json();
                      if (profData.success && profData.user) {
                        const prof = profData.user;
                        const fullName = [prof.firstName, prof.lastName].filter(Boolean).join(" ");
                        if (!dataToSave["Full Name"] && !dataToSave["Customer Name"] && !dataToSave["Your Name"] && !dataToSave["Name"] && fullName) dataToSave["Full Name"] = fullName;
                        if (!dataToSave["Phone Number"] && !dataToSave["Phone"] && !dataToSave["Mobile"] && !dataToSave["Mobile Number"] && prof.mobile1) dataToSave["Phone Number"] = prof.mobile1;
                        if (!dataToSave["Email"] && !dataToSave["Email Address"] && prof.email) dataToSave["Email"] = prof.email;
                      }
                    } catch (_) {}

                    const bookingId = `BK${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
                    setConfirmedOrderId(bookingId);

                    const newSub = {
                      id: bookingId,
                      timestamp: formatDateTimeDMY(new Date()),
                      data: dataToSave
                    };

                    fetch(`http://localhost:5000/api/service-forms/${currentBiz.id}/submissions`, {
                      method: "POST",
                      headers: getAuthHeaders(),
                      body: JSON.stringify({
                        id: bookingId,
                        businessName: currentBiz.name,
                        data: dataToSave
                      })
                    }).then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          window.dispatchEvent(new Event("storage"));
                        }
                      }).catch(err => console.error("API submission failed:", err));



                    const customerNameField = dataToSave["Full Name"] || customFormValues["Full Name"] || customFormValues["Your Name"] || bookingForm.name || username || "Guest";
                    const details = currentBiz.category.includes("Hotel Point")
                      ? "Room Stay Reservation Deposit"
                      : currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")
                        ? "Appointment Consultation Fee"
                        : "Table Booking Deposit";

                    // API Transaction Log POST call
                    fetch("http://localhost:5000/api/transactions", {
                      method: "POST",
                      headers: getAuthHeaders(),
                      body: JSON.stringify({
                        description: details,
                        businessName: currentBiz.name,
                        businessId: currentBiz.id,
                        bookingId: bookingId,
                        customerName: customerNameField,
                        details,
                        amount,
                        type: "credit",
                        paymentMethod: "Razorpay Gateway",
                        status: "Completed"
                      })
                    }).then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          window.dispatchEvent(new Event("storage"));
                        }
                      }).catch(err => console.error("API transaction failed:", err));

                    // Persist to the Booking DB model (shows in customer's My Bookings)
                    saveBookingToDb({
                      id: bookingId,
                      amount,
                      paymentId,
                      bookingType: currentBiz.category.includes("Hotel Point")
                        ? "room"
                        : currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")
                          ? "appointment"
                          : "service",
                      serviceName: customFormConfig?.formTitle || details,
                      formData: dataToSave,
                      customerName: customerNameField,
                      customerPhone: dataToSave["Phone Number"] || customFormValues["Phone Number"] || customFormValues["Phone"] || customFormValues["Mobile"] || customFormValues["Mobile Number"] || bookingForm.phone || "",
                      customerEmail: dataToSave["Email"] || customFormValues["Email"] || customFormValues["Email Address"] || "",
                      date: customFormValues["Date"] || bookingForm.date || "",
                      time: bookingForm.time || customFormValues["Time/Check-out/Slot"] || customFormValues["Time"] || "",
                    });

                    setCart({});
                  });
                }}
              >
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  {customFormConfig
                    ? (customFormConfig.formTitle || "Book Services")
                    : (currentBiz.category.includes("Hotel Point")
                        ? "Book a Room"
                        : currentBiz.category.includes("Health Care Point") ||
                            currentBiz.category.includes("Doctor Point")
                          ? "Book an Appointment"
                          : "Book a Table")}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {customFormConfig
                    ? (customFormConfig.formDescription || "Fill in the details to book our services at ")
                    : (currentBiz.category.includes("Hotel Point")
                        ? "Reserve your room stay at "
                        : currentBiz.category.includes("Health Care Point") ||
                            currentBiz.category.includes("Doctor Point")
                          ? "Schedule your consultation at "
                          : "Reserve your table at ")}
                  <span className="font-bold text-primary">{currentBiz.name}</span>
                </p>

                <div className="space-y-4">
                  {customFormConfig ? (
                    customFormConfig.fields.map((f: any) => (
                      <div key={f.id} className="text-left">
                        <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                          {f.label} {f.required && <span className="text-rose-500">*</span>}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            required={f.required}
                            placeholder={f.placeholder}
                            value={customFormValues[f.label] || ""}
                            onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.value }))}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
                          />
                        ) : f.type === "select" ? (
                          f.selectMode === "multiple" ? (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenCustomDropdowns((prev) => ({ ...prev, [f.label]: !prev[f.label] }))}
                                className="w-full bg-background text-xs px-3.5 py-2.5 rounded-xl border border-border outline-none flex items-center justify-between text-foreground cursor-pointer"
                              >
                                <span className="truncate">
                                  {(!customFormValues[f.label] || customFormValues[f.label].length === 0)
                                    ? f.placeholder || "Select options..."
                                    : customFormValues[f.label].join(", ")}
                                </span>
                                {openCustomDropdowns[f.label] ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                              </button>
                              {openCustomDropdowns[f.label] && (
                                <div className="absolute z-55 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto p-2 space-y-1">
                                  {f.options.map((opt: string) => {
                                    const currentList: string[] = customFormValues[f.label] || [];
                                    const checked = currentList.includes(opt);
                                    return (
                                      <label key={opt} className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-secondary cursor-pointer transition text-xs text-foreground">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => {
                                            const nextList = checked
                                              ? currentList.filter((x) => x !== opt)
                                              : [...currentList, opt];
                                            setCustomFormValues((prev) => ({ ...prev, [f.label]: nextList }));
                                          }}
                                          className="accent-primary h-4 w-4"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <select
                              required={f.required}
                              value={customFormValues[f.label] || ""}
                              onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.value }))}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            >
                              <option value="">Select option</option>
                              {f.options.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )
                        ) : f.type === "checkbox" ? (
                          f.checkboxMode === "multiple" ? (
                            <div className="space-y-2 border border-border bg-background rounded-xl p-3">
                              {f.options.map((opt: string) => {
                                const currentList: string[] = customFormValues[f.label] || [];
                                const checked = currentList.includes(opt);
                                return (
                                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        const nextList = checked
                                          ? currentList.filter((x) => x !== opt)
                                          : [...currentList, opt];
                                        setCustomFormValues((prev) => ({ ...prev, [f.label]: nextList }));
                                      }}
                                      className="accent-primary h-4 w-4"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 cursor-pointer text-xs py-1">
                              <input
                                type="checkbox"
                                checked={!!customFormValues[f.label]}
                                onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.checked }))}
                                className="accent-primary h-4 w-4"
                              />
                              <span>{f.placeholder || f.label}</span>
                            </label>
                          )
                        ) : f.type === "time" ? (
                          <TimePickerInput
                            required={f.required}
                            value={customFormValues[f.label] || ""}
                            onChange={(val) => setCustomFormValues((prev) => ({ ...prev, [f.label]: val }))}
                          />
                        ) : (
                          <input
                            type={f.type === "phone" ? "tel" : f.type === "number" ? "number" : f.type}
                            required={f.required}
                            placeholder={f.placeholder}
                            value={customFormValues[f.label] || ""}
                            onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.value }))}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="bookingName"
                          className="block text-xs font-bold text-foreground/80 mb-1.5"
                        >
                          Contact Name*
                        </label>
                        <input
                          id="bookingName"
                          type="text"
                          required
                          value={bookingForm.name}
                          onChange={(e) =>
                            dispatchBooking({ type: "UPDATE_FORM", fields: { name: e.target.value } })
                          }
                          placeholder="Enter booking name"
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
                          value={bookingForm.phone}
                          onChange={(e) =>
                            dispatchBooking({ type: "UPDATE_FORM", fields: { phone: e.target.value } })
                          }
                          placeholder="Enter mobile number"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="bookingDate"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            {currentBiz.category.includes("Hotel Point")
                              ? "Check-in Date*"
                              : currentBiz.category.includes("Health Care Point") ||
                                  currentBiz.category.includes("Doctor Point")
                                ? "Appointment Date*"
                                : "Preferred Date*"}
                          </label>
                          <input
                            id="bookingDate"
                            type="date"
                            required
                            value={bookingForm.date}
                            onChange={(e) =>
                              dispatchBooking({ type: "UPDATE_FORM", fields: { date: e.target.value } })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="bookingGuests"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            {currentBiz.category.includes("Hotel Point")
                              ? "Room Standard Preferred*"
                              : currentBiz.category.includes("Health Care Point") ||
                                  currentBiz.category.includes("Doctor Point")
                                ? "Patient Age*"
                                : "No. of Guests*"}
                          </label>
                          {currentBiz.category.includes("Hotel Point") ? (
                            <select
                              id="bookingGuests"
                              value={bookingForm.guests}
                              onChange={(e) =>
                                dispatchBooking({
                                  type: "UPDATE_FORM",
                                  fields: { guests: e.target.value },
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent animate-none"
                            >
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
                          ) : currentBiz.category.includes("Health Care Point") ||
                            currentBiz.category.includes("Doctor Point") ? (
                            <input
                              id="bookingGuests"
                              type="number"
                              required
                              min="1"
                              placeholder="e.g. 28"
                              value={bookingForm.guests}
                              onChange={(e) =>
                                dispatchBooking({
                                  type: "UPDATE_FORM",
                                  fields: { guests: e.target.value },
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          ) : (
                            <select
                              id="bookingGuests"
                              value={bookingForm.guests}
                              onChange={(e) =>
                                dispatchBooking({
                                  type: "UPDATE_FORM",
                                  fields: { guests: e.target.value },
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent animate-none"
                            >
                              <option value="1">1 Person</option>
                              <option value="2">2 Persons</option>
                              <option value="4">4 Persons</option>
                              <option value="6">6 Persons</option>
                              <option value="8">8 Persons</option>
                              <option value="10+">10+ Persons</option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="bookingTime"
                          className="block text-xs font-bold text-foreground/80 mb-1.5"
                        >
                          {currentBiz.category.includes("Hotel Point")
                            ? "Stay Check-out Date*"
                            : currentBiz.category.includes("Health Care Point") ||
                                currentBiz.category.includes("Doctor Point")
                              ? "Appointment Slot*"
                              : "Time Slot*"}
                        </label>
                        {currentBiz.category.includes("Hotel Point") ? (
                          <input
                            id="bookingTime"
                            type="date"
                            required
                            value={bookingForm.time}
                            onChange={(e) =>
                              dispatchBooking({ type: "UPDATE_FORM", fields: { time: e.target.value } })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        ) : currentBiz.category.includes("Health Care Point") ||
                          currentBiz.category.includes("Doctor Point") ? (
                          <select
                            id="bookingTime"
                            value={bookingForm.time}
                            onChange={(e) =>
                              dispatchBooking({ type: "UPDATE_FORM", fields: { time: e.target.value } })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          >
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
                        ) : (
                          <select
                            id="bookingTime"
                            value={bookingForm.time}
                            onChange={(e) =>
                              dispatchBooking({ type: "UPDATE_FORM", fields: { time: e.target.value } })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          >
                            <option value="Lunch (12:00 PM - 03:00 PM)">
                              Lunch (12:00 PM - 03:00 PM)
                            </option>
                            <option value="High Tea (04:00 PM - 06:00 PM)">
                              High Tea (04:00 PM - 06:00 PM)
                            </option>
                            <option value="Dinner (07:00 PM - 11:00 PM)">
                              Dinner (07:00 PM - 11:00 PM)
                            </option>
                          </select>
                        )}
                      </div>
                    </>
                  )}
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
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Secure Payment Gateway
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Transactions are encrypted securely
                    </p>
                  </div>
                </div>

                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3.5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Booking Deposit Amount
                    </span>
                    <span className="text-[11px] font-semibold text-foreground/80 mt-0.5">
                      {currentBiz.name}
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
                          onClick={() =>
                            dispatchPayment({ type: "SET_METHOD", method: "netbanking" })
                          }
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "netbanking" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Net Banking
                        </button>
                      </div>
                    </div>

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
                              dispatchPayment({
                                type: "SET_FIELD",
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
                              dispatchPayment({
                                type: "SET_FIELD",
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
                                dispatchPayment({
                                  type: "SET_FIELD",
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
                                dispatchPayment({
                                  type: "SET_FIELD",
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
                            htmlFor="bookingBank"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            Select Bank
                          </label>
                          <select
                            id="bookingBank"
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
                        handleRazorpayPayment(amount, async (paymentId) => {
                          dispatchBooking({ type: "SET_STEP", step: "success" });
                          dispatchBooking({ type: "SET_SUBMITTED", value: true });
                          setCart({}); // Empty the cart on successful checkout

                          // Prepare data
                          let dataToSave: Record<string, any> = {};
                          if (customFormConfig) {
                            dataToSave = { ...customFormValues };
                          } else {
                            dataToSave = {
                              "Full Name": bookingForm.name,
                              "Phone Number": bookingForm.phone,
                              "Date": bookingForm.date,
                              "Guests/Room/Age": bookingForm.guests,
                              "Time/Check-out/Slot": bookingForm.time,
                            };
                          }

                          // Always inject logged-in customer details from backend
                          try {
                            const profRes = await fetch("http://localhost:5000/api/auth/profile", { headers: getAuthHeaders() });
                            const profData = await profRes.json();
                            if (profData.success && profData.user) {
                              const prof = profData.user;
                              const fullName = [prof.firstName, prof.lastName].filter(Boolean).join(" ");
                              if (!dataToSave["Full Name"] && !dataToSave["Customer Name"] && !dataToSave["Your Name"] && !dataToSave["Name"] && fullName) dataToSave["Full Name"] = fullName;
                              if (!dataToSave["Phone Number"] && !dataToSave["Phone"] && !dataToSave["Mobile"] && !dataToSave["Mobile Number"] && prof.mobile1) dataToSave["Phone Number"] = prof.mobile1;
                              if (!dataToSave["Email"] && !dataToSave["Email Address"] && prof.email) dataToSave["Email"] = prof.email;
                            }
                          } catch (_) {}

                          const bookingId = `BK${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
                          setConfirmedOrderId(bookingId);

                          const newSub = {
                            id: bookingId,
                            timestamp: formatDateTimeDMY(new Date()),
                            data: dataToSave
                          };

                          // API Submission
                          fetch(`http://localhost:5000/api/service-forms/${currentBiz.id}/submissions`, {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                              id: bookingId,
                              businessName: currentBiz.name,
                              data: dataToSave
                            })
                          }).then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                window.dispatchEvent(new Event("storage"));
                              }
                            }).catch(err => console.error("API submission failed:", err));

                          const customerNameVal = dataToSave["Full Name"] || customFormValues["Full Name"] || customFormValues["Your Name"] || bookingForm.name || username || "Guest";
                          const details = currentBiz.category.includes("Hotel Point")
                            ? "Room Stay Reservation Deposit"
                            : currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")
                              ? "Appointment Consultation Fee"
                              : "Table Booking Deposit";

                          // API Transaction Log POST call
                          fetch("http://localhost:5000/api/transactions", {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                              description: details,
                              businessName: currentBiz.name,
                              businessId: currentBiz.id,
                              bookingId: bookingId,
                              customerName: customerNameVal,
                              details,
                              amount,
                              type: "credit",
                              paymentMethod: "Razorpay Gateway",
                              status: "Completed"
                            })
                          }).then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                  window.dispatchEvent(new Event("storage"));
                              }
                            }).catch(err => console.error("API transaction failed:", err));

                          // Persist to the Booking DB model (shows in customer's My Bookings)
                          saveBookingToDb({
                            id: bookingId,
                            amount,
                            paymentId,
                            bookingType: currentBiz.category.includes("Hotel Point")
                              ? "room"
                              : currentBiz.category.includes("Health Care Point") || currentBiz.category.includes("Doctor Point")
                                ? "appointment"
                                : "service",
                            serviceName: customFormConfig?.formTitle || details,
                            formData: dataToSave,
                            customerName: customerNameVal,
                            customerPhone: dataToSave["Phone Number"] || customFormValues["Phone Number"] || customFormValues["Phone"] || customFormValues["Mobile"] || customFormValues["Mobile Number"] || bookingForm.phone || "",
                            customerEmail: dataToSave["Email"] || customFormValues["Email"] || customFormValues["Email Address"] || "",
                            date: customFormValues["Date"] || bookingForm.date || "",
                            time: bookingForm.time || customFormValues["Time/Check-out/Slot"] || customFormValues["Time"] || "",
                          });
                        });
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
                    : currentBiz.category.includes("Health Care Point") ||
                        currentBiz.category.includes("Doctor Point")
                      ? "Appointment Confirmed!"
                      : "Table Reserved!"}
                </h3>
                <div className="text-xs text-muted-foreground max-w-xs mx-auto space-y-2 text-center">
                  {currentBiz.category.includes("Hotel Point") ? (
                    <p>
                      Your room stay reservation at{" "}
                      <span className="font-semibold text-primary">{currentBiz.name}</span> (
                      {bookingForm.guests}) for check-in on {bookingForm.date} is confirmed!
                    </p>
                  ) : currentBiz.category.includes("Health Care Point") ||
                    currentBiz.category.includes("Doctor Point") ? (
                    <p>
                      Your consultation appointment at{" "}
                      <span className="font-semibold text-primary">{currentBiz.name}</span> on{" "}
                      {bookingForm.date} has been scheduled!
                    </p>
                  ) : (
                    <p>
                      Your table reservation at{" "}
                      <span className="font-semibold text-primary">{currentBiz.name}</span> for{" "}
                      {bookingForm.guests} guests on {bookingForm.date} is confirmed!
                    </p>
                  )}
                  {confirmedOrderId && (
                    <p className="mt-2 text-xs">
                      Booking ID: <span className="font-bold text-foreground">#{confirmedOrderId}</span>
                    </p>
                  )}
                </div>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const customerName = customFormValues["Full Name"] || customFormValues["Your Name"] || customFormValues["Name"] || checkoutForm.name || "Guest";
                  const customerPhone = customFormValues["Phone Number"] || customFormValues["Phone"] || customFormValues["Mobile"] || customFormValues["Mobile Number"] || checkoutForm.phone || "";
                  const customerAddress = customFormValues["Delivery Address"] || customFormValues["Address"] || customFormValues["Location"] || checkoutForm.address || "";
                  const customerNotes = customFormValues["Notes"] || customFormValues["Requirements"] || customFormValues["Cooking Notes"] || checkoutForm.notes || "";

                  if (customFormConfig) {
                    let valid = true;
                    customFormConfig.fields.forEach((f: any) => {
                      if (f.required) {
                        const val = customFormValues[f.label];
                        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0) || val === false) {
                          valid = false;
                        }
                      }
                    });
                    if (!valid) {
                      alert("Please fill in all required fields.");
                      return;
                    }
                  } else {
                    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
                      alert("Please fill in your Name, Phone Number, and Delivery Address.");
                      return;
                    }
                  }

                  const amount = totalCartPrice;
                  handleRazorpayPayment(amount, async (paymentId) => {
                    const tempId = `FMP-${Math.floor(1000 + Math.random() * 9000)}`;
                    setConfirmedOrderId(tempId);
                    dispatchCheckout({ type: "SET_STEP", step: "success" });
                    dispatchCheckout({ type: "SET_SUBMITTED", value: true });

                    const itemNames = Object.entries(cart).map(([name, qty]) => `${name} (x${qty})`).join(", ");
                    const details = itemNames || "Product Order Checkout";

                    const dataToSave: Record<string, any> = customFormConfig
                      ? {
                          ...customFormValues,
                          "Order Items": itemNames || "No items",
                          "Total Amount": `₹${amount}`,
                        }
                      : {
                          "Full Name": customerName,
                          "Phone Number": customerPhone,
                          "Address": customerAddress,
                          "Order Items": itemNames || "No items",
                          "Total Amount": `₹${amount}`,
                          "Notes/Requirements": customerNotes || "None"
                        };

                    // Always inject logged-in customer details from backend
                    let finalCustomerName = customerName;
                    let finalCustomerPhone = customerPhone;
                    let finalCustomerAddress = customerAddress;
                    let finalCustomerEmail = "";

                    try {
                      const profRes = await fetch("http://localhost:5000/api/auth/profile", { headers: getAuthHeaders() });
                      const profData = await profRes.json();
                      if (profData.success && profData.user) {
                        const prof = profData.user;
                        const fullName = [prof.firstName, prof.lastName].filter(Boolean).join(" ");
                        if (fullName) {
                          finalCustomerName = fullName;
                        }
                        if (prof.mobile1) {
                          finalCustomerPhone = prof.mobile1;
                        }
                        if (prof.email) {
                          finalCustomerEmail = prof.email;
                        }
                        if (!dataToSave["Full Name"] && !dataToSave["Customer Name"] && !dataToSave["Your Name"] && !dataToSave["Name"] && fullName) dataToSave["Full Name"] = fullName;
                        if (!dataToSave["Phone Number"] && !dataToSave["Phone"] && !dataToSave["Mobile"] && !dataToSave["Mobile Number"] && prof.mobile1) dataToSave["Phone Number"] = prof.mobile1;
                        if (!dataToSave["Email"] && !dataToSave["Email Address"] && prof.email) dataToSave["Email"] = prof.email;
                      }
                    } catch (_) {}

                    const formattedOrderItems = Object.entries(cart).map(([name, qty]) => ({ name, quantity: qty }));
                    fetch(`http://localhost:5000/api/product-orders/${currentBiz.id}`, {
                      method: "POST",
                      headers: getAuthHeaders(),
                      body: JSON.stringify({
                        businessName: currentBiz.name,
                        customerName: finalCustomerName,
                        customerPhone: finalCustomerPhone,
                        customerAddress: finalCustomerAddress,
                        orderItems: formattedOrderItems,
                        totalAmount: amount,
                        notes: customerNotes
                      })
                    }).then(res => res.json())
                      .then(data => {
                        if (data.success && data.data) {
                          const orderId = data.data.id;
                          setConfirmedOrderId(orderId);
                          window.dispatchEvent(new Event("storage"));

                          // Also persist the full dynamic form payload so the client
                          // dashboard can display every field the business's custom
                          // form collected (previously this only ever hit localStorage).
                          fetch(`http://localhost:5000/api/service-forms/${currentBiz.id}/submissions`, {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                              id: orderId,
                              businessName: currentBiz.name,
                              data: dataToSave
                            })
                          }).then(res => res.json())
                            .then(subData => {
                              if (subData.success) {
                                window.dispatchEvent(new Event("storage"));
                              }
                            }).catch(err => console.error("API submission failed:", err));

                          // API Transaction Log POST call
                          fetch("http://localhost:5000/api/transactions", {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                              description: details,
                              businessName: currentBiz.name,
                              businessId: currentBiz.id,
                              bookingId: orderId,
                              customerName: finalCustomerName,
                              details,
                              amount,
                              type: "credit",
                              paymentMethod: "Razorpay Gateway",
                              status: "Completed"
                            })
                          }).then(res => res.json())
                            .then(txData => {
                              if (txData.success) {
                                window.dispatchEvent(new Event("storage"));
                              }
                            }).catch(err => console.error("API transaction failed:", err));

                          // Persist to the Booking DB model (shows in customer's My Bookings)
                          saveBookingToDb({
                            id: orderId,
                            amount,
                            paymentId,
                            bookingType: "product",
                            serviceName: itemNames || "Product Order",
                            formData: dataToSave,
                            items: Object.entries(cart).map(([name, qty]) => {
                              const item = (currentBiz.products || []).find((p) => p.name === name);
                              const price = item ? parseInt(item.price.replace(/[^0-9]/g, "")) || 0 : 0;
                              return { name, quantity: qty, price };
                            }),
                            customerName: finalCustomerName,
                            customerPhone: finalCustomerPhone,
                            customerEmail: finalCustomerEmail,
                            customerAddress: finalCustomerAddress,
                            date: new Date().toISOString().split("T")[0],
                          });
                        }
                      }).catch(err => console.error("API product order failed:", err));

                    setCart({});
                  });
                }}
              >
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  Checkout & Place Order
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Completing order with{" "}
                  <span className="font-bold text-primary">{currentBiz.name}</span>
                </p>

                {/* Items summary */}
                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3 mb-4 space-y-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                    Order Details
                  </span>
                  {Object.entries(cart).map(([name, qty]) => {
                    const item = currentBiz.products.find((p) => p.name === name);
                    if (!item) return null;
                    const priceNum = parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
                    return (
                      <div
                        key={name}
                        className="flex justify-between items-center text-xs text-foreground/90 font-medium"
                      >
                        <span>
                          {name} <span className="text-muted-foreground font-semibold">x{qty}</span>
                        </span>
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
                  {customFormConfig ? (
                    customFormConfig.fields.map((f: any) => (
                      <div key={f.id} className="text-left">
                        <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                          {f.label} {f.required && <span className="text-rose-500">*</span>}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            required={f.required}
                            placeholder={f.placeholder}
                            value={customFormValues[f.label] || ""}
                            onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.value }))}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
                          />
                        ) : f.type === "select" ? (
                          f.selectMode === "multiple" ? (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenCustomDropdowns((prev) => ({ ...prev, [f.label]: !prev[f.label] }))}
                                className="w-full bg-background text-xs px-3.5 py-2.5 rounded-xl border border-border outline-none flex items-center justify-between text-foreground cursor-pointer"
                              >
                                <span className="truncate">
                                  {(!customFormValues[f.label] || customFormValues[f.label].length === 0)
                                    ? f.placeholder || "Select options..."
                                    : customFormValues[f.label].join(", ")}
                                </span>
                                {openCustomDropdowns[f.label] ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                              </button>
                              {openCustomDropdowns[f.label] && (
                                <div className="absolute z-55 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto p-2 space-y-1">
                                  {f.options.map((opt: string) => {
                                    const currentList: string[] = customFormValues[f.label] || [];
                                    const checked = currentList.includes(opt);
                                    return (
                                      <label key={opt} className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-secondary cursor-pointer transition text-xs text-foreground">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => {
                                            const nextList = checked
                                              ? currentList.filter((x) => x !== opt)
                                              : [...currentList, opt];
                                            setCustomFormValues((prev) => ({ ...prev, [f.label]: nextList }));
                                          }}
                                          className="accent-primary h-4 w-4"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <select
                              required={f.required}
                              value={customFormValues[f.label] || ""}
                              onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.value }))}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            >
                              <option value="">Select option</option>
                              {f.options.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )
                        ) : f.type === "checkbox" ? (
                          f.checkboxMode === "multiple" ? (
                            <div className="space-y-2 border border-border bg-background rounded-xl p-3">
                              {f.options.map((opt: string) => {
                                const currentList: string[] = customFormValues[f.label] || [];
                                const checked = currentList.includes(opt);
                                return (
                                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        const nextList = checked
                                          ? currentList.filter((x) => x !== opt)
                                          : [...currentList, opt];
                                        setCustomFormValues((prev) => ({ ...prev, [f.label]: nextList }));
                                      }}
                                      className="accent-primary h-4 w-4"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <label className="flex items-center gap-2 cursor-pointer text-xs py-1">
                              <input
                                type="checkbox"
                                checked={!!customFormValues[f.label]}
                                onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.checked }))}
                                className="accent-primary h-4 w-4"
                              />
                              <span>{f.placeholder || f.label}</span>
                            </label>
                          )
                        ) : f.type === "time" ? (
                          <TimePickerInput
                            required={f.required}
                            value={customFormValues[f.label] || ""}
                            onChange={(val) => setCustomFormValues((prev) => ({ ...prev, [f.label]: val }))}
                          />
                        ) : (
                          <input
                            type={f.type === "phone" ? "tel" : f.type === "number" ? "number" : f.type}
                            required={f.required}
                            placeholder={f.placeholder}
                            value={customFormValues[f.label] || ""}
                            onChange={(e) => setCustomFormValues((prev) => ({ ...prev, [f.label]: e.target.value }))}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="checkoutName"
                          className="block text-xs font-bold text-foreground/80 mb-1.5"
                        >
                          Your Name*
                        </label>
                        <input
                          id="checkoutName"
                          type="text"
                          required
                          value={checkoutForm.name}
                          onChange={(e) =>
                            dispatchCheckout({ type: "UPDATE_FORM", fields: { name: e.target.value } })
                          }
                          placeholder="Enter customer name"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="checkoutPhone"
                          className="block text-xs font-bold text-foreground/80 mb-1.5"
                        >
                          Phone Number*
                        </label>
                        <input
                          id="checkoutPhone"
                          type="tel"
                          required
                          value={checkoutForm.phone}
                          onChange={(e) =>
                            dispatchCheckout({ type: "UPDATE_FORM", fields: { phone: e.target.value } })
                          }
                          placeholder="Enter mobile number"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="checkoutAddress"
                          className="block text-xs font-bold text-foreground/80 mb-1.5"
                        >
                          Delivery Address*
                        </label>
                        <textarea
                          id="checkoutAddress"
                          required
                          rows={2}
                          value={checkoutForm.address}
                          onChange={(e) =>
                            dispatchCheckout({
                              type: "UPDATE_FORM",
                              fields: { address: e.target.value },
                            })
                          }
                          placeholder="Provide complete home/office address..."
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="checkoutNotes"
                          className="block text-xs font-bold text-foreground/80 mb-1.5"
                        >
                          Cooking Notes (Optional)
                        </label>
                        <input
                          id="checkoutNotes"
                          type="text"
                          value={checkoutForm.notes}
                          onChange={(e) =>
                            dispatchCheckout({ type: "UPDATE_FORM", fields: { notes: e.target.value } })
                          }
                          placeholder="e.g. Make it extra spicy, no onions..."
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                        />
                      </div>
                    </>
                  )}
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
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Secure Payment Gateway
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Transactions are encrypted securely
                    </p>
                  </div>
                </div>

                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3.5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Order Amount
                    </span>
                    <span className="text-[11px] font-semibold text-foreground/80 mt-0.5">
                      {currentBiz.name}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-foreground">₹{totalCartPrice}</span>
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
                          onClick={() =>
                            dispatchPayment({ type: "SET_METHOD", method: "netbanking" })
                          }
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "netbanking" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Net Banking
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "upi" && (
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor="checkoutUpiId"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            Enter UPI ID
                          </label>
                          <input
                            id="checkoutUpiId"
                            type="text"
                            placeholder="username@okaxis, user@upi..."
                            required
                            value={upiId}
                            onChange={(e) =>
                              dispatchPayment({
                                type: "SET_FIELD",
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
                            htmlFor="checkoutCardNumber"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            Card Number
                          </label>
                          <input
                            id="checkoutCardNumber"
                            type="text"
                            maxLength={19}
                            placeholder="4111 2222 3333 4444"
                            required
                            value={cardNumber}
                            onChange={(e) =>
                              dispatchPayment({
                                type: "SET_FIELD",
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
                              htmlFor="checkoutCardExpiry"
                              className="block text-xs font-bold text-foreground/80 mb-1.5"
                            >
                              Expiry Date
                            </label>
                            <input
                              id="checkoutCardExpiry"
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              required
                              value={cardExpiry}
                              onChange={(e) =>
                                dispatchPayment({
                                  type: "SET_FIELD",
                                  field: "cardExpiry",
                                  value: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="checkoutCardCvv"
                              className="block text-xs font-bold text-foreground/80 mb-1.5"
                            >
                              CVV Code
                            </label>
                            <input
                              id="checkoutCardCvv"
                              type="password"
                              maxLength={3}
                              placeholder="***"
                              required
                              value={cardCvv}
                              onChange={(e) =>
                                dispatchPayment({
                                  type: "SET_FIELD",
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
                            htmlFor="checkoutBank"
                            className="block text-xs font-bold text-foreground/80 mb-1.5"
                          >
                            Select Bank
                          </label>
                          <select
                            id="checkoutBank"
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
                        const amount = totalCartPrice;
                        handleRazorpayPayment(amount, async (paymentId) => {
                          const tempId = `FMP-${Math.floor(1000 + Math.random() * 9000)}`;
                          setConfirmedOrderId(tempId);
                          dispatchCheckout({ type: "SET_STEP", step: "success" });
                          dispatchCheckout({ type: "SET_SUBMITTED", value: true });

                          const customerName = customFormValues["Full Name"] || customFormValues["Your Name"] || customFormValues["Name"] || checkoutForm.name || "Guest";
                          const customerPhone = customFormValues["Phone Number"] || customFormValues["Phone"] || customFormValues["Mobile"] || customFormValues["Mobile Number"] || checkoutForm.phone || "";
                          const customerAddress = customFormValues["Delivery Address"] || customFormValues["Address"] || customFormValues["Location"] || checkoutForm.address || "";
                          const customerNotes = customFormValues["Notes"] || customFormValues["Requirements"] || customFormValues["Cooking Notes"] || checkoutForm.notes || "";
                          const itemNames = Object.entries(cart).map(([name, qty]) => `${name} (x${qty})`).join(", ");
                          const details = itemNames || "Product Order Checkout";

                          // Prepare data for booking/order record
                          const dataToSave: Record<string, any> = customFormConfig
                            ? {
                                ...customFormValues,
                                "Order Items": itemNames || "No items",
                                "Total Amount": `₹${amount}`,
                              }
                            : {
                                "Full Name": customerName,
                                "Phone Number": customerPhone,
                                "Address": customerAddress,
                                "Order Items": itemNames || "No items",
                                "Total Amount": `₹${amount}`,
                                "Notes/Requirements": customerNotes || "None"
                              };

                          // Always inject logged-in customer details from backend
                          let finalCustomerName = customerName;
                          let finalCustomerPhone = customerPhone;
                          let finalCustomerAddress = customerAddress;
                          let finalCustomerEmail = "";

                          try {
                            const profRes = await fetch("http://localhost:5000/api/auth/profile", { headers: getAuthHeaders() });
                            const profData = await profRes.json();
                            if (profData.success && profData.user) {
                              const prof = profData.user;
                              const fullName = [prof.firstName, prof.lastName].filter(Boolean).join(" ");
                              if (fullName) {
                                finalCustomerName = fullName;
                              }
                              if (prof.mobile1) {
                                finalCustomerPhone = prof.mobile1;
                              }
                              if (prof.email) {
                                finalCustomerEmail = prof.email;
                              }
                              if (!dataToSave["Full Name"] && !dataToSave["Customer Name"] && !dataToSave["Your Name"] && !dataToSave["Name"] && fullName) dataToSave["Full Name"] = fullName;
                              if (!dataToSave["Phone Number"] && !dataToSave["Phone"] && !dataToSave["Mobile"] && !dataToSave["Mobile Number"] && prof.mobile1) dataToSave["Phone Number"] = prof.mobile1;
                              if (!dataToSave["Email"] && !dataToSave["Email Address"] && prof.email) dataToSave["Email"] = prof.email;
                            }
                          } catch (_) {}

                          // API Product Order POST call
                          const formattedOrderItems = Object.entries(cart).map(([name, qty]) => ({ name, quantity: qty }));
                          fetch(`http://localhost:5000/api/product-orders/${currentBiz.id}`, {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                              businessName: currentBiz.name,
                              customerName: finalCustomerName,
                              customerPhone: finalCustomerPhone,
                              customerAddress: finalCustomerAddress,
                              orderItems: formattedOrderItems,
                              totalAmount: amount,
                              notes: customerNotes
                            })
                          }).then(res => res.json())
                            .then(data => {
                              if (data.success && data.data) {
                                const orderId = data.data.id;
                                setConfirmedOrderId(orderId);
                                window.dispatchEvent(new Event("storage"));

                                // Also persist the submission with the correct order ID
                                fetch(`http://localhost:5000/api/service-forms/${currentBiz.id}/submissions`, {
                                  method: "POST",
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({
                                    id: orderId,
                                    businessName: currentBiz.name,
                                    data: dataToSave
                                  })
                                }).then(res => res.json())
                                  .then(subData => {
                                    if (subData.success) {
                                      window.dispatchEvent(new Event("storage"));
                                    }
                                  }).catch(err => console.error("API submission failed:", err));

                                // API Transaction Log POST call
                                fetch("http://localhost:5000/api/transactions", {
                                  method: "POST",
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({
                                    description: details,
                                    businessName: currentBiz.name,
                                    businessId: currentBiz.id,
                                    bookingId: orderId,
                                    customerName: finalCustomerName,
                                    details,
                                    amount,
                                    type: "credit",
                                    paymentMethod: "Razorpay Gateway",
                                    status: "Completed"
                                  })
                                }).then(res => res.json())
                                  .then(txData => {
                                    if (txData.success) {
                                      window.dispatchEvent(new Event("storage"));
                                    }
                                  }).catch(err => console.error("API transaction failed:", err));

                                // Persist to the Booking DB model (shows in My Bookings)
                                saveBookingToDb({
                                  id: orderId,
                                  amount,
                                  paymentId,
                                  bookingType: "product",
                                  serviceName: itemNames || "Product Order",
                                  formData: dataToSave,
                                  items: Object.entries(cart).map(([name, qty]) => {
                                    const item = (currentBiz.products || []).find((p) => p.name === name);
                                    const price = item ? parseInt(item.price.replace(/[^0-9]/g, "")) || 0 : 0;
                                    return { name, quantity: qty, price };
                                  }),
                                  customerName: finalCustomerName,
                                  customerPhone: finalCustomerPhone,
                                  customerEmail: finalCustomerEmail,
                                  customerAddress: finalCustomerAddress,
                                  date: new Date().toISOString().split("T")[0],
                                });
                              }
                            }).catch(err => console.error("API product order failed:", err));

                          setCart({});
                        });
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
                   Your order has been placed with{" "}
                   <span className="font-semibold text-primary">{currentBiz.name}</span>. Order ID:{" "}
                   <span className="font-bold text-foreground">
                     #{confirmedOrderId || "FMP-7689"}
                   </span>
                   . You will receive an SMS confirmation shortly.
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
              <span className="text-xs font-semibold opacity-90">
                {totalCartItems} Item{totalCartItems > 1 ? "s" : ""} Selected
              </span>
              <span className="text-lg font-black leading-tight">Total: ₹{totalCartPrice}</span>
            </div>
            <button
              onClick={() => {
                if (!username) {
                  alert("Please sign in to place an order. You need an account to book/order.");
                  onSignInClick?.();
                  return;
                }
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
      {/* Enquiry Modal Popup */}
      {enquiryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setUiState((prev) => ({ ...prev, enquiryModalOpen: false, enquirySubmitted: false }))}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setUiState((prev) => ({ ...prev, enquiryModalOpen: false, enquirySubmitted: false }))}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-5">
              <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Send Enquiry</h4>
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>

            {enquirySubmitted ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h5 className="text-sm font-black text-foreground mt-2">Enquiry Sent Successfully!</h5>
                <p className="text-xs text-muted-foreground/80 font-semibold max-w-[220px] leading-relaxed mt-1">
                  The business representative will get back to you on your provided contact details.
                </p>
                <button
                  onClick={() => setUiState((prev) => ({ ...prev, enquiryModalOpen: false, enquirySubmitted: false }))}
                  className="mt-2 text-xs font-bold text-primary underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { handleEnquirySubmit(e); }} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label htmlFor="modalEnquiryName" className="text-[10px] font-bold text-muted-foreground uppercase">Your Name</label>
                  <input
                    id="modalEnquiryName"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label htmlFor="modalEnquiryMobile" className="text-[10px] font-bold text-muted-foreground uppercase">Mobile Number</label>
                  <input
                    id="modalEnquiryMobile"
                    type="tel"
                    placeholder="10-digit number"
                    value={enquiryForm.mobile}
                    onChange={(e) => setEnquiryForm((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label htmlFor="modalEnquiryEmail" className="text-[10px] font-bold text-muted-foreground uppercase">Email Address (Optional)</label>
                  <input
                    id="modalEnquiryEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label htmlFor="modalEnquiryMessage" className="text-[10px] font-bold text-muted-foreground uppercase">Message</label>
                  <textarea
                    id="modalEnquiryMessage"
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm((prev) => ({ ...prev, message: e.target.value }))}
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
        </div>
      )}

    </div>
  );
}
