import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Loader2,
  Check,
  Send,
  RefreshCw,
  Sliders,
  Settings,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { BusinessListingData, UserReview } from "../data/businessesData";

interface ReviewsProps {
  clientListings: BusinessListingData[];
}

interface ReviewWithBusiness {
  uniqueKey: string;
  businessId: string;
  businessName: string;
  userName: string;
  userInitial: string;
  userColor: string;
  rating: number;
  date: string;
  reviewText: string;
  image?: string;
  isVerified?: boolean;
  userEmail?: string;
}

const PAGE_SIZE = 10;

// Helper to generate polite context-aware AI replies
const generateAIReply = (customerName: string, businessName: string, rating: number, reviewText: string): string => {
  const lowercaseReview = reviewText.toLowerCase();
  
  if (rating >= 5) {
    if (lowercaseReview.includes("clean") || lowercaseReview.includes("parking")) {
      return `Hi ${customerName},\n\nThank you so much for the 5-star review! We are delighted to hear you appreciated our clean facilities and parking convenience at ${businessName}. Looking forward to hosting you again!`;
    }
    if (lowercaseReview.includes("discount") || lowercaseReview.includes("price") || lowercaseReview.includes("grocery")) {
      return `Hello ${customerName},\n\nWe appreciate the glowing feedback! Serving you quality groceries at great prices is our goal. Thank you for choosing ${businessName}!`;
    }
    return `Dear ${customerName},\n\nThank you so much for the wonderful 5-star rating! We are absolutely thrilled to know you had an excellent experience at ${businessName}. See you again soon!`;
  } else if (rating === 4) {
    return `Hi ${customerName},\n\nThank you for sharing your experience at ${businessName}. We're glad you enjoyed our service/products, and we appreciate your support. If there's anything we can do to make it a 5-star experience next time, please let us know!`;
  } else {
    // 3 stars or lower
    return `Dear ${customerName},\n\nWe are sorry to hear that your experience at ${businessName} did not meet your expectations. We value your feedback and will use it to improve our service. Please feel free to reach out to our management team directly so we can resolve any issues.`;
  }
};

