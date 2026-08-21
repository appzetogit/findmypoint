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
} from "lucide-react";
import { API_BASE_URL } from "../config";

export interface Transaction {
  id: string;
  timestamp: string;
  description: string;
  businessName: string;
  amount: number;
  type: "debit" | "credit";
  paymentMethod: "upi" | "card" | "netbanking";
  status: "Completed" | "Refunded" | "Failed";
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
  Refunded: {
    icon: RefreshCcw,
    classes: "text-blue-600",
    badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
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
};

const PAYMENT_LABELS: Record<string, any> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

interface MobileTransactionPageProps {
  onSignInClick?: () => void;
}

export default function MobileTransactionPage({ onSignInClick }: MobileTransactionPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("fmp_user_token");
    }
    return false;
  });

  useEffect(() => {
    const loadUserTransactions = async () => {
      try {
        const userToken = localStorage.getItem("fmp_user_token");
        if (!userToken) {
          setHasToken(false);
          return;
        }
        setHasToken(true);
        const res = await fetch(`${API_BASE_URL}/transactions`, {
          headers: {
            "Authorization": `Bearer ${userToken}`
          }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const mapped: Transaction[] = data.data.map((txn: any) => ({
            id: txn.id,
            timestamp: txn.timestamp || new Date(txn.createdAt).toLocaleString(),
            description: txn.description || "Listing Fee Payment",
            businessName: txn.businessName || "FindmyPoint",
            amount: txn.amount,
            type: txn.type || "debit",
            paymentMethod: txn.paymentMethod || "card",
            status: txn.status || "Completed"
          }));
          setTransactions(mapped);
        }
      } catch (err) {
        console.error("Failed to load user transactions:", err);
      }
    };
    loadUserTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.businessName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="h-[calc(100vh-64px)] h-[calc(100dvh-64px)] flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <div className="shrink-0 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-4 pb-3">
        <h1 className="font-serif text-xl font-bold mb-3">Transactions</h1>

        {/* Search */}
        <div className="relative mb-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-6">
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => {
              const scfg = STATUS_CONFIG[t.status] || DEFAULT_STATUS_CONFIG;
              const StatusIcon = scfg.icon || CheckCircle2;
              const methodKey = (t.paymentMethod || "card").toLowerCase();
              const PayIcon = PAYMENT_ICONS[methodKey] || CreditCard;
              const payLabel = PAYMENT_LABELS[methodKey] || t.paymentMethod || "Payment";

              return (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      t.type === "debit" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {t.type === "debit" ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{t.description}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                      <PayIcon className="h-3 w-3" />
                      <span>{payLabel}</span>
                      <span>•</span>
                      <span>{t.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        t.type === "debit" ? "text-foreground" : "text-emerald-600"
                      }`}
                    >
                      {t.type === "debit" ? "-" : "+"}₹{t.amount.toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold mt-0.5 ${scfg.classes}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
