import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Search,
  Building,
  CheckCircle,
  HelpCircle,
  IndianRupee,
  Percent,
  Save,
  Tag,
  Briefcase
} from "lucide-react";
import { businessesData } from "../data/businessesData";

interface BusinessCommissionRow {
  id: string;
  name: string;
  category: string;
  salesVolume: number;
  commissionRate: number; // e.g. 10 for 10%
  commissionEarned: number;
}

// Simulated mock payments generator to compute sales volume if empty
const getMockPaymentsSumForBiz = (bizId: string): number => {
  const saved = localStorage.getItem(`fmp_service_payments:${bizId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((tx: any) => tx.status === "Completed")
          .reduce((sum: number, tx: any) => sum + tx.amount, 0);
      }
    } catch (e) {}
  }
  // If no payments, return default mock sales volume based on ID hash for premium feel
  const hash = bizId.charCodeAt(0) + bizId.charCodeAt(bizId.length - 1);
  return (hash % 10 + 2) * 999;
};

export default function BusinessCommission() {
  const [rows, setRows] = useState<BusinessCommissionRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const loadCommissionsData = () => {
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

    // Load disabled booking status list from localStorage
    let disabledBookingMap: Record<string, boolean> = {};
    try {
      const savedDisabled = localStorage.getItem("fmp_booking_disabled_statuses");
      if (savedDisabled) {
        disabledBookingMap = JSON.parse(savedDisabled);
      }
    } catch (e) {}

    // Filter to only businesses where booking option is ENABLED
    const activeBookingListings = allBiz.filter((biz) => {
      const isLocallyDisabled = biz.isBookingDisabled;
      const overrideStatus = disabledBookingMap[biz.id];
      const finalDisabled = overrideStatus !== undefined ? overrideStatus : isLocallyDisabled;
      return !finalDisabled;
    });

    // 2. Load custom commission configurations
    let commissionsConfig: Record<string, number> = {};
    try {
      const savedConfig = localStorage.getItem("fmp_business_commissions");
      if (savedConfig) {
        commissionsConfig = JSON.parse(savedConfig);
      }
    } catch (e) {}

    // 3. Compile rows
    const compiledRows: BusinessCommissionRow[] = activeBookingListings.map((biz) => {
      const salesVolume = getMockPaymentsSumForBiz(biz.id);
      const commissionRate = commissionsConfig[biz.id] !== undefined ? commissionsConfig[biz.id] : 10; // default to 10%
      const commissionEarned = parseFloat(((salesVolume * commissionRate) / 100).toFixed(2));

      return {
        id: biz.id,
        name: biz.name,
        category: biz.category || "General",
        salesVolume,
        commissionRate,
        commissionEarned
      };
    });

    setRows(compiledRows);
  };

  useEffect(() => {
    loadCommissionsData();
  }, []);

  // Filter categories list
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [rows]);

  // Statistics summaries
  const stats = useMemo(() => {
    const activeCount = rows.length;
    const totalSales = rows.reduce((sum, r) => sum + r.salesVolume, 0);
    const totalCommission = rows.reduce((sum, r) => sum + r.commissionEarned, 0);
    const avgRate = activeCount > 0
      ? parseFloat((rows.reduce((sum, r) => sum + r.commissionRate, 0) / activeCount).toFixed(1))
      : 0;

    return {
      activeCount,
      totalSales,
      totalCommission,
      avgRate
    };
  }, [rows]);

  // Filtered rows matching query & select
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || r.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [rows, searchQuery, selectedCategory]);

  const handleRateChange = (id: string, newRate: number) => {
    // bound rate between 0 and 100
    const val = Math.max(0, Math.min(100, isNaN(newRate) ? 0 : newRate));
    setRows(prev =>
      prev.map((r) => {
        if (r.id === id) {
          const earned = parseFloat(((r.salesVolume * val) / 100).toFixed(2));
          return { ...r, commissionRate: val, commissionEarned: earned };
        }
        return r;
      })
    );
  };

  const handleSaveCommission = (id: string, rate: number) => {
    try {
      const savedConfig = localStorage.getItem("fmp_business_commissions");
      const config = savedConfig ? JSON.parse(savedConfig) : {};
      config[id] = rate;
      localStorage.setItem("fmp_business_commissions", JSON.stringify(config));

      // Trigger temporary success toast alert
      setSavedMessage("Commission updated successfully!");
      setTimeout(() => setSavedMessage(null), 3000);
      
      // Reload calculations
      loadCommissionsData();
    } catch (e) {
      console.error("Failed to save commission rate", e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="h-6 w-6 text-indigo-500" />
            Business Commission Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure commission percentages and calculate revenues for active booking listing businesses.
          </p>
        </div>
      </div>

      {/* KPI stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">Active Booking listings</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeCount}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Building className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">Total Sales Volume</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalSales.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">Total Admin Commission</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              <IndianRupee className="h-6 w-6" /> {stats.totalCommission.toLocaleString("en-IN")}
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-550/10 flex items-center justify-center text-indigo-600">
            <Percent className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Saved message Toast Alert */}
      {savedMessage && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-2xl text-xs font-bold animate-fade-in">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main filter + list card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Filters panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by business name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category selection */}
          <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-center">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350 pr-2"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table of active bookings commissions */}
        <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Booking Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Sales Volume</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-40">Commission Rate (%)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Commission Earned</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="px-6 py-4">{row.category}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      ₹{row.salesVolume.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-2.5 py-1 rounded-xl w-24">
                        <input
                          type="number"
                          value={row.commissionRate}
                          onChange={(e) => handleRateChange(row.id, parseInt(e.target.value))}
                          className="bg-transparent text-xs font-black focus:outline-none w-full text-slate-900 dark:text-white text-right"
                          min="0"
                          max="100"
                        />
                        <span className="text-slate-400 font-bold">%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">
                      ₹{row.commissionEarned.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleSaveCommission(row.id, row.commissionRate)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-900/30 transition cursor-pointer inline-flex items-center justify-center"
                        title="Save Commission Rate"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No active booking businesses found matching the criteria.
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
