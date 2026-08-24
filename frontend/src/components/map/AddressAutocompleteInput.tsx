import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2, Check } from "lucide-react";
import {
  loadGoogleMapsScript,
  getCurrentUserLocation,
  reverseGeocodeCoords,
} from "../../utils/googleMaps";

export interface PlaceResultData {
  formattedAddress: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  country: string;
}

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (data: PlaceResultData) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  showGpsButton?: boolean;
}

export default function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Start typing address or locality (e.g. Vijay Nagar, Indore)...",
  className = "",
  required = false,
  id,
  showGpsButton = false,
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapsSdkReady, setMapsSdkReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript().then((loaded) => {
      if (!isMounted || !loaded || !inputRef.current) return;
      setMapsSdkReady(true);

      try {
        const google = (window as any).google;
        if (!google?.maps?.places?.Autocomplete) return;

        // Initialize Google Places Autocomplete restricted to India (default) or worldwide
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "in" },
          fields: ["address_components", "formatted_address", "geometry", "place_id", "name"],
          types: ["geocode", "establishment"],
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (!place) return;

          const formattedAddress = place.formatted_address || place.name || "";
          onChange(formattedAddress);

          if (onPlaceSelected) {
            const components = place.address_components || [];
            const get = (type: string) => {
              const comp = components.find((c: any) => c.types.includes(type));
              return comp ? comp.long_name : "";
            };

            const lat = place.geometry?.location ? place.geometry.location.lat() : null;
            const lng = place.geometry?.location ? place.geometry.location.lng() : null;

            onPlaceSelected({
              formattedAddress,
              lat,
              lng,
              placeId: place.place_id || "",
              city: get("locality") || get("administrative_area_level_2") || "",
              state: get("administrative_area_level_1") || "",
              district: get("administrative_area_level_2") || get("sublocality_level_1") || "",
              pincode: get("postal_code") || "",
              country: get("country") || "India",
            });
          }
        });
      } catch (err) {
        console.warn("[AddressAutocompleteInput] Error initializing autocomplete:", err);
      }
    });

    return () => {
      isMounted = false;
      if (autocompleteRef.current) {
        (window as any).google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleUseGps = async () => {
    setGpsLoading(true);
    try {
      const pos = await getCurrentUserLocation();
      if (!pos) {
        alert("Could not access your location. Please check browser permissions.");
        setGpsLoading(false);
        return;
      }

      const geocoded = await reverseGeocodeCoords(pos.lat, pos.lng);
      if (geocoded) {
        onChange(geocoded.formattedAddress);
        if (onPlaceSelected) {
          onPlaceSelected({
            formattedAddress: geocoded.formattedAddress,
            lat: pos.lat,
            lng: pos.lng,
            placeId: "",
            city: geocoded.city,
            state: "",
            district: geocoded.area,
            pincode: "",
            country: "India",
          });
        }
      } else {
        onChange(`${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
      }
    } catch (e) {
      console.error("GPS detect failed:", e);
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <div className="relative w-full flex items-center">
      <input
        ref={inputRef}
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 ${showGpsButton ? "pr-24" : "pr-4"} ${className}`}
      />

      {showGpsButton && (
        <button
          type="button"
          onClick={handleUseGps}
          disabled={gpsLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition border border-indigo-200 dark:border-indigo-800/60 cursor-pointer disabled:opacity-50"
          title="Detect Current Location via GPS"
        >
          {gpsLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
          ) : (
            <Navigation className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>{gpsLoading ? "Detecting..." : "Use GPS"}</span>
        </button>
      )}
    </div>
  );
}
