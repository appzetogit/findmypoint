import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { getCategoryImage, getSubcategoryEmoji } from "../utils/categoryImages";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";


interface AllCategoriesPageProps {
  onBack: () => void;
  onCategoryClick?: (categoryName: string, subcategoryName?: string) => void;
  initialCategory?: string | null;
}

export default function AllCategoriesPage({ onBack, onCategoryClick, initialCategory }: AllCategoriesPageProps) {
  const { categories } = useCategories();
  const [categoryBanners, setCategoryBanners] = useState<any[]>([]);

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

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Search Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/80 bg-background sticky top-0 z-10 shrink-0 w-full max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Type here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/50 border border-border/80 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary transition-all duration-300"
          />
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden w-full max-w-3xl mx-auto bg-background">
        {/* Left Sidebar Menu */}
        {searchQuery.trim() === "" && (
          <div
            ref={tabsContainerRef}
            className="w-[110px] border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col py-2 overflow-y-auto no-scrollbar shrink-0"
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
                    <img
                      src={getCategoryImage(group.label, group.icon)}
                      alt={group.label}
                      className={`h-9 w-9 object-contain shrink-0 transition-all duration-200 ${isActive ? "scale-110 drop-shadow-md" : "scale-100 hover:scale-105"}`}
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
          className="flex-1 overflow-y-auto px-3.5 sm:px-4 pt-2 pb-4 bg-background"
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
                          <img src={sub.icon} alt={sub.label} className="h-12 w-12 object-contain rounded-md shrink-0" />
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
                        <img
                          src={getImageUrl(activeBanner.img)}
                          alt={group.label}
                          className="h-full w-full object-cover"
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
                              <img src={sub.icon} alt={sub.label} className="h-12 w-12 object-contain rounded-md shrink-0" />
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
