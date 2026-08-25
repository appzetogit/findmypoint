// API configuration — dynamically detects live domain at runtime to avoid localhost hardcoding
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = (isBrowser && !isLocalhost)
  ? `${window.location.origin}/api`
  : ((import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api");

export const BACKEND_ORIGIN = (isBrowser && !isLocalhost)
  ? window.location.origin
  : ((import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:5000");

export const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_S3IcSS1NbymL6D";
export const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAwpVPep0GHMOJ8C43UJSqUIMX-KvBf3rA";


