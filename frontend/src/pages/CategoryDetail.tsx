import { useState, useEffect, useReducer, useMemo } from "react";
import {
  ArrowLeft, Search, MapPin, Star, Phone, MessageSquare,
  BadgeCheck, ChevronRight, Clock, User, X, Check, ShieldCheck
} from "lucide-react";
import logoImg from "@/assets/logo.jpeg";
import { getBusinessesForSubcategory, BusinessListingData } from "../data/businessesData";
import Footer from "./Footer";

// Master list of subcategories provided by the client + standard fallbacks
export const subcategoriesData: Record<string, string[]> = {
  "Spa Point": ["Ayurvedic Spa", "Massage Center", "Beauty Spa", "Thai Massage", "Luxury Spa", "Unisex Salon", "Beauty Parlours", "Spa & Massages", "Salons"],
  "Tour Point": [
    "India", "Nepal", "Sri Lanka", "Bangladesh", "Indonesia", "Dubai", "UK", "USA", "Australia", 
    "Japan", "China", "Russia", "Maldives", "Bhutan", "Myanmar", "Thailand", "France", "Germany", 
    "Saudi Arabia", "South Africa", "Switzerland"
  ],
  "Job Point": [
    "Accounting", "Bank", "BPO", "ETC", "FRESHER", "Government", "Health Care", "HR", "IIM", "IIT", 
    "Industrial", "IT", "International", "Judicial", "Manufacturing Unit", "Marketing", "Official", 
    "Petrol Pump", "Sales", "Security", "Teacher", "Worker", "Home Care", "Delivery"
  ],
  "Service Point": [
    "AC Repair", "Builder", "Care Taker", "Carpenter", "CCTV Repair & Installation", "Contractor", 
    "Cook", "Driver", "Dry Cleaners", "Electrical & Electronic", "Home Teacher", "House Cleaner", 
    "Home interior & Decoration", "Labour", "Maid", "Marble & Tiles Repair", "Microwave Oven Repair", 
    "Mobile & Computer Repair", "Paint Man & Repair", "Plaster & Ceiling Repair", "Plumber Repair", 
    "Refrigerator Repair", "TV Repair", "Washing Machine Repair", "Water tank Repair", "AC Service", "Car Service", "Bike Service", "Electricians"
  ],
  "Education Point": [
    "Coaching Center", "College", "Computer Center", "Diploma College", "Engineering College", 
    "ITI", "Institute Center", "Medical College", "Nursing & Pathology Institute", "Play School", 
    "School", "University"
  ],
  "Health Care Point": [
    "Animal Care", "CHC & PHC", "Clinic", "Doctors", "Hospital", "Medicine Store", "Nursing Home", 
    "Pathology", "Pharmacy"
  ],
  "Hotel Point": ["5 Star Hotels", "Budget Hotels", "Resorts", "Guest House", "Lodging", "Homestays", "Banquet Halls"],
  "Doctor Point": ["Cardiologist", "Dentist", "Dermatologist", "Gynecologist", "Pediatrician", "General Physician", "Orthopedic"],
  "Garments Point": ["Men's Wear", "Women's Wear", "Kids Wear", "Boutique", "Ethnic Wear", "Bridal Wear", "Bridal Requisite"],
  "Astrologer Point": ["Vedic Astrologer", "Palm Reader", "Numerologist", "Tarot Card Reader", "Vastu Consultant", "Horoscope Expert"],
  "Product Point": ["Electronics", "Mobile Phones", "Furniture", "Home Appliances", "Computers & Laptops", "Clothing & Apparel", "Movies", "Grocery"],
  "Food Point": ["Restaurants", "Cafes", "Sweet Shops", "Fast Food", "Bakeries", "Cloud Kitchens", "Caterers"],
  "Courier Point": ["Domestic Courier", "International Courier", "Cargo Services", "Express Delivery", "Local Parcel Service"],
  "Car Rental Point": ["Self-Drive Cars", "Chauffeur-Driven Cars", "Luxury Car Rental", "Airport Cab Service", "SUV Rental", "Wedding Car Rental"],
};

interface CategoryDetailPageProps {
  categoryName: string;
  initialSubcategory?: string | null;
  onBack: () => void;
  onBusinessSelect: (id: string) => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  username?: string | null;
}

