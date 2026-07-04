import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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

// Mock payments generator to align with dashboard metrics if localStorage is empty
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

export default function Wallet({ clientListings }: WalletProps) {
  // Payout calculation lists
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");

  // Transfer simulation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferSteps, setTransferSteps] = useState<string[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load payments and withdrawals
  const loadWalletData = () => {
    // 1. Load active payments across client businesses
    const allPayments: any[] = [];
    
    // Fetch configured commissions from localStorage
    let commissionMap: Record<string, number> = {};
    try {
      const savedCommissions = localStorage.getItem("fmp_business_commissions");
      if (savedCommissions) commissionMap = JSON.parse(savedCommissions);
    } catch (e) {}

    clientListings.forEach((biz) => {
      const paymentsKey = `fmp_service_payments:${biz.id}`;
      const saved = localStorage.getItem(paymentsKey);
      let bizPayments = [];

      if (saved) {
        try {
          bizPayments = JSON.parse(saved);
        } catch (e) {}
      } else {
        // Fallback: Populate mock payments if empty
        const mocks = getMockPaymentsForBiz(biz.id);
        localStorage.setItem(paymentsKey, JSON.stringify(mocks));
        bizPayments = mocks;
      }

      // Add commission rate configuration per business
      const commRate = commissionMap[biz.id] !== undefined ? commissionMap[biz.id] : 10; // defaults to 10%

      bizPayments.forEach((pay: any) => {
        allPayments.push({
          ...pay,
          bizId: biz.id,
          bizName: biz.name,
          commissionRate: commRate
        });
      });
    });

    setPaymentsList(allPayments);

    // 2. Load withdrawal requests from localStorage
    try {
      const savedWithdrawals = localStorage.getItem("fmp_client_withdrawals");
      if (savedWithdrawals) {
        setWithdrawals(JSON.parse(savedWithdrawals));
      } else {
        // Mock default successful withdrawals
        const mocks: WithdrawalRecord[] = [
          {
            id: `wth-${Date.now() - 86400000 * 3}`,
            timestamp: "28/06/2026 12:10",
            amount: 1500,
            method: "upi",
            target: "client@upi",
            status: "Completed"
          }
        ];
        setWithdrawals(mocks);
        localStorage.setItem("fmp_client_withdrawals", JSON.stringify(mocks));
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
  }, [ledgerTransactions, searchQuery, filterType]);

  const handleWithdrawFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid transfer amount.");
      return;
    }
    if (amount > stats.withdrawable) {
      alert("Insufficient withdrawable balance.");
      return;
    }
    if (amount < 100) {
      alert("Minimum withdrawal limit is ₹100.");
      return;
    }

    const targetAccount =
      payoutMethod === "upi"
        ? upiId
        : `${bankName} (A/C: ...${accountNumber.slice(-4)})`;

    if (payoutMethod === "upi" && !upiId.trim()) {
      alert("Please enter your UPI ID.");
      return;
    }
    if (payoutMethod === "bank" && (!bankName || !accountNumber || !ifscCode)) {
      alert("Please fill in all bank account details.");
      return;
    }

    // Start IMPS transfer simulation
    setShowTransferModal(true);
    setIsProcessing(true);
    setTransferSteps([]);

    const steps = [
      "Verifying payouts balance...",
      "Validating payout channel nodes...",
      "Submitting request to Admin Panel...",
      "Queued withdrawal request successfully!"
    ];

    let currentStep = 0;
    const runSimulation = () => {
      if (currentStep < steps.length) {
        setTransferSteps((prev) => [...prev, steps[currentStep]]);
        currentStep++;
        setTimeout(runSimulation, 900);
      } else {
        // Queue transfer
        setIsProcessing(false);

        const newWithdrawal: WithdrawalRecord = {
          id: `wth-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-IN", { hour12: false }).replace(",", ""),
          amount,
          method: payoutMethod,
          target: targetAccount,
          status: "Processing",
          bizName: clientListings[0]?.name || "Client Business"
        };

        const updatedWithdrawals = [newWithdrawal, ...withdrawals];
        setWithdrawals(updatedWithdrawals);
        localStorage.setItem("fmp_client_withdrawals", JSON.stringify(updatedWithdrawals));

        // Reset form
        setWithdrawAmount("");
        setUpiId("");
        setBankName("");
        setAccountNumber("");
        setIfscCode("");

        // Show Toast
        setToastMessage("Withdrawal requested! Pending system admin approval.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    };

    setTimeout(runSimulation, 500);
  };

  return (
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Total Net Earnings</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalNetEarnings.toLocaleString("en-IN")}
            </h4>
            <span className="text-[9px] font-semibold text-slate-400 block">Commissions deducted</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <ArrowUpRight className="h-6 w-6" />
          </div>
        </div>

        {/* Withdrawable Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm ring-2 ring-indigo-500/15">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Withdrawable Balance</span>
            <h4 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.withdrawable.toLocaleString("en-IN")}
            </h4>
            <span className="text-[9px] font-semibold text-slate-400 block">Available for instant transfer</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <WalletIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Total Withdrawn</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalWithdrawn.toLocaleString("en-IN")}
            </h4>
            <span className="text-[9px] font-semibold text-slate-400 block">Payout completed transactions</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ArrowDownLeft className="h-6 w-6" />
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Payout Request Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-5">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <Send className="h-4 w-4 text-indigo-500" />
            Request Payout Transfer
          </h4>

          <form onSubmit={handleWithdrawFunds} className="space-y-4">
            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Withdrawal Amount (INR)</label>
              <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2.5 rounded-xl">
                <span className="text-slate-400 text-sm font-black pr-1.5">₹</span>
                <input
                  type="number"
                  placeholder="Min ₹100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-transparent text-xs font-black focus:outline-none w-full text-slate-900 dark:text-white"
                  min="100"
                  max={stats.withdrawable}
                  required
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(stats.withdrawable.toString())}
                  className="text-[9px] font-black text-indigo-500 uppercase hover:underline ml-2"
                >
                  All
                </button>
              </div>
            </div>

            {/* Payout channels */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Transfer Channel</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("upi")}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase border transition cursor-pointer ${
                    payoutMethod === "upi"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500"
                  }`}
                >
                  UPI Payout
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod("bank")}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase border transition cursor-pointer ${
                    payoutMethod === "bank"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500"
                  }`}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            {/* UPI Details fields */}
            {payoutMethod === "upi" ? (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">UPI ID Address</label>
                <input
                  type="text"
                  placeholder="e.g. client@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required={payoutMethod === "upi"}
                />
              </div>
            ) : (
              // Bank Details fields
              <div className="space-y-3.5 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required={payoutMethod === "bank"}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 50100234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required={payoutMethod === "bank"}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-wider">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000060"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required={payoutMethod === "bank"}
                  />
                </div>
              </div>
            )}

            {/* Payout Trigger Button */}
            <button
              type="submit"
              disabled={stats.withdrawable < 100}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4.5 w-4.5" />
              <span>Withdraw to {payoutMethod === "upi" ? "UPI Account" : "Bank Payout"}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Ledger Transaction History (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
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
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
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
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500 font-semibold animate-fade-in">
                      No ledger transactions found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payout Transfer Simulation Modal */}
      {showTransferModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-scale-in text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2.5">
              {isProcessing ? (
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              )}
              <h4 className="font-bold text-base">
                {isProcessing ? "IMPS Transfer Processing..." : "Payout Completed Successfully!"}
              </h4>
            </div>

            {/* Payout steps list */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-[11px] font-mono space-y-2 h-40 overflow-y-auto no-scrollbar">
              {transferSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-650 dark:text-slate-350 text-left">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end text-xs font-bold pt-1.5">
              <button
                disabled={isProcessing}
                onClick={() => setShowTransferModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
