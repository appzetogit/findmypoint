import { useState } from "react";
import { Star, Check } from "lucide-react";

export default function FeedbackPage() {
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackCategory, setFeedbackCategory] = useState("Ui Design");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    try {
      const savedFeedbacks = JSON.parse(localStorage.getItem("fmp_feedbacks:v1") || "[]");
      savedFeedbacks.push({ 
        rating: feedbackRating, 
        category: feedbackCategory, 
        comments: feedbackComments, 
        date: new Date().toLocaleDateString() 
      });
      localStorage.setItem("fmp_feedbacks:v1", JSON.stringify(savedFeedbacks));
    } catch (e) {
      console.error("Failed to save feedback", e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">User Feedback Portal</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Let us know about your experience to refine our search points.</p>
      </div>

      {feedbackSubmitted ? (
        <div className="border border-border bg-emerald-50 rounded-2xl p-8 text-center text-xs font-semibold text-emerald-600 max-w-md mx-auto space-y-4 animate-scale-in">
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600 border border-emerald-200">
            <Check className="h-6 w-6 stroke-[3]" />
          </div>
          <h4 className="text-sm font-black uppercase">Feedback Submitted!</h4>
          <p className="text-[11.5px] leading-relaxed text-emerald-600/80">Thank you for sharing your thoughts. We have recorded your suggestions securely to implement layouts improvements.</p>
          <button 
            type="button"
            onClick={() => {
              setFeedbackSubmitted(false);
              setFeedbackRating(0);
              setFeedbackComments("");
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition cursor-pointer"
          >
            Submit Another Feedback
          </button>
        </div>
      ) : (
        <form onSubmit={handleFeedbackSubmit} className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-5 text-xs max-w-lg mx-auto shadow-sm">
          
          {/* Rating */}
          <div className="space-y-2">
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider text-left">Overall Rating</span>
            <div className="flex gap-2 justify-center py-2 bg-secondary/5 border border-border/40 rounded-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  className="text-slate-300 hover:text-amber-400 transition cursor-pointer transform hover:scale-110"
                >
                  <Star className={`h-8 w-8 ${star <= feedbackRating ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label htmlFor="feedbackCategory" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Category Concern</label>
              <select 
                id="feedbackCategory"
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value)}
                className="w-full border border-border bg-background rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary cursor-pointer"
              >
                <option value="Ui Design">UI Layout / Aesthetics</option>
                <option value="Booking Process">Booking / Payments Gateway</option>
                <option value="Listing Details">Business Listings Details</option>
                <option value="Profile Setup">Profile Stepper Wizard</option>
              </select>
            </div>
            <div className="text-left">
              <label htmlFor="dateSubmitted" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Date Submitted</label>
              <input 
                id="dateSubmitted"
                type="text" 
                readOnly 
                value={new Date().toLocaleDateString()}
                className="w-full border border-border bg-secondary/40 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Comments */}
          <div className="text-left">
            <label htmlFor="feedbackComments" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Feedback Details</label>
            <textarea 
              id="feedbackComments"
              rows={3}
              required
              value={feedbackComments}
              onChange={(e) => setFeedbackComments(e.target.value)}
              placeholder="Share details on what we can improve..."
              className="w-full border border-border bg-background rounded-xl p-3.5 text-xs font-semibold outline-none focus:border-primary resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black py-3 rounded-xl shadow transition cursor-pointer"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
}
