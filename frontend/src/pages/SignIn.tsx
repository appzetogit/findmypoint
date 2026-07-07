import { useRef, useEffect, useReducer } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface SignInPageProps {
  onBack: () => void;
  onSuccess?: (username: string) => void;
}

interface SignInState {
  phoneNumber: string;
  otpSent: boolean;
  showNameInput: boolean;
  fullName: string;
  whatsappNumber: string;
  email: string;
  otpValues: string[];
  agreeToTerms: boolean;
  loading: boolean;
  error: string;
  success: string;
}

type SignInAction =
  | { type: "SET_PHONE_NUMBER"; value: string }
  | { type: "SET_OTP_SENT"; value: boolean }
  | { type: "SET_SHOW_NAME_INPUT"; value: boolean }
  | { type: "SET_FULL_NAME"; value: string }
  | { type: "SET_WHATSAPP_NUMBER"; value: string }
  | { type: "SET_EMAIL"; value: string }
  | { type: "SET_OTP_VALUES"; value: string[] }
  | { type: "SET_AGREE_TO_TERMS"; value: boolean }
  | { type: "SET_LOADING"; value: boolean }
  | { type: "SET_ERROR"; value: string }
  | { type: "SET_SUCCESS"; value: string }
  | { type: "RESET" };

const initialSignInState: SignInState = {
  phoneNumber: "",
  otpSent: false,
  showNameInput: false,
  fullName: "",
  whatsappNumber: "",
  email: "",
  otpValues: ["", "", "", "", "", ""],
  agreeToTerms: true,
  loading: false,
  error: "",
  success: "",
};

