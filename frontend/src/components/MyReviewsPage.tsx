import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { businessesData, BusinessListingData } from "../data/businessesData";
import { API_BASE_URL } from "../config";

interface ReviewItem {
  id: string;
  businessId: string;
  businessName: string;
  category?: string;
  rating: number;
  comments: string;
  date: string;
}

export default function MyReviewsPage() {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem("fmp_user_token") || localStorage.getItem("fmp_business_token") || localStorage.getItem("fmp_admin_token") || "";

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: ReviewItem[] = data.data.map((r: any) => ({
            id: r.id || r._id,
            businessId: r.businessId,
            businessName: r.businessName || "Local Business",
            category: r.category,
            rating: r.rating,
            comments: r.reviewText || r.comments || "",
            date: r.date || "Recent"
          }));
          setReviewsList(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch user reviews from API:", err);
      }
    }

    // Fallback if no token or empty database
    try {
      const allMyReviews: ReviewItem[] = [];

      // Scan localStorage for custom reviews posted by user
      businessesData.forEach((biz: BusinessListingData) => {
        const saved = localStorage.getItem(`fmp_custom_reviews:${biz.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.forEach((rev: any, index: number) => {
            allMyReviews.push({
              id: `review-custom-${biz.id}-${index}`,
              businessId: biz.id,
              businessName: biz.name,
              category: biz.category,
              rating: rev.rating,
              comments: rev.reviewText || rev.text || "",
              date: rev.date || new Date().toLocaleDateString(),
            });
          });
        }
      });

      setReviewsList(allMyReviews);
    } catch (e) {
      console.error("Failed to load local user reviews", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">My Reviews Catalog</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Read and manage reviews you posted for local businesses.
        </p>
      </div>

      {reviewsList.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center text-xs font-semibold text-muted-foreground bg-card">
          You haven't posted any reviews yet. Click on any business and submit a review to display it here.
        </div>
      ) : (
        <div className="space-y-3.5">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="py-4 border-b border-border/60 text-left relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground tracking-tight">
                  {rev.businessName}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
              </div>

              <div className="flex items-center gap-1 mt-1.5 mb-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < rev.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2 items-start text-xs text-foreground/90 font-medium leading-relaxed">
                <MessageSquare className="h-4.5 w-4.5 text-indigo-500/70 shrink-0 mt-0.5" />
                <span>{rev.comments}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
