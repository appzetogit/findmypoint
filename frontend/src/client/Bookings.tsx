import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Search,
  Trash2,
  Building,
  Clock,
  User,
  Phone,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

interface BookingsProps {
  clientListings: BusinessListingData[];
}

interface Submission {
  id: string;
  timestamp: string;
  data: Record<string, any>;
}

export default function Bookings({ clientListings }: BookingsProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Set default business
  useEffect(() => {
    if (clientListings.length > 0 && !selectedBizId) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings, selectedBizId]);

  // Load configuration & submissions for selected business
  useEffect(() => {
    if (selectedBizId) {
      // Load form config to get column headers
      const formSaved = localStorage.getItem(`fmp_service_form:${selectedBizId}`);
      if (formSaved) {
        try {
          const parsed = JSON.parse(formSaved);
          setFormFields(parsed.fields || []);
        } catch (e) {
          setFormFields([]);
        }
      } else {
        setFormFields([]); // Fallback to default fields
      }

      // Load submissions
      const subSaved = localStorage.getItem(`fmp_service_submissions:${selectedBizId}`);
      if (subSaved) {
        try {
          setSubmissions(JSON.parse(subSaved));
        } catch (e) {
          setSubmissions([]);
        }
      } else {
        setSubmissions([]);
      }
    }
  }, [selectedBizId]);

  const selectedBiz = useMemo(() => {
    return clientListings.find((b) => b.id === selectedBizId);
  }, [clientListings, selectedBizId]);

  // Column headers for the table
  const columns = useMemo(() => {
    if (formFields.length > 0) {
      return formFields.map((f) => f.label);
    }
    // Fallback default columns
    return ["Full Name", "Phone Number", "Date", "Guests/Room/Age", "Time/Check-out/Slot"];
  }, [formFields]);

  // Filter submissions by search term
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const allValuesString = Object.values(sub.data)
        .map((val) => {
          if (Array.isArray(val)) return val.join(" ");
          return String(val);
        })
        .join(" ")
        .toLowerCase();
      return allValuesString.includes(searchTerm.toLowerCase()) || sub.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [submissions, searchTerm]);

  // Handle single deletion
  const handleDelete = (subId: string) => {
    if (window.confirm("Are you sure you want to delete this booking record?")) {
      const updated = submissions.filter((s) => s.id !== subId);
      setSubmissions(updated);
      localStorage.setItem(`fmp_service_submissions:${selectedBizId}`, JSON.stringify(updated));
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all bookings for this business? This cannot be undone.")) {
      setSubmissions([]);
      localStorage.setItem(`fmp_service_submissions:${selectedBizId}`, JSON.stringify([]));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-left max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" /> Bookings Dashboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View and manage custom bookings received from customers.
          </p>
        </div>
      </div>
      {clientListings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-md space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No Businesses Registered</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any businesses linked to your account. Bookings will show up here once you have registered listings.
          </p>
        </div>
      ) : clientListings.find((b) => b.id === selectedBizId)?.isBookingDisabled ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-md space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto opacity-70" />
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Bookings Disabled</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Booking features have been disabled for this business by the administrator.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          
          {/* Filters and Utilities bar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 outline-none text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-500 font-semibold"
              />
            </div>

            {submissions.length > 0 && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleClearAll}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 hover:bg-rose-600 dark:border-rose-950 dark:hover:bg-rose-950/50 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Clear All Data
                </button>
              </div>
            )}
          </div>

          {/* Bookings Table / List */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <FileSpreadsheet className="h-12 w-12 text-slate-350 dark:text-slate-650 mx-auto" />
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No Bookings Found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {submissions.length === 0
                    ? "No customers have booked services using your form yet. Once they fill it, details will populate here."
                    : "No bookings match your current search query."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850">
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px]">Booking Date</th>
                    {columns.map((col) => (
                      <th key={col} className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] min-w-[120px]">
                        {col}
                      </th>
                    ))}
                    <th className="p-4 font-black uppercase tracking-wider text-slate-400 text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors"
                    >
                      {/* Submission Timestamp */}
                      <td className="p-4 whitespace-nowrap text-slate-900 dark:text-slate-200 font-semibold flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {sub.timestamp}
                      </td>

                      {/* Dynamic columns */}
                      {columns.map((col) => {
                        const val = sub.data[col];
                        let renderedVal = "";
                        if (Array.isArray(val)) {
                          renderedVal = val.join(", ");
                        } else if (typeof val === "boolean") {
                          renderedVal = val ? "Checked" : "Unchecked";
                        } else if (val && typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
                          const [y, m, d] = val.split("-");
                          renderedVal = `${d}/${m}/${y}`;
                        } else {
                          renderedVal = val !== undefined && val !== null ? String(val) : "-";
                        }

                        return (
                          <td key={col} className="p-4 text-slate-650 dark:text-slate-350 max-w-[200px] truncate font-medium">
                            {renderedVal}
                          </td>
                        );
                      })}

                      {/* Action buttons */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          title="Delete booking record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Statistics */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 flex items-center justify-between text-[11px] text-slate-500">
            <span>Showing {filteredSubmissions.length} of {submissions.length} bookings</span>
            {selectedBiz && (
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Category: {selectedBiz.category}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
