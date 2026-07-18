import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  FileText,
  Eye,
  Tag,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  User,
  BookOpen,
  Upload,
  Check,
} from "lucide-react";
import { API_BASE_URL } from "../config";
import { useCategories } from "../context/CategoryContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessDetail {
  id: string;
  name: string;
  images: string[];
  description: string;
  quote?: string;
  foodRange?: string;
  mustTry?: string;
  priceForTwo?: string;
  timings?: string;
  address?: string;
  rating?: number;
}

interface Recommendation {
  title: string;
  img: string;
  desc?: string;
  link?: string;
}

interface Article {
  _id: string;
  id: number;
  title: string;
  category: string;
  readTime?: string;
  views?: string;
  commentsCount?: number;
  mainImage: string;
  galleryImages: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
    verified: boolean;
    date: string;
  };
  introParagraphs: string[];
  businesses: BusinessDetail[];
  tags: string[];
  recommendations: Recommendation[];
  createdAt?: string;
}



const blankForm = () => ({
  title: "",
  category: "",
  mainImage: "",
  galleryImages: [""],
  author: { name: "", avatar: "", role: "", verified: false, date: "" },
  introParagraphs: [""],
  businesses: [] as BusinessDetail[],
  tags: "",
  recommendations: [] as Recommendation[],
});

// ─── Image Upload helper ───────────────────────────────────────────────────────

