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
} from "lucide-react";
import {
  loadGoogleMapsScript,
  getCurrentUserLocation,
  reverseGeocodeCoords,
} from "../utils/googleMaps";

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

// Popular locations and areas in Indore & MP
const INDORE_AREAS = [
  "Vijay Nagar, Indore",
  "Bhawar Kuan, Indore",
  "Khajrana, Indore",
  "Sudama Nagar, Indore",
  "Mhow, Indore",
  "MG Road, Indore",
  "New Palasia, Indore",
  "Kanadia Road, Indore",
  "Rau, Indore",
  "Navlakha, Indore",
  "Old Palasia, Indore",
  "Annapurna, Indore",
  "Rajwada, Indore",
  "Geeta Bhawan, Indore",
  "Sapna Sangeeta, Indore",
  "AB Road, Indore",
  "Scheme 54, Indore",
  "Scheme 78, Indore",
  "Mahalaxmi Nagar, Indore",
  "Chhoti Gwaltoli, Indore",
  "Bada Sarafa, Indore",
  "LIG Colony, Indore",
  "Bypass Road, Indore",
  "Airport Road, Indore",
  "Bicholi Mardana, Indore",
  "Super Corridor, Indore",
  "Khandwa Road, Indore",
];

const MAJOR_INDIAN_CITIES = [
  "Indore, Madhya Pradesh",
  "Bhopal, Madhya Pradesh",
  "Ujjain, Madhya Pradesh",
  "Dewas, Madhya Pradesh",
  "Gwalior, Madhya Pradesh",
  "Jabalpur, Madhya Pradesh",
  "Ratlam, Madhya Pradesh",
  "Khandwa, Madhya Pradesh",
  "Pithampur, Madhya Pradesh",
  "Sagar, Madhya Pradesh",
  "Satna, Madhya Pradesh",
  "Rewa, Madhya Pradesh",
  "Mumbai, Maharashtra",
  "Pune, Maharashtra",
  "Nagpur, Maharashtra",
  "Navi Mumbai, Maharashtra",
  "Thane, Maharashtra",
  "Delhi, NCR",
  "New Delhi, NCR",
  "Noida, Uttar Pradesh",
  "Greater Noida, Uttar Pradesh",
  "Gurgaon (Gurugram), Haryana",
  "Faridabad, Haryana",
  "Ghaziabad, Uttar Pradesh",
  "Bangalore (Bengaluru), Karnataka",
  "Mysore, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Coimbatore, Tamil Nadu",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
  "Surat, Gujarat",
  "Vadodara, Gujarat",
  "Rajkot, Gujarat",
  "Jaipur, Rajasthan",
  "Udaipur, Rajasthan",
  "Jodhpur, Rajasthan",
  "Kota, Rajasthan",
  "Chandigarh, Punjab",
  "Ludhiana, Punjab",
  "Amritsar, Punjab",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Varanasi, Uttar Pradesh",
  "Agra, Uttar Pradesh",
  "Prayagraj (Allahabad), Uttar Pradesh",
  "Patna, Bihar",
  "Ranchi, Jharkhand",
  "Bhubaneswar, Odisha",
  "Raipur, Chhattisgarh",
  "Dehradun, Uttarakhand",
  "Shimla, Himachal Pradesh",
  "Goa",
  "Kochi, Kerala",
  "Thiruvananthapuram, Kerala",
  "Guwahati, Assam",
];

