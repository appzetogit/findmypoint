import { useState, useEffect, useRef } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { API_BASE_URL } from "../config";
import { socketService } from "../services/socketService";
import PolicyPage from "./PolicyPage";

interface BottomLoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
  isMandatory?: boolean;
  onPrivacyPolicyClick?: () => void;
  onTermsConditionsClick?: () => void;
}

export default function BottomLoginPrompt({
  isOpen,
  onClose,
  onSuccess,
  isMandatory = false,
  onPrivacyPolicyClick,
  onTermsConditionsClick,
}: BottomLoginPromptProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [viewPolicy, setViewPolicy] = useState<"terms" | "privacy" | null>(null);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Resend OTP countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Focus first OTP input on transition
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    }
  }, [step]);

  if (!isOpen) return null;

  // Render in-modal Full Page View when T&C's or Privacy Policy is clicked
  if (viewPolicy) {
    return (
      <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col w-full h-full text-left overflow-hidden animate-fade-in">
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 sm:py-4 bg-white dark:bg-slate-900 shrink-0 shadow-xs z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setViewPolicy(null);
            }}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-sm cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="font-bold text-sm text-slate-800 dark:text-white">
            {viewPolicy === "terms" ? "Terms & Conditions" : "Privacy Policy"}
          </span>
          <div className="w-16" />
        </div>

        {/* Policy Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <PolicyPage initialTab={viewPolicy} />
          </div>
        </div>
      </div>
    );
  }

  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!agreeTerms) {
      setError("Please agree to the T&C's and Privacy Policy.");
      return;
    }

    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setStep("otp");
        setResendTimer(30);
        setSuccessMsg(data.message || "OTP sent successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("send-otp error:", err);
      setLoading(false);
      setError("Failed to connect to server. Please try again.");
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned && val !== "") return;

    const updated = [...otpValues];
    updated[index] = cleaned.slice(-1);
    setOtpValues(updated);

    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullOtp = otpValues.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, otp: fullOtp }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (data.isNewUser) {
          setStep("name");
          setSuccessMsg("Phone verified! Enter your name to complete sign in.");
        } else {
          const user = data.user;
          const userId = user.id || user._id;
          localStorage.setItem("fmp_user_token", data.token);
          localStorage.setItem("fmp_user", JSON.stringify({ _id: userId, id: userId, ...user }));
          if (userId) socketService.registerUser(userId);

          const personalData = {
            title: user.title || "Mr",
            firstName: user.firstName,
            middleName: user.middleName || "",
            lastName: user.lastName || "",
            dobDD: user.dobDD || "",
            dobMM: user.dobMM || "",
            dobYYYY: user.dobYYYY || "",
            maritalStatus: user.maritalStatus || "Single",
            occupation: user.occupation || "Employed",
            mobile1: user.mobile1,
            mobile2: user.mobile2 || user.mobile1,
            email: user.email || "",
            avatar: user.avatar || "",
          };
          localStorage.setItem("fmp_profile_personal:v1", JSON.stringify(personalData));
          onSuccess(user.firstName || "User");
          onClose();
        }
      } else {
        setError(data.message || "Invalid OTP code.");
      }
    } catch (err) {
      console.error("verify-otp error:", err);
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (fullName.trim().length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Mr.",
          firstName: fullName.trim(),
          middleName: "",
          lastName: "",
          mobile1: phoneNumber,
          mobile2: phoneNumber,
          email: email.trim() || `${phoneNumber}@findmypoint.in`,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const user = data.user;
        const userId = user.id || user._id;
        localStorage.setItem("fmp_user_token", data.token);
        localStorage.setItem("fmp_user", JSON.stringify({ _id: userId, id: userId, ...user }));
        if (userId) socketService.registerUser(userId);

        const personalData = {
          title: user.title || "Mr",
          firstName: user.firstName,
          middleName: user.middleName || "",
          lastName: user.lastName || "",
          dobDD: user.dobDD || "",
          dobMM: user.dobMM || "",
          dobYYYY: user.dobYYYY || "",
          maritalStatus: user.maritalStatus || "Single",
          occupation: user.occupation || "Employed",
          mobile1: user.mobile1,
          mobile2: user.mobile2 || user.mobile1,
          email: user.email || "",
          avatar: user.avatar || "",
        };
        localStorage.setItem("fmp_profile_personal:v1", JSON.stringify(personalData));
        onSuccess(user.firstName || fullName.trim());
        onClose();
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("register error:", err);
      setLoading(false);
      setError("Failed to register. Please try again.");
    }
  };

  const handleDismiss = () => {
    if (isMandatory) return;
    sessionStorage.setItem("fmp_bottom_login_dismissed", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in text-slate-900">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={isMandatory ? undefined : handleDismiss} />

      {/* Exact UI Bottom Sheet Container */}
      <div className="relative z-10 bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl w-full max-w-md mx-auto pt-7 pb-6 px-6 sm:px-8 text-center animate-in slide-in-from-bottom duration-300">
        {/* Back Button for OTP/Name Steps */}
        {step !== "phone" && (
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="absolute top-5 left-5 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center items-center">
          <img src={logoImg} alt="FindMyPoint" className="h-8 sm:h-9 w-auto object-contain" />
        </div>

        {/* Subtitle text */}
        <p className="text-[13.5px] text-[#707070] font-normal mt-2.5 mb-5 tracking-tight">
          {step === "phone" && "Login for a seamless experience"}
          {step === "otp" && `Enter 6-digit OTP sent to +91 ${phoneNumber}`}
          {step === "name" && "Complete your profile"}
        </p>

        {/* Errors / Success Alerts */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold text-center">
            {successMsg}
          </div>
        )}

        {/* STEP 1: Phone Number Input (Exact Justdial Style) */}
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="text-left">
            {/* Input Box with +91 & divider */}
            <div className="h-[54px] border border-[#d0d5dd] rounded-[14px] flex items-center px-4 bg-white focus-within:border-slate-800 transition">
              <span className="text-[15px] font-bold text-[#1a1a1a] pr-3 select-none shrink-0">
                +91
              </span>
              <div className="h-6 w-[1px] bg-[#e5e7eb] mr-3.5 shrink-0" />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Mobile Number"
                className="w-full text-[15px] font-normal text-[#1a1a1a] placeholder-[#8c8c8c] outline-none bg-transparent"
                autoFocus
              />
            </div>

            {/* Checkbox with T&C and Privacy Policy */}
            <div className="mt-4 mb-4 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded-[4px] accent-[#0076fe] cursor-pointer shrink-0"
              />
              <label htmlFor="agree-checkbox" className="text-[12px] text-[#737373] select-none cursor-pointer leading-tight">
                I Agree to{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewPolicy("terms");
                  }}
                  className="border-b border-dotted border-[#737373] text-[#737373] hover:text-[#0076fe] pb-[1px]"
                >
                  T&C's
                </button>{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewPolicy("privacy");
                  }}
                  className="border-b border-dotted border-[#737373] text-[#737373] hover:text-[#0076fe] pb-[1px]"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className="w-full h-[50px] bg-[#6b6b6b] hover:bg-[#595959] active:scale-[0.99] disabled:opacity-50 text-white text-[15px] font-bold rounded-[12px] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : "Continue"}
            </button>

            {/* Maybe Later */}
            {!isMandatory && (
              <div className="text-center mt-5 mb-1">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[13px] text-[#808080] hover:text-[#404040] font-normal transition cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="flex justify-center gap-2 pt-1">
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputsRef.current[idx] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="h-12 w-11 text-center text-lg font-bold border border-[#d0d5dd] rounded-xl bg-slate-50 text-slate-900 outline-none focus:border-slate-800"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-slate-500">
              <button
                type="button"
                onClick={() => handlePhoneSubmit()}
                disabled={resendTimer > 0 || loading}
                className="text-[#0076fe] font-semibold disabled:text-slate-400 cursor-pointer"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Change Number
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpValues.join("").length !== 6}
              className="w-full h-[50px] bg-[#6b6b6b] hover:bg-[#595959] active:scale-[0.99] disabled:opacity-50 text-white text-[15px] font-bold rounded-[12px] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : "Verify & Continue"}
            </button>

            {!isMandatory && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[13px] text-[#808080] hover:text-[#404040] font-normal transition cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </form>
        )}

        {/* STEP 3: Complete Profile */}
        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-[50px] px-4 border border-[#d0d5dd] rounded-[12px] text-sm font-semibold bg-white text-slate-900 outline-none focus:border-slate-800"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full h-[50px] px-4 border border-[#d0d5dd] rounded-[12px] text-sm font-semibold bg-white text-slate-900 outline-none focus:border-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading || fullName.trim().length < 2}
              className="w-full h-[50px] bg-[#6b6b6b] hover:bg-[#595959] active:scale-[0.99] disabled:opacity-50 text-white text-[15px] font-bold rounded-[12px] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : "Complete Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
