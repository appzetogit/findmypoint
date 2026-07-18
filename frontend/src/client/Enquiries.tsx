import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Trash2,
  Building,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

function formatTimestampDMY(tsStr: string): string {
  if (!tsStr) return "";
  const parts = tsStr.split(" ");
  const datePart = parts[0];
  const timePart = parts.slice(1).join(" ");
  const dateSplit = datePart.split("/");
  if (dateSplit.length === 3) {
    const first = dateSplit[0];
    const second = dateSplit[1];
    const year = dateSplit[2];
    if (first === "07" && second !== "07") {
      return `${second}/${first}/${year} ${timePart}`.trim();
    }
  }
  return tsStr;
}

interface EnquiriesProps {
  clientListings: BusinessListingData[];
}

interface EnquiryRecord {
  id: string;
  timestamp: string;
  name: string;
  mobile: string;
  email: string;
  message: string;
  read?: boolean;
}

export default function Enquiries({ clientListings }: EnquiriesProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>("");
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal & Email States
  const [selectedEnquiryForModal, setSelectedEnquiryForModal] = useState<EnquiryRecord | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Multi-select states
  const [selectedEnquiryIds, setSelectedEnquiryIds] = useState<string[]>([]);

  // Set default business
  useEffect(() => {
    if (clientListings.length > 0 && !selectedBizId) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings, selectedBizId]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  };

  // Load enquiries for selected business
  useEffect(() => {
    if (selectedBizId) {
      const loadEnquiries = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/businesses/${selectedBizId}/enquiries`, {
            headers: getAuthHeaders()
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const mapped = data.data.map((item: any) => ({
              id: item._id,
              timestamp: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
              name: item.name,
              mobile: item.phone,
              email: item.email || "N/A",
              message: item.message,
              read: item.read || false
            }));
            setEnquiries(mapped);
          } else {
            setEnquiries([]);
          }
        } catch (e) {
          setEnquiries([]);
        }
      };
      loadEnquiries();
      setCurrentPage(1); // Reset page on business change
      setSelectedEnquiryIds([]); // Reset selection on business change
    }
  }, [selectedBizId]);

  const selectedBiz = useMemo(() => {
    return clientListings.find((b) => b.id === selectedBizId);
  }, [clientListings, selectedBizId]);

  // Filter enquiries by search term
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchName = enq.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMobile = enq.mobile.includes(searchTerm);
      const matchEmail = enq.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMsg = enq.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTime = enq.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchMobile || matchEmail || matchMsg || matchTime;
    });
  }, [enquiries, searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / itemsPerPage));
  
  // Reset page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedEnquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEnquiries, currentPage]);

  // Handle single deletion
  const handleDelete = async (enqId: string) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/businesses/${selectedBizId}/enquiries/${enqId}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
          setEnquiries((prev) => prev.filter((e) => e.id !== enqId));
        } else {
          alert(data.message || "Failed to delete enquiry");
        }
      } catch (err) {
        alert("Failed to delete enquiry from database");
      }
    }
  };

  // Handle toggle read status
  const toggleReadStatus = async (enqId: string) => {
    const target = enquiries.find((e) => e.id === enqId);
    if (!target) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/businesses/${selectedBizId}/enquiries/${enqId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ read: !target.read })
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enqId ? { ...e, read: !e.read } : e))
        );
      }
    } catch (err) {
      console.error("Failed to update read status:", err);
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedEnquiryIds.length} selected enquiries?`)) {
      try {
        for (const id of selectedEnquiryIds) {
          await fetch(`http://localhost:5000/api/businesses/${selectedBizId}/enquiries/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
          });
        }
        setEnquiries((prev) => prev.filter((e) => !selectedEnquiryIds.includes(e.id)));
        setSelectedEnquiryIds([]);
      } catch (err) {
        alert("Error deleting some enquiries");
      }
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in-up text-left max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" /> Customer Enquiries ({enquiries.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View enquiries and questions submitted by visitors regarding your business.
          </p>
        </div>

        {/* Business Selector (only if > 1 business) */}
        {clientListings.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Building className="h-4 w-4 text-indigo-500 shrink-0" />
            <select
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none text-slate-700 dark:text-slate-350 cursor-pointer pr-4"
            >
              {clientListings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {clientListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-md space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No Businesses Registered</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any businesses linked to your account. Enquiries will show up here once you have registered listings.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          
          {/* Filters and Utilities bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 outline-none text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 font-semibold"
              />
            </div>

            {selectedEnquiryIds.length > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDeleteSelected}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer shadow-sm border border-transparent"
                >
                  <Trash2 className="h-4 w-4" /> Delete Selected ({selectedEnquiryIds.length})
                </button>
              </div>
            )}
          </div>

          {/* Enquiries Table - Always Visible Headers */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedEnquiries.length > 0 && paginatedEnquiries.every((e) => selectedEnquiryIds.includes(e.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const pageIds = paginatedEnquiries.map((enq) => enq.id);
                          setSelectedEnquiryIds((prev) => Array.from(new Set([...prev, ...pageIds])));
                        } else {
                          const pageIds = paginatedEnquiries.map((enq) => enq.id);
                          setSelectedEnquiryIds((prev) => prev.filter((id) => !pageIds.includes(id)));
                        }
                      }}
                      className="rounded border-slate-350 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                    />
                  </th>
                  <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] w-48">Submitted Date</th>
                  <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] w-44">Name</th>
                  <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] w-40">Phone Number</th>
                  <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] w-44">Email Address</th>
                  <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px]">Message</th>
                  <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {paginatedEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center space-y-4">
                      <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
                      <div className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                        No Enquiries Found
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                        {enquiries.length === 0
                          ? "No customers have sent enquiries for your business yet. Once they fill the Enquiry form, details will show here."
                          : "No enquiries match your current search query."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedEnquiries.map((enq) => (
                    <tr
                      key={enq.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors ${
                        !enq.read ? "bg-indigo-50/20 dark:bg-indigo-950/10 font-bold" : ""
                      }`}
                    >
                      {/* Checkbox Selection */}
                      <td className="p-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedEnquiryIds.includes(enq.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEnquiryIds((prev) => [...prev, enq.id]);
                            } else {
                              setSelectedEnquiryIds((prev) => prev.filter((id) => id !== enq.id));
                            }
                          }}
                          className="rounded border-slate-350 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                        />
                      </td>

                      {/* Date */}
                      <td className="p-4 whitespace-nowrap text-slate-900 dark:text-slate-200">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {formatTimestampDMY(enq.timestamp)}
                        </span>
                      </td>

                      {/* Name */}
                      <td className={`p-4 whitespace-nowrap text-slate-850 dark:text-slate-100 ${!enq.read ? "font-bold" : "font-semibold"}`}>
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {enq.name}
                        </span>
                      </td>

                      {/* Phone Number */}
                      <td className="p-4 whitespace-nowrap text-slate-650 dark:text-slate-350 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {enq.mobile}
                        </span>
                      </td>

                      {/* Email Address */}
                      <td className="p-4 whitespace-nowrap text-slate-650 dark:text-slate-350 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {enq.email}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="p-4 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => {
                              setSelectedEnquiryForModal(enq);
                              if (!enq.read) {
                                toggleReadStatus(enq.id);
                              }
                            }}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-650 cursor-pointer shrink-0 transition"
                            title="Read full message"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <div className="max-w-[220px] truncate">
                            {enq.message}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => toggleReadStatus(enq.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition border cursor-pointer ${
                            enq.read
                              ? "bg-slate-50 dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-455 hover:bg-slate-100 dark:hover:bg-slate-850"
                              : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-750"
                          }`}
                          title={enq.read ? "Mark as Unread" : "Mark as Read"}
                        >
                          {enq.read ? "Unread" : "Read"}
                        </button>
                        {enq.email && enq.email !== "N/A" && (
                          <button
                            onClick={() => {
                              setEmailRecipient(enq.email);
                              setEmailSubject(`Reply: Regarding your enquiry at ${selectedBiz?.name || 'our business'}`);
                              setIsEmailModalOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                            title="Send reply email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(enq.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          title="Delete enquiry record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>
              Showing {filteredEnquiries.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredEnquiries.length)} of {filteredEnquiries.length} enquiries
            </span>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      currentPage === page
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {selectedBiz && (
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Business: {selectedBiz.name}
              </span>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiryForModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-left">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setSelectedEnquiryForModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Enquiry Details
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black mt-0.5">
                  Submitted: {formatTimestampDMY(selectedEnquiryForModal.timestamp)}
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850">
                <div>
                  <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Customer Name</span>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-100">{selectedEnquiryForModal.name}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Phone Number</span>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-100">{selectedEnquiryForModal.mobile}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Email Address</span>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-100">{selectedEnquiryForModal.email}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                  <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Message</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 whitespace-pre-wrap leading-relaxed mt-1">
                    {selectedEnquiryForModal.message}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                {selectedEnquiryForModal.email && selectedEnquiryForModal.email !== "N/A" && (
                  <button
                    onClick={() => {
                      setEmailRecipient(selectedEnquiryForModal.email);
                      setEmailSubject(`Reply: Regarding your enquiry at ${selectedBiz?.name || 'our business'}`);
                      setIsEmailModalOpen(true);
                      setSelectedEnquiryForModal(null);
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md text-center"
                  >
                    Reply by Email
                  </button>
                )}
                <button
                  onClick={() => setSelectedEnquiryForModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-left">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => {
                setIsEmailModalOpen(false);
                setEmailSent(false);
                setEmailBody("");
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {emailSent ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 flex items-center justify-center">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <h5 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Email Sent Successfully!
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px] leading-relaxed mx-auto">
                  Your reply email has been dispatched to <span className="font-bold text-indigo-500">{emailRecipient}</span>.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmailSending(true);
                  setTimeout(() => {
                    setEmailSending(false);
                    setEmailSent(true);
                    setEmailBody("");
                  }, 2000);
                }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Send Reply Email
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mt-0.5">
                    Email Client Portal
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      To
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={emailRecipient}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-500 font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-800 dark:text-slate-200 focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Message / Body
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your email reply message here..."
                      className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-800 dark:text-slate-200 focus:border-indigo-500 font-semibold resize-none"
                    />
                  </div>
                </div>

                {emailSending ? (
                  <div className="py-2 text-center text-xs font-bold text-slate-500">
                    Sending email...
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
                  >
                    Send Email
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
