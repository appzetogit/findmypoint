import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet as WalletIcon,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  CreditCard,
  Send,
  Loader2,
  RefreshCw
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

interface WalletProps {
  clientListings: BusinessListingData[];
}

interface LedgerTransaction {
  id: string;
  bookingId?: string;
  timestamp: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "Completed" | "Processing" | "Refunded" | "Failed";
  details: string;
}

interface WithdrawalRecord {
  id: string;
  timestamp: string;
  amount: number;
  method: "upi" | "bank";
  target: string;
  status: "Completed" | "Processing" | "Failed";
  bizName?: string;
}

export default function Wallet({ clientListings }: WalletProps) {
  // Payout calculation lists
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load payments and withdrawals
  const loadWalletData = async () => {
    // 1. Load active payments across client businesses
    const allPayments: any[] = [];
    
    // Fetch configured commissions from localStorage
    let commissionMap: Record<string, number> = {};
    try {
      const savedCommissions = localStorage.getItem("fmp_business_commissions");
      if (savedCommissions) commissionMap = JSON.parse(savedCommissions);
    } catch (e) {}

    const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    const headers: HeadersInit = {};
    if (token) {
      (headers as any)["Authorization"] = `Bearer ${token}`;
    }

    try {
      await Promise.all(clientListings.map(async (biz) => {
        const commRate = commissionMap[biz.id] !== undefined ? commissionMap[biz.id] : 10; // defaults to 10%
        try {
          const res = await fetch(`http://localhost:5000/api/transactions/business/${biz.id}`, { headers });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            data.data.forEach((txn: any) => {
              allPayments.push({
                id: txn.id,
                bookingId: txn.bookingId || "",
                timestamp: txn.timestamp,
                customerName: txn.customerName || "Guest",
                amount: txn.amount,
                paymentMethod: txn.paymentMethod || "upi",
                status: txn.status || "Completed",
                details: txn.details || txn.description || "Booking Payment",
                bizId: biz.id,
                bizName: biz.name,
                commissionRate: commRate
              });
            });
          }
        } catch {}
      }));
    } catch (e) {
      console.error("Failed to load transactions for wallet", e);
    }

    setPaymentsList(allPayments);

    // 2. Load withdrawal requests from localStorage
    try {
      const savedWithdrawals = localStorage.getItem("fmp_client_withdrawals");
      if (savedWithdrawals) {
        setWithdrawals(JSON.parse(savedWithdrawals));
      } else {
        setWithdrawals([]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadWalletData();
    const handleStorageChange = () => loadWalletData();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [clientListings]);

  // Combined ledger transactions sorting newest first
  const ledgerTransactions = useMemo(() => {
    const list: LedgerTransaction[] = [];

    // 1. Add credit entries from completed bookings
    paymentsList.forEach((pay) => {
      if (pay.status === "Completed") {
        const commAmt = (pay.amount * pay.commissionRate) / 100;
        const netAmt = pay.amount - commAmt;

        list.push({
          id: pay.id,
          bookingId: pay.bookingId,
          timestamp: pay.timestamp,
          type: "credit",
          amount: netAmt,
          description: `Booking payout: ${pay.customerName}`,
          status: "Completed",
          details: `Order Value: ₹${pay.amount} (${pay.commissionRate}% admin commission deducted)`
        });
      } else if (pay.status === "Refunded") {
        list.push({
          id: pay.id,
          bookingId: pay.bookingId,
          timestamp: pay.timestamp,
          type: "debit",
          amount: pay.amount,
          description: `Order cancellation refund`,
          status: "Refunded",
          details: `Refunded back to customer: ${pay.customerName}`
        });
      }
    });

    // 2. Add debit entries from withdrawals
    withdrawals.forEach((w) => {
      list.push({
        id: w.id,
        timestamp: w.timestamp,
        type: "debit",
        amount: w.amount,
        description: `Funds withdrawal to ${w.method.toUpperCase()}`,
        status: w.status,
        details: `Payout account: ${w.target}`
      });
    });

    // Sort by timestamp (newest first)
    return list.sort((a, b) => {
      const partsA = a.timestamp.split(" ");
      const partsB = b.timestamp.split(" ");
      if (partsA.length === 2 && partsB.length === 2) {
        const [dayA, monthA, yearA] = partsA[0].split("/").map(Number);
        const [hourA, minA] = partsA[1].split(":").map(Number);
        const [dayB, monthB, yearB] = partsB[0].split("/").map(Number);
        const [hourB, minB] = partsB[1].split(":").map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA, hourA, minA);
        const dateB = new Date(yearB, monthB - 1, dayB, hourB, minB);
        return dateB.getTime() - dateA.getTime();
      }
      return b.id.localeCompare(a.id);
    });
  }, [paymentsList, withdrawals]);

  // Wallet KPI sums
  const stats = useMemo(() => {
    // Sum of credits from completed payouts
    const totalCredits = ledgerTransactions
      .filter((tx) => tx.type === "credit" && tx.status === "Completed")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Sum of refunds debited from wallet
    const totalRefunds = ledgerTransactions
      .filter((tx) => tx.description.includes("refund") && tx.status === "Refunded")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Sum of successfully completed withdrawals
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "Completed")
      .reduce((sum, w) => sum + w.amount, 0);

    // Net earnings = Credits - Refunds
    const totalNetEarnings = Math.max(0, totalCredits - totalRefunds);

    // Withdrawable Balance = Net Earnings - Total Withdrawn
    const withdrawable = Math.max(0, totalNetEarnings - totalWithdrawn);

    return {
      totalNetEarnings,
      totalWithdrawn,
      withdrawable
    };
  }, [ledgerTransactions, withdrawals]);

  // Filtered transactions matching query & select type
  const filteredTransactions = useMemo(() => {
    return ledgerTransactions.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === "all" ||
        (filterType === "credit" && tx.type === "credit") ||
        (filterType === "debit" && tx.type === "debit");

      return matchesSearch && matchesType;
    });
  }, [ledgerTransactions, searchQuery, filterType]);  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h3 className="font-serif text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-indigo-500" />
            Wallet &amp; Payouts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor booking payouts, calculate net commissions, and transfer earnings to your bank account.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Net Earnings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Net Earnings</span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-4.5 w-4.5 text-indigo-500" /> {stats.totalNetEarnings.toLocaleString("en-IN")}
            </h4>
          </div>
        </div>

        {/* Withdrawable Balance */}
        <div className="bg-white dark:bg-slate-900 border border-indigo-500/30 dark:border-indigo-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm ring-1 ring-indigo-550/10">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Withdrawable Balance</span>
            <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              <IndianRupee className="h-4.5 w-4.5" /> {stats.withdrawable.toLocaleString("en-IN")}
            </h4>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Withdrawn</span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-4.5 w-4.5 text-slate-400" /> {stats.totalWithdrawn.toLocaleString("en-IN")}
            </h4>
          </div>
        </div>
      </div>

      {/* Success Toast message */}
      {toastMessage && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-2xl text-xs font-bold animate-fade-in">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ledger Transaction History (Outer card styling removed) */}
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Ledger Transaction History</h4>

          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-xl bg-slate-50/50 dark:bg-slate-950">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent text-[10px] font-black focus:outline-none cursor-pointer text-slate-600 dark:text-slate-350 uppercase tracking-wide pr-1.5"
            >
              <option value="all">All Logs</option>
              <option value="credit">Credits Only</option>
              <option value="debit">Debits Only</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ledger by transaction description, details, id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-slate-200/55 dark:border-slate-800/55 rounded-2xl bg-white dark:bg-slate-900">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Flow</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-350">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{tx.timestamp}</td>
                     <td className="px-5 py-3 whitespace-nowrap font-mono text-indigo-600 dark:text-indigo-400 font-bold select-all">
                       {tx.bookingId ? (
                         tx.bookingId.startsWith("FMP-") || tx.bookingId.startsWith("BK")
                           ? tx.bookingId
                           : (() => {
                               const numbers = tx.bookingId.replace(/\D/g, "");
                               return `BOOK${numbers.slice(-5) || "12345"}`;
                             })()
                       ) : (
                         (() => {
                           const numbers = tx.id.replace(/\D/g, "");
                           return `BOOK${numbers.slice(-5) || "12345"}`;
                         })()
                       )}
                     </td>
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{tx.description}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {tx.type === "credit" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                          Credit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-wider">
                          Debit
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-black text-slate-900 dark:text-white">
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-[10px]" title={tx.details}>
                      {tx.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500 font-semibold animate-fade-in">
                    No ledger transactions found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
