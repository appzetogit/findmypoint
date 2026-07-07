import { ArrowLeft } from "lucide-react";
import FavoritesPage from "./FavoritesPage";
import SavedPage from "./SavedPage";
import MyTransactionPage from "./MyTransactionPage";
import NotificationsPage from "./NotificationsPage";
import CustomerServicePage from "./CustomerServicePage";
import PolicyPage from "./PolicyPage";
import FeedbackPage from "./FeedbackPage";
import HelpPage from "./HelpPage";
import MyReviewsPage from "./MyReviewsPage";

interface SidebarPagesProps {
  activePage: string;
  onClose: () => void;
  username: string | null;
  onNavigateToBusiness?: (
    categoryName: string,
    subCategoryName: string,
    businessId: string,
  ) => void;
}

export default function SidebarPages({
  activePage,
  onClose,
  username,
  onNavigateToBusiness,
}: SidebarPagesProps) {
  // Setup Visual Config per page
  let pageIcon = "";
  let pageSubtitle = "";

  if (activePage === "Favorites") {
    pageIcon = "❤️";
    pageSubtitle = "Curated list of your preferred service categories";
  } else if (activePage === "Saved") {
    pageIcon = "🔖";
    pageSubtitle = "View and configure your bookmarked points";
  } else if (activePage === "My Transaction") {
    pageIcon = "🧾";
    pageSubtitle = "Invoice receipts, booking deposits, and payment details";
  } else if (activePage === "Customer Service") {
    pageIcon = "🎧";
    pageSubtitle = "Help hotline, email ticket desk, and interactive assistant";
  } else if (activePage === "Policy" || activePage === "Privacy Policy" || activePage === "Terms & Conditions") {
    pageIcon = "🛡️";
    pageSubtitle = "Privacy policy, cancellation terms, and user agreements";
  } else if (activePage === "Feedback" || activePage === "My Reviews") {
    pageIcon = "⭐";
    pageSubtitle = "Share reviews and view your posted feedbacks";
  } else if (activePage === "Help") {
    pageIcon = "🤝";
    pageSubtitle = "Search FAQs, user guidelines, and cancellation issues";
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-full h-full text-left overflow-hidden">
      {/* Header Block */}
      <div className="flex items-center gap-4 border-b border-slate-100 p-5 bg-white shrink-0 shadow-sm">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <span className="text-3xl filter drop-shadow hidden md:inline">{pageIcon}</span>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 uppercase tracking-tight">
              {activePage}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 hidden md:block">{pageSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content Panel */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar max-w-5xl w-full mx-auto bg-slate-50">
        {activePage === "Favorites" && (
          <FavoritesPage onNavigateToBusiness={onNavigateToBusiness} />
        )}
        {(activePage === "Saved" || activePage === "Saved Businesses") && (
          <SavedPage onNavigateToBusiness={onNavigateToBusiness} />
        )}
        {activePage === "My Transaction" && <MyTransactionPage />}
        {activePage === "Notifications" && <NotificationsPage />}
        {activePage === "Customer Service" && <CustomerServicePage />}
        {(activePage === "Policy" || activePage === "Privacy Policy" || activePage === "Terms & Conditions") && (
          <PolicyPage initialTab={activePage === "Terms & Conditions" ? "terms" : "privacy"} />
        )}
        {activePage === "Feedback" && <FeedbackPage />}
        {activePage === "My Reviews" && <MyReviewsPage />}
        {activePage === "Help" && <HelpPage />}
      </div>
    </div>
  );
}
