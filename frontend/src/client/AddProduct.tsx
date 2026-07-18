import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  PlusCircle, Trash2, Building, AlertCircle, Sparkles,
  IndianRupee, Upload, X, Edit3, Loader2, RefreshCw, ImageIcon
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

interface AddProductProps {
  clientListings: BusinessListingData[];
}

interface Product {
  name: string;
  price: string;
  desc: string;
  img?: string;
  addedDate?: string;
}

const API_BASE = "http://localhost:5000";

const getPlaceholderImg = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("food") || cat.includes("restaurant") || cat.includes("bistro") || cat.includes("cafe")) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
  }
  return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80";
};

export default function AddProduct({ clientListings }: AddProductProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>(
    clientListings.length > 0 ? clientListings[0].id : ""
  );

  useEffect(() => {
    if (clientListings.length > 0 && (!selectedBizId || !clientListings.some(b => b.id === selectedBizId))) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings, selectedBizId]);

  // Local products state — loaded fresh from API
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [imgBase64, setImgBase64] = useState<string>("");

  // UI state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const selectedBiz = clientListings.find((b) => b.id === selectedBizId);

  // ─── Fetch fresh products from API ───────────────────────────────────────────
  useEffect(() => {
    if (!selectedBizId) {
      setProducts([]);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch(`${API_BASE}/api/businesses/${selectedBizId}`);
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.data?.products) {
            setProducts(data.data.products);
          } else {
            setProducts([]);
          }
        }
      } catch {
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedBizId, refreshKey]);

  // ─── Handle image file selection ────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 5MB.");
      return;
    }

    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImgPreview(base64);
      setImgBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImgFile(null);
    setImgPreview("");
    setImgBase64("");
  };

  // ─── Open/Close Modal ────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDesc("");
    clearImage();
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.replace("₹", "").trim());
    setDesc(prod.desc || "");
    setImgPreview(prod.img || "");
    setImgBase64(""); // Will only update if new image is chosen
    setImgFile(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDesc("");
    clearImage();
    setErrorMsg("");
  };

  // ─── Save Product (Add / Edit) ───────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedBizId) { setErrorMsg("Please select a business first."); return; }
    if (!name.trim()) { setErrorMsg("Product / Service name is required."); return; }
    if (!price.trim()) { setErrorMsg("Price is required."); return; }
    if (!desc.trim()) { setErrorMsg("Description is required."); return; }

    const formattedPrice = price.trim().startsWith("₹") ? price.trim() : `₹${price.trim()}`;

    // Determine final image:
    // - New image selected → use base64 (backend middleware uploads it)
    // - Editing with old image → keep existing URL
    // - No image → use placeholder
    let finalImg: string;
    if (imgBase64) {
      finalImg = imgBase64; // backend will convert this to a file URL
    } else if (editingProduct && imgPreview) {
      finalImg = imgPreview; // keep existing URL unchanged
    } else {
      finalImg = getPlaceholderImg(selectedBiz?.category || "");
    }

    // Build updated products array
    let updatedProducts: Product[] = [...products];

    if (editingProduct) {
      updatedProducts = updatedProducts.map((p) =>
        p.name === editingProduct.name
          ? { ...p, name: name.trim(), price: formattedPrice, img: finalImg, desc: desc.trim() }
          : p
      );
    } else {
      updatedProducts.push({
        name: name.trim(),
        price: formattedPrice,
        img: finalImg,
        desc: desc.trim(),
        addedDate: new Date().toLocaleDateString("en-GB"),
      });
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
      const res = await fetch(`${API_BASE}/api/businesses/${selectedBizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ products: updatedProducts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save product.");

      // Update local list with server-returned products (image URLs resolved by backend)
      const savedProducts: Product[] = data.data?.products || updatedProducts;
      setProducts(savedProducts);

      closeModal();
      setSuccessMsg(editingProduct ? "Product updated successfully!" : "Product added successfully!");
      window.dispatchEvent(new Event("storage")); // signal parent to refresh
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete Product ──────────────────────────────────────────────────────────
  const handleDelete = async (productName: string) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;

    const updatedProducts = products.filter((p) => p.name !== productName);
    setDeletingName(productName);
    try {
      const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
      const res = await fetch(`${API_BASE}/api/businesses/${selectedBizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ products: updatedProducts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product.");

      setProducts(data.data?.products || updatedProducts);
      setSuccessMsg("Product deleted successfully!");
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete the product.");
    } finally {
      setDeletingName(null);
    }
  };

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (clientListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 space-y-3">
        <Building className="h-12 w-12 text-slate-400" />
        <p className="text-sm font-semibold">No businesses found linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up text-left max-w-6xl mx-auto pb-10">

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Add Product &amp; Services
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage and add products or special dishes to your catalog.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Business Selector */}
          {clientListings.length > 1 && (
            <div className="flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
              <select
                value={selectedBizId}
                onChange={(e) => {
                  setSelectedBizId(e.target.value);
                  closeModal();
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm focus:ring-1 focus:ring-indigo-500"
              >
                {clientListings.map((biz) => (
                  <option key={biz.id} value={biz.id}>{biz.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Refresh */}
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            disabled={loadingProducts}
            title="Refresh products"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loadingProducts ? "animate-spin" : ""}`} />
          </button>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Toast Messages */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
          <span>✓</span><span>{successMsg}</span>
        </div>
      )}
      {errorMsg && !isModalOpen && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /><span>{errorMsg}</span>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350">
            Catalog Items ({products.length})
          </h4>
          {loadingProducts && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </div>
          )}
        </div>

        {loadingProducts && products.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-xs font-semibold">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Added Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {products.map((prod, idx) => {
                  const imgSrc = prod.img?.startsWith("/uploads/")
                    ? `${API_BASE}${prod.img}`
                    : prod.img || getPlaceholderImg(selectedBiz?.category || "");

                  return (
                    <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors">
                      {/* Image */}
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                          <img
                            src={imgSrc}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getPlaceholderImg(selectedBiz?.category || "");
                            }}
                          />
                        </div>
                      </td>
                      {/* Name */}
                      <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{prod.name}</td>
                      {/* Description */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-xs truncate" title={prod.desc}>
                        {prod.desc}
                      </td>
                      {/* Price */}
                      <td className="px-6 py-4 text-xs font-serif font-black text-emerald-600 dark:text-emerald-450">
                        {prod.price}
                      </td>
                      {/* Added Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-bold">
                        {prod.addedDate || "—"}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg text-[10.5px] font-bold transition cursor-pointer active:scale-95 border border-indigo-500/20 flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3" /><span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(prod.name)}
                            disabled={deletingName === prod.name}
                            className="px-2.5 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[10.5px] font-bold transition cursor-pointer active:scale-95 border border-rose-500/20 flex items-center gap-1 disabled:opacity-50"
                          >
                            {deletingName === prod.name
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3.5 opacity-40" />
            <p className="text-sm font-semibold">No products or services found in this catalog.</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
            >
              Add First Product
            </button>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {isModalOpen && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-left max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h2 className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                    {editingProduct ? "Edit Product / Service" : "Add New Product / Service"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Error inside modal */}
              {errorMsg && (
                <div className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /><span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">

                {/* Product Name */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Product / Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Special Veg Thali, Laptop Cleaning"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white transition"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Price (₹) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500">
                      <IndianRupee className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 299, 1499"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white transition"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain what is included in this product or dish..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white resize-none transition"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Product Image <span className="normal-case font-semibold text-slate-400">(Optional)</span>
                  </label>

                  {/* Drop Zone */}
                  <label className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:border-indigo-400 dark:hover:border-indigo-700 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">
                      Click or drag to upload
                    </span>
                    <span className="text-[9px] text-slate-400">PNG, JPG, WEBP — max 5MB</span>
                  </label>

                  {/* Image Preview */}
                  {imgPreview && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center gap-3">
                      <div className="h-14 w-14 bg-white dark:bg-slate-850 border border-slate-200/30 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img
                          src={imgPreview.startsWith("/uploads/") ? `${API_BASE}${imgPreview}` : imgPreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                          {imgFile ? imgFile.name : "Current image"}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {imgBase64 ? "New image selected — will be uploaded on save" : "Existing image"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:shadow-lg transition cursor-pointer text-xs"
                  >
                    {isSaving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /><span>Saving...</span></>
                    ) : (
                      <><PlusCircle className="h-4 w-4" /><span>{editingProduct ? "Save Changes" : "Add Product"}</span></>
                    )}
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