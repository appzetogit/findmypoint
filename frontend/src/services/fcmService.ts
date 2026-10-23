import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging, VAPID_KEY } from "../config/firebase";
import { API_BASE_URL } from "../config";
import { isApkEnvironment } from "../utils/apkDetection";

class FCMService {
  private currentToken: string | null = null;
  private isRequesting = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.currentToken = localStorage.getItem("fmp_fcm_token");
      this.initApkListeners();
      this.checkUrlForFcmToken();
    }
  }

  /**
   * Listen for token events sent from Android APK Native code (WebView JavascriptInterface, postMessage, global functions)
   */
  private initApkListeners() {
    if (typeof window === "undefined") return;
    const win = window as any;

    // 1. Global handler functions exposed to Android Native code
    // Android can call: webView.evaluateJavascript("window.setFcmToken('" + token + "')", null);
    const handleNativeTokenReceive = (token: string, source: string = "apk-native") => {
      if (!token || typeof token !== "string" || !token.trim()) return;
      const cleanToken = token.trim();
      console.log(`📱 [FCM APK Bridge] Received token via ${source}`);
      this.currentToken = cleanToken;
      localStorage.setItem("fmp_fcm_token", cleanToken);
      localStorage.setItem("fmp_fcm_token_apk", cleanToken);
      localStorage.setItem("fmp_is_apk", "true");
      window.dispatchEvent(new Event("fmp-apk-detected"));

      // If user is already logged in, immediately sync to backend as APK device
      if (localStorage.getItem("fmp_user_token")) {
        this.syncFcmTokenWithBackend(cleanToken, "apk").catch((err) => {
          console.warn("Auto-syncing APK token failed:", err);
        });
      }
    };

    win.setFcmToken = (token: string) => handleNativeTokenReceive(token, "window.setFcmToken");
    win.setApkFcmToken = (token: string) => handleNativeTokenReceive(token, "window.setApkFcmToken");
    win.onReceiveFcmToken = (token: string) => handleNativeTokenReceive(token, "window.onReceiveFcmToken");
    win.updateFcmToken = (token: string) => handleNativeTokenReceive(token, "window.updateFcmToken");

    // 2. Listen for window postMessage from native wrappers (Cordova, Capacitor, React Native, custom WebView)
    window.addEventListener("message", (event) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Not a JSON string
          }
        }
        if (data && typeof data === "object") {
          if (data.type === "FCM_TOKEN" || data.type === "SET_FCM_TOKEN" || data.event === "fcm_token") {
            const token = data.token || data.fcmToken || data.data;
            if (token && typeof token === "string") {
              handleNativeTokenReceive(token, "postMessage");
            }
          }
        }
      } catch (e) {
        // Ignore message parse errors
      }
    });

    // 3. Listen for custom events
    window.addEventListener("fmp-apk-fcm-token", (event: any) => {
      if (event?.detail && typeof event.detail === "string") {
        handleNativeTokenReceive(event.detail, "custom-event");
      }
    });
  }

  /**
   * Check if FCM token was passed via URL query parameter (e.g. on APK deep link / launch)
   */
  private checkUrlForFcmToken() {
    if (typeof window === "undefined") return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl =
        urlParams.get("fcmToken") ||
        urlParams.get("fcm_token") ||
        urlParams.get("apkFcmToken") ||
        urlParams.get("device_token");

      if (tokenFromUrl && tokenFromUrl.trim()) {
        const cleanToken = tokenFromUrl.trim();
        this.currentToken = cleanToken;
        localStorage.setItem("fmp_fcm_token", cleanToken);
        localStorage.setItem("fmp_fcm_token_apk", cleanToken);
        console.log("📱 [FCM APK] Token detected from URL parameter");
      }
    } catch (e) {
      // Ignore URL parse errors
    }
  }

  /**
   * Check if web push notifications are supported by the browser
   */
  public isNotificationSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }

  /**
   * Check if native Android APK bridge provides an FCM token
   */
  private getNativeBridgeToken(): string | null {
    if (typeof window === "undefined") return null;
    const win = window as any;

    try {
      if (typeof win.Android?.getFcmToken === "function") {
        return win.Android.getFcmToken() || null;
      }
      if (typeof win.FindMyPoint?.getFcmToken === "function") {
        return win.FindMyPoint.getFcmToken() || null;
      }
      if (typeof win.findmypoint?.getFcmToken === "function") {
        return win.findmypoint.getFcmToken() || null;
      }
      if (typeof win.FMPApp?.getFcmToken === "function") {
        return win.FMPApp.getFcmToken() || null;
      }
      if (typeof win.fmpApp?.getFcmToken === "function") {
        return win.fmpApp.getFcmToken() || null;
      }
      if (typeof win.App?.getFcmToken === "function") {
        return win.App.getFcmToken() || null;
      }
      if (typeof win.NativeBridge?.getFcmToken === "function") {
        return win.NativeBridge.getFcmToken() || null;
      }
      if (win.FCM_TOKEN && typeof win.FCM_TOKEN === "string") {
        return win.FCM_TOKEN;
      }
      if (win._nativeFcmToken && typeof win._nativeFcmToken === "string") {
        return win._nativeFcmToken;
      }
      if (win.apkFcmToken && typeof win.apkFcmToken === "string") {
        return win.apkFcmToken;
      }
      const cachedApkToken = localStorage.getItem("fmp_fcm_token_apk");
      if (cachedApkToken) {
        return cachedApkToken;
      }
    } catch (e) {
      console.warn("⚠️ Native bridge token fetch error:", e);
    }
    return null;
  }

  /**
   * Request permission and obtain the FCM registration token (supports both APK and Web)
   */
  public async requestAndGetFcmToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;

    // 1. If running in APK or bridge token is available, return APK token
    const nativeToken = this.getNativeBridgeToken();
    if (nativeToken) {
      this.currentToken = nativeToken;
      localStorage.setItem("fmp_fcm_token", nativeToken);
      localStorage.setItem("fmp_fcm_token_apk", nativeToken);
      return nativeToken;
    }

    // 2. Check browser web push support
    if (!this.isNotificationSupported()) {
      return this.currentToken || null;
    }

    if (this.isRequesting) {
      return this.currentToken || null;
    }

    this.isRequesting = true;
    try {
      // 3. Request Notification permission
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        console.log(`ℹ️ Push notification permission: ${permission}`);
        this.isRequesting = false;
        return this.currentToken || null;
      }

      // 4. Register Service Worker
      let swRegistration: ServiceWorkerRegistration | undefined;
      try {
        swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        });
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn("⚠️ Service Worker registration failed:", swErr);
      }

      // 5. Get Firebase Messaging instance
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        this.isRequesting = false;
        return this.currentToken || null;
      }

      // 6. Obtain FCM token
      const tokenOptions: { vapidKey?: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = {};
      if (VAPID_KEY && VAPID_KEY.trim().length > 0) {
        tokenOptions.vapidKey = VAPID_KEY.trim();
      }
      if (swRegistration) {
        tokenOptions.serviceWorkerRegistration = swRegistration;
      }

      const token = await getToken(messaging, tokenOptions);

      if (token) {
        this.currentToken = token;
        localStorage.setItem("fmp_fcm_token", token);
        console.log("✅ [FCM Web] Token obtained successfully");
        this.isRequesting = false;
        return token;
      }
    } catch (error: any) {
      console.warn("⚠️ [FCM] Could not obtain token (non-fatal):", error?.message || error);
    } finally {
      this.isRequesting = false;
    }

    return this.currentToken || null;
  }

  /**
   * Return cached FCM token from memory or localStorage
   */
  public getStoredToken(): string | null {
    if (!this.currentToken && typeof window !== "undefined") {
      this.currentToken = localStorage.getItem("fmp_fcm_token");
    }
    return this.currentToken;
  }

  /**
   * Send the FCM token to backend for currently logged in user
   * Automatically sets device to 'apk' or 'web'
   */
  public async syncFcmTokenWithBackend(tokenParam?: string, deviceParam?: string): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const authToken = localStorage.getItem("fmp_user_token");
    if (!authToken) return false;

    const tokenToSync = tokenParam || this.getStoredToken();
    if (!tokenToSync) return false;

    const deviceType = deviceParam || (isApkEnvironment() ? "apk" : "web");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/fcm-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fcmToken: tokenToSync,
          device: deviceType,
        }),
      });

      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.warn("⚠️ Failed to sync FCM token with backend:", err);
      return false;
    }
  }

  /**
   * Remove token from backend when user logs out
   */
  public async removeFcmTokenFromBackend(): Promise<void> {
    if (typeof window === "undefined") return;

    const authToken = localStorage.getItem("fmp_user_token");
    const currentToken = this.getStoredToken();

    if (authToken && currentToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/fcm-token`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ fcmToken: currentToken }),
        });
      } catch (e) {
        // Ignore network errors on logout
      }
    }

    this.currentToken = null;
    localStorage.removeItem("fmp_fcm_token");
    localStorage.removeItem("fmp_fcm_token_apk");
  }

  /**
   * Listen for foreground messages while app is open
   */
  public async onForegroundMessage(callback: (payload: MessagePayload) => void): Promise<(() => void) | null> {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    return onMessage(messaging, (payload) => {
      console.log("🔔 [FCM Foreground Message]:", payload);
      callback(payload);
    });
  }
}

export const fcmService = new FCMService();
