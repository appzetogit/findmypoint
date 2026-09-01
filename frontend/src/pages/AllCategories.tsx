import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowUp, MapPin, ChevronDown, Search, X, Navigation, Clock } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { getCategoryImage, getSubcategoryEmoji } from "../utils/categoryImages";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";
import { LazyImage } from "../components/ui/LazyImage";
import { getCurrentUserLocation, reverseGeocodeCoords } from "../utils/googleMaps";
import MobileLocationPage from "./MobileLocationPage";

interface AllCategoriesPageProps {
  onBack: () => void;
  onCategoryClick?: (categoryName: string, subcategoryName?: string) => void;
  initialCategory?: string | null;
}

export default function AllCategoriesPage({ onBack, onCategoryClick, initialCategory }: AllCategoriesPageProps) {
  const { categories } = useCategories();
  const [categoryBanners, setCategoryBanners] = useState<any[]>([]);

  // Location State
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    try {
      return (
        localStorage.getItem("fmp_selected_city:v1") ||
        localStorage.getItem("fmp_selected_location") ||
        localStorage.getItem("fmp_selected_city") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMobileLocation, setShowMobileLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("fmp_recent_locations:v1") || "[]");
    } catch {
      return [];
    }
  });
  const locationRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectArea = (locName: string) => {
    const trimmed = locName.trim();
    if (!trimmed) return;
    setSelectedCity(trimmed);
    localStorage.setItem("fmp_selected_city:v1", trimmed);
    localStorage.setItem("fmp_selected_location", trimmed);
    const updated = [trimmed, ...recentLocations.filter((l) => l !== trimmed)].slice(0, 8);
    setRecentLocations(updated);
    localStorage.setItem("fmp_recent_locations:v1", JSON.stringify(updated));
    setShowLocationDropdown(false);
    setShowMobileLocation(false);
    window.dispatchEvent(new CustomEvent("fmp_city_changed", { detail: trimmed }));
  };

  const handleDetectLocation = async () => {
    setDetectingGps(true);
    try {
      const coords = await getCurrentUserLocation({ forceFresh: true });
      if (coords) {
        const addr = await reverseGeocodeCoords(coords.lat, coords.lng);
        if (addr) {
          const locStr = [addr.area, addr.city].filter(Boolean).join(", ") || addr.shortName || addr.city || "Current Location";
          handleSelectArea(locStr);
        }
      }
    } catch (err) {
      console.error("GPS detection failed:", err);
    } finally {
      setDetectingGps(false);
    }
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/banners`);
        const data = await res.json();
        if (data.success && Array.isArray(data.categoryBanners)) {
          setCategoryBanners(data.categoryBanners);
        }
      } catch (err) {
        console.error("Failed to load category banners:", err);
      }
    };
    fetchBanners();
    window.addEventListener("fmp_banners_changed", fetchBanners);
    return () => window.removeEventListener("fmp_banners_changed", fetchBanners);
  }, []);

  const getImageUrl = (img?: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    return `${BACKEND_ORIGIN}${img}`;
  };

  const categoryGroups = useMemo(() => {
    return categories.map((cat) => {
      const id = cat.label.toLowerCase().replace(/\s+/g, "-");
      return {
        id,
        label: cat.label,
        icon: cat.img,
        subcategories: cat.subcategories.map((sub) => ({
          label: sub.label,
          icon: sub.icon || getSubcategoryEmoji(cat.label, sub.label),
          category: cat.label,
          subcat: sub.label,
        })),
      };
    });
  }, [categories]);

  const initialTabId = useMemo(() => {
    if (initialCategory) {
      const match = categoryGroups.find(
        (g) => g.label.toLowerCase() === initialCategory.toLowerCase()
      );
      if (match) return match.id;
    }
    return categoryGroups[0]?.id || "";
  }, [initialCategory, categoryGroups]);

  const [activeTab, setActiveTab] = useState(initialTabId);

  useEffect(() => {
    if (initialCategory) {
      const match = categoryGroups.find(
        (g) => g.label.toLowerCase() === initialCategory.toLowerCase()
      );
      if (match) {
        setActiveTab(match.id);
      }
    }
  }, [initialCategory, categoryGroups]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeEl = tabsContainerRef.current?.querySelector(`[data-tab-id="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  const allSubcategories = useMemo(() => {
    return categoryGroups.flatMap((group) =>
      group.subcategories.map((sub) => ({
        ...sub,
        groupLabel: group.label,
      })),
    );
  }, [categoryGroups]);

  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allSubcategories.filter((sub) =>
      sub.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allSubcategories]);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(`overlay-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setShowScrollTop(container.scrollTop > 200);
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (showMobileLocation) {
    return (
      <MobileLocationPage
        onBack={() => setShowMobileLocation(false)}
        selectedCity={selectedCity}
        onSelectLocation={(location) => {
          handleSelectArea(location);
          setShowMobileLocation(false);
        }}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Sticky Header with Location Selector Top Row & Full Search Bar Row */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl shrink-0 w-full max-w-3xl mx-auto">
        <div className="w-full px-3 sm:px-4 py-2.5 flex flex-col gap-2.5">
          {/* Top Row: Back button & Centered Location Selector Pill */}
          <div className="relative flex items-center justify-between w-full min-h-[38px] sm:min-h-[42px]">
            {/* Left: Back Button */}
            <button
              onClick={onBack}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-secondary transition-colors cursor-pointer shrink-0 z-10"
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>

            {/* Center: Location Selector Pill */}
            <div ref={locationRef} className="absolute inset-x-0 mx-auto flex justify-center w-fit max-w-[calc(100%-84px)] z-10">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setShowMobileLocation(true);
                  } else {
                    setShowLocationDropdown(!showLocationDropdown);
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:py-2 rounded-full border border-border bg-card hover:bg-secondary/70 text-xs sm:text-sm font-semibold text-foreground cursor-pointer shadow-xs transition-all max-w-full justify-between"
                title={`Current Location: ${selectedCity || "Select Location"}`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-500 shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-[240px] md:max-w-xs">
                    {detectingGps ? "Detecting..." : selectedCity || "Select Location"}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    showLocationDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Location Dropdown Modal */}
              {showLocationDropdown && (
                <div className="fixed inset-x-4 top-20 sm:absolute sm:top-[calc(100%+8px)] sm:left-1/2 sm:-translate-x-1/2 sm:min-w-[360px] sm:w-auto bg-card border border-border rounded-2xl shadow-2xl z-[60] text-left overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Location Search Bar Header */}
                  <div className="p-3 border-b border-border/60 bg-secondary/30">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card shadow-xs focus-within:border-primary transition-all">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder="Search city, area or locality..."
                        className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground text-foreground min-w-0"
                        autoFocus
                      />
                      {locationQuery && (
                        <button
                          type="button"
                          onClick={() => setLocationQuery("")}
                          className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setShowLocationDropdown(false);
                          setLocationQuery("");
                        }}
                        className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition cursor-pointer shrink-0"
                        title="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {locationQuery.trim() ? (
                    <div className="p-2 max-h-[280px] overflow-y-auto no-scrollbar space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectArea(locationQuery.trim());
                          setLocationQuery("");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer text-left group"
                      >
                        <Search className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-xs font-bold text-primary truncate">
                          Search for "{locationQuery.trim()}"
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 space-y-1 max-h-[340px] overflow-y-auto no-scrollbar">
                      {/* Detect Live GPS */}
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingGps}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/40 border border-blue-200/60 transition cursor-pointer group disabled:opacity-60"
                      >
                        <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center shrink-0">
                          <Navigation className={`h-3.5 w-3.5 fill-current ${detectingGps ? "animate-spin" : ""}`} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            {detectingGps ? "Detecting Live Location..." : "Refresh Live GPS Location"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Auto-detects your current address
                          </span>
                        </div>
                      </button>

                      {/* Recent Locations */}
                      {recentLocations.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1">
                            Recent Locations
                          </p>
                          {recentLocations.slice(0, 5).map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => handleSelectArea(loc)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/70 transition cursor-pointer text-left"
                            >
                              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-[13px] font-semibold text-foreground">{loc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2 (Underneath): Full Width Search Input Bar */}
          <div className="relative w-full">
            <div className="flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-2xl border border-border bg-card shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-full min-w-0">
              <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search categories, subcategories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-1.5 py-1 text-xs sm:text-sm md:text-base outline-none text-foreground w-full min-w-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden w-full max-w-3xl mx-auto bg-background pb-16 sm:pb-0">
        {/* Left Sidebar Menu */}
        {searchQuery.trim() === "" && (
          <div
            ref={tabsContainerRef}
            className="w-[110px] border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col py-2 overflow-y-auto no-scrollbar shrink-0 pb-6 touch-pan-y"
          >
            {categoryGroups.map((group) => {
              const isActive = activeTab === group.id;
              return (
                <button
                  key={group.id}
                  data-tab-id={group.id}
                  onClick={() => {
                    setActiveTab(group.id);
                    if (containerRef.current) {
                      containerRef.current.scrollTop = 0;
                    }
                  }}
                  className={`relative mx-2 my-1 px-1 py-3 text-[10px] sm:text-[11px] font-bold leading-tight text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 justify-center rounded-xl ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {/* Vertical left border highlight */}
                  {isActive && (
                    <span className="absolute left-1 top-2.5 bottom-2.5 w-[3.5px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                  {/* Category Icon */}
                  {group.icon && (
                    <LazyImage
                      src={getCategoryImage(group.label, group.icon)}
                      alt={group.label}
                      className={`h-9 w-9 shrink-0 transition-all duration-200 ${isActive ? "scale-110 drop-shadow-md" : "scale-100 hover:scale-105"}`}
                      imgClassName="h-full w-full object-contain"
                    />
                  )}
                  <span>{group.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right Details Panel */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3.5 sm:px-4 pt-2 pb-6 bg-background touch-pan-y"
        >
          {searchQuery.trim() !== "" ? (
            // Search Results View
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-foreground/90 uppercase tracking-wide mb-2 text-left">
                Search Results
              </h3>
              {filteredSubcategories.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredSubcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onCategoryClick?.(sub.category, sub.subcat);
                      }}
                      className="flex flex-col items-center justify-center p-2 bg-transparent text-center cursor-pointer transition-all duration-200 aspect-square active:scale-95 gap-1"
                    >
                      <span className="text-4xl shrink-0 flex items-center justify-center">
                        {sub.icon.startsWith("data:image") || sub.icon.startsWith("http") ? (
                          <LazyImage
                            src={sub.icon}
                            alt={sub.label}
                            className="h-12 w-12 rounded-md shrink-0 overflow-hidden"
                            imgClassName="h-full w-full object-contain"
                          />
                        ) : (
                          sub.icon
                        )}
                      </span>
                      <span className="text-[9.5px] font-bold leading-tight text-foreground/90 line-clamp-2 px-0.5">
                        {sub.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No matching categories found for "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            // Selected Group Content
            <div className="space-y-4">
              {categoryGroups.map((group) => {
                if (group.id !== activeTab) return null;

                const activeBanner = categoryBanners.find(
                  (b) => b.categoryName?.toLowerCase() === group.label.toLowerCase()
                );

                return (
                  <div key={group.id} className="animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
                    {/* Category Advertise Banner (rendered above heading) */}
                    {activeBanner && activeBanner.img && (
                      <div className="mb-3 relative w-full overflow-hidden rounded-xl shadow-sm aspect-[2.1/1] bg-secondary border border-border/40">
                        <LazyImage
                          src={getImageUrl(activeBanner.img)}
                          alt={group.label}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover"
                        />
                        {(activeBanner.title || activeBanner.subtitle) && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3.5 text-white">
                            {activeBanner.title && (
                              <div className="font-bold text-sm leading-tight">{activeBanner.title}</div>
                            )}
                            {activeBanner.subtitle && (
                              <div className="text-xs opacity-90 mt-1 leading-tight">{activeBanner.subtitle}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Category Heading (rendered below banner) */}
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground/90 uppercase tracking-wide mb-2.5 border-b border-border/40 pb-1.5 -mt-0.5">
                      {group.label}
                    </h3>

                    <div className="grid grid-cols-3 gap-2.5">
                      {group.subcategories.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onCategoryClick?.(sub.category, sub.subcat);
                          }}
                          className="flex flex-col items-center justify-center p-2 bg-transparent text-center cursor-pointer transition-all duration-200 aspect-square active:scale-95 gap-1"
                        >
                          <span className="text-4xl shrink-0 flex items-center justify-center">
                            {sub.icon.startsWith("data:image") || sub.icon.startsWith("http") ? (
                              <LazyImage
                                src={sub.icon}
                                alt={sub.label}
                                className="h-12 w-12 rounded-md shrink-0 overflow-hidden"
                                imgClassName="h-full w-full object-contain"
                              />
                            ) : (
                              sub.icon
                            )}
                          </span>
                          <span className="text-[9.5px] font-bold leading-tight text-foreground/90 line-clamp-2 px-0.5">
                            {sub.label}
                          </span>
                        </button>
                      ))}
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-3 rounded-full bg-secondary/80 hover:bg-secondary border border-border/60 text-foreground shadow-md transition-all duration-300 hover:scale-105 cursor-pointer z-20"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
