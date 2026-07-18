import { useState } from "react";
import { Save, Tag, Trash2, Upload, Search, Image as ImageIcon } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { getCategoryImage } from "../utils/categoryImages";
import { API_BASE_URL } from "../config";

interface AddCategoryFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddCategoryForm({ onCancel, onSuccess }: AddCategoryFormProps) {
  const { categories, refreshCategories } = useCategories();
  const [label, setLabel] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert("Category name is required.");
      return;
    }

    const finalImg =
      imgUrl.trim() ||
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80";

    try {
      const token = localStorage.getItem("fmp_admin_token");
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          label: label.trim(),
          img: finalImg
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Category added successfully!");
        setLabel("");
        setImgUrl("");
        await refreshCategories();
      } else {
        alert(data.message || "Failed to add category.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to server.");
    }
  };

  const handleDeleteCategory = async (catLabel: string) => {
    const catObj = categories.find((c) => c.label === catLabel);
    if (!catObj) return;

    if (confirm(`Are you sure you want to delete the category "${catLabel}"?`)) {
      try {
        const token = localStorage.getItem("fmp_admin_token");
        const res = await fetch(`${API_BASE_URL}/categories/${catObj._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.success) {
          alert("Category deleted successfully!");
          await refreshCategories();
        } else {
          alert(data.message || "Failed to delete category.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to connect to server.");
      }
    }
  };

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Filter categories based on search query
  const filteredCats = categories.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredCats.map((cat) => cat._id);
    const areAllSelected =
      allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedCategoryIds.includes(id));

    if (areAllSelected) {
      setSelectedCategoryIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedCategoryIds((prev) => {
        const next = [...prev];
        allFilteredIds.forEach((id) => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCategoryIds.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete the ${selectedCategoryIds.length} selected categories? This will also delete all of their subcategories.`
      )
    ) {
      try {
        const token = localStorage.getItem("fmp_admin_token");
        const res = await fetch(`${API_BASE_URL}/categories/delete-bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ids: selectedCategoryIds })
        });

        const data = await res.json();
        if (data.success) {
          alert("Categories deleted successfully!");
          setSelectedCategoryIds([]);
          await refreshCategories();
        } else {
          alert(data.message || "Failed to delete categories.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to connect to server.");
      }
    }
  };

  return (
    <div className="space-y-5 w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 text-left">
        <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
          <Tag className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Category Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage categories, view existing lists, or register new main directories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Side: Categories List (Col-span 2) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  disabled={filteredCats.length === 0}
                  checked={filteredCats.length > 0 && filteredCats.every((cat) => selectedCategoryIds.includes(cat._id))}
                  onChange={handleToggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-650 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Select / Deselect all visible categories"
                />
                {selectedCategoryIds.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {selectedCategoryIds.length} Selected
                    </span>
                    <button
                      onClick={handleDeleteSelected}
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 hover:text-rose-700 dark:text-rose-450 border border-rose-200/50 dark:border-rose-800/40 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                ) : (
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white text-left">
                    Existing Categories ({categories.length})
                  </h2>
                )}
              </div>
              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Grid of Category Cards */}
            {filteredCats.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ImageIcon className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">
                  No categories found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredCats.map((cat, idx) => {
                  const subcount = cat.subcategories?.length || 0;
                  const isSelected = selectedCategoryIds.includes(cat._id);
                  return (
                    <div
                      key={`${cat.label}-${idx}`}
                      className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 text-left ${
                        isSelected
                          ? "border-indigo-500/70 dark:border-indigo-500/70 bg-indigo-500/5 dark:bg-indigo-500/5 shadow-sm"
                          : "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md"
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(cat._id)}
                        className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-650 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                      />

                      {/* Icon */}
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-850 p-1 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                        <img
                          src={getCategoryImage(cat.label, cat.img)}
                          alt={cat.label}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80";
                          }}
                        />
                      </div>

                      {/* Labels */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {cat.label}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {subcount} Subcategories
                        </p>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteCategory(cat.label)}
                        type="button"
                        className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Add Category Panel (Col-span 1) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-lg space-y-4 sticky top-6 [&_input]:py-2 [&_input]:px-3.5 [&_input]:text-xs [&_input]:rounded-lg [&_button]:py-2 [&_button]:px-4 [&_button]:text-xs [&_button]:rounded-lg">
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-indigo-500" />
              Add Category
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Register a new core point directory in the database.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Wellness Point"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Upload Icon File
              </label>
              <div className="relative border border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  Click to upload icon
                </span>
                <span className="text-[9px] text-slate-400">PNG, JPG, SVG up to 10MB</span>
              </div>
            </div>

            {/* Icon Preview */}
            {imgUrl && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center gap-3 text-left">
                <div className="h-10 w-10 bg-white dark:bg-slate-850 border border-slate-200/30 rounded-xl p-1 flex items-center justify-center shadow-sm shrink-0">
                  <img src={imgUrl} alt="Preview" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    Icon Selected
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">Uploaded Image File</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-650/10 flex items-center justify-center gap-2 hover:shadow-indigo-600/25 active:scale-[0.99] transition duration-200 cursor-pointer text-xs uppercase tracking-wider"
              >
                <Save className="h-4 w-4" />
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
