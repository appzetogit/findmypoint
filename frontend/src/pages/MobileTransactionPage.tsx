import { useState } from "react";
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

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-20260702-001",
    timestamp: "02 Jul 2026, 10:15 AM",
    description: "Banquet Hall Booking – Royal Banquet Hall",
    businessName: "Royal Banquet Hall",
    amount: 25000,
    type: "debit",
    paymentMethod: "netbanking",
    status: "Completed",
  },
  {
    id: "TXN-20260701-002",
    timestamp: "01 Jul 2026, 04:45 PM",
    description: "AC Repair & Gas Refill",
    businessName: "Sharma AC Service",
    amount: 1200,
    type: "debit",
    paymentMethod: "upi",
    status: "Completed",
  },
  {
    id: "TXN-20260628-003",
    timestamp: "28 Jun 2026, 02:30 PM",
    description: "Refund – Cancelled Consultation",
    businessName: "Dr. Priya Mehta Clinic",
    amount: 500,
    type: "credit",
    paymentMethod: "upi",
    status: "Refunded",
  },
  {
    id: "TXN-20260625-004",
    timestamp: "25 Jun 2026, 09:00 AM",
    description: "Interior Design Consultation Deposit",
    businessName: "Kapoor Interior Studio",
    amount: 5000,
    type: "debit",
    paymentMethod: "card",
    status: "Completed",
  },
  {
    id: "TXN-20260620-005",
    timestamp: "20 Jun 2026, 06:20 PM",
    description: "Full Body Massage – Luxe Spa",
    businessName: "Luxe Spa & Wellness",
    amount: 1800,
    type: "debit",
    paymentMethod: "upi",
    status: "Failed",
  },
  {
    id: "TXN-20260615-006",
    timestamp: "15 Jun 2026, 11:00 AM",
    description: "Wedding Catering Advance",
    businessName: "Grand Caterers",
    amount: 10000,
    type: "debit",
    paymentMethod: "netbanking",
    status: "Completed",
  },
];

const STATUS_CONFIG = {
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

const PAYMENT_ICONS = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
};

const PAYMENT_LABELS = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

export default function MobileTransactionPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
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
