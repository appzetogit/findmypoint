import React from "react";
import { Building, MessageSquare, Star } from "lucide-react";

interface DashboardProps {
  stats: {
    totalListings: number;
    totalReviews: number;
    avgRating: number;
  };
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Listings</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalListings}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Building className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Reviews Received</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalReviews}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Rating</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{stats.avgRating}</span>
              <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Star className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
