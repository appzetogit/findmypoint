import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Send,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  IndianRupee,
  CreditCard,
  MessageSquare,
  Loader2,
  RefreshCw,
  Eye,
  X,
  Building,
  Smartphone
} from "lucide-react";

interface WithdrawalRecord {
  id: string;
  timestamp: string;
  amount: number;
  method: "upi" | "bank";
  target: string;
  status: "Completed" | "Processing" | "Failed";
  bizName?: string;
  bankDetails?: {
    holderName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  upiId?: string;
}

// Legacy records saved before structured bank fields were tracked only have a
// combined "target" string, e.g. "Axis Bank - A/C 9874563210 (DFDD2200), Ajay Panchal".
// Parse it so the details modal can still render labeled rows for those.
function parseLegacyBankTarget(target: string) {
  const match = target.match(/^(.*?)\s-\sA\/C\s(.*?)\s\((.*?)\),\s(.*)$/);
  if (!match) return null;
  const [, bankName, accountNumber, ifsc, holderName] = match;
  return { bankName, accountNumber, ifsc, holderName };
}

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState<WithdrawalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Approval simulation state
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);
  const [simulationSteps, setSimulationSteps] = useState<string[]>([]);
  const [showSimModal, setShowSimModal] = useState(false);

  // Payout details modal state
  const [detailsRequest, setDetailsRequest] = useState<WithdrawalRecord | null>(null);

  const loadRequests = () => {
    try {
      const saved = localStorage.getItem("fmp_client_withdrawals");
      const parsed: WithdrawalRecord[] = saved ? JSON.parse(saved) : [];
      // Purge legacy seeded demo rows ("wth-1"/"wth-2") left in old browser storage
      const cleaned = parsed.filter((r) => r.id !== "wth-1" && r.id !== "wth-2");
      if (cleaned.length !== parsed.length) {
        localStorage.setItem("fmp_client_withdrawals", JSON.stringify(cleaned));
      }
      setRequests(cleaned);
    } catch (e) {}
  };

  useEffect(() => {
    loadRequests();
    const handleStorage = () => loadRequests();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Stats summaries
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "Processing");
    const pendingCount = pending.length;
    const pendingSum = pending.reduce((sum, r) => sum + r.amount, 0);

    const completed = requests.filter((r) => r.status === "Completed");
    const completedSum = completed.reduce((sum, r) => sum + r.amount, 0);

    return {
      pendingCount,
      pendingSum,
      completedSum
    };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.bizName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.target.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === "All" || r.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, selectedStatus]);

  const handleAction = (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    setProcessingAction(action);
    setSimulationSteps([]);
    setShowSimModal(true);

    const targetRecord = requests.find(r => r.id === id);
    const payoutTarget = targetRecord ? targetRecord.target : "Account";

    const steps = action === "approve"
      ? [
          "Verifying withdrawal request details...",
          `Routing funds transfer to bank channel: ${payoutTarget}...`,
          "Validating beneficiary IMPS details...",
          "Authorizing admin corporate account transfer...",
          "Transfer completed successfully! Funds disbursed."
        ]
      : [
          "Verifying withdrawal request details...",
          "Generating rejection reason payload...",
          "Cancelling IMPS transfer buffer node...",
          "Request rejected — amount refunded to client wallet."
        ];

    let currentStep = 0;
    const runSimulation = () => {
      if (currentStep < steps.length) {
        setSimulationSteps(prev => [...prev, steps[currentStep]]);
        currentStep++;
        setTimeout(runSimulation, 800);
      } else {
        // Apply status update
        const finalStatus = action === "approve" ? "Completed" : "Failed";
        const updated = requests.map((r) => {
          if (r.id === id) {
            return { ...r, status: finalStatus };
          }
          return r;
        });

        setRequests(updated as any);
        localStorage.setItem("fmp_client_withdrawals", JSON.stringify(updated));
        
        // Trigger storage event so client pages know
        window.dispatchEvent(new Event("storage"));
        
        setProcessingId(null);
        setProcessingAction(null);
      }
    };

    setTimeout(runSimulation, 400);
  };

  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="h-6 w-6 text-indigo-500" />
            Client Withdrawal Requests
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review and disburse payout balance requests submitted by client businesses.
          </p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Pending Requests</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.pendingCount}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Total Requested Pending</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.pendingSum.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Total Payouts Disbursed</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white text-emerald-500 flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.completedSum.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main requests card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, business name, payout details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-center">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350 pr-2"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Pending / Processing</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed / Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-505">{row.timestamp}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {row.bizName || "Client Business"}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                      ₹{row.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 uppercase font-bold text-slate-500">{row.method}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setDetailsRequest(row)}
                        title="View payout details"
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {row.status === "Processing" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                      {row.status === "Completed" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                      {row.status === "Failed" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.status === "Processing" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(row.id, "approve")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(row.id, "reject")}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No withdrawal requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Action Simulation Modal */}
      {showSimModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-scale-in text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2.5">
              {processingId ? (
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              )}
              <h4 className="font-bold text-base">
                {processingId
                  ? (processingAction === "approve" ? "Processing Payout Disbursment..." : "Rejecting Request...")
                  : "Request Actions Settled!"}
              </h4>
            </div>

            {/* Simulated steps */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-[11px] font-mono space-y-2 h-40 overflow-y-auto no-scrollbar">
              {simulationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-650 dark:text-slate-350 text-left">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end text-xs font-bold pt-1.5">
              <button
                disabled={processingId !== null}
                onClick={() => setShowSimModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Payout Details Modal */}
      {detailsRequest && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setDetailsRequest(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl animate-scale-in text-slate-900 dark:text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <h4 className="font-bold text-base flex items-center gap-2">
                {detailsRequest.method === "bank" ? (
                  <Building className="h-4.5 w-4.5 text-indigo-500" />
                ) : (
                  <Smartphone className="h-4.5 w-4.5 text-indigo-500" />
                )}
                Payout Details
              </h4>
              <button
                onClick={() => setDetailsRequest(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Business</span>
                <span className="font-bold text-slate-900 dark:text-white">{detailsRequest.bizName || "Client Business"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Amount</span>
                <span className="font-black text-slate-900 dark:text-white">₹{detailsRequest.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Method</span>
                <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{detailsRequest.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Requested On</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{detailsRequest.timestamp}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] block">
                  {detailsRequest.method === "bank" ? "Bank Payout Target" : "UPI Payout Target"}
                </span>

                {(() => {
                  if (detailsRequest.method === "bank") {
                    const bankDetails = detailsRequest.bankDetails || parseLegacyBankTarget(detailsRequest.target);
                    if (bankDetails) {
                      return (
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">Account Holder</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{bankDetails.holderName}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">Bank Name</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{bankDetails.bankName}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">Account Number</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-right select-all">{bankDetails.accountNumber}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">IFSC Code</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-right select-all">{bankDetails.ifsc}</span>
                          </div>
                        </div>
                      );
                    }
                  } else {
                    const upiId = detailsRequest.upiId || detailsRequest.target;
                    if (upiId) {
                      return (
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">UPI ID</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-right select-all">{upiId}</span>
                          </div>
                        </div>
                      );
                    }
                  }
                  return (
                    <p className="font-mono text-slate-700 dark:text-slate-300 leading-relaxed break-words">{detailsRequest.target}</p>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50">
              <button
                onClick={() => setDetailsRequest(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
