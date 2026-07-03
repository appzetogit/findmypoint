import { useState, useEffect } from "react";
import { Save, Tag, Trash2, Upload, Search, Image as ImageIcon } from "lucide-react";
import { categories } from "../pages/Home";
import { subcategoriesData } from "../pages/CategoryDetail";

interface AddCategoryFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddCategoryForm({ onCancel, onSuccess }: AddCategoryFormProps) {
  const [label, setLabel] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Track local categories to re-render component on delete/add
  const [localCats, setLocalCats] = useState<any[]>([]);

  useEffect(() => {
    setLocalCats([...categories]);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert("Category name is required.");
      return;
    }

    const finalImg =
      imgUrl.trim() ||
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80";

    const newCategory = {
      img: finalImg,
      label: label.trim(),
    };

    try {
      const saved = localStorage.getItem("fmp_custom_categories");
      let customList = saved ? JSON.parse(saved) : [];

      if (
        customList.some((c: any) => c.label.toLowerCase() === label.trim().toLowerCase()) ||
        categories.some((c: any) => c.label.toLowerCase() === label.trim().toLowerCase())
      ) {
        alert("This category already exists!");
        return;
      }

      customList.push(newCategory);
      localStorage.setItem("fmp_custom_categories", JSON.stringify(customList));

      // Append to the active in-memory array
      categories.push(newCategory);
      setLocalCats([...categories]);

      alert("Category added successfully!");
      setLabel("");
      setImgUrl("");
    } catch (error) {
      console.error(error);
      alert("Failed to save category.");
    }
  };

  const handleDeleteCategory = (catLabel: string) => {
    if (confirm(`Are you sure you want to delete the category "${catLabel}"?`)) {
      try {
        const saved = localStorage.getItem("fmp_custom_categories");
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = parsed.filter((c: any) => c.label !== catLabel);
          localStorage.setItem("fmp_custom_categories", JSON.stringify(updated));
        }

        // Remove from the in-memory array
        const idx = categories.findIndex((c) => c.label === catLabel);
        if (idx > -1) {
          categories.splice(idx, 1);
        }

        setLocalCats([...categories]);
        alert("Category deleted successfully!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter categories based on search query
  const filteredCats = localCats.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Check if category is custom/user-added (for deleting)
  const isCustomCategory = (catLabel: string) => {
    const saved = localStorage.getItem("fmp_custom_categories");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.some((c: any) => c.label === catLabel);
    }
    return false;
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
              <h2 className="text-sm font-bold text-slate-900 dark:text-white text-left">
                Existing Categories ({localCats.length})
              </h2>
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
                  const subcount = subcategoriesData[cat.label]?.length || 0;
                  const custom = isCustomCategory(cat.label);
                  return (
                    <div
                      key={`${cat.label}-${idx}`}
                      className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all duration-300 text-left"
                    >
                      {/* Icon */}
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-850 p-1 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
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

                      {/* Labels */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {cat.label}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {subcount} Subcategories
                        </p>
                      </div>

                      {/* Delete Action for Custom Categories */}
                      {custom && (
                        <button
                          onClick={() => handleDeleteCategory(cat.label)}
                          type="button"
                          className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
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
                <span className="text-[9px] text-slate-400">PNG, JPG, SVG up to 1MB</span>
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
