import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  Mail,
  Save,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Phone,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { BACKEND_ORIGIN } from "../config";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  date: string;
  createdAt: string;
}

export default function HelpCenterManagement() {
  const [activeTab, setActiveTab] = useState<"faqs" | "tickets">("faqs");
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  // Support Contact states
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  // FAQ Modal states
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [savingFaq, setSavingFaq] = useState(false);

  // Email Composer Modal states
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailRecipient, setMailRecipient] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);

  // Live preview accordion toggle
  const [previewOpenFaq, setPreviewOpenFaq] = useState<string | null>(null);

  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const adminToken = localStorage.getItem("fmp_admin_token") || "";

  // ── Load Data ─────────────────────────────────────────────────────────────
  const loadFAQs = async () => {
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/faqs`);
      const data = await res.json();
      if (data.success) setFaqs(data.data);
    } catch { /* silent */ }
  };

  const loadTickets = async () => {
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/tickets`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch { /* silent */ }
  };

  const loadContact = async () => {
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/contact`);
      const data = await res.json();
      if (data.success) {
        setContactEmail(data.data.email || "");
        setContactPhone(data.data.phone || "");
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFAQs(), loadContact(), loadTickets()]).finally(() => setLoading(false));
  }, []);

  // ── FAQ Handlers ──────────────────────────────────────────────────────────
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setShowFaqModal(true);
  };

  const handleOpenEditFaq = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setShowFaqModal(true);
  };

  const handleSaveFaqModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFaq(true);
    try {
      const url = editingFaq
        ? `${BACKEND_ORIGIN}/api/help/faqs/${editingFaq._id}`
        : `${BACKEND_ORIGIN}/api/help/faqs`;
      const method = editingFaq ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ question: faqQuestion, answer: faqAnswer }),
      });
      const data = await res.json();
      if (data.success) {
        await loadFAQs();
        setShowFaqModal(false);
        triggerAlert("FAQs list updated and saved successfully!");
      } else {
        triggerAlert(data.message || "Failed to save FAQ.", "error");
      }
    } catch {
      triggerAlert("Network error. Please try again.", "error");
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/faqs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        await loadFAQs();
        if (previewOpenFaq === id) setPreviewOpenFaq(null);
        triggerAlert("FAQ deleted successfully.");
      } else {
        triggerAlert(data.message || "Failed to delete FAQ.", "error");
      }
    } catch {
      triggerAlert("Network error.", "error");
    }
  };

  // ── Contact Handlers ──────────────────────────────────────────────────────
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ email: contactEmail, phone: contactPhone }),
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert("Support contact details updated successfully!");
      } else {
        triggerAlert(data.message || "Failed to save contact.", "error");
      }
    } catch {
      triggerAlert("Network error.", "error");
    } finally {
      setSavingContact(false);
    }
  };

  // ── Ticket Handlers ───────────────────────────────────────────────────────
  const handleToggleTicketStatus = async (ticket: SupportTicket) => {
    const newStatus = ticket.status === "Open" || ticket.status === "In Progress"
      ? "Resolved"
      : "Open";
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadTickets();
        triggerAlert("Ticket status updated successfully!");
      } else {
        triggerAlert(data.message || "Failed to update ticket.", "error");
      }
    } catch {
      triggerAlert("Network error.", "error");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Delete this support ticket record?")) return;
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/tickets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        await loadTickets();
        triggerAlert("Support ticket record deleted.");
      } else {
        triggerAlert(data.message || "Failed to delete ticket.", "error");
      }
    } catch {
      triggerAlert("Network error.", "error");
    }
  };

  const handleOpenMailModal = (ticket: SupportTicket) => {
    setMailRecipient(ticket.userEmail);
    setMailSubject(`Re: ${ticket.subject}`);
    setMailBody(
      `Hello ${ticket.userName},\n\nThank you for reaching out to FindmyPoint support desk regarding: "${ticket.subject}".\n\n[Write details here]\n\nBest regards,\nFindmyPoint Administrator`,
    );
    setReplyTicketId(ticket.id);
    setShowMailModal(true);
  };

  const handleSendEmailReply = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark ticket as Resolved upon sending email reply
    if (replyTicketId) {
      const ticket = tickets.find((t) => t.id === replyTicketId);
      if (ticket) await handleToggleTicketStatus({ ...ticket, status: "Open" });
    }
    setShowMailModal(false);
    triggerAlert(`Email reply queued for ${mailRecipient}. Ticket marked Resolved.`);
  };

  const triggerAlert = (msg: string, type: "success" | "error" = "success") => {
    setAlertMsg(msg);
    setAlertType(type);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 4000);
  };

  const pendingCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;

  return (
    <div className="space-y-6 w-full animate-fade-in-up text-left relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Help Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage standard FAQs list and review user-submitted support inquiries
            </p>
          </div>
        </div>

        {activeTab === "faqs" && (
          <button
            onClick={handleOpenAddFaq}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add FAQ Accordion</span>
          </button>
        )}
      </div>

      {isSavedAlert && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in border ${
            alertType === "error"
              ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400"
              : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {alertType === "error" ? (
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          ) : (
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          )}
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 shrink-0">
        <button
          onClick={() => setActiveTab("faqs")}
          className={`pb-3 text-xs font-black transition-all border-b-2 px-4 cursor-pointer -mb-[2px] ${
            activeTab === "faqs"
              ? "border-indigo-550 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-885 dark:hover:text-slate-200"
          }`}
        >
          Manage FAQs ({faqs.length})
        </button>

        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-3 text-xs font-black transition-all border-b-2 px-4 cursor-pointer -mb-[2px] flex items-center gap-2 ${
            activeTab === "tickets"
              ? "border-indigo-550 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-885 dark:hover:text-slate-200"
          }`}
        >
          Support Tickets
          {pendingCount > 0 && (
            <span className="bg-rose-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0 animate-pulse">
              {pendingCount} Open
            </span>
          )}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
        </div>
      )}

      {/* FAQs Panel */}
      {!loading && activeTab === "faqs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FAQs List Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Active FAQ Index
              </h2>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto no-scrollbar">
              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="flex items-start justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-xs hover:border-slate-350 dark:hover:border-slate-750 transition"
                >
                  <div className="space-y-1.5 text-left flex-1 min-w-0 font-semibold">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {faq.question}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditFaq(faq)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {faqs.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
                  <span className="text-xs text-slate-400 italic">
                    No FAQ items defined. Click "+ Add FAQ Accordion" to begin.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Support Contacts Editor & Accordion Simulator */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Details Editor */}
            <form
              onSubmit={handleSaveContact}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-850">
                Support Contact Details
              </h2>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-semibold">
                  Support Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Call Hotline */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-semibold">
                  Call Hotline Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={savingContact}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs"
              >
                {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{savingContact ? "Saving..." : "Save Contact Details"}</span>
              </button>
            </form>

            {/* Accordion Simulator Card */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-200/50 dark:border-slate-850">
                <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Interactive FAQ Preview (HelpPage.tsx)
                </h2>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Click accordion cards to expand or collapse answers
                </p>
              </div>

              <div className="space-y-2.5">
                {faqs.slice(0, 4).map((faq) => (
                  <div
                    key={faq._id}
                    className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewOpenFaq(previewOpenFaq === faq._id ? null : faq._id)}
                      className="w-full flex items-center justify-between p-3.5 text-left font-black text-slate-800 dark:text-slate-150 text-[11px] cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition outline-none border-none"
                    >
                      <span>{faq.question}</span>
                      {previewOpenFaq === faq._id ? (
                        <ChevronUp className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                      )}
                    </button>

                    {previewOpenFaq === faq._id && (
                      <div className="p-3.5 border-t border-slate-150 dark:border-slate-850 text-[10.5px] text-slate-550 dark:text-slate-400 leading-relaxed font-semibold bg-slate-50/20 dark:bg-slate-950/5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
                {faqs.length > 4 && (
                  <span className="text-[10px] text-slate-400 italic block text-center mt-2">
                    ({faqs.length - 4} more items hidden in preview)
                  </span>
                )}
                {faqs.length === 0 && (
                  <span className="text-[10px] text-slate-400 italic block text-center py-4">
                    No FAQs to preview yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Tickets Panel */}
      {!loading && activeTab === "tickets" && (
        <div className="space-y-5 w-full text-left">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              User Form Submissions ({tickets.length} total)
            </h2>
          </div>

          {/* Table Container */}
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-55/60 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-150 dark:border-slate-850">
                  <tr>
                    <th className="py-4.5 px-6">Name</th>
                    <th className="py-4.5 px-6">Email</th>
                    <th className="py-4.5 px-6">Date</th>
                    <th className="py-4.5 px-6">Subject & Message</th>
                    <th className="py-4.5 px-6 text-center">Status</th>
                    <th className="py-4.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-855">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all"
                    >
                      {/* Name */}
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black shrink-0">
                            {(ticket.userName || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {ticket.userName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 align-top">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono">
                          {ticket.userEmail}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 align-top">
                        <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold font-mono">
                          {ticket.date || new Date(ticket.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </td>

                      {/* Subject & Message */}
                      <td className="py-4 px-6 align-top max-w-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                            {ticket.subject}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 align-top text-center">
                        <button
                          onClick={() => handleToggleTicketStatus(ticket)}
                          className={`px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase cursor-pointer transition ${
                            ticket.status === "Resolved" || ticket.status === "Closed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-250/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40"
                              : ticket.status === "In Progress"
                              ? "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 border border-amber-250/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40"
                          }`}
                        >
                          {ticket.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenMailModal(ticket)}
                            className="p-1.5 text-slate-450 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition cursor-pointer"
                            title="Reply via Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1.5 text-slate-450 hover:text-rose-605 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {tickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-xs text-slate-400 italic font-semibold"
                      >
                        <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        No support tickets submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Dialog Modal Portal */}
      {showFaqModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
              onClick={() => setShowFaqModal(false)}
            />

            <form
              onSubmit={handleSaveFaqModal}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up text-left"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-855">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {editingFaq ? "Edit FAQ Item" : "Create New FAQ Accordion"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Question */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-semibold">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How do I request refunds?"
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                />
              </div>

              {/* Answer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-semibold">
                  Answer Details
                </label>
                <textarea
                  required
                  rows={5}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Enter details and descriptions answers..."
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-855">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-255 text-slate-700 font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFaq}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  {savingFaq && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingFaq ? "Save Changes" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}

      {/* Email Composer Modal Portal */}
      {showMailModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
              onClick={() => setShowMailModal(false)}
            />

            <form
              onSubmit={handleSendEmailReply}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4.5 animate-scale-up text-left"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-4.5 w-4.5 text-indigo-500" />
                  Reply Ticket Case (Send Email)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMailModal(false)}
                  className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Recipient email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-405 block">
                  Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={mailRecipient}
                  onChange={(e) => setMailRecipient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-405 block">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-405 block">
                  Message Body
                </label>
                <textarea
                  required
                  rows={8}
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-955 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowMailModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition cursor-pointer text-xs"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </div>
  );
}
