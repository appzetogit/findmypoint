import React, { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Phone,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { API_BASE_URL } from "../../config";
import { calculateDistanceKm, formatDistance } from "../../utils/googleMaps";
import { BusinessListingData } from "../../data/businessesData";

interface NearbyBusinessesSectionProps {
  currentBusinessId: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  cityTown?: string;
  onBusinessSelect?: (id: string) => void;
  className?: string;
}

export default function NearbyBusinessesSection({
  currentBusinessId,
  category,
  latitude,
  longitude,
  cityTown,
  onBusinessSelect,
  className = ""
}: NearbyBusinessesSectionProps) {
  const [nearbyListings, setNearbyListings] = useState<BusinessListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadNearby = async () => {
      try {
        // Strategy 1: If lat/lng available, query geospatial nearby API
        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
          const catParam = category ? `&category=${encodeURIComponent(category.split(">")[0].trim())}` : "";
          const res = await fetch(
            `${API_BASE_URL}/businesses/nearby?lat=${latitude}&lng=${longitude}&radius=15000&excludeId=${encodeURIComponent(currentBusinessId)}${catParam}&limit=8`
          );
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) {
              setNearbyListings(json.data);
              setLoading(false);
              return;
            }
          }
        }

        // Strategy 2: Fallback query all businesses in same category or city
        const categoryQuery = category ? `?category=${encodeURIComponent(category.split(">")[0].trim())}` : "";
        const res = await fetch(`${API_BASE_URL}/businesses${categoryQuery}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const filtered = json.data.filter(
            (b: BusinessListingData) => b.id !== currentBusinessId && b.status !== "deleted" && b.status !== "draft"
          );

          // If coordinates available, sort by distance
          if (latitude && longitude) {
            const withDistance = filtered.map((b: BusinessListingData) => {
              if (b.latitude && b.longitude) {
                const dist = calculateDistanceKm(latitude, longitude, b.latitude, b.longitude);
                return { ...b, distance: dist * 1000 };
              }
              return b;
            });

            withDistance.sort((a: any, b: any) => {
              if (a.distance && b.distance) return a.distance - b.distance;
              if (a.distance) return -1;
              if (b.distance) return 1;
              return 0;
            });

            if (isMounted) {
              setNearbyListings(withDistance.slice(0, 6));
              setLoading(false);
            }
          } else {
            if (isMounted) {
              setNearbyListings(filtered.slice(0, 6));
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.error("[NearbyBusinessesSection] Failed to load nearby businesses:", err);
        if (isMounted) setLoading(false);
      }
    };

    loadNearby();

    return () => {
      isMounted = false;
    };
  }, [currentBusinessId, category, latitude, longitude, cityTown]);

  if (loading || nearbyListings.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col text-left ${className}`}>
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-foreground uppercase tracking-wider">
              Explore Nearby Businesses
            </h3>
            <p className="text-[11px] font-semibold text-muted-foreground">
              Similar verified spots in your neighborhood
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyListings.map((biz) => {
          const distKm = biz.distance ? biz.distance / 1000 : null;
          const distFormatted = distKm ? formatDistance(distKm) : null;
          const mainPhoto = biz.images?.[0] || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80";

          return (
            <div
              key={biz.id}
              onClick={() => onBusinessSelect && onBusinessSelect(biz.id)}
              className="group bg-card hover:bg-card/90 border border-border/70 hover:border-primary/30 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Photo with Overlay Badges */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-secondary mb-3">
                  <img
                    src={mainPhoto}
                    alt={biz.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />


                  {/* Rating Badge */}
                  {biz.rating ? (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded-md shadow-sm">
                        {biz.rating} <Star className="h-2.5 w-2.5 fill-white stroke-none" />
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Info */}
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5 truncate">
                    {biz.category?.split(">")[0]?.trim() || "Local Business"}
                  </span>
                  <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {biz.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-semibold line-clamp-1 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    {biz.location || biz.address || "Indore"}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Row */}
              <div className="pt-3 mt-2.5 border-t border-border/40 flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-1">
                  View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>

                {biz.phone && (
                  <a
                    href={`tel:${biz.phone.replace(/[^0-9+]/g, "")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
                    title={`Call ${biz.name}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
