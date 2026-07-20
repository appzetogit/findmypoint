import React, { useState, useEffect } from "react";
import { Star, X, Check, Loader2 } from "lucide-react";

interface ReviewPromptModalProps {
  bookingId: string;
  businessId: string;
  businessName: string;
  service: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewPromptModal({
  bookingId,
  businessId,
  businessName,
  service,
  onClose,
  onSuccess
}: ReviewPromptModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract user profile for pre-filling review info
  useEffect(() => {
    // 1. Try fmp_profile_personal:v1
    const profileStr = localStorage.getItem("fmp_profile_personal:v1");
    let loadedName = "";
    let loadedEmail = "";

    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        if (profile) {
          loadedName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
          loadedEmail = profile.email || "";
        }
      } catch (e) {}
    }

    // 2. Try fmp_user if details still missing
    const userStr = localStorage.getItem("fmp_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user) {
          if (!loadedName) loadedName = user.name || user.firstName || "";
          if (!loadedEmail) loadedEmail = user.email || "";
        }
      } catch (e) {}
    }

    setUserName(loadedName);
    setUserEmail(loadedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg("Please select a rating of 1 to 5 stars.");
      return;
    }
    const finalUserName = userName.trim() || "Valued Customer";
    if (!reviewText.trim()) {
      setErrorMsg("Please fill in your review message.");
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/businesses/${businessId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userName: finalUserName,
          userEmail: userEmail.trim(),
          rating,
          reviewText: reviewText.trim(),
          bookingId
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2200);
      } else {
        setErrorMsg(data.message || "Failed to submit review.");
      }
    } catch (err) {
      setErrorMsg("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md animate-scale-in text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          disabled={isSubmitting}
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
            <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-md">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-black text-slate-850 dark:text-slate-100">Thank You!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your feedback helps others make better choices.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Header */}
            <div>
              <span className="inline-block bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                Booking Completed
              </span>
              <h4 className="font-serif text-base font-black text-slate-900 dark:text-white mt-2 leading-snug">
                How was your experience at {businessName}?
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                We'd love to hear your thoughts on <strong className="text-slate-700 dark:text-slate-300">{service}</strong> (Ref: {bookingId})
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 p-2.5 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Star Rating */}
            <div className="flex flex-col items-center justify-center py-2 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Your Rating
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isGold = hoverRating !== null ? star <= hoverRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform duration-150 hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors duration-150 ${
                          isGold
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "text-slate-300 dark:text-slate-700 fill-none"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Comment Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Review Details
              </label>
              <textarea
                placeholder="Share details of your experience..."
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <span>Submit Feedback</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