function signInReducer(state: SignInState, action: SignInAction): SignInState {
  switch (action.type) {
    case "SET_PHONE_NUMBER":
      return { ...state, phoneNumber: action.value };
    case "SET_OTP_SENT":
      return { ...state, otpSent: action.value };
    case "SET_SHOW_NAME_INPUT":
      return { ...state, showNameInput: action.value };
    case "SET_FULL_NAME":
      return { ...state, fullName: action.value };
    case "SET_WHATSAPP_NUMBER":
      return { ...state, whatsappNumber: action.value };
    case "SET_EMAIL":
      return { ...state, email: action.value };
    case "SET_OTP_VALUES":
      return { ...state, otpValues: action.value };
    case "SET_AGREE_TO_TERMS":
      return { ...state, agreeToTerms: action.value };
    case "SET_LOADING":
      return { ...state, loading: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_SUCCESS":
      return { ...state, success: action.value };
    case "RESET":
      return initialSignInState;
    default:
      return state;
  }
}

export default function SignInPage({ onBack, onSuccess }: SignInPageProps) {
  const [state, dispatch] = useReducer(signInReducer, initialSignInState);
  const {
    phoneNumber, otpSent, showNameInput, fullName,
    whatsappNumber, email, otpValues, agreeToTerms,
    loading, error, success,
  } = state;

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpSent && !showNameInput) {
      const timer = setTimeout(() => { otpInputsRef.current[0]?.focus(); }, 100);
      return () => clearTimeout(timer);
    }
  }, [otpSent, showNameInput]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_ERROR", value: "" });
    dispatch({ type: "SET_SUCCESS", value: "" });
    if (!agreeToTerms) {
      dispatch({ type: "SET_ERROR", value: "Please agree to the Terms & Conditions." });
      return;
    }
    const cleanedPhone = phoneNumber.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      dispatch({ type: "SET_ERROR", value: "Please enter a valid 10-digit mobile number." });
      return;
    }
    dispatch({ type: "SET_LOADING", value: true });
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      dispatch({ type: "SET_OTP_SENT", value: true });
      dispatch({ type: "SET_SUCCESS", value: "OTP code sent successfully!" });
      setTimeout(() => dispatch({ type: "SET_SUCCESS", value: "" }), 3000);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanedVal = value.replace(/\D/g, "");
    if (!cleanedVal && value !== "") return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = cleanedVal.slice(-1);
    dispatch({ type: "SET_OTP_VALUES", value: newOtpValues });
    if (cleanedVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_ERROR", value: "" });
    dispatch({ type: "SET_SUCCESS", value: "" });
    const fullOtp = otpValues.join("");
    if (fullOtp.length !== 6) {
      dispatch({ type: "SET_ERROR", value: "Please enter the complete 6-digit OTP." });
      return;
    }
    dispatch({ type: "SET_LOADING", value: true });
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      const existingUserMap: Record<string, string> = {
        "9876543210": "Tarun Pratap",
        "9999988888": "Raj Kalwani",
      };
      if (phoneNumber in existingUserMap) {
        dispatch({ type: "SET_SUCCESS", value: "Welcome back, " + existingUserMap[phoneNumber] + "!" });
        const personalData = {
          title: "Mr", firstName: existingUserMap[phoneNumber], middleName: "",
          lastName: "", dobDD: "", dobMM: "", dobYYYY: "",
          maritalStatus: "Single", occupation: "Employed",
          mobile1: phoneNumber, mobile2: phoneNumber, email: "", avatar: "",
        };
        localStorage.setItem("fmp_profile_personal:v1", JSON.stringify(personalData));
        setTimeout(() => { onSuccess?.(existingUserMap[phoneNumber]); }, 1200);
      } else {
        dispatch({ type: "SET_SUCCESS", value: "OTP verified! Welcome new user." });
        setTimeout(() => {
          dispatch({ type: "SET_SUCCESS", value: "" });
          dispatch({ type: "SET_WHATSAPP_NUMBER", value: phoneNumber });
          dispatch({ type: "SET_SHOW_NAME_INPUT", value: true });
        }, 1000);
      }
    }, 1200);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_ERROR", value: "" });
    dispatch({ type: "SET_SUCCESS", value: "" });
    if (fullName.trim().length < 2) {
      dispatch({ type: "SET_ERROR", value: "Please enter a valid name." });
      return;
    }
    if (whatsappNumber.trim().length !== 10) {
      dispatch({ type: "SET_ERROR", value: "Please enter a valid 10-digit WhatsApp number." });
      return;
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      dispatch({ type: "SET_ERROR", value: "Please enter a valid email address." });
      return;
    }
    dispatch({ type: "SET_LOADING", value: true });
    const personalData = {
      title: "Mr", firstName: fullName.trim(), middleName: "",
      lastName: "", dobDD: "", dobMM: "", dobYYYY: "",
      maritalStatus: "Single", occupation: "Employed",
      mobile1: phoneNumber, mobile2: whatsappNumber, email: email.trim(), avatar: "",
    };
    localStorage.setItem("fmp_profile_personal:v1", JSON.stringify(personalData));
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      dispatch({ type: "SET_SUCCESS", value: "Account created successfully!" });
      setTimeout(() => { onSuccess?.(fullName.trim()); }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-0 md:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[420px] md:rounded-[36px] md:shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:border md:border-slate-100/80 flex flex-col bg-white overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Close button - visible only on desktop */}
        <button
          onClick={onBack}
          className="hidden md:flex absolute top-4 right-4 z-30 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

      {/* ── CORAL PINK DECORATIVE HERO ── */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #ffb3ae 0%, #f4626a 45%, #e8556a 100%)',
          minHeight: '35%',
        }}
      >
        {/* Wavy topographic SVG lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-40 260 Q80 190 180 240 Q280 290 400 220 Q480 170 540 200" stroke="rgba(255,255,255,0.20)" strokeWidth="2.5" fill="none"/>
          <path d="M-40 230 Q70 160 180 205 Q290 250 410 185 Q490 135 550 165" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none"/>
          <path d="M-40 195 Q90 125 190 170 Q295 215 415 148 Q495 100 555 128" stroke="rgba(255,255,255,0.11)" strokeWidth="1.5" fill="none"/>
          <path d="M-40 160 Q100 90 200 138 Q305 185 420 112 Q500 65 558 92" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none"/>
          <path d="M-20 285 Q90 225 200 265 Q310 305 430 245 Q510 200 560 225" stroke="rgba(255,255,255,0.13)" strokeWidth="2" fill="none"/>
          {/* Sparkle stars */}
          <path d="M55 75 L57.5 68 L60 75 L67 77.5 L60 80 L57.5 87 L55 80 L48 77.5 Z" fill="rgba(255,255,255,0.80)"/>
          <path d="M315 55 L317 50 L319 55 L324 57 L319 59 L317 64 L315 59 L310 57 Z" fill="rgba(255,255,255,0.70)"/>
          <path d="M340 170 L341.5 165.5 L343 170 L347.5 171.5 L343 173 L341.5 177.5 L340 173 L335.5 171.5 Z" fill="rgba(255,255,255,0.65)"/>
          <circle cx="248" cy="115" r="2.5" fill="rgba(255,255,255,0.55)"/>
          <circle cx="82" cy="175" r="1.8" fill="rgba(255,255,255,0.50)"/>
          <path d="M198 35 L199.5 31 L201 35 L205 36.5 L201 38 L199.5 42 L198 38 L194 36.5 Z" fill="rgba(255,255,255,0.60)"/>
        </svg>


        {/* White organic wave at bottom — single large sweep matching reference */}
        <svg
          className="absolute bottom-0 left-0 w-full h-28"
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <path
            d="M0 120 L0 55 C 100 25, 280 105, 400 95 L400 120 Z"
            fill="white"
          />
        </svg>
      </div>


      {/* ── FORM PANEL ── */}
      <div className="relative flex-1 flex flex-col overflow-y-auto bg-white px-7 pt-6 pb-16">

        {/* Alerts */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs font-bold text-rose-600 mb-5 animate-in slide-in-from-top-2 duration-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs font-bold text-emerald-600 mb-5 animate-in slide-in-from-top-2 duration-200">
            {success}
          </div>
        )}

        {/* ── STATE 1: Phone Input ── */}
        {!otpSent ? (
          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-6">
            {/* Logo in white section */}
            <div className="flex justify-center mb-1">
              <img src={logoImg} alt="FindMyPoint Logo" className="h-10 w-auto object-contain" />
            </div>

            {/* Heading */}
            <div className="mb-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign in</h2>
              <div className="mt-1.5 w-10 h-1 rounded-full bg-[#f4626a]" />
            </div>

            {/* Mobile Number — underline style */}
            <div className="flex flex-col gap-1">
              <label htmlFor="signInPhone" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Mobile Number
              </label>
              <div className="flex items-center gap-3 pb-2.5 border-b-2 border-slate-200 focus-within:border-[#f4626a] transition-colors duration-200">
                <span className="text-sm font-black text-slate-700 select-none shrink-0">+91</span>
                <div className="w-px h-4 bg-slate-200 shrink-0" />
                <input
                  id="signInPhone"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter mobile number"
                  value={phoneNumber}
                  onChange={(e) => dispatch({ type: "SET_PHONE_NUMBER", value: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 cursor-pointer select-none -mt-1">
              <div className="relative flex items-center justify-center shrink-0">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => dispatch({ type: "SET_AGREE_TO_TERMS", value: e.target.checked })}
                  className="peer h-4 w-4 border-2 border-slate-300 rounded bg-white checked:bg-[#f4626a] checked:border-[#f4626a] transition-all cursor-pointer appearance-none"
                />
                <Check className="absolute h-2.5 w-2.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span>I agree to Terms and Conditions</span>
            </label>

            {/* Login button — coral */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm font-bold py-4 rounded-full transition-all duration-300 hover:opacity-90 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-[0_8px_24px_rgba(244,98,106,0.40)]"
              style={{ background: 'linear-gradient(135deg, #ff8a80 0%, #f4626a 100%)' }}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Login with OTP"}
            </button>
          </form>

        ) : !showNameInput ? (
          /* ── STATE 2: OTP Verification ── */
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="mb-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify OTP</h2>
              <div className="mt-1.5 w-10 h-1 rounded-full bg-[#f4626a]" />
              <p className="text-xs text-slate-400 font-medium mt-2">
                6-digit code sent to <span className="font-extrabold text-slate-700">+91 {phoneNumber}</span>
              </p>
            </div>

            <div className="flex justify-center gap-2.5 my-3">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={val}
                  aria-label={`Digit ${idx + 1}`}
                  ref={(el) => { otpInputsRef.current[idx] = el; }}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-11 border-2 border-slate-200 rounded-xl text-center text-lg font-black text-slate-800 bg-slate-50/50 outline-none focus:border-[#f4626a] focus:bg-white focus:ring-4 focus:ring-[#f4626a]/10 transition-all duration-200"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm font-bold py-4 rounded-full transition-all duration-300 hover:opacity-90 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_8px_24px_rgba(244,98,106,0.40)]"
              style={{ background: 'linear-gradient(135deg, #ff8a80 0%, #f4626a 100%)' }}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Verify & Login"}
            </button>

            <div className="flex justify-between items-center text-[11px] font-bold px-1 -mt-2">
              <button type="button" onClick={() => dispatch({ type: "SET_OTP_SENT", value: false })}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer">
                Change Number
              </button>
              <button type="button"
                onClick={() => {
                  dispatch({ type: "SET_SUCCESS", value: "OTP resent successfully!" });
                  setTimeout(() => dispatch({ type: "SET_SUCCESS", value: "" }), 3000);
                }}
                className="text-[#f4626a] hover:underline cursor-pointer">
                Resend OTP
              </button>
            </div>
          </form>

        ) : (
          /* ── STATE 3: Registration ── */
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="mb-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Profile</h2>
              <div className="mt-1.5 w-10 h-1 rounded-full bg-[#f4626a]" />
              <p className="text-xs text-slate-400 font-medium mt-2">
                Complete your registration for <span className="font-extrabold text-slate-700">+91 {phoneNumber}</span>
              </p>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="signInFullName" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <div className="pb-2.5 border-b-2 border-slate-200 focus-within:border-[#f4626a] transition-colors duration-200">
                <input id="signInFullName" type="text" placeholder="Enter your full name" value={fullName}
                  onChange={(e) => dispatch({ type: "SET_FULL_NAME", value: e.target.value })}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300"
                  required autoFocus />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col gap-1">
              <label htmlFor="signInWhatsapp" className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp Number</label>
              <div className="flex items-center gap-3 pb-2.5 border-b-2 border-slate-200 focus-within:border-[#f4626a] transition-colors duration-200">
                <span className="text-sm font-black text-slate-700 select-none shrink-0">+91</span>
                <div className="w-px h-4 bg-slate-200 shrink-0" />
                <input id="signInWhatsapp" type="tel" maxLength={10} placeholder="WhatsApp number" value={whatsappNumber}
                  onChange={(e) => dispatch({ type: "SET_WHATSAPP_NUMBER", value: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300"
                  required />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="signInEmail" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email (Optional)</label>
              <div className="pb-2.5 border-b-2 border-slate-200 focus-within:border-[#f4626a] transition-colors duration-200">
                <input id="signInEmail" type="email" placeholder="Enter email address" value={email}
                  onChange={(e) => dispatch({ type: "SET_EMAIL", value: e.target.value })}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-white text-sm font-bold py-4 rounded-full transition-all duration-300 hover:opacity-90 active:scale-[0.98] cursor-pointer flex items-center justify-center disabled:opacity-50 mt-1 shadow-[0_8px_24px_rgba(244,98,106,0.40)]"
              style={{ background: 'linear-gradient(135deg, #ff8a80 0%, #f4626a 100%)' }}>
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Save & Continue"}
            </button>
          </form>
        )}

      </div>

      {/* ── Secure Verification ── */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none z-20">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] text-slate-400 font-bold">Secure Verification</span>
      </div>
    </div>
  </div>
  );
}
