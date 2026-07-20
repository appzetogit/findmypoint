import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  TrendingUp,
  User,
  Clock,
  Trophy,
  Star,
  ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { businessesData } from "../data/businessesData";

interface ActivityItem {
  type: "booking" | "enquiry";
  id: string;
  timestamp: string;
  bizName: string;
  customerName: string;
  desc: string;
}

interface LeaderboardItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  bookingsCount: number;
  enquiriesCount: number;
  totalActivity: number;
}

export default function AllClientDashboard() {
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [totalAccepted, setTotalAccepted] = useState(0);
  const [totalCancelled, setTotalCancelled] = useState(0);
  
  const [bookingsChartData, setBookingsChartData] = useState<any[]>([]);
  const [enquiriesChartData, setEnquiriesChartData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_business_token") || "";
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  const loadDashboardData = async () => {
    // 1. Gather all businesses
    let allBiz: any[] = [];
    try {
      const resBiz = await fetch("http://localhost:5000/api/businesses");
      const dataBiz = await resBiz.json();
      if (dataBiz.success && Array.isArray(dataBiz.data)) {
        allBiz = dataBiz.data;
      }
    } catch {}

    if (allBiz.length === 0) {
      allBiz = [...businessesData];
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
    }

    // 2. Loop and count
    let allBookingsList: any[] = [];
    try {
      const resBook = await fetch("http://localhost:5000/api/bookings", {
        headers: getAuthHeaders()
      });
      const dataBook = await resBook.json();
      if (dataBook.success && Array.isArray(dataBook.data)) {
        allBookingsList = dataBook.data.map((b: any) => ({
          id: b.id,
          timestamp: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(b.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
          bizName: b.businessName,
          bizId: b.businessId,
          customerName: b.customerName || "Guest",
          status: b.status || "pending",
          desc: "Created a new booking slot"
        }));
      }
    } catch (e) {
      console.error("Failed to load bookings in dashboard", e);
    }

    // 3. Fetch enquiries from backend
    let allEnquiriesList: any[] = [];
    try {
      await Promise.all(allBiz.map(async (biz) => {
        try {
          const resEnq = await fetch(`http://localhost:5000/api/businesses/${biz.id}/enquiries`, {
            headers: getAuthHeaders()
          });
          const dataEnq = await resEnq.json();
          if (dataEnq.success && Array.isArray(dataEnq.data)) {
            dataEnq.data.forEach((item: any) => {
              allEnquiriesList.push({
                id: item._id,
                timestamp: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
                bizName: biz.name,
                bizId: biz.id,
                customerName: item.name || "Guest",
                desc: `Enquired: "${item.message.substring(0, 40)}${item.message.length > 40 ? "..." : ""}"`
              });
            });
          }
        } catch {}
      }));
    } catch (e) {
      console.error("Failed to load enquiries in dashboard", e);
    }

    const bizStatsMap = new Map<string, { bookings: number; enquiries: number }>();
    allBiz.forEach((biz) => {
      bizStatsMap.set(biz.id, { bookings: 0, enquiries: 0 });
    });

    allBookingsList.forEach((b) => {
      const stats = bizStatsMap.get(b.bizId) || { bookings: 0, enquiries: 0 };
      bizStatsMap.set(b.bizId, { ...stats, bookings: stats.bookings + 1 });
    });

    allEnquiriesList.forEach((e) => {
      const stats = bizStatsMap.get(e.bizId) || { bookings: 0, enquiries: 0 };
      bizStatsMap.set(e.bizId, { ...stats, enquiries: stats.enquiries + 1 });
    });

    let finalBookingsCount = allBookingsList.length;
    let finalEnquiriesCount = allEnquiriesList.length;

    let accepted = 0;
    let cancelled = 0;
    allBookingsList.forEach((bk) => {
      if (bk.status === 'cancelled') {
        cancelled++;
      } else if (bk.status === 'confirmed' || bk.status === 'completed') {
        accepted++;
      }
    });

    setTotalBookings(finalBookingsCount);
    setTotalEnquiries(finalEnquiriesCount);
    setTotalAccepted(accepted);
    setTotalCancelled(cancelled);

    // 4. Generate Leaderboard
    const leaderboardItems: LeaderboardItem[] = allBiz.map((biz) => {
      const counts = bizStatsMap.get(biz.id) || { bookings: 0, enquiries: 0 };
      let bCount = counts.bookings;
      let eCount = counts.enquiries;

      return {
        id: biz.id,
        name: biz.name,
        category: biz.category || "General",
        rating: biz.rating || 4.5,
        bookingsCount: bCount,
        enquiriesCount: eCount,
        totalActivity: bCount + eCount
      };
    });

    leaderboardItems.sort((a, b) => b.totalActivity - a.totalActivity);
    setLeaderboard(leaderboardItems.slice(0, 5));

    // 5. Generate Recharts Data dynamically from dates
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const monthCountsB = Array(7).fill(0);
    const monthCountsE = Array(7).fill(0);

    allBookingsList.forEach((bk) => {
      if (bk.timestamp) {
        const parts = bk.timestamp.split("/");
        if (parts.length >= 2) {
          const monthIdx = parseInt(parts[1], 10) - 1;
          if (monthIdx >= 0 && monthIdx < 7) {
            monthCountsB[monthIdx]++;
          }
        }
      }
    });

    allEnquiriesList.forEach((enq) => {
      if (enq.timestamp) {
        const parts = enq.timestamp.split("/");
        if (parts.length >= 2) {
          const monthIdx = parseInt(parts[1], 10) - 1;
          if (monthIdx >= 0 && monthIdx < 7) {
            monthCountsE[monthIdx]++;
          }
        }
      }
    });

    const bChart = months.map((m, idx) => ({ name: m, Bookings: monthCountsB[idx] }));
    const eChart = months.map((m, idx) => ({ name: m, Enquiries: monthCountsE[idx] }));
    setBookingsChartData(bChart);
    setEnquiriesChartData(eChart);

    // 6. Recent Activity merging
    const mergedActivity: ActivityItem[] = [];
    allBookingsList.forEach((b) => {
      mergedActivity.push({
        type: "booking",
        id: b.id,
        timestamp: b.timestamp,
        bizName: b.bizName,
        customerName: b.customerName,
        desc: b.desc
      });
    });
    allEnquiriesList.forEach((e) => {
      mergedActivity.push({
        type: "enquiry",
        id: e.id,
        timestamp: e.timestamp,
        bizName: e.bizName,
        customerName: e.customerName,
        desc: e.desc
      });
    });

    if (mergedActivity.length === 0) {
      setRecentActivities([]);
    } else {
      mergedActivity.sort((a, b) => b.id.localeCompare(a.id));
      setRecentActivities(mergedActivity.slice(0, 5));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header section */}
      <div>
        <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          All Client Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Aggregated analytics, trajectories, top leaderboard, and feeds across all listings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{totalBookings}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Enquiries</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{totalEnquiries}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Accepted</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white text-emerald-500">{totalAccepted}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Cancelled</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white text-red-500">{totalCancelled}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <XCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Trajectories (Recharts separate charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Bookings Trajectory</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Monthly bookings request timeline</p>
          </div>
          <div className="h-56 w-full text-xs mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingsChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdminBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/50" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="Bookings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAdminBookings)"
                  dot={{ stroke: '#6366f1', strokeWidth: 2, fill: '#fff', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enquiries Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Enquiries Trajectory</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Monthly consumer enquiries volume</p>
          </div>
          <div className="h-56 w-full text-xs mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enquiriesChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdminEnquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/50" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="Enquiries"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAdminEnquiries)"
                  dot={{ stroke: '#10b981', strokeWidth: 2, fill: '#fff', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Leaderboard (Top Businesses) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Top Listings Leaderboard</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Most active businesses this month</p>
            </div>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {leaderboard.map((biz, idx) => (
              <div key={biz.id} className="flex items-center gap-3">
                {/* Ranking circle */}
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                  idx === 0 ? "bg-amber-500 text-white" :
                  idx === 1 ? "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-white" :
                  idx === 2 ? "bg-amber-600/30 text-amber-800 dark:text-amber-400" :
                  "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {idx + 1}
                </div>
                {/* Biz Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{biz.name}</span>
                    <span className="text-[10px] font-black text-slate-400 shrink-0">{biz.totalActivity} Actions</span>
                  </div>
                  {/* Progress bar representing weight */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? "bg-indigo-500" :
                        idx === 1 ? "bg-purple-500" :
                        idx === 2 ? "bg-sky-500" :
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${(biz.totalActivity / leaderboard[0].totalActivity) * 100}%` }}
                    />
                  </div>
                  {/* Stats inline */}
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] font-semibold text-slate-400">
                    <span>{biz.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-500"><Star className="h-2.5 w-2.5 fill-amber-500" />{biz.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Activity</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-550 dark:text-slate-400">
              Live Feed
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 rounded-xl transition-colors px-2 -mx-2">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  act.type === "booking" ? "bg-indigo-500/10 text-indigo-500" : "bg-sky-500/10 text-sky-500"
                }`}>
                  {act.type === "booking" ? <Calendar className="h-4.5 w-4.5" /> : <MessageSquare className="h-4.5 w-4.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {act.customerName}
                    </h5>
                    <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 whitespace-nowrap">
                      <Clock className="h-2.5 w-2.5" /> {act.timestamp.split(" ")[1]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {act.desc}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase text-indigo-500 mt-2 tracking-wider">
                    <span>{act.bizName}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
