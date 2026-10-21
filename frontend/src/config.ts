// API configuration — dynamically detects live domain at runtime to avoid localhost hardcoding
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = (isBrowser && !isLocalhost)
  ? `${window.location.origin}/api`
  : ((import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api");

export const BACKEND_ORIGIN = (isBrowser && !isLocalhost)
  ? window.location.origin
  : ((import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:5000");

// Razorpay Key ID loaded strictly from env with no hardcoded fallback
export const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "";
export const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

let cachedRazorpayKey = "";
export const getRazorpayKey = async (): Promise<string> => {
  if (RAZORPAY_KEY_ID) return RAZORPAY_KEY_ID;
  if (cachedRazorpayKey) return cachedRazorpayKey;
  try {
    const res = await fetch(`${API_BASE_URL}/razorpay/key`);
    const data = await res.json();
    if (data?.success && data?.keyId) {
      cachedRazorpayKey = data.keyId;
      return cachedRazorpayKey;
    }
  } catch (err) {
    console.error("Failed to fetch Razorpay key from backend environment:", err);
  }
  return "";
};


