import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Send,
  CheckCircle,
  Mail,
  User,
  BookOpen,
  Phone,
  MapPin,
  ExternalLink,
  Loader2,
  HelpCircle,
  Tag,
} from "lucide-react";
import { API_BASE_URL } from "../config";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

interface HelpContactData {
  email: string;
  phone: string;
  address: string;
}

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<HelpContactData>({
    email: "",
    phone: "",
    address: "",
  });
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Support Form State
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    // Load FAQs from backend
    fetch(`${API_BASE_URL}/help/faqs`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setFaqs(data.data);
          if (data.data.length > 0) {
            setOpenFaq(data.data[0]._id);
          }
        }
      })
      .catch(() => { })
      .finally(() => setLoadingFaqs(false));

    // Load contact info from backend
    fetch(`${API_BASE_URL}/help/contact`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setContactInfo({
            email: data.data.email || "",
            phone: data.data.phone || "",
            address: data.data.address || "",
          });
        }
      })
      .catch(() => { });
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_BASE_URL}/help/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ticketName,
          email: ticketEmail,
          subject: ticketSubject,
          message: ticketMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        setSubmittedTicketId(data.data?.id || "");
        setTicketName("");
        setTicketEmail("");
        setTicketSubject("");
        setTicketMessage("");
        setTimeout(() => {
          setIsSubmitted(false);
          setSubmittedTicketId("");
        }, 6000);
      } else {
        setSubmitError(data.message || "Failed to submit ticket. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    contactInfo.address || "",
  )}`;

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* ── Top Contact Items (3-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 py-1">
        {/* Email */}
        <div className="flex items-center gap-3.5 group">
          <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Official Email Helpdesk
            </span>
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block mt-0.5"
              title={contactInfo.email}
            >
              {contactInfo.email}
            </a>
          </div>
        </div>

        {/* Call Center */}
        <div className="flex items-center gap-3.5 group">
          <Phone className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Call Center Hotline
            </span>
            <a
              href={`tel:${contactInfo.phone}`}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 block mt-0.5"
            >
              {contactInfo.phone}
            </a>
          </div>
        </div>

        {/* Office Address */}
        <div className="flex items-center gap-3.5 group">
          <MapPin className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Support & Office Address
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mt-0.5">
              {contactInfo.address}
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* ── Main Two Column Layout for Desktop ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ── LEFT COLUMN: Support Ticket Form ────────── */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-indigo-500" />
                Support Ticket Case
              </h3>
            </div>

            {/* Success Feedback Alert */}
            {isSubmitted && (
              <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">
                    Ticket Case Submitted Successfully!
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {submittedTicketId ? (
                      <>
                        Your Reference ID:{" "}
                        <span className="font-mono font-black text-emerald-900 dark:text-white">
                          {submittedTicketId}
                        </span>
                        .{" "}
                      </>
                    ) : null}
                    We have received your case and our team will get back to you shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Error Feedback Alert */}
            {submitError && (
              <div className="mt-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3.5 rounded-2xl text-xs font-bold">
                {submitError}
              </div>
            )}

            {/* Ticket Form */}
            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    placeholder="Enter full name..."
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-semibold"
                  />
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-semibold"
                  />
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Issue Subject */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Issue Subject <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Booking dispute, refund status, profile query..."
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-semibold"
                  />
                  <Tag className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Detailed Message <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={5}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details about your query, booking ID, or request..."
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-medium leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-indigo-500/25 flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Case...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Support Case</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Interactive FAQs & Knowledge Base ─────── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header */}
          <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
              FAQs
            </h3>
          </div>

          {/* Accordion List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[560px] overflow-y-auto no-scrollbar pr-0.5">
            {loadingFaqs ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <Loader2 className="h-7 w-7 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">Loading FAQs...</span>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                  No FAQ items available.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Submit a support ticket on the left if you have any questions.
                </p>
              </div>
            ) : (
              faqs.map((faq) => {
                const isOpen = openFaq === faq._id;

                return (
                  <div
                    key={faq._id}
                    className="py-1 transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : faq._id)}
                      className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer outline-none border-none group"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-3 min-w-0">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                          }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-3.5 pr-2 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal animate-in fade-in duration-200">
                        <p className="whitespace-pre-line">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



