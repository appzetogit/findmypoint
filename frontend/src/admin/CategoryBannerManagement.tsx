import { useState, useEffect } from "react";
import { Megaphone, Save, Upload, Trash2, CheckCircle, Image as ImageIcon, Search, Plus, Tag } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";
import { LazyImage } from "../components/ui/LazyImage";

interface CategoryBannerItem {
  id?: string;
  categoryName: string;
  img: string;
  title: string;
  subtitle: string;
}

interface SearchBannerItem {
  id?: string;
  searchQuery: string;
  img: string;
  title?: string;
  subtitle?: string;
  phone?: string;
  location?: string;
  link?: string;
}

export default function CategoryBannerManagement() {
  const { categories } = useCategories();
  const [activeTab, setActiveTab] = useState<"category" | "search">("category");

  // Category Banners State
  const [categoryBanners, setCategoryBanners] = useState<CategoryBannerItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Search Banners State (Supports Multiple Banners)
  const [searchBanners, setSearchBanners] = useState<SearchBannerItem[]>([]);
  const [newSearchKeyword, setNewSearchKeyword] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    return `${BACKEND_ORIGIN}${img}`;
  };

  const loadAllBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/banners`);
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.categoryBanners)) {
          setCategoryBanners(
            data.categoryBanners.map((b: any, idx: number) => ({
              ...b,
              id: b._id || `cat_${idx}_${Date.now()}`,
            }))
          );
        }
        if (Array.isArray(data.searchBanners)) {
          setSearchBanners(
            data.searchBanners.map((b: any, idx: number) => ({
              ...b,
              id: b._id || `sb_${idx}_${Date.now()}`,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllBanners();
  }, []);

  // Category Banner Handlers
  const handleAddOrUpdateCategoryBanner = (categoryName: string, updates: Partial<CategoryBannerItem>) => {
    setCategoryBanners((prev) => {
      const index = prev.findIndex((item) => item.categoryName.toLowerCase() === categoryName.toLowerCase());
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = { ...copy[index], ...updates };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            categoryName,
            img: updates.img || "",
            title: updates.title || "",
            subtitle: updates.subtitle || "",
          },
        ];
      }
    });
  };

  const handleCategoryImgUpload = (categoryName: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        handleAddOrUpdateCategoryBanner(categoryName, { img: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCategoryBanner = (categoryName: string) => {
    setCategoryBanners((prev) => prev.filter((b) => b.categoryName.toLowerCase() !== categoryName.toLowerCase()));
  };

  const handleAddNewCategorySelection = () => {
    if (!selectedCategory) return;
    const exists = categoryBanners.some((b) => b.categoryName.toLowerCase() === selectedCategory.toLowerCase());
    if (exists) {
      alert(`Banner for "${selectedCategory}" already exists below.`);
      return;
    }
    handleAddOrUpdateCategoryBanner(selectedCategory, { img: "", title: "", subtitle: "" });
    setSelectedCategory("");
  };

  // Search Banner Handlers (By unique item ID)
  const handleUpdateSearchBanner = (id: string, updates: Partial<SearchBannerItem>) => {
    setSearchBanners((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSearchImgUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        handleUpdateSearchBanner(id, { img: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSearchBanner = (id: string) => {
    setSearchBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddNewSearchBanner = () => {
    const keyword = newSearchKeyword.trim() || "*";
    const newBanner: SearchBannerItem = {
      id: `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      searchQuery: keyword,
      img: "",
      title: "",
      subtitle: "",
      phone: "",
      location: "",
      link: "",
    };
    setSearchBanners((prev) => [newBanner, ...prev]);
    setNewSearchKeyword("");
  };

  // Save All Banners
  const handleSave = async () => {
    try {
      setSaving(true);
      const adminToken = localStorage.getItem("fmp_admin_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }

      // Save category banners
      await fetch(`${API_BASE_URL}/banners/save`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "category",
          banners: categoryBanners,
        }),
      });

      // Save search banners
      await fetch(`${API_BASE_URL}/banners/save`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "search",
          banners: searchBanners,
        }),
      });

      setIsSavedAlert(true);
      window.dispatchEvent(new Event("fmp_banners_changed"));
      setTimeout(() => setIsSavedAlert(false), 4000);
    } catch (err) {
      console.error("Error saving banners:", err);
      alert("Error saving banners.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading banners...</p>
      </div>
    );
  }

  const unconfiguredCategories = categories.filter(
    (cat) => !categoryBanners.some((b) => b.categoryName.toLowerCase() === cat.label.toLowerCase())
  );

  return (
    <div className="space-y-5 w-full animate-fade-in-up text-left">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Banner Advertise Management
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Manage category promotional banners and search promotional banners
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save All Banners"}
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("category")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "category"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Megaphone className="h-3.5 w-3.5" />
          <span>Category Advertise Banners ({categoryBanners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "search"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search Banners ({searchBanners.length})</span>
        </button>
      </div>

      {isSavedAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Banners saved successfully!</span>
        </div>
      )}

      {/* TAB 1: CATEGORY ADVERTISE BANNERS */}
      {activeTab === "category" && (
        <div className="space-y-4">
          {/* Select Category Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Add Banner For Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Select a Category --</option>
                {unconfiguredCategories.map((cat) => (
                  <option key={cat.label} value={cat.label}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddNewCategorySelection}
              disabled={!selectedCategory}
              className="w-full sm:w-auto sm:self-end bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              + Add Category Banner
            </button>
          </div>

          {/* Category Banners Grid */}
          {categoryBanners.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="h-5 w-5 stroke-1.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Category Banners Added Yet</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Select a category above to add its promotional banner.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBanners.map((item) => {
                const previewUrl = getImageUrl(item.img);
                return (
                  <div
                    key={item.categoryName}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      {/* Category Title Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate max-w-[180px]">
                            {item.categoryName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategoryBanner(item.categoryName)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Remove Banner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Compact Banner Image Preview */}
                      <div className="relative w-full h-32 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center group shadow-inner">
                        {previewUrl ? (
                          <>
                            <LazyImage
                              src={previewUrl}
                              alt={item.categoryName}
                              className="h-full w-full"
                              imgClassName="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                              {item.title && <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>}
                              {item.subtitle && <p className="text-[10px] text-slate-300 line-clamp-1">{item.subtitle}</p>}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <ImageIcon className="h-6 w-6 stroke-1.5" />
                            <span className="text-[11px] font-medium">No image uploaded</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Image Button */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Banner Image
                        </label>
                        <label className="flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer items-center justify-center gap-1.5 transition shadow-sm">
                          <Upload className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{item.img ? "Change Image" : "Upload Image"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleCategoryImgUpload(item.categoryName, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Banner Title */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Title (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Exclusive Discounts 30% Off"
                          value={item.title || ""}
                          onChange={(e) =>
                            handleAddOrUpdateCategoryBanner(item.categoryName, { title: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Banner Subtitle */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Tagline / Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Top verified providers near you"
                          value={item.subtitle || ""}
                          onChange={(e) =>
                            handleAddOrUpdateCategoryBanner(item.categoryName, { subtitle: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEARCH BANNERS (Multiple Banners Support) */}
      {activeTab === "search" && (
        <div className="space-y-4">
          {/* Add Search Banner Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Add New Banner (Search Query / Keyword or Category)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSearchKeyword}
                  onChange={(e) => setNewSearchKeyword(e.target.value)}
                  placeholder="e.g. Tour Point, Hostels, Hotels, Spa, or '*' for all searches"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                {categories.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) setNewSearchKeyword(e.target.value);
                    }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 max-w-[150px]"
                    defaultValue=""
                  >
                    <option value="" disabled>Pick Category</option>
                    <option value="*">* (All Searches)</option>
                    {categories.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <button
              onClick={handleAddNewSearchBanner}
              className="w-full sm:w-auto sm:self-end bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Banner</span>
            </button>
          </div>

          {/* Search Banners List / Table Form */}
          {searchBanners.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-5 w-5 stroke-1.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Search Banners Added Yet</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Click "+ Add Banner" above to upload promotional banner ads for searches.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Search Banners List ({searchBanners.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddNewSearchBanner}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Another Banner</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4 min-w-[180px]">Search Keyword / Query</th>
                      <th className="py-3 px-4 min-w-[280px]">Banner Graphic Preview</th>
                      <th className="py-3 px-4 min-w-[170px]">Change / Upload Photo</th>
                      <th className="py-3 px-4 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-xs text-slate-700 dark:text-slate-300">
                    {searchBanners.map((item, idx) => {
                      const itemId = item.id || `sb_${idx}`;
                      const previewUrl = getImageUrl(item.img);
                      return (
                        <tr
                          key={itemId}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-950/30 transition-colors"
                        >
                          {/* # */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                            {idx + 1}
                          </td>

                          {/* Keyword / Query */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                              <input
                                type="text"
                                value={item.searchQuery}
                                onChange={(e) =>
                                  handleUpdateSearchBanner(itemId, { searchQuery: e.target.value })
                                }
                                placeholder="e.g. Tour Point, Hostels, or *"
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 w-full max-w-[220px]"
                              />
                            </div>
                          </td>

                          {/* Banner Graphic Preview */}
                          <td className="py-3.5 px-4">
                            <div className="relative w-64 sm:w-72 h-14 sm:h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center p-1">
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={item.searchQuery}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                              ) : (
                                <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                                  <ImageIcon className="h-4 w-4 stroke-1.5" />
                                  <span>No image uploaded</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Change Photo */}
                          <td className="py-3.5 px-4">
                            <label className="inline-flex bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer items-center gap-1.5 transition shadow-sm">
                              <Upload className="h-3.5 w-3.5 text-indigo-500" />
                              <span>{item.img ? "Change Photo" : "Upload Photo"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleSearchImgUpload(itemId, e.target.files[0]);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </td>

                          {/* Action / Delete */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveSearchBanner(itemId)}
                              className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                              title="Delete Banner"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
