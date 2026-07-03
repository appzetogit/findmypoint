import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowUp, X } from "lucide-react";
import { categories } from "./Home";
import { subcategoriesData } from "./CategoryDetail";

interface AllCategoriesPageProps {
  onBack: () => void;
  onCategoryClick?: (categoryName: string, subcategoryName?: string) => void;
}

const getSubcategoryEmoji = (category: string, subcatName: string): string => {
  const name = subcatName.toLowerCase();
  const cat = category.toLowerCase();

  if (name.includes("massage")) return "💆";
  if (name.includes("salon")) return "💇";
  if (name.includes("parlour")) return "💄";

  if (name.includes("india")) return "🇮🇳";
  if (name.includes("nepal")) return "🇳🇵";
  if (name.includes("sri lanka")) return "🇱🇰";
  if (name.includes("bangladesh")) return "🇧🇩";
  if (name.includes("indonesia")) return "🇮🇩";
  if (name.includes("dubai")) return "🇦🇪";
  if (name.includes("uk")) return "🇬🇧";
  if (name.includes("usa")) return "🇺🇸";
  if (name.includes("australia")) return "🇦🇺";
  if (name.includes("japan")) return "🇯🇵";
  if (name.includes("china")) return "🇨🇳";
  if (name.includes("russia")) return "🇷🇺";
  if (name.includes("thailand")) return "🇹🇭";
  if (name.includes("france")) return "🇫🇷";
  if (name.includes("germany")) return "🇩🇪";
  if (name.includes("switzerland")) return "🇨🇭";

  if (name.includes("accounting") || name.includes("bank")) return "💰";
  if (name.includes("fresher") || name.includes("student")) return "👶";
  if (name.includes("government")) return "🏛️";
  if (name.includes("it") || name.includes("computer")) return "💻";
  if (name.includes("marketing") || name.includes("sales")) return "📈";
  if (name.includes("delivery")) return "🛵";

  if (name.includes("ac repair") || name.includes("ac service")) return "❄️";
  if (name.includes("carpenter")) return "🪚";
  if (name.includes("plumber")) return "🪠";
  if (name.includes("electrician")) return "⚡";
  if (name.includes("cleaner") || name.includes("cleaning")) return "🧹";

  if (name.includes("school") || name.includes("college") || name.includes("university"))
    return "🏫";
  if (name.includes("coaching") || name.includes("institute")) return "📚";

  if (name.includes("medicine") || name.includes("pharmacy")) return "💊";
  if (name.includes("clinic") || name.includes("hospital") || name.includes("nursing")) return "🏥";
  if (name.includes("doctor")) return "🩺";

  if (name.includes("resort")) return "🏖️";
  if (name.includes("banquet")) return "🏰";

  if (name.includes("women")) return "👚";
  if (name.includes("men")) return "👕";
  if (name.includes("kids")) return "🧒";

  if (
    name.includes("vedic") ||
    name.includes("palm") ||
    name.includes("horoscope") ||
    name.includes("tarot")
  )
    return "🔮";

  if (name.includes("restaurant") || name.includes("cafe")) return "🍲";
  if (name.includes("sweet") || name.includes("bakery")) return "🍰";

  if (name.includes("courier") || name.includes("parcel")) return "📦";

  if (cat.includes("spa")) return "💆";
  if (cat.includes("tour")) return "✈️";
  if (cat.includes("job")) return "💼";
  if (cat.includes("service")) return "🛠️";
  if (cat.includes("education")) return "🎓";
  if (cat.includes("health")) return "🏥";
  if (cat.includes("hotel")) return "🏨";
  if (cat.includes("doctor")) return "🩺";
  if (cat.includes("garment")) return "👗";
  if (cat.includes("astrologer")) return "🔮";
  if (cat.includes("product")) return "🛒";
  if (cat.includes("food")) return "🍲";
  if (cat.includes("courier")) return "📦";
  if (cat.includes("car")) return "🚗";

  return "🏷️";
};

const categoryGroups = categories.map((cat) => {
  const id = cat.label.toLowerCase().replace(/\s+/g, "-");
  const subcatList = subcategoriesData[cat.label] || [];
  return {
    id,
    label: cat.label,
    subcategories: subcatList.map((subName) => ({
      label: subName,
      icon: getSubcategoryEmoji(cat.label, subName),
      category: cat.label,
      subcat: subName,
    })),
  };
});

export default function AllCategoriesPage({ onBack, onCategoryClick }: AllCategoriesPageProps) {
  const [activeTab, setActiveTab] = useState(categoryGroups[0].id);
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
  }, []);

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

    if (searchQuery.trim() !== "") return;

    const sectionIds = categoryGroups.map((g) => g.id);
    let currentActive = sectionIds[0];

    for (const id of sectionIds) {
      const el = document.getElementById(`overlay-${id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 140) {
          currentActive = id;
        }
      }
    }
    setActiveTab(currentActive);
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Search Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background sticky top-0 z-10 shrink-0 w-full max-w-3xl mx-auto">
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

      {/* Tabs Bar */}
      {searchQuery.trim() === "" && (
        <div className="w-full border-b border-border/40 bg-background sticky top-[57px] z-10 shrink-0">
          <div
            ref={tabsContainerRef}
            className="flex gap-6 px-4 py-2.5 overflow-x-auto no-scrollbar max-w-3xl mx-auto scroll-smooth"
          >
            {categoryGroups.map((group) => (
              <button
                key={group.id}
                data-tab-id={group.id}
                onClick={() => scrollToSection(group.id)}
                className={`whitespace-nowrap pb-1.5 text-xs font-bold transition-all duration-300 border-b-2 cursor-pointer ${
                  activeTab === group.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Content List */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 bg-background w-full max-w-3xl mx-auto"
      >
        {searchQuery.trim() !== "" ? (
          // Search Results View
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Search Results
            </h3>
            {filteredSubcategories.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {filteredSubcategories.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onCategoryClick?.(sub.category, sub.subcat);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-card hover:bg-secondary text-[11px] font-semibold text-foreground/90 shadow-sm cursor-pointer transition-all duration-200"
                  >
                    <span className="text-[14px]">{sub.icon}</span>
                    <span>{sub.label}</span>
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
          // Default Grouped List View
          <div className="space-y-6 pb-20">
            {categoryGroups.map((group) => (
              <div key={group.id} id={`overlay-${group.id}`} className="scroll-mt-28">
                <h3 className="text-[13px] font-bold text-foreground mb-3">{group.label}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {group.subcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onCategoryClick?.(sub.category, sub.subcat);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-card hover:bg-secondary text-[11px] font-semibold text-foreground/90 shadow-sm cursor-pointer transition-all duration-200"
                    >
                      <span className="text-[14px]">{sub.icon}</span>
                      <span>{sub.label}</span>
                    </button>
                  ))}
                  {/* Three dots button */}
                  {group.subcategories.length > 0 && (
                    <button
                      onClick={() => {
                        onCategoryClick?.(group.label);
                      }}
                      className="flex items-center justify-center px-4 py-1.5 rounded-full border border-border/80 bg-card hover:bg-secondary text-[11px] font-black text-foreground/90 shadow-sm cursor-pointer transition-all duration-200"
                    >
                      •••
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
