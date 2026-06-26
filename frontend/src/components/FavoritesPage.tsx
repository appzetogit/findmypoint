import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface FavoritesPageProps {
  onNavigateToBusiness?: (categoryName: string, subCategoryName: string, businessId: string) => void;
}

export default function FavoritesPage({ onNavigateToBusiness }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fmp_profile_favorites:v1");
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites(["doctor", "restaurant", "spa"]);
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
    }
  }, []);

  const mockRecommended = [
    { id: "REST002213", name: "Shree shyam restaurant", category: "Food Point", sub: "Restaurants", icon: "🍽️", rating: 4.8, distance: "1.2 km" },
    { id: "DOC00412", name: "Dr. Batra Dental Clinic", category: "Health Care Point", sub: "Doctors", icon: "🩺", rating: 4.9, distance: "0.8 km" },
    { id: "SPA001", name: "Orchid Spa & Salon", category: "Spa Point", sub: "Spa & Salon", icon: "💆", rating: 4.7, distance: "2.3 km" },
    { id: "SRV003", name: "Apex AC Repair Hub", category: "Service Point", sub: "AC Repair", icon: "❄️", rating: 4.6, distance: "1.5 km" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Your Selected Categories</h3>
        <p className="text-xs text-muted-foreground mt-0.5">These categories are prioritized on your dashboard to customize suggestions.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-xs font-bold text-slate-400 bg-secondary/5">
          No favorites configured. Click Edit Profile to set your preferences.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {favorites.map(fav => (
            <span 
              key={fav} 
              className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/15 text-primary text-xs font-black uppercase flex items-center gap-1.5 shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockRecommended.map(rec => (
            <div key={rec.id} className="p-4 bg-card border border-border rounded-2xl shadow-sm flex items-center justify-between hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{rec.icon}</span>
                <div>
                  <span className="text-[9px] font-black uppercase text-primary/85">{rec.sub}</span>
                  <h5 className="text-xs font-black text-foreground mt-0.5">{rec.name}</h5>
                  <span className="text-[10px] text-muted-foreground mt-1 block">⭐ {rec.rating} • {rec.distance}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (onNavigateToBusiness) {
                    onNavigateToBusiness(rec.category, rec.sub, rec.id);
                  } else {
                    alert(`Details flow for ${rec.name}`);
                  }
                }}
                className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-black rounded-lg transition"
              >
                View Info
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
