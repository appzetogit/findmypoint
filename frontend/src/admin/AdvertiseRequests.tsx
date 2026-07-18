import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Trash2,
  Phone,
  Building2,
  MapPin,
  Megaphone,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Check,
  RefreshCw,
  Settings,
} from "lucide-react";
import { BACKEND_ORIGIN } from "../config";

interface AdvertiseRequestsProps {
  onCancel: () => void;
}

interface AdvertiseRequest {
  id: string;
  _id?: string;
  businessName: string;
  category: string;
  city: string;
  email?: string;
  mobile: string;
  createdAt: string;
  status?: "Pending" | "Contacted" | "Approved";
}

const DEMO_REQUESTS: AdvertiseRequest[] = [
  {
    id: "demo_1",
    businessName: "Shree Shyam Caterers",
    category: "Restaurant",
    city: "Mumbai",
    mobile: "9876543210",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: "Pending",
  },
  {
    id: "demo_2",
    businessName: "Apollo Dental Clinic",
    category: "Doctor & Clinic",
    city: "Delhi",
    mobile: "9123456789",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    status: "Contacted",
  },
  {
    id: "demo_3",
    businessName: "Greenfield Realtors",
    category: "Real Estate",
    city: "Bangalore",
    mobile: "9998887776",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    status: "Approved",
  },
];

