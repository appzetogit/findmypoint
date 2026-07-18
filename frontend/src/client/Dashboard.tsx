import React from "react";
import { Building, MessageSquare, Star, Calendar, CheckCircle2, XCircle, ShoppingBag, IndianRupee } from "lucide-react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardProps {
  stats: {
    totalBookings: number;
    totalAccepted: number;
    totalCancelled: number;
    totalEnquiries: number;
    totalProducts: number;
    totalReviews: number;
    avgRating: number;
    totalRevenue: number;
    trajectory?: Array<{ name: string; Orders: number; Enquiries: number }>;
  };
  isBookingDisabled?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3 shadow-xl text-xs font-semibold text-left">
        <p className="font-bold text-slate-400 dark:text-slate-500 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.fill;
            let value = entry.value;
            const name = entry.name;
            if (name === "Gross revenue" || name === "Commission") {
              value = `₹${value}`;
            }
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-slate-500 dark:text-slate-400">{name}:</span>
                </span>
                <span className="font-black text-slate-900 dark:text-white">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ stats, isBookingDisabled }: DashboardProps) {
  const defaultTrajectory = [
    { name: "Jan", Orders: 0, Enquiries: 0 },
    { name: "Feb", Orders: 0, Enquiries: 0 },
    { name: "Mar", Orders: 0, Enquiries: 0 },
    { name: "Apr", Orders: 0, Enquiries: 0 },
    { name: "May", Orders: 0, Enquiries: 0 },
    { name: "Jun", Orders: 0, Enquiries: 0 },
    { name: "Jul", Orders: 0, Enquiries: 0 },
    { name: "Aug", Orders: 0, Enquiries: 0 },
    { name: "Sept", Orders: 0, Enquiries: 0 },
    { name: "Oct", Orders: 0, Enquiries: 0 },
    { name: "Nov", Orders: 0, Enquiries: 0 },
    { name: "Dec", Orders: 0, Enquiries: 0 }
  ];
  const trajectory = stats.trajectory || defaultTrajectory;

  const orderMixData = [
    { name: "Delivered", value: stats.totalAccepted, color: "#0ea5e9" }, // sky-500
    { name: "Cancelled", value: stats.totalCancelled, color: "#ef4444" }  // red-500
  ];
  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Booking</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalBookings}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Accepted</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalAccepted}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Cancelled</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalCancelled}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <XCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">₹{stats.totalRevenue}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Enquiries</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalEnquiries}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Product</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalProducts}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Reviews Received</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalReviews}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Building className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Rating</span>
            <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{stats.avgRating}</span>
              <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
            </h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Star className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trajectory Card */}
        <div className={`${isBookingDisabled ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between`}>
          <div className="text-left mb-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
              Order & enquiry trajectory
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Monthly order and enquiry volume
            </p>
          </div>
          
          <div className="h-64 w-full text-xs mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
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
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 25]} ticks={[0, 5, 10, 15, 20, 25]} />
                <Tooltip content={<CustomTooltip />} />
                {!isBookingDisabled && (
                  <Area
                    type="monotone"
                    dataKey="Orders"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    dot={{ stroke: '#ef4444', strokeWidth: 2, fill: '#fff', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="Enquiries"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnquiries)"
                  dot={{ stroke: '#10b981', strokeWidth: 2, fill: '#fff', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-6 text-xs font-semibold">
            {!isBookingDisabled && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-red-500 rounded-full relative flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white border border-red-500 rounded-full" />
                </span>
                <span className="text-slate-655 dark:text-slate-400 font-semibold">Orders</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-emerald-500 rounded-full relative flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white border border-emerald-500 rounded-full" />
              </span>
              <span className="text-slate-655 dark:text-slate-400 font-semibold">Enquiries</span>
            </div>
          </div>
        </div>

        {/* Order Mix Card */}
        {!isBookingDisabled && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  Order mix
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Distribution by state
                </p>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                {stats.totalBookings} orders
              </span>
            </div>

            {/* Donut Chart with absolute center label */}
            <div className="h-52 w-full mt-4 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stats.totalBookings}</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Orders</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm" />
                <span>Delivered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
                <span>Cancelled</span>
              </div>
            </div>

            {/* Detailed Pill Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 text-xs">
                <span className="flex items-center gap-2 text-slate-650 dark:text-slate-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Total Orders</span>
                </span>
                <span className="font-black text-slate-900 dark:text-white">{stats.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 text-xs">
                <span className="flex items-center gap-2 text-slate-650 dark:text-slate-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Cancelled</span>
                </span>
                <span className="font-black text-slate-900 dark:text-white">{stats.totalCancelled}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
