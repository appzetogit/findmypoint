import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, ChevronDown, ChevronUp, Trash2, X, Save, Sparkles } from "lucide-react";
import { categories } from "../pages/Home";
import { subcategoriesData } from "../pages/CategoryDetail";

interface AddSubcategoryFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddSubcategoryForm({ onCancel, onSuccess }: AddSubcategoryFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.label || "");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [localSubcategories, setLocalSubcategories] = useState<Record<string, string[]>>({});
  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setLocalSubcategories({ ...subcategoriesData });
    const saved = localStorage.getItem("fmp_custom_subcategories");
    if (saved) {
      try {
        setCustomSubcategories(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert("Please select a parent category.");
      return;
    }
    if (!subcategoryName.trim()) {
      alert("Subcategory name is required.");
      return;
    }

    const cleanSubName = subcategoryName.trim();

    try {
      const saved = localStorage.getItem("fmp_custom_subcategories");
      let customMap = saved ? JSON.parse(saved) : {};

      const existingSubcategories = subcategoriesData[selectedCategory] || [];
      if (existingSubcategories.some((s) => s.toLowerCase() === cleanSubName.toLowerCase())) {
        alert("This subcategory already exists under the selected category!");
        return;
      }

      // Add to customMap
      if (!customMap[selectedCategory]) {
        customMap[selectedCategory] = [];
      }
      customMap[selectedCategory].push(cleanSubName);
      localStorage.setItem("fmp_custom_subcategories", JSON.stringify(customMap));
      setCustomSubcategories(customMap);

      // Append to the active in-memory dictionary
      if (!subcategoriesData[selectedCategory]) {
        subcategoriesData[selectedCategory] = [];
      }
      subcategoriesData[selectedCategory].push(cleanSubName);
      setLocalSubcategories({ ...subcategoriesData });

      alert("Subcategory added successfully!");
      setSubcategoryName("");
      setIsModalOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to save subcategory.");
    }
  };

  const handleDeleteSubcategory = (catLabel: string, subcatName: string) => {
    if (confirm(`Are you sure you want to delete "${subcatName}" from "${catLabel}"?`)) {
      try {
        const saved = localStorage.getItem("fmp_custom_subcategories");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed[catLabel]) {
            parsed[catLabel] = parsed[catLabel].filter((s: string) => s !== subcatName);
            localStorage.setItem("fmp_custom_subcategories", JSON.stringify(parsed));
            setCustomSubcategories(parsed);
          }
        }

        // Remove from in-memory subcategoriesData
        if (subcategoriesData[catLabel]) {
          subcategoriesData[catLabel] = subcategoriesData[catLabel].filter((s) => s !== subcatName);
        }
        setLocalSubcategories({ ...subcategoriesData });
        alert("Subcategory deleted successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to delete subcategory.");
      }
    }
  };

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isCustomSub = (catLabel: string, subcatName: string) => {
    return customSubcategories[catLabel]?.includes(subcatName) || false;
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesCat = cat.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSub = (localSubcategories[cat.label] || []).some((sub) =>
      sub.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return matchesCat || matchesSub;
  });

  return (
    <div className="space-y-5 w-full animate-fade-in-up">
      {/* Header with Title and Add Subcategory Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left flex items-center gap-2.5">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Subcategory Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage and assign subcategories to their parent category groups.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-250 cursor-pointer self-start sm:self-auto text-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Subcategory
        </button>
      </div>

      {/* Main Listing & Search Area (Flat background, card wrapper removed) */}
      <div className="space-y-5 w-full">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search categories or subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-250"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsible Accordion Grid */}
        <div className="space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Sparkles className="h-10 w-10 mx-auto text-slate-300 mb-2 animate-pulse" />
              <p className="text-sm font-semibold">No categories or subcategories found</p>
            </div>
          ) : (
            filteredCategories.map((cat, idx) => {
              const subs = localSubcategories[cat.label] || [];
              const filteredSubs = subs.filter((sub) =>
                sub.toLowerCase().includes(searchQuery.toLowerCase()),
              );
              const isExpanded = !!expandedCategories[cat.label] || searchQuery.trim().length > 0;

              return (
                <div
                  key={`${cat.label}-${idx}`}
                  className="border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-slate-50/40 dark:bg-slate-950/20 hover:border-slate-350 dark:hover:border-slate-700 transition duration-200"
                >
                  {/* Category Header Row (Click to toggle) */}
                  <button
                    onClick={() => toggleCategory(cat.label)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition cursor-pointer text-left border-none outline-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-200/40 shrink-0">
                        <img
                          src={cat.img}
                          alt={cat.label}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {cat.label}
                        </h3>
                        <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">
                          {subs.length} subcategories{" "}
                          {searchQuery && `(${filteredSubs.length} matching)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content (Subcategory Pills) */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in">
                      {filteredSubs.length === 0 ? (
                        <p className="text-xs text-slate-450 dark:text-slate-500 italic py-1">
                          No subcategories to show.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2.5">
                          {filteredSubs.map((sub, sIdx) => {
                            const isCustom = isCustomSub(cat.label, sub);
                            return (
                              <div
                                key={`${sub}-${sIdx}`}
                                className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  isCustom
                                    ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30 hover:border-indigo-400"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700"
                                }`}
                              >
                                <span>{sub}</span>
                                {isCustom && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSubcategory(cat.label, sub);
                                    }}
                                    type="button"
                                    className="p-0.5 rounded text-indigo-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer border-none"
                                    title="Delete custom subcategory"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Subcategory Modal Dialog */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer animate-fade-in"
            />

            {/* Modal Content Card */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-left">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h2 className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Add New Subcategory
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition cursor-pointer border-none outline-none"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Create a new subcategory item and assign it to a parent category.
              </p>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Select Parent Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat.label} value={cat.label}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardio Specialist"
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border-none outline-none bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:shadow-lg transition cursor-pointer text-xs border-none"
                  >
                    <Save className="h-4 w-4" />
                    Save Subcategory
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
