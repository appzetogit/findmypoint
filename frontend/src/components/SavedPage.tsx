import { useState, useEffect } from "react";
import { Bookmark, MapPin } from "lucide-react";
import { LazyImage } from "./ui/LazyImage";

interface SavedPageProps {
  onNavigateToBusiness?: (
    categoryName: string,
    subCategoryName: string,
    businessId: string,
  ) => void;
}

export default function SavedPage({ onNavigateToBusiness }: SavedPageProps) {
  const [savedListings, setSavedListings] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fmp_saved_listings:v1") || localStorage.getItem("fmp_saved_listings");
      if (saved) {
        setSavedListings(JSON.parse(saved));
      } else {
        setSavedListings([]);
      }
    } catch (e) {
      console.error("Failed to load saved listings from localStorage", e);
      setSavedListings([]);
    }
  }, []);

  const handleRemoveSaved = (id: string) => {
    const updated = savedListings.filter((item) => item.id !== id);
    setSavedListings(updated);
    localStorage.setItem("fmp_saved_listings:v1", JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Bookmarks Catalog</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quickly access business pages you configured to visit frequently.
        </p>
      </div>

      {savedListings.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center text-xs font-semibold text-muted-foreground bg-card">
          Your saved bookmarks list is empty. Bookmark local listings to view them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedListings.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition group relative"
            >
              {/* Image header */}
              <div className="h-28 w-full relative">
                <LazyImage
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover group-hover:scale-101 transition duration-500"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-[2px] rounded text-[9px] font-black uppercase text-white tracking-wider border border-white/5 z-10">
                  {item.sub}
                </span>
                <button
                  onClick={() => handleRemoveSaved(item.id)}
                  className="absolute top-3 right-3 bg-white/95 hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition p-1.5 rounded-full shadow cursor-pointer border border-border/10 animate-fade-in"
                >
                  <Bookmark className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>

              {/* Content details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-foreground">{item.name}</h4>
                    <span className="text-[10px] font-bold text-amber-500">⭐ {item.rating}</span>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-border/40 flex justify-end">
                  <button
                    onClick={() => {
                      if (onNavigateToBusiness) {
                        onNavigateToBusiness(item.category, item.sub, item.id);
                      } else {
                        alert(`Details flow for ${item.name}`);
                      }
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-black px-4 py-2 rounded-lg transition"
                  >
                    Explore Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
