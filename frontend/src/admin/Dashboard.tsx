import { useState, useEffect, useMemo } from "react";
import { Star, Tag, Building2 } from "lucide-react";
import { businessesData, BusinessListingData } from "../data/businessesData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
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
    const total = listings.length;

    let customCount = 0;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fmp_custom_businesses");
        if (saved) {
          const parsed = JSON.parse(saved);
          customCount = Array.isArray(parsed) ? parsed.length : 0;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const categoriesSet = new Set(listings.map((l) => l.category.split(" > ")[0] || l.category));
    const categoriesCount = categoriesSet.size;

    const avgRating =
      total > 0
        ? parseFloat((listings.reduce((sum, l) => sum + l.rating, 0) / total).toFixed(2))
        : 0;

    return { total, customCount, categoriesCount, avgRating };
  }, [listings]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => {
      const mainCat = l.category.split(" > ")[0] || l.category;
      counts[mainCat] = (counts[mainCat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [listings]);

  const trafficData = [
    { day: "Mon", Views: 240, Leads: 120 },
    { day: "Tue", Views: 320, Leads: 160 },
    { day: "Wed", Views: 450, Leads: 220 },
    { day: "Thu", Views: 390, Leads: 180 },
    { day: "Fri", Views: 480, Leads: 260 },
    { day: "Sat", Views: 620, Leads: 340 },
    { day: "Sun", Views: 550, Leads: 300 },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Building2 className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Total Listings
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.total}
            </span>
          </div>
        </div>

        {/* Custom Listings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
            <Tag className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Admin Added
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.customCount}
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-650 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Tag className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Categories
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.categoriesCount}
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0">
            <Star className="h-5.5 w-5.5 fill-rose-600 dark:fill-rose-450 stroke-none" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Average Rating
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1 block">
              {stats.avgRating} <span className="text-xs text-slate-400">/ 5.0</span>
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
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800/50"
                />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} />
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
                <Legend iconType="circle" iconSize={6} wrapperStyle={{ paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="Views"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  name="Traffic Views"
                />
                <Area
                  type="monotone"
                  dataKey="Leads"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  name="Generated Leads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
