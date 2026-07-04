import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Search,
  Building,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  IndianRupee,
  Download,
  Filter,
  ArrowRightLeft
} from "lucide-react";
import { businessesData } from "../data/businessesData";

interface PaymentTransaction {
  id: string;
  bookingId?: string;
  timestamp: string;
  businessId: string;
  businessName: string;
  customerName: string;
  amount: number;
  paymentMethod: "upi" | "card" | "netbanking" | string;
  status: "Completed" | "Refunded" | "Failed" | string;
  details: string;
}

// Mock payments generator (matching client structure)
const getMockPaymentsForBiz = (bizId: string, bizName: string): PaymentTransaction[] => {
  const currentYear = new Date().getFullYear();
  const names = ["Arjun Mehta", "Neha Kapoor", "Rahul Sharma", "Karan Johar", "Meera Nair", "Priyanka Verma", "Rohan Das", "Ananya Sen", "Kabir Singh", "Aman Gupta"];
  const methods = ["upi", "card", "netbanking"];
  const statuses = ["Completed", "Completed", "Completed", "Refunded", "Failed"];
  const items = ["Deposit", "Consultation Fee", "Full Payment", "Service Charge"];

  return Array.from({ length: 5 }, (_, i) => {
    const daysAgo = i * 2 + 1;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const strHours = String(date.getHours()).padStart(2, "0");
    const strMinutes = String(date.getMinutes()).padStart(2, "0");
    const timestamp = `${day}/${month}/${currentYear} ${strHours}:${strMinutes}`;

    return {
      id: `txn-${bizId.substring(0, 4)}-${Date.now() - i * 100000}`,
      timestamp,
      businessId: bizId,
      businessName: bizName,
      customerName: names[i % names.length],
      amount: [250, 499, 799, 1200, 1500][i % 5],
      paymentMethod: methods[i % methods.length],
      status: statuses[i % statuses.length],
      details: `${items[i % items.length]} for booking request`
    };
  });
};

export default function AdminPaymentManagement() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedBiz, setSelectedBiz] = useState("All");

  const loadAllPayments = () => {
    // 1. Gather all businesses
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
    } catch (e) {
      console.error("Failed to load custom businesses in payment panel", e);
    }

    // 2. Load payments for each business
    const list: PaymentTransaction[] = [];
    allBiz.forEach((biz) => {
      const paymentsKey = `fmp_service_payments:${biz.id}`;
      const saved = localStorage.getItem(paymentsKey);
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((tx: any) => {
              list.push({
                ...tx,
                businessId: biz.id,
                businessName: biz.name
              });
            });
          }
        } catch (e) {
          console.error("Failed to parse payments for " + biz.name, e);
        }
      } else {
        // Fallback to generating mock payments if empty
        const mocks = getMockPaymentsForBiz(biz.id, biz.name);
        localStorage.setItem(paymentsKey, JSON.stringify(mocks));
        mocks.forEach((m) => list.push(m));
      }
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

    setTransactions(list);
  };

  useEffect(() => {
    loadAllPayments();
  }, []);

  // Filter unique businesses for filter dropdown
  const uniqueBusinesses = useMemo(() => {
    const map = new Map<string, string>();
    transactions.forEach((tx) => {
      map.set(tx.businessId, tx.businessName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [transactions]);

  // Statistics Summary
  const stats = useMemo(() => {
    const completedTxns = transactions.filter((tx) => tx.status === "Completed");
    const totalVolume = completedTxns.reduce((sum, tx) => sum + tx.amount, 0);
    const totalRefunds = transactions
      .filter((tx) => tx.status === "Refunded")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalCount = transactions.length;
    const successRate = totalCount > 0
      ? Math.round((completedTxns.length / totalCount) * 100)
      : 0;

    return {
      totalVolume,
      totalRefunds,
      totalCount,
      successRate
    };
  }, [transactions]);

  // Filter transactions based on query & selects
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === "All" || tx.status === selectedStatus;
      const matchesMethod = selectedMethod === "All" || tx.paymentMethod === selectedMethod;
      const matchesBiz = selectedBiz === "All" || tx.businessId === selectedBiz;

      return matchesSearch && matchesStatus && matchesMethod && matchesBiz;
    });
  }, [transactions, searchQuery, selectedStatus, selectedMethod, selectedBiz]);

  const handleDownloadReport = () => {
    const headers = "Transaction ID,Timestamp,Business Name,Customer Name,Amount,Method,Status,Details\n";
    const rows = filteredTransactions
      .map(
        (tx) =>
          `"${tx.id}","${tx.timestamp}","${tx.businessName}","${tx.customerName}",${tx.amount},"${tx.paymentMethod}","${tx.status}","${tx.details}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_payments_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-500" />
            Admin Payment Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overview and logs of all transactions processed across businesses.
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer transition-all shrink-0 self-start sm:self-center"
        >
          <Download className="h-4 w-4" /> Download CSV Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Volume</span>
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
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Refunds</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalRefunds.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transactions count</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalCount}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Success Rate</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.successRate}%</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Filters bar */}
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, customer, business, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Business filter */}
            <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedBiz}
                onChange={(e) => setSelectedBiz(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350 pr-2"
              >
                <option value="All">All Businesses</option>
                {uniqueBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350 pr-2"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Refunded">Refunded</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Method filter */}
            <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350 pr-2"
              >
                <option value="All">All Methods</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500 dark:text-slate-400">{tx.id.substring(0, 15)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{tx.timestamp}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{tx.businessName}</td>
                    <td className="px-6 py-4">{tx.customerName}</td>
                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 uppercase font-bold text-slate-500 dark:text-slate-400">{tx.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.status === "Completed" && (
                        <span className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3" /> Completed
                        </span>
                      )}
                      {tx.status === "Refunded" && (
                        <span className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                          <AlertCircle className="h-3 w-3" /> Refunded
                        </span>
                      )}
                      {tx.status === "Failed" && (
                        <span className="flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider">
                          <XCircle className="h-3 w-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={tx.details}>
                      {tx.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No transactions found matching the selected filters.
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
