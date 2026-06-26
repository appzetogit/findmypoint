import { useState, useRef, useEffect, useReducer } from "react";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
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
    phoneNumber,
    otpSent,
    showNameInput,
    fullName,
    otpValues,
    agreeToTerms,
    loading,
    error,
    success,
  } = state;

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP field when OTP is sent
  useEffect(() => {
    if (otpSent && !showNameInput) {
      const timer = setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
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
    // Simulate sending OTP
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      dispatch({ type: "SET_OTP_SENT", value: true });
      dispatch({ type: "SET_SUCCESS", value: "OTP code sent successfully!" });
      setTimeout(() => dispatch({ type: "SET_SUCCESS", value: "" }), 3000);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanedVal = value.replace(/\D/g, "");
    if (!cleanedVal && value !== "") return; // only allow digits
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = cleanedVal.slice(-1);
    dispatch({ type: "SET_OTP_VALUES", value: newOtpValues });

    // Auto-focus next input
    if (cleanedVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace back-focus
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
    // Simulate verification
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      
      // Mock existing registered numbers database
      const existingUserMap: Record<string, string> = {
        "9876543210": "Tarun Pratap",
        "9999988888": "Raj Kalwani"
      };

      if (phoneNumber in existingUserMap) {
        // User exists, log them in immediately
        dispatch({ type: "SET_SUCCESS", value: "Welcome back, " + existingUserMap[phoneNumber] + "!" });
        setTimeout(() => {
          onSuccess?.(existingUserMap[phoneNumber]);
        }, 1200);
      } else {
        // New user registration flow
        dispatch({ type: "SET_SUCCESS", value: "OTP verified! Welcome new user." });
        setTimeout(() => {
          dispatch({ type: "SET_SUCCESS", value: "" });
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

    dispatch({ type: "SET_LOADING", value: true });
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      dispatch({ type: "SET_SUCCESS", value: "Account created successfully!" });
      setTimeout(() => {
        onSuccess?.(fullName.trim());
      }, 1200);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    dispatch({ type: "SET_LOADING", value: true });
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", value: false });
      dispatch({ type: "SET_SUCCESS", value: `Successfully signed in with ${provider}!` });
      setTimeout(() => {
        onSuccess?.(`${provider} User`);
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[8px] p-4 transition-all duration-500 animate-in fade-in">
      
      {/* Glow Effects Behind the Modal */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-pulse" style={{ top: '25%', left: '35%' }} />
      <div className="absolute w-[250px] h-[250px] rounded-full bg-accent/20 blur-[90px] pointer-events-none animate-pulse" style={{ bottom: '25%', right: '35%', animationDelay: '1.5s' }} />

      {/* Modal Container */}
      <div className="relative w-full max-w-[580px] bg-white/95 rounded-[32px] shadow-[0_32px_80px_rgba(15,23,42,0.18)] p-6 sm:p-10 flex flex-col border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Ambient Top Glow Border inside modal */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#0086ff] to-transparent opacity-80" />

        {/* Header with Logo and Welcome */}
        <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="flex h-10 shrink-0 items-center justify-center transition-transform hover:scale-105 duration-300">
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-full w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
          <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
          <div className="flex flex-col">
            <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome
            </h3>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-wide uppercase">
              Login for a seamless experience
            </p>
          </div>
        </div>

        {/* Alerts with Fade-in animations */}
        {error && (
          <div className="bg-rose-50/80 border border-rose-150 p-4 rounded-2xl text-xs font-bold text-rose-600 mb-6 animate-in slide-in-from-top-2 duration-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50/80 border border-emerald-150 p-4 rounded-2xl text-xs font-bold text-emerald-600 mb-6 animate-in slide-in-from-top-2 duration-200">
            {success}
          </div>
        )}

        {/* Dynamic Forms (1: Phone Input, 2: OTP Entry, 3: Name Registration) */}
        {!otpSent ? (
          /* State 1: Mobile Phone Submission */
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            
            {/* Input mobile field with premium styling */}
            <div className="relative group">
              <label htmlFor="signInPhone" className="absolute left-4 top-[-8px] bg-white px-2 text-[10px] font-bold text-slate-400 group-focus-within:text-primary transition-colors uppercase tracking-wider">
                Enter Mobile Number
              </label>
              <div className="flex items-center border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50/30 group-focus-within:bg-white group-focus-within:border-primary group-focus-within:ring-4 group-focus-within:ring-primary/10 transition-all duration-300">
                <span className="text-[15px] font-extrabold text-slate-800 select-none mr-3">
                  +91
                </span>
                <div className="h-5 w-[1px] bg-slate-200 mr-3" />
                <input
                  id="signInPhone"
                  type="tel"
                  maxLength={10}
                  placeholder="Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => dispatch({ type: "SET_PHONE_NUMBER", value: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className="w-full bg-transparent text-[15px] font-bold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-semibold"
                  required
                />
              </div>
            </div>

            {/* Checkbox agreement with interactive layout */}
            <label className="flex items-start gap-3.5 text-[11px] font-semibold text-slate-500 cursor-pointer select-none group">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => dispatch({ type: "SET_AGREE_TO_TERMS", value: e.target.checked })}
                  className="peer h-5 w-5 border border-slate-200 rounded-lg bg-white checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer appearance-none shadow-sm group-hover:border-slate-350"
                />
                <Check className="absolute h-3.5 w-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="group-hover:text-slate-700 transition-colors">I Agree to Terms and Conditions</span>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert("Showing Privacy Policy details..."); }}
                  className="text-primary hover:text-primary-hover font-extrabold mt-1 block transition-colors"
                >
                  T&C's Privacy Policy
                </a>
              </div>
            </label>

            {/* OTP Button with hover scaling and ambient shadow */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0062ff] to-[#008cff] hover:from-[#0051d4] hover:to-[#007ce0] text-white text-xs font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_6px_20px_rgba(0,98,255,0.25)] hover:shadow-[0_8px_25px_rgba(0,98,255,0.35)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Login with OTP"
              )}
            </button>
          </form>
        ) : !showNameInput ? (
          /* State 2: OTP Verification Form with Premium Boxes */
          <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">
                Verify Mobile Number
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">
                Enter the 6-digit OTP code sent to <span className="font-extrabold text-slate-800">+91 {phoneNumber}</span>
              </p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between gap-1.5 sm:gap-3 my-4">
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
                  className="w-9 h-11 sm:w-12 sm:h-14 border border-slate-200 rounded-xl sm:rounded-2xl text-center text-lg sm:text-xl font-extrabold text-slate-900 bg-slate-50/50 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-sm"
                  required
                />
              ))}
            </div>

            {/* OTP Buttons */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0062ff] to-[#008cff] hover:from-[#0051d4] hover:to-[#007ce0] text-white text-xs font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_6px_20px_rgba(0,98,255,0.25)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </button>
              <div className="flex justify-between items-center text-[11px] font-bold px-1">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_OTP_SENT", value: false })}
                  className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "SET_SUCCESS", value: "OTP resent successfully!" });
                    setTimeout(() => dispatch({ type: "SET_SUCCESS", value: "" }), 3000);
                  }}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* State 3: Name Registration Form for New Users */
          <form onSubmit={handleNameSubmit} className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">
                Create Your Profile
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">
                It looks like this is your first time here! Tell us your Full Name to complete registration for <span className="font-extrabold text-slate-800">+91 {phoneNumber}</span>
              </p>
            </div>

            {/* Full Name field with premium styling */}
            <div className="relative group">
              <label htmlFor="signInFullName" className="absolute left-4 top-[-8px] bg-white px-2 text-[10px] font-bold text-slate-400 group-focus-within:text-primary transition-colors uppercase tracking-wider">
                Full Name
              </label>
              <div className="flex items-center border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50/30 group-focus-within:bg-white group-focus-within:border-primary group-focus-within:ring-4 group-focus-within:ring-primary/10 transition-all duration-300">
                <input
                  id="signInFullName"
                  type="text"
                  placeholder="Enter Full Name"
                  value={fullName}
                  onChange={(e) => dispatch({ type: "SET_FULL_NAME", value: e.target.value })}
                  className="w-full bg-transparent text-[15px] font-bold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-semibold"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0062ff] to-[#008cff] hover:from-[#0051d4] hover:to-[#007ce0] text-white text-xs font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_6px_20px_rgba(0,98,255,0.25)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Save & Continue"
              )}
            </button>
          </form>
        )}

        {/* Social Dividers & Login (Only show when not in Name Registration flow) */}
        {!showNameInput && (
          <>
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative bg-white px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Or Login Using
              </span>
            </div>

            {/* Social Buttons with Ambient Hover */}
            <button
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-3 border border-slate-200/80 bg-white hover:bg-slate-50/50 rounded-2xl py-3.5 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 hover:scale-[1.005] hover:shadow-md cursor-pointer w-full"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.015c1.558 0 2.977.587 4.07 1.55l3.14-3.14A9.97 9.97 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12c0 5.523 4.477 10 9.99 10 5.766 0 10.01-4.054 10.01-10 0-.585-.054-1.17-.16-1.715H12.24Z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {/* Footer Navigation */}
        <div className="mt-10 pt-5 border-t border-slate-100/80 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-extrabold text-slate-400 hover:text-slate-600 transition cursor-pointer hover:underline"
          >
            Skip & Explore
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure Verification</span>
          </div>
        </div>

      </div>
    </div>
  );
}
