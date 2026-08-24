// API configuration — set VITE_API_BASE_URL in .env for production deployments
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api";
export const BACKEND_ORIGIN = (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:5000";
export const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_S3IcSS1NbymL6D";
export const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAwpVPep0GHMOJ8C43UJSqUIMX-KvBf3rA";
