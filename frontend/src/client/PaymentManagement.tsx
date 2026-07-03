import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Download,
  AlertCircle,
  Calendar,
  Building,
  TrendingUp,
  ArrowRightLeft
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

interface PaymentManagementProps {
  clientListings: BusinessListingData[];
}

export interface PaymentTransaction {
  id: string;
  bookingId?: string;
  timestamp: string;
  customerName: string;
  amount: number;
  paymentMethod: "upi" | "card" | "netbanking";
  status: "Completed" | "Refunded" | "Failed";
  details: string;
}

// Generate some premium default mock payments if none are stored in localStorage
const generateMockPayments = (bizId: string): PaymentTransaction[] => {
  const currentYear = new Date().getFullYear();
  return [
    {
      id: `txn-${Date.now() - 1000 * 60 * 60 * 24 * 3}`, // 3 days ago
      timestamp: `28/06/${currentYear} 14:35`,
      customerName: "Rahul Sharma",
      amount: 499,
      paymentMethod: "upi",
      status: "Completed",
      details: "Standard AC Repair Package Service Enquiry Deposit"
    },
    {
      id: `txn-${Date.now() - 1000 * 60 * 65 * 24 * 6}`, // 6 days ago
      timestamp: `25/06/${currentYear} 11:20`,
      customerName: "Priyanka Verma",
      amount: 999,
      paymentMethod: "card",
      status: "Completed",
      details: "Premium Consulting & Accounting Package"
    },
    {
      id: `txn-${Date.now() - 1000 * 60 * 70 * 24 * 10}`, // 10 days ago
      timestamp: `21/06/${currentYear} 19:40`,
      customerName: "Aman Gupta",
      amount: 349,
      paymentMethod: "upi",
      status: "Completed",
      details: "Product Order: Paneer Tikka Butter Masala x1"
    },
    {
      id: `txn-${Date.now() - 1000 * 60 * 80 * 24 * 12}`, // 12 days ago
      timestamp: `19/06/${currentYear} 09:15`,
      customerName: "Sneha Patel",
      amount: 1999,
      paymentMethod: "netbanking",
      status: "Refunded",
      details: "Room Stay Reservation Deposit (Deluxe AC Room)"
    },
    {
      id: `txn-${Date.now() - 1000 * 60 * 90 * 24 * 15}`, // 15 days ago
      timestamp: `16/06/${currentYear} 13:10`,
      customerName: "Vikram Rathore",
      amount: 289,
      paymentMethod: "upi",
      status: "Completed",
      details: "Product Order: Butter Naan & Dal Makhani Combo x1"
    },
    {
      id: `txn-${Date.now() - 1000 * 60 * 95 * 24 * 18}`, // 18 days ago
      timestamp: `13/06/${currentYear} 10:00`,
      customerName: "Aditi Rao",
      amount: 300,
      paymentMethod: "card",
      status: "Completed",
      details: "Doctor Consultation Fee Slot Booking"
    }
  ];
};

