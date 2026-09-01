import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Sparkles,
  Search,
  CheckCircle2,
  Loader2,
  Building2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  Info,
  Clock,
} from "lucide-react";
import { LazyImage } from "../ui/LazyImage";
import logoImg from "@/assets/logo.png";
import { getCurrentUserLocation, reverseGeocodeCoords, geocodeLocation } from "../../utils/googleMaps";
import { API_BASE_URL } from "../../config";

interface MandatoryLocationModalProps {
  isOpen: boolean;
  onLocationConfirmed: (locationData: {
    lat: number;
    lng: number;
    city: string;
    area: string;
    shortName: string;
    formattedAddress: string;
  }) => void;
}

export const MandatoryLocationModal: React.FC<MandatoryLocationModalProps> = ({
  isOpen,
  onLocationConfirmed,
}) => {
  const [detecting, setDetecting] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [successLocation, setSuccessLocation] = useState<string | null>(null);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const hasAutoTriggeredRef = useRef(false);

  // Dynamically load real registered business locations & recent user locations
  useEffect(() => {
    let list: string[] = [];
    try {
      const recents = localStorage.getItem("fmp_recent_locations:v1");
      if (recents) {
        const parsed = JSON.parse(recents);
        if (Array.isArray(parsed)) list.push(...parsed);
      }
    } catch {}

    fetch(`${API_BASE_URL}/businesses`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          data.data.forEach((b: any) => {
            const loc = b.location || b.cityTown || b.district;
            if (loc && !list.includes(loc)) {
              list.push(loc);
            }
          });
        }
        setAvailableLocations(list.slice(0, 10));
      })
      .catch(() => {
        setAvailableLocations(list.slice(0, 10));
      });
  }, []);

  const handleDetectGPS = useCallback(async () => {
    setDetecting(true);
    setErrorMessage("");
    setIsBlocked(false);

    try {
      if (typeof window === "undefined" || !navigator.geolocation) {
        setErrorMessage("Geolocation is not supported by your browser. Please search your city below.");
        setDetecting(false);
        return;
      }

      const pos = await getCurrentUserLocation();
      if (!pos) {
        setIsBlocked(true);
        setErrorMessage("Location access was blocked or timed out. Please allow location in browser settings or type your city below.");
        setDetecting(false);
        return;
      }

      const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
      const detectedCity = geocoded?.city || "";
      const detectedArea = geocoded?.area || "";
      const shortName = geocoded?.shortName || (detectedArea && detectedCity ? `${detectedArea}, ${detectedCity}` : detectedCity) || geocoded?.formattedAddress || "My Location";
      const fullAddress = geocoded?.formattedAddress || shortName;

      setSuccessLocation(shortName);

      setTimeout(() => {
        onLocationConfirmed({
          lat: pos.lat,
          lng: pos.lng,
          city: detectedCity,
          area: detectedArea,
          shortName,
          formattedAddress: fullAddress,
        });
      }, 700);
    } catch (err) {
      console.error("[MandatoryLocation] GPS detection error:", err);
      setIsBlocked(true);
      setErrorMessage("Could not detect location automatically. Please search your city below or allow location.");
    } finally {
      setDetecting(false);
    }
  }, [onLocationConfirmed]);

  // Auto-detect GPS on initial open & listen for live permission unblock in browser
  useEffect(() => {
    if (isOpen && !hasAutoTriggeredRef.current) {
      hasAutoTriggeredRef.current = true;
      handleDetectGPS();
    }

    if (typeof navigator !== "undefined" && (navigator as any).permissions) {
      (navigator as any).permissions
        .query({ name: "geolocation" })
        .then((perm: any) => {
          if (perm.state === "denied") {
            setIsBlocked(true);
          }
          perm.onchange = () => {
            if (perm.state === "granted" || perm.state === "prompt") {
              setIsBlocked(false);
              setErrorMessage("");
              handleDetectGPS();
            } else if (perm.state === "denied") {
              setIsBlocked(true);
            }
          };
        })
        .catch(() => {});
    }
  }, [isOpen, handleDetectGPS]);

  const handleSelectArea = async (areaName: string) => {
    setDetecting(true);
    setErrorMessage("");

    try {
      const coords = await geocodeLocation(areaName);
      const lat = coords?.lat || 0;
      const lng = coords?.lng || 0;

      setSuccessLocation(areaName);

      setTimeout(() => {
        onLocationConfirmed({
          lat,
          lng,
          city: areaName.includes(",") ? areaName.split(",")[1].trim() : areaName,
          area: areaName.includes(",") ? areaName.split(",")[0].trim() : "",
          shortName: areaName,
          formattedAddress: areaName,
        });
      }, 500);
    } catch (err) {
      console.warn("Geocoding failed for manual selection:", err);
      onLocationConfirmed({
        lat: 0,
        lng: 0,
        city: areaName,
        area: "",
        shortName: areaName,
        formattedAddress: areaName,
      });
    } finally {
      setDetecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden text-card-foreground my-auto animate-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className={`relative ${isBlocked ? 'bg-linear-to-br from-amber-600 via-amber-500 to-orange-600' : 'bg-linear-to-br from-primary via-primary/95 to-blue-600'} p-6 text-white text-center flex flex-col items-center transition-colors duration-300`}>
          <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full border border-white animate-ping" style={{ animationDuration: "3s" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <LazyImage
              src={logoImg}
              alt="FindMyPoint"
              priority={true}
              showSkeleton={false}
              className="h-8 w-auto bg-white/90 px-3 py-1 rounded-xl shadow-md"
              imgClassName="h-7 w-auto object-contain"
            />

            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center text-white mt-1">
              {successLocation ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-300 animate-bounce" />
              ) : detecting ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : isBlocked ? (
                <AlertCircle className="h-8 w-8 text-amber-100 animate-pulse" />
              ) : (
                <Navigation className="h-7 w-7 text-white fill-white/80 transform rotate-12" />
              )}
            </div>

            <h2 className="text-xl font-black tracking-tight text-white mt-1">
              {successLocation
                ? "Location Set!"
                : isBlocked
                ? "Location Blocked / Denied"
                : "Set Your Location to Continue"}
            </h2>
            <p className="text-xs text-white/85 max-w-xs leading-relaxed">
              {successLocation
                ? `📍 ${successLocation}`
                : isBlocked
                ? "Location permission ban/block hai. Kripya permission allow karein ya 'Detect Again' dabayein."
                : "To discover verified shops, restaurants, doctors, and real distance near you, location is required."}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-left">
          {/* Success State */}
          {successLocation ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center animate-in fade-in">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                ✨ Location confirmed: {successLocation}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                Loading nearby businesses for you...
              </p>
            </div>
          ) : (
            <>
              {/* Primary GPS Auto-Detect Button */}
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={detecting}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-75"
              >
                {detecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Detecting GPS Location...</span>
                  </>
                ) : isBlocked ? (
                  <>
                    <RotateCw className="h-4 w-4" />
                    <span>Try Detect Again (Fir Se Permission Maange)</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 fill-current" />
                    <span>Auto-Detect Live GPS Location</span>
                  </>
                )}
              </button>

              {/* Error / Permission Blocked Guidance */}
              {isBlocked && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Agar Location Ban / Block ho gayi hai toh:</span>
                  </div>
                  <ol className="list-decimal list-inside pl-1 space-y-1 text-[11px] text-muted-foreground">
                    <li>URL bar me <b>(i)</b> ya <b>Lock 🔒</b> icon par click karein.</li>
                    <li><b>Location</b> ko <b>Allow (ON)</b> karein ya <b>"Reset permissions"</b> dabayein.</li>
                    <li>Upar diye gaye <b>"Try Detect Again"</b> button par click karein.</li>
                  </ol>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-border"></div>
                <span className="shrink mx-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Or enter your city
                </span>
                <div className="grow border-t border-border"></div>
              </div>

              {/* Manual Search Input */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-secondary/50 focus-within:border-primary focus-within:bg-card transition-all">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualQuery.trim()) {
                      handleSelectArea(manualQuery.trim());
                    }
                  }}
                  placeholder="Type your area or city..."
                  className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground text-foreground min-w-0"
                />
                {manualQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelectArea(manualQuery.trim())}
                    className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition cursor-pointer"
                  >
                    Set
                  </button>
                )}
              </div>

              {/* Dynamic Available Locations if present */}
              {availableLocations.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Available Locations:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableLocations.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleSelectArea(area)}
                        className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground border border-border text-xs font-semibold text-foreground transition-all cursor-pointer text-left"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MandatoryLocationModal;
