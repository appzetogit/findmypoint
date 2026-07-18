import { useState, useEffect, useMemo } from "react";
import { Star, Tag, Building2, User, Layers, Megaphone, Compass, HelpCircle } from "lucide-react";
import { businessesData, BusinessListingData } from "../data/businessesData";
import { loadAdminUsers } from "../data/usersData";
import { loadTickets } from "../data/helpData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardProps {}

export default function Dashboard({}: DashboardProps) {
  const [listings, setListings] = useState<BusinessListingData[]>([]);

  const loadListings = () => {
    setListings([...businessesData]);
  };

  useEffect(() => {
    loadListings();
    const handleStorageChange = () => {
      loadListings();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const stats = useMemo(() => {
    // 1. Total Users
    let usersCount = 0;
    try {
      usersCount = loadAdminUsers().length;
    } catch (e) {
      console.error(e);
    }

    // 2. Total Category
    let customCats: any[] = [];
    try {
      const saved = localStorage.getItem("fmp_custom_categories");
      if (saved) customCats = JSON.parse(saved);
    } catch (e) {}

    const categoriesSet = new Set([
      ...listings.map((l) => l.category.split(" > ")[0] || l.category),
      ...customCats.map((c) => c.name)
    ]);
    const categoriesCount = categoriesSet.size;

    // 3. Total Subcategory
    let customSubs: any[] = [];
    try {
      const saved = localStorage.getItem("fmp_custom_subcategories");
      if (saved) customSubs = JSON.parse(saved);
    } catch (e) {}

    const subSet = new Set();
    listings.forEach((l) => {
      const parts = l.category.split(" > ");
      if (parts.length > 1) {
        subSet.add(parts[1]);
      }
    });
    customSubs.forEach((s) => subSet.add(s.name));
    const subcategoriesCount = subSet.size;

    // 4. Total Advertise Request
    let advertiseCount = 0;
    try {
      const advSaved = localStorage.getItem("fmp_advertise_requests:v1");
      if (advSaved) {
        const parsed = JSON.parse(advSaved);
        if (Array.isArray(parsed)) advertiseCount = parsed.length;
      }
    } catch (e) {}

    // 5. Total Tourist Places
    let touristPlacesCount = 0;
    try {
      const tourSaved = localStorage.getItem("fmp_custom_tourist_places");
      if (tourSaved) {
        const parsed = JSON.parse(tourSaved);
        if (Array.isArray(parsed)) touristPlacesCount = parsed.length;
      }
    } catch (e) {}

    // 6. Total Support Request
    let supportCount = 0;
    try {
      supportCount = loadTickets().length;
    } catch (e) {}

    return {
      usersCount,
      categoriesCount,
      subcategoriesCount,
      advertiseCount,
      touristPlacesCount,
      supportCount
    };
  }, [listings]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => {
      const mainCat = l.category.split(" > ")[0] || l.category;
      counts[mainCat] = (counts[mainCat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [listings]);


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
