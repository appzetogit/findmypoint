import { useState, useEffect } from "react";
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Search,
  Inbox,
  CreditCard,
  Smartphone,
  Landmark,
  LogIn,
  Clock,
  Download,
  X,
  Store,
  FileText,
  Check,
  Building2,
  Calendar,
  IndianRupee,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { API_BASE_URL } from "../config";

export interface Transaction {
  id: string;
  bookingId?: string;
  timestamp: string;
  description: string;
  businessName: string;
  details?: string;
  customerName?: string;
  amount: number;
  type: "debit" | "credit";
  paymentMethod: string;
  status: "Completed" | "Pending" | "Refunded" | "Cancelled" | "Failed" | string;
}

const DEFAULT_STATUS_CONFIG = {
  icon: CheckCircle2,
  classes: "text-emerald-600",
  badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_CONFIG: Record<string, any> = {
  Completed: {
    icon: CheckCircle2,
    classes: "text-emerald-600",
    badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Success: {
    icon: CheckCircle2,
    classes: "text-emerald-600",
    badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Pending: {
    icon: Clock,
    classes: "text-amber-600",
    badgeClasses: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Refunded: {
    icon: RefreshCcw,
    classes: "text-blue-600",
    badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Cancelled: {
    icon: XCircle,
    classes: "text-rose-500",
    badgeClasses: "bg-rose-50 text-rose-700 border-rose-200",
  },
  Failed: {
    icon: XCircle,
    classes: "text-rose-500",
    badgeClasses: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const PAYMENT_ICONS: Record<string, any> = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
  cod: IndianRupee,
  cash: IndianRupee,
  razorpay: CreditCard,
};

const PAYMENT_LABELS: Record<string, any> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
  cash: "Cash Payment",
  razorpay: "Razorpay",
};

interface MobileTransactionPageProps {
  onSignInClick?: () => void;
}

export default function MobileTransactionPage({ onSignInClick }: MobileTransactionPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "pending" | "refunded">("all");
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("fmp_user_token");
    }
    return false;
  });

  const loadUserTransactions = async () => {
    try {
      setLoading(true);
      const userToken = localStorage.getItem("fmp_user_token");
      if (!userToken) {
        setHasToken(false);
        setLoading(false);
        return;
      }
      setHasToken(true);
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: Transaction[] = data.data.map((txn: any) => ({
          id: txn.id,
          bookingId: txn.bookingId || "",
          timestamp: txn.timestamp || new Date(txn.createdAt).toLocaleString(),
          description: txn.description || txn.details || "Booking Payment",
          businessName: txn.businessName || "FindmyPoint Listing",
          details: txn.details || txn.description || "",
          customerName: txn.customerName || "Customer",
          amount: txn.amount,
          type: txn.status === "Refunded" ? "credit" : txn.type || "debit",
          paymentMethod: txn.paymentMethod || "Online",
          status: txn.status || "Completed",
        }));
        setTransactions(mapped);
      }
    } catch (err) {
      console.error("Failed to load user transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserTransactions();
  }, []);

  const handleDownloadInvoice = (txn: Transaction) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
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
      doc.text("Verified Payment Receipt & Invoice", 15, 22);

      const isRefund = txn.status === "Refunded";
      doc.setFillColor(isRefund ? 239 : 240, isRefund ? 246 : 253, isRefund ? 255 : 250);
      doc.roundedRect(90, 12, 45, 8, 1.5, 1.5, "F");
      doc.setTextColor(isRefund ? 37 : 5, isRefund ? 99 : 150, isRefund ? 235 : 105);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(isRefund ? "REFUNDED RECEIPT" : "PAID RECEIPT", 94, 17.2);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(15, 27, 135, 27);

      let y = 36;
      const addRow = (label: string, value: string, fontStyle: "bold" | "normal" = "normal") => {
        doc.setTextColor(secondaryColor);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.text(label, 15, y);

        doc.setTextColor(primaryColor);
        doc.setFont("Helvetica", fontStyle);
        doc.setFontSize(8);
        doc.text(value || "-", 48, y);
        y += 7.5;
      };

      addRow("Transaction ID:", txn.id, "bold");
      if (txn.bookingId) {
        addRow("Booking ID:", txn.bookingId, "bold");
      }
      addRow("Merchant:", txn.businessName);
      addRow("Service/Item:", txn.description);
      addRow("Date & Time:", txn.timestamp);
      addRow("Payment Mode:", txn.paymentMethod);
      addRow("Status:", txn.status, "bold");

      y += 2;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(241, 245, 249);
      doc.roundedRect(15, y, 120, 14, 2, 2, "FD");

      doc.setTextColor(primaryColor);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text(isRefund ? "Total Refunded:" : "Total Amount:", 22, y + 8.5);

      doc.setTextColor(isRefund ? 37 : 5, isRefund ? 99 : 150, isRefund ? 235 : 105);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Rs. ${txn.amount.toLocaleString("en-IN")}.00`, 90, y + 9);

      y += 24;
      doc.setTextColor(secondaryColor);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Thank you for choosing FindmyPoint!", 15, y);
      doc.text("This is an electronically generated receipt. No signature required.", 15, y + 3.5);

      doc.save(`FMP_Receipt_${txn.bookingId || txn.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.businessName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.bookingId && t.bookingId.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;

    if (activeFilter === "completed") return t.status === "Completed" || t.status === "Success";
    if (activeFilter === "pending") return t.status === "Pending";
    if (activeFilter === "refunded") return t.status === "Refunded";

    return true;
  });

  return (
    <div className="h-[calc(100vh-64px)] h-[calc(100dvh-64px)] flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <div className="shrink-0 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-serif text-xl font-bold">Transactions</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Payment history of your bookings and orders
            </p>
          </div>
          {hasToken && (
            <button
              onClick={loadUserTransactions}
              title="Refresh"
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition active:scale-95 cursor-pointer"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by business, service, booking ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-primary/50 placeholder:text-muted-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "all", label: "All" },
            { id: "completed", label: "Paid" },
            { id: "pending", label: "Pending" },
            { id: "refunded", label: "Refunded" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-3 py-1 rounded-full font-medium transition cursor-pointer shrink-0 text-[11px] ${
                activeFilter === pill.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-6">
        {!hasToken ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-1">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">Sign In to View Transactions</h2>
            <p className="text-xs text-muted-foreground max-w-xs">
              Please sign in with your mobile number to check your payment history, receipts, and booking transactions.
            </p>
            <button
              onClick={() => onSignInClick?.()}
              className="mt-3 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In Now</span>
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/60 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-secondary/60 rounded w-3/4" />
                  <div className="h-2.5 bg-secondary/40 rounded w-1/2" />
                </div>
                <div className="w-16 h-8 bg-secondary/50 rounded shrink-0" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center">
              <Inbox className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {search || activeFilter !== "all"
                ? "Try adjusting your search query or filters."
                : "Transactions made for your service bookings and product orders will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((t) => {
              const scfg = STATUS_CONFIG[t.status] || DEFAULT_STATUS_CONFIG;
              const StatusIcon = scfg.icon || CheckCircle2;
              const methodKey = (t.paymentMethod || "card").toLowerCase();
              const PayIcon =
                PAYMENT_ICONS[
                  Object.keys(PAYMENT_ICONS).find((k) => methodKey.includes(k)) || "card"
                ] || CreditCard;
              const payLabel =
                PAYMENT_LABELS[
                  Object.keys(PAYMENT_LABELS).find((k) => methodKey.includes(k)) || ""
                ] || t.paymentMethod || "Payment";

              const isRefund = t.status === "Refunded" || t.type === "credit";
              const isPending = t.status === "Pending";

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedReceipt(t)}
                  className="bg-card border border-border/80 hover:border-primary/40 rounded-2xl p-3.5 flex items-center gap-3 transition shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.99]"
                >
                  {/* Icon Indicator */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isRefund
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        : isPending
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {isRefund ? (
                      <ArrowDownLeft className="h-5 w-5 stroke-[2.5]" />
                    ) : isPending ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-foreground truncate block">
                        {t.businessName || "FindmyPoint Listing"}
                      </span>
                      {t.bookingId && (
                        <span className="text-[10px] bg-secondary px-1.5 py-0.2 rounded text-muted-foreground font-mono shrink-0">
                          #{t.bookingId}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">
                      {t.description}
                    </p>

                    <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1 font-medium">
                        <PayIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{payLabel}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/80">
                        {t.timestamp}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Status Badge */}
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-black ${
                        isRefund
                          ? "text-blue-600 dark:text-blue-400"
                          : isPending
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                      }`}
                    >
                      {isRefund ? "+" : isPending ? "" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-1 ${scfg.badgeClasses}`}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 text-left animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col p-5 font-sans relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Receipt Top Header */}
            <div className="text-center pb-4 mb-4 border-b border-dashed border-border">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2.5 ${
                  selectedReceipt.status === "Refunded"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    : selectedReceipt.status === "Pending"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                }`}
              >
                {selectedReceipt.status === "Refunded" ? (
                  <RefreshCcw className="h-6 w-6 stroke-[2.5]" />
                ) : selectedReceipt.status === "Pending" ? (
                  <Clock className="h-6 w-6 stroke-[2.5]" />
                ) : (
                  <Check className="h-6 w-6 stroke-[3]" />
                )}
              </div>
              <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                {selectedReceipt.status === "Refunded"
                  ? "Refund Processed"
                  : selectedReceipt.status === "Pending"
                  ? "Payment Pending (COD)"
                  : "Payment Verified"}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">FindmyPoint Secure Booking Receipt</p>
            </div>

            {/* Meta details list */}
            <div className="space-y-2.5 text-xs border-b border-border/60 pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Transaction ID:
                </span>
                <span className="font-mono font-bold text-foreground text-[11px]">{selectedReceipt.id}</span>
              </div>

              {selectedReceipt.bookingId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Receipt className="h-3 w-3" /> Booking ID:
                  </span>
                  <span className="font-mono font-bold text-primary text-[11px]">{selectedReceipt.bookingId}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Merchant:
                </span>
                <span className="font-bold text-foreground truncate max-w-[180px]">{selectedReceipt.businessName}</span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                  <Store className="h-3 w-3" /> Service/Item:
                </span>
                <span className="font-medium text-foreground text-right text-[11px] max-w-[180px]">
                  {selectedReceipt.description}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date & Time:
                </span>
                <span className="font-medium text-foreground text-[11px]">{selectedReceipt.timestamp}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Payment Mode:
                </span>
                <span className="font-bold text-foreground">{selectedReceipt.paymentMethod}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    STATUS_CONFIG[selectedReceipt.status]?.badgeClasses || DEFAULT_STATUS_CONFIG.badgeClasses
                  }`}
                >
                  {selectedReceipt.status}
                </span>
              </div>
            </div>

            {/* Total Amount box */}
            <div className="flex justify-between items-center text-sm font-black text-foreground mb-4 bg-secondary/30 border border-border p-3.5 rounded-2xl">
              <span className="text-xs text-muted-foreground">
                {selectedReceipt.status === "Refunded" ? "Total Refunded:" : "Total Amount:"}
              </span>
              <span
                className={`text-base ${
                  selectedReceipt.status === "Refunded"
                    ? "text-blue-600 dark:text-blue-400"
                    : selectedReceipt.status === "Pending"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                ₹{selectedReceipt.amount.toLocaleString("en-IN")}.00
              </span>
            </div>

            {/* Actions */}
            <button
              onClick={() => handleDownloadInvoice(selectedReceipt)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 shadow-md"
            >
              <Download className="h-4 w-4" /> Download PDF Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
