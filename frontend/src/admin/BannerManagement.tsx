import { useState, useEffect } from "react";
import { Image as ImageIcon, Save, Eye, CheckCircle, Upload, ChevronRight, Sliders } from "lucide-react";
import { categories as defaultCategories } from "../pages/Home";

// Imports for side banners defaults
import catRepairs from "../assets/cat-repairs.jpg";
import catRealestate from "../assets/cat-realestate.jpg";
import catDoctors from "../assets/cat-doctors.jpg";

// Imports for slider banners defaults
import heroFeatured from "../assets/hero-featured.jpg";
import catWedding from "../assets/cat-wedding.jpg";
import catDining from "../assets/cat-dining.jpg";
import touristUdaipur from "../assets/tourist_udaipur.png";

interface BannerItem {
  title: string;
  subtitle: string;
  img: string;
  gradient: string;
  themeColor: string;
  categoryName: string;
}

interface SliderItem {
  tag: string;
  title: string;
  description: string;
  img: string;
  categoryName: string | null;
}

const defaultSideBanners: BannerItem[] = [
  {
    title: "REPAIRS &\nSERVICES",
    subtitle: "Get Nearest Vendor",
    img: catRepairs,
    gradient: "from-[#1e3d75] to-[#12274d]",
    themeColor: "group-hover:text-[#1e3d75]",
    categoryName: "Service Point",
  },
  {
    title: "Hotel\npoint",
    subtitle: "Finest Agents",
    img: catRealestate,
    gradient: "from-[#635bff] to-[#483fd3]",
    themeColor: "group-hover:text-[#635bff]",
    categoryName: "Hotel Point",
  },
  {
    title: "DOCTORS",
    subtitle: "Book Now",
    img: catDoctors,
    gradient: "from-[#008f5d] to-[#006b44]",
    themeColor: "group-hover:text-[#008f5d]",
    categoryName: "Doctor Point",
  },
];

const defaultSliderBanners: SliderItem[] = [
  {
    tag: "# FEATURED SPOTLIGHT",
    title: "Discover the city's\nfinest establishments.",
    description: "Search across 5.3 crore+ verified businesses, professionals and services — curated for quality.",
    img: heroFeatured,
    categoryName: null,
  },
  {
    tag: "# WEDDING REQUISITES",
    title: "Plan your dream\nwedding day with us.",
    description: "Find top-rated banquet halls, caterers, decorators, and bridal makeup services.",
    img: catWedding,
    categoryName: "Spa Point",
  },
  {
    tag: "# FOOD & DINING",
    title: "Satisfy your cravings\nwith delicious food.",
    description: "Explore the best local restaurants, cafés, fast food joints, and cloud kitchens.",
    img: catDining,
    categoryName: "Food Point",
  },
  {
    tag: "# TRAVEL & TOURS",
    title: "Explore premium\ntravel destinations.",
    description: "Book custom holiday packages, car rentals, and luxury stays effortlessly.",
    img: touristUdaipur,
    categoryName: "Tour Point",
  },
];

const GRADIENT_PRESETS = [
  { name: "Deep Blue", gradient: "from-[#1e3d75] to-[#12274d]", themeColor: "group-hover:text-[#1e3d75]" },
  { name: "Indigo Purple", gradient: "from-[#635bff] to-[#483fd3]", themeColor: "group-hover:text-[#635bff]" },
  { name: "Forest Green", gradient: "from-[#008f5d] to-[#006b44]", themeColor: "group-hover:text-[#008f5d]" },
  { name: "Sunset Orange", gradient: "from-[#ea580c] to-[#c2410c]", themeColor: "group-hover:text-[#ea580c]" },
  { name: "Rose Crimson", gradient: "from-[#db2777] to-[#be185d]", themeColor: "group-hover:text-[#db2777]" }
];

