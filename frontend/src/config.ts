// API configuration — automatically falls back to window.location.origin in production
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultOrigin = isBrowser && !isLocalhost ? window.location.origin : "http://localhost:5000";

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || `${defaultOrigin}/api`;
export const BACKEND_ORIGIN = (import.meta as any).env?.VITE_BACKEND_ORIGIN || defaultOrigin;
export const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_S3IcSS1NbymL6D";
export const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAwpVPep0GHMOJ8C43UJSqUIMX-KvBf3rA";