// Types and Reducers for Booking Flow
interface BookingState {
  modalOpen: boolean;
  selectedBiz: BusinessListingData | null;
  submitted: boolean;
  step: "form" | "payment" | "success";
  form: Record<string, string>;
  paymentMethod: "upi" | "card" | "netbanking";
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
  | { type: "SET_PAYMENT_METHOD"; method: "upi" | "card" | "netbanking" }
  | { type: "SET_PAYMENT_FIELD"; field: "upiId" | "cardNumber" | "cardExpiry" | "cardCvv"; value: string }
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
  onSignInClick,
  onProfileClick,
  username
}: CategoryDetailPageProps) {
  // Get all subcategories for this category, fallback to empty array
  const subcategories = subcategoriesData[categoryName] || ["General Services"];
  
  const [prevCategory, setPrevCategory] = useState(categoryName);
  const [prevInitialSubcat, setPrevInitialSubcat] = useState(initialSubcategory);
  // Set the first subcategory as active initially
  const [activeSubcategory, setActiveSubcategory] = useState<string>(
    initialSubcategory && subcategories.includes(initialSubcategory) ? initialSubcategory : subcategories[0]
  );

  if (categoryName !== prevCategory || initialSubcategory !== prevInitialSubcat) {
    setPrevCategory(categoryName);
    setPrevInitialSubcat(initialSubcategory);
    setActiveSubcategory(
      initialSubcategory && subcategories.includes(initialSubcategory) ? initialSubcategory : subcategories[0]
    );
  }

  const listings = useMemo(() => {
    return getBusinessesForSubcategory(categoryName, activeSubcategory);
  }, [categoryName, activeSubcategory]);
  
  // Search states grouped to reduce useState count
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    subcatQuery: ""
  });
  const { query: searchQuery, subcatQuery: subcatSearch } = searchFilters;

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

  const [enquiryState, dispatchEnquiry] = useReducer(enquiryReducer, initialEnquiryState(username || ""));
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

  // Filter listings based on search
  const filteredListings = listings.filter(biz =>
    biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    biz.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter subcategories list based on user search
  const filteredSubcategories = subcategories.filter(sub =>
    sub.toLowerCase().includes(subcatSearch.toLowerCase())
  );

  // Handle revealing contact number
  const togglePhoneReveal = (id: string) => {
    setRevealedPhoneIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle opening enquiry modal
  const openEnquiryModal = (biz: BusinessListingData) => {
    dispatchEnquiry({
      type: "OPEN_MODAL",
      biz,
      message: `Hi, I want to enquire about ${activeSubcategory} services from ${biz.name}.`
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
    setTimeout(() => {
      dispatchEnquiry({ type: "CLOSE_MODAL" });
    }, 2500);
  };

  // Handle opening booking modal
  const openBookingModal = (biz: BusinessListingData) => {
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
        timeslot: (categoryName === "Health Care Point" || categoryName === "Doctor Point") ? "Morning Slot Consultation (09:00 AM - 01:00 PM) (Fee: ₹300)" : ""
      }
    });
  };

  // Handle submitting booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) {
      alert("Please fill in your Name and Phone Number.");
      return;
    }
    dispatchBooking({ type: "SET_STEP", step: "payment" });
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
                <label htmlFor="bookingSpaDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Booking Date*</label>
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
                <label htmlFor="bookingSpaPersons" className="block text-xs font-bold text-foreground/80 mb-1.5">No. of Persons*</label>
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
              <label htmlFor="bookingSpaPackage" className="block text-xs font-bold text-foreground/80 mb-1.5">Spa Treatment Preferred*</label>
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
              <label htmlFor="bookingSpaTimeslot" className="block text-xs font-bold text-foreground/80 mb-1.5">Preferred Time Slot*</label>
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
                <label htmlFor="bookingTourDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Travel Date*</label>
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
                <label htmlFor="bookingTourTravelers" className="block text-xs font-bold text-foreground/80 mb-1.5">No. of Travelers*</label>
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
                <label htmlFor="bookingTourDuration" className="block text-xs font-bold text-foreground/80 mb-1.5">Package Duration*</label>
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
                <label htmlFor="bookingTourHotelClass" className="block text-xs font-bold text-foreground/80 mb-1.5">Accommodation Class*</label>
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
                <label htmlFor="bookingJobExperience" className="block text-xs font-bold text-foreground/80 mb-1.5">Experience Level*</label>
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
                <label htmlFor="bookingJobNoticePeriod" className="block text-xs font-bold text-foreground/80 mb-1.5">Notice Period*</label>
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
              <label htmlFor="bookingJobPosition" className="block text-xs font-bold text-foreground/80 mb-1.5">Applied Position (Preset)</label>
              <input
                id="bookingJobPosition"
                type="text"
                readOnly
                value={activeSubcategory}
                className="w-full rounded-xl border border-border bg-secondary/35 px-3.5 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="bookingJobResume" className="block text-xs font-bold text-foreground/80 mb-1.5">Resume Drive Link / Bio*</label>
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
                <label htmlFor="bookingServiceDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Service Date*</label>
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
                <label htmlFor="bookingServiceTimeslot" className="block text-xs font-bold text-foreground/80 mb-1.5">Time Preference*</label>
                <select
                  id="bookingServiceTimeslot"
                  required
                  value={bookingForm.timeslot || ""}
                  onChange={(e) => handleFieldChange("timeslot", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Time Preference</option>
                  <option value="Morning Slot (9:00 AM - 12:00 PM)">Morning Slot (9 AM - 12 PM)</option>
                  <option value="Afternoon Slot (12:00 PM - 04:00 PM)">Afternoon Slot (12 PM - 4 PM)</option>
                  <option value="Evening Slot (04:00 PM - 08:00 PM)">Evening Slot (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="bookingServiceIssue" className="block text-xs font-bold text-foreground/80 mb-1.5">Service Description / Concern*</label>
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
              <label htmlFor="bookingServiceAddress" className="block text-xs font-bold text-foreground/80 mb-1.5">Service Address*</label>
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
                <label htmlFor="bookingEduStudentAge" className="block text-xs font-bold text-foreground/80 mb-1.5">Student Age*</label>
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
                <label htmlFor="bookingEduStudentClass" className="block text-xs font-bold text-foreground/80 mb-1.5">Class / Standard*</label>
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
              <label htmlFor="bookingEduBatchTimings" className="block text-xs font-bold text-foreground/80 mb-1.5">Preferred Batch Timing*</label>
              <select
                id="bookingEduBatchTimings"
                required
                value={bookingForm.batchTimings || ""}
                onChange={(e) => handleFieldChange("batchTimings", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Select Batch</option>
                <option value="Morning Batch (8:00 AM - 12:00 PM)">Morning Batch (8 AM - 12 PM)</option>
                <option value="Evening Batch (4:00 PM - 08:00 PM)">Evening Batch (4 PM - 8 PM)</option>
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
                <label htmlFor="bookingHealthPatientAge" className="block text-xs font-bold text-foreground/80 mb-1.5">Patient Age*</label>
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
                <label htmlFor="bookingHealthDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Appointment Date*</label>
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
              <label htmlFor="bookingHealthTimeslot" className="block text-xs font-bold text-foreground/80 mb-1.5">Appointment Slot*</label>
              <select
                id="bookingHealthTimeslot"
                required
                value={bookingForm.timeslot || ""}
                onChange={(e) => handleFieldChange("timeslot", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Select Slot</option>
                <option value="Morning Slot Consultation (09:00 AM - 01:00 PM) (Fee: ₹300)">Morning Slot (09:00 AM - 01:00 PM) (Fee: ₹300)</option>
                <option value="Evening Slot Consultation (05:00 PM - 08:30 PM) (Fee: ₹400)">Evening Slot (05:00 PM - 08:30 PM) (Fee: ₹400)</option>
                <option value="Priority / Emergency Walk-in Slot (Fee: ₹800)">Priority / Emergency Slot (Fee: ₹800)</option>
              </select>
            </div>
            <div>
              <label htmlFor="bookingHealthSymptoms" className="block text-xs font-bold text-foreground/80 mb-1.5">Chief Complaint / Symptoms*</label>
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
                <label htmlFor="bookingHotelDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Check-in Date*</label>
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
                <label htmlFor="bookingHotelCheckoutDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Check-out Date*</label>
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
                <label htmlFor="bookingHotelGuests" className="block text-xs font-bold text-foreground/80 mb-1.5">No. of Guests*</label>
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
                <label htmlFor="bookingHotelRoomType" className="block text-xs font-bold text-foreground/80 mb-1.5">Room Standard Preferred*</label>
                <select
                  id="bookingHotelRoomType"
                  required
                  value={bookingForm.roomType || ""}
                  onChange={(e) => handleFieldChange("roomType", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Room</option>
                  <option value="Deluxe AC Room (₹1,999/night)">Deluxe AC Room (₹1,999/night)</option>
                  <option value="Super Deluxe Room (Balcony) (₹2,999/night)">Super Deluxe Room (Balcony) (₹2,999/night)</option>
                  <option value="Luxury Family Suite (₹4,499/night)">Luxury Family Suite (₹4,499/night)</option>
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
                <label htmlFor="bookingCarDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Rental Start Date*</label>
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
                <label htmlFor="bookingCarDuration" className="block text-xs font-bold text-foreground/80 mb-1.5">Duration Required*</label>
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
                <label htmlFor="bookingCarType" className="block text-xs font-bold text-foreground/80 mb-1.5">Vehicle Tier*</label>
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
                <label htmlFor="bookingCarDriverOption" className="block text-xs font-bold text-foreground/80 mb-1.5">Driver Option*</label>
                <select
                  id="bookingCarDriverOption"
                  required
                  value={bookingForm.driverOption || ""}
                  onChange={(e) => handleFieldChange("driverOption", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">Select Option</option>
                  <option value="Self Drive">Self Drive</option>
                  <option value="Chauffeur Driven (With Driver)">Chauffeur Driven (With Driver)</option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div>
              <label htmlFor="bookingDefaultDate" className="block text-xs font-bold text-foreground/80 mb-1.5">Preferred Date*</label>
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
              <label htmlFor="bookingDefaultRequirements" className="block text-xs font-bold text-foreground/80 mb-1.5">Specific Requirements / Details*</label>
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
              <label htmlFor="bookingDefaultAddress" className="block text-xs font-bold text-foreground/80 mb-1.5">Booking / Delivery Address*</label>
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 sm:gap-8 px-4 sm:px-6">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card hover:bg-secondary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <a href="/" className="hidden md:flex items-center shrink-0">
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-8 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          {/* Search bar inside subcategory page */}
          <div className="relative flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 shadow-[var(--shadow-card)] max-w-xl">
            <div className="flex items-center gap-1.5 border-r border-border px-3 py-1.5 text-xs sm:text-sm shrink-0">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="font-semibold text-foreground/80">Mumbai</span>
            </div>
            <input
              type="text"
              placeholder={`Search in ${activeSubcategory}…`}
              value={searchQuery}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
              aria-label={`Search in ${activeSubcategory}`}
            />
            <button aria-label="Submit search" className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* User profile action */}
          <div className="flex items-center gap-3 ml-auto">
            {username ? (
              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs sm:text-sm font-semibold hover:bg-secondary cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-[11px] font-bold text-white uppercase">
                  {username.charAt(0)}
                </div>
                <span className="hidden sm:inline text-foreground/80">{username}</span>
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
              >
                <User className="h-4 w-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Breadcrumb / Title */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground pl-0.5">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={onBack}>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground/70">{categoryName}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-primary">{activeSubcategory}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Subcategories Selector */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-28 rounded-2xl border border-border/80 bg-card p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <h3 className="font-serif text-lg font-bold mb-4 pl-1">Subcategories</h3>
              
              {/* Search Subcategory */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Filter subcategories..."
                  value={subcatSearch}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, subcatQuery: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-accent transition-colors"
                  aria-label="Filter subcategories"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>

              {/* Subcategories list */}
              <div className="max-h-[380px] sm:max-h-[460px] overflow-y-auto no-scrollbar flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-1.5">
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((subcat) => {
                    const isSelected = activeSubcategory === subcat;
                    return (
                      <button
                        key={subcat}
                        onClick={() => handleSubcategorySelect(subcat)}
                        className={`text-left text-xs sm:text-[13px] font-semibold py-2 px-3.5 rounded-xl border transition-all duration-300 shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-sm font-bold scale-102"
                            : "bg-background border-border text-foreground/80 hover:bg-secondary hover:text-primary hover:border-primary/20"
                        }`}
                      >
                        {subcat}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground py-2 text-center w-full">No matches found</p>
                )}
              </div>
            </div>
          </aside>

          {/* Right Panel: Business Listings */}
          <section className="flex-1">
            <div className="mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Top {activeSubcategory} in Mumbai
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Showing {filteredListings.length} verified listings ready to assist you.
              </p>
            </div>

            {/* Listings Grid */}
            <div key={activeSubcategory} className="flex flex-col gap-6 animate-fade-in-up">
              {filteredListings.length > 0 ? (
                filteredListings.map((biz) => {
                  const isPhoneRevealed = !!revealedPhoneIds[biz.id];
                  return (
                    <div
                      key={biz.id}
                      className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                    >
                      {/* Left: Listing Image */}
                      <div className="relative h-44 w-full sm:w-60 overflow-hidden rounded-xl bg-secondary shrink-0 cursor-pointer" onClick={() => onBusinessSelect(biz.id)}>
                        <img
                          src={biz.images[0]}
                          alt={biz.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      {/* Right: Info details */}
                      <div className="flex flex-1 flex-col justify-between p-1 sm:p-2 mt-4 sm:mt-0 sm:ml-6">
                        <div>
                          {/* Title & Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h2
                              onClick={() => onBusinessSelect(biz.id)}
                              className="font-serif text-xl font-bold text-foreground cursor-pointer group-hover:text-primary transition-colors leading-tight"
                            >
                              {biz.name}
                            </h2>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                              Verified
                            </span>
                          </div>

                          {/* Ratings */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-black text-white">
                              <span>{biz.rating}</span>
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {biz.reviewCount} Ratings
                            </span>
                          </div>

                          {/* Address & Timings */}
                          <div className="mt-3.5 space-y-1.5 text-[13px] text-foreground/80">
                            <p className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="line-clamp-1">{biz.address}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                              <span>{biz.timings}</span>
                              <span className="ml-2 font-bold text-emerald-600 text-xs">Open Now</span>
                            </p>
                            {categoryName === "Hotel Point" && biz.products && biz.products[0] && (
                              <p className="flex items-center gap-1.5 text-emerald-600 font-bold text-[13px] mt-1.5">
                                <span>Rooms starting from: <span className="underline">{biz.products[0].price}</span></span>
                              </p>
                            )}
                            {(categoryName === "Health Care Point" || categoryName === "Doctor Point") && biz.products && biz.products[0] && (
                              <p className="flex items-center gap-1.5 text-emerald-600 font-bold text-[13px] mt-1.5">
                                <span>OPD Consult Fee: <span className="underline">{biz.products[0].price}</span></span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/50">
                          <button
                            onClick={() => togglePhoneReveal(biz.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-secondary cursor-pointer"
                          >
                            <Phone className="h-3.5 w-3.5 text-accent" />
                            {isPhoneRevealed ? biz.phone : "Show Number"}
                          </button>

                          <button
                            onClick={() => openEnquiryModal(biz)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/95 cursor-pointer shadow-sm hover:scale-[1.02]"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Enquire Now
                          </button>

                          <button
                            onClick={() => openBookingModal(biz)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-700 cursor-pointer shadow-sm hover:scale-[1.02]"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Book Now
                          </button>

                          <button
                            onClick={() => onBusinessSelect(biz.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-secondary/30 hover:bg-secondary px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition ml-auto cursor-pointer"
                          >
                            Details <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-border/80 border-dashed bg-card/50 p-12 text-center">
                  <p className="text-muted-foreground text-sm font-semibold">No listings found matching "{searchQuery}"</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Try refining your search text or select another subcategory.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Enquiry Modal */}
      {enquiryModalOpen && selectedBizForEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => dispatchEnquiry({ type: "CLOSE_MODAL" })}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {!enquirySubmitted ? (
              <form onSubmit={handleEnquirySubmit}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  Send Enquiry
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Send your enquiry to <span className="font-bold text-primary">{selectedBizForEnquiry.name}</span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="enquiryName" className="block text-xs font-bold text-foreground/80 mb-1.5">Your Name*</label>
                    <input
                      id="enquiryName"
                      type="text"
                      required
                      value={enquiryForm.name}
                      onChange={(e) => dispatchEnquiry({ type: "UPDATE_FORM", fields: { name: e.target.value } })}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiryPhone" className="block text-xs font-bold text-foreground/80 mb-1.5">Phone Number*</label>
                    <input
                      id="enquiryPhone"
                      type="tel"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) => dispatchEnquiry({ type: "UPDATE_FORM", fields: { phone: e.target.value } })}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiryEmail" className="block text-xs font-bold text-foreground/80 mb-1.5">Email Address</label>
                    <input
                      id="enquiryEmail"
                      type="email"
                      value={enquiryForm.email}
                      onChange={(e) => dispatchEnquiry({ type: "UPDATE_FORM", fields: { email: e.target.value } })}
                      placeholder="Enter your email (optional)"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiryMessage" className="block text-xs font-bold text-foreground/80 mb-1.5">Message / Requirements</label>
                    <textarea
                      id="enquiryMessage"
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => dispatchEnquiry({ type: "UPDATE_FORM", fields: { message: e.target.value } })}
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
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">
                  Enquiry Sent!
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your requirements have been successfully sent to <span className="font-semibold text-primary">{selectedBizForEnquiry.name}</span>. They will call you back shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && selectedBizForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => dispatchBooking({ type: "CLOSE_MODAL" })}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {bookingStep === "form" && (
              <form onSubmit={handleBookingSubmit}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  Book Services
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure booking with <span className="font-bold text-primary">{selectedBizForBooking.name}</span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="bookingContactName" className="block text-xs font-bold text-foreground/80 mb-1.5">Contact Name*</label>
                    <input
                      id="bookingContactName"
                      type="text"
                      required
                      value={bookingForm.name || ""}
                      onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { name: e.target.value } })}
                      placeholder="Enter customer name"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="bookingPhone" className="block text-xs font-bold text-foreground/80 mb-1.5">Phone Number*</label>
                    <input
                      id="bookingPhone"
                      type="tel"
                      required
                      value={bookingForm.phone || ""}
                      onChange={(e) => dispatchBooking({ type: "UPDATE_FORM", fields: { phone: e.target.value } })}
                      placeholder="Enter mobile number"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  {/* Render custom fields based on current category */}
                  {renderBookingFields()}
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
                    <p className="text-[10px] text-muted-foreground">Transactions are encrypted with SSL security</p>
                  </div>
                </div>

                <div className="bg-secondary/45 rounded-xl border border-border/80 p-3.5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Booking Deposit Amount</span>
                    <span className="text-[11px] font-semibold text-foreground/80 mt-0.5">{selectedBizForBooking.name}</span>
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
                          onClick={() => dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "upi" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "upi" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          UPI / QR
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "card" })}
                          className={`py-2 text-[10.5px] font-bold border rounded-xl cursor-pointer ${paymentMethod === "card" ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-foreground hover:bg-secondary"}`}
                        >
                          Card
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatchBooking({ type: "SET_PAYMENT_METHOD", method: "netbanking" })}
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
                            onChange={(e) => dispatchBooking({ type: "SET_PAYMENT_FIELD", field: "upiId", value: e.target.value })}
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
                            onChange={(e) => dispatchBooking({ type: "SET_PAYMENT_FIELD", field: "cardNumber", value: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
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
                              onChange={(e) => dispatchBooking({ type: "SET_PAYMENT_FIELD", field: "cardExpiry", value: e.target.value })}
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
                              onChange={(e) => dispatchBooking({ type: "SET_PAYMENT_FIELD", field: "cardCvv", value: e.target.value })}
                              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="bookingBankSelect" className="block text-xs font-bold text-foreground/80 mb-1.5">Select Bank</label>
                          <select id="bookingBankSelect" className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent">
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
                        dispatchBooking({ type: "SET_PROCESSING", value: true });
                        setTimeout(() => {
                          dispatchBooking({ type: "SET_PROCESSING", value: false });
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
                  Booking Confirmed!
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your booking details have been sent successfully to <span className="font-semibold text-primary">{selectedBizForBooking.name}</span>. You will receive a verification call shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
