import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  Search,
  X,
  TrendingUp,
  MapPin,
  ChevronDown,
  Building2,
  Tag,
  Compass,
  BadgeCheck,
} from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { getCategoryImage } from "../utils/categoryImages";
import { BusinessListingData } from "../data/businessesData";
import { LazyImage } from "../components/ui/LazyImage";
import { BACKEND_ORIGIN } from "../config";

interface MobileSearchPageProps {
  onBack: () => void;
  selectedCity: string;
  onOpenLocation: () => void;
  onBusinessSelect: (id: string) => void;
  onCategorySelect: (categoryName: string, subcategoryName?: string) => void;
  onPlaceSelect?: (placeName: string) => void;
  onNotificationsClick?: () => void;
  onSearchSubmit?: (query: string, location?: string) => void;
  allBusinesses?: BusinessListingData[];
}

export default function MobileSearchPage({
  onBack,
  selectedCity,
  onOpenLocation,
  onBusinessSelect,
  onCategorySelect,
  onPlaceSelect,
  onNotificationsClick,
  onSearchSubmit,
  allBusinesses = [],
}: MobileSearchPageProps) {
  const { categories, subcategoriesData } = useCategories();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fmp_recent_searches:v1");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const resolveBusinessImage = (biz: any) => {
    const img = (Array.isArray(biz.images) && biz.images.length > 0 ? biz.images[0] : null) || biz.image || biz.logo || "";
    if (img) {
      if (img.startsWith("data:") || img.startsWith("http")) return img;
      return `${BACKEND_ORIGIN}${img}`;
    }
    return getCategoryImage(biz.category || "") || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=200&q=80";
  };

  // Auto-focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save search to recent searches
  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem("fmp_recent_searches:v1", JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("fmp_recent_searches:v1");
    } catch {}
  };

  // Real-time search matches for businesses, categories, and subcategories
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { businesses: [], categories: [], subcategories: [] };

    const matchedBusinesses = allBusinesses
      .filter((b) => {
        const name = (b.name || "").toLowerCase();
        const cat = (b.category || "").toLowerCase();
        const sub = ((b as any).subCategory || (b as any).subcategory || "").toLowerCase();
        const loc = (b.location || b.address || "").toLowerCase();
        return (
          name.includes(q) ||
          cat.includes(q) ||
          sub.includes(q) ||
          loc.includes(q)
        );
      })
      .slice(0, 10);

    const matchedCategories: { categoryName: string; label: string; img?: string }[] = [];
    const matchedSubcategories: { categoryName: string; subcategoryName: string }[] = [];

    categories.forEach((cat) => {
      const catLabel = typeof cat === "string" ? cat : cat.label;
      const catImg = typeof cat !== "string" ? cat.img : "";
      if (catLabel.toLowerCase().includes(q)) {
        matchedCategories.push({ categoryName: catLabel, label: catLabel, img: catImg });
      }

      const subs =
        (typeof cat !== "string" && cat.subcategories
          ? cat.subcategories.map((s) => (typeof s === "string" ? s : s.label))
          : subcategoriesData[catLabel]) || [];

      subs.forEach((sub) => {
        if (sub.toLowerCase().includes(q)) {
          matchedSubcategories.push({
            categoryName: catLabel,
            subcategoryName: sub,
          });
        }
      });
    });

    return {
      businesses: matchedBusinesses,
      categories: matchedCategories.slice(0, 5),
      subcategories: matchedSubcategories.slice(0, 8),
    };
  }, [query, allBusinesses, categories, subcategoriesData]);

  const handleSelectBusiness = (b: BusinessListingData) => {
    const identifier = (b as any)._id || b.id || b.name;
    saveSearchTerm(b.name);
    onBusinessSelect(identifier);
  };

  const handleSelectCategory = (categoryName: string, subcategoryName?: string) => {
    const term = subcategoryName || categoryName;
    saveSearchTerm(term);
    if (onSearchSubmit) {
      onSearchSubmit(term, selectedCity);
    } else {
      onCategorySelect(categoryName, subcategoryName);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col text-foreground overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-3.5 py-3 flex items-center justify-between gap-2.5 shadow-xs">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-secondary text-foreground transition-colors cursor-pointer shrink-0"
          title="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Location Selector Button */}
        <button
          type="button"
          onClick={onOpenLocation}
          className="flex-1 h-10 sm:h-11 flex items-center justify-between gap-2 px-4 py-2 rounded-full hover:bg-secondary border border-border text-foreground transition-colors cursor-pointer shadow-xs min-w-0"
          title="Change Location"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">{selectedCity || "Select Location"}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </header>

      {/* Big Search Input Container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!query.trim()) return;
          saveSearchTerm(query.trim());
          if (onSearchSubmit) {
            onSearchSubmit(query.trim(), selectedCity);
          }
        }}
        className="px-3 pt-3 pb-2 bg-background border-b border-border/60"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-border bg-card shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selectedCity ? `Search in ${selectedCity}` : "Search businesses, services..."}
            className="flex-1 bg-transparent text-sm md:text-base outline-none placeholder:text-muted-foreground text-foreground min-w-0"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="h-6 w-6 rounded-full bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer shrink-0"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="submit"
            className="px-3 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shrink-0 cursor-pointer shadow-xs"
          >
            Search
          </button>
        </div>
      </form>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 text-left">
        {/* State A: When Query is EMPTY -> Show Real Dynamic Categories & Recent Searches */}
        {!query.trim() && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Recent Searches
                  </h4>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => (onSearchSubmit ? onSearchSubmit(term, selectedCity) : setQuery(term))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition cursor-pointer"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Real Categories Section (Zero Dummy/Mock Data) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span>Trending Categories</span>
                </h4>
              </div>

              <div className="divide-y divide-border/60">
                {categories.map((catItem: any, idx: number) => {
                  const catTitle = typeof catItem === "string" ? catItem : (catItem.label || catItem.name || "");
                  const catImg = typeof catItem !== "string" ? catItem.img : "";
                  const subCount = typeof catItem !== "string" && catItem.subcategories ? catItem.subcategories.length : 0;
                  if (!catTitle) return null;

                  return (
                    <button
                      key={catItem._id || `cat-${idx}`}
                      onClick={() => handleSelectCategory(catTitle)}
                      className="w-full py-3.5 flex items-center gap-3.5 hover:bg-secondary/50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center border border-border/60 shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                        {catImg ? (
                          <LazyImage
                            src={getCategoryImage(catTitle, catImg)}
                            alt={catTitle}
                            className="h-full w-full"
                            imgClassName="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="h-full w-full rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            <Compass className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {catTitle}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {subCount > 0 ? `${subCount} Services available` : "Browse verified listings"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* State B: When Query is NON-EMPTY -> Show Live Matching Results */}
        {query.trim() && (
          <div className="space-y-5">
            {/* Matching Subcategories / Categories */}
            {(searchResults.subcategories.length > 0 || searchResults.categories.length > 0) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Matching Categories
                </h4>
                <div className="divide-y divide-border/60">
                  {searchResults.subcategories.map((sub, idx) => (
                    <button
                      key={`sub-${idx}`}
                      onClick={() => handleSelectCategory(sub.categoryName, sub.subcategoryName)}
                      className="w-full py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {sub.subcategoryName}
                        </p>
                        <p className="text-xs text-muted-foreground">In {sub.categoryName}</p>
                      </div>
                    </button>
                  ))}

                  {searchResults.categories.map((cat, idx) => (
                    <button
                      key={`cat-${idx}`}
                      onClick={() => handleSelectCategory(cat.categoryName)}
                      className="w-full py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {cat.label}
                        </p>
                        <p className="text-xs text-muted-foreground">Main Category</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Businesses */}
            {searchResults.businesses.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Matching Businesses
                </h4>
                <div className="divide-y divide-border/60">
                  {searchResults.businesses.map((biz) => (
                    <button
                      key={(biz as any)._id || biz.id || biz.name}
                      onClick={() => handleSelectBusiness(biz)}
                      className="w-full py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-border/60 bg-muted">
                        <LazyImage
                          src={resolveBusinessImage(biz)}
                          alt={biz.name}
                          fallbackSrc={getCategoryImage(biz.category || "") || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=200&q=80"}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {biz.name}
                          </p>
                          {(biz as any).isVerified && (
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {[biz.location || biz.address || (biz as any).city || selectedCity, biz.category].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      {(biz as any).rating ? (
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                          ★ {(biz as any).rating}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State when no results found */}
            {searchResults.businesses.length === 0 &&
              searchResults.categories.length === 0 &&
              searchResults.subcategories.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">No matches found for "{query}"</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Try searching for another keyword, service, category, or check trending categories above.
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
