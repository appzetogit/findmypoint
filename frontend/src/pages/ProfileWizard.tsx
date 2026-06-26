import { useState, useEffect, useReducer } from "react";
import { 
  User, MapPin, Heart, Check, X, Upload, Plus, Trash2, 
  ShieldCheck, Mail, Phone, Briefcase, Calendar, CheckCircle2, ChevronRight, ArrowLeft 
} from "lucide-react";

interface ProfileWizardProps {
  onClose: () => void;
  username: string | null;
}

interface AddressItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
  landlineStd: string;
  landlineNum: string;
  tag: string;
}

// Types and Reducers for Profile Wizard Flow
interface ProfileWizardState {
  step: number;
  personal: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dobDD: string;
    dobMM: string;
    dobYYYY: string;
    maritalStatus: string;
    occupation: string;
    mobile1: string;
    mobile2: string;
    avatar: string;
  };
  mobile2Verified: boolean;
  verifyingMobile: boolean;
  addresses: AddressItem[];
  newAddr: {
    name: string;
    phone: string;
    email: string;
    address: string;
    pincode: string;
    city: string;
    landlineStd: string;
    landlineNum: string;
    tag: string;
  };
  selectedFavorites: string[];
}

type ProfileWizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "UPDATE_PERSONAL"; fields: Partial<ProfileWizardState["personal"]> }
  | { type: "SET_PERSONAL"; value: ProfileWizardState["personal"] }
  | { type: "SET_MOBILE2_VERIFIED"; value: boolean }
  | { type: "SET_VERIFYING_MOBILE"; value: boolean }
  | { type: "SET_ADDRESSES"; value: AddressItem[] }
  | { type: "UPDATE_NEW_ADDR"; fields: Partial<ProfileWizardState["newAddr"]> }
  | { type: "RESET_NEW_ADDR"; username: string }
  | { type: "SET_FAVORITES"; value: string[] };

const initialProfileWizardState = (username: string): ProfileWizardState => ({
  step: 1,
  personal: {
    title: "Mr",
    firstName: username || "",
    middleName: "",
    lastName: "",
    dobDD: "",
    dobMM: "",
    dobYYYY: "",
    maritalStatus: "Single",
    occupation: "Employed",
    mobile1: "7223077890",
    mobile2: "",
    avatar: ""
  },
  mobile2Verified: false,
  verifyingMobile: false,
  addresses: [],
  newAddr: {
    name: username || "",
    phone: "7223077890",
    email: "",
    address: "",
    pincode: "",
    city: "",
    landlineStd: "",
    landlineNum: "",
    tag: "Home"
  },
  selectedFavorites: []
});

function profileWizardReducer(state: ProfileWizardState, action: ProfileWizardAction): ProfileWizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "UPDATE_PERSONAL":
      return { ...state, personal: { ...state.personal, ...action.fields } };
    case "SET_PERSONAL":
      return { ...state, personal: action.value };
    case "SET_MOBILE2_VERIFIED":
      return { ...state, mobile2Verified: action.value };
    case "SET_VERIFYING_MOBILE":
      return { ...state, verifyingMobile: action.value };
    case "SET_ADDRESSES":
      return { ...state, addresses: action.value };
    case "UPDATE_NEW_ADDR":
      return { ...state, newAddr: { ...state.newAddr, ...action.fields } };
    case "RESET_NEW_ADDR":
      return {
        ...state,
        newAddr: {
          ...state.newAddr,
          address: "",
          pincode: "",
          city: "",
          landlineStd: "",
          landlineNum: "",
          tag: "Home"
        }
      };
    case "SET_FAVORITES":
      return { ...state, selectedFavorites: action.value };
    default:
      return state;
  }
}

const FAVORITE_CATEGORIES = [
  { id: "doctor", label: "Doctor", icon: "🩺" },
  { id: "hospital", label: "Hospital", icon: "➕" },
  { id: "grocery", label: "Grocery Store", icon: "🛒" },
  { id: "chemist", label: "Chemist", icon: "💊" },
  { id: "laundry", label: "Laundry Service", icon: "🧺" },
  { id: "spa", label: "Spa & Salon", icon: "💆" },
  { id: "car", label: "Car Service", icon: "🚗" },
  { id: "ac", label: "AC Service", icon: "❄️" },
  { id: "water", label: "Water Purifier Service", icon: "🚰" },
  { id: "plumber", label: "Plumber", icon: "🔧" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "pizza", label: "Pizza", icon: "🍕" },
  { id: "cinema", label: "Cinema Hall", icon: "🎬" }
];

