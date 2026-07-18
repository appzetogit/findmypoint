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
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight
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

export default function PaymentManagement({ clientListings }: PaymentManagementProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>("");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Set default business
  useEffect(() => {
    if (clientListings.length > 0 && !selectedBizId) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings, selectedBizId]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  // Load transactions from backend API
  useEffect(() => {
    if (selectedBizId) {
      const loadTransactions = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/transactions/business/${selectedBizId}`, {
            headers: getAuthHeaders()
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const mapped = data.data.map((txn: any) => ({
              id: txn.id,
              bookingId: txn.bookingId || "",
              timestamp: txn.timestamp,
              customerName: txn.customerName || "Guest",
              amount: txn.amount,
              paymentMethod: txn.paymentMethod || "upi",
              status: txn.status || "Completed",
              details: txn.details || txn.description || "Booking Payment"
            }));
            setTransactions(mapped);
          } else {
            setTransactions([]);
          }
        } catch (e) {
          setTransactions([]);
        }
      };
      loadTransactions();
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

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Reset page when search or status filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedBizId]);

  // Adjust page if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

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
  const handleRefund = async (txnId: string) => {
    if (window.confirm("Are you sure you want to issue a full refund for this transaction?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/transactions/${txnId}/refund`, {
          method: "PUT",
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === txnId ? { ...t, status: "Refunded" as const } : t))
          );
          setSuccessMsg("Refund issued successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        } else {
          alert(data.message || "Failed to issue refund");
        }
      } catch (err) {
        alert("Failed to issue refund in database");
      }
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
  if (selectedBiz?.isBookingDisabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-3 opacity-40" />
        <p className="text-sm font-semibold">Payment management features have been disabled for this business.</p>
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
          {selectedBiz && (
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Business: <strong>{selectedBiz.name}</strong></span>
              <span className="text-slate-350 dark:text-slate-650 hidden sm:inline">|</span>
              <span>Subcategory: <strong>{selectedBiz.category ? selectedBiz.category.split(">")[1]?.trim() || selectedBiz.category : "-"}</strong></span>
            </p>
          )}
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subcategory</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Details</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {paginatedTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {txn.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-405 font-semibold">
                        {txn.timestamp}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-900 dark:text-white font-extrabold">
                        {selectedBiz?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-405 font-semibold">
                        {selectedBiz?.category ? selectedBiz.category.split(">")[1]?.trim() || selectedBiz.category : "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-900 dark:text-white font-extrabold">
                        {txn.customerName}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-550 dark:text-slate-400 font-semibold max-w-[200px] truncate" title={txn.details.replace(/^Product Order:\s*/i, "")}>
                        {txn.details.replace(/^Product Order:\s*/i, "")}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-550 dark:text-slate-400 font-black uppercase">
                        {txn.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-900 dark:text-white font-serif font-black">
                        ₹{txn.amount}
                      </td>
                      <td className="px-4 py-3 text-xs">
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
                      <td className="px-4 py-3 text-right">
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

            {/* Pagination Controls */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-850 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>
                Showing {filteredTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer flex items-center justify-center"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
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
