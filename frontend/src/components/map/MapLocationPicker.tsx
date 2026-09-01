import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Check, AlertCircle } from "lucide-react";
import { loadGoogleMapsScript, reverseGeocodeCoords } from "../../utils/googleMaps";

interface MapLocationPickerProps {
  latitude: number | string | null;
  longitude: number | string | null;
  address?: string;
  onLocationChange: (lat: number, lng: number, addressInfo?: { city?: string; area?: string; formattedAddress?: string }) => void;
  className?: string;
  height?: string;
}

// Dynamically load Leaflet for guaranteed fallback map rendering
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).L) return Promise.resolve((window as any).L);

  return new Promise((resolve, reject) => {
    // Add Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => resolve((window as any).L);
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).L) {
          clearInterval(interval);
          resolve((window as any).L);
        } else if (attempts > 30) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    }
  });
}

export default function MapLocationPicker({
  latitude,
  longitude,
  address,
  onLocationChange,
  className = "",
  height = "260px",
}: MapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const engineRef = useRef<"google" | "leaflet" | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === "string" ? parseFloat(longitude) : longitude;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
    return null;
  });

  // Default fallback center: Geographic center
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };

  const handlePositionChange = useCallback(
    async (lat: number, lng: number) => {
      setCurrentCoords({ lat, lng });
      try {
        const geocoded = await reverseGeocodeCoords(lat, lng);
        onLocationChange(lat, lng, geocoded || undefined);
      } catch {
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange]
  );

  // Initialize Leaflet Map
  const initLeafletMap = useCallback(async (center: { lat: number; lng: number }, hasCoords: boolean) => {
    if (!mapContainerRef.current) return;
    try {
      const L = await loadLeaflet();
      if (!L || !mapContainerRef.current) {
        setMapError("Map services could not be loaded.");
        return;
      }

      // Clear previous container contents
      mapContainerRef.current.innerHTML = "";

      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: hasCoords ? 16 : 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom high-visibility red marker
      const redPinIcon = L.divIcon({
        className: "custom-red-pin",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#ef4444;color:white;border-radius:50%;box-shadow:0 4px 12px rgba(239,68,68,0.5);border:3px solid white;cursor:grab;"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/><circle cx='12' cy='10' r='3'/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([center.lat, center.lng], {
        draggable: true,
        icon: redPinIcon,
      }).addTo(map);

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handlePositionChange(lat, lng);
      });

      marker.on("dragend", (e: any) => {
        const { lat, lng } = marker.getLatLng();
        handlePositionChange(lat, lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
      engineRef.current = "leaflet";
      setMapLoaded(true);
      setMapError(null);
    } catch (err) {
      console.error("[MapLocationPicker] Error initializing Leaflet map:", err);
      setMapError("Failed to initialize map");
    }
  }, [handlePositionChange]);

  // Main Map Init: Try Google Maps, fallback to Leaflet seamlessly
  useEffect(() => {
    let isMounted = true;

    const initialLat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const initialLng = typeof longitude === "string" ? parseFloat(longitude) : longitude;
    const hasCoords = Boolean(initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng));
    const center = hasCoords && initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter;

    loadGoogleMapsScript()
      .then((loaded) => {
        if (!isMounted || !mapContainerRef.current) return;

        const google = (window as any).google;
        if (loaded && google?.maps?.Map) {
          // Initialize Google Map
          try {
            mapContainerRef.current.innerHTML = "";
            const map = new google.maps.Map(mapContainerRef.current, {
              center,
              zoom: hasCoords ? 16 : 12,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
              gestureHandling: "greedy",
            });
            mapInstanceRef.current = map;

            const marker = new google.maps.Marker({
              position: center,
              map,
              draggable: true,
              title: "Drag to set exact business location",
              animation: google.maps.Animation.DROP,
            });
            markerInstanceRef.current = marker;

            map.addListener("click", (e: any) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              marker.setPosition({ lat, lng });
              handlePositionChange(lat, lng);
            });

            marker.addListener("dragend", (e: any) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              handlePositionChange(lat, lng);
            });

            engineRef.current = "google";
            setMapLoaded(true);
            setMapError(null);
            return;
          } catch (e) {
            console.warn("[MapLocationPicker] Google Map init error, falling back to OSM:", e);
          }
        }

        // Fallback to Leaflet OpenStreetMap
        initLeafletMap(center, hasCoords);
      })
      .catch(() => {
        if (isMounted) {
          initLeafletMap(center, hasCoords);
        }
      });

    return () => {
      isMounted = false;
      if (engineRef.current === "google") {
        if (markerInstanceRef.current) {
          (window as any).google?.maps?.event?.clearInstanceListeners(markerInstanceRef.current);
        }
        if (mapInstanceRef.current) {
          (window as any).google?.maps?.event?.clearInstanceListeners(mapInstanceRef.current);
        }
      } else if (engineRef.current === "leaflet" && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
      }
    };
  }, []);

  // Sync external coordinate changes (e.g. from address autocomplete)
  useEffect(() => {
    const lat = typeof latitude === "string" ? parseFloat(latitude) : latitude;
    const lng = typeof longitude === "string" ? parseFloat(longitude) : longitude;

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      setCurrentCoords({ lat, lng });

      if (engineRef.current === "google" && mapInstanceRef.current && markerInstanceRef.current) {
        const newPos = { lat, lng };
        markerInstanceRef.current.setPosition(newPos);
        mapInstanceRef.current.panTo(newPos);
        if (mapInstanceRef.current.getZoom() < 15) {
          mapInstanceRef.current.setZoom(16);
        }
      } else if (engineRef.current === "leaflet" && mapInstanceRef.current && markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 16);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Interactive Helper Banner */}
      <div className="flex items-center justify-between text-xs bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-xl px-3 py-2 text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-1.5 font-bold">
          <MapPin className="h-4 w-4 text-rose-500 shrink-0 animate-bounce" />
          <span>Click anywhere on map or drag pin to pinpoint location</span>
        </div>
        {currentCoords ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800 shrink-0 ml-2">
            <Check className="h-3 w-3 text-emerald-500" />
            {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
          </span>
        ) : null}
      </div>

      {/* Map Container */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner z-0"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {mapError && !mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 text-center">
            <div className="text-xs text-rose-500 font-bold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              <span>{mapError}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
