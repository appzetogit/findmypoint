import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Save, Sparkles, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { API_BASE_URL } from "../config";
const resolveImage = (imgStr: string) => {
  return imgStr || "";
};

interface HeroSubcategoryItem {
  img: string; // Base64 or URL or placeholder name
  label: string; // display name
  categoryName: string;
  subcategoryName: string;
}

interface HeroSection {
  _id?: string;
  title: string;
  items: HeroSubcategoryItem[];
}

export default function HeroSubcategoriesManagement() {
  const { categories, loading: categoriesLoading } = useCategories();
  const [sections, setSections] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch configured sections from the backend
  const fetchHeroSections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hero-sections`);
      const data = await res.json();
      if (data.success) {
        setSections(data.data || []);
        setError(null);
      } else {
        setError(data.message || "Failed to load hero sections.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSections();
  }, []);

  const handleImageUpload = (sectionIdx: number, itemIdx: number, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSections((prev) =>
        prev.map((sec, sIdx) => {
          if (sIdx !== sectionIdx) return sec;
          const newItems = sec.items.map((item, iIdx) =>
            iIdx === itemIdx ? { ...item, img: reader.result as string } : item
          );
          return { ...sec, items: newItems };
        })
      );
    };
    reader.readAsDataURL(file);
  };

  const handleAddSection = () => {
    if (sections.length >= 4) {
      alert("Maximum 4 sections allowed.");
      return;
    }
    setSections((prev) => [
      ...prev,
      {
        title: `New Section ${prev.length + 1}`,
        items: []
      }
    ]);
  };

  const handleRemoveSection = (sectionIdx: number) => {
    if (confirm("Are you sure you want to delete this section?")) {
      setSections((prev) => prev.filter((_, idx) => idx !== sectionIdx));
    }
  };

  const handleSectionTitleChange = (sectionIdx: number, title: string) => {
    setSections((prev) =>
      prev.map((sec, idx) => (idx === sectionIdx ? { ...sec, title } : sec))
    );
  };

  const handleAddItem = (sectionIdx: number) => {
    const section = sections[sectionIdx];
    if (section.items.length >= 3) {
      alert("Maximum 3 subcategories allowed per section.");
      return;
    }

    // Default to first category and first subcategory if available
    const defaultCat = categories[0]?.label || "";
    const defaultSub = categories[0]?.subcategories[0]?.label || "";

    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== sectionIdx) return sec;
        return {
          ...sec,
          items: [
            ...sec.items,
            {
              img: "",
              label: "", // Leave blank by default!
              categoryName: defaultCat,
              subcategoryName: defaultSub
            }
          ]
        };
      })
    );
  };

  const handleRemoveItem = (sectionIdx: number, itemIdx: number) => {
    setSections((prev) =>
      prev.map((sec, idx) =>
        idx === sectionIdx
          ? { ...sec, items: sec.items.filter((_, i) => i !== itemIdx) }
          : sec
      )
    );
  };

  const handleItemFieldChange = (
    sectionIdx: number,
    itemIdx: number,
    field: keyof HeroSubcategoryItem,
    value: string
  ) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== sectionIdx) return sec;
        const newItems = sec.items.map((item, iIdx) => {
          if (iIdx !== itemIdx) return item;
          const newItem = { ...item, [field]: value };
          if (field === "categoryName") {
            const catObj = categories.find((c) => c.label === value);
            newItem.subcategoryName = catObj?.subcategories[0]?.label || "";
          }
          return newItem;
        });
        return { ...sec, items: newItems };
      })
    );
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = temp;
      return next;
    });
  };

  const handleSave = async () => {
    // Validate titles and items
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (!sec.title.trim()) {
        alert(`Please enter a title for Section ${i + 1}.`);
        return;
      }
      if (sec.items.length === 0) {
        alert(`Section "${sec.title}" must have at least 1 subcategory item.`);
        return;
      }
      for (let j = 0; j < sec.items.length; j++) {
        const item = sec.items[j];
        if (!item.categoryName || !item.subcategoryName) {
          alert(`Please select a Category and Subcategory for slot ${j + 1} in "${sec.title}".`);
          return;
        }
        if (!item.label.trim()) {
          alert(`Please enter a Display Label for slot ${j + 1} in "${sec.title}".`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("fmp_admin_token");
      const res = await fetch(`${API_BASE_URL}/hero-sections/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sections })
      });
      const data = await res.json();
      if (data.success) {
        alert("Hero Subcategories saved successfully!");
        setSections(data.data || []);
      } else {
        alert(data.message || "Failed to save layout.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend server.");
    } finally {
      setSaving(false);
    }
  };

  if (categoriesLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left flex items-center gap-2.5">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hero Subcategory Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure up to 4 dynamic homepage sections, each showcasing up to 3 subcategories.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleAddSection}
            disabled={sections.length >= 4}
            className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg flex items-center gap-1.5 transition duration-200 text-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-800/30 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-450 text-left">
          {error}
        </div>
      )}

      {/* Sections Config Layout */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8">
            <Sparkles className="h-10 w-10 mx-auto text-slate-300 mb-3 animate-pulse" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-350">No sections added yet</p>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Click the "Add Section" button to create your first dynamic subcategory layout grid.
            </p>
          </div>
        ) : (
          sections.map((section, sectionIdx) => (
            <div
              key={sectionIdx}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 md:p-6 shadow-md transition-all text-left space-y-5"
            >
              {/* Section Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-850">
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    Section #{sectionIdx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding Requisites"
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(sectionIdx, e.target.value)}
                    className="flex-1 max-w-md bg-slate-50 dark:bg-slate-950 text-sm px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleMoveSection(sectionIdx, 'up')}
                    disabled={sectionIdx === 0}
                    className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/65 text-slate-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(sectionIdx, 'down')}
                    disabled={sectionIdx === sections.length - 1}
                    className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/65 text-slate-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem(sectionIdx)}
                    disabled={section.items.length >= 3}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 px-3 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Subcategory
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(sectionIdx)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories Grid inside Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {section.items.length === 0 ? (
                  <div className="md:col-span-3 text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400 font-semibold">No subcategory slots added in this section yet.</p>
                    <button
                      onClick={() => handleAddItem(sectionIdx)}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Click here to add one.
                    </button>
                  </div>
                ) : (
                  section.items.map((item, itemIdx) => {
                    const selectedCatObj = categories.find((c) => c.label === item.categoryName);
                    const subcatList = selectedCatObj?.subcategories || [];

                    return (
                      <div
                        key={itemIdx}
                        className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 space-y-4 relative"
                      >
                        {/* Remove Slot X Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(sectionIdx, itemIdx)}
                          className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center bg-slate-200 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-455 hover:text-rose-600 cursor-pointer transition"
                          title="Remove Subcategory"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>

                        <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded">
                          Slot #{itemIdx + 1}
                        </span>

                        {/* Category Selector */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                            Parent Category
                          </label>
                          <select
                            value={item.categoryName}
                            onChange={(e) =>
                              handleItemFieldChange(sectionIdx, itemIdx, "categoryName", e.target.value)
                            }
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 font-semibold cursor-pointer"
                          >
                            <option value="" disabled>Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat.label}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Subcategory Selector */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                            Subcategory
                          </label>
                          <select
                            value={item.subcategoryName}
                            onChange={(e) =>
                              handleItemFieldChange(sectionIdx, itemIdx, "subcategoryName", e.target.value)
                            }
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 font-semibold cursor-pointer"
                          >
                            <option value="" disabled>Select Subcategory</option>
                            {subcatList.map((sub, idx) => (
                              <option key={`${sub.label}-${idx}`} value={sub.label}>
                                {sub.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Display Label input */}
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                            Display Label
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              handleItemFieldChange(sectionIdx, itemIdx, "label", e.target.value)
                            }
                            placeholder="Display name on home"
                            className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 font-semibold"
                          />
                        </div>

                        {/* Banner Image Uploader */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                            Banner Image (16:10 aspect recommended)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex flex-col items-center justify-center h-14 w-20 rounded-xl border border-dashed border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer overflow-hidden transition shrink-0 relative group">
                              {item.img ? (
                                <>
                                  <img
                                    src={resolveImage(item.img)}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      // Fallback if local seed placeholder fails to resolve
                                      (e.target as HTMLImageElement).src =
                                        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=150&q=80";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition">
                                    Change
                                  </div>
                                </>
                              ) : (
                                <Upload className="h-4 w-4 text-slate-400" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(sectionIdx, itemIdx, file);
                                }}
                                className="hidden"
                              />
                            </label>
                            {item.img && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSections((prev) =>
                                    prev.map((sec, sIdx) => {
                                      if (sIdx !== sectionIdx) return sec;
                                      const newItems = sec.items.map((item, iIdx) =>
                                        iIdx === itemIdx ? { ...item, img: "" } : item
                                      );
                                      return { ...sec, items: newItems };
                                    })
                                  )
                                }
                                className="text-[10px] text-rose-500 font-bold hover:underline bg-transparent border-none cursor-pointer"
                              >
                                Remove Image
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Save Bar */}
      {sections.length > 0 && (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={fetchHeroSections}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border-none outline-none bg-transparent"
          >
            Reset Layout
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:shadow-lg transition cursor-pointer text-xs border-none"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      )}
    </div>
  );
}
