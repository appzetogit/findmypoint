import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Eye, EyeOff, Edit2, Trash2, MapPin, Tag, Phone, ShieldCheck, Calendar, QrCode, Download, X, Lock } from "lucide-react";
import { BusinessListingData } from "../data/businessesData";
import { API_BASE_URL } from "../config";

interface BusinessListingsProps {
  onAddNew: () => void;
  onEditBusiness: (id: string) => void;
  onClosePortal: () => void;
}

export default function BusinessListings({
  onAddNew,
  onEditBusiness,
  onClosePortal,
}: BusinessListingsProps) {
  const [listings, setListings] = useState<BusinessListingData[]>([]);
  const [viewingBusiness, setViewingBusiness] = useState<BusinessListingData | null>(null);
  const [qrBusiness, setQrBusiness] = useState<BusinessListingData | null>(null);
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadListings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/businesses`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setListings(data.data);
      } else {
        setListings([]);
      }
    } catch (e) {
      console.error("Failed to load listings:", e);
      setListings([]);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const categoriesList = useMemo(() => {
    const mainCategories = listings.map((l) => l.category.split(" > ")[0] || l.category);
    return ["all", ...Array.from(new Set(mainCategories))];
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address.toLowerCase().includes(searchTerm.toLowerCase());

      const itemMainCat = item.category.split(" > ")[0] || item.category;
      const matchesCategory = selectedCategory === "all" || itemMainCat === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, selectedCategory]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      const token = localStorage.getItem("fmp_admin_token");
      try {
        const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          alert("Listing deleted successfully!");
          loadListings();
        } else {
          alert(data.message || "Failed to delete listing.");
        }
      } catch (e) {
        console.error("Failed to delete listing", e);
        alert("Failed to delete listing.");
      }
    }
  };

  const handleToggleVerify = async (id: string) => {
    const biz = listings.find((b) => b.id === id);
    if (biz) {
      const token = localStorage.getItem("fmp_admin_token");
      const newStatus = !biz.isVerified;
      try {
        const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ isVerified: newStatus })
        });
        const data = await res.json();
        if (data.success) {
          loadListings();
        } else {
          alert(data.message || "Failed to update verify status.");
        }
      } catch (e) {
        console.error("Failed to update verify status:", e);
      }
    }
  };

  const handleToggleBooking = async (id: string) => {
    const biz = listings.find((b) => b.id === id);
    if (biz) {
      const token = localStorage.getItem("fmp_admin_token");
      const newStatus = !biz.isBookingDisabled;
      try {
        const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ isBookingDisabled: newStatus })
        });
        const data = await res.json();
        if (data.success) {
          loadListings();
        } else {
          alert(data.message || "Failed to update booking status.");
        }
      } catch (e) {
        console.error("Failed to update booking status:", e);
      }
    }
  };

  const handleViewListing = (id: string) => {
    onClosePortal();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("fmp-select-business", { detail: id }));
    }, 50);
  };

  const handleDownloadQr = async (business: BusinessListingData) => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
        window.location.origin + "/?biz=" + business.id
      )}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${business.name.replace(/\s+/g, "_")}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Failed to download QR code", e);
    }
  };

  return (
    <>
      <div className="space-y-5 w-full animate-fade-in-up">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Registered Businesses
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage, edit, or delete existing business database listings
              </p>
            </div>
          </div>
          <button
            onClick={onAddNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-250 cursor-pointer self-start sm:self-auto text-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            Register Business
          </button>
        </div>

        {/* Unified Search & Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search listings by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-sm"
            />
          </div>

          {/* Category Filter dropdown */}
          <div className="w-full lg:w-56 text-left">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition-all font-semibold shadow-sm cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoriesList
                .filter((c) => c !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Table List (Flat and transparent background, no card wrapper) */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-16 px-4 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-white/50 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No business listings found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-b border-slate-200/60 dark:border-slate-800/60">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">
                  <th className="py-3 px-6">Business Details</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[13px] text-slate-700 dark:text-slate-350">
                {filteredListings.map((item) => {
                  const isStatic = !item.id.startsWith("custom-");
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors"
                    >
                      {/* Business Name */}
                      <td className="py-3.5 px-6">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {item.name}
                            </span>
                            {item.isVerified && (
                              <span title="Verified Business">
                                <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-500/10 shrink-0" />
                              </span>
                            )}
                          </div>
                          {item.highlightsName && (
                            <span className="inline-block text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded mt-0.5">
                              {item.highlightsName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-rose-500/80" />
                          <span className="truncate max-w-[150px]">{item.location}</span>
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center text-[10px] font-bold text-slate-600 dark:text-slate-450 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
                          {item.category.split(" > ")[0]}
                        </span>
                      </td>

                      {/* Contact Phone */}
                      <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                        {item.phone && (
                          <span className="flex items-center gap-1 text-[11.5px] font-bold">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {item.phone}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setViewingBusiness(item); setShowClientPassword(false); }}
                            title="View Business Details"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleVerify(item.id)}
                            title={item.isVerified ? "Unverify Listing" : "Verify Listing"}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              item.isVerified
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-250 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </button>

                           {/* Toggle switch for Booking Features */}
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/35 dark:bg-indigo-950/15 hover:border-indigo-400 dark:hover:border-indigo-800/80 transition-all duration-300 select-none align-middle"
                            title={item.isBookingDisabled ? "Booking Features: Disabled (OFF)" : "Booking Features: Enabled (ON)"}
                          >
                            <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider align-middle">
                              {item.bookingButtonLabel || "Book Option"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleBooking(item.id)}
                              className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none align-middle ${
                                !item.isBookingDisabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  !item.isBookingDisabled ? "translate-x-3.5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          <button
                            onClick={() => setQrBusiness(item)}
                            title="Generate & Download QR Code"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition cursor-pointer"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => onEditBusiness(item.id)}
                            title="Edit Listing"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete Listing"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-855 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {viewingBusiness.category}
                  </span>
                  {viewingBusiness.highlightsName && (
                    <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-650 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {viewingBusiness.highlightsName}
                    </span>
                  )}
                  {(() => {
                    const isBizVerified = listings.find((b) => b.id === viewingBusiness.id)?.isVerified;
                    return (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isBizVerified 
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 border border-emerald-250/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}>
                        <ShieldCheck className={`h-3 w-3 ${isBizVerified ? "text-emerald-500 fill-emerald-500/10" : "text-slate-400"}`} />
                        {isBizVerified ? "Verified" : "Unverified"}
                      </span>
                    );
                  })()}
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white uppercase tracking-tight">
                  {viewingBusiness.name}
                </h2>
              </div>
              <button
                onClick={() => setViewingBusiness(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {/* Image Grid/Carousel */}
              {viewingBusiness.images && viewingBusiness.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {viewingBusiness.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="h-32 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 bg-slate-100 dark:bg-slate-950"
                    >
                      <img
                        src={img}
                        alt={`${viewingBusiness.name} gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Info Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Contact details */}
                <div className="md:col-span-1 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4.5 rounded-2xl space-y-4 text-xs font-semibold">
                    <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      Contact & Info
                    </h3>

                    {viewingBusiness.phone && (
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                          Phone
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">
                          {viewingBusiness.phone}
                        </p>
                      </div>
                    )}

                    {viewingBusiness.whatsapp && (
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                          WhatsApp
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">
                          {viewingBusiness.whatsapp}
                        </p>
                      </div>
                    )}

                    {viewingBusiness.email && (
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                          Email Address
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">
                          {viewingBusiness.email}
                        </p>
                      </div>
                    )}

                    {viewingBusiness.website && (
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                          Website
                        </span>
                        <a
                          href={viewingBusiness.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 block hover:underline truncate"
                        >
                          {viewingBusiness.website}
                        </a>
                      </div>
                    )}

                    {viewingBusiness.timings && (
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                          Timings
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">
                          {viewingBusiness.timings}
                        </p>
                      </div>
                    )}

                    {viewingBusiness.location && (
                      <div className="space-y-1">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                          Address Details
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                          {viewingBusiness.address || viewingBusiness.location}
                        </p>
                      </div>
                    )}

                    {/* Client Login Password — Admin Only */}
                    <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Client Login Password
                      </span>
                      {viewingBusiness.clientPassword ? (
                        <div className="flex items-center gap-2">
                          <p className="text-slate-800 dark:text-slate-200 font-bold tracking-wider flex-1">
                            {showClientPassword ? viewingBusiness.clientPassword : "•".repeat(viewingBusiness.clientPassword.length)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowClientPassword((v) => !v)}
                            className="text-slate-400 hover:text-indigo-500 transition-colors shrink-0"
                            title={showClientPassword ? "Hide password" : "Show password"}
                          >
                            {showClientPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic text-[11px]">Not set</p>
                      )}
                    </div>
                  </div>

                  {/* Facilities */}
                  {viewingBusiness.facilities && viewingBusiness.facilities.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4.5 rounded-2xl space-y-2">
                      <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                        Facilities
                      </h3>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {viewingBusiness.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-350 px-2 py-0.5 rounded"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Officers */}
                  {viewingBusiness.officers && viewingBusiness.officers.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4.5 rounded-2xl space-y-3 text-xs">
                      <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                        Key Contacts / Officers
                      </h3>
                      <div className="space-y-2 pt-1">
                        {viewingBusiness.officers.map((off, idx) => (
                          <div key={idx} className="border-l-2 border-indigo-500 pl-2.5">
                            <p className="font-extrabold text-slate-800 dark:text-slate-200">
                              {off.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                              {off.designation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: About, Products/Services, FAQs */}
                <div className="md:col-span-2 space-y-6">
                  {/* About/Description */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      About Business
                    </h3>
                    <p className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-350">
                      {viewingBusiness.description ||
                        "No description provided for this business listing."}
                    </p>
                  </div>

                  {/* Products & Services */}
                  {viewingBusiness.products && viewingBusiness.products.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                        Products & Services
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {viewingBusiness.products.map((prod, idx) => (
                          <div
                            key={idx}
                            className="border border-slate-150 dark:border-slate-850 p-3 rounded-2xl flex gap-3 bg-slate-50/30 dark:bg-slate-950/10"
                          >
                            {prod.img && (
                              <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-850">
                                <img
                                  src={prod.img}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="space-y-1 min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {prod.name}
                              </h4>
                              {prod.price && (
                                <p className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                                  {prod.price}
                                </p>
                              )}
                              {prod.desc && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {prod.desc}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQs */}
                  {viewingBusiness.faqs && viewingBusiness.faqs.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-2">
                        {viewingBusiness.faqs.map((faq, idx) => (
                          <div
                            key={idx}
                            className="border border-slate-150 dark:border-slate-850 rounded-xl p-3 bg-slate-50/20 dark:bg-slate-950/5 text-xs"
                          >
                            <p className="font-black text-slate-900 dark:text-white">
                              Q: {faq.question}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                              A: {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-slate-150 dark:border-slate-855 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              {(() => {
                const isBizVerified = listings.find((b) => b.id === viewingBusiness.id)?.isVerified;
                return (
                  <button
                    onClick={() => handleToggleVerify(viewingBusiness.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      isBizVerified
                        ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-450 border border-rose-200/55 dark:border-rose-900/30"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {isBizVerified ? "Unverify Business" : "Verify Business"}
                  </button>
                );
              })()}
              <button
                onClick={() => setViewingBusiness(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Viewer Modal */}
      {qrBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 max-w-sm w-full p-6 text-center space-y-6 relative overflow-hidden animate-zoom-in">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 h-28 w-28 bg-indigo-500/5 rounded-full blur-xl -translate-y-5 translate-x-5 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-28 w-28 bg-indigo-500/5 rounded-full blur-xl translate-y-5 -translate-x-5 pointer-events-none" />

            {/* Header / Close button */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                Business QR Code
              </span>
              <button
                onClick={() => setQrBusiness(null)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-450 hover:text-rose-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Business Info */}
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                {qrBusiness.name}
              </h2>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold truncate px-4">
                {qrBusiness.cityTown}, {qrBusiness.district}
              </p>
            </div>

            {/* QR Image Container */}
            <div className="relative group max-w-[200px] mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  window.location.origin + "/?biz=" + qrBusiness.id
                )}`}
                alt={`${qrBusiness.name} QR Code`}
                className="w-full aspect-square border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 bg-white shadow-md group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleDownloadQr(qrBusiness)}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/10 transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download QR Code Image
              </button>

              <button
                onClick={() => {
                  const shareUrl = window.location.origin + "/?biz=" + qrBusiness.id;
                  navigator.clipboard.writeText(shareUrl);
                  alert("Business detail page link copied to clipboard!");
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-950/60 text-slate-700 dark:text-slate-350 border border-slate-200/60 dark:border-slate-800 py-3 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Copy Shareable Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
