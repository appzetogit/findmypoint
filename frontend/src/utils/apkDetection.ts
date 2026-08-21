/**
 * Detects whether the current session is running inside the FindMyPoint Android APK / WebView / Native wrapper
 * vs. a standard mobile/desktop web browser.
 */

export function isApkEnvironment(): boolean {
  if (typeof window === "undefined") return false;

  const win = window as any;
  const userAgent = (navigator.userAgent || navigator.vendor || win.opera || "").toLowerCase();
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

  // 2. Check JavaScript Bridge / Injected Native Objects (Highest reliability)
  if (
    win.Android ||
    win.FindMyPoint ||
    win.findmypoint ||
    win.FMPApp ||
    win.fmpApp ||
    win.ReactNativeWebView ||
    win.Capacitor ||
    win.Cordova ||
    win._isNativeApp ||
    win.isFmpApk
  ) {
    return true;
  }

  // 3. Custom APK markers in User-Agent
  if (
    userAgent.includes("findmypoint") ||
    userAgent.includes("fmpapp") ||
    userAgent.includes("fmp-apk") ||
    userAgent.includes("fmpmobile")
  ) {
    return true;
  }

  // 4. Android WebView marker: "; wv" in Android Chrome UA
  const isAndroidWebView = isAndroid && (userAgent.includes("; wv") || /version\/[0-9.]+\s+chrome\/[0-9.]+\s+mobile/i.test(userAgent));
  if (isAndroidWebView) {
    return true;
  }

  // 5. Standalone PWA / TWA mode on Android
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true;
  if (isStandalone && isAndroid) {
    return true;
  }

  // 6. Check persistent flag from localStorage ONLY IF on Android
  try {
    if (isAndroid && localStorage.getItem("fmp_is_apk") === "true") {
      return true;
    } else if (!isAndroid) {
      // Clean up stale flag on desktop browser
      localStorage.removeItem("fmp_is_apk");
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  return false;
}
