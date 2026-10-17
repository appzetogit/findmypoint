import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "findmypoint-66dc1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "findmypoint-66dc1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "findmypoint-66dc1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "101433815522",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

// Initialize Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let messagingInstance: Messaging | null = null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("⚠️ Firebase Messaging is not supported in this browser environment.");
      return null;
    }
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (error) {
    console.warn("⚠️ Error initializing Firebase Messaging:", error);
    return null;
  }
}
