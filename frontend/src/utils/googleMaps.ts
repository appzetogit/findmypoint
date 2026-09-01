/**
 * googleMaps.ts
 * Frontend Google Maps helper utilities for FindmyPoint
 */

import { GOOGLE_MAPS_API_KEY } from "../config";

let googleMapsPromise: Promise<boolean> | null = null;

/**
 * Dynamically load Google Maps JavaScript API script
 * Libraries loaded: places, geometry
 */
export function loadGoogleMapsScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  // If already available on window with Map constructor
  if ((window as any).google?.maps?.Map) {
    return Promise.resolve(true);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve) => {
    // If google maps is already loaded
    if ((window as any).google?.maps?.Map) {
      resolve(true);
      return;
    }

    const callbackName = "__fmpGoogleMapsCallback";
    (window as any)[callbackName] = () => {
      resolve(true);
    };

    const existingScript = document.getElementById("google-maps-script") as HTMLScriptElement | null;
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).google?.maps?.Map) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 30) {
          clearInterval(interval);
          resolve(Boolean((window as any).google?.maps));
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = (err) => {
      console.warn("[GoogleMaps] Failed to load Google Maps script:", err);
      resolve(false);
    };

    document.head.appendChild(script);

    // Timeout safety fallback
    setTimeout(() => {
      if ((window as any).google?.maps?.Map) {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 4000);
  });

  return googleMapsPromise;
}

/**
 * Calculate distance in km between two lat/lng pairs using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    return 0;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance nicely: e.g. "450 m" or "2.4 km"
 */
