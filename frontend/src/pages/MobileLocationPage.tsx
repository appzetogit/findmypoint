import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  Search,
  Crosshair,
  MapPin,
  X,
  Loader2,
  Navigation,
  Building2,
  Globe,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  loadGoogleMapsScript,
  getCurrentUserLocation,
  reverseGeocodeCoords,
} from "../utils/googleMaps";
import { API_BASE_URL } from "../config";

interface MobileLocationPageProps {
  onBack: () => void;
  selectedCity: string;
  onSelectLocation: (location: string) => void;
}

interface LocationSuggestion {
  title: string;
  subtitle?: string;
  fullAddress: string;
}

export default function MobileLocationPage({
  onBack,
  selectedCity,
  onSelectLocation,
}: MobileLocationPageProps) {
  const [query, setQuery] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<LocationSuggestion[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fmp_recent_locations:v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Auto-focus location search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real registered business locations
  useEffect(() => {
    fetch(`${API_BASE_URL}/businesses`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const list: string[] = [];
          data.data.forEach((b: any) => {
            const loc = b.location || b.cityTown || b.district;
            if (loc && !list.includes(loc)) {
              list.push(loc);
            }
          });
          setAvailableLocations(list);
        }
      })
      .catch(() => {});
  }, []);

  // Live Location Search via Google Places / Nominatim
  useEffect(() => {
    if (!query.trim()) {
      setApiSuggestions([]);
      setIsSearchingOnline(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchLocationsOnline(query.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const searchLocationsOnline = async (searchQuery: string) => {
    setIsSearchingOnline(true);
    try {
      const isLoaded = await loadGoogleMapsScript();
      if (isLoaded && (window as any).google?.maps?.places?.AutocompleteService) {
        const service = new (window as any).google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: searchQuery,
            componentRestrictions: { country: "in" },
            types: ["geocode", "establishment"],
          },
          (predictions: any[], status: any) => {
            if (
              status === (window as any).google.maps.places.PlacesServiceStatus.OK &&
              predictions?.length
            ) {
              const formatted: LocationSuggestion[] = predictions.map((p) => ({
                title: p.structured_formatting?.main_text || p.description,
                subtitle: p.structured_formatting?.secondary_text || "",
                fullAddress: p.description,
              }));
              setApiSuggestions(formatted);
            } else {
              fallbackToNominatim(searchQuery);
            }
            setIsSearchingOnline(false);
          }
        );
        return;
      }

      await fallbackToNominatim(searchQuery);
    } catch {
      await fallbackToNominatim(searchQuery);
    }
  };

  const fallbackToNominatim = async (searchQuery: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery
      )}&format=json&countrycodes=in&addressdetails=1&limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const formatted: LocationSuggestion[] = data.map((item: any) => {
          const addr = item.address || {};
          const main =
            addr.suburb ||
            addr.neighbourhood ||
            addr.road ||
            addr.city ||
            addr.town ||
            item.display_name.split(",")[0];
          const parts = item.display_name.split(",").slice(1).map((s: string) => s.trim());
          return {
            title: main,
            subtitle: parts.slice(0, 2).join(", "),
            fullAddress: item.display_name,
          };
        });
        setApiSuggestions(formatted);
      } else {
        setApiSuggestions([]);
      }
    } catch {
      setApiSuggestions([]);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Live GPS Location Detection
  const handleDetectLocation = async () => {
    setDetectingGps(true);
    setGpsError(null);
    try {
      const pos = await getCurrentUserLocation();
      if (!pos) {
        setGpsError("Location access was blocked or unavailable. Please enable location in browser settings or type a city above.");
        setDetectingGps(false);
        return;
      }

      const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
      const detectedCity = geocoded?.city || "";
      const detectedArea = geocoded?.area || "";
      const shortName =
        geocoded?.shortName ||
        (detectedArea && detectedCity ? `${detectedArea}, ${detectedCity}` : detectedCity) ||
        geocoded?.formattedAddress ||
        "My Location";

      onSelectLocation(shortName);
    } catch (err) {
      console.warn("GPS Detection error:", err);
      setGpsError("Failed to detect live GPS. Please enter your location above.");
    } finally {
      setDetectingGps(false);
    }
  };

  const handlePickLocation = (loc: string) => {
    try {
      const updated = [loc, ...recentLocations.filter((l) => l !== loc)].slice(0, 5);
      localStorage.setItem("fmp_recent_locations:v1", JSON.stringify(updated));
    } catch {}
    onSelectLocation(loc);
  };

  // Filter dynamic local matches from registered businesses and recents
  const localMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = [...recentLocations, ...availableLocations];
    const unique = Array.from(new Set(all));
    return unique.filter((l) => l.toLowerCase().includes(q)).slice(0, 8);
  }, [query, recentLocations, availableLocations]);

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col text-foreground overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-3 py-2.5 flex items-center justify-between gap-2 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-secondary text-foreground transition-colors cursor-pointer shrink-0"
          title="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <h2 className="text-base font-bold text-foreground truncate flex-1 text-left pl-2">
          Your Location
        </h2>
      </header>

      {/* Location Search Input */}
      <div className="px-4 pt-3 pb-3 bg-background border-b border-border/60">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-border bg-card shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any city, area or locality..."
            className="flex-1 bg-transparent text-sm md:text-base outline-none placeholder:text-muted-foreground text-foreground min-w-0"
          />

          {isSearchingOnline && (
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          )}

          {query && !isSearchingOnline && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="h-6 w-6 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer shrink-0"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Location Action & Lists */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-left">
        {/* Detect my location button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detectingGps}
          className="w-full flex items-center gap-3 py-2 text-primary font-bold text-sm hover:opacity-80 transition cursor-pointer disabled:opacity-50"
        >
          {detectingGps ? (
            <Loader2 className="h-5 w-5 animate-spin shrink-0 text-primary" />
          ) : (
            <Crosshair className="h-5 w-5 shrink-0 text-primary" />
          )}
          <span>{detectingGps ? "Detecting GPS location..." : "Detect my location"}</span>
        </button>

        {/* GPS Error Guidance */}
        {gpsError && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{gpsError}</p>
          </div>
        )}

        {/* State A: EMPTY QUERY -> Show Selected City & Recent / Available Areas */}
        {!query.trim() && (
          <div className="space-y-4">
            {/* Anywhere in Selected City */}
            {selectedCity && (
              <button
                type="button"
                onClick={() => handlePickLocation(selectedCity)}
                className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-secondary/50 rounded-xl transition cursor-pointer group"
              >
                <MapPin className="h-5 w-5 text-foreground/80 group-hover:text-primary shrink-0" />
                <span className="text-sm font-bold text-foreground group-hover:text-primary">
                  Anywhere in {selectedCity}
                </span>
              </button>
            )}

            {/* Recent Locations Section */}
            {recentLocations.length > 0 && (
              <div className="pt-2 border-t border-border/60 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Recent Locations
                </h4>
                <div className="divide-y divide-border/60">
                  {recentLocations.slice(0, 5).map((loc, idx) => (
                    <button
                      key={`recent-${idx}`}
                      type="button"
                      onClick={() => handlePickLocation(loc)}
                      className="w-full py-3 flex items-center gap-3 hover:bg-secondary/50 text-left transition cursor-pointer group"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {loc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Areas Section */}
            {availableLocations.length > 0 && (
              <div className="pt-2 border-t border-border/60 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Available Areas
                </h4>
                <div className="divide-y divide-border/60">
                  {availableLocations.slice(0, 8).map((area, idx) => (
                    <button
                      key={`area-${idx}`}
                      type="button"
                      onClick={() => handlePickLocation(area)}
                      className="w-full py-3 flex items-center gap-3 hover:bg-secondary/50 text-left transition cursor-pointer group"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {area}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* State B: NON-EMPTY QUERY -> Show Dynamic Matches Anywhere */}
        {query.trim() && (
          <div className="space-y-3">
            {/* 1. Local Registered Business Matches */}
            {localMatches.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>Local Matches</span>
                </h4>
                <div className="divide-y divide-border/60">
                  {localMatches.map((loc, idx) => (
                    <button
                      key={`local-${idx}`}
                      type="button"
                      onClick={() => handlePickLocation(loc)}
                      className="w-full py-2.5 px-2 flex items-center gap-3 hover:bg-secondary/60 rounded-xl text-left transition cursor-pointer group"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {loc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Live API Results from Google Maps / Nominatim */}
            {apiSuggestions.length > 0 && (
              <div className="space-y-1 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-1 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span>Matching Locations</span>
                </h4>
                <div className="divide-y divide-border/60">
                  {apiSuggestions.map((item, idx) => (
                    <button
                      key={`api-${idx}`}
                      type="button"
                      onClick={() => handlePickLocation(item.fullAddress)}
                      className="w-full py-2.5 px-2 flex items-start gap-3 hover:bg-secondary/60 rounded-xl text-left transition cursor-pointer group"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Direct Query Pick */}
            <button
              type="button"
              onClick={() => handlePickLocation(query.trim())}
              className="w-full py-3 px-3 rounded-2xl bg-secondary/40 hover:bg-primary/10 border border-border flex items-center gap-3 text-left transition cursor-pointer group mt-2"
            >
              <Search className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-bold text-foreground group-hover:text-primary">
                Set location to "{query.trim()}"
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
