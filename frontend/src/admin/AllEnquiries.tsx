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
const getMockEnquiriesForBiz = (bizId: string, bizName: string, category: string): EnquiryRecord[] => {
  const currentYear = new Date().getFullYear();
  const names = [
    "Aarav Sharma", "Isha Patel", "Kabir Mehta", "Riya Sen", "Dev Dixit",
    "Aditya Rao", "Ananya Verma", "Rohan Das", "Sneha Kapoor", "Rahul Joshi"
  ];
  const mobiles = ["9876543210", "9123456789", "9988776655", "9456781230", "9871234560", "9345678901", "9012345678", "9234567890", "9567890123", "9678901234"];
  const messages = [
    "I want to enquire about bulk orders and discount pricing.",
    "Is home delivery available for orders above ₹500 in this locality?",
    "Are you open on Sunday evenings? Need to visit with family.",
    "Can you share the menu or catalog details for service options?",
    "What is the average response time for booking confirmation?",
    "Do you have special festive offers running currently?",
    "Do you support online payment options like UPI and Card?",
    "I tried calling your support number but it was busy. Please call back."
  ];

  return Array.from({ length: 4 }, (_, i) => {
    const hoursAgo = i * 4 + 2;
    const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const strHours = String(date.getHours()).padStart(2, "0");
    const strMinutes = String(date.getMinutes()).padStart(2, "0");
    const timestamp = `${day}/${month}/${currentYear} ${strHours}:${strMinutes}`;

    return {
      id: `enq-mock-${bizId}-${i}`,
      timestamp,
      businessId: bizId,
      businessName: bizName,
      categoryName: category,
      name: names[i % names.length],
      mobile: mobiles[i % mobiles.length],
      email: `${names[i % names.length].toLowerCase().replace(" ", ".")}@example.com`,
      message: messages[i % messages.length]
    };
  });
};

export default function AllEnquiries() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBiz, setSelectedBiz] = useState("All");

  const loadAllEnquiries = () => {
    // 1. Gather all businesses
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
    } catch (e) {
      console.error("Failed to load custom businesses in enquiries panel", e);
    }

    // 2. Load enquiries for each business
    const list: EnquiryRecord[] = [];
    allBiz.forEach((biz) => {
      const enquiriesKey = `fmp_service_enquiries:${biz.id}`;
      const saved = localStorage.getItem(enquiriesKey);
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((enq: any) => {
              list.push({
                ...enq,
                businessId: biz.id,
                businessName: biz.name,
                categoryName: biz.category || "General"
              });
            });
          }
        } catch (e) {
          console.error("Failed to parse enquiries for " + biz.name, e);
        }
      } else {
        // Fallback to generating mock enquiries if empty
        const mocks = getMockEnquiriesForBiz(biz.id, biz.name, biz.category || "General");
        localStorage.setItem(enquiriesKey, JSON.stringify(mocks));
        mocks.forEach((m) => list.push(m));
      }
    });

    // Sort by timestamp (newest first)
    list.sort((a, b) => {
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
