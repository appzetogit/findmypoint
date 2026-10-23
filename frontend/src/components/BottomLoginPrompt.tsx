import { useState } from "react";
import { Loader2, ArrowLeft, User } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { API_BASE_URL } from "../config";
import { socketService } from "../services/socketService";
import { fcmService } from "../services/fcmService";
import { isApkEnvironment } from "../utils/apkDetection";
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
}: BottomLoginPromptProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [viewPolicy, setViewPolicy] = useState<"terms" | "privacy" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleDirectLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanedPhone = phoneNumber.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setError("Name should only contain letters.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the T&C's and Privacy Policy.");
      return;
    }

    setLoading(true);

    // Request / Fetch FCM device token in background
    let fcmToken: string | null = null;
    try {
      fcmToken = await fcmService.requestAndGetFcmToken();
    } catch (e) {
      console.warn("FCM token fetch in direct-login non-fatal:", e);
    }

    const deviceType = isApkEnvironment() ? "android-apk" : (window.innerWidth < 768 ? "mobile-web" : "desktop-web");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/direct-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanedPhone,
          name: trimmedName,
          fcmToken: fcmToken || undefined,
          device: deviceType,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.user) {
        const user = data.user;
        const userId = user.id || user._id;

        // Persist token and user state
        if (data.token) {
          localStorage.setItem("fmp_user_token", data.token);
        }
        localStorage.setItem("fmp_user", JSON.stringify({ _id: userId, id: userId, ...user }));

        // Register socket
        if (userId) {
          socketService.registerUser(userId);
        }

        // Sync FCM token if fetched
        if (fcmToken) {
          fcmService.syncFcmTokenWithBackend(fcmToken).catch(() => {});
        }

        // Profile cache
        const personalData = {
          title: user.title || "Mr",
          firstName: user.firstName || trimmedName,
          middleName: user.middleName || "",
          lastName: user.lastName || "",
          dobDD: user.dobDD || "",
          dobMM: user.dobMM || "",
          dobYYYY: user.dobYYYY || "",
          maritalStatus: user.maritalStatus || "Single",
          occupation: user.occupation || "Employed",
          mobile1: user.mobile1 || cleanedPhone,
          mobile2: user.mobile2 || user.mobile1 || cleanedPhone,
          email: user.email || "",
          avatar: user.avatar || "",
        };
        localStorage.setItem("fmp_profile_personal:v1", JSON.stringify(personalData));

        // Trigger storage event for live sync across all tabs and components
        window.dispatchEvent(new Event("storage"));

        setSuccessMsg(`Welcome, ${user.firstName || trimmedName}!`);
        setTimeout(() => {
          onSuccess(user.firstName || trimmedName);
          onClose();
        }, 500);
      } else {
        setError(data.message || "Failed to log in. Please try again.");
      }
    } catch (err) {
      console.error("direct-login error:", err);
      setLoading(false);
      setError("Network error. Please check your connection and try again.");
    }
  };

  const handleDismiss = () => {
    if (isMandatory) return;
    sessionStorage.setItem("fmp_bottom_login_dismissed", "true");
    onClose();
  };

  const isFormValid = phoneNumber.replace(/\D/g, "").length === 10 && fullName.trim().length >= 2 && agreeTerms;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in text-slate-900">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={isMandatory ? undefined : handleDismiss} />

      {/* Bottom Sheet Container */}
      <div
        className="relative z-10 bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl w-full max-w-md mx-auto pt-4 sm:pt-7 px-6 sm:px-8 text-center animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: "max(2.75rem, env(safe-area-inset-bottom, 42px))" }}
      >
        {/* Grab Handle for Mobile */}
        <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        {/* Logo */}
        <div className="flex justify-center items-center">
          <img src={logoImg} alt="FindMyPoint" className="h-8 sm:h-9 w-auto object-contain" />
        </div>

        {/* Subtitle text */}
        <p className="text-[13.5px] text-[#707070] font-normal mt-2.5 mb-5 tracking-tight">
          Login for a seamless experience
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

        {/* Form: Mobile Number + Name */}
        <form onSubmit={handleDirectLogin} className="text-left space-y-3.5">
          {/* Input Box 1: Phone Number */}
          <div className="h-[54px] border border-[#d0d5dd] rounded-[14px] flex items-center px-4 bg-white focus-within:border-slate-800 transition">
            <span className="text-[15px] font-bold text-[#1a1a1a] pr-3 select-none shrink-0">
              +91
            </span>
            <div className="h-6 w-[1px] bg-[#e5e7eb] mr-3.5 shrink-0" />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Mobile Number"
              className="w-full text-[15px] font-normal text-[#1a1a1a] placeholder-[#8c8c8c] outline-none bg-transparent"
              autoFocus
            />
          </div>

          {/* Input Box 2: Full Name */}
          <div className="h-[54px] border border-[#d0d5dd] rounded-[14px] flex items-center px-4 bg-white focus-within:border-slate-800 transition">
            <User className="h-4.5 w-4.5 text-[#8c8c8c] mr-3 shrink-0" />
            <input
              type="text"
              required
              value={fullName}
              onKeyDown={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value
                  .replace(/[^a-zA-Z\s]/g, "")
                  .replace(/^\s+/, "")
                  .replace(/\s{2,}/g, " ");
                setFullName(val);
              }}
              placeholder="Enter Your Name"
              className="w-full text-[15px] font-normal text-[#1a1a1a] placeholder-[#8c8c8c] outline-none bg-transparent"
            />
          </div>

          {/* Checkbox with T&C and Privacy Policy */}
          <div className="pt-1 pb-1 flex items-center justify-center gap-2">
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

          {/* Continue / Login Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full h-[50px] text-white text-[15px] font-bold rounded-[12px] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
              isFormValid && !loading
                ? "bg-slate-900 hover:bg-black active:scale-[0.99]"
                : "bg-[#a3a3a3] cursor-not-allowed opacity-75"
            }`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              "Continue"
            )}
          </button>

          {/* Maybe Later */}
          {!isMandatory && (
            <div className="text-center pt-2 pb-1">
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
      </div>
    </div>
  );
}
