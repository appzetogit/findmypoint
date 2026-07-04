import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Wallet,
  Search,
  Building,
  IndianRupee,
  Percent,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { businessesData } from "../data/businessesData";

interface BusinessWalletRow {
  id: string;
  name: string;
  category: string;
  salesVolume: number;
  commissionRate: number;
  adminEarnings: number;
  clientNetEarnings: number;
  clientWithdrawn: number;
  walletBalance: number;
}

interface WalletLedgerItem {
  id: string;
  timestamp: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: string;
  details: string;
}

// Simulated mock payments generator to compute sales volume if empty
const getMockPaymentsForBiz = (bizId: string): any[] => {
  const currentYear = new Date().getFullYear();
  return [
    { id: `txn-${bizId}-1`, timestamp: `02/07/${currentYear} 10:15`, customerName: "Arjun Mehta", amount: 1500, paymentMethod: "upi", status: "Completed", details: "Full House Deep Cleaning Service" },
    { id: `txn-${bizId}-2`, timestamp: `01/07/${currentYear} 16:45`, customerName: "Neha Kapoor", amount: 799, paymentMethod: "card", status: "Completed", details: "Plumbing Inspection & Leak Repair" },
    { id: `txn-${bizId}-3`, timestamp: `28/06/${currentYear} 14:35`, customerName: "Rahul Sharma", amount: 499, paymentMethod: "upi", status: "Completed", details: "Standard AC Repair Package Service Enquiry Deposit" },
    { id: `txn-${bizId}-4`, timestamp: `27/06/${currentYear} 09:30`, customerName: "Karan Johar", amount: 2500, paymentMethod: "netbanking", status: "Completed", details: "Interior Design Consultation Deposit" },
    { id: `txn-${bizId}-5`, timestamp: `26/06/${currentYear} 18:20`, customerName: "Meera Nair", amount: 350, paymentMethod: "upi", status: "Refunded", details: "Kitchen Chimney Cleaning Cancellation Refund" }
  ];
};

