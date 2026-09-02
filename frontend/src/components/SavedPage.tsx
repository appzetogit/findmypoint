import { useState, useEffect } from "react";
import { Bookmark, MapPin, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { LazyImage } from "./ui/LazyImage";
import {
  getSavedListings,
  removeSavedListing,
  clearAllSavedListings,
  SavedItem,
} from "../utils/bookmarkUtils";

interface SavedPageProps {
  onNavigateToBusiness?: (
    categoryName: string,
    subCategoryName: string,
    businessId: string
  ) => void;
  onClose?: () => void;
}

export default function SavedPage({ onNavigateToBusiness, onClose }: SavedPageProps) {
  const [savedListings, setSavedListings] = useState<SavedItem[]>([]);

  const loadSaved = () => {
    setSavedListings(getSavedListings());
  };

  useEffect(() => {
    loadSaved();

    window.addEventListener("fmp_saved_changed", loadSaved);
    window.addEventListener("storage", loadSaved);
    return () => {
      window.removeEventListener("fmp_saved_changed", loadSaved);
      window.removeEventListener("storage", loadSaved);
    };
  }, []);

  const handleRemove = (e: React.MouseEvent, item: SavedItem) => {
    e.stopPropagation();
    const idToRemove = item.id || item._id || item.slug || item.canonicalUrl || "";
    if (idToRemove) {
      removeSavedListing(idToRemove);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all saved bookmarks?")) {
      clearAllSavedListings();
    }
  };

  const handleItemClick = (item: SavedItem) => {
    if (onClose) {
      onClose();
    }

    const targetId = item.canonicalUrl || item.slug || item.id || item._id || "";

    if (item.type === "place") {
      window.dispatchEvent(new CustomEvent("fmp-select-place", { detail: item.slug || item.id }));
      return;
    }

    if (item.type === "article") {
      window.dispatchEvent(new CustomEvent("fmp-select-article", { detail: Number(item.id || item.slug) }));
      return;
    }

    if (onNavigateToBusiness && targetId) {
      onNavigateToBusiness(item.category || "Business", item.sub || "", targetId);
    } else if (targetId) {
      window.dispatchEvent(new CustomEvent("fmp-select-business", { detail: targetId }));
    } else if (item.canonicalUrl) {
      window.location.href = item.canonicalUrl;
    } else if (item.slug) {
      window.location.href = `/${item.slug}`;
    }
  };

  return (
    <div className="space-y-6">
      {savedListings.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center text-xs font-semibold text-muted-foreground bg-card space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Bookmark className="h-6 w-6" />
          </div>
          <div className="text-foreground font-bold text-sm">
            Your saved bookmarks list is empty
          </div>
          <p className="max-w-md mx-auto text-muted-foreground text-xs leading-relaxed">
            Click the bookmark icon on any business page, tourist spot, or article to save it for quick access later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedListings.map((item) => (
            <div
              key={item.id || item._id || item.slug || item.name}
              onClick={() => handleItemClick(item)}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-border/80 transition-all duration-300 group relative cursor-pointer"
            >
              {/* Image header */}
              <div className="h-32 w-full relative bg-muted overflow-hidden">
                {item.image ? (
                  <LazyImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-medium">
                    <Sparkles className="h-5 w-5 mr-1 opacity-50" />
                    FindMyPoint Listing
                  </div>
                )}

                {item.sub && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-white tracking-wider border border-white/10 z-10">
                    {item.sub}
                  </span>
                )}

                <button
                  onClick={(e) => handleRemove(e, item)}
                  className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500 hover:text-rose-600 transition p-1.5 rounded-full shadow-md cursor-pointer border border-border/20 z-10 active:scale-95"
                  title="Remove from saved"
                >
                  <Bookmark className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>

              {/* Content details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    {item.rating && (
                      <span className="text-[11px] font-bold text-amber-500 shrink-0 flex items-center gap-0.5">
                        ⭐ {item.rating}
                      </span>
                    )}
                  </div>
                  {item.address && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
