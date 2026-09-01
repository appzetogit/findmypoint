import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Building,
  User,
  Phone,
  Mail,
  Clock,
  Filter,
  Download,
  Tag
} from "lucide-react";
import { businessesData } from "../data/businessesData";
import { API_BASE_URL } from "../config";

interface EnquiryRecord {
  id: string;
  timestamp: string;
  businessId: string;
  businessName: string;
  categoryName: string;
  name: string;
  mobile: string;
  email: string;
  message: string;
}

export default function AllEnquiries() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBiz, setSelectedBiz] = useState("All");

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("fmp_admin_token") || localStorage.getItem("fmp_business_token") || "";
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  const loadAllEnquiries = async () => {
    // 1. Gather all businesses
    let allBiz: any[] = [];
    try {
      const resBiz = await fetch(`${API_BASE_URL}/businesses`);
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

    // 2. Load enquiries for each business
    const list: EnquiryRecord[] = [];
    try {
      await Promise.all(allBiz.map(async (biz) => {
        try {
          const res = await fetch(`${API_BASE_URL}/businesses/${biz.id}/enquiries`, {
            headers: getAuthHeaders()
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            data.data.forEach((item: any) => {
              list.push({
                id: item._id,
                timestamp: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
                businessId: biz.id,
                businessName: biz.name,
                categoryName: biz.category || "General",
                name: item.name,
                mobile: item.phone,
                email: item.email || "N/A",
                message: item.message
              });
            });
          }
        } catch {}
      }));
    } catch (e) {
      console.error("Failed to parse enquiries", e);
    }

    // Sort by ID (newest first)
    list.sort((a, b) => b.id.localeCompare(a.id));

    setEnquiries(list);
  };

  useEffect(() => {
    loadAllEnquiries();
  }, []);

  // Filter unique businesses and categories for filter dropdowns
  const uniqueBusinesses = useMemo(() => {
    const map = new Map<string, string>();
    enquiries.forEach((enq) => {
      map.set(enq.businessId, enq.businessName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [enquiries]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    enquiries.forEach((enq) => {
      set.add(enq.categoryName);
    });
    return Array.from(set);
  }, [enquiries]);

  // Filter enquiries based on query & selectors
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchesSearch =
        enq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enq.mobile.includes(searchQuery) ||
        enq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enq.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enq.businessName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || enq.categoryName === selectedCategory;
      const matchesBiz = selectedBiz === "All" || enq.businessId === selectedBiz;

      return matchesSearch && matchesCategory && matchesBiz;
    });
  }, [enquiries, searchQuery, selectedCategory, selectedBiz]);

  const handleDownloadCSV = () => {
    const headers = "Date & Time,Business Name,Category,Customer Name,Mobile Number,Email ID,Message\n";
    const rows = filteredEnquiries
      .map(
        (enq) =>
          `"${enq.timestamp}","${enq.businessName}","${enq.categoryName}","${enq.name}","${enq.mobile}","${enq.email}","${enq.message.replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Enquiries_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm text-left">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            All Customer Enquiries
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global repository of business leads and customer enquiries across all listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            disabled={filteredEnquiries.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export CSV ({filteredEnquiries.length})
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, mobile, email or message..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Business Selector */}
        <div className="sm:col-span-3">
          <select
            value={selectedBiz}
            onChange={(e) => setSelectedBiz(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Businesses ({uniqueBusinesses.length})</option>
            {uniqueBusinesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="All">All Categories ({uniqueCategories.length})</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-800 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-slate-800/80 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Enquiry Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-semibold">
                    No enquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {enq.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          {enq.businessName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{enq.categoryName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {enq.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <a href={`tel:${enq.mobile}`} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                          <Phone className="h-3 w-3" />
                          {enq.mobile}
                        </a>
                        {enq.email !== "N/A" && (
                          <a href={`mailto:${enq.email}`} className="flex items-center gap-1 text-slate-500 hover:underline text-[10px]">
                            <Mail className="h-3 w-3" />
                            {enq.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300">
                      <p className="line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 rounded-lg p-2 text-[11px]">
                        {enq.message}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
