import React, { useState, useEffect } from "react";
import { HelpCircle, Plus, Trash2, Edit3, Check, X, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

interface FAQManagementProps {
  clientListings: BusinessListingData[];
}

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
}

const storageKey = (bizId: string) => `fmp_custom_faqs:${bizId}`;

export default function FAQManagement({ clientListings }: FAQManagementProps) {
  const [selectedBizId, setSelectedBizId] = useState<string>(
    clientListings.length > 0 ? clientListings[0].id : ""
  );
  const [faqsMap, setFaqsMap] = useState<Record<string, FAQEntry[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const MOCK_FAQS: FAQEntry[] = [
    {
      id: "mock_1",
      question: "What are your working hours?",
      answer: "We are open Monday to Saturday, 9:00 AM – 8:00 PM. On Sundays we operate from 10:00 AM – 5:00 PM.",
    },
    {
      id: "mock_2",
      question: "Do you offer home delivery or on-site service?",
      answer: "Yes! We provide both home delivery and on-site service depending on your location. Please contact us to confirm availability in your area.",
    },
    {
      id: "mock_3",
      question: "What payment methods do you accept?",
      answer: "We accept cash, UPI (PhonePe, GPay, Paytm), debit/credit cards, and net banking. EMI options are available on select services.",
    },
    {
      id: "mock_4",
      question: "Is there a service warranty or guarantee?",
      answer: "All our services come with a 30-day satisfaction guarantee. If you experience any issues within this period, we will resolve it at no extra cost.",
    },
    {
      id: "mock_5",
      question: "How do I book an appointment?",
      answer: "You can book through our website, call us directly, or walk in during working hours. Online bookings receive priority slots.",
    },
  ];

  useEffect(() => {
    const map: Record<string, FAQEntry[]> = {};
    clientListings.forEach((biz) => {
      try {
        const saved = localStorage.getItem(storageKey(biz.id));
        if (saved) {
          map[biz.id] = JSON.parse(saved);
        } else {
          // Seed mock FAQs on first load
          map[biz.id] = MOCK_FAQS;
          localStorage.setItem(storageKey(biz.id), JSON.stringify(MOCK_FAQS));
        }
      } catch {
        map[biz.id] = MOCK_FAQS;
      }
    });
    setFaqsMap(map);
  }, [clientListings]);

  const saveFaqs = (bizId: string, faqs: FAQEntry[]) => {
    const updated = { ...faqsMap, [bizId]: faqs };
    setFaqsMap(updated);
    try {
      localStorage.setItem(storageKey(bizId), JSON.stringify(faqs));
    } catch (e) {
      console.error("Failed to save FAQs", e);
    }
  };

  const selectedBiz = clientListings.find((b) => b.id === selectedBizId);
  const currentFaqs = faqsMap[selectedBizId] || [];

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newFaq: FAQEntry = {
      id: `faq_${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };
    saveFaqs(selectedBizId, [...currentFaqs, newFaq]);
    setNewQuestion("");
    setNewAnswer("");
    setShowAddForm(false);
    showSuccess("FAQ added successfully!");
  };

  const handleDeleteFaq = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    saveFaqs(selectedBizId, currentFaqs.filter((f) => f.id !== id));
    showSuccess("FAQ deleted.");
  };

  const startEdit = (faq: FAQEntry) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const saveEdit = () => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    saveFaqs(
      selectedBizId,
      currentFaqs.map((f) =>
        f.id === editingId
          ? { ...f, question: editQuestion.trim(), answer: editAnswer.trim() }
          : f
      )
    );
    setEditingId(null);
    showSuccess("FAQ updated successfully!");
  };

  if (clientListings.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in-up text-left">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            FAQ Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage Frequently Asked Questions for your business listings.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <HelpCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No businesses registered yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            FAQ Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage Frequently Asked Questions for your business listings.
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add New FAQ
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Business Selector */}
      {clientListings.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
            Business:
          </label>
          <select
            value={selectedBizId}
            onChange={(e) => {
              setSelectedBizId(e.target.value);
              setShowAddForm(false);
              setEditingId(null);
            }}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 cursor-pointer"
          >
            {clientListings.map((biz) => (
              <option key={biz.id} value={biz.id}>{biz.name}</option>
            ))}
          </select>
        </div>
      )}


      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add New FAQ
            </h4>
            <button
              onClick={() => { setShowAddForm(false); setNewQuestion(""); setNewAnswer(""); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Question</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. What are your working hours?"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Answer</label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write a clear, helpful answer..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowAddForm(false); setNewQuestion(""); setNewAnswer(""); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFaq}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Save FAQ
            </button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      {currentFaqs.length === 0 && !showAddForm ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No FAQs added yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Click <span className="font-bold text-indigo-500">"Add New FAQ"</span> to create your first question.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {currentFaqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {editingId === faq.id ? (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Edit3 className="h-3.5 w-3.5" />
                    Editing FAQ #{idx + 1}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Question</label>
                    <input
                      type="text"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-amber-300/60 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Answer</label>
                    <textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-amber-300/60 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 transition resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={!editQuestion.trim() || !editAnswer.trim()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                        {faq.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                        title={expandedId === faq.id ? "Collapse" : "Preview answer"}
                      >
                        {expandedId === faq.id
                          ? <ChevronUp className="h-3.5 w-3.5" />
                          : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => startEdit(faq)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition cursor-pointer"
                        title="Edit FAQ"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {expandedId === faq.id && (
                    <div className="px-5 pb-4 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