export default function AdvertiseRequests({ onCancel }: AdvertiseRequestsProps) {
  const [requests, setRequests] = useState<AdvertiseRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Design modal configurations
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [pageConfig, setPageConfig] = useState({
    heroTitle: "",
    heroSubtitle: "",
    formTitle: "",
    formSubtitle: "",
    benefit1: "",
    benefit2: "",
    benefit3: "",
    benefit4: "",
    section2Title: "",
    section2Subtitle: "",
    stat1Value: "",
    stat1Label: "",
    stat2Value: "",
    stat2Label: "",
    stat3Value: "",
    stat3Label: "",
    ctaTitle: "",
    ctaDesc: "",
    ctaBtnText: "",
    badge1Value: "",
    badge1Label: "",
    badge2Value: "",
    badge2Label: "",
  });

  // Load config from backend on modal show
  useEffect(() => {
    if (showDesignModal) {
      fetch(`${BACKEND_ORIGIN}/api/advertise-config`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.config) {
            setPageConfig({
              heroTitle: data.config.heroTitle || "",
              heroSubtitle: data.config.heroSubtitle || "",
              formTitle: data.config.formTitle || "",
              formSubtitle: data.config.formSubtitle || "",
              benefit1: data.config.benefit1 || "",
              benefit2: data.config.benefit2 || "",
              benefit3: data.config.benefit3 || "",
              benefit4: data.config.benefit4 || "",
              section2Title: data.config.section2Title || "",
              section2Subtitle: data.config.section2Subtitle || "",
              stat1Value: data.config.stat1Value || "",
              stat1Label: data.config.stat1Label || "",
              stat2Value: data.config.stat2Value || "",
              stat2Label: data.config.stat2Label || "",
              stat3Value: data.config.stat3Value || "",
              stat3Label: data.config.stat3Label || "",
              ctaTitle: data.config.ctaTitle || "",
              ctaDesc: data.config.ctaDesc || "",
              ctaBtnText: data.config.ctaBtnText || "",
              badge1Value: data.config.badge1Value || "",
              badge1Label: data.config.badge1Label || "",
              badge2Value: data.config.badge2Value || "",
              badge2Label: data.config.badge2Label || "",
            });
          }
        })
        .catch((err) => console.error("Error loading advertise config in admin", err));
    }
  }, [showDesignModal]);

  const handleSaveConfig = () => {
    setSavingConfig(true);
    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_user_token");
    fetch(`${BACKEND_ORIGIN}/api/advertise-config/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pageConfig),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Advertise page design configurations saved successfully!");
          setShowDesignModal(false);
        } else {
          alert(data.message || "Failed to save configurations.");
        }
      })
      .catch((err) => {
        console.error("Error saving advertise config", err);
        alert("An error occurred while saving configurations.");
      })
      .finally(() => setSavingConfig(false));
  };

  // Load requests on mount from backend database
  const loadRequests = () => {
    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_user_token");
    fetch(`${BACKEND_ORIGIN}/api/advertise-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.requests)) {
          const transformed = data.requests.map((r: any) => ({
            ...r,
            id: r._id || r.id,
          }));
          setRequests(transformed);
        }
      })
      .catch((err) => console.error("Failed to fetch advertise requests", err));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: "Pending" | "Contacted" | "Approved") => {
    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_user_token");
    fetch(`${BACKEND_ORIGIN}/api/advertise-requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          loadRequests();
        } else {
          alert(data.message || "Failed to update status.");
        }
      })
      .catch((err) => {
        console.error("Error updating request status", err);
        alert("An error occurred. Please try again.");
      });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this advertise request?")) {
      const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_user_token");
      fetch(`${BACKEND_ORIGIN}/api/advertise-requests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            loadRequests();
          } else {
            alert(data.message || "Failed to delete request.");
          }
        })
        .catch((err) => {
          console.error("Error deleting request", err);
          alert("An error occurred. Please try again.");
        });
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.mobile.includes(searchQuery);

    const reqStatus = req.status || "Pending";
    const matchesStatus = statusFilter === "All" || reqStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  // Counts for filters
  const countAll = requests.length;
  const countPending = requests.filter((r) => (r.status || "Pending") === "Pending").length;
  const countContacted = requests.filter((r) => r.status === "Contacted").length;
  const countApproved = requests.filter((r) => r.status === "Approved").length;

  const statusOptions = [
    { label: "All", value: "All", count: countAll },
    { label: "Pending", value: "Pending", count: countPending },
    { label: "Contacted", value: "Contacted", count: countContacted },
    { label: "Approved", value: "Approved", count: countApproved },
  ];

  return (
    <div className="space-y-5 w-full animate-fade-in-up">
      {/* Flat Header (No background card, no back button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Advertise Requests
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage and follow up on client advertising submissions
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDesignModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
        >
          <Settings className="h-4 w-4" /> Page
        </button>
      </div>

      {/* Unified Search & Filters Row (No card background wrapper) */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-sm"
          />
        </div>

        {/* Status Filters with Counts */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {statusOptions.map(({ label, value, count }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3.5 py-2 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer border flex items-center gap-2 shadow-sm ${
                statusFilter === value
                  ? "bg-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <span>{label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                  statusFilter === value
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table List (Flat and transparent background, no card wrapper) */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 px-4 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl bg-white/50 dark:bg-slate-900/50">
          <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-600">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            No Requests Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] mx-auto font-medium">
            Try adjusting your search query or check back later.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-b border-slate-200/60 dark:border-slate-800/60">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="py-4 px-6">Business Details</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Submitted At</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {filteredRequests.map((req) => {
                const reqStatus = req.status || "Pending";
                return (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors"
                  >
                    {/* Business Name */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                          <Building2 className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-[13.5px] block">
                            {req.businessName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <Layers className="h-3 w-3 text-slate-400" />
                          {req.category}
                        </span>
                      </div>
                    </td>

                    {/* Contact Info (Phone & Email) */}
                    <td className="py-4.5 px-4">
                      <div className="flex flex-col gap-1 text-left">
                        <a
                          href={`tel:+91${req.mobile}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition w-fit"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>+91 {req.mobile}</span>
                        </a>
                        {req.email && (
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-3">
                            {req.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="py-4.5 px-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-450">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          reqStatus === "Approved"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/30"
                            : reqStatus === "Contacted"
                              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border border-amber-200/50 dark:border-amber-900/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/20 dark:border-slate-750"
                        }`}
                      >
                        {reqStatus === "Approved" && <CheckCircle2 className="h-3 w-3" />}
                        {reqStatus === "Contacted" && <Clock className="h-3 w-3" />}
                        {reqStatus === "Pending" && <Clock className="h-3 w-3" />}
                        {reqStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {reqStatus !== "Approved" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                req.id,
                                reqStatus === "Pending" ? "Contacted" : "Approved",
                              )
                            }
                            title={
                              reqStatus === "Pending" ? "Mark as Contacted" : "Mark as Approved"
                            }
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            {reqStatus === "Pending" ? (
                              <Phone className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {reqStatus === "Contacted" && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, "Pending")}
                            title="Mark back to Pending"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(req.id)}
                          title="Delete Request"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-450 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Portal Modal */}
      {showDesignModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white uppercase">
                  Customize Advertise Page Design
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update any text dynamically on the Advertise page (except the main form fields)
                </p>
              </div>
              <button
                onClick={() => setShowDesignModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Body (Scrollable form fields) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Hero Banner Section */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 border-b pb-1">
                  1. Hero Banner
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={pageConfig.heroTitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, heroTitle: e.target.value })}
                      placeholder="e.g. GROW YOUR BUSINESS"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={pageConfig.heroSubtitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, heroSubtitle: e.target.value })}
                      placeholder="e.g. Advertise on India's #1 Premium Local Search Engine."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Title Section */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 border-b pb-1">
                  2. Lead Form Branding
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Form Header
                    </label>
                    <input
                      type="text"
                      value={pageConfig.formTitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, formTitle: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Form Subtitle
                    </label>
                    <input
                      type="text"
                      value={pageConfig.formSubtitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, formSubtitle: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Value Propositions / Benefits Section */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 border-b pb-1">
                  3. Key Benefits (Ticklist)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Benefit 1
                    </label>
                    <input
                      type="text"
                      value={pageConfig.benefit1}
                      onChange={(e) => setPageConfig({ ...pageConfig, benefit1: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Benefit 2
                    </label>
                    <input
                      type="text"
                      value={pageConfig.benefit2}
                      onChange={(e) => setPageConfig({ ...pageConfig, benefit2: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Benefit 3
                    </label>
                    <input
                      type="text"
                      value={pageConfig.benefit3}
                      onChange={(e) => setPageConfig({ ...pageConfig, benefit3: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Benefit 4
                    </label>
                    <input
                      type="text"
                      value={pageConfig.benefit4}
                      onChange={(e) => setPageConfig({ ...pageConfig, benefit4: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Stats & Growth Engine Section */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 border-b pb-1">
                  4. Trust & Stats Section
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                        Section Header
                      </label>
                      <input
                        type="text"
                        value={pageConfig.section2Title}
                        onChange={(e) => setPageConfig({ ...pageConfig, section2Title: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                        Section Description
                      </label>
                      <textarea
                        rows={2}
                        value={pageConfig.section2Subtitle}
                        onChange={(e) => setPageConfig({ ...pageConfig, section2Subtitle: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Stat boxes values */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-850">
                      <span className="text-[10px] font-black text-slate-400 block mb-1">STAT 1</span>
                      <input
                        type="text"
                        value={pageConfig.stat1Value}
                        onChange={(e) => setPageConfig({ ...pageConfig, stat1Value: e.target.value })}
                        placeholder="Value (e.g. 10x)"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500 mb-2"
                      />
                      <input
                        type="text"
                        value={pageConfig.stat1Label}
                        onChange={(e) => setPageConfig({ ...pageConfig, stat1Label: e.target.value })}
                        placeholder="Label"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-850">
                      <span className="text-[10px] font-black text-slate-400 block mb-1">STAT 2</span>
                      <input
                        type="text"
                        value={pageConfig.stat2Value}
                        onChange={(e) => setPageConfig({ ...pageConfig, stat2Value: e.target.value })}
                        placeholder="Value (e.g. 48 Hrs)"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500 mb-2"
                      />
                      <input
                        type="text"
                        value={pageConfig.stat2Label}
                        onChange={(e) => setPageConfig({ ...pageConfig, stat2Label: e.target.value })}
                        placeholder="Label"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-850">
                      <span className="text-[10px] font-black text-slate-400 block mb-1">STAT 3</span>
                      <input
                        type="text"
                        value={pageConfig.stat3Value}
                        onChange={(e) => setPageConfig({ ...pageConfig, stat3Value: e.target.value })}
                        placeholder="Value (e.g. 24/7)"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500 mb-2"
                      />
                      <input
                        type="text"
                        value={pageConfig.stat3Label}
                        onChange={(e) => setPageConfig({ ...pageConfig, stat3Label: e.target.value })}
                        placeholder="Label"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Call-to-action Section */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 border-b pb-1">
                  5. Enterprise Custom Campaign (CTA Card)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      CTA Title
                    </label>
                    <input
                      type="text"
                      value={pageConfig.ctaTitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, ctaTitle: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      CTA Description
                    </label>
                    <input
                      type="text"
                      value={pageConfig.ctaDesc}
                      onChange={(e) => setPageConfig({ ...pageConfig, ctaDesc: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      CTA Button Text / Phone Contact
                    </label>
                    <input
                      type="text"
                      value={pageConfig.ctaBtnText}
                      onChange={(e) => setPageConfig({ ...pageConfig, ctaBtnText: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Badges Section */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 border-b pb-1">
                  6. Floating Smartphone Badges
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-850">
                    <span className="text-[10px] font-black text-slate-400 block mb-1">BADGE 1 (Right Badge - Active Customers)</span>
                    <input
                      type="text"
                      value={pageConfig.badge1Value}
                      onChange={(e) => setPageConfig({ ...pageConfig, badge1Value: e.target.value })}
                      placeholder="Value (e.g. 1.5 Crore+)"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500 mb-2"
                    />
                    <input
                      type="text"
                      value={pageConfig.badge1Label}
                      onChange={(e) => setPageConfig({ ...pageConfig, badge1Label: e.target.value })}
                      placeholder="Label (e.g. Active Customers)"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-850">
                    <span className="text-[10px] font-black text-slate-400 block mb-1">BADGE 2 (Left Badge - Verified Partners)</span>
                    <input
                      type="text"
                      value={pageConfig.badge2Value}
                      onChange={(e) => setPageConfig({ ...pageConfig, badge2Value: e.target.value })}
                      placeholder="Value (e.g. 50 Lakh+)"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500 mb-2"
                    />
                    <input
                      type="text"
                      value={pageConfig.badge2Label}
                      onChange={(e) => setPageConfig({ ...pageConfig, badge2Label: e.target.value })}
                      placeholder="Label (e.g. Verified Partners)"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowDesignModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow disabled:opacity-70 cursor-pointer"
              >
                {savingConfig ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
