import { useState, useEffect } from "react";
import { Image as ImageIcon, Save, Eye, CheckCircle, Upload, ChevronRight, Sliders } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";

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

const createBlankSlide = (): SliderItem => ({
  tag: "",
  title: "",
  description: "",
  img: "",
  categoryName: null
});

const blankSlides: SliderItem[] = [createBlankSlide()];

const blankCards: BannerItem[] = Array.from({ length: 3 }, (_, idx) => {
  const presets = [
    { gradient: "from-[#1e3d75] to-[#12274d]", themeColor: "group-hover:text-[#1e3d75]" },
    { gradient: "from-[#635bff] to-[#483fd3]", themeColor: "group-hover:text-[#635bff]" },
    { gradient: "from-[#008f5d] to-[#006b44]", themeColor: "group-hover:text-[#008f5d]" }
  ];
  const p = presets[idx] || presets[0];
  return {
    title: "",
    subtitle: "",
    img: "",
    gradient: p.gradient,
    themeColor: p.themeColor,
    categoryName: ""
  };
});

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
  const { categories } = useCategories();
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    return `${BACKEND_ORIGIN}${img}`;
  };

  // Load banners and categories list
  useEffect(() => {
    fetch(`${API_BASE_URL}/banners`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const fetchedSlides = data.slides && data.slides.length > 0 ? data.slides : blankSlides;
          const fetchedCards = data.cards && data.cards.length > 0
            ? [...data.cards.slice(0, 3), ...blankCards.slice(Math.min(3, data.cards.length))]
            : blankCards;
          setSliderBanners(fetchedSlides);
          setSideBanners(fetchedCards);
        }
      })
      .catch((err) => {
        console.error("Error loading banners:", err);
        setSliderBanners(blankSlides);
        setSideBanners(blankCards);
      });
  }, []);

  // Update categoriesList when categories from context change
  useEffect(() => {
    if (categories.length > 0) {
      setCategoriesList(categories.map((c) => c.label));
    }
  }, [categories]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("fmp_admin_token");
    const payloadType = managementMode === "side" ? "card" : "slide";
    const payloadBanners = managementMode === "side" ? sideBanners : sliderBanners;

    // Clean up local mock paths before saving to DB
    const normalizedBanners = payloadBanners.map(b => {
      const isBase64 = b.img.startsWith('data:');
      const isUploaded = b.img.includes('/uploads/');
      return {
        ...b,
        img: (isBase64 || isUploaded) ? b.img : ''
      };
    });

    try {
      const res = await fetch(`${API_BASE_URL}/banners/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: payloadType,
          banners: normalizedBanners
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSavedAlert(true);
        setTimeout(() => {
          setIsSavedAlert(false);
        }, 4000);
        
        // Update state with saved details
        let mapped = data.banners && data.banners.length > 0 ? data.banners : (managementMode === "side" ? blankCards : blankSlides);
        if (managementMode === "side") {
          if (mapped.length > 0 && mapped.length < 3) {
            mapped = [...mapped.slice(0, 3), ...blankCards.slice(Math.min(3, mapped.length))];
          }
          setSideBanners(mapped);
        } else {
          setSliderBanners(mapped);
        }
        
        // Trigger a custom event to notify components like Home.tsx
        window.dispatchEvent(new Event("fmp_banners_changed"));
      } else {
        alert("Failed to save banners: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving banners:", err);
      alert("Network error occurred while saving banners.");
    }
  };

  const handleReset = () => {
    if (window.confirm(`Are you sure you want to reset all ${managementMode === "side" ? "side" : "slider"} banners to blank?`)) {
      if (managementMode === "side") {
        setSideBanners(blankCards);
      } else {
        setSliderBanners(blankSlides);
      }
    }
  };

  if (sideBanners.length === 0 || sliderBanners.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading banners...</div>;
  }

  const currentSideBanner = sideBanners[activeSideTab] || blankCards[0];
  const currentSliderBanner = sliderBanners[activeSliderTab] || blankSlides[0];

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
              {/* Slider list and action buttons */}
              <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">
                    Existing Slides ({sliderBanners.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSliderBanners(prev => [...prev, createBlankSlide()]);
                      setActiveSliderTab(sliderBanners.length);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl border border-indigo-250 dark:border-indigo-900/40 transition cursor-pointer"
                  >
                    + Add Slide
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sliderBanners.map((slide, idx) => {
                    const isActive = activeSliderTab === idx;
                    return (
                      <div
                        key={idx}
                        className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isActive
                            ? "border-indigo-600 bg-indigo-50/15 dark:bg-indigo-950/10 ring-1 ring-indigo-600"
                            : "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="h-10 w-14 rounded-lg bg-slate-200 dark:bg-slate-850 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                            {slide.img ? (
                              <img
                                src={getImageUrl(slide.img)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                          </div>
                          {/* Info */}
                          <div className="min-w-0 text-left">
                            <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                              {slide.tag || "No Tag"}
                            </span>
                            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                              {slide.title.replace(/\\n/g, ' ') || "Untitled Slide"}
                            </h4>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                          <button
                            type="button"
                            onClick={() => setActiveSliderTab(idx)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete Slide ${idx + 1}?`)) {
                                setSliderBanners(prev => {
                                  const updated = prev.filter((_, i) => i !== idx);
                                  return updated.length > 0 ? updated : [createBlankSlide()];
                                });
                                setActiveSliderTab(prev => {
                                  if (prev >= sliderBanners.length - 1) {
                                    return Math.max(0, sliderBanners.length - 2);
                                  }
                                  return prev;
                                });
                              }
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-950/20 dark:hover:bg-rose-600 rounded-lg text-[10px] font-bold transition cursor-pointer border border-rose-250 dark:border-rose-900/40"
                            title="Delete Slide"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                {currentSliderBanner.img && (
                  <img
                    src={getImageUrl(currentSliderBanner.img)}
                    alt={currentSliderBanner.tag}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
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
                {currentSideBanner.img && (
                  <div className="absolute bottom-[-16px] right-0 w-[92%] h-[85%] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:translate-x-1">
                    <img
                      src={getImageUrl(currentSideBanner.img)}
                      alt={currentSideBanner.title}
                      className="h-full w-full object-cover object-top mix-blend-normal opacity-95"
                      style={{
                        maskImage: "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to left, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                      }}
                    />
                  </div>
                )}
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
