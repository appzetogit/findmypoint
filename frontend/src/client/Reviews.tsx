import React, { useState, useEffect, useMemo } from "react";
import { Star, Trash2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessListingData, UserReview } from "../data/businessesData";

interface ReviewsProps {
  clientListings: BusinessListingData[];
}

interface ReviewWithBusiness {
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

const PAGE_SIZE = 15;

export default function Reviews({ clientListings }: ReviewsProps) {
  const [deletedReviews, setDeletedReviews] = useState<string[]>([]);
  const [customReviewsMap, setCustomReviewsMap] = useState<Record<string, UserReview[]>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Load deleted reviews list and custom reviews from localStorage
  const loadReviewsData = () => {
    try {
      const savedDeleted = localStorage.getItem("fmp_deleted_reviews");
      if (savedDeleted) {
        setDeletedReviews(JSON.parse(savedDeleted));
      } else {
        setDeletedReviews([]);
      }
    } catch (e) {
      console.error("Failed to load deleted reviews", e);
    }

    const customMap: Record<string, UserReview[]> = {};
    clientListings.forEach((biz) => {
      try {
        const savedCustom = localStorage.getItem(`fmp_custom_reviews:${biz.id}`);
        if (savedCustom) {
          customMap[biz.id] = JSON.parse(savedCustom);
        }
      } catch (e) {
        console.error(`Failed to load custom reviews for ${biz.id}`, e);
      }
    });
    setCustomReviewsMap(customMap);
  };

  useEffect(() => {
    loadReviewsData();
    const handleStorageChange = () => {
      loadReviewsData();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [clientListings]);

  // Consolidate and filter active reviews
  const activeReviewsList = useMemo(() => {
    const list: ReviewWithBusiness[] = [];

    clientListings.forEach((biz) => {
      const staticReviews = biz.reviews || [];
      const customReviews = customReviewsMap[biz.id] || [];
      const combined = [...customReviews, ...staticReviews];

      combined.forEach((rev) => {
        const uniqueKey = `${biz.id}:${rev.userName}:${rev.reviewText}`;
        if (!deletedReviews.includes(uniqueKey)) {
          list.push({
            businessId: biz.id,
            businessName: biz.name,
            ...rev,
          });
        }
      });
    });

    // Sort by date (mock dates can be text, custom reviews have numeric/standard dates, sort newest first)
    return list.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });
  }, [clientListings, customReviewsMap, deletedReviews]);

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(activeReviewsList.length / PAGE_SIZE));
  const paginatedReviews = activeReviewsList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 when review list changes (e.g. after delete)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeReviewsList.length]);

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

    return {
      total,
      average: avg,
      positivePercent,
    };
  }, [activeReviewsList]);

  // Delete handler
  const handleDeleteReview = (review: ReviewWithBusiness) => {
    const uniqueKey = `${review.businessId}:${review.userName}:${review.reviewText}`;
    if (!window.confirm(`Are you sure you want to delete the review by "${review.userName}"?`)) {
      return;
    }

    const updatedDeleted = [...deletedReviews, uniqueKey];
    setDeletedReviews(updatedDeleted);
    try {
      localStorage.setItem("fmp_deleted_reviews", JSON.stringify(updatedDeleted));
    } catch (e) {
      console.error("Failed to save deleted reviews to localStorage", e);
    }

    // Also trigger update event for other components (like BusinessDetail)
    window.dispatchEvent(new Event("storage"));
  };

  // Build page number list (show at most 5 page buttons)
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6 animate-fade-in-up text-left">
      {/* Header Titles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Reviews &amp; Ratings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor, analyze, and manage customer reviews for your registered businesses.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      {activeReviewsList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Total Reviews
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.total}
              </span>
              <span className="text-xs font-bold text-slate-400">active reviews</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Average Rating
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                {stats.average}{" "}
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              </span>
              <span className="text-xs font-bold text-slate-400">weighted average</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Positive Feedback
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {stats.positivePercent}%
              </span>
              <span className="text-xs font-bold text-slate-400 font-semibold">4★ &amp; 5★ ratings</span>
            </div>
          </div>
        </div>
      )}

      {/* Review List */}
      {activeReviewsList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-semibold">No reviews or ratings found.</p>
          <p className="text-xs text-slate-400 mt-1">Reviews submitted by users will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Table — no horizontal scroll */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-4 px-4 w-[16%]">Business</th>
                  <th className="py-4 px-4 w-[15%]">Name</th>
                  <th className="py-4 px-4 w-[18%]">Email</th>
                  <th className="py-4 px-4 w-[8%]">Rating</th>
                  <th className="py-4 px-4 w-[27%]">Review</th>
                  <th className="py-4 px-4 w-[11%]">Date &amp; Time</th>
                  <th className="py-4 px-4 w-[5%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {paginatedReviews.map((review, idx) => {
                  const displayColor = review.userColor || "from-indigo-500 to-purple-600";
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Business */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-200/20 truncate block max-w-full">
                          {review.businessName}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-full bg-gradient-to-tr ${displayColor} text-white font-extrabold text-[10px] flex items-center justify-center shadow-inner shrink-0`}>
                            {review.userInitial}
                          </div>
                          <span className="font-extrabold text-slate-900 dark:text-white truncate">
                            {review.userName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {review.userEmail || <span className="text-slate-300 dark:text-slate-600 font-normal">—</span>}
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">{review.rating}</span>
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
                        </div>
                      </td>

                      {/* Review text */}
                      <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300 truncate" title={review.reviewText}>
                        {review.reviewText}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {review.date}
                      </td>

                      {/* Delete Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteReview(review)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 border border-rose-200/30 dark:border-rose-900/30 transition cursor-pointer inline-flex items-center justify-center"
                          title="Delete review"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-1">
              {/* Info */}
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, activeReviewsList.length)} of {activeReviewsList.length} reviews
              </span>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* First page if not in range */}
                {pageNumbers[0] > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="h-8 min-w-[2rem] px-2 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >1</button>
                    {pageNumbers[0] > 2 && <span className="text-slate-400 text-xs">…</span>}
                  </>
                )}

                {/* Page buttons */}
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-8 min-w-[2rem] px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      p === currentPage
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Last page if not in range */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-slate-400 text-xs">…</span>}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="h-8 min-w-[2rem] px-2 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >{totalPages}</button>
                  </>
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Next page"
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

