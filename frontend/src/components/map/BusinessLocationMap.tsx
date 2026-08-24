import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Maximize2
} from "lucide-react";
import { getGoogleMapsEmbedUrl, getDirectionsUrl } from "../../utils/googleMaps";

interface BusinessLocationMapProps {
  businessName: string;
  address: string;
  location?: string;
  cityTown?: string;
  locationLink?: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

export default function BusinessLocationMap({
  businessName,
  address,
  location,
  cityTown,
  locationLink,
  latitude,
  longitude,
  className = ""
}: BusinessLocationMapProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fullDestination = [businessName, address, location, cityTown].filter(Boolean).join(", ");
  const directionsUrl = getDirectionsUrl(fullDestination);

  const mapEmbedUrl = getGoogleMapsEmbedUrl({
    address: [address, location, cityTown].filter(Boolean).join(", "),
    locationLink,
    lat: latitude,
    lng: longitude,
    name: businessName
  });

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullDestination);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm transition-all duration-300 ${className}`}
    >
      {/* Map Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 bg-secondary/15">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 text-left">
            <h4 className="text-sm font-black text-foreground tracking-tight flex items-center gap-1.5 truncate">
              Location & Map View
            </h4>
            <p className="text-[11px] font-semibold text-muted-foreground truncate">
              {address || location || cityTown || "India"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-foreground hover:bg-secondary text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            title="Copy address"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy</span>
              </>
            )}
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
            title="Get turn-by-turn directions"
          >
            <Navigation className="h-3.5 w-3.5 fill-current" />
            <span>Directions</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </a>
        </div>
      </div>

      {/* Embedded Map Frame */}
      <div className={`relative w-full ${isExpanded ? "h-[450px]" : "h-[240px] sm:h-[290px]"} bg-secondary/30 transition-all duration-300`}>
        <iframe
          src={mapEmbedUrl}
          title={`Google Map view of ${businessName}`}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Expand / Collapse Floating Overlay Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-3 right-3 z-10 p-2 rounded-xl bg-background/90 hover:bg-background text-foreground backdrop-blur-md border border-border/80 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          title={isExpanded ? "Collapse Map" : "Expand Map View"}
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Coordinate Tag if available */}
        {latitude && longitude ? (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-background/90 dark:bg-slate-900/90 text-foreground backdrop-blur-md border border-border/80 shadow-sm">
              <Compass className="h-3 w-3 text-indigo-500" />
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Map Footer Bar with turn-by-turn guidance hint */}
      <div className="px-4 py-2.5 bg-secondary/30 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-emerald-500">📍</span> Live Navigation available via Google Maps app
        </span>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-bold text-xs shrink-0 ml-2"
        >
          Open in Maps →
        </a>
      </div>
    </div>
  );
}