export default function PaymentManagement({ clientListings }: PaymentManagementProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>("");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [successMsg, setSuccessMsg] = useState("");

  // Set default business
  useEffect(() => {
    if (clientListings.length > 0 && !selectedBizId) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings, selectedBizId]);

  // Load transactions from localStorage or fallback to Mock data
  useEffect(() => {
    if (selectedBizId) {
      const storageKey = `fmp_service_payments:${selectedBizId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setTransactions(JSON.parse(saved));
        } catch (e) {
          setTransactions([]);
        }
      } else {
        const mockData = generateMockPayments(selectedBizId);
        localStorage.setItem(storageKey, JSON.stringify(mockData));
        setTransactions(mockData);
      }
    }
  }, [selectedBizId]);

  // Selected Business Data
  const selectedBiz = useMemo(() => {
    return clientListings.find((b) => b.id === selectedBizId);
  }, [clientListings, selectedBizId]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus =
        statusFilter === "all" || txn.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const completedTxns = transactions.filter((t) => t.status === "Completed");
    const refundedTxns = transactions.filter((t) => t.status === "Refunded");

    const totalRevenue = completedTxns.reduce((sum, t) => sum + t.amount, 0);
    const refundTotal = refundedTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalTxnsCount = transactions.length;

    const avgTransactionValue = completedTxns.length > 0
      ? Math.round(totalRevenue / completedTxns.length)
      : 0;

    const refundRate = totalTxnsCount > 0
      ? Math.round((refundedTxns.length / totalTxnsCount) * 100)
      : 0;

    // Payment Methods Breakdown
    let upiCount = 0;
    let cardCount = 0;
    let bankCount = 0;

    completedTxns.forEach((t) => {
      if (t.paymentMethod === "upi") upiCount++;
      else if (t.paymentMethod === "card") cardCount++;
      else if (t.paymentMethod === "netbanking") bankCount++;
    });

    const totalCompleted = completedTxns.length || 1;
    const upiPercent = Math.round((upiCount / totalCompleted) * 100);
    const cardPercent = Math.round((cardCount / totalCompleted) * 100);
    const bankPercent = Math.round((bankCount / totalCompleted) * 100);

    return {
      totalRevenue,
      refundTotal,
      totalTxnsCount,
      avgTransactionValue,
      refundRate,
      upiPercent,
      cardPercent,
      bankPercent,
      upiCount,
      cardCount,
      bankCount
    };
  }, [transactions]);

  // Handle simulate refund
  const handleRefund = (txnId: string) => {
    if (window.confirm("Are you sure you want to issue a full refund for this transaction?")) {
      const updated = transactions.map((t) => {
        if (t.id === txnId) {
          return { ...t, status: "Refunded" as const };
        }
        return t;
      });
      setTransactions(updated);
      localStorage.setItem(`fmp_service_payments:${selectedBizId}`, JSON.stringify(updated));

      setSuccessMsg("Refund issued successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Simulate download reports
  const handleDownloadReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Date & Time,Customer,Details,Amount,Payment Method,Status\n";

    filteredTransactions.forEach((t) => {
      csvContent += `"${t.id}","${t.timestamp}","${t.customerName}","${t.details.replace(/"/g, '""')}",${t.amount},"${t.paymentMethod}","${t.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fmp_payments_${selectedBizId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg("Report downloaded successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (clientListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 space-y-3">
        <Building className="h-12 w-12 text-slate-400" />
        <p className="text-sm font-semibold">No businesses found linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up text-left max-w-6xl mx-auto pb-10">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Payment Management</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track payouts, customer transaction history, and detailed revenue metrics.</p>
        </div>

        {/* Business Selector Dropdown - only show if there are multiple listings */}
        {clientListings.length > 1 && (
          <div className="flex items-center gap-2">
            <Building className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
            <select
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm focus:ring-1 focus:ring-indigo-500"
            >
              {clientListings.map((biz) => (
                <option key={biz.id} value={biz.id}>
                  {biz.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-bold text-center animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* Metrics Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Earnings</span>
            <span className="block text-xl font-serif font-black text-slate-850 dark:text-slate-100 mt-0.5">₹{metrics.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Transactions</span>
            <span className="block text-xl font-serif font-black text-slate-850 dark:text-slate-100 mt-0.5">{metrics.totalTxnsCount}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Avg Txn Value</span>
            <span className="block text-xl font-serif font-black text-slate-850 dark:text-slate-100 mt-0.5">₹{metrics.avgTransactionValue}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Refund Rate</span>
            <span className="block text-xl font-serif font-black text-slate-850 dark:text-slate-100 mt-0.5">{metrics.refundRate}%</span>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Method Distribution & Analysis */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-5 text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-850">
            Payment Method Split
          </h4>

          <div className="space-y-4 mt-2">
            {/* UPI Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                <span>UPI Payments</span>
                <span>{metrics.upiPercent}% ({metrics.upiCount})</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${metrics.upiPercent}%` }}
                />
              </div>
            </div>

            {/* Card Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                <span>Credit/Debit Card</span>
                <span>{metrics.cardPercent}% ({metrics.cardCount})</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${metrics.cardPercent}%` }}
                />
              </div>
            </div>

            {/* Net Banking Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                <span>Net Banking</span>
                <span>{metrics.bankPercent}% ({metrics.bankCount})</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${metrics.bankPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150/40 dark:border-indigo-900/35 rounded-xl p-3.5 mt-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              <strong>UPI</strong> continues to be the preferred choice for consumer payments, contributing to faster settlement cycles. Issue instant card/netbanking refunds directly via portal controls.
            </p>
          </div>
        </div>

        {/* Right Card: Weekly Revenue visual bars */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm lg:col-span-7 text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-850">
            Simulated Revenue Growth (Weekly)
          </h4>

          <div className="h-32 flex items-end gap-5 justify-around mt-4 pb-2 border-b border-slate-100 dark:border-slate-850">
            {[
              { label: "W1", height: "40%", revenue: "₹3,450" },
              { label: "W2", height: "55%", revenue: "₹4,800" },
              { label: "W3", height: "35%", revenue: "₹2,900" },
              { label: "W4", height: "80%", revenue: "₹7,200" },
              { label: "Current", height: "95%", revenue: "₹9,450" }
            ].map((week, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer h-full justify-end">
                {/* Popover on hover */}
                <div className="absolute bottom-full mb-2 bg-slate-950 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                  {week.revenue}
                </div>
                <div
                  className="w-8 sm:w-12 bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg transition-all duration-700 group-hover:from-emerald-500 group-hover:to-emerald-400"
                  style={{ height: week.height }}
                />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-2">{week.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center font-bold mt-2.5">
            Hover over bars to view revenue data per weekly cycle
          </p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-450 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, customer name or order detail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-350 outline-none shadow-sm focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
            title="Download CSV Report"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Customer Name</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Method</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {txn.id.slice(0, 15)}...
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-405 font-semibold">
                      {txn.timestamp}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-900 dark:text-white font-extrabold">
                      {txn.customerName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-550 dark:text-slate-400 font-semibold max-w-xs truncate" title={txn.details}>
                      {txn.details}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-550 dark:text-slate-400 font-black uppercase">
                      {txn.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-900 dark:text-white font-serif font-black">
                      ₹{txn.amount}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        txn.status === "Completed"
                          ? "bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-450 border border-emerald-250/25"
                          : txn.status === "Refunded"
                            ? "bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-450 border border-amber-250/25"
                            : "bg-rose-50 dark:bg-rose-950/25 text-rose-600 dark:text-rose-450 border border-rose-250/25"
                      }`}>
                        {txn.status === "Completed" && <CheckCircle className="h-3 w-3 fill-current stroke-none" />}
                        {txn.status === "Refunded" && <RefreshCcw className="h-3 w-3" />}
                        {txn.status === "Failed" && <XCircle className="h-3 w-3 fill-current stroke-none" />}
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {txn.status === "Completed" ? (
                        <button
                          onClick={() => handleRefund(txn.id)}
                          className="px-3 py-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg text-[10.5px] font-bold transition duration-300 cursor-pointer active:scale-95 border border-amber-500/20"
                        >
                          Issue Refund
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60 font-extrabold italic select-none">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3.5 opacity-40" />
            <p className="text-sm font-semibold">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
