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

// Mock enquiries generator matching client structure
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

    // 2. Load enquiries for each business
    const list: EnquiryRecord[] = [];
    try {
      await Promise.all(allBiz.map(async (biz) => {
        try {
          const res = await fetch(`http://localhost:5000/api/businesses/${biz.id}/enquiries`, {
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
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_all_enquiries_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-500" />
            All Enquiries Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View customer enquiries received by all business listings.
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer transition-all shrink-0 self-start sm:self-center"
        >
          <Download className="h-4 w-4" /> Export to CSV
        </button>
      </div>

      {/* Summary Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between shadow-sm max-w-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Enquiries Received</span>
          <h4 className="text-3xl font-black text-slate-900 dark:text-white">{filteredEnquiries.length}</h4>
        </div>
        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
          <MessageSquare className="h-6 w-6" />
        </div>
      </div>

      {/* Main Table card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Filters Panel */}
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, message, business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Business filter */}
            <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedBiz}
                onChange={(e) => setSelectedBiz(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350 pr-2"
              >
                <option value="All">All Businesses</option>
                {uniqueBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
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
        </div>

        {/* Enquiries Table */}
        <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300">
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{enq.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{enq.businessName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-wider">
                        {enq.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{enq.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{enq.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-450">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{enq.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[280px]" title={enq.message}>
                      {enq.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No enquiries found matching the selected filters.
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
