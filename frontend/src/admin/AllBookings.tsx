import { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  Search, 
  Eye, 
  Trash2, 
  X, 
  CreditCard, 
  User, 
  Phone, 
  Building, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { businessesData } from "../data/businessesData";

interface BookingRecord {
  id: string;
  timestamp: string;
  businessId: string;
  businessName: string;
  categoryName: string;
  customerName: string;
  phone: string;
  details: Record<string, any>;
  amount: number;
  paymentMethod: string;
  status: "Completed" | "Pending" | "Cancelled" | "Refunded";
}

export default function AllBookings() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Load all bookings across all static and custom businesses
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_business_token") || "";
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  const loadBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const list = data.data.map((b: any) => ({
          id: b.id,
          timestamp: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(b.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
          businessId: b.businessId,
          businessName: b.businessName,
          categoryName: b.category,
          customerName: b.customerName || "Guest",
          phone: b.customerPhone || "",
          details: b.formData || {},
          amount: b.amount || 0,
          paymentMethod: b.paymentMethod || "N/A",
          status: b.status === "confirmed" || b.status === "completed" ? "Completed" : b.status === "cancelled" ? "Cancelled" : "Pending",
        }));
        setBookings(list);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error("Failed to load bookings from database", e);
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
    
    // Sync if storage changes
    const handleStorage = () => {
      loadBookings();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Filter unique businesses
  const businessesList = useMemo(() => {
    const businesses = new Set<string>();
    bookings.forEach((b) => {
      if (b.businessName) businesses.add(b.businessName);
    });
    return Array.from(businesses).sort();
  }, [bookings]);

  // Filter categories
  const categoriesList = useMemo(() => {
    const categories = new Set<string>();
    const filteredByBiz = selectedBusiness
      ? bookings.filter((b) => b.businessName === selectedBusiness)
      : bookings;
    filteredByBiz.forEach((b) => {
      if (b.categoryName) categories.add(b.categoryName);
    });
    return ["All", ...Array.from(categories)];
  }, [bookings, selectedBusiness]);

  // Statistics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    const businessBookings = selectedBusiness
      ? bookings.filter((b) => b.businessName === selectedBusiness)
      : [];

    businessBookings.forEach((b) => {
      if (b.status === "Completed") {
        totalRevenue += b.amount;
        completedCount++;
      } else if (b.status === "Pending") {
        pendingCount++;
      } else if (b.status === "Cancelled" || b.status === "Refunded") {
        cancelledCount++;
      }
    });

    return {
      totalBookings: businessBookings.length,
      totalRevenue,
      completedCount,
      pendingCount,
      cancelledCount,
    };
  }, [bookings, selectedBusiness]);

  // Handle Cancel Booking (Change status to Cancelled)
  const handleCancelBooking = async (booking: BookingRecord) => {
    if (window.confirm(`Are you sure you want to cancel booking for ${booking.customerName}?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${booking.id}/status`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: "cancelled" })
        });
        const data = await res.json();
        if (data.success) {
          loadBookings();
          window.dispatchEvent(new Event("storage"));
        } else {
          alert(data.message || "Failed to cancel booking");
        }
      } catch (err) {
        alert("Error cancelling booking in database: " + err);
      }
    }
  };

  // Handle Delete Booking (Remove entirely from database)
  const handleDeleteBooking = async (booking: BookingRecord) => {
    if (window.confirm(`Delete booking for ${booking.customerName} permanently? This cannot be undone.`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${booking.id}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
          loadBookings();
          if (selectedBooking?.id === booking.id) {
            setSelectedBooking(null);
          }
          window.dispatchEvent(new Event("storage"));
        } else {
          alert(data.message || "Failed to delete booking");
        }
      } catch (err) {
        alert("Error deleting booking from database: " + err);
      }
    }
  };

  // Filtered Booking List
  const filteredBookings = useMemo(() => {
    if (!selectedBusiness) return [];
    return bookings.filter((b) => {
      const matchesBusiness = b.businessName === selectedBusiness;
      const matchesSearch = 
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.includes(searchQuery) ||
        b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || b.categoryName === selectedCategory;
      const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;

      return matchesBusiness && matchesSearch && matchesCategory && matchesStatus;
    });
  }, [bookings, searchQuery, selectedCategory, selectedStatus, selectedBusiness]);

  const getStatusBadge = (status: BookingRecord["status"]) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-450 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <AlertCircle className="h-3 w-3" /> Pending
          </span>
        );
      case "Cancelled":
      case "Refunded":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6 w-full animate-fade-in-up text-left">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              All Bookings Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View, search, filter, and manage reservation submissions and deposit payments across all categories
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Bookings</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalBookings}</div>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Revenue Collected</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{stats.totalRevenue}</div>
          </div>
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-500">{stats.pendingCount}</div>
          </div>
          <div className="h-10 w-10 bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-450 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Cancelled Bookings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cancelled / Refunded</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-500">{stats.cancelledCount}</div>
          </div>
          <div className="h-10 w-10 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-450 rounded-xl flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, phone, business, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-955 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-medium"
          />
        </div>

        {/* Business, Category & Status Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Business:</span>
            <select
              value={selectedBusiness}
              onChange={(e) => {
                setSelectedBusiness(e.target.value);
                setSelectedCategory("All"); // Reset category when business changes
              }}
              className="bg-slate-50 dark:bg-slate-955 text-xs px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-bold max-w-[200px]"
            >
              <option value="">Select Business...</option>
              {businessesList.map((biz) => (
                <option key={biz} value={biz}>
                  {biz}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-955 text-xs px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-bold"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-955 text-xs px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-sm">
        {!selectedBusiness ? (
          <div className="py-16 px-6 text-center text-slate-500 font-bold text-sm bg-slate-50/20">
            Please select a business from the dropdown to view its bookings.
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left border-collapse">
              <thead className="bg-slate-50/55 dark:bg-slate-955/40">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Booking ID / Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Business / Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Customer Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Deposit / Payment</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-955/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{b.id}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{b.timestamp}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        {b.businessName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{b.categoryName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {b.customerName}
                      </div>
                      {b.phone && (
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          {b.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">₹{b.amount}</div>
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <CreditCard className="h-3 w-3 text-slate-400 shrink-0" />
                        {b.paymentMethod.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition shadow-sm border border-slate-150 dark:border-slate-700/60 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {b.status !== "Cancelled" && b.status !== "Refunded" && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 hover:bg-rose-600 hover:text-white transition shadow-sm border border-rose-100 dark:border-rose-900/30 cursor-pointer"
                          title="Cancel Booking"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteBooking(b)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-450 hover:bg-rose-600 hover:text-white transition shadow-sm border border-slate-150 dark:border-slate-700/60 cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-6 text-center text-slate-500 font-bold text-xs bg-slate-50/20">
            No booking submissions found matching search query or filters.
          </div>
        )}
      </div>

      {/* Close transform wrapper to avoid modal z-index container isolation */}
      </div>

      {/* View Details Dialog/Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white uppercase">
                  Booking Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-left max-h-[380px] overflow-y-auto scrollbar-thin">
              {/* Business Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Business Listing</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedBooking.businessName}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Category Name</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{selectedBooking.categoryName}</div>
                </div>
              </div>

              {/* Customer Section */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-3.5">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Customer Name</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedBooking.customerName}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Mobile Number</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedBooking.phone || "N/A"}</div>
                </div>
              </div>

              {/* Submission Dynamic Fields */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3.5 space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Submitted Form Data</span>
                <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-850/60 rounded-2xl p-4 space-y-2.5">
                  {Object.entries(selectedBooking.details).map(([key, val]) => {
                    // Skip name and phone if already shown, otherwise show everything
                    if (key === "Full Name" || key === "Phone Number" || key === "Mobile Number" || key === "Your Name") return null;
                    return (
                      <div key={key} className="grid grid-cols-3 gap-2 text-xs">
                        <span className="text-slate-400 font-bold col-span-1 leading-snug">{key}:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold col-span-2 leading-snug">{String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Section */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-3.5">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Deposit Paid</span>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{selectedBooking.amount}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Method</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedBooking.paymentMethod}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</span>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 flex justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleDeleteBooking(selectedBooking)}
                className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/40 rounded-xl transition cursor-pointer"
              >
                Delete Booking
              </button>
              <div className="flex gap-2">
                {selectedBooking.status !== "Cancelled" && selectedBooking.status !== "Refunded" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelBooking(selectedBooking);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-250 rounded-xl transition cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer border-none shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