export default function AdminBusinessWallets() {
  const [walletRows, setWalletRows] = useState<BusinessWalletRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ledger Modal States
  const [selectedBiz, setSelectedBiz] = useState<BusinessWalletRow | null>(null);
  const [bizLedger, setBizLedger] = useState<WalletLedgerItem[]>([]);

  const loadWalletsData = () => {
    // 1. Load active bookings list
    let allBiz = [...businessesData];
    try {
      const savedCustom = localStorage.getItem("fmp_custom_businesses");
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) {
          parsed.forEach((custom: any) => {
            if (!allBiz.some((b) => b.id === custom.id)) {
              allBiz.push(custom);
            }
          });
        }
      }
    } catch (e) {}

    // Load configurations from localStorage
    let commissionMap: Record<string, number> = {};
    let withdrawalsList: any[] = [];
    try {
      const savedComms = localStorage.getItem("fmp_business_commissions");
      if (savedComms) commissionMap = JSON.parse(savedComms);

      const savedWithdrawals = localStorage.getItem("fmp_client_withdrawals");
      if (savedWithdrawals) withdrawalsList = JSON.parse(savedWithdrawals);
    } catch (e) {}

    // Compile rows for active booking listings
    const compiled: BusinessWalletRow[] = allBiz.map((biz) => {
      // 1. Get payments/sales volume
      const paymentsKey = `fmp_service_payments:${biz.id}`;
      const saved = localStorage.getItem(paymentsKey);
      let bizPayments = [];

      if (saved) {
        try {
          bizPayments = JSON.parse(saved);
        } catch (e) {}
      } else {
        const mocks = getMockPaymentsForBiz(biz.id);
        bizPayments = mocks;
      }

      const completedPayments = bizPayments.filter((p: any) => p.status === "Completed");
      const salesVolume = completedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

      // 2. Get commission rate
      const commissionRate = commissionMap[biz.id] !== undefined ? commissionMap[biz.id] : 10; // default 10%
      const adminEarnings = parseFloat(((salesVolume * commissionRate) / 100).toFixed(2));
      const clientNetEarnings = salesVolume - adminEarnings;

      // 3. Get withdrawals for this business
      // Note: We check matching bizName or bizId.
      const completedWithdrawals = withdrawalsList.filter(
        (w: any) => (w.bizName === biz.name || w.bizId === biz.id) && w.status === "Completed"
      );
      const clientWithdrawn = completedWithdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);
      const walletBalance = Math.max(0, clientNetEarnings - clientWithdrawn);

      return {
        id: biz.id,
        name: biz.name,
        category: biz.category || "General",
        salesVolume,
        commissionRate,
        adminEarnings,
        clientNetEarnings,
        clientWithdrawn,
        walletBalance
      };
    });

    setWalletRows(compiled);
  };

  useEffect(() => {
    loadWalletsData();
    const handleStorage = () => loadWalletsData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return walletRows.filter((row) => {
      return (
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [walletRows, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalVolume = walletRows.reduce((sum, r) => sum + r.salesVolume, 0);
    const totalAdminComm = walletRows.reduce((sum, r) => sum + r.adminEarnings, 0);
    const totalClientWallets = walletRows.reduce((sum, r) => sum + r.walletBalance, 0);

    return {
      totalVolume,
      totalAdminComm,
      totalClientWallets
    };
  }, [walletRows]);

  // Load detailed ledger for selected business
  const handleOpenLedger = (row: BusinessWalletRow) => {
    setSelectedBiz(row);

    // Get payments list
    const paymentsKey = `fmp_service_payments:${row.id}`;
    let bizPayments = [];
    try {
      const saved = localStorage.getItem(paymentsKey);
      bizPayments = saved ? JSON.parse(saved) : getMockPaymentsForBiz(row.id);
    } catch (e) {}

    // Get withdrawals list
    let withdrawalsList: any[] = [];
    try {
      const saved = localStorage.getItem("fmp_client_withdrawals");
      if (saved) withdrawalsList = JSON.parse(saved);
    } catch (e) {}

    const list: WalletLedgerItem[] = [];

    // Add Completed booking credits
    bizPayments.forEach((pay: any) => {
      if (pay.status === "Completed") {
        const commAmt = (pay.amount * row.commissionRate) / 100;
        const netAmt = pay.amount - commAmt;

        list.push({
          id: pay.id,
          timestamp: pay.timestamp,
          type: "credit",
          amount: netAmt,
          description: `Booking payout: ${pay.customerName}`,
          status: "Completed",
          details: `Booking Value: ₹${pay.amount} (${row.commissionRate}% admin commission deducted)`
        });
      } else if (pay.status === "Refunded") {
        list.push({
          id: pay.id,
          timestamp: pay.timestamp,
          type: "debit",
          amount: pay.amount,
          description: `Order cancellation refund`,
          status: "Refunded",
          details: `Refunded back to customer: ${pay.customerName}`
        });
      }
    });

    // Add Completed withdrawals debits
    const bizWithdrawals = withdrawalsList.filter(
      (w: any) => (w.bizName === row.name || w.bizId === row.id) && w.status === "Completed"
    );
    bizWithdrawals.forEach((w: any) => {
      list.push({
        id: w.id,
        timestamp: w.timestamp,
        type: "debit",
        amount: w.amount,
        description: "Client funds withdrawal",
        status: "Completed",
        details: `Payout account: ${w.target}`
      });
    });

    // Sort by timestamp (newest first)
    list.sort((a, b) => {
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

    setBizLedger(list);
  };

  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-500" />
            Client Business Wallets Audit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit transactions, commission yields, disbursed payouts, and current wallets balance across all listings.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Total Transaction Volume</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalVolume.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Total Admin Commission Yield</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white text-emerald-500 flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalAdminComm.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Percent className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Total Client Wallets Balance</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalClientWallets.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-550/10 flex items-center justify-center text-indigo-600">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Audit grid table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search wallet logs by business name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Wallets Table */}
        <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sales Volume</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Admin Share</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Client Earning</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Client Withdrawn</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">Wallet Balance</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-350">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.category}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      ₹{row.salesVolume.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 font-bold">{row.commissionRate}%</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-450">
                      ₹{row.adminEarnings.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      ₹{row.clientNetEarnings.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-rose-500">
                      ₹{row.clientWithdrawn.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">
                      ₹{row.walletBalance.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenLedger(row)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-900/30 transition cursor-pointer inline-flex items-center justify-center"
                        title="View Audit Ledger"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-550 font-semibold">
                    No active wallets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Modal overlay */}
      {selectedBiz && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-5 animate-scale-in text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-500" />
                <div className="text-left">
                  <h4 className="font-bold text-base">{selectedBiz.name}</h4>
                  <p className="text-[10px] text-slate-400">{selectedBiz.category} • Wallet Ledger Account</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBiz(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Small Balance Summary inside Modal */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150/40 dark:border-slate-800/40 text-left">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Net Client Earnings</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">₹{selectedBiz.clientNetEarnings.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Client Withdrawn</span>
                <span className="text-xs font-black text-rose-500">₹{selectedBiz.clientWithdrawn.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Remaining Wallet</span>
                <span className="text-xs font-black text-indigo-500">₹{selectedBiz.walletBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Ledger Transactions list */}
            <div className="overflow-y-auto max-h-72 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <table className="w-full border-collapse text-left text-xs font-medium">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0">
                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Flow</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
                  {bizLedger.length > 0 ? (
                    bizLedger.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap text-slate-500">{tx.timestamp}</td>
                        <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{tx.description}</td>
                        <td className="px-5 py-3">
                          {tx.type === "credit" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider">
                              Credit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-wider">
                              Debit
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 font-black text-slate-900 dark:text-white">
                          {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3 text-[10px] text-slate-550 max-w-[200px] truncate" title={tx.details}>
                          {tx.details}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-semibold">
                        No transactions registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end text-xs font-bold">
              <button
                onClick={() => setSelectedBiz(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl cursor-pointer transition-all"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
