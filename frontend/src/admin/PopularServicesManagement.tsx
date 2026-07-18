import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Star,
  Upload,
  Check,
  Building2,
} from "lucide-react";
import { API_BASE_URL } from "../config";
import { useCategories } from "../context/CategoryContext";

interface BusinessListItem {
  _id: string;
  id: string;
  name: string;
  location: string;
  images: string[];
}

interface PopularService {
  _id: string;
  title: string;
  desc?: string;
  img?: string;
  tab: "Trending" | "Near You";
  businesses: BusinessListItem[] | string[];
}

const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5MB limit

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PopularServicesManagement() {
  const [services, setServices] = useState<PopularService[]>([]);
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bizSearchTerm, setBizSearchTerm] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [tab, setTab] = useState<"Trending" | "Near You">("Trending");
  const [selectedBizIds, setSelectedBizIds] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  // Category & Subcategory Filtering
  const { categories } = useCategories();
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");

  // Fetch Services & Businesses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, businessesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/popular-services`),
          fetch(`${API_BASE_URL}/businesses`),
        ]);

        const servicesData = await servicesRes.json();
        const businessesData = await businessesRes.json();

        if (servicesData.success) {
          setServices(servicesData.data);
        }
        if (businessesData.success) {
          setBusinesses(businessesData.data || []);
        }
      } catch (err) {
        console.error("Failed to load popular services management data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert("Image size must be less than 1.5MB");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImg(base64);
    } catch (err) {
      console.error("Failed to read image file:", err);
    }
  };

  const handleOpenAdd = () => {
    setTitle("");
    setDesc("");
    setImg("");
    setTab("Trending");
    setSelectedBizIds([]);
    setEditingId(null);
    setFormError("");
    setFilterCategory("");
    setFilterSubcategory("");
    setModalOpen(true);
  };

  const handleOpenEdit = (service: PopularService) => {
    setTitle(service.title);
    setDesc(service.desc || "");
    setImg(service.img || "");
    setTab(service.tab);
    
    // Map businesses to their ObjectIds
    const bizIds = (service.businesses || []).map((b: any) =>
      typeof b === "string" ? b : b._id
    );
    setSelectedBizIds(bizIds);
    setEditingId(service._id);
    setFormError("");
    setFilterCategory("");
    setFilterSubcategory("");
    setModalOpen(true);
  };

  const handleToggleBiz = (bizId: string) => {
    setSelectedBizIds((prev) =>
      prev.includes(bizId) ? prev.filter((id) => id !== bizId) : [...prev, bizId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }

    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_user_token");
    if (!token) {
      alert("Admin authorization token not found!");
      return;
    }

    const payload = {
      title: title.trim(),
      desc: desc.trim(),
      img,
      tab,
      businesses: selectedBizIds,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/popular-services/${editingId}`
        : `${API_BASE_URL}/popular-services`;
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (responseData.success && responseData.data) {
        if (editingId) {
          setServices((prev) =>
            prev.map((s) => (s._id === editingId ? responseData.data : s))
          );
        } else {
          setServices((prev) => [responseData.data, ...prev]);
        }
        setModalOpen(false);
      } else {
        setFormError(responseData.message || "Failed to save popular service");
      }
    } catch (err: any) {
      setFormError(err.message || "Request failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this popular service card?")) {
      return;
    }

    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_user_token");
    if (!token) {
      alert("Admin authorization token not found!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/popular-services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Delete request failed");
    }
  };

  // Filter lists
  const filteredServices = services.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      (s.desc && s.desc.toLowerCase().includes(term)) ||
      s.tab.toLowerCase().includes(term)
    );
  });

  const filteredBizOptions = useMemo(() => {
    const term = bizSearchTerm.toLowerCase();
    return businesses.filter((b) => {
      // Category filter (safe check using categoryLine or category)
      const bizCat = (b as any).categoryLine || "";
      if (filterCategory && bizCat !== filterCategory) return false;

      // Subcategory filter (safe check using subCategoryLine or category)
      const bizSubcat = (b as any).subCategoryLine || "";
      if (filterSubcategory && bizSubcat !== filterSubcategory) return false;

      return (
        b.name.toLowerCase().includes(term) ||
        b.location.toLowerCase().includes(term)
      );
    });
  }, [businesses, bizSearchTerm, filterCategory, filterSubcategory]);

  return (
    <div className="space-y-6 w-full animate-fade-in-up text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Star className="h-5 w-5 fill-indigo-500" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Popular Services
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage the dynamic service cards displayed on the homepage
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-650/10 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          Create Service
        </button>
      </div>

      {/* Actions and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4.5 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search popular services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-955 text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-455 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-455 font-bold">
          Total: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{filteredServices.length} cards</span>
        </div>
      </div>

      {/* Services Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 italic">Loading popular services...</div>
      ) : filteredServices.length === 0 ? (
        <div className="py-24 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/20 dark:bg-slate-950/5">
          <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold italic">No popular service cards found.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Create one now &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredServices.map((s) => (
            <div
              key={s._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-3 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800">
                  {s.img ? (
                    <img src={s.img} alt={s.title} className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <Star className="h-7 w-7 stroke-[1.5]" />
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                    s.tab === "Trending" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {s.tab}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-black text-slate-900 dark:text-white text-xs leading-tight line-clamp-1" title={s.title}>
                    {s.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-snug" title={s.desc}>
                    {s.desc || "No description."}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-50 dark:border-slate-850/50 flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500">
                  {s.businesses?.length || 0} Linked
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="h-7 w-7 rounded-lg bg-slate-50 hover:bg-slate-105 dark:bg-slate-955 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="h-7 w-7 rounded-lg bg-rose-50/50 hover:bg-rose-100/40 dark:bg-rose-955/20 dark:hover:bg-rose-955/40 text-rose-600 dark:text-rose-455 flex items-center justify-center transition cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-zoom-in">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Popular Service" : "Create Popular Service"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-955 dark:hover:bg-rose-955/20 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              {formError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-955/25 text-rose-650 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-100/30">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emergency Plumbers"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-3 rounded-xl border border-slate-205 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">
                    Tab Section *
                  </label>
                  <select
                    value={tab}
                    onChange={(e) => setTab(e.target.value as "Trending" | "Near You")}
                    className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-3 rounded-xl border border-slate-205 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 transition-all font-semibold"
                  >
                    <option value="Trending">Trending</option>
                    <option value="Near You">Near You</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">
                  Service Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified 24/7 plumbing specialists"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 text-xs px-3.5 py-3 rounded-xl border border-slate-205 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              {/* Image Uploader */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">
                  Cover Image
                </label>
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-28 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
                    {img ? (
                      <img src={img} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Star className="h-6 w-6 stroke-[1.5]" />
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-xl border border-dashed border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <Upload className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Max size 1.5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Linked Businesses Multiselect List */}
              <div className="space-y-3 text-left pt-2 border-t border-slate-100 dark:border-slate-850/50">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider">
                    Link Businesses *
                  </label>
                  <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400">
                    {selectedBizIds.length} Selected
                  </span>
                </div>

                {/* Category and Subcategory Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-505 tracking-wider">
                      Select Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setFilterSubcategory("");
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-955 text-[11px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 font-semibold"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-550 tracking-wider">
                      Select Subcategory
                    </label>
                    <select
                      disabled={!filterCategory}
                      value={filterSubcategory}
                      onChange={(e) => setFilterSubcategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 text-[11px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">All Subcategories</option>
                      {filterCategory &&
                        categories
                          .find((c) => c.label === filterCategory)
                          ?.subcategories.map((sub, idx) => (
                            <option key={idx} value={sub.label}>
                              {sub.label}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search businesses to link..."
                    value={bizSearchTerm}
                    onChange={(e) => setBizSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-955 text-[11px] pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-455 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>

                {/* Businesses Multi-Select Checkbox Box */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850/50 no-scrollbar">
                  {filteredBizOptions.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs italic">
                      No businesses found matching search.
                    </div>
                  ) : (
                    filteredBizOptions.map((biz) => {
                      const isChecked = selectedBizIds.includes(biz._id);
                      return (
                        <div
                          key={biz._id}
                          onClick={() => handleToggleBiz(biz._id)}
                          className="p-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-955 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                              {biz.images?.[0] ? (
                                <img
                                  src={
                                    biz.images[0].startsWith("data:") || biz.images[0].startsWith("http")
                                      ? biz.images[0]
                                      : `${API_BASE_URL.replace("/api", "")}${biz.images[0]}`
                                  }
                                  alt={biz.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Building2 className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="text-left leading-none">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {biz.name}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                                {biz.location}
                              </span>
                            </div>
                          </div>

                          <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-650 text-white shadow-sm"
                              : "border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-955 text-transparent"
                          }`}>
                            <Check className="h-3 w-3 stroke-[3px]" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-650/10 cursor-pointer"
                >
                  Save Card
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