const MAX_SIZE = 1.5 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUpload({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (base64: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("Image must be under 1.5 MB");
      return;
    }
    const b64 = await fileToBase64(file);
    onChange(b64);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 text-[10px] font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition cursor-pointer shrink-0"
      >
        <Upload className="h-3.5 w-3.5" />
        {label}
      </button>

      {value ? (
        <div className="relative shrink-0">
          <img
            src={value}
            alt="preview"
            className="h-12 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : (
        <span className="text-[10px] text-slate-400 italic">No image selected</span>
      )}

      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ArticleManagement() {
  const { categories } = useCategories();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm());

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/articles`);
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  // ── Filter ──────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.author?.name || "").toLowerCase().includes(q),
    );
  }, [articles, searchTerm]);

  // ── Modal ───────────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingArticle(null);
    setForm(blankForm());
    setIsModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setForm({
      title: article.title,
      category: article.category,
      mainImage: article.mainImage || "",
      galleryImages: article.galleryImages?.length ? article.galleryImages : [""],
      author: {
        name: article.author?.name || "",
        avatar: article.author?.avatar || "",
        role: article.author?.role || "",
        verified: article.author?.verified || false,
        date: article.author?.date || "",
      },
      introParagraphs: article.introParagraphs?.length ? article.introParagraphs : [""],
      businesses: [],
      tags: (article.tags || []).join(", "),
      recommendations: [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingArticle(null); };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim() || !form.category.trim()) {
      alert("Title and Category are required.");
      return;
    }
    setSaving(true);
    const token = localStorage.getItem("fmp_admin_token");
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      galleryImages: form.galleryImages.filter(Boolean),
      introParagraphs: form.introParagraphs.filter(Boolean),
      businesses: [],
      recommendations: [],
    };
    try {
      const url = editingArticle
        ? `${API_BASE_URL}/articles/${editingArticle.id}`
        : `${API_BASE_URL}/articles`;
      const res = await fetch(url, {
        method: editingArticle ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) { await fetchArticles(); closeModal(); }
      else alert(data.message || "Failed to save article.");
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (article: Article) => {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    const token = localStorage.getItem("fmp_admin_token");
    try {
      const res = await fetch(`${API_BASE_URL}/articles/${article.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) await fetchArticles();
      else alert(data.message || "Failed to delete.");
    } catch { alert("Network error."); }
  };

  // ── Gallery helpers ─────────────────────────────────────────────────────────

  const setGalleryImage = (idx: number, val: string) => {
    const arr = [...form.galleryImages]; arr[idx] = val;
    setForm((f) => ({ ...f, galleryImages: arr }));
  };
  const addGallerySlot = () => setForm((f) => ({ ...f, galleryImages: [...f.galleryImages, ""] }));
  const removeGallerySlot = (idx: number) =>
    setForm((f) => ({ ...f, galleryImages: f.galleryImages.filter((_, i) => i !== idx) }));

  // ── Paragraph helpers ───────────────────────────────────────────────────────

  const setIntroParagraph = (idx: number, val: string) => {
    const arr = [...form.introParagraphs]; arr[idx] = val;
    setForm((f) => ({ ...f, introParagraphs: arr }));
  };
  const addIntroParagraph = () => setForm((f) => ({ ...f, introParagraphs: [...f.introParagraphs, ""] }));
  const removeIntroParagraph = (idx: number) =>
    setForm((f) => ({ ...f, introParagraphs: f.introParagraphs.filter((_, i) => i !== idx) }));





  // ── Style constants ─────────────────────────────────────────────────────────

  const inputCls =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition";
  const labelCls =
    "block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5";

  const sectionHead = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700/60">
      <span className="text-indigo-500">{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{title}</span>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Article Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Create and manage articles shown on the user-facing site</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
          <Plus className="h-4 w-4" /> Add New Article
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" placeholder="Search by title, category, author..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Articles", value: articles.length, icon: <FileText className="h-4 w-4" />, color: "text-indigo-500" },
          { label: "Categories", value: [...new Set(articles.map((a) => a.category))].length, icon: <Tag className="h-4 w-4" />, color: "text-violet-500" },
          { label: "Search Results", value: filtered.length, icon: <Eye className="h-4 w-4" />, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 p-4 shadow-sm">
            <div className={`mb-2 ${s.color}`}>{s.icon}</div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-50">{s.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <FileText className="h-10 w-10 opacity-30" />
            <p className="text-sm font-semibold">{searchTerm ? "No articles match your search" : "No articles yet. Click 'Add New Article' to get started."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/30">
                  {["Article", "Category", "Author", "Actions"].map((h, i) => (
                    <th key={h} className={`px-5 py-3 font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[10px] ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {filtered.map((article) => (
                  <tr key={article._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {article.mainImage ? (
                          <img src={article.mainImage} alt={article.title} className="h-10 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                        ) : (
                          <div className="h-10 w-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-[220px]">{article.title}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">{article.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">{article.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{article.author?.name || "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(article)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer shadow-sm" title="Edit">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(article)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shadow-sm" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal ─────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/60 my-6">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-50">{editingArticle ? "Edit Article" : "Add New Article"}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{editingArticle ? `Editing: ${editingArticle.title}` : "Fill in the details below"}</p>
              </div>
              <button onClick={closeModal} className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-8 max-h-[75vh] overflow-y-auto">

              {/* 1. Basic Info */}
              <div>
                {sectionHead(<FileText className="h-4 w-4" />, "Basic Information")}
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Title *</label>
                    <input className={inputCls} placeholder="Article title..." value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Category *</label>
                    <select
                      className={inputCls + " cursor-pointer"}
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.label}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Main Image</label>
                    <ImageUpload value={form.mainImage} onChange={(v) => setForm((f) => ({ ...f, mainImage: v }))} label="Upload Main Image" />
                  </div>
                </div>
              </div>

              {/* 2. Gallery */}
              <div>
                {sectionHead(<ImageIcon className="h-4 w-4" />, "Gallery Images")}
                <div className="space-y-3">
                  {form.galleryImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1">
                        <ImageUpload value={img} onChange={(v) => setGalleryImage(idx, v)} label={`Gallery ${idx + 1}`} />
                      </div>
                      {form.galleryImages.length > 1 && (
                        <button onClick={() => removeGallerySlot(idx)} className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addGallerySlot} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 cursor-pointer transition mt-1">
                    <Plus className="h-3.5 w-3.5" /> Add Gallery Slot
                  </button>
                </div>
              </div>

              {/* 3. Author */}
              <div>
                {sectionHead(<User className="h-4 w-4" />, "Author")}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Author Name</label>
                    <input className={inputCls} placeholder="Full name..." value={form.author.name} onChange={(e) => setForm((f) => ({ ...f, author: { ...f.author, name: e.target.value } }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Author Role</label>
                    <input className={inputCls} placeholder="e.g. Food Specialist & Writer" value={form.author.role} onChange={(e) => setForm((f) => ({ ...f, author: { ...f.author, role: e.target.value } }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Publish Date</label>
                    <input
                      type="date"
                      className={inputCls + " cursor-pointer"}
                      value={form.author.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, author: { ...f.author, date: e.target.value } }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls}>Author Avatar</label>
                    <ImageUpload value={form.author.avatar} onChange={(v) => setForm((f) => ({ ...f, author: { ...f.author, avatar: v } }))} label="Upload Avatar" />
                  </div>
                </div>
              </div>

              {/* 4. Intro Paragraphs */}
              <div>
                {sectionHead(<BookOpen className="h-4 w-4" />, "Intro Paragraphs")}
                <div className="space-y-3">
                  {form.introParagraphs.map((para, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <textarea rows={3} className={inputCls + " resize-none flex-1"} placeholder={`Paragraph ${idx + 1}...`} value={para} onChange={(e) => setIntroParagraph(idx, e.target.value)} />
                      {form.introParagraphs.length > 1 && (
                        <button onClick={() => removeIntroParagraph(idx)} className="shrink-0 mt-1 h-8 w-8 flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addIntroParagraph} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 cursor-pointer transition mt-1">
                    <Plus className="h-3.5 w-3.5" /> Add Paragraph
                  </button>
                </div>
              </div>



              {/* 6. Tags */}
              <div>
                {sectionHead(<Tag className="h-4 w-4" />, "Tags")}
                <label className={labelCls}>Comma-separated tags</label>
                <input className={inputCls} placeholder="cloud kitchen, food indore, best restaurants..." value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
              </div>


            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-100 dark:border-slate-700/60">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {saving ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Saving..." : editingArticle ? "Update Article" : "Create Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
