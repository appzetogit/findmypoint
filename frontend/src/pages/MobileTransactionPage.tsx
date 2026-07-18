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
const STATUS_CONFIG: any = {
  Completed: {
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

const PAYMENT_ICONS: any = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
};

const PAYMENT_LABELS: any = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

export default function MobileTransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadUserTransactions = async () => {
      try {
        const userToken = localStorage.getItem("fmp_user_token");
        if (!userToken) return;
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-0">
        {/* Transaction list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => {
              const scfg = STATUS_CONFIG[t.status];
              const StatusIcon = scfg.icon;
              const PayIcon = PAYMENT_ICONS[t.paymentMethod];

              return (
                <div
                  key={t.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                >
                  {/* Left icon */}
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      t.type === "debit" ? "bg-rose-50" : "bg-emerald-50"
                    }`}
                  >
                    {t.type === "debit" ? (
                      <ArrowUpRight className="h-5 w-5 text-rose-500" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>

                  {/* Middle content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-snug">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <PayIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground">
                        {PAYMENT_LABELS[t.paymentMethod]}
                      </span>
                      <span className="text-muted-foreground/50 text-[11px]">·</span>
                      <span className="text-[11px] text-muted-foreground">{t.timestamp}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${scfg.badgeClasses}`}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {t.status}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold ${
                        t.type === "debit" ? "text-foreground" : "text-emerald-600"
                      }`}
                    >
                      {t.type === "debit" ? "-" : "+"}₹{t.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {t.id.slice(-6)}
                    </p>
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
