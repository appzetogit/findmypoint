import { useState, useEffect } from "react";
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
} from "lucide-react";

interface AdvertiseRequestsProps {
  onCancel: () => void;
}

interface AdvertiseRequest {
  id: string;
  businessName: string;
  category: string;
  city: string;
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

  // Load requests on mount
  useEffect(() => {
    const saved = localStorage.getItem("fmp_advertise_requests:v1");
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse advertise requests", e);
        setRequests(DEMO_REQUESTS);
      }
    } else {
      // Seed with demo data if empty
      localStorage.setItem("fmp_advertise_requests:v1", JSON.stringify(DEMO_REQUESTS));
      setRequests(DEMO_REQUESTS);
    }
  }, []);

  const saveRequests = (updated: AdvertiseRequest[]) => {
    setRequests(updated);
    localStorage.setItem("fmp_advertise_requests:v1", JSON.stringify(updated));
  };

  const handleUpdateStatus = (id: string, newStatus: "Pending" | "Contacted" | "Approved") => {
    const updated = requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req));
    saveRequests(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this advertise request?")) {
      const updated = requests.filter((req) => req.id !== id);
      saveRequests(updated);
    }
  };

  const handleResetDemo = () => {
    if (confirm("Reset advertise requests database to default demo data?")) {
      saveRequests(DEMO_REQUESTS);
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
                <th className="py-4 px-4">Category & City</th>
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
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
                            ID: {req.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & City */}
                    <td className="py-4.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <Layers className="h-3 w-3 text-slate-400" />
                          {req.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {req.city}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4.5 px-4">
                      <a
                        href={`tel:+91${req.mobile}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>+91 {req.mobile}</span>
                      </a>
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
    </div>
  );
}