export default function MobileLocationPage({
  onBack,
  selectedCity,
  onSelectLocation,
}: MobileLocationPageProps) {
  const [query, setQuery] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<LocationSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Auto-focus location search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Live Online Geocoding / Location Search (Debounced 300ms)
  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      setApiSuggestions([]);
      setIsSearchingOnline(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSearchingOnline(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Strategy 1: Google Places Autocomplete Service if available
        const googleLoaded = await loadGoogleMapsScript();
        if (googleLoaded && (window as any).google?.maps?.places?.AutocompleteService) {
          const service = new (window as any).google.maps.places.AutocompleteService();
          service.getPlacePredictions(
            {
              input: cleanQuery,
              componentRestrictions: { country: "in" },
            },
            (predictions: any[], status: string) => {
              if (status === "OK" && predictions && predictions.length > 0) {
                const results: LocationSuggestion[] = predictions.map((p) => ({
                  title: p.structured_formatting?.main_text || p.description,
                  subtitle: p.structured_formatting?.secondary_text || "",
                  fullAddress: p.description || p.structured_formatting?.main_text,
                }));
                setApiSuggestions(results);
                setIsSearchingOnline(false);
                return;
              }
              // Fallback to OSM search if Google returns no predictions
              fetchOsmSearch(cleanQuery);
            }
          );
          return;
        }

        // Strategy 2: OpenStreetMap Nominatim Search API
        await fetchOsmSearch(cleanQuery);
      } catch (err) {
        console.warn("Location search error:", err);
        setIsSearchingOnline(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const fetchOsmSearch = async (q: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=in&addressdetails=1&limit=10`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const results: LocationSuggestion[] = data.map((item: any) => {
          const addr = item.address || {};
          const mainTitle =
            addr.suburb ||
            addr.neighbourhood ||
            addr.city_district ||
            addr.city ||
            addr.town ||
            addr.village ||
            item.name ||
            q;
          const secondary = [
            addr.city || addr.town || addr.county,
            addr.state,
          ]
            .filter(Boolean)
            .join(", ");

          return {
            title: mainTitle,
            subtitle: secondary || item.display_name,
            fullAddress: secondary ? `${mainTitle}, ${secondary}` : item.display_name,
          };
        });
        setApiSuggestions(results);
      } else {
        setApiSuggestions([]);
      }
    } catch (e) {
      console.warn("OSM Search error:", e);
      setApiSuggestions([]);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Live GPS Location Detection
  const handleDetectLocation = async () => {
    setDetectingGps(true);
    try {
      const pos = await getCurrentUserLocation();
      if (!pos) {
        setDetectingGps(false);
        return;
      }

      const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
      const detectedCity = geocoded?.city || "Indore";
      const detectedArea = geocoded?.area || "";
      const shortName =
        geocoded?.shortName ||
        (detectedArea ? `${detectedArea}, ${detectedCity}` : detectedCity);

      onSelectLocation(shortName);
    } catch (err) {
      console.warn("GPS Detection error:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  const handlePickLocation = (loc: string) => {
    onSelectLocation(loc);
  };

  // Instant local search matches
  const localMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = [...INDORE_AREAS, ...MAJOR_INDIAN_CITIES];
    const unique = Array.from(new Set(all));
    return unique.filter((l) => l.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col text-foreground overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-3 py-2.5 flex items-center justify-between gap-2 shadow-xs">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-secondary text-foreground transition-colors cursor-pointer shrink-0"
          title="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Title */}
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

        {/* State A: EMPTY QUERY -> Show Anywhere in City + Trending Areas */}
        {!query.trim() && (
          <div className="space-y-4">
            {/* Anywhere in Selected City */}
            <button
              type="button"
              onClick={() => handlePickLocation(`Anywhere in ${selectedCity || "Indore"}`)}
              className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-secondary/50 rounded-xl transition cursor-pointer group"
            >
              <MapPin className="h-5 w-5 text-foreground/80 group-hover:text-primary shrink-0" />
              <span className="text-sm font-bold text-foreground group-hover:text-primary">
                Anywhere in {selectedCity || "Indore"}
              </span>
            </button>

            {/* Trending Areas Section */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Trending Areas in Indore & MP
              </h4>

              <div className="divide-y divide-border/60">
                {INDORE_AREAS.map((area, idx) => (
                  <button
                    key={idx}
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
          </div>
        )}

        {/* State B: NON-EMPTY QUERY -> Show Dynamic Matches Anywhere */}
        {query.trim() && (
          <div className="space-y-3">

            {/* 2. Live API Results from anywhere in India / World */}
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
                      onClick={() => handlePickLocation(item.fullAddress || item.title)}
                      className="w-full py-3 px-1 flex items-center gap-3 hover:bg-secondary/50 text-left transition cursor-pointer group"
                    >
                      <MapPin className="h-4.5 w-4.5 text-accent shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Instant Local Matches (if API suggestions are still loading or complementary) */}
            {localMatches.length > 0 && (
              <div className="space-y-1 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Popular Places</span>
                </h4>
                <div className="divide-y divide-border/60">
                  {localMatches.map((area, idx) => (
                    <button
                      key={`local-${idx}`}
                      type="button"
                      onClick={() => handlePickLocation(area)}
                      className="w-full py-2.5 px-1 flex items-center gap-3 hover:bg-secondary/50 text-left transition cursor-pointer group"
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

            {/* No matches state */}
            {!isSearchingOnline &&
              apiSuggestions.length === 0 &&
              localMatches.length === 0 && (
                <div className="py-8 text-center space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    No locations found for "{query.trim()}"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try searching for another city, area or landmark
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
