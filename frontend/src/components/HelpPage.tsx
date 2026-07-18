import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  CheckCircle,
  Mail,
  User,
  BookOpen,
  Phone,
  Loader2,
} from "lucide-react";
import { BACKEND_ORIGIN } from "../config";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

interface HelpContactData {
  email: string;
  phone: string;
}

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<HelpContactData>({ email: "", phone: "" });
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Support Form State
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    // Load FAQs from backend
    fetch(`${BACKEND_ORIGIN}/api/help/faqs`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setFaqs(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingFaqs(false));

    // Load contact info from backend
    fetch(`${BACKEND_ORIGIN}/api/help/contact`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setContactInfo({ email: data.data.email, phone: data.data.phone });
      })
      .catch(() => {});
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/help/tickets`, {
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
        setTicketName("");
        setTicketEmail("");
        setTicketSubject("");
        setTicketMessage("");
        setTimeout(() => setIsSubmitted(false), 4500);
      } else {
        setSubmitError(data.message || "Failed to submit. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase()),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left max-w-6xl mx-auto py-2 items-start">
      {/* Left Column: Support Form */}
      <div className="lg:col-span-5 bg-transparent lg:bg-white lg:dark:bg-slate-900 lg:border lg:border-slate-200/60 lg:dark:border-slate-800/60 lg:rounded-3xl p-0 lg:p-6 lg:shadow-sm space-y-4">
        <div>
          <h3 className="font-serif text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-indigo-500" />
            Support Ticket Form
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            Have queries or encountered an issue? Submit a ticket and our agents will respond back
            shortly.
          </p>

          <div className="flex flex-col gap-2 pt-2 pb-3.5 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>
                Email:{" "}
                {contactInfo.email ? (
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {contactInfo.email}
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>
                Call Center:{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {contactInfo.phone || "—"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {isSubmitted && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            <span>Support ticket submitted! Our team will reach out soon.</span>
          </div>
        )}

        {submitError && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 p-3.5 rounded-xl text-xs font-bold">
            {submitError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Your Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={ticketName}
                onChange={(e) => setTicketName(e.target.value)}
                placeholder="Enter name..."
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                placeholder="Enter email..."
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Issue Subject
            </label>
            <input
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Booking dispute, refund issue..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Message Details
            </label>
            <textarea
              required
              rows={4}
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Describe what occurred or write details..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isSubmitting ? "Submitting..." : "Submit Ticket Case"}</span>
          </button>
        </form>
      </div>

      {/* Right Column: FAQ Search & Accordion */}
      <div className="lg:col-span-7 bg-transparent lg:bg-white lg:dark:bg-slate-900 lg:border lg:border-slate-200/60 lg:dark:border-slate-800/60 lg:rounded-3xl p-0 lg:p-6 lg:shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
          <div>
            <h3 className="font-serif text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
              Frequently Asked Questions
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Explore standard answers or search specific queries.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-slate-200 focus:border-indigo-500 font-semibold transition w-48"
            />
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-3 max-h-[460px] overflow-y-auto no-scrollbar">
          {loadingFaqs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-xs text-slate-400 italic font-semibold">
                {faqSearch ? `No matching questions found for "${faqSearch}".` : "No FAQs added yet."}
              </span>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div
                key={faq._id}
                className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50/40 dark:bg-slate-950/10 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 transition text-left cursor-pointer outline-none border-none"
                >
                  <span className="text-xs font-black text-slate-850 dark:text-slate-100 pr-4">
                    {faq.question}
                  </span>
                  {openFaq === faq._id ? (
                    <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {openFaq === faq._id && (
                  <div className="p-4 border-t border-slate-150 dark:border-slate-850 text-[11.5px] text-slate-650 dark:text-slate-400 leading-relaxed font-semibold bg-white dark:bg-slate-900/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