export default function ProfileWizard({ onClose, username }: ProfileWizardProps) {
  const [state, dispatch] = useReducer(profileWizardReducer, initialProfileWizardState(username || ""));
  const {
    step,
    personal,
    mobile2Verified,
    verifyingMobile,
    addresses,
    newAddr,
    selectedFavorites
  } = state;

  // Load existing profile from localStorage
  useEffect(() => {
    try {
      const savedPersonal = localStorage.getItem("fmp_profile_personal:v1");
      if (savedPersonal) {
        dispatch({ type: "SET_PERSONAL", value: JSON.parse(savedPersonal) });
      } else if (username) {
        dispatch({ type: "UPDATE_PERSONAL", fields: { firstName: username } });
      }
      
      const savedAddresses = localStorage.getItem("fmp_profile_addresses:v1");
      if (savedAddresses) {
        dispatch({ type: "SET_ADDRESSES", value: JSON.parse(savedAddresses) });
      }
      
      const savedFavorites = localStorage.getItem("fmp_profile_favorites:v1");
      if (savedFavorites) {
        dispatch({ type: "SET_FAVORITES", value: JSON.parse(savedFavorites) });
      }
    } catch (e) {
      console.error("Failed to load profile data from local storage", e);
    }
  }, [username]);

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({ type: "UPDATE_PERSONAL", fields: { avatar: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Save
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("fmp_profile_personal:v1", JSON.stringify(personal));
    dispatch({ type: "SET_STEP", step: 2 });
  };

  // Step 2 Save new address
  const handleAddAddress = () => {
    const item: AddressItem = {
      ...newAddr,
      id: Math.random().toString(36).substring(2, 9)
    };
    const updated = [...addresses, item];
    dispatch({ type: "SET_ADDRESSES", value: updated });
    localStorage.setItem("fmp_profile_addresses:v1", JSON.stringify(updated));
    // Reset form fields
    dispatch({ type: "RESET_NEW_ADDR", username: username || "" });
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    dispatch({ type: "SET_ADDRESSES", value: updated });
    localStorage.setItem("fmp_profile_addresses:v1", JSON.stringify(updated));
  };

  const handleSaveAddresses = () => {
    if (addresses.length === 0 && newAddr.address) {
      handleAddAddress();
    }
    dispatch({ type: "SET_STEP", step: 3 });
  };

  // Toggle favorite category selection
  const toggleFavorite = (id: string) => {
    const updated = selectedFavorites.includes(id) 
      ? selectedFavorites.filter(f => f !== id) 
      : [...selectedFavorites, id];
    dispatch({ type: "SET_FAVORITES", value: updated });
    localStorage.setItem("fmp_profile_favorites:v1", JSON.stringify(updated));
  };

  // Complete profile wizard
  const handleCompleteWizard = () => {
    dispatch({ type: "SET_STEP", step: 4 });
  };

  // Generate mock DOB days & years
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 80 }, (_, i) => String(2010 - i));

  // Compute overall progress percentage
  const getProgressPercent = () => {
    if (step === 1) return 25;
    if (step === 2) return 55;
    if (step === 3) return 85;
    return 100;
  };

  const mockVerifyMobile = () => {
    if (!personal.mobile2) {
      alert("Please enter Mobile Number 2 to verify.");
      return;
    }
    dispatch({ type: "SET_VERIFYING_MOBILE", value: true });
    setTimeout(() => {
      dispatch({ type: "SET_VERIFYING_MOBILE", value: false });
      dispatch({ type: "SET_MOBILE2_VERIFIED", value: true });
      alert("OTP Verified Successfully!");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col md:flex-row w-full h-full text-left overflow-hidden animate-fade-in">
        
        {/* LEFT SIDEBAR: Stepper Progress Checklist */}
        <aside className="w-full md:w-80 bg-gradient-to-b from-primary to-indigo-950 p-5 md:p-8 text-primary-foreground flex flex-col justify-between shrink-0 border-r border-border/10 relative">
          <div>
            {/* Back Button */}
            <div className="mb-6">
              <button 
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shadow-sm"
                title="Back to Home"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <span className="text-[10px] font-black text-accent tracking-[0.2em] uppercase">Set Up Account</span>
            <h2 className="font-serif text-2xl font-black mt-1 leading-tight tracking-tight uppercase">Fill Profile</h2>
            
            {/* Progress indicator */}
            <div className="mt-8 mb-4 md:mb-8">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="opacity-90">Overall Completion</span>
                <span className="text-accent">{getProgressPercent()}%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${getProgressPercent()}%` }}
                />
              </div>
            </div>

            {/* Mobile step progress indicator */}
            <div className="flex md:hidden items-center justify-between text-xs font-bold mb-4 bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/5">
              <span>Step {step} of 4</span>
              <span className="text-accent">
                {step === 1 && "Personal Details"}
                {step === 2 && "Addresses"}
                {step === 3 && "Favorites"}
                {step === 4 && "Completed"}
              </span>
            </div>

            {/* Steps checklist */}
            <div className="hidden md:block space-y-6">
              {[
                { s: 1, label: "Personal Details", desc: "Basic information & contact", icon: User },
                { s: 2, label: "Addresses", desc: "Home and office locations", icon: MapPin },
                { s: 3, label: "Favorites", desc: "Select favorite categories", icon: Heart },
                { s: 4, label: "Completed", desc: "Setup summary profile", icon: ShieldCheck }
              ].map((item) => {
                const isActive = step === item.s;
                const isCompleted = step > item.s;
                return (
                  <div key={item.s} className="relative flex items-start gap-4">
                    {/* Stepper connecting line */}
                    {item.s < 4 && (
                      <div className={`absolute left-4.5 top-9 w-[2px] h-9 -ml-[1px] transition-colors duration-300 ${step > item.s ? 'bg-accent' : 'bg-white/20'}`} />
                    )}
                    
                    {/* Step circle indicator */}
                    <button
                      disabled={step < item.s}
                      onClick={() => dispatch({ type: "SET_STEP", step: item.s })}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                        isCompleted
                          ? "bg-accent border-accent text-accent-foreground"
                          : isActive
                            ? "bg-white border-white text-primary shadow-lg font-black"
                            : "bg-white/5 border-white/25 text-white/50 cursor-not-allowed"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4.5 w-4.5 stroke-[3px]" /> : item.s}
                    </button>

                    <div className="flex flex-col text-left">
                      <span className={`text-[13px] font-bold leading-tight ${isActive ? 'text-white' : isCompleted ? 'text-accent' : 'text-white/60'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] font-medium leading-relaxed mt-0.5 ${isActive ? 'text-white/80' : 'text-white/40'}`}>
                        {item.desc}
                      </span>
                      
                      {/* Favorites List Submenu inside step 3 indicator */}
                      {item.s === 3 && (isActive || step > 3) && (
                        <div className="mt-2.5 max-h-[160px] overflow-y-auto no-scrollbar bg-black/20 border border-white/5 rounded-xl p-2.5 space-y-1 w-52 md:w-56">
                          {FAVORITE_CATEGORIES.map(cat => {
                            const isFav = selectedFavorites.includes(cat.id);
                            return (
                              <button
                                key={cat.id}
                                disabled={step > 3}
                                onClick={() => toggleFavorite(cat.id)}
                                className={`w-full flex items-center justify-between text-[11px] font-bold py-1 px-2 rounded-lg transition ${
                                  isFav 
                                    ? "bg-accent/25 border border-accent/20 text-accent" 
                                    : "text-white/60 hover:bg-white/5"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>{cat.icon}</span>
                                  <span>{cat.label}</span>
                                </span>
                                {isFav && <Check className="h-3 w-3" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider pl-0.5">
            <ShieldCheck className="h-4 w-4" /> Secure Profile Verification
          </div>
        </aside>

        {/* RIGHT PANEL: Form Body Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            
            {/* STEP 1: Personal Details Form */}
            {step === 1 && (
              <form onSubmit={handleSavePersonal} className="space-y-6 text-left my-auto animate-fade-in">
                <div>
                  <h3 className="font-serif text-2xl font-black text-foreground">Provide personal details</h3>
                  <p className="text-xs text-muted-foreground mt-1">Please fill in your primary details to establish your profile.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left fields */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Name fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                      <div className="sm:col-span-3">
                        <label htmlFor="profileTitle" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Title</label>
                        <select 
                          id="profileTitle"
                          value={personal.title}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { title: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          <option value="Mr">Mr.</option>
                          <option value="Mrs">Mrs.</option>
                          <option value="Ms">Ms.</option>
                        </select>
                      </div>
                      <div className="sm:col-span-9">
                        <label htmlFor="profileFirstName" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">First Name</label>
                        <input 
                          id="profileFirstName"
                          type="text" 
                          value={personal.firstName}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { firstName: e.target.value } })}
                          placeholder="First Name"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="profileMiddleName" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Middle Name</label>
                        <input 
                          id="profileMiddleName"
                          type="text" 
                          value={personal.middleName}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { middleName: e.target.value } })}
                          placeholder="Middle Name"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label htmlFor="profileLastName" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Last Name</label>
                        <input 
                          id="profileLastName"
                          type="text" 
                          value={personal.lastName}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { lastName: e.target.value } })}
                          placeholder="Last Name"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {/* Date of Birth Selectors */}
                    <div>
                      <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Date of Birth (DOB)</span>
                      <div className="grid grid-cols-3 gap-3.5">
                        <select 
                          value={personal.dobDD}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { dobDD: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          <option value="">DD</option>
                          {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>

                        <select 
                          value={personal.dobMM}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { dobMM: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          <option value="">Month</option>
                          {months.map((m, idx) => <option key={m} value={String(idx + 1).padStart(2, "0")}>{m}</option>)}
                        </select>

                        <select 
                          value={personal.dobYYYY}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { dobYYYY: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          <option value="">YYYY</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="profileMaritalStatus" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Marital Status</label>
                        <select 
                          id="profileMaritalStatus"
                          value={personal.maritalStatus}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { maritalStatus: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="profileOccupation" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Occupation</label>
                        <select 
                          id="profileOccupation"
                          value={personal.occupation}
                          onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { occupation: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          <option value="Employed">Employed</option>
                          <option value="Business Owner">Business Owner</option>
                          <option value="Student">Student</option>
                          <option value="Self Employed">Self Employed</option>
                          <option value="Unemployed">Unemployed</option>
                          <option value="Retired">Retired</option>
                        </select>
                      </div>
                    </div>


                  </div>

                  {/* Right side: Avatar Upload & Mobiles */}
                  <div className="lg:col-span-4 space-y-5 text-center flex flex-col items-center">
                    
                    {/* Avatar preview block */}
                    <div className="relative group">
                      <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary bg-secondary shadow-md flex items-center justify-center">
                        {personal.avatar ? (
                          <img src={personal.avatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow border border-card hover:bg-primary/95 transition">
                        <Upload className="h-3.5 w-3.5" />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          aria-label="Upload Avatar"
                          className="hidden"
                        />
                      </label>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground block uppercase">Upload Member Avatar</span>

                    {/* Mobiles */}
                    <div className="w-full text-left space-y-3 pt-2">
                      <div>
                        <label htmlFor="profileMobile1" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">Mobile Number 1</label>
                        <div className="relative flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-secondary text-xs font-bold text-muted-foreground">
                            +91
                          </span>
                          <input 
                            id="profileMobile1"
                            type="tel" 
                            maxLength={10}
                            value={personal.mobile1}
                            onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { mobile1: e.target.value.replace(/[^0-9]/g, "") } })}
                            placeholder="Primary Mobile"
                            className="flex-1 rounded-r-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="profileMobile2" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">Mobile Number 2</label>
                        <div className="flex gap-2">
                          <div className="relative flex flex-1">
                            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-secondary text-xs font-bold text-muted-foreground">
                              +91
                            </span>
                            <input 
                              id="profileMobile2"
                              type="tel" 
                              maxLength={10}
                              value={personal.mobile2}
                              onChange={(e) => dispatch({ type: "UPDATE_PERSONAL", fields: { mobile2: e.target.value.replace(/[^0-9]/g, "") } })}
                              placeholder="Secondary Mobile"
                              className="flex-1 rounded-r-xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold outline-none focus:border-accent"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={mockVerifyMobile}
                            disabled={!personal.mobile2 || mobile2Verified || verifyingMobile}
                            className={`px-2.5 sm:px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              mobile2Verified
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-600 cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                          >
                            {verifyingMobile ? "..." : mobile2Verified ? "Verified" : "Verify"}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black px-6 py-3 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    Save & Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Addresses Form */}
            {step === 2 && (
              <div className="space-y-6 text-left my-auto animate-fade-in">
                <div>
                  <h3 className="font-serif text-2xl font-black text-foreground">Provide home and office address</h3>
                  <p className="text-xs text-muted-foreground mt-1">Add your frequent address nodes for faster checkout and deliveries.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Address input block */}
                  <div className="lg:col-span-7 bg-secondary/25 border border-border/80 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider block">Add Address Node</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="addrName" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Recipient Name</label>
                        <input 
                          id="addrName"
                          type="text" 
                          value={newAddr.name}
                          onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { name: e.target.value } })}
                          placeholder="Recipient Name"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label htmlFor="addrPhone" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Contact Number</label>
                        <div className="relative flex">
                          <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-border bg-secondary text-[11px] font-bold text-muted-foreground">
                            +91
                          </span>
                          <input 
                            id="addrPhone"
                            type="tel" 
                            value={newAddr.phone}
                            onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { phone: e.target.value.replace(/[^0-9]/g, "") } })}
                            placeholder="Mobile"
                            className="flex-1 rounded-r-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="addrEmail" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Email Address</label>
                      <input 
                        id="addrEmail"
                        type="email" 
                        value={newAddr.email}
                        onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { email: e.target.value } })}
                        placeholder="recipient@example.com"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label htmlFor="addrCity" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">City</label>
                        <input 
                          id="addrCity"
                          type="text" 
                          value={newAddr.city}
                          onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { city: e.target.value } })}
                          placeholder="City"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label htmlFor="addrPincode" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Pincode</label>
                        <input 
                          id="addrPincode"
                          type="text" 
                          value={newAddr.pincode}
                          onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { pincode: e.target.value } })}
                          placeholder="Pincode"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="addrDetails" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Address Details</label>
                      <textarea 
                        id="addrDetails"
                        rows={2}
                        value={newAddr.address}
                        onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { address: e.target.value } })}
                        placeholder="House No, Floor, Street, Landmark details..."
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-8">
                        <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Landline (Optional)</span>
                        <div className="flex gap-1.5">
                          <input 
                            type="text" 
                            placeholder="STD"
                            aria-label="STD Code"
                            value={newAddr.landlineStd}
                            onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { landlineStd: e.target.value.replace(/[^0-9]/g, "") } })}
                            className="w-16 rounded-xl border border-border bg-background px-2.5 py-2.5 text-xs font-semibold text-center outline-none focus:border-accent"
                          />
                          <input 
                            type="text" 
                            placeholder="Landline Number"
                            aria-label="Landline Number"
                            value={newAddr.landlineNum}
                            onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { landlineNum: e.target.value.replace(/[^0-9]/g, "") } })}
                            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                      <div className="col-span-4">
                        <label htmlFor="addrTag" className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Tag</label>
                        <select 
                          id="addrTag"
                          value={newAddr.tag}
                          onChange={(e) => dispatch({ type: "UPDATE_NEW_ADDR", fields: { tag: e.target.value } })}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-accent"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Work">Work</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="w-full bg-secondary hover:bg-slate-200 border border-border text-foreground font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Address Node
                    </button>

                  </div>

                  {/* Address List View */}
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">Addresses Configured ({addresses.length})</span>
                    
                    {addresses.length === 0 ? (
                      <div className="border border-dashed border-border rounded-2xl p-8 text-center text-xs font-semibold text-muted-foreground bg-card">
                        No addresses added yet. Add your address in the left panel.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                        {addresses.map((item) => (
                          <div key={item.id} className="bg-card border border-border rounded-xl p-4.5 shadow-sm text-left relative group">
                            <button
                              onClick={() => handleDeleteAddress(item.id)}
                              className="absolute top-4 right-4 text-rose-500 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">{item.tag}</span>
                              <span className="text-xs font-black text-foreground">{item.name}</span>
                            </div>
                            <p className="text-[11.5px] text-muted-foreground mt-2 font-medium leading-relaxed pr-6">{item.address}, {item.city} - {item.pincode}</p>
                            <div className="text-[10px] font-bold text-slate-400 mt-2 flex flex-wrap gap-x-4">
                              <span>📞 +91 {item.phone}</span>
                              {item.email && <span>✉️ {item.email}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_STEP", step: 1 })}
                    className="border border-border bg-background hover:bg-secondary text-foreground text-xs font-black px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddresses}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black px-6 py-3 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    Save & Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Favorites Grid */}
            {step === 3 && (
              <div className="space-y-6 text-left my-auto animate-fade-in">
                <div>
                  <h3 className="font-serif text-2xl font-black text-foreground">Select a category to enter details</h3>
                  <p className="text-xs text-muted-foreground mt-1">Select your favorite services to highlight them on your dashboard.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {FAVORITE_CATEGORIES.map((cat) => {
                    const isSelected = selectedFavorites.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleFavorite(cat.id)}
                        className={`p-4.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          isSelected 
                            ? "bg-primary border-primary text-primary-foreground scale-102 font-black shadow-md" 
                            : "bg-card border-border hover:bg-secondary/40 text-foreground/80 hover:border-primary/20"
                        }`}
                      >
                        <span className="text-3xl filter drop-shadow">{cat.icon}</span>
                        <span className="text-xs font-bold mt-1 block tracking-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_STEP", step: 2 })}
                    className="border border-border bg-background hover:bg-secondary text-foreground text-xs font-black px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteWizard}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black px-6 py-3 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    Save & Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Setup Completed Successfully */}
            {step === 4 && (
              <div className="py-8 text-center flex flex-col items-center max-w-lg mx-auto justify-center my-auto animate-fade-in">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 animate-pulse border-2 border-emerald-200">
                  <CheckCircle2 className="h-10 w-10 stroke-[2.5px]" />
                </div>
                <h3 className="font-serif text-3xl font-black text-foreground mb-2">Profile Completed!</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mb-6 font-medium">
                  Congratulations <span className="font-extrabold text-primary">{personal.title}. {personal.firstName} {personal.lastName}</span>! Your personal profile details, addresses, and favorites have been updated securely.
                </p>

                {/* Summary Card */}
                <div className="w-full bg-secondary/35 border border-border/75 rounded-2xl p-5 text-left space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-primary/20 bg-card flex items-center justify-center shrink-0">
                      {personal.avatar ? (
                        <img src={personal.avatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground block tracking-wider leading-none">Verified Member</span>
                      <span className="text-sm font-extrabold text-foreground mt-1 block">{personal.firstName} {personal.lastName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] font-black uppercase text-muted-foreground block">Phone Contact</span>
                      <span className="font-bold text-foreground/90 mt-0.5 block">+91 {personal.mobile1}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-muted-foreground block">City Location</span>
                      <span className="font-bold text-foreground/90 mt-0.5 block">{addresses[0]?.city || "Mumbai"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-muted-foreground block">Active Addresses</span>
                      <span className="font-bold text-foreground/90 mt-0.5 block">{addresses.length} Node{addresses.length > 1 ? 's' : ''} saved</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-muted-foreground block">Favorites</span>
                      <span className="font-bold text-foreground/90 mt-0.5 block">{selectedFavorites.length} Selected</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3.5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                >
                  Done & Close Wizard
                </button>
              </div>
            )}

          </div>
        </main>

    </div>
  );
}
