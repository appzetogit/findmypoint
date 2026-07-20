import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Hourglass,
  Search,
  X,
  Printer,
  User,
  Mail,
  Phone,
  Receipt,
  Info,
  Download,
} from "lucide-react";
import { API_BASE_URL } from "../config";
import ReviewPromptModal from "./ReviewPromptModal";
import { jsPDF } from "jspdf";

interface Booking {
  id: string;
  businessId?: string;
  businessName: string;
  category: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  amount: number;
  location: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  items?: Array<{ name: string; quantity: number; price?: number }>;
  formData?: Record<string, any>;
  bookingType?: "service" | "product" | "appointment" | "room";
  paymentId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  isReviewed?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; classes: string; dot: string }> = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  pending: {
    label: "Pending",
    icon: Hourglass,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  refunded: {
    label: "Refunded",
    icon: CheckCircle2,
    classes: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
};

const getStatusConfig = (b: Booking) =>
  b.paymentStatus === "refunded" ? STATUS_CONFIG.refunded : STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);

  const handleDownloadInvoice = (booking: any) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5"
    });

    const primaryColor = "#0f172a"; 
    const secondaryColor = "#64748b"; 

    doc.setTextColor(primaryColor);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FINDMYPOINT", 15, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(secondaryColor);
    doc.text("Secure Payment Receipt & Invoice", 15, 22);
    
    doc.setFillColor(240, 253, 250); 
    doc.roundedRect(95, 12, 40, 8, 1.5, 1.5, "F");
    doc.setTextColor(5, 150, 105); 
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PAID RECEIPT", 103, 17.2);
    
    doc.setDrawColor(226, 232, 240); 
    doc.setLineWidth(0.3);
    doc.line(15, 27, 135, 27);
    
    let y = 37;
    const addRow = (label: string, value: string, fontStyle: "bold" | "normal" = "normal") => {
      doc.setTextColor(secondaryColor);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text(label, 15, y);
      
      doc.setTextColor(primaryColor);
      doc.setFont("Helvetica", fontStyle);
      doc.setFontSize(8);
      doc.text(value, 48, y);
      y += 8;
    };
    
    if (booking.paymentId) {
      addRow("Transaction ID:", booking.paymentId, "bold");
    }
    addRow("Order ID:", booking.id, "bold");
    addRow("Merchant:", booking.businessName);
    addRow("Service/Details:", booking.service || "Service Booking");
    addRow("Date:", booking.date);
    addRow("Payment Mode:", booking.paymentMethod || "UPI Gateway");
    addRow("Status:", "Success (Paid)", "bold");
    
    y += 2;
    doc.setFillColor(248, 250, 252); 
    doc.setDrawColor(241, 245, 249); 
    doc.roundedRect(15, y, 120, 14, 2, 2, "FD");
    
    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Total Paid:", 22, y + 8.5);
    
    doc.setTextColor(5, 150, 105); 
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Rs. ${booking.amount}.00`, 98, y + 9);
    
    y += 24;
    doc.setTextColor(secondaryColor);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Thank you for using FindmyPoint!", 15, y);
    doc.text("This is an electronically generated document. No signature required.", 15, y + 3.5);
    
    doc.save(`FMP_Receipt_${booking.id}.pdf`);
  };

  const loadUserBookings = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("fmp_user_token") ||
        localStorage.getItem("fmp_business_token") ||
        localStorage.getItem("fmp_admin_token") ||
        "";
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error("Failed to load user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const token =
        localStorage.getItem("fmp_user_token") ||
        localStorage.getItem("fmp_business_token") ||
        localStorage.getItem("fmp_admin_token") ||
        "";
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Booking cancelled successfully!");
        // Update local state instead of full reload for snappy UX
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
        );
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: "cancelled" } : null));
        }
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Network error cancelling booking.");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      (b.service && b.service.toLowerCase().includes(search.toLowerCase())) ||
      b.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-black text-foreground">My Booking List</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track scheduling slots, appointment logs, and secure registration status.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search booking ID, listing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-border/60">
        {["all", "confirmed", "completed", "cancelled"].map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer capitalize border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-semibold text-muted-foreground">
          Fetching bookings log...
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center text-xs font-bold text-slate-400 bg-secondary/5">
          No bookings discovered matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const cfg = getStatusConfig(b);
            const StatusIcon = cfg.icon;
            
            let formattedDate = b.date;
            try {
              if (b.date) {
                const dateObj = new Date(b.date);
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                }
              }
            } catch (e) {}

            return (
              <div
                key={b.id}
                className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[9px] font-black uppercase text-primary/80 tracking-wider">
                        {b.category || "General"}
                      </span>
                      <h4 className="text-xs font-black text-foreground mt-0.5 line-clamp-1">
                        {b.businessName}
                      </h4>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${cfg.classes}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3 border-t border-b border-slate-100 py-2 text-[11px]">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Booking ID</span>
                      <span className="font-mono font-bold text-foreground">{b.id}</span>
                    </div>
                    {b.service && (
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Service</span>
                        <span className="font-semibold text-foreground truncate max-w-[150px]">
                          {b.service}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Date & Time</span>
                      <span className="font-bold text-foreground text-[10px]">
                        {formattedDate} {b.time ? `at ${b.time}` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Paid Amount</span>
                      <span className="font-black text-emerald-600">
                        ₹{b.amount.toLocaleString("en-IN")}.00
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold py-1.5 rounded-xl border border-slate-200 transition cursor-pointer text-center"
                  >
                    View Details
                  </button>

                  {(b.status === "confirmed" || b.status === "pending") && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="flex-1 bg-white hover:bg-rose-50 text-rose-600 text-[10px] font-bold py-1.5 rounded-xl border border-rose-200 hover:border-rose-300 transition cursor-pointer text-center"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {b.status === "completed" && (
                    b.isReviewed ? (
                      <button
                        onClick={() => handleDownloadInvoice(b)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Invoice
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveReviewBooking(b)}
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-bold py-1.5 rounded-xl border border-indigo-200 transition cursor-pointer text-center"
                      >
                        Rate & Review
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Details / Receipt Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 text-left animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] font-sans relative animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <span className="text-[10px] font-black uppercase text-primary tracking-wider block">
                {selectedBooking.category || "General"} Booking Details
              </span>
              <h4 className="text-lg font-black text-slate-800 mt-1 pr-6 truncate">
                {selectedBooking.businessName}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-400 font-bold">
                  ID: <span className="font-mono">{selectedBooking.id}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                    getStatusConfig(selectedBooking).classes
                  }`}
                >
                  {getStatusConfig(selectedBooking).label}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Schedule Info */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-xs">
                <h5 className="font-black text-slate-800 flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" /> Scheduling Details
                </h5>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Date</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {new Date(selectedBooking.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {selectedBooking.time && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Time Slot</span>
                      <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" /> {selectedBooking.time}
                      </span>
                    </div>
                  )}
                </div>
                {selectedBooking.location && (
                  <div className="pt-2 border-t border-slate-100 flex gap-1.5 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedBooking.location}</span>
                  </div>
                )}
              </div>

              {/* Customer Contact Details */}
              {(selectedBooking.customerName ||
                selectedBooking.customerEmail ||
                selectedBooking.customerPhone ||
                selectedBooking.customerAddress) && (
                <div className="space-y-3 p-4 rounded-xl border border-slate-100 text-xs">
                  <h5 className="font-black text-slate-800 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" /> Customer Information
                  </h5>
                  <div className="space-y-2 pt-1 text-slate-700">
                    {selectedBooking.customerName && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Name:</span>
                        <span className="font-bold">{selectedBooking.customerName}</span>
                      </div>
                    )}
                    {selectedBooking.customerPhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-bold flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" /> {selectedBooking.customerPhone}
                        </span>
                      </div>
                    )}
                    {selectedBooking.customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-bold flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" /> {selectedBooking.customerEmail}
                        </span>
                      </div>
                    )}
                    {selectedBooking.customerAddress && (
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-slate-400 shrink-0">Address:</span>
                        <span className="font-medium text-right">{selectedBooking.customerAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Form Payload */}
              {selectedBooking.formData && Object.keys(selectedBooking.formData).length > 0 && (
                <div className="space-y-3 p-4 rounded-xl border border-slate-100 text-xs">
                  <h5 className="font-black text-slate-800 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" /> Booking Answers
                  </h5>
                  <div className="space-y-2 pt-1">
                    {Object.entries(selectedBooking.formData).map(([key, val]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                        <span className="font-bold text-slate-800 text-right">
                          {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Cart Items */}
              {selectedBooking.items && selectedBooking.items.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl border border-slate-100 text-xs">
                  <h5 className="font-black text-slate-800 flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-primary" /> Ordered Items
                  </h5>
                  <div className="border border-slate-100 rounded-lg overflow-hidden mt-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                        <tr>
                          <th className="p-2.5">Item Name</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedBooking.items.map((item: any, i) => (
                          <tr key={i}>
                            <td className="p-2.5 font-semibold">{item.name}</td>
                            <td className="p-2.5 text-center font-bold text-slate-500">{item.quantity}</td>
                            <td className="p-2.5 text-right font-bold text-slate-800">
                              ₹{(item.price || 0).toLocaleString("en-IN")}.00
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Checkout details */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-xs">
                <h5 className="font-black text-slate-800">Payment Breakdown</h5>
                <div className="space-y-2 pt-1 text-slate-700">
                  {selectedBooking.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction Ref:</span>
                      <span className="font-mono font-semibold">{selectedBooking.paymentId}</span>
                    </div>
                  )}
                  {selectedBooking.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Method:</span>
                      <span className="font-semibold">{selectedBooking.paymentMethod}</span>
                    </div>
                  )}
                  {selectedBooking.paymentStatus === "refunded" && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status:</span>
                      <span className="font-black text-sky-600">Refunded</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm font-black text-slate-800 pt-2 border-t border-slate-200">
                    <span>{selectedBooking.paymentStatus === "refunded" ? "Total Amount Refunded" : "Total Amount Paid"}</span>
                    <span className={`text-base ${selectedBooking.paymentStatus === "refunded" ? "text-sky-600" : "text-emerald-600"}`}>
                      ₹{selectedBooking.amount.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Booking
              </button>
              {(selectedBooking.status === "confirmed" || selectedBooking.status === "pending") && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-4 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold py-2.5 rounded-xl border border-rose-200 hover:border-rose-300 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Real-time rating/review popup prompt */}
      {activeReviewBooking && (
        <ReviewPromptModal
          bookingId={activeReviewBooking.id}
          businessId={activeReviewBooking.businessId || ""}
          businessName={activeReviewBooking.businessName}
          service={activeReviewBooking.service || "Booking"}
          onClose={() => setActiveReviewBooking(null)}
          onSuccess={() => {
            setBookings(prev => prev.map(book => {
              if (book.id === activeReviewBooking.id) {
                return { ...book, isReviewed: true };
              }
              return book;
            }));
          }}
        />
      )}
    </div>
  );
}
