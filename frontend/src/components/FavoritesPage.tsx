import { useState, useEffect, useMemo } from "react";
import { Sparkles, Building2, Star, MapPin } from "lucide-react";
import { API_BASE_URL } from "../config";
import { LazyImage } from "./ui/LazyImage";

interface FavoritesPageProps {
  onNavigateToBusiness?: (
    categoryName: string,
    subCategoryName: string,
    businessId: string,
  ) => void;
}

interface BusinessItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  location?: string;
  rating?: number;
  images?: string[];
  distanceKm?: number;
}

export default function FavoritesPage({ onNavigateToBusiness }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fmp_profile_favorites:v1") || localStorage.getItem("fmp_profile_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites([]);
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/businesses`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBusinesses(data.data);
        } else {
          setBusinesses([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load businesses:", err);
        setBusinesses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter live businesses matching favorites if configured, otherwise top verified businesses
  const recommendedBusinesses = useMemo(() => {
    if (businesses.length === 0) return [];
    if (favorites.length > 0) {
      const lowerFavs = favorites.map((f) => f.toLowerCase().trim());
      const matched = businesses.filter((b) => {
        const cat = (b.category || "").toLowerCase();
        const sub = (b.subcategory || "").toLowerCase();
        return lowerFavs.some((f) => cat.includes(f) || sub.includes(f));
      });
      if (matched.length > 0) return matched.slice(0, 6);
    }
    return businesses.slice(0, 4);
  }, [businesses, favorites]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Your Selected Categories</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          These categories are prioritized on your dashboard to customize suggestions.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-8 text-center text-xs font-semibold text-muted-foreground bg-secondary/5">
          No favorite categories configured yet. Click <b>Edit Profile</b> to set your preferences.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {favorites.map((fav) => (
            <span
              key={fav}
              className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/15 text-primary text-xs font-black uppercase flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" /> {fav}
            </span>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-border/50">
        <h4 className="font-serif text-base font-black text-foreground mb-3 flex items-center gap-2">
          <span>🎯</span> Selected Suggestions For You
        </h4>

        {loading ? (
          <div className="border border-dashed border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
            Loading recommendations...
          </div>
        ) : recommendedBusinesses.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-8 text-center text-xs font-semibold text-muted-foreground bg-secondary/5">
            No businesses found matching your categories yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedBusinesses.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-card border border-border rounded-2xl shadow-xs flex items-center justify-between hover:border-primary/20 transition-all duration-300 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {rec.images && rec.images[0] ? (
                    <LazyImage
                      src={rec.images[0]}
                      alt={rec.name}
                      className="h-11 w-11 rounded-xl overflow-hidden shrink-0 border border-border/40"
                      imgClassName="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase text-primary/85 truncate block">
                      {rec.subcategory || rec.category || "Business"}
                    </span>
                    <h5 className="text-xs font-black text-foreground mt-0.5 truncate">{rec.name}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                      {Number(rec.rating) > 0 && (
                        <span className="flex items-center gap-0.5 font-bold text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500" /> {rec.rating}
                        </span>
                      )}
                      {rec.location && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="h-3 w-3 shrink-0" /> {rec.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onNavigateToBusiness) {
                      onNavigateToBusiness(rec.category, rec.subcategory || "", rec.id);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-black rounded-lg transition shrink-0 cursor-pointer"
                >
                  View Info
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
