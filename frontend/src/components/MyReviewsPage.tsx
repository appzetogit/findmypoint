import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { businessesData, BusinessListingData, UserReview } from "../data/businessesData";

interface ReviewItem {
  id: string;
  businessId: string;
  businessName: string;
  rating: number;
  comments: string;
  date: string;
}

export default function MyReviewsPage() {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);

  useEffect(() => {
    try {
      const allMyReviews: ReviewItem[] = [];

      // 1. Scan businesses for reviews by default user "Rahul Sharma"
      businessesData.forEach((biz: BusinessListingData) => {
        if (biz.reviews) {
          biz.reviews.forEach((rev: UserReview, index: number) => {
            if (rev.userName === "Rahul Sharma" || rev.userName === "rahul.sharma") {
              allMyReviews.push({
                id: `review-default-${biz.id}-${index}`,
                businessId: biz.id,
                businessName: biz.name,
                rating: rev.rating,
                comments: rev.reviewText,
                date: rev.date || "July 2026",
              });
            }
          });
        }
      });

      // 2. Scan localStorage for custom reviews posted by user
      businessesData.forEach((biz: BusinessListingData) => {
        const saved = localStorage.getItem(`fmp_custom_reviews:${biz.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.forEach((rev: any, index: number) => {
            allMyReviews.push({
              id: `review-custom-${biz.id}-${index}`,
              businessId: biz.id,
              businessName: biz.name,
              rating: rev.rating,
              comments: rev.reviewText || rev.text || "",
              date: rev.date || new Date().toLocaleDateString(),
            });
          });
        }
      });

      // If no reviews found, add some default realistic mock reviews
      if (allMyReviews.length === 0) {
        allMyReviews.push(
          {
            id: "rev-1",
            businessId: "REST002213",
            businessName: "Shree shyam restaurant",
            rating: 5,
            comments: "Delicious traditional food and excellent family dining environment! Highly recommended.",
            date: "04/07/2026",
          },
          {
            id: "rev-2",
            businessId: "HOTEL001",
            businessName: "The Royal Palace Hotel",
            rating: 4,
            comments: "Luxurious stay and clean rooms. The room service response was slightly delayed but overall a great experience.",
            date: "29/06/2026",
          }
        );
      }

      setReviewsList(allMyReviews);
    } catch (e) {
      console.error("Failed to load user reviews", e);
    }
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
