import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Sparkles,
  Compass,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { getCurrentUserLocation, reverseGeocodeCoords } from "../../utils/googleMaps";

export interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted: (locationData: {
    lat: number;
    lng: number;
    city: string;
    area: string;
    shortName: string;
    formattedAddress: string;
  }) => void;
  onOpenManualCitySelector: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onLocationGranted,
  onOpenManualCitySelector,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "detecting" | "success" | "denied">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [detectedName, setDetectedName] = useState("");

  const handleEnableLocation = useCallback(async () => {
    setStatus("detecting");
    setLoading(true);
    setErrorMessage("");

    try {
      if (typeof window === "undefined" || !navigator.geolocation) {
        setStatus("denied");
        setErrorMessage("Geolocation is not supported by your browser.");
        setLoading(false);
        return;
      }

      // Request browser location
      const pos = await getCurrentUserLocation();

      if (!pos) {
        setStatus("denied");
        setErrorMessage("Location toggle browser me OFF/Blocked hai. Kripya use ON karein.");
        setLoading(false);
        return;
      }

      // Reverse geocode to get city & neighborhood
      const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
      const detectedCity = geocoded?.city || "Indore";
      const detectedArea = geocoded?.area || "";
      const shortName = geocoded?.shortName || (detectedArea ? `${detectedArea}, ${detectedCity}` : detectedCity);
      const fullAddress = geocoded?.formattedAddress || shortName;

      setDetectedName(shortName);
      setStatus("success");

      // Save to localStorage
      try {
        localStorage.setItem(
          "fmp_user_coords:v1",
          JSON.stringify({
            lat: pos.lat,
            lng: pos.lng,
            city: detectedCity,
            area: detectedArea,
            shortName,
            formattedAddress: fullAddress,
          })
        );
        localStorage.setItem("fmp_selected_city:v1", shortName);
        localStorage.removeItem("fmp_location_prompt_dismissed:v1");
      } catch {
        // Ignore storage errors
      }

      // Notify parent after brief success animation
      setTimeout(() => {
        onLocationGranted({
          lat: pos.lat,
          lng: pos.lng,
          city: detectedCity,
          area: detectedArea,
          shortName,
          formattedAddress: fullAddress,
        });
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("[LocationModal] Error detecting location:", err);
      setStatus("denied");
      setErrorMessage("Could not determine your location. Please turn on Location in browser or choose your city manually.");
    } finally {
      setLoading(false);
    }
  }, [onClose, onLocationGranted]);

  // Check initial browser permission state & listen for live changes
  useEffect(() => {
    if (!isOpen) return;

    if (typeof navigator !== "undefined" && (navigator as any).permissions) {
      (navigator as any).permissions
        .query({ name: "geolocation" })
        .then((permission: any) => {
          if (permission.state === "denied") {
            setStatus("denied");
          } else if (permission.state === "granted") {
            handleEnableLocation();
          }

          // Listen for when user toggles permission ON in Chrome site settings
          permission.onchange = () => {
            if (permission.state === "granted") {
              handleEnableLocation();
            } else if (permission.state === "denied") {
              setStatus("denied");
            }
          };
        })
        .catch(() => {});
    }
  }, [isOpen, handleEnableLocation]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    try {
      const expireTime = Date.now() + 2 * 24 * 60 * 60 * 1000;
      localStorage.setItem("fmp_location_prompt_dismissed:v1", expireTime.toString());
    } catch {
      // Ignore localStorage errors
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden z-10 text-card-foreground transform transition-all duration-300 scale-100 animate-in zoom-in-95">
        {/* Top Decorative Banner */}
        <div className={`relative h-28 ${status === 'denied' ? 'bg-linear-to-br from-amber-600 via-amber-500 to-orange-600' : 'bg-linear-to-br from-primary/90 via-primary to-blue-600'} flex items-center justify-center overflow-hidden transition-colors duration-300`}>
          {/* Animated Background Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <div className="w-48 h-48 rounded-full border border-white animate-ping" style={{ animationDuration: "3s" }} />
            <div className="w-32 h-32 rounded-full border border-white animate-pulse" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Center Icon with Pulse */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center text-white">
                {status === "success" ? (
                  <CheckCircle2 className="h-9 w-9 text-emerald-300 animate-bounce" />
                ) : status === "detecting" ? (
                  <Loader2 className="h-9 w-9 text-white animate-spin" />
                ) : status === "denied" ? (
                  <AlertCircle className="h-9 w-9 text-amber-100 animate-pulse" />
                ) : (
                  <Navigation className="h-8 w-8 text-white fill-white/80 transform rotate-12" />
                )}
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status === 'denied' ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 ${status === 'denied' ? 'bg-amber-500' : 'bg-emerald-500'} border-2 border-white`}></span>
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Texts */}
          <div className="text-center space-y-1.5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status === 'denied' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-primary/10 text-primary'} text-[11px] font-bold tracking-wide uppercase`}>
              {status === 'denied' ? <SlidersHorizontal className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              <span>{status === 'denied' ? 'Browser Permission Required' : 'Hyperlocal Discovery'}</span>
            </div>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">
              {status === "success"
                ? "Location Detected!"
                : status === "denied"
                ? "Location Toggle is OFF in Browser"
                : "Find the Best Services Near You"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-1">
              {status === "success" ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  📍 {detectedName}
                </span>
              ) : status === "denied" ? (
                "Aapke browser me is website ke liye location permission Block / OFF hai. Ise enable karne ke liye niche diye steps follow karein:"
              ) : (
                "Allow location access to get accurate distances, verified local doctors, restaurants, shops, and deals near your doorstep."
              )}
            </p>
          </div>

          {/* Success State View */}
          {status === "success" && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center animate-in fade-in">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                ✨ Successfully updated your location to <span className="underline">{detectedName}</span>.
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                Refreshing nearby recommendations...
              </p>
            </div>
          )}

          {/* Denied / OFF State: Visual Step-by-step Guide */}
          {status === "denied" && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left space-y-2.5 animate-in fade-in">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-600 shrink-0" />
                <span>How to Enable Location in Chrome:</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>Browser URL bar me <b>(i)</b> ya <b>Lock 🔒</b> icon par click karein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span><b>Location</b> toggle switch ko <b>ON (Blue)</b> karein ya <b>"Reset permissions"</b> dabayein.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>Niche <b>"Try GPS Again"</b> par click karein.</span>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Grid (Only shown when idle) */}
          {status === "idle" && (
            <div className="grid grid-cols-3 gap-2.5 py-1">
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-center flex flex-col items-center gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Real Distance
                </span>
                <span className="text-[9px] text-muted-foreground">e.g. 1.2 km away</span>
              </div>

              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-center flex flex-col items-center gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Compass className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Nearby Shops
                </span>
                <span className="text-[9px] text-muted-foreground">In your area</span>
              </div>

              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-center flex flex-col items-center gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-foreground leading-tight">
                  Verified Only
                </span>
                <span className="text-[9px] text-muted-foreground">100% Safe</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {status !== "success" && (
              <button
                type="button"
                onClick={handleEnableLocation}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Detecting Live GPS...</span>
                  </>
                ) : status === "denied" ? (
                  <>
                    <RotateCw className="h-4 w-4" />
                    <span>Try GPS Again (After Turning ON)</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 fill-current" />
                    <span>Allow Location Access</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleDismiss();
                onOpenManualCitySelector();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-secondary/60 hover:bg-secondary text-secondary-foreground font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-border/60"
            >
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Select City / Area Manually</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
            </button>

            {status !== "success" && (
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition cursor-pointer"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
