import React, { useState } from "react";
import { createPortal } from "react-dom";
import { PlusCircle, Trash2, Building, AlertCircle, Sparkles, Image as ImageIcon, IndianRupee, Upload, X, Edit3 } from "lucide-react";
import { businessesData, BusinessListingData } from "../data/businessesData";

interface AddProductProps {
  clientListings: BusinessListingData[];
}

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

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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

  const selectedBiz = clientListings.find((b) => b.id === selectedBizId);

  const handleEditClick = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.replace("₹", ""));
    setDesc(prod.desc);
    setImgUrl(prod.img);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDesc("");
    setImgUrl("");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedBizId) {
      setErrorMsg("Please select a business first.");
      return;
    }
    if (!selectedBiz) {
      setErrorMsg("Selected business not found.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Product/Service name is required.");
      return;
    }
    if (!price.trim()) {
      setErrorMsg("Price is required.");
      return;
    }
    if (!desc.trim()) {
      setErrorMsg("Description is required.");
      return;
    }

    try {
      const saved = localStorage.getItem("fmp_custom_businesses");
      let customList = saved ? JSON.parse(saved) : [];

      const isCustomized = customList.some((b: any) => b.id === selectedBizId);

      const formattedPrice = price.trim().startsWith("₹") ? price.trim() : `₹${price.trim()}`;
      const finalImgUrl = imgUrl.trim() || getPlaceholderImg(selectedBiz.category || "");

      let updatedProducts = [...(selectedBiz.products || [])];

      if (editingProduct) {
        // Edit Mode
        updatedProducts = updatedProducts.map((p) =>
          p.name === editingProduct.name
            ? {
                ...p,
                name: name.trim(),
                price: formattedPrice,
                img: finalImgUrl,
                desc: desc.trim(),
              }
            : p
        );
      } else {
        // Add Mode
        updatedProducts.push({
          name: name.trim(),
          price: formattedPrice,
          img: finalImgUrl,
          desc: desc.trim(),
          addedDate: new Date().toLocaleDateString("en-GB"),
        });
      }

      const updatedBiz = {
        ...selectedBiz,
        products: updatedProducts,
      };

      // Update in active memory array
      const idx = businessesData.findIndex((b) => b.id === selectedBizId);
      if (idx > -1) {
        businessesData[idx] = updatedBiz;
      }

      if (isCustomized) {
        customList = customList.map((b: any) => (b.id === selectedBizId ? updatedBiz : b));
      } else {
        customList.push(updatedBiz);
      }

      localStorage.setItem("fmp_custom_businesses", JSON.stringify(customList));

      // Reset form states and close modal
      handleCloseModal();

      setSuccessMsg(editingProduct ? "Product updated successfully!" : "Product added successfully!");
      // Dispatch storage event to alert lists
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while saving the product.");
    }
  };

  const handleDeleteProduct = (productName: string) => {
    if (!selectedBiz) return;
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const saved = localStorage.getItem("fmp_custom_businesses");
      let customList = saved ? JSON.parse(saved) : [];

      const isCustomized = customList.some((b: any) => b.id === selectedBizId);

      const updatedBiz = {
        ...selectedBiz,
        products: (selectedBiz.products || []).filter((p) => p.name !== productName),
      };

      // Update in memory
      const idx = businessesData.findIndex((b) => b.id === selectedBizId);
      if (idx > -1) {
        businessesData[idx] = updatedBiz;
      }

      if (isCustomized) {
        customList = customList.map((b: any) => (b.id === selectedBizId ? updatedBiz : b));
      } else {
        customList.push(updatedBiz);
      }

      localStorage.setItem("fmp_custom_businesses", JSON.stringify(customList));

      // Dispatch storage event
      window.dispatchEvent(new Event("storage"));
      setSuccessMsg("Product/Service deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete the product.");
    }
  };

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
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Add Product & Services</h3>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Manage and add products or special dishes to your catalog.</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Business Selector */}
          {clientListings.length > 1 && (
            <div className="flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
              <select
                value={selectedBizId}
                onChange={(e) => {
                  setSelectedBizId(e.target.value);
                  handleCloseModal();
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm focus:ring-1 focus:ring-indigo-500"
              >
                {clientListings.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add Product Button */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95 border-none outline-none"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 text-emerald-600 dark:text-emerald-450 p-3.5 rounded-xl text-xs font-bold text-center animate-fade-in">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-250/20 text-rose-600 dark:text-rose-450 p-3.5 rounded-xl text-xs font-bold text-center animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Catalog Table View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 dark:bg-slate-950/20 px-6 py-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350">
            Catalog Items ({(selectedBiz?.products || []).length})
          </h4>
        </div>

        {selectedBiz && selectedBiz.products && selectedBiz.products.length > 0 ? (
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
                {selectedBiz.products.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors">
                    {/* Image */}
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPlaceholderImg(selectedBiz.category || "");
                          }}
                        />
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">
                      {prod.name}
                    </td>
                    {/* Description */}
                    <td className="px-6 py-4 text-xs text-slate-550 dark:text-slate-400 font-semibold max-w-xs truncate" title={prod.desc}>
                      {prod.desc}
                    </td>
                    {/* Price */}
                    <td className="px-6 py-4 text-xs font-serif font-black text-emerald-600 dark:text-emerald-450">
                      {prod.price}
                    </td>
                    {/* Added Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-bold">
                      {prod.addedDate || "28/06/2026"}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg text-[10.5px] font-bold transition duration-300 cursor-pointer active:scale-95 border border-indigo-500/20 flex items-center gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.name)}
                          className="px-2.5 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[10.5px] font-bold transition duration-300 cursor-pointer active:scale-95 border border-rose-500/20 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3.5 opacity-40" />
            <p className="text-sm font-semibold">No products or services found in this catalog.</p>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95 border-none outline-none"
            >
              Add First Product
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer animate-fade-in"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-left">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h2 className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                    {editingProduct ? "Edit Product / Service" : "Add New Product / Service"}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition cursor-pointer border-none outline-none"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddProduct} className="space-y-4">
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white"
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
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white"
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Product Image (Optional)
                  </label>
                  <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-650 dark:text-slate-400">
                      Click to upload image file
                    </span>
                    <span className="text-[9px] text-slate-400">PNG, JPG, JPEG up to 2MB</span>
                  </div>
                </div>

                {/* Image Preview */}
                {imgUrl && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center gap-3 text-left">
                    <div className="h-10 w-10 bg-white dark:bg-slate-850 border border-slate-200/30 rounded-xl overflow-hidden flex items-center justify-center shadow-sm shrink-0">
                      <img src={imgUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                        Image Selected
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">Ready to save</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImgUrl("")}
                      className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border-none bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:shadow-lg transition cursor-pointer text-xs border-none"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{editingProduct ? "Save Changes" : "Add Product"}</span>
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
