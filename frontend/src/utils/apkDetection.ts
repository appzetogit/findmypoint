/**
 * Detects whether the current session is running inside the FindMyPoint Android APK / WebView / Native wrapper
 * vs. a standard mobile/desktop web browser.
 */

export function isApkEnvironment(): boolean {
  if (typeof window === "undefined") return false;

  const win = window as any;
  const nav = navigator as any;
  const userAgent = (nav.userAgent || nav.vendor || win.opera || "").toLowerCase();
  const isAndroid = userAgent.includes("android");

  // 1. Check URL parameters for explicit app flags
  try {
    const urlParams = new URLSearchParams(window.location.search);

    // Explicit disable (for testing web browser mode)
    if (
      urlParams.get("apk") === "false" ||
      urlParams.get("web") === "true" ||
      urlParams.get("source") === "web"
    ) {
      localStorage.removeItem("fmp_is_apk");
      return false;
    }

    // Explicit enable (e.g., opened via APK URL or developer testing ?apk=true)
    if (
      urlParams.get("apk") === "true" ||
      urlParams.get("apk") === "1" ||
      urlParams.get("isApp") === "true" ||
      urlParams.get("isApp") === "1" ||
      urlParams.get("app") === "true" ||
      urlParams.get("app") === "1" ||
      urlParams.get("source") === "apk" ||
      urlParams.get("source") === "app" ||
      urlParams.get("platform") === "apk" ||
      urlParams.get("platform") === "android"
    ) {
      localStorage.setItem("fmp_is_apk", "true");
      return true;
    }
  } catch (e) {
    // Ignore URL parse errors
  }

  // 2. Check persistent flag from localStorage
  try {
    if (localStorage.getItem("fmp_is_apk") === "true" || localStorage.getItem("fmp_fcm_token_apk")) {
      return true;
    }
  } catch (e) {}

  // 3. Check JavaScript Bridge / Injected Native Objects (Highest reliability)
  if (
    win.Android ||
    win.android ||
    win.FindMyPoint ||
    win.findmypoint ||
    win.FMPApp ||
    win.fmpApp ||
    win.FMP ||
    win.fmp ||
    win.isFmpApk ||
    win.isApk ||
    win.apk ||
    win._isNativeApp ||
    win.ReactNativeWebView ||
    win.Capacitor ||
    win.Cordova ||
    win.Native ||
    win.native ||
    win.NativeApp ||
    win.nativeApp ||
    win.JSBridge ||
    win.jsBridge ||
    win.AndroidBridge ||
    win.androidBridge ||
    win.AndroidInterface ||
    win.androidInterface ||
    win.flutter_inappwebview ||
    win.gonative ||
    win.median ||
    win.webviewgold ||
    win.appsgeyser ||
    win.appmaker ||
    win.appilix ||
    (win.webkit && win.webkit.messageHandlers)
  ) {
    try { localStorage.setItem("fmp_is_apk", "true"); } catch (e) {}
    return true;
  }

  // 4. Custom APK markers in User-Agent
  if (
    userAgent.includes("findmypoint") ||
    userAgent.includes("fmpapp") ||
    userAgent.includes("fmp-apk") ||
    userAgent.includes("fmpmobile")
  ) {
    try { localStorage.setItem("fmp_is_apk", "true"); } catch (e) {}
    return true;
  }

  // 5. Chromium User-Agent Client Hints (Android WebView brand check)
  try {
    const brands = nav.userAgentData?.brands;
    if (Array.isArray(brands)) {
      const isWebView = brands.some((b: any) =>
        typeof b.brand === "string" && (
          b.brand.toLowerCase().includes("webview") ||
          b.brand.toLowerCase().includes("android webview")
        )
      );
      if (isWebView) {
        try { localStorage.setItem("fmp_is_apk", "true"); } catch (e) {}
        return true;
      }
    }
  } catch (e) {}

  // 6. Android WebView markers in User-Agent
  if (isAndroid) {
    // Check for Android WebView markers:
    // 1) "; wv" or ";wv" or "(wv)" or isolated word "wv"
    // 2) "version/X.X" (ONLY present in Android WebViews, never in regular mobile Chrome!)
    const hasWv = userAgent.includes("; wv") || userAgent.includes(";wv") || userAgent.includes(" wv)") || /\bwv\b/i.test(userAgent);
    const hasVersion = userAgent.includes("version/") && userAgent.includes("chrome");
    if (hasWv || hasVersion) {
      try { localStorage.setItem("fmp_is_apk", "true"); } catch (e) {}
      return true;
    }
  }

  // 7. Standalone / Fullscreen / Minimal-UI Display Mode (PWA, TWA, WebAPK on Android)
  try {
    const isStandalone =
      (window.matchMedia && (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches
      )) ||
      nav.standalone === true;

    if (isStandalone && isAndroid) {
      try { localStorage.setItem("fmp_is_apk", "true"); } catch (e) {}
      return true;
    }
  } catch (e) {}

  // 8. Document Referrer from Android App
  try {
    if (
      document.referrer &&
      document.referrer.startsWith("android-app://") &&
      !document.referrer.includes("googlequicksearchbox") &&
      !document.referrer.includes("com.google.android.googlequicksearchbox")
    ) {
      try { localStorage.setItem("fmp_is_apk", "true"); } catch (e) {}
      return true;
    }
  } catch (e) {}

  // 9. Missing window.chrome in an Android Chrome UA (indicates custom WebView)
  if (isAndroid && userAgent.includes("chrome") && !win.chrome) {
    try { localStorage.setItem("fmp_is_apk", "true"); } catch (e) {}
    return true;
  }

  return false;
}