export default function BannerManagement() {
  // Top Management Tab: "slider" or "side"
  const [managementMode, setManagementMode] = useState<"slider" | "side">("slider");

  // State for side banners (3 items)
  const [sideBanners, setSideBanners] = useState<BannerItem[]>([]);
  const [activeSideTab, setActiveSideTab] = useState<number>(0);

  // State for slider banners (4 items)
  const [sliderBanners, setSliderBanners] = useState<SliderItem[]>([]);
  const [activeSliderTab, setActiveSliderTab] = useState<number>(0);

  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  // Load banners and categories list
  useEffect(() => {
    // 1. Load side banners
    try {
      const savedSide = localStorage.getItem("fmp_hero_cards");
      if (savedSide) {
        const parsed = JSON.parse(savedSide);
        if (Array.isArray(parsed) && parsed.length === 3) {
          setSideBanners(parsed);
        } else {
          setSideBanners(defaultSideBanners);
        }
      } else {
        setSideBanners(defaultSideBanners);
      }
    } catch (e) {
      setSideBanners(defaultSideBanners);
    }

    // 2. Load slider banners
    try {
      const savedSlider = localStorage.getItem("fmp_hero_slides");
      if (savedSlider) {
        const parsed = JSON.parse(savedSlider);
        if (Array.isArray(parsed) && parsed.length === 4) {
          setSliderBanners(parsed);
        } else {
          setSliderBanners(defaultSliderBanners);
        }
      } else {
        setSliderBanners(defaultSliderBanners);
      }
    } catch (e) {
      setSliderBanners(defaultSliderBanners);
    }

    // 3. Load custom + default categories for the linking dropdown
    const catLabels = defaultCategories.map((c) => c.label);
    try {
      const savedCats = localStorage.getItem("fmp_custom_categories");
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed)) {
          parsed.forEach((cat: any) => {
            if (!catLabels.includes(cat.label)) {
              catLabels.push(cat.label);
            }
          });
        }
      }
    } catch (e) {
      console.error("Failed to load custom categories", e);
    }
    setCategoriesList(catLabels);
  }, []);

  const handleSideFieldChange = (field: keyof BannerItem, value: string) => {
    setSideBanners((prev) =>
      prev.map((b, idx) => (idx === activeSideTab ? { ...b, [field]: value } : b))
    );
  };

  const handleSliderFieldChange = (field: keyof SliderItem, value: any) => {
    setSliderBanners((prev) =>
      prev.map((s, idx) => (idx === activeSliderTab ? { ...s, [field]: value } : s))
    );
  };

  const handlePresetSelect = (gradient: string, themeColor: string) => {
    setSideBanners((prev) =>
      prev.map((b, idx) => (idx === activeSideTab ? { ...b, gradient, themeColor } : b))
    );
  };

  const handleSideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSideFieldChange("img", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSliderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSliderFieldChange("img", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (managementMode === "side") {
        localStorage.setItem("fmp_hero_cards", JSON.stringify(sideBanners));
      } else {
        localStorage.setItem("fmp_hero_slides", JSON.stringify(sliderBanners));
      }
      setIsSavedAlert(true);
      setTimeout(() => {
        setIsSavedAlert(false);
      }, 4000);
      // Notify Home page of changes via Storage event
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      alert("Error saving banners: " + err);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Are you sure you want to reset all ${managementMode === "side" ? "side" : "slider"} banners to default?`)) {
      if (managementMode === "side") {
        setSideBanners(defaultSideBanners);
      } else {
        setSliderBanners(defaultSliderBanners);
      }
    }
  };

  if (sideBanners.length === 0 || sliderBanners.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading banners...</div>;
  }

  const currentSideBanner = sideBanners[activeSideTab];
  const currentSliderBanner = sliderBanners[activeSliderTab];

  return (
    <div className="space-y-6 w-full animate-fade-in-up">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Banner Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customize the slider slides and the side promotional banner cards on the homepage
            </p>
          </div>
        </div>

        {/* Management Mode Toggler */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0 select-none">
          <button
            onClick={() => setManagementMode("slider")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              managementMode === "slider"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-transparent"
            }`}
          >
            Main Slider Slides
          </button>
          <button
            onClick={() => setManagementMode("side")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              managementMode === "side"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-transparent"
            }`}
          >
            Small Side Cards
          </button>
        </div>
      </div>

      {isSavedAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in text-left">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          <span>Homepage banner settings updated and saved successfully!</span>
        </div>
      )}

      {/* Editor & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
        {/* Left Form: Edit content */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
        >
          {managementMode === "slider" ? (
            /* ========================================================
               MAIN SLIDER BANNER FORM
               ======================================================== */
            <>
              {/* Slider selector tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2">
                {[0, 1, 2, 3].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSliderTab(idx)}
                    className={`px-5 py-2.5 text-xs font-black transition-all cursor-pointer border-b-2 -mb-2.5 ${
                      activeSliderTab === idx
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-350"
                    }`}
                  >
                    Slide {idx + 1}
                  </button>
                ))}
              </div>

              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pt-2">
                Edit Slider Slide {activeSliderTab + 1} Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Slide Tag */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Spotlight Tag
                  </label>
                  <input
                    type="text"
                    required
                    value={currentSliderBanner.tag}
                    onChange={(e) => handleSliderFieldChange("tag", e.target.value)}
                    placeholder="# FEATURED SPOTLIGHT"
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-medium"
                  />
                </div>

                {/* Linked Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Linked Category (Navigates here on click)
                  </label>
                  <select
                    value={currentSliderBanner.categoryName || ""}
                    onChange={(e) => handleSliderFieldChange("categoryName", e.target.value || null)}
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-bold"
                  >
                    <option value="">None / No Link</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slide Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Slide Title (Use \n for line break)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={currentSliderBanner.title}
                    onChange={(e) => handleSliderFieldChange("title", e.target.value)}
                    placeholder="Discover the city's\nfinest establishments."
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
                  />
                </div>

                {/* Slide Description */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Slide Description Text
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={currentSliderBanner.description}
                    onChange={(e) => handleSliderFieldChange("description", e.target.value)}
                    placeholder="Search across 5.3 crore+ verified businesses, professionals and services..."
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Slide Background Image
                </span>

                <div className="w-full">
                  {/* File Uploader */}
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-955/20 dark:hover:bg-slate-955/40 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-5 w-5 text-slate-400 mb-2" />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        Click to upload background image file
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        PNG, JPG or WEBP (Max 2MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSliderImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* ========================================================
               SMALL SIDE CARDS FORM
               ======================================================== */
            <>
              {/* Banner Selector Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSideTab(idx)}
                    className={`px-5 py-2.5 text-xs font-black transition-all cursor-pointer border-b-2 -mb-2.5 ${
                      activeSideTab === idx
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-350"
                    }`}
                  >
                    Banner {idx + 1}
                  </button>
                ))}
              </div>

              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pt-2">
                Edit Banner {activeSideTab + 1} Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Banner Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Banner Title (Use \n for line break)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={currentSideBanner.title}
                    onChange={(e) => handleSideFieldChange("title", e.target.value)}
                    placeholder="REPAIRS &\nSERVICES"
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
                  />
                </div>

                {/* Banner Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Banner Subtitle
                  </label>
                  <input
                    type="text"
                    required
                    value={currentSideBanner.subtitle}
                    onChange={(e) => handleSideFieldChange("subtitle", e.target.value)}
                    placeholder="Get Nearest Vendor"
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-medium"
                  />
                </div>

                {/* Linking Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Linked Category (Navigates here on click)
                  </label>
                  <select
                    value={currentSideBanner.categoryName}
                    onChange={(e) => handleSideFieldChange("categoryName", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-bold"
                  >
                    <option value="">Select a category...</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gradient Theme Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Background Theme / Color Preset
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {GRADIENT_PRESETS.map((preset) => {
                      const isSelected = currentSideBanner.gradient === preset.gradient;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handlePresetSelect(preset.gradient, preset.themeColor)}
                          className={`h-7 px-3 text-[10px] font-bold rounded-lg border text-white bg-gradient-to-r ${
                            preset.gradient
                          } transition cursor-pointer flex items-center justify-center ${
                            isSelected ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 border-white" : "border-transparent"
                          }`}
                          title={preset.name}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Banner Background Image
                </span>

                <div className="w-full">
                  {/* File Uploader */}
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-955/20 dark:hover:bg-slate-955/40 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-5 w-5 text-slate-400 mb-2" />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        Click to upload banner image file
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        PNG, JPG or WEBP (Max 2MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSideImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-200 dark:border-rose-900/40 transition cursor-pointer"
            >
              Reset Default {managementMode === "side" ? "Cards" : "Slides"}
            </button>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-5 py-2.5 text-xs font-black shadow-lg shadow-indigo-600/10 active:scale-95 transition cursor-pointer border-none"
              >
                <Save className="h-4 w-4" />
                Save {managementMode === "side" ? "Banners" : "Slides"}
              </button>
            </div>
          </div>
        </form>

        {/* Right Preview Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 flex flex-col items-center">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 w-full text-center">
            Live Preview
          </h2>

          <div className="w-full flex justify-center py-4 bg-slate-50 dark:bg-slate-955/20 rounded-2xl border border-slate-100 dark:border-slate-850/60">
            {managementMode === "slider" ? (
              /* Slider Preview: wide horizontal format */
              <div className="relative overflow-hidden rounded-2xl w-full max-w-[280px] h-[180px] select-none">
                <img
                  src={currentSliderBanner.img}
                  alt={currentSliderBanner.tag}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-900/45 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-white text-left">
                  <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.18em] text-amber-500">
                    {currentSliderBanner.tag}
                  </div>
                  <h1 className="font-serif text-[11px] leading-tight mb-1 whitespace-pre-line font-black">
                    {currentSliderBanner.title}
                  </h1>
                  <p className="max-w-[200px] text-[8px] text-white/80 leading-relaxed font-semibold">
                    {currentSliderBanner.description}
                  </p>
                  {currentSliderBanner.categoryName && (
                    <button
                      type="button"
                      className="mt-2.5 w-fit bg-emerald-600 text-white px-3 py-1 rounded-full text-[8px] font-bold shadow-md select-none border-none pointer-events-none"
                    >
                      Explore Now
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Side Card Preview: tall vertical portrait format */
              <button
                type="button"
                className={`group relative flex flex-col justify-between text-left overflow-hidden rounded-2xl bg-gradient-to-b ${
                  currentSideBanner.gradient
                } p-5 text-white shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 h-[260px] w-[170px] shrink-0 cursor-pointer`}
              >
                {/* Text Content */}
                <div className="relative z-10">
                  <div className="whitespace-pre-line text-sm font-black tracking-wider uppercase opacity-95 leading-tight">
                    {currentSideBanner.title}
                  </div>
                  <div className="mt-1.5 text-[10px] font-medium opacity-80 leading-tight">
                    {currentSideBanner.subtitle}
                  </div>
                </div>

                {/* Spacer */}
                <div className="mt-auto h-8" />

                {/* Arrow Button */}
                <div className="absolute left-0 bottom-5 z-20">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-r-lg bg-black/15 text-white backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:w-24 group-hover:bg-white ${
                      currentSideBanner.themeColor
                    }`}
                  >
                    <span className="max-w-0 opacity-0 overflow-hidden text-[11px] font-bold uppercase tracking-wider transition-all duration-500 ease-in-out group-hover:max-w-16 group-hover:opacity-100 group-hover:mr-1">
                      Explore
                    </span>
                    <ChevronRight className="h-4 w-4 stroke-[3px] shrink-0" />
                  </div>
                </div>

                {/* Character/Object Cutout Image */}
                <div className="absolute bottom-[-16px] right-0 w-[92%] h-[85%] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-1">
                  <img
                    src={currentSideBanner.img}
                    alt={currentSideBanner.title}
                    className="h-full w-full object-cover object-top mix-blend-normal opacity-95"
                    style={{
                      maskImage: "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                    }}
                  />
                </div>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 mt-2 text-center text-[10px] font-semibold">
            <Eye className="h-3.5 w-3.5" />
            <span>This matches the display format on the homepage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
