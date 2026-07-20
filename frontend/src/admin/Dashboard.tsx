import { useState, useEffect } from "react";
import { Tag, User, Layers, Megaphone, Compass, HelpCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL } from "../config";

interface DashboardProps {}

interface DashboardStats {
  usersCount: number;
  categoriesCount: number;
  subcategoriesCount: number;
  advertiseCount: number;
  touristPlacesCount: number;
  supportCount: number;
}

export default function Dashboard({}: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    usersCount: 0,
    categoriesCount: 0,
    subcategoriesCount: 0,
    advertiseCount: 0,
    touristPlacesCount: 0,
    supportCount: 0
  });
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);

  const loadDashboardData = async () => {
    const token = localStorage.getItem("fmp_admin_token") || "";
    const authHeaders: HeadersInit = { Authorization: `Bearer ${token}` };

    // 1. Total Users (registered end users)
    let usersCount = 0;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) usersCount = data.users.length;
    } catch (e) {
      console.error("Failed to load users count", e);
    }

    // 2 & 3. Total Category / Total Subcategory
    let categoriesCount = 0;
    let subcategoriesCount = 0;
    let categoryCounts: Record<string, number> = {};
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        categoriesCount = data.categories.length;
        subcategoriesCount = data.categories.reduce(
          (sum: number, cat: any) => sum + (Array.isArray(cat.subcategories) ? cat.subcategories.length : 0),
          0
        );
        data.categories.forEach((cat: any) => {
          categoryCounts[cat.label] = 0;
        });
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }

    // Business listings — used to weight the category share chart with real usage
    try {
      const res = await fetch(`${API_BASE_URL}/businesses`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((biz: any) => {
          const mainCat = (biz.category || "General").split(" > ")[0];
          categoryCounts[mainCat] = (categoryCounts[mainCat] || 0) + 1;
        });
      }
    } catch (e) {
      console.error("Failed to load businesses for category chart", e);
    }

    // 4. Total Advertise Requests
    let advertiseCount = 0;
    try {
      const res = await fetch(`${API_BASE_URL}/advertise-requests`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) advertiseCount = data.requests.length;
    } catch (e) {
      console.error("Failed to load advertise requests", e);
    }

    // 5. Total Tourist Places
    let touristPlacesCount = 0;
    try {
      const res = await fetch(`${API_BASE_URL}/tourist-places`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) touristPlacesCount = data.data.length;
    } catch (e) {
      console.error("Failed to load tourist places", e);
    }

    // 6. Total Support Requests
    let supportCount = 0;
    try {
      const res = await fetch(`${API_BASE_URL}/help/tickets`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) supportCount = data.data.length;
    } catch (e) {
      console.error("Failed to load support tickets", e);
    }

    setStats({
      usersCount,
      categoriesCount,
      subcategoriesCount,
      advertiseCount,
      touristPlacesCount,
      supportCount
    });
    setCategoryData(
      Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    );
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  return (
    <div className="space-y-6 w-full animate-fade-in-up">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your Justdial & Dhanda AI database listings in real-time.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <User className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Total Users
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.usersCount}
            </span>
          </div>
        </div>

        {/* Total Category */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Tag className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Total Category
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.categoriesCount}
            </span>
          </div>
        </div>

        {/* Total Subcategory */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-650 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Total Subcategory
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.subcategoriesCount}
            </span>
          </div>
        </div>

        {/* Total Advertise Request */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Megaphone className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Total Advertise
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.advertiseCount}
            </span>
          </div>
        </div>

        {/* Total Tourist Places */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-450 flex items-center justify-center shrink-0">
            <Compass className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Tourist Places
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.touristPlacesCount}
            </span>
          </div>
        </div>

        {/* Total Support Request */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-violet-550/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <HelpCircle className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Support Requests
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.supportCount}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Share Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <div className="mb-4 text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Directory Category Share
            </h3>
            <p className="text-[10px] text-slate-400">
              Proportion of business listings by category
            </p>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData.slice(0, 5)}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800/50"
                />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Listings Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Statistics */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <div className="mb-4 text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Leads & Views Traffic
            </h3>
            <p className="text-[10px] text-slate-400">
              Visual activity logs of views and user actions
            </p>
          </div>
          <div className="h-60 w-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-600">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No Traffic Data Available</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Analytics will appear here once tracking is set up.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
