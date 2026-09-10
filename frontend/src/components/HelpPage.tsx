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
  Copy,
  Check,
  CreditCard,
  Building2,
  Landmark,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Download,
} from "lucide-react";
import { API_BASE_URL, RAZORPAY_KEY_ID } from "../config";
import bankQrImg from "../assets/bank_qr.png";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

interface HelpContactData {
  email: string;
  phone: string;
  address: string;
  headOfficeAddress?: string;
  branchOfficeAddress?: string;
}

const GooglePayIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.49 12.275c0-.85-.075-1.67-.215-2.455H12v4.64h6.445c-.28 1.48-1.12 2.73-2.38 3.57v2.965h3.855c2.255-2.075 3.57-5.13 3.57-8.72z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.955-1.075 7.94-2.91l-3.855-2.965c-1.075.72-2.45 1.145-4.085 1.145-3.13 0-5.78-2.115-6.73-4.96H1.28v3.06C3.29 21.28 7.35 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.27 14.31a7.17 7.17 0 0 1 0-4.62V6.63H1.28a11.966 11.966 0 0 0 0 10.74l3.99-3.06z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.77c1.765 0 3.35.61 4.595 1.805l3.445-3.445C17.95 1.19 15.235 0 12 0 7.35 0 3.29 2.72 1.28 6.63l3.99 3.06c.95-2.845 3.6-4.96 6.73-4.96z"
      fill="#EA4335"
    />
  </svg>
);

const PhonePeIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#5F259F" />
    <path
      d="M14.2 6.5H9.2a.8.8 0 0 0-.8.8v10a.8.8 0 0 0 .8.8h1.4a.8.8 0 0 0 .8-.8v-3.3h2.8c2.4 0 4.2-1.7 4.2-3.8 0-2-1.8-3.7-4.2-3.7zm-.1 4.8h-2.7V8.9h2.7c1.1 0 1.8.6 1.8 1.2s-.7 1.2-1.8 1.2z"
      fill="#FFFFFF"
    />
    <path
      d="M10.2 14.8L15.3 6.8"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const PaytmIcon = ({ className = "h-3 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 54 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 2h5c3 0 5.2 1.6 5.2 4.2s-2.2 4.2-5.2 4.2H4.2v6H1.5V2zm4.7 6.1c1.6 0 2.6-.8 2.6-1.9s-1-1.9-2.6-1.9H4.2v3.8h2z"
      fill="#002970"
      className="dark:fill-slate-100"
    />
    <path
      d="M17.8 6.3h2.4v10.1h-2.4v-1.4c-.8 1-2 1.7-3.4 1.7-2.8 0-4.6-2.1-4.6-5s1.8-5 4.6-5c1.4 0 2.6.7 3.4 1.7V6.3zm-3 8.3c1.6 0 2.8-1.2 2.8-2.9s-1.2-2.9-2.8-2.9-2.8 1.2-2.8 2.9 1.2 2.9 2.8 2.9z"
      fill="#002970"
      className="dark:fill-slate-100"
    />
    <path
      d="M22.1 6.3l2.9 7.2 2.8-7.2h2.6l-4.3 10.2c-1.1 2.4-2.2 3.1-4.3 3.1h-1.1v-2.1h.8c1.2 0 1.8-.4 2.4-1.7l.4-.9-4.1-8.6h2.8z"
      fill="#002970"
      className="dark:fill-slate-100"
    />
    <path
      d="M34 4.2v2.9h2.9v2.1H34v5.5c0 .8.4 1.2 1.2 1.2h1.7v2.1h-2.4c-2.1 0-3-1-3-2.9V9.2h-2V7.1h2V4.2H34z"
      fill="#00BAF2"
    />
    <path
      d="M39.5 6.3h2.4v1.4c.8-1 2-1.7 3.3-1.7 1.4 0 2.6.7 3.1 1.8.9-1.2 2.1-1.8 3.5-1.8 2.4 0 3.8 1.6 3.8 4.2v6.5h-2.4v-5.8c0-1.3-.7-2.1-1.8-2.1-1.1 0-2 .8-2 2.1v5.8H47v-5.8c0-1.3-.7-2.1-1.8-2.1-1.1 0-2 .8-2 2.1v5.8h-2.4V6.3z"
      fill="#00BAF2"
    />
  </svg>
);

const BhimUpiIcon = ({ className = "h-3.5 w-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 1.5h5l-4.5 15H1.5L6 1.5z" fill="#097939" />
    <path d="M13.5 1.5h5L14 16.5H9l4.5-15z" fill="#ED7523" />
  </svg>
);

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  // Copy State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Razorpay Pay State
  const [payAmount, setPayAmount] = useState<string>("500");
  const [payerName, setPayerName] = useState<string>("");
  const [payerEmail, setPayerEmail] = useState<string>("");
  const [payerPhone, setPayerPhone] = useState<string>("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentId: string;
    amount: number;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string>("");

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  const headAddressText =
    contactInfo.headOfficeAddress || contactInfo.address || "G-161, Sector 22 Noida, Uttar Pradesh 201301 India";
  const branchAddressText =
    contactInfo.branchOfficeAddress || "Baripada, Mayurbhanj, Odisha, India";
  const headOfficeMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(headAddressText)}`;
  const branchOfficeMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchAddressText)}`;

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
            email: data.data.email || "findmypoint.india@gmail.com",
            phone: data.data.phone || "+91 8339977383",
            address: data.data.headOfficeAddress || data.data.address || "",
            headOfficeAddress: data.data.headOfficeAddress || data.data.address || "",
            branchOfficeAddress: data.data.branchOfficeAddress || "",
          });
        }
      })
      .catch(() => { });

    // Try prefilling user info from localStorage if available
    try {
      const storedUser = localStorage.getItem("fmp_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) {
          setTicketName(parsed.name);
          setPayerName(parsed.name);
        }
        if (parsed.email) {
          setTicketEmail(parsed.email);
          setPayerEmail(parsed.email);
        }
        if (parsed.mobile1) {
          setPayerPhone(parsed.mobile1);
        }
      }
    } catch { }
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

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

  // Razorpay Payment Handler
  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(payAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setPaymentError("Please enter a valid amount greater than ₹0");
      return;
    }

    if (!payerName.trim()) {
      setPaymentError("Please enter your name");
      return;
    }

    if (!payerEmail.trim() || !payerEmail.includes("@")) {
      setPaymentError("Please enter a valid email address");
      return;
    }

    setIsPaying(true);
    setPaymentError("");
    setPaymentSuccessData(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPaymentError("Razorpay SDK failed to load. Please check your internet connection.");
      setIsPaying(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount }),
      });
      const orderData = await res.json();
      if (!orderData.success || !orderData.data) {
        setPaymentError("Failed to initiate Razorpay order. Please try again.");
        setIsPaying(false);
        return;
      }

      const { id: order_id, amount: order_amount, currency } = orderData.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order_amount,
        currency: currency || "INR",
        name: "INDIAN SOCIAL DEVELOPMENT ORGANIZATION",
        description: "Official Direct Payment / Donation / Service Fee",
        order_id: order_id,
        handler: async function (response: any) {
          setIsPaying(true);
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: numericAmount,
                payerName: payerName || ticketName || "Valued User",
                payerEmail: payerEmail || ticketEmail || "",
                payerPhone: payerPhone || "",
                source: "help_center",
                tag: "By Help Center",
                description: "Help Center Direct Payment / Contribution",
                details: "Official Direct Payment via Help Center Razorpay Gateway",
              }),
            });
            const verifyData = await verifyRes.json();
            setIsPaying(false);
            if (verifyData.success) {
              setPaymentSuccessData({
                paymentId: response.razorpay_payment_id,
                amount: numericAmount,
              });
            } else {
              setPaymentError("Payment verification failed on the server.");
            }
          } catch {
            setIsPaying(false);
            setPaymentError("Error communicating with server to verify payment signature.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
        prefill: {
          name: payerName || ticketName || "Valued User",
          email: payerEmail || ticketEmail || "",
          contact: payerPhone || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      setIsPaying(false);
      setPaymentError("Payment gateway connection failed.");
    }
  };

  const renderFaqsAccordion = () => (
    <div className="space-y-4 bg-white dark:bg-slate-900/70 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-4 w-4" />
          </div>
          Frequently Asked Questions (FAQs)
        </h3>
        <span className="text-[11px] font-bold text-slate-400">
          {faqs.length} Answers
        </span>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {loadingFaqs ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            <span className="text-xs text-slate-400 font-semibold">Loading FAQs...</span>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="h-7 w-7 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
              No FAQ items available right now.
            </p>
          </div>
        ) : (
          faqs.map((faq) => {
            const isOpen = openFaq === faq._id;
            return (
              <div key={faq._id} className="py-1 transition-all duration-200">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : faq._id)}
                  className="w-full flex items-center justify-between py-3 text-left cursor-pointer outline-none border-none group"
                >
                  <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-3 min-w-0">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                      }`}
                  />
                </button>

                {isOpen && (
                  <div className="pb-3.5 pr-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal animate-in fade-in duration-200">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* ── Top Contact Items (4-Column Grid) ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 py-1">
        {/* Email */}
        <div className="flex items-center gap-3.5 group bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 transition-all shadow-xs">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
            <Mail className="h-5 w-5" />
          </div>
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
        <div className="flex items-center gap-3.5 group bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/30 transition-all shadow-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
            <Phone className="h-5 w-5" />
          </div>
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

        {/* Head Office Address */}
        <div className="flex items-center gap-3.5 group bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/30 transition-all shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block font-semibold">
              Head Office Address
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mt-0.5" title={contactInfo.headOfficeAddress || contactInfo.address}>
              {contactInfo.headOfficeAddress || contactInfo.address || "G-161, Sector 22 Noida, Uttar Pradesh 201301 India"}
            </p>
          </div>
          {(contactInfo.headOfficeAddress || contactInfo.address) && (
            <a
              href={headOfficeMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Head Office in Google Maps"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Branch Office Address */}
        <div className="flex items-center gap-3.5 group bg-slate-50/50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/30 transition-all shadow-xs">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block font-semibold">
              Branch Office Address
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mt-0.5" title={contactInfo.branchOfficeAddress}>
              {contactInfo.branchOfficeAddress || "Baripada, Mayurbhanj, Odisha, India"}
            </p>
          </div>
          {contactInfo.branchOfficeAddress && (
            <a
              href={branchOfficeMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Branch Office in Google Maps"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* ── Main Two-Column Layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ═════════════════════════════════════════════════════════════════════
            LEFT COLUMN: Support Ticket Form + FAQs (On Desktop)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 space-y-8">
          {/* 1. Support Ticket Case Section */}
          <div className="space-y-4 bg-white dark:bg-slate-900/70 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Mail className="h-4 w-4" />
                </div>
                Support Ticket Case
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                24/7 Response
              </span>
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
                    We have received your case and our support team will get back to you shortly.
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
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-semibold"
                    />
                    <User className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
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
                      className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-semibold"
                    />
                    <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>
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
                    placeholder="e.g. Booking dispute, refund status, payment confirmation..."
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-semibold"
                  />
                  <Tag className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
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
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details about your query, booking ID, payment reference or issue..."
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition font-medium leading-relaxed resize-none"
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

          {/* 2. FAQs Section on Desktop (Hidden on Mobile) */}
          <div className="hidden lg:block">
            {renderFaqsAccordion()}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            RIGHT COLUMN: Bank Details + Scan & Pay QR Code + Pay with Razorpay
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Official Bank Details Card */}
          <div className="bg-white dark:bg-slate-900/70 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" />
                </div>
                Official Bank Details
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                <ShieldCheck className="h-3 w-3" />
                Verified Account
              </span>
            </div>

            {/* Organization Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl relative overflow-hidden shadow-inner border border-indigo-800/40">
              <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none">
                <Landmark className="w-28 h-28" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block mb-1">
                Beneficiary Organization
              </span>
              <h4 className="text-sm sm:text-base font-extrabold tracking-wide text-white">
                INDIAN SOCIAL DEVELOPMENT ORGANIZATION
              </h4>
            </div>

            {/* Bank Details Table / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Account Number */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-400/50 transition">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Account No.
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-black text-slate-900 dark:text-white tracking-wider truncate">
                    545010210000181
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("545010210000181", "acc")}
                  title="Copy Account Number"
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer shrink-0"
                >
                  {copiedKey === "acc" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* IFSC Code */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-400/50 transition">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    IFSC Code
                  </span>
                  <p className="text-xs sm:text-sm font-mono font-black text-slate-900 dark:text-white tracking-wider truncate">
                    BKID0005450
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("BKID0005450", "ifsc")}
                  title="Copy IFSC Code"
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer shrink-0"
                >
                  {copiedKey === "ifsc" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Bank Name & Branch */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Bank Name & Branch
                  </span>
                  <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200">
                    BANK OF INDIA, <span className="text-slate-500 font-medium">MURGABADI BRANCH, BARIPADA</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. QR Code (Scan & Pay) Card */}
          <div className="bg-white dark:bg-slate-900/70 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <QrCode className="h-4 w-4" />
                </div>
                Scan & Pay via UPI QR Code
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
              {/* QR Image Frame */}
              <div className="relative group bg-white p-3 rounded-2xl border border-slate-200 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src={bankQrImg}
                  alt="Bank of India UPI QR Code - Indian Social Development Organization"
                  className="w-40 h-auto sm:w-44 object-contain rounded-lg"
                />
              </div>

              {/* QR Instructions & App Badges */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    Universal UPI Accepted
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    Scan with any UPI Banking App
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Open Google Pay, PhonePe, Paytm, BHIM, or any Mobile Banking app and scan to pay directly.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 inline-flex flex-col sm:flex-row items-center gap-2 text-left w-full">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      UPI ID:
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                      boim-545002110181@boi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("boim-545002110181@boi", "qr_upi")}
                    className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition cursor-pointer shrink-0"
                  >
                    {copiedKey === "qr_upi" ? "Copied!" : "Copy VPA"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-blue-400/50 transition">
                    <GooglePayIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>GPay</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 rounded-lg border border-purple-200/80 dark:border-purple-800/50 shadow-2xs hover:border-purple-400/50 transition">
                    <PhonePeIcon className="h-3.5 w-3.5 shrink-0 rounded-[4px]" />
                    <span>PhonePe</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 bg-sky-50/80 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 rounded-lg border border-sky-200/80 dark:border-sky-800/50 shadow-2xs hover:border-sky-400/50 transition">
                    <PaytmIcon className="h-2.5 w-auto shrink-0" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-lg border border-emerald-200/80 dark:border-emerald-800/50 shadow-2xs hover:border-emerald-400/50 transition">
                    <BhimUpiIcon className="h-3.5 w-auto shrink-0" />
                    <span>BHIM UPI</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Pay with Razorpay Section */}
          <div className="bg-white dark:bg-slate-900/70 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-serif text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                Pay with Razorpay (Online Gateway)
              </h3>

            </div>

            {/* Payment Success State */}
            {paymentSuccessData && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-start gap-3.5 text-xs animate-in fade-in">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
                    Payment of ₹{paymentSuccessData.amount} Received Successfully!
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                    Payment Ref ID: <span className="font-bold text-emerald-900 dark:text-white">{paymentSuccessData.paymentId}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setPaymentSuccessData(null)}
                    className="mt-2 text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 underline hover:no-underline cursor-pointer"
                  >
                    Make Another Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Error */}
            {paymentError && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 rounded-2xl text-xs font-bold">
                {paymentError}
              </div>
            )}

            {/* Razorpay Interactive Form */}
            <form onSubmit={handleRazorpayPayment} className="space-y-4">
              {/* Amount Input with Currency Badge */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Enter Payment Amount (₹ INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-black text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-sm font-black pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                  />
                </div>
              </div>

              {/* Quick Amount Selection Pills */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Select Amount:
                </span>
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPayAmount(amt.toString())}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${payAmount === amt.toString()
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Payer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Payer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Payer Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50/80 dark:bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              {/* Pay with Razorpay CTA */}
              <button
                type="submit"
                disabled={isPaying || !payAmount || parseFloat(payAmount) <= 0}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.99] disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs uppercase tracking-wider"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting Razorpay...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>
                      Pay ₹{payAmount ? parseFloat(payAmount || "0").toLocaleString("en-IN") : "0"} with Razorpay
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Frequently Asked Questions (FAQs) Accordion Section (Visible on Mobile Only at the bottom) ── */}
      <div className="block lg:hidden w-full">
        {renderFaqsAccordion()}
      </div>
    </div>
  );
}
