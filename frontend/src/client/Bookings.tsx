import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Search,
  Trash2,
  Clock,
  User,
  Phone,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  X,
  CheckCircle,
  XCircle
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

interface BookingsProps {
  clientListings: BusinessListingData[];
}

interface Submission {
  id: string;
  timestamp: string;
  status?: string;
  data: Record<string, any>;
}

export default function Bookings({ clientListings }: BookingsProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubForModal, setSelectedSubForModal] = useState<Submission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadCount, setReloadCount] = useState(0);
  const [confirmCancelBookingId, setConfirmCancelBookingId] = useState<string | null>(null);
  const [confirmCancelCustomerName, setConfirmCancelCustomerName] = useState<string>("");

  // Sync selectedBizId when clientListings load
  useEffect(() => {
    if (clientListings.length > 0 && (!selectedBizId || !clientListings.some(b => b.id === selectedBizId))) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings, selectedBizId]);

  // Reset page when search or business changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBizId]);

  // Load configuration & submissions for selected business
  useEffect(() => {
    if (!selectedBizId) return;

    const loadData = async () => {
      const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
      const headers: HeadersInit = {};
      if (token) {
        (headers as any)["Authorization"] = `Bearer ${token}`;
      }

      // 1. Fetch raw bookings to get status
      let rawBookings: any[] = [];
      try {
        const res = await fetch(`http://localhost:5000/api/bookings`, { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          rawBookings = data.data;
        }
      } catch (err) {
        console.error("Error loading bookings:", err);
      }

      // 2. Load submissions and product orders
      let mergedSubmissions: Submission[] = [];
      let rawSubmissions: any[] = [];
      try {
        const res = await fetch(`http://localhost:5000/api/service-forms/${selectedBizId}/submissions`, { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          rawSubmissions = data.data;
        }
      } catch (err) {
        console.error("Error loading service submissions:", err);
      }

      let rawOrders: any[] = [];
      try {
        const res = await fetch(`http://localhost:5000/api/product-orders/${selectedBizId}`, { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          rawOrders = data.data;
        }
      } catch (err) {
        console.error("Error loading product orders:", err);
      }

      // Merge product orders and their matching custom form submissions to prevent duplicates and use the FMP-XXXX ID
      rawSubmissions.forEach((sub: any) => {
        const orderItemsVal = sub.data["Order Items"];
        if (orderItemsVal) {
          const name = sub.data["Full Name"] || sub.data["Customer Name"] || sub.data["Name"] || "";
          const phone = sub.data["Phone Number"] || sub.data["Phone"] || "";
          const amountStr = String(sub.data["Total Amount"] || "");
          const amountNum = parseInt(amountStr.replace(/[^0-9]/g, "")) || 0;

          const match = rawOrders.find((order: any) => {
            if (order.id === sub.id) return true;
            const orderNameMatch = order.customerName === name || name.includes(order.customerName) || order.customerName.includes(name);
            const orderPhoneMatch = order.customerPhone === phone;
            const orderAmountMatch = order.totalAmount === amountNum;
            return orderNameMatch && orderPhoneMatch && orderAmountMatch;
          });

          if (match) {
            const bookingMatch = rawBookings.find((b) => b.id === match.id);
            mergedSubmissions.push({
              id: match.id, // Use FMP-XXXX
              timestamp: sub.timestamp,
              status: match.status || (bookingMatch ? bookingMatch.status : "pending"),
              data: {
                ...sub.data,
                "Order Type": "Product Order"
              }
            });
            rawOrders = rawOrders.filter((o) => o.id !== match.id);
            return;
          }
        }

        const bookingMatch = rawBookings.find((b) => b.id === sub.id);
        mergedSubmissions.push({
          id: sub.id,
          timestamp: sub.timestamp,
          status: bookingMatch ? bookingMatch.status : "pending",
          data: sub.data
        });
      });

      // Append remaining orders
      rawOrders.forEach((order: any) => {
        const bookingMatch = rawBookings.find((b) => b.id === order.id);
        mergedSubmissions.push({
          id: order.id,
          timestamp: order.timestamp,
          status: order.status || (bookingMatch ? bookingMatch.status : "pending"),
          data: {
            "Full Name": order.customerName,
            "Phone Number": order.customerPhone,
            "Address": order.customerAddress,
            "Order Items": order.orderItems ? order.orderItems.map((item: any) => `${item.name} (x${item.quantity})`).join(", ") : "No items",
            "Total Amount": `₹${order.totalAmount}`,
            "Notes/Requirements": order.notes || "None",
            "Order Type": "Product Order"
          }
        });
      });

      // Sort merged by timestamp (newest first)
      mergedSubmissions.sort((a, b) => {
        const parseDate = (ts: string) => {
          if (!ts) return 0;
          const parts = ts.split(" ");
          if (parts.length < 2) return 0;
          const [day, month, year] = parts[0].split("/").map(Number);
          const [hour, minute] = parts[1].split(":").map(Number);
          return new Date(year, month - 1, day, hour, minute).getTime();
        };
        const valA = parseDate(a.timestamp);
        const valB = parseDate(b.timestamp);
        if (valA !== valB) return valB - valA;
        return b.id.localeCompare(a.id);
      });

      setSubmissions(mergedSubmissions);
    };

    loadData();
  }, [selectedBizId, reloadCount]);

  const selectedBiz = useMemo(() => {
    return clientListings.find((b) => b.id === selectedBizId);
  }, [clientListings, selectedBizId]);

  // Fixed table columns helper — extracts the 6 pinned fields from any form shape
  const getCustomerName = (data: Record<string, any>): string => {
    const nameKeys = ["Full Name", "Customer Name", "Your Name", "Name", "नाम"];
    for (const k of nameKeys) if (data[k]) return String(data[k]);
    // Fallback: use email if no name field present
    const emailKeys = ["Email", "Email Address", "E-mail"];
    for (const k of emailKeys) if (data[k]) return String(data[k]);
    return "-";
  };

  const getPhone = (data: Record<string, any>): string => {
    const keys = ["Phone Number", "Phone", "Mobile", "Mobile Number", "Contact Number", "Contact", "WhatsApp Number"];
    for (const k of keys) if (data[k]) return String(data[k]);
    return "-";
  };

  const getOrderItems = (data: Record<string, any>): string => {
    const itemKeys = ["Order Items", "Services", "Service", "Items", "Package", "Treatment", "Treatments",
      "Choose Service", "Choose Treatment", "Choise Taste", "Choose Taste", "Select Service", "Selected Services"];
    for (const k of itemKeys) {
      if (data[k]) {
        const v = data[k];
        return Array.isArray(v) ? v.join(", ") : String(v);
      }
    }
    // Fallback — join any array field values (multi-select)
    const arrEntry = Object.entries(data).find(([, v]) => Array.isArray(v) && (v as any[]).length > 0);
    if (arrEntry) return (arrEntry[1] as any[]).join(", ");
    return "-";
  };

  const getTotalAmount = (data: Record<string, any>): string => {
    const keys = ["Total Amount", "Amount", "Price", "Total", "Fee"];
    for (const k of keys) if (data[k]) return String(data[k]);
    return "-";
  };

  const getStatusBadge = (status: string) => {
    const s = status === "confirmed" || status === "completed" || status === "Completed" ? "Completed" : status === "cancelled" || status === "Cancelled" ? "Cancelled" : "Pending";
    switch (s) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-55/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-55/70 dark:bg-amber-955/20 text-amber-700 dark:text-amber-450 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <AlertCircle className="h-3 w-3" /> Pending
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-55/70 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };


  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const allValuesString = Object.values(sub.data || {})
        .map((val) => {
          if (Array.isArray(val)) return val.join(" ");
          return String(val);
        })
        .join(" ")
        .toLowerCase();
      return allValuesString.includes(searchTerm.toLowerCase()) || sub.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [submissions, searchTerm]);

  const ITEMS_PER_PAGE = 15;

  // Paginated submissions
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSubmissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSubmissions, currentPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);

  // Handle single deletion
  const handleDelete = async (subId: string) => {
    if (!selectedBizId) return;
    const targetSub = submissions.find(s => s.id === subId);
    if (!targetSub) return;

    if (window.confirm("Are you sure you want to delete this booking record?")) {
      const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
      const isProductOrder = targetSub.data && targetSub.data["Order Type"] === "Product Order";
      const deleteUrl = isProductOrder
        ? `http://localhost:5000/api/product-orders/${selectedBizId}/${subId}`
        : `http://localhost:5000/api/service-forms/${selectedBizId}/submissions/${subId}`;

      const headers: HeadersInit = {};
      if (token) {
        (headers as any)["Authorization"] = `Bearer ${token}`;
      }

      try {
        const res = await fetch(deleteUrl, {
          method: "DELETE",
          headers
        });
        const data = await res.json();
        if ((res.ok && data.success) || res.status === 404) {
          setSubmissions((prev) => prev.filter((s) => s.id !== subId));
          window.dispatchEvent(new Event("storage"));
        } else {
          alert(data.message || "Failed to delete submission");
        }
      } catch (err) {
        alert("Something went wrong while deleting");
      }
    }
  };

  // Handle Cancel Booking (Trigger custom confirmation modal)
  const handleCancel = (bookingId: string, customerName: string) => {
    setConfirmCancelBookingId(bookingId);
    setConfirmCancelCustomerName(customerName);
  };

  // Perform actual cancellation API call
  const executeCancel = async (bookingId: string) => {
    const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: "cancelled" })
      });
      const data = await res.json();
      if (data.success) {
        setReloadCount(prev => prev + 1);
        window.dispatchEvent(new Event("storage"));
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch (err) {
      alert("Something went wrong while cancelling the booking");
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (!selectedBizId) return;
    if (window.confirm("Are you sure you want to delete all bookings for this business? This cannot be undone.")) {
      const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
      const headers: HeadersInit = {};
      if (token) {
        (headers as any)["Authorization"] = `Bearer ${token}`;
      }
      
      try {
        // 1. Clear Service Form bookings
        const res1 = await fetch(`http://localhost:5000/api/service-forms/${selectedBizId}/submissions`, {
          method: "DELETE",
          headers
        });
        
        // 2. Clear Product Orders
        const res2 = await fetch(`http://localhost:5000/api/product-orders/${selectedBizId}`, {
          method: "DELETE",
          headers
        });

        const data1 = await res1.json();
        const data2 = await res2.json();

        if (res1.ok && data1.success && res2.ok && data2.success) {
          setSubmissions([]);
          window.dispatchEvent(new Event("storage"));
        } else {
          alert("Failed to clear some submissions");
        }
      } catch (err) {
        alert("Something went wrong while clearing");
      }
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in-up text-left max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" /> Bookings Dashboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View and manage custom bookings received from customers.
          </p>
        </div>
      </div>
      {clientListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-md space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No Businesses Registered</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any businesses linked to your account. Bookings will show up here once you have registered listings.
          </p>
        </div>
      ) : clientListings.find((b) => b.id === selectedBizId)?.isBookingDisabled ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-md space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto opacity-70" />
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Bookings Disabled</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Booking features have been disabled for this business by the administrator.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          
          {/* Filters and Utilities bar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 outline-none text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          {/* Bookings Table / List */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <FileSpreadsheet className="h-12 w-12 text-slate-350 dark:text-slate-650 mx-auto" />
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No Bookings Found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {submissions.length === 0
                    ? "No customers have booked services using your form yet. Once they fill it, details will populate here."
                    : "No bookings match your current search query."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850">
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] whitespace-nowrap">Booking Date</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] min-w-[110px]">Booking ID</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] min-w-[130px]">Customer Name</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] min-w-[120px]">Phone</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] min-w-[180px]">Order Items</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] min-w-[110px]">Total Amount</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] text-center min-w-[100px]">Status</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {paginatedSubmissions.map((sub) => {
                    const bookingId = sub.id.startsWith("FMP-") || sub.id.startsWith("BK")
                      ? sub.id
                      : (() => {
                          const numbers = sub.id.replace(/\D/g, "");
                          return `BOOK${numbers.slice(-5) || "12345"}`;
                        })();
                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors"
                      >
                        {/* Booking Date */}
                        <td className="p-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {sub.timestamp}
                          </div>
                        </td>

                        {/* Booking ID */}
                        <td className="p-4 whitespace-nowrap font-mono text-indigo-600 dark:text-indigo-400 font-bold select-all">
                          {bookingId}
                        </td>

                        {/* Customer Name */}
                        <td className="p-4 text-slate-800 dark:text-slate-200 font-semibold max-w-[160px] truncate">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {getCustomerName(sub.data)}
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="p-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {getPhone(sub.data)}
                          </div>
                        </td>

                        {/* Order Items */}
                        <td className="p-4 text-slate-650 dark:text-slate-350 max-w-[220px] truncate font-medium">
                          {getOrderItems(sub.data)}
                        </td>

                        {/* Total Amount */}
                        <td className="p-4 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                          {getTotalAmount(sub.data)}
                        </td>

                        {/* Status */}
                        <td className="p-4 whitespace-nowrap text-center">
                          {getStatusBadge(sub.status || "pending")}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedSubForModal(sub)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                              title="View all booking details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {sub.status !== "cancelled" && sub.status !== "Cancelled" && (
                              <button
                                onClick={() => handleCancel(sub.id, getCustomerName(sub.data))}
                                className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-55/70 dark:hover:bg-amber-950/20 transition cursor-pointer"
                                title="Cancel booking"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                              title="Delete booking record"
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


          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 px-6 py-4 bg-slate-50/20 dark:bg-slate-950/10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-350 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous
              </button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span>Page</span>
                <span className="text-slate-800 dark:text-white px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {currentPage}
                </span>
                <span>of</span>
                <span>{totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-350 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}

          {/* Footer Statistics */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 flex items-center justify-between text-[11px] text-slate-500">
            <span>Showing {paginatedSubmissions.length} of {filteredSubmissions.length} bookings</span>
            {selectedBiz && (
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Category: {selectedBiz.category}
              </span>
            )}
          </div>
        </div>
      )}
    </div>

    {/* ─── Details Modal ────────────────────────────────────────────────────── */}
    {selectedSubForModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          onClick={() => setSelectedSubForModal(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer z-[100]"
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl z-[110] animate-in fade-in zoom-in-95 duration-200 text-left max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
              <h2 className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Booking Details
              </h2>
            </div>
            <button
              onClick={() => setSelectedSubForModal(null)}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Submitted at: <strong>{selectedSubForModal.timestamp}</strong></span>
              </div>
              <div>
                <span>Booking ID: <strong className="font-mono text-indigo-600 dark:text-indigo-400 select-all">{(() => {
                  const numbers = selectedSubForModal.id.replace(/\D/g, "");
                  return `BOOK${numbers.slice(-5) || "12345"}`;
                })()}</strong></span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-950/20">
              {Object.entries(selectedSubForModal.data || {}).map(([key, val]) => {
                let displayVal = "";
                if (Array.isArray(val)) {
                  displayVal = val.join(", ");
                } else if (typeof val === "boolean") {
                  displayVal = val ? "Checked" : "Unchecked";
                } else {
                  displayVal = String(val || "-");
                }

                return (
                  <div key={key} className="p-4 flex flex-col gap-1 sm:grid sm:grid-cols-3 sm:gap-4">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {key}
                    </span>
                    <span className="sm:col-span-2 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                      {displayVal}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedSubForModal(null)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    {confirmCancelBookingId && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          onClick={() => setConfirmCancelBookingId(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer z-[100]"
        />

        {/* Modal Card */}
        <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-2xl z-[110] animate-in fade-in zoom-in-95 duration-200 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-955/20 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100 dark:border-amber-900/30">
            <AlertCircle className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Cancel Booking
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Are you sure you want to cancel the booking for <span className="font-bold text-slate-800 dark:text-slate-200">{confirmCancelCustomerName}</span>? This action will set the booking status to cancelled.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmCancelBookingId(null)}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-805 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              No, Keep it
            </button>
            <button
              onClick={async () => {
                const bId = confirmCancelBookingId;
                setConfirmCancelBookingId(null);
                await executeCancel(bId);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer border-none shadow-sm"
            >
              Yes, Cancel Booking
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
