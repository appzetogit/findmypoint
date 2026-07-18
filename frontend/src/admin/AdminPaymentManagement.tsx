import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
  ArrowRightLeft,
  Eye
} from "lucide-react";
import { businessesData } from "../data/businessesData";
import { API_BASE_URL } from "../config";

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

export default function AdminPaymentManagement() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedBiz, setSelectedBiz] = useState("All");
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedMethod, selectedBiz]);

  const loadAllPayments = async () => {
    const list: PaymentTransaction[] = [];

    // Load backend database transactions
    try {
      const adminToken = localStorage.getItem("fmp_admin_token");
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((txn: any) => {
          list.push({
            id: txn.id,
            timestamp: txn.timestamp || new Date(txn.createdAt).toLocaleString(),
            businessId: txn.userId || "admin",
            businessName: txn.businessName || "FindmyPoint",
            customerName: "Online User",
            amount: txn.amount,
            paymentMethod: txn.paymentMethod || "card",
            status: txn.status || "Completed",
            details: txn.description || "Listing Fee Payment"
          });
        });
      }
    } catch (err) {
      console.error("Failed to fetch database transactions:", err);
    }

    // Sort by timestamp (newest first)
    list.sort((a, b) => {
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

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Volume</span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-5 w-5" /> {stats.totalVolume.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Refunds</span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-5 w-5" /> {stats.totalRefunds.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transactions count</span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.totalCount}</h4>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Success Rate</span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.successRate}%</h4>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-5 w-5" />
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
        <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl no-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-955/50 border-b border-slate-200/60 dark:border-slate-800/60">
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Name</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-3.5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-3.5 py-3 font-mono font-bold text-slate-500 dark:text-slate-400">{tx.id.substring(0, 12)}...</td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{tx.timestamp}</td>
                    <td className="px-3.5 py-3 font-bold text-slate-900 dark:text-white">{tx.businessName}</td>
                    <td className="px-3.5 py-3">{tx.customerName}</td>
                    <td className="px-3.5 py-3 font-black text-slate-900 dark:text-white">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3.5 py-3 uppercase font-bold text-slate-500 dark:text-slate-400">{tx.paymentMethod}</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
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
                    <td className="px-3.5 py-3 text-slate-505 dark:text-slate-400 max-w-[150px] truncate" title={tx.details}>
                      {tx.details}
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <button
                        onClick={() => setSelectedTxn(tx)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-indigo-50/50 hover:bg-indigo-150/40 dark:bg-indigo-955/20 dark:hover:bg-indigo-955/40 text-indigo-650 dark:text-indigo-400 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs font-semibold">
            <span className="text-slate-400">
              Showing <span className="text-slate-700 dark:text-slate-300 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-700 dark:text-slate-300 font-bold">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="text-slate-700 dark:text-slate-300 font-bold">{filteredTransactions.length}</span> transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed font-bold"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer flex items-center justify-center text-xs ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-955 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Transaction Details Modal */}
      {selectedTxn && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 max-w-lg w-full relative overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                    Transaction Details
                  </h3>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">
                    ID: {selectedTxn.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-955 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-455 hover:text-rose-600 transition cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850/50">
                  <span className="text-slate-400 font-medium">Business Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTxn.businessName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850/50">
                  <span className="text-slate-400 font-medium">Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTxn.customerName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850/50">
                  <span className="text-slate-400 font-medium">Date & Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTxn.timestamp}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850/50">
                  <span className="text-slate-400 font-medium">Method:</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{selectedTxn.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850/50">
                  <span className="text-slate-400 font-medium">Payment Status:</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${selectedTxn.status === "Completed" ? "bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600" : selectedTxn.status === "Refunded" ? "bg-amber-50 dark:bg-amber-955/20 text-amber-600" : "bg-rose-50 dark:bg-rose-955/20 text-rose-600"}`}>
                    {selectedTxn.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">Amount:</span>
                  <span className="font-extrabold text-indigo-650 dark:text-indigo-400 text-sm">
                    ₹{selectedTxn.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="bg-slate-55/50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-850/60 rounded-2xl p-4.5">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-2">Description / Booking Details</span>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{selectedTxn.details}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