export function formatDistance(distanceKm: number): string {
  if (!distanceKm || isNaN(distanceKm) || distanceKm <= 0) return "";
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Generate Google Maps Pin View URL (opens Google Maps with exact red pin on the business location, without polyline route lines).
 */
export function getDirectionsUrl(
  destination: string | { lat?: number | null; lng?: number | null; address?: string; name?: string },
  origin?: string
): string {
  if (typeof destination === "object" && destination !== null) {
    const { lat, lng, address, name } = destination;
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    const query = encodeURIComponent([name, address].filter(Boolean).join(", "));
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  const query = encodeURIComponent(destination || "");
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Get Google Maps Embed Iframe URL from address / locationLink / coordinates
 */
export function getGoogleMapsEmbedUrl(params: {
  address?: string;
  locationLink?: string;
  lat?: number;
  lng?: number;
  name?: string;
}): string {
  const { address, locationLink, lat, lng, name } = params;

  // 1. If locationLink is a direct embed URL or has embed parameters
  if (locationLink) {
    if (locationLink.includes("/embed") || locationLink.includes("output=embed")) {
      return locationLink;
    }
  }

  // 2. If valid coordinates are available
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    const q = name ? `${encodeURIComponent(name)}+@${lat},${lng}` : `${lat},${lng}`;
    return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
  }

  // 3. Fallback to query address
  const fullAddress = [name, address].filter(Boolean).join(", ");
  const query = encodeURIComponent(fullAddress || "");
  return `https://maps.google.com/maps?q=${query}&z=14&output=embed`;
}

// In-flight singleton promise to prevent conflicting duplicate browser permission dialogs
let inFlightLocationPromise: Promise<{ lat: number; lng: number } | null> | null = null;

/**
 * Get user's current GPS location with mobile-friendly timeout and fast fallback
 */
export function getCurrentUserLocation(options?: {
  forceFresh?: boolean;
  timeout?: number;
}): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  // Reuse in-flight promise to avoid triggering duplicate permission prompts
  if (inFlightLocationPromise && !options?.forceFresh) {
    return inFlightLocationPromise;
  }

  inFlightLocationPromise = new Promise<{ lat: number; lng: number } | null>((resolve) => {
    let finished = false;
    const finish = (coords: { lat: number; lng: number } | null) => {
      if (!finished) {
        finished = true;
        inFlightLocationPromise = null;
        resolve(coords);
      }
    };

    // 25 seconds timeout ensures mobile users have plenty of time to view native prompt & tap Allow
    const timeoutDuration = options?.timeout ?? 25000;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        finish({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // Error code 1 = PERMISSION_DENIED (User clicked Block/Never allow or blocked by browser)
        if (error.code === 1) {
          console.warn("[GoogleMaps] Geolocation permission denied or blocked by browser:", error.message);
          finish(null);
          return;
        }

        console.warn("[GoogleMaps] High accuracy location unavailable or timed out, trying fast standard accuracy:", error.message);

        // Fallback: Standard cell/wifi triangulation (fast, works when GPS satellite lock is slow indoors)
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            finish({
              lat: fallbackPos.coords.latitude,
              lng: fallbackPos.coords.longitude,
            });
          },
          (fallbackErr) => {
            console.warn("[GoogleMaps] Standard accuracy fallback also failed:", fallbackErr.message);
            finish(null);
          },
          {
            enableHighAccuracy: false,
            timeout: 12000,
            maximumAge: 300000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutDuration,
        maximumAge: options?.forceFresh ? 0 : 60000,
      }
    );
  });

  return inFlightLocationPromise;
}

/**
 * Client-side Reverse Geocoding: lat/lng -> { city, area, formattedAddress, shortName }
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<{ city: string; area: string; formattedAddress: string; shortName: string } | null> {
  // Strategy 1: Google Maps JS SDK Geocoder
  try {
    const isLoaded = await loadGoogleMapsScript();
    if (isLoaded && (window as any).google?.maps?.Geocoder) {
      const result = await new Promise<any>((resolve) => {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
          if (status === "OK" && results && results.length > 0) {
            resolve(results[0]);
          } else {
            resolve(null);
          }
        });
      });

      if (result) {
        const components = result.address_components || [];
        const get = (type: string) => {
          const comp = components.find((c: any) => c.types.includes(type));
          return comp ? comp.long_name : "";
        };

        const city =
          get("locality") ||
          get("administrative_area_level_2") ||
          get("administrative_area_level_1") ||
          "";
        const area =
          get("sublocality_level_1") ||
          get("sublocality") ||
          get("neighborhood") ||
          "";

        const shortName = area && city && area !== city ? `${area}, ${city}` : (city || area || "My Location");

        return {
          city,
          area,
          formattedAddress: result.formatted_address || shortName,
          shortName,
        };
      }
    }
  } catch (err) {
    console.warn("[GoogleMaps] SDK Geocoder error:", err);
  }

  // Strategy 2: Fast BigDataCloud Reverse Geocoding API (Fast, Free, Client-side CORS)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      if (bdcData) {
        const city = bdcData.city || bdcData.locality || bdcData.principalSubdivision || "";
        const area =
          bdcData.localityInfo?.administrative?.[3]?.name ||
          bdcData.localityInfo?.administrative?.[2]?.name ||
          bdcData.locality ||
          "";
        const shortName = area && city && area !== city ? `${area}, ${city}` : (city || area || "My Location");

        if (city || area) {
          return {
            city,
            area,
            formattedAddress: shortName,
            shortName,
          };
        }
      }
    }
  } catch (err) {
    console.warn("[GoogleMaps] BigDataCloud reverse geocoding fallback error:", err);
  }

  // Strategy 3: Fast HTTP Reverse Geocoding fallback (Nominatim OSM)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const city =
        addr.city || addr.town || addr.municipality || addr.county || addr.state_district || "";
      const area =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.road ||
        "";

      const shortName = area && city && area !== city ? `${area}, ${city}` : (city || area || "My Location");

      return {
        city,
        area,
        formattedAddress: data.display_name || shortName,
        shortName,
      };
    }
  } catch (err) {
    console.warn("[GoogleMaps] HTTP Geocoding fallback error:", err);
  }

  return null;
}

/**
 * Real Dynamic Forward Geocoding: address / city / locality name -> { lat, lng }
 * Uses Google Maps Geocoder SDK or OpenStreetMap Nominatim API with zero hardcoded mock data.
 */
export async function geocodeLocation(
  locationName: string
): Promise<{ lat: number; lng: number } | null> {
  if (!locationName || !locationName.trim()) return null;
  const clean = locationName.trim();

  // 1. Google Maps JS SDK Geocoder
  try {
    const isLoaded = await loadGoogleMapsScript();
    if (isLoaded && (window as any).google?.maps?.Geocoder) {
      const result = await new Promise<any>((resolve) => {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: clean }, (results: any[], status: string) => {
          if (status === "OK" && results && results.length > 0) {
            resolve(results[0]);
          } else {
            resolve(null);
          }
        });
      });

      if (result?.geometry?.location) {
        return {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
        };
      }
    }
  } catch (err) {
    console.warn("[GoogleMaps] Geocoder error:", err);
  }

  // 2. Fast HTTP Nominatim Forward Geocoding API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        clean
      )}&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.warn("[GoogleMaps] HTTP Geocoding error:", err);
  }

  return null;
}
