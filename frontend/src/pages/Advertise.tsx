import { useReducer } from "react";
import { 
  ArrowLeft, Check, Phone, Building2, MapPin, 
  Layers, Users, ShieldCheck, Sparkles, TrendingUp,
  Star, Briefcase, Zap, HelpCircle
} from "lucide-react";
import logoImg from "@/assets/logo.jpeg";

interface AdvertiseProps {
  onClose: () => void;
  username: string | null;
}

interface AdvertiseFormState {
  mobile: string;
  businessName: string;
  category: string;
  city: string;
  submitted: boolean;
  loading: boolean;
}

type AdvertiseFormAction =
  | { type: "CHANGE_FIELD"; field: keyof Omit<AdvertiseFormState, "submitted" | "loading">; value: string }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "SET_LOADING"; value: boolean }
  | { type: "RESET" };

const initialAdvertiseState: AdvertiseFormState = {
  mobile: "",
  businessName: "",
  category: "Restaurant",
  city: "Mumbai",
  submitted: false,
  loading: false,
};

function advertiseReducer(state: AdvertiseFormState, action: AdvertiseFormAction): AdvertiseFormState {
  switch (action.type) {
    case "CHANGE_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_SUBMITTED":
      return { ...state, submitted: action.value };
    case "SET_LOADING":
      return { ...state, loading: action.value };
    case "RESET":
      return initialAdvertiseState;
    default:
      return state;
  }
}

