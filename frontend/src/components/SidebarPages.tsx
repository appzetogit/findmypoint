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
import MyBookingsPage from "./MyBookingsPage";
import AboutPage from "./AboutPage";

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
  const isWidePage = [
    "Help",
    "Customer Service",
    "About",
    "About Us",
    "My Bookings",
    "My Transaction",
    "Policy",
    "Privacy Policy",
    "Terms & Conditions",
  ].includes(activePage);

  return (
    <div className="fixed inset-0 z-[10001] bg-white dark:bg-slate-950 flex flex-col w-full h-full text-left overflow-hidden">
      {/* Header Block */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 sm:py-4 bg-white dark:bg-slate-900 shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            aria-label="Go Back"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer border border-slate-200/50 dark:border-slate-750 shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base sm:text-xl font-black font-serif text-slate-900 dark:text-white uppercase tracking-tight truncate">
              {activePage}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/40">
              FindmyPoint Support
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <span>Close</span>
          <span className="text-[10px] font-mono bg-slate-200/80 dark:bg-slate-700/80 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">ESC</span>
        </button>
      </div>

      {/* Dynamic Content Panel */}
      <div
        className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar w-full mx-auto bg-white dark:bg-slate-950 ${
          isWidePage ? "max-w-6xl 2xl:max-w-7xl" : "max-w-4xl"
        }`}
      >
        {activePage === "Favorites" && (
          <FavoritesPage onNavigateToBusiness={onNavigateToBusiness} />
        )}
        {(activePage === "Saved" || activePage === "Saved Businesses") && (
          <SavedPage onNavigateToBusiness={onNavigateToBusiness} onClose={onClose} />
        )}
        {activePage === "My Transaction" && <MyTransactionPage />}
        {activePage === "My Bookings" && <MyBookingsPage />}
        {activePage === "Notifications" && <NotificationsPage />}
        {activePage === "Customer Service" && <CustomerServicePage />}
        {(activePage === "Policy" || activePage === "Privacy Policy" || activePage === "Terms & Conditions") && (
          <PolicyPage initialTab={activePage === "Terms & Conditions" ? "terms" : "privacy"} />
        )}
        {activePage === "Feedback" && <FeedbackPage />}
        {activePage === "My Reviews" && <MyReviewsPage />}
        {activePage === "Help" && <HelpPage />}
        {(activePage === "About" || activePage === "About Us") && <AboutPage />}
      </div>
    </div>
  );
}
