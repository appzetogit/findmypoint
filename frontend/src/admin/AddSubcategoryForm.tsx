import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, ChevronDown, ChevronUp, Trash2, X, Save, Sparkles } from "lucide-react";
import { useCategories } from "../context/CategoryContext";
import { getCategoryImage } from "../utils/categoryImages";
import { API_BASE_URL } from "../config";

interface AddSubcategoryFormProps {
  onCancel: () => void;
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

export default function AddSubcategoryForm({ onCancel }: AddSubcategoryFormProps) {
  const { categories, refreshCategories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [iconImage, setIconImage] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].label);
    }
  }, [categories, selectedCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  // Edit subcategory states
  const [editingSub, setEditingSub] = useState<{ category: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState<string | null>(null);

  useEffect(() => {
    if (editingSub) {
      setEditName(editingSub.name);
      // Find subcategory icon from categories
      const catObj = categories.find((c) => c.label === editingSub.category);
      const subObj = catObj?.subcategories.find((s) => s.label === editingSub.name);
      setEditIcon(subObj?.icon || null);
    } else {
      setEditName("");
      setEditIcon(null);
    }
  }, [editingSub, categories]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    if (!editName.trim()) {
      alert("Subcategory name is required.");
      return;
    }

    const cleanOldName = editingSub.name.trim();
    const cleanNewName = editName.trim();
    const catLabel = editingSub.category;

    const catObj = categories.find((c) => c.label === catLabel);
    if (!catObj) return;

    try {
      const token = localStorage.getItem("fmp_admin_token");
      const res = await fetch(
        `${API_BASE_URL}/categories/${catObj._id}/subcategories/${encodeURIComponent(cleanOldName)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            label: cleanNewName,
            icon: editIcon || ""
          })
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Subcategory updated successfully!");
        setEditingSub(null);
        await refreshCategories();
      } else {
        alert(data.message || "Failed to update subcategory.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server.");
    }
  };

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
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
    const catObj = categories.find((c) => c.label === selectedCategory);
    if (!catObj) return;

    try {
      const token = localStorage.getItem("fmp_admin_token");
      const res = await fetch(`${API_BASE_URL}/categories/${catObj._id}/subcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          label: cleanSubName,
          icon: iconImage || ""
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Subcategory added successfully!");
        setSubcategoryName("");
        setIconImage(null);
        setIsModalOpen(false);
        await refreshCategories();
      } else {
        alert(data.message || "Failed to add subcategory.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to server.");
    }
  };

  const handleDeleteSubcategory = async (catLabel: string, subcatName: string) => {
    const catObj = categories.find((c) => c.label === catLabel);
    if (!catObj) return;

    if (confirm(`Are you sure you want to delete "${subcatName}" from "${catLabel}"?`)) {
      try {
        const token = localStorage.getItem("fmp_admin_token");
        const res = await fetch(
          `${API_BASE_URL}/categories/${catObj._id}/subcategories/${encodeURIComponent(subcatName)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();
        if (data.success) {
          alert("Subcategory deleted successfully!");
          await refreshCategories();
        } else {
          alert(data.message || "Failed to delete subcategory.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to connect to server.");
      }
    }
  };

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesCat = cat.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSub = cat.subcategories.some((sub) =>
      sub.label.toLowerCase().includes(searchQuery.toLowerCase())
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
              const subs = cat.subcategories || [];
              const filteredSubs = subs.filter((sub) =>
                sub.label.toLowerCase().includes(searchQuery.toLowerCase())
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
                          src={getCategoryImage(cat.label, cat.img)}
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
                        <p className="text-xs text-slate-455 dark:text-slate-500 font-medium">
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
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {filteredSubs.map((sub, sIdx) => {
                            const icon = sub.icon || getSubcategoryEmoji(cat.label, sub.label);
                            const isImg = icon.startsWith("data:image") || icon.startsWith("http");

                            return (
                              <div
                                key={`${sub.label}-${sIdx}`}
                                className="flex items-center justify-between py-2.5 hover:bg-slate-55/15 dark:hover:bg-slate-900/10 px-2 rounded-xl transition-colors"
                              >
                                {/* Left: Icon & Name */}
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/80 text-xl overflow-hidden shrink-0">
                                    {isImg ? (
                                      <img src={icon} alt={sub.label} className="h-full w-full object-contain" />
                                    ) : (
                                      icon
                                    )}
                                  </div>
                                  <div className="flex flex-col text-left">
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                      {sub.label}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Edit / Delete Actions */}
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingSub({ category: cat.label, name: sub.label })}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition cursor-pointer border-none"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubcategory(cat.label, sub.label)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-450 transition cursor-pointer border-none"
                                  >
                                    Delete
                                  </button>
                                </div>
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

                {/* Custom Subcategory Icon Upload */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Subcategory Icon / Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center h-16 w-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer overflow-hidden transition-all shrink-0">
                      {iconImage ? (
                        <img src={iconImage} alt="Icon Preview" className="h-full w-full object-contain" />
                      ) : (
                        <Plus className="h-5 w-5 text-slate-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <div className="text-xs text-slate-450 dark:text-slate-500">
                      {iconImage ? (
                        <button
                          type="button"
                          onClick={() => setIconImage(null)}
                          className="text-rose-500 font-bold hover:underline cursor-pointer border-none bg-transparent"
                        >
                          Remove Uploaded Image
                        </button>
                      ) : (
                        <span>Select an image or PNG to use as the icon.</span>
                      )}
                    </div>
                  </div>
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

      {/* Edit Subcategory Modal Dialog */}
      {editingSub &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div
              onClick={() => setEditingSub(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer animate-fade-in"
            />

            {/* Modal Content Card */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-left">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h2 className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Edit Subcategory
                  </h2>
                </div>
                <button
                  onClick={() => setEditingSub(null)}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition cursor-pointer border-none outline-none"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Update the name and icon image of this subcategory under <strong>{editingSub.category}</strong>.
              </p>

              {/* Modal Form */}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  />
                </div>

                {/* Subcategory Icon Upload */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Subcategory Icon / Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center h-16 w-16 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer overflow-hidden transition-all shrink-0">
                      {editIcon ? (
                        <img src={editIcon} alt="Icon Preview" className="h-full w-full object-contain" />
                      ) : (
                        <Plus className="h-5 w-5 text-slate-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditIcon(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <div className="text-xs text-slate-450 dark:text-slate-500">
                      {editIcon ? (
                        <button
                          type="button"
                          onClick={() => setEditIcon(null)}
                          className="text-rose-500 font-bold hover:underline cursor-pointer border-none bg-transparent"
                        >
                          Remove Uploaded Image
                        </button>
                      ) : (
                        <span>Select an image or PNG to use as the icon.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingSub(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border-none outline-none bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:shadow-lg transition cursor-pointer text-xs border-none"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