export default function Advertise({ onClose, username }: AdvertiseProps) {
  const [state, dispatch] = useReducer(advertiseReducer, initialAdvertiseState);
  const { businessName, category, city } = state;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.mobile || state.mobile.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    dispatch({ type: "SET_LOADING", value: true });
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      dispatch({ type: "SET_SUBMITTED", value: true });
    }, 1500);
  };

  const categories = [
    "Restaurant", "Doctor & Clinic", "Real Estate", "Packers & Movers",
    "Car & Bike Service", "Spa & Salon", "Education & Coaching", "Interior Designer"
  ];

  const cities = ["Mumbai", "Indore", "Pune", "Jaipur", "Delhi", "Bangalore"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-8 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              Business Portal
            </span>
            <button 
              onClick={onClose}
              className="text-xs font-black text-primary hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 md:py-16">
        {state.submitted ? (
          <div className="max-w-xl mx-auto text-center bg-white border border-slate-200/85 rounded-3xl p-8 md:p-12 shadow-2xl animate-scale-up">
            <div className="h-16 w-16 bg-emerald-100 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <Sparkles className="h-8 w-8 animate-bounce" />
            </div>
            <h2 className="font-serif text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">
              Application Submitted!
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
              Thank you for choosing FindMyPoint to accelerate your growth. Our business relations manager will contact you on <span className="font-black text-primary">+91 {state.mobile}</span> within the next 24 hours to set up your Premium listing.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2 mb-8">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Business Name:</span>
                <span className="text-slate-800">{state.businessName || "Unnamed Business"}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Category:</span>
                 <span className="text-slate-800">{state.category}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Target City:</span>
                <span className="text-slate-800">{state.city}</span>
              </div>
             </div>
             <button
               onClick={() => {
                 dispatch({ type: "RESET" });
               }}
               className="w-full bg-primary hover:bg-primary/95 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
             >
               Advertise Another Business
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Branding, Value Proposition & Form */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight uppercase">
                  GROW <span className="text-primary bg-clip-text">Your</span> Business
                </h1>
                <p className="text-sm sm:text-base font-bold text-slate-500 mt-2">
                  Advertise on India's #1 Premium Local Search Engine.
                </p>
              </div>

              {/* Lead Capture Form */}
              <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Get Started In 10 Seconds</h3>
                  <p className="text-xs text-slate-400 font-medium">No credit card required. Enter your details and let customers find you.</p>
                </div>

                <div className="space-y-4">
                  {/* Business Name */}
                  <div>
                    <label htmlFor="advBusinessName" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        id="advBusinessName"
                        type="text" 
                        required
                        placeholder="e.g. Shree Shyam Caterers" 
                        value={state.businessName}
                        onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "businessName", value: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-primary focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Category Selector */}
                    <div>
                      <label htmlFor="advCategory" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Business Category</label>
                      <select 
                        id="advCategory"
                        value={state.category}
                        onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "category", value: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:border-primary focus:bg-white transition"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* City Selector */}
                    <div>
                      <label htmlFor="advCity" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Target City</label>
                      <select 
                        id="advCity"
                        value={state.city}
                        onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "city", value: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold outline-none focus:border-primary focus:bg-white transition"
                      >
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Phone Input with flag */}
                  <div>
                    <label htmlFor="advMobile" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 shrink-0">
                        <span className="text-base">🇮🇳</span> <span>+91</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          id="advMobile"
                          type="tel" 
                          required
                          maxLength={10}
                          placeholder="Enter 10-digit mobile" 
                          value={state.mobile}
                          onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "mobile", value: e.target.value.replace(/[^0-9]/g, "") })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-black tracking-wide outline-none focus:border-primary focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={state.loading}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2 uppercase tracking-wide mt-2"
                >
                  {state.loading ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Get Started Now</span>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Checklist */}
              <div className="space-y-3.5 bg-slate-100/60 border border-slate-200/40 rounded-2xl p-5">
                {[
                  "Get verified lead and calls in your target City/Area.",
                  "Find high-intent, ready-to-buy customers instantly.",
                  "Stay ranked at the top, ahead of all competitors.",
                  "Get a custom web storefront with reviews and showcase photos."
                ].map((text, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                      <Check className="h-3 w-3 stroke-[3px]" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-bold text-slate-700 leading-normal">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Premium Mockup & Stats */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative lg:self-start lg:-mt-8">
              
              {/* Premium Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 to-primary/10 blur-[120px] rounded-full -z-10" />

              {/* Smartphone Mockup */}
              <div className="relative bg-slate-900 p-3 rounded-[3rem] shadow-2xl border-4 border-slate-800 w-[270px] sm:w-[290px] aspect-[9/18.5] flex flex-col overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                {/* Speaker pill */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-4 w-24 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                </div>

                {/* Inner Screen */}
                <div className="bg-white flex-1 rounded-[2.2rem] overflow-hidden flex flex-col p-4 pt-8 text-left space-y-4">
                  {/* Mock search bar */}
                  <div className="border border-slate-200 rounded-full px-3 py-1.5 flex items-center justify-between shadow-sm bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400">Search in {city}...</span>
                    <div className="h-4.5 w-4.5 rounded-full bg-primary flex items-center justify-center text-white text-[8px] font-bold">🔍</div>
                  </div>

                  {/* Mock AD Card */}
                  <div className="border border-primary bg-blue-50/20 rounded-xl p-3.5 space-y-2 relative shadow-[0_4px_16px_rgba(0,98,255,0.06)] animate-pulse">
                    <span className="absolute top-2 right-2 text-[8px] font-extrabold uppercase bg-primary text-white px-1.5 py-0.5 rounded tracking-wider shadow-sm">SPONSORED</span>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">🏢</div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800">{businessName || "Your Business Name"}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{category} • {city}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 text-xs">★★★★★</span>
                      <span className="text-[9px] font-extrabold text-slate-500">(4.9/5 • 420 reviews)</span>
                    </div>

                    <p className="text-[9px] text-slate-500 leading-normal font-medium">Top-rated specialist in {city}. Guaranteed call and fast booking support.</p>
                    
                    <div className="flex gap-1.5 pt-1">
                      <button className="flex-1 bg-primary text-white text-[8px] font-black py-1.5 rounded-lg text-center cursor-pointer shadow-sm">Call Now</button>
                      <button className="flex-1 border border-primary/25 text-primary text-[8px] font-bold py-1.5 rounded-lg text-center">Inquire</button>
                    </div>
                  </div>

                  {/* Other listings */}
                  <div className="border border-slate-100 rounded-xl p-3 space-y-2 opacity-55">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">🏢</div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-800">Generic Competitor</span>
                        <span className="text-[9px] text-slate-400 font-bold">{category} • {city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats badges floating beside smartphone */}
              <div className="absolute -right-4 top-10 bg-white border border-slate-200 rounded-2xl p-3 shadow-lg flex items-center gap-2 animate-bounce duration-[4s]">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-black text-slate-900">1.5 Crore+</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Customers</span>
                </div>
              </div>

              <div className="absolute -left-4 bottom-10 bg-white border border-slate-200 rounded-2xl p-3 shadow-lg flex items-center gap-2 animate-bounce duration-[3.5s]">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-black text-slate-900">50 Lakh+</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Verified Partners</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Brand Ambassador Section */}
        <section className="mt-20 border-t border-slate-200/80 pt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4 text-left">
            <h3 className="font-serif text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
              India's Trusted Search & Growth Engine
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
              For over a decade, FindMyPoint has helped micro, small, and medium businesses scale locally. With advanced analytical matching and SEO priority indexes, our advertising system gets you the highest conversion rates possible.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-1">
                <span className="text-3xl font-black text-primary">10x</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average ROI Increase</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-primary">48 Hrs</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activation Guarantee</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-primary">24/7</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dedicated Ad Manager</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-gradient-to-br from-primary to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[4/3] text-left">
            <div className="absolute right-[-40px] bottom-[-20px] opacity-10 pointer-events-none">
              <Building2 className="h-64 w-64" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-4">
                <ShieldCheck className="h-3 w-3 text-accent" /> Verified Listing
              </div>
              <h4 className="text-lg font-black leading-tight uppercase tracking-tight">Need a custom enterprise campaign?</h4>
              <p className="text-[11px] text-white/70 mt-2 font-medium">Get custom enterprise solutions, national brand packages, and multi-location management support.</p>
            </div>
            <button 
              onClick={() => alert("Please call corporate relationship desk at 1800-FMP-GROW")}
              className="mt-6 w-full bg-accent hover:bg-accent/95 text-accent-foreground text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer shadow-md text-center"
            >
              Call 1800-FMP-GROW
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-400">
          <span>© 2026 FindMyPoint Ltd. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
