import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Star, Phone, ArrowRight, X } from "lucide-react";
import { loadGoogleMapsScript } from "../../utils/googleMaps";
import { BusinessListingData } from "../../data/businessesData";
import { LazyImage } from "../ui/LazyImage";

interface CategoryMapViewProps {
  businesses: BusinessListingData[];
  onBusinessSelect: (id: string) => void;
  userCoords?: { lat: number; lng: number } | null;
  className?: string;
}

export default function CategoryMapView({
  businesses,
  onBusinessSelect,
  userCoords,
  className = "",
}: CategoryMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<BusinessListingData | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript().then((loaded) => {
      if (!isMounted || !loaded || !mapContainerRef.current) return;
      setSdkLoaded(true);

      const google = (window as any).google;
      if (!google?.maps?.Map) return;

      // Filter businesses with valid coordinates
      const withCoords = businesses.filter((b) => b.latitude && b.longitude);

      // Determine center: user coords, first business, or India geographic center
      let defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Geographic center
      if (userCoords) {
        defaultCenter = userCoords;
      } else if (withCoords.length > 0) {
        defaultCenter = { lat: withCoords[0].latitude!, lng: withCoords[0].longitude! };
      }

      // Initialize map
      const map = new google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: withCoords.length > 1 ? 13 : 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Clear existing markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const bounds = new google.maps.LatLngBounds();

      // If user location available, add user marker (blue dot)
      if (userCoords) {
        new google.maps.Marker({
          position: userCoords,
          map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        bounds.extend(userCoords);
      }

      // Add business markers
      withCoords.forEach((biz) => {
        const pos = { lat: biz.latitude!, lng: biz.longitude! };
        bounds.extend(pos);

        const marker = new google.maps.Marker({
          position: pos,
          map,
          title: biz.name,
          animation: google.maps.Animation.DROP,
        });

        marker.addListener("click", () => {
          setSelectedBiz(biz);
          map.panTo(pos);
        });

        markersRef.current.push(marker);
      });

      if (withCoords.length > 1) {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    });

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.setMap(null));
    };
  }, [businesses, userCoords]);

  return (
    <div className={`relative w-full h-[480px] sm:h-[540px] rounded-3xl overflow-hidden border border-border bg-card shadow-md ${className}`}>
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Info Overlay for Selected Business */}
      {selectedBiz && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 bg-background/95 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xl animate-fade-in-up">
          <button
            type="button"
            onClick={() => setSelectedBiz(null)}
            className="absolute top-2.5 right-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex gap-3 items-start text-left">
            <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-border/40">
              <LazyImage
                src={selectedBiz.images?.[0] || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80"}
                alt={selectedBiz.name}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                {selectedBiz.category?.split(">")[0]?.trim() || "Business"}
              </span>
              <h4 className="text-sm font-black text-foreground truncate">{selectedBiz.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{selectedBiz.address || selectedBiz.location}</p>

              <div className="flex items-center gap-2 mt-2">
                {selectedBiz.rating ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-white bg-emerald-600 px-1.5 py-0.5 rounded">
                    {selectedBiz.rating} <Star className="h-2.5 w-2.5 fill-white stroke-none" />
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={() => onBusinessSelect(selectedBiz.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-auto cursor-pointer"
                >
                  <span>View Profile</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Count */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-background/90 text-foreground backdrop-blur-md border border-border shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-rose-500" />
          Showing {businesses.filter((b) => b.latitude && b.longitude).length} spots on map
        </span>
      </div>
    </div>
  );
}