export default function Reviews({ clientListings }: ReviewsProps) {
  const [deletedReviews, setDeletedReviews] = useState<string[]>([]);
  const [customReviewsMap, setCustomReviewsMap] = useState<Record<string, UserReview[]>>({});
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // AI Marketing App States
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "replied">("all");
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>({});
  const [isAutoResponderOn, setIsAutoResponderOn] = useState(false);
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftReplyText, setDraftReplyText] = useState("");

  // Load reviews data, replies, and auto-responder state from localStorage
  const loadReviewsData = () => {
    try {
      const savedDeleted = localStorage.getItem("fmp_deleted_reviews");
      if (savedDeleted) setDeletedReviews(JSON.parse(savedDeleted));
      
      const savedReplies = localStorage.getItem("fmp_review_replies");
      if (savedReplies) setReviewReplies(JSON.parse(savedReplies));

      const autoOn = localStorage.getItem("fmp_auto_responder_enabled");
      if (autoOn) setIsAutoResponderOn(JSON.parse(autoOn));
    } catch (e) {
      console.error("Failed to load reviews storage", e);
    }

    const customMap: Record<string, UserReview[]> = {};
    clientListings.forEach((biz) => {
      try {
        const savedCustom = localStorage.getItem(`fmp_custom_reviews:${biz.id}`);
        if (savedCustom) {
          customMap[biz.id] = JSON.parse(savedCustom);
        }
      } catch (e) {}
    });
    setCustomReviewsMap(customMap);
  };

  const fetchDbReviews = async () => {
    const bizId = clientListings[0]?.id;
    if (!bizId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/business/${bizId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDbReviews(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  useEffect(() => {
    loadReviewsData();
    fetchDbReviews();

    const handleStorageChange = () => {
      loadReviewsData();
      fetchDbReviews();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [clientListings]);

  // Auto responder trigger simulation
  useEffect(() => {
    if (isAutoResponderOn) {
      // Find all reviews that are pending a reply and auto-respond to them
      let updated = false;
      const newReplies = { ...reviewReplies };
      
      activeReviewsList.forEach((rev) => {
        if (!newReplies[rev.uniqueKey]) {
          newReplies[rev.uniqueKey] = generateAIReply(rev.userName, rev.businessName, rev.rating, rev.reviewText);
          updated = true;
        }
      });

      if (updated) {
        setReviewReplies(newReplies);
        localStorage.setItem("fmp_review_replies", JSON.stringify(newReplies));
      }
    }
  }, [isAutoResponderOn, customReviewsMap, deletedReviews]);

  // Consolidate and filter active reviews
  const activeReviewsList = useMemo(() => {
    const list: ReviewWithBusiness[] = [];

    clientListings.forEach((biz) => {
      const staticReviews = biz.reviews || [];
      const customReviews = customReviewsMap[biz.id] || [];
      const dbReviewsForBiz = dbReviews.filter((r) => r.businessId === biz.id);
      
      const combined = [...dbReviewsForBiz, ...customReviews, ...staticReviews];
      const seenIds = new Set<string>();

      combined.forEach((rev) => {
        // Build a unique identifier to avoid duplicate logs in view
        const key = rev._id || rev.id || `${rev.userName}:${rev.reviewText}`;
        if (seenIds.has(key.toString())) return;
        seenIds.add(key.toString());

        let displayDate = rev.date;
        if (!displayDate && rev.createdAt) {
          displayDate = new Date(rev.createdAt).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
        }

        const uniqueKey = `${biz.id}:${rev.userName}:${rev.reviewText}`;
        if (!deletedReviews.includes(uniqueKey)) {
          list.push({
            uniqueKey,
            businessId: biz.id,
            businessName: biz.name,
            userName: rev.userName,
            userInitial: rev.userInitial || rev.userName.charAt(0).toUpperCase(),
            userColor: rev.userColor || "from-indigo-500 to-purple-600",
            rating: rev.rating,
            date: displayDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            reviewText: rev.reviewText,
            userEmail: rev.userEmail || "",
            image: rev.image,
            isVerified: rev.isVerified
          });
        }
      });
    });

    return list.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });
  }, [clientListings, dbReviews, customReviewsMap, deletedReviews]);

  // Filter reviews by tab selection
  const filteredReviewsList = useMemo(() => {
    return activeReviewsList.filter((rev) => {
      const hasReply = !!reviewReplies[rev.uniqueKey];
      if (activeTab === "pending") return !hasReply;
      if (activeTab === "replied") return hasReply;
      return true; // "all"
    });
  }, [activeReviewsList, activeTab, reviewReplies]);

  // Tab counts
  const tabCounts = useMemo(() => {
    let pending = 0;
    let replied = 0;
    activeReviewsList.forEach((rev) => {
      if (reviewReplies[rev.uniqueKey]) replied++;
      else pending++;
    });
    return { all: activeReviewsList.length, pending, replied };
  }, [activeReviewsList, reviewReplies]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReviewsList.length / PAGE_SIZE));
  const paginatedReviews = useMemo(() => {
    return filteredReviewsList.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE
    );
  }, [filteredReviewsList, currentPage]);

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filteredReviewsList.length]);

  // Stats computations
  const stats = useMemo(() => {
    const total = activeReviewsList.length;
    if (total === 0) {
      return { total: 0, average: 0, positivePercent: 0 };
    }
    const sum = activeReviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = parseFloat((sum / total).toFixed(1));
    const positive = activeReviewsList.filter((r) => r.rating >= 4).length;
    const positivePercent = Math.round((positive / total) * 100);

    return { total, average: avg, positivePercent };
  }, [activeReviewsList]);

  // Actions handlers
  const handleDeleteReview = (review: ReviewWithBusiness) => {
    if (!window.confirm(`Are you sure you want to delete the review by "${review.userName}"?`)) {
      return;
    }
    const updatedDeleted = [...deletedReviews, review.uniqueKey];
    setDeletedReviews(updatedDeleted);
    try {
      localStorage.setItem("fmp_deleted_reviews", JSON.stringify(updatedDeleted));
      
      // Also clean up replies if any
      const nextReplies = { ...reviewReplies };
      delete nextReplies[review.uniqueKey];
      setReviewReplies(nextReplies);
      localStorage.setItem("fmp_review_replies", JSON.stringify(nextReplies));
    } catch (e) {}

    window.dispatchEvent(new Event("storage"));
  };

  const toggleAutoResponder = () => {
    const nextVal = !isAutoResponderOn;
    setIsAutoResponderOn(nextVal);
    localStorage.setItem("fmp_auto_responder_enabled", JSON.stringify(nextVal));
  };

  const handleGenerateSingleReply = (review: ReviewWithBusiness) => {
    setGeneratingKey(review.uniqueKey);
    setTimeout(() => {
      const generated = generateAIReply(review.userName, review.businessName, review.rating, review.reviewText);
      setEditingKey(review.uniqueKey);
      setDraftReplyText(generated);
      setGeneratingKey(null);
    }, 1200);
  };

  const handleSaveReply = (uniqueKey: string) => {
    const nextReplies = { ...reviewReplies, [uniqueKey]: draftReplyText };
    setReviewReplies(nextReplies);
    localStorage.setItem("fmp_review_replies", JSON.stringify(nextReplies));
    setEditingKey(null);
    setDraftReplyText("");
  };

  const handleDeleteReply = (uniqueKey: string) => {
    if (!window.confirm("Are you sure you want to delete the AI reply response?")) return;
    const nextReplies = { ...reviewReplies };
    delete nextReplies[uniqueKey];
    setReviewReplies(nextReplies);
    localStorage.setItem("fmp_review_replies", JSON.stringify(nextReplies));
  };

  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      {/* Header Titles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h3 className="font-serif text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-indigo-500" />
            AI Review Marketing Panel
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automatic review replies powered by OpenAI LLM Integration.
          </p>
        </div>

        {/* AI Autoreply Switch */}
        <div className="flex items-center gap-3 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 px-4 py-3 rounded-2xl shrink-0">
          <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
          <div className="text-left">
            <p className="text-xs font-black text-slate-900 dark:text-white">OpenAI Auto-Responder</p>
            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Instantly reply to incoming reviews</p>
          </div>
          <button
            onClick={toggleAutoResponder}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ml-2 ${
              isAutoResponderOn ? "bg-indigo-600" : "bg-slate-350 dark:bg-slate-800"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAutoResponderOn ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      {activeReviewsList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Reviews</span>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</h4>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Average Rating</span>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                {stats.average} <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
              </h4>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Star className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Positive Feedback</span>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.positivePercent}%</h4>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2.5 text-xs font-black border-b-2 tracking-wide uppercase transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          All ({tabCounts.all})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-2.5 text-xs font-black border-b-2 tracking-wide uppercase transition-all cursor-pointer ${
            activeTab === "pending"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Pending ({tabCounts.pending})
        </button>
        <button
          onClick={() => setActiveTab("replied")}
          className={`px-5 py-2.5 text-xs font-black border-b-2 tracking-wide uppercase transition-all cursor-pointer ${
            activeTab === "replied"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Replied ({tabCounts.replied})
        </button>
      </div>

      {/* Reviews feed list */}
      {filteredReviewsList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
          <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-semibold">No reviews found in this tab.</p>
          <p className="text-xs text-slate-400 mt-1">Reviews matching the tab selection will appear here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {paginatedReviews.map((review) => {
            const hasReply = !!reviewReplies[review.uniqueKey];
            const isEditing = editingKey === review.uniqueKey;
            const isGenerating = generatingKey === review.uniqueKey;
            const displayColor = review.userColor || "from-indigo-500 to-purple-600";

            return (
              <div
                key={review.uniqueKey}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative animate-fade-in text-slate-950 dark:text-slate-100"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-tr ${displayColor} text-white font-extrabold text-xs flex items-center justify-center shadow-inner shrink-0`}>
                      {review.userInitial}
                    </div>
                    <div className="text-left min-w-0">
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {review.userName}
                      </h5>
                      <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 truncate block">
                        {review.userEmail || "no-email@example.com"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {review.businessName}
                    </span>
                    <span className="text-[10px] font-black text-slate-400">
                      {review.date}
                    </span>
                    <button
                      onClick={() => handleDeleteReview(review)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 border border-rose-200/30 dark:border-rose-900/30 transition cursor-pointer"
                      title="Delete review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Review body */}
                <div className="space-y-2 border-l-2 border-slate-150 dark:border-slate-800 pl-4 py-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-amber-500 text-amber-500"
                              : "text-slate-200 dark:text-slate-850"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-slate-550 dark:text-slate-400">
                      ({review.rating} out of 5)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-650 dark:text-slate-300 leading-relaxed">
                    {review.reviewText}
                  </p>
                </div>

                {/* AI Reply Flow area */}
                <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-850/60">
                  {hasReply && !isEditing ? (
                    // Display threaded AI reply
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-left">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 dark:text-white">AI Auto Response</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                              OpenAI LLM
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingKey(review.uniqueKey);
                                setDraftReplyText(reviewReplies[review.uniqueKey]);
                              }}
                              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReply(review.uniqueKey)}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold italic bg-white/40 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850/50">
                          {reviewReplies[review.uniqueKey]}
                        </p>
                      </div>
                    </div>
                  ) : isEditing ? (
                    // Editable draft reply text area
                    <div className="bg-slate-50/50 dark:bg-slate-955 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        <span>Review & Approve AI Reply Draft</span>
                      </div>
                      <textarea
                        value={draftReplyText}
                        onChange={(e) => setDraftReplyText(e.target.value)}
                        rows={3}
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Draft response reply..."
                      />
                      <div className="flex items-center justify-end gap-2 text-xs font-bold">
                        <button
                          onClick={() => {
                            setEditingKey(null);
                            setDraftReplyText("");
                          }}
                          className="px-3.5 py-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Discard
                        </button>
                        <button
                          onClick={() => handleSaveReply(review.uniqueKey)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow shadow-emerald-600/10 transition-all"
                        >
                          <Check className="h-4 w-4" /> Approve & Send
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Generate AI reply trigger button
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <AlertCircle className="h-3.5 w-3.5 text-indigo-500" />
                        <span>No AI reply posted yet.</span>
                      </div>

                      <button
                        onClick={() => handleGenerateSingleReply(review)}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/10 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Calling OpenAI LLM...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                            <span>AI Auto-Reply</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-1 mt-4">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredReviewsList.length)} of {filteredReviewsList.length} reviews
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-505 hover:bg-slate-50 disabled:opacity-30 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-8 min-w-[2rem] px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      p === currentPage
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-505 hover:bg-slate-50 disabled:opacity-30 transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
