import { useState, useEffect, useReducer, useCallback } from "react";
import HomePage from "./pages/Home";
import ArticleDetailPage from "./pages/ArticleDetail";
import BusinessDetailPage from "./pages/BusinessDetail";
import PlaceDetailPage from "./pages/PlaceDetail";
import CategoryDetailPage from "./pages/CategoryDetail";
import SignInPage from "./pages/SignIn";
import AllCategoriesPage from "./pages/AllCategories";
import Sidebar from "./components/Sidebar";
import ProfileWizard from "./pages/ProfileWizard";
import SidebarPages from "./components/SidebarPages";
import Advertise from "./pages/Advertise";
import AdminShell from "./admin";
import ClientShell from "./client";
import MobileBookingPage from "./pages/MobileBookingPage";
import MobileTransactionPage from "./pages/MobileTransactionPage";
import MobileProfilePage from "./pages/MobileProfilePage";
import { Home, CalendarDays, Receipt, User } from "lucide-react";


interface AppViewState {
  selectedArticleId: number | null;
  selectedBusinessId: string | null;
  selectedPlaceName: string | null;
  selectedCategoryName: string | null;
  selectedSubcategoryName: string | null;
  showSignIn: boolean;
  showSidebar: boolean;
  scrollToReview: boolean;
  scrollToMenu: boolean;
  showProfileWizard: boolean;
  activeSidebarPage: string | null;
  showAdvertise: boolean;
  showAllCategoriesPage: boolean;
  showAdminPanel: boolean;
  showClientPanel: boolean;
}

const initialAppState: AppViewState = {
  selectedArticleId: null,
  selectedBusinessId: null,
  selectedPlaceName: null,
  selectedCategoryName: null,
  selectedSubcategoryName: null,
  showSignIn: false,
  showSidebar: false,
  scrollToReview: false,
  scrollToMenu: false,
  showProfileWizard: false,
  activeSidebarPage: null,
  showAdvertise: false,
  showAllCategoriesPage: false,
  showAdminPanel: false,
  showClientPanel: false,
};

type AppAction =
  | { type: "SET_SHOW_SIGN_IN"; show: boolean }
  | { type: "SET_SHOW_SIDEBAR"; show: boolean }
  | { type: "SET_SHOW_PROFILE_WIZARD"; show: boolean }
  | { type: "SET_ACTIVE_SIDEBAR_PAGE"; page: string | null }
  | { type: "SET_SHOW_ADVERTISE"; show: boolean }
  | { type: "SELECT_ARTICLE"; id: number | null }
  | { type: "SELECT_BUSINESS"; id: string | null; scrollToReview?: boolean; scrollToMenu?: boolean }
  | { type: "SELECT_PLACE"; name: string | null }
  | { type: "SELECT_CATEGORY"; name: string | null; subcategoryName?: string | null }
  | { type: "SET_SHOW_ALL_CATEGORIES"; show: boolean }
  | { type: "SET_SHOW_ADMIN"; show: boolean }
  | { type: "SET_SHOW_CLIENT"; show: boolean }
  | { type: "LOGOUT" };

function appReducer(state: AppViewState, action: AppAction): AppViewState {
  switch (action.type) {
    case "SET_SHOW_SIGN_IN":
      return { ...state, showSignIn: action.show };
    case "SET_SHOW_SIDEBAR":
      return { ...state, showSidebar: action.show };
    case "SET_SHOW_PROFILE_WIZARD":
      return { ...state, showProfileWizard: action.show };
    case "SET_ACTIVE_SIDEBAR_PAGE":
      return { ...state, activeSidebarPage: action.page };
    case "SET_SHOW_ADVERTISE":
      return { ...state, showAdvertise: action.show };
    case "SET_SHOW_ALL_CATEGORIES":
      return { ...state, showAllCategoriesPage: action.show };
    case "SELECT_ARTICLE":
      return {
        ...state,
        selectedArticleId: action.id,
        selectedBusinessId: null,
        selectedPlaceName: null,
        selectedCategoryName: null,
        selectedSubcategoryName: null,
        scrollToReview: false,
      };
    case "SELECT_BUSINESS":
      return {
        ...state,
        selectedArticleId: null,
        selectedBusinessId: action.id,
        selectedPlaceName: null,
        selectedCategoryName: null,
        selectedSubcategoryName: null,
        scrollToReview: !!action.scrollToReview,
        scrollToMenu: !!action.scrollToMenu,
      };
    case "SELECT_PLACE":
      return {
        ...state,
        selectedArticleId: null,
        selectedBusinessId: null,
        selectedPlaceName: action.name,
        selectedCategoryName: null,
        selectedSubcategoryName: null,
        scrollToReview: false,
      };
    case "SELECT_CATEGORY":
      return {
        ...state,
        selectedArticleId: null,
        selectedBusinessId: null,
        selectedPlaceName: null,
        selectedCategoryName: action.name,
        selectedSubcategoryName: action.subcategoryName || null,
        scrollToReview: false,
      };
    case "LOGOUT":
      return {
        ...state,
        showSidebar: false,
      };
    case "SET_SHOW_ADMIN":
      return {
        ...state,
        showAdminPanel: action.show,
      };
    case "SET_SHOW_CLIENT":
      return {
        ...state,
        showClientPanel: action.show,
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hash-based URL helpers
// ---------------------------------------------------------------------------

function buildHash(state: AppViewState, mobileTab: string): string {
  if (state.showAdminPanel) return "#/admin";
  if (state.showClientPanel) return "#/client";
  if (state.selectedBusinessId) return `#/business/${encodeURIComponent(state.selectedBusinessId)}`;
  if (state.selectedArticleId !== null) return `#/article/${state.selectedArticleId}`;
  if (state.selectedPlaceName) return `#/place/${encodeURIComponent(state.selectedPlaceName)}`;
  if (state.selectedCategoryName && state.selectedSubcategoryName)
    return `#/category/${encodeURIComponent(state.selectedCategoryName)}/${encodeURIComponent(state.selectedSubcategoryName)}`;
  if (state.selectedCategoryName)
    return `#/category/${encodeURIComponent(state.selectedCategoryName)}`;
  if (state.showAllCategoriesPage) return "#/categories";
  if (mobileTab !== "home") return `#/tab/${mobileTab}`;
  return "#/";
}

function parseHash(): {
  page: string;
  params: Record<string, string>;
} {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const segments = hash.split("/").filter(Boolean);
  const page = segments[0] || "";
  const params: Record<string, string> = {};

  if (page === "business" && segments[1]) params.businessId = decodeURIComponent(segments[1]);
  if (page === "article" && segments[1]) params.articleId = segments[1];
  if (page === "place" && segments[1]) params.placeName = decodeURIComponent(segments[1]);
  if (page === "category") {
    if (segments[1]) params.categoryName = decodeURIComponent(segments[1]);
    if (segments[2]) params.subcategoryName = decodeURIComponent(segments[2]);
  }
  if (page === "tab" && segments[1]) params.tab = segments[1];

  return { page, params };
}

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"home" | "booking" | "transactions" | "profile">("home");

  // Build initial state from current URL hash on first render
  const buildInitialState = (): AppViewState => {
    const { page, params } = parseHash();
    const base = { ...initialAppState };

    if (page === "admin") return { ...base, showAdminPanel: true };
    if (page === "client") return { ...base, showClientPanel: true };
    if (page === "business" && params.businessId) return { ...base, selectedBusinessId: params.businessId };
    if (page === "article" && params.articleId) return { ...base, selectedArticleId: Number(params.articleId) };
    if (page === "place" && params.placeName) return { ...base, selectedPlaceName: params.placeName };
    if (page === "category") {
      return {
        ...base,
        selectedCategoryName: params.categoryName || null,
        selectedSubcategoryName: params.subcategoryName || null,
      };
    }
    if (page === "categories") return { ...base, showAllCategoriesPage: true };
    return base;
  };

  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);

  // Restore mobileTab from hash on first load
  useEffect(() => {
    const { page, params } = parseHash();
    if (page === "tab" && ["booking", "transactions", "profile"].includes(params.tab)) {
      setMobileTab(params.tab as "booking" | "transactions" | "profile");
    }
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Sync URL hash whenever state or mobileTab changes
  useEffect(() => {
    const newHash = buildHash(state, mobileTab);
    if (window.location.hash !== newHash) {
      window.history.pushState(null, "", newHash);
    }
  }, [state, mobileTab]);

  // Handle browser back/forward (popstate fires on hash changes too)
  const handlePopState = useCallback(() => {
    const { page, params } = parseHash();

    if (page === "admin") { dispatch({ type: "SET_SHOW_ADMIN", show: true }); return; }
    if (page === "client") { dispatch({ type: "SET_SHOW_CLIENT", show: true }); return; }
    if (page === "business" && params.businessId) { dispatch({ type: "SELECT_BUSINESS", id: params.businessId }); return; }
    if (page === "article" && params.articleId) { dispatch({ type: "SELECT_ARTICLE", id: Number(params.articleId) }); return; }
    if (page === "place" && params.placeName) { dispatch({ type: "SELECT_PLACE", name: params.placeName }); return; }
    if (page === "category") {
      dispatch({ type: "SELECT_CATEGORY", name: params.categoryName || null, subcategoryName: params.subcategoryName });
      return;
    }
    if (page === "categories") { dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: true }); return; }
    if (page === "tab" && params.tab) {
      setMobileTab(params.tab as "home" | "booking" | "transactions" | "profile");
      return;
    }

    // Default: back to home
    dispatch({ type: "SELECT_BUSINESS", id: null });
    dispatch({ type: "SELECT_ARTICLE", id: null });
    dispatch({ type: "SELECT_PLACE", name: null });
    dispatch({ type: "SELECT_CATEGORY", name: null });
    dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: false });
    dispatch({ type: "SET_SHOW_ADMIN", show: false });
    dispatch({ type: "SET_SHOW_CLIENT", show: false });
    setMobileTab("home");
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handlePopState]);

  // Custom event listeners
  useEffect(() => {
    const handleAdvertiseOpen = () => dispatch({ type: "SET_SHOW_ADVERTISE", show: true });
    const handleOpenPage = (e: Event) => {
      const page = (e as CustomEvent).detail;
      dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page });
    };
    const handleSelectBusiness = (e: Event) => {
      const customEvent = e as CustomEvent;
      dispatch({ type: "SELECT_BUSINESS", id: customEvent.detail });
    };
    window.addEventListener("fmp-open-advertise", handleAdvertiseOpen);
    window.addEventListener("fmp-open-page", handleOpenPage);
    window.addEventListener("fmp-select-business", handleSelectBusiness);
    return () => {
      window.removeEventListener("fmp-open-advertise", handleAdvertiseOpen);
      window.removeEventListener("fmp-open-page", handleOpenPage);
      window.removeEventListener("fmp-select-business", handleSelectBusiness);
    };
  }, []);

  let content;

  if (isMobile && mobileTab !== "home" && !state.showAdminPanel && !state.showClientPanel && !state.showSignIn && !state.showProfileWizard) {
    if (mobileTab === "booking") {
      content = <MobileBookingPage />;
    } else if (mobileTab === "transactions") {
      content = <MobileTransactionPage />;
    } else if (mobileTab === "profile") {
      content = (
        <MobileProfilePage
          username={username}
          onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
          onLogout={() => {
            setUsername(null);
            dispatch({ type: "LOGOUT" });
            alert("Logged out successfully!");
          }}
          onEditProfileClick={() => dispatch({ type: "SET_SHOW_PROFILE_WIZARD", show: true })}
          onNotificationsClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Notifications" })}
          onHelpClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Help" })}
          onMyReviewsClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "My Reviews" })}
          onSavedBusinessesClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Saved" })}
          onPrivacyPolicyClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Privacy Policy" })}
          onTermsConditionsClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Terms & Conditions" })}
        />
      );
    }
  } else if (state.showAdvertise) {
    content = (
      <Advertise
        onClose={() => dispatch({ type: "SET_SHOW_ADVERTISE", show: false })}
        username={username}
      />
    );
  } else if (state.selectedArticleId !== null) {
    content = (
      <ArticleDetailPage
        articleId={state.selectedArticleId}
        onBack={() => {
          dispatch({ type: "SELECT_ARTICLE", id: null });
        }}
        onArticleSelect={(id) => {
          dispatch({ type: "SELECT_ARTICLE", id });
        }}
      />
    );
  } else if (state.selectedBusinessId !== null) {
    content = (
      <BusinessDetailPage
        businessId={state.selectedBusinessId}
        onBack={() => {
          dispatch({ type: "SELECT_BUSINESS", id: null });
        }}
        onBusinessSelect={(id) => {
          dispatch({ type: "SELECT_BUSINESS", id });
        }}
        scrollToReview={state.scrollToReview}
        scrollToMenu={state.scrollToMenu}
        onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
        onProfileClick={() => dispatch({ type: "SET_SHOW_SIDEBAR", show: true })}
        username={username}
      />
    );
  } else if (state.selectedPlaceName !== null) {
    content = (
      <PlaceDetailPage
        placeName={state.selectedPlaceName}
        onBack={() => dispatch({ type: "SELECT_PLACE", name: null })}
        onBusinessSelect={(id) => {
          dispatch({ type: "SELECT_BUSINESS", id });
        }}
        onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
        onProfileClick={() => dispatch({ type: "SET_SHOW_SIDEBAR", show: true })}
        username={username}
      />
    );
  } else if (state.selectedCategoryName !== null) {
    if (state.selectedSubcategoryName === null) {
      content = (
        <AllCategoriesPage
          onBack={() => dispatch({ type: "SELECT_CATEGORY", name: null })}
          onCategoryClick={(categoryName, subcategoryName) => {
            dispatch({ type: "SELECT_CATEGORY", name: categoryName, subcategoryName });
          }}
          initialCategory={state.selectedCategoryName}
        />
      );
    } else {
      content = (
        <CategoryDetailPage
          categoryName={state.selectedCategoryName}
          initialSubcategory={state.selectedSubcategoryName}
          onBack={() => dispatch({ type: "SELECT_CATEGORY", name: state.selectedCategoryName, subcategoryName: null })}
          onBusinessSelect={(id) => {
            dispatch({ type: "SELECT_BUSINESS", id });
          }}
          onBookNow={(id) => {
            dispatch({ type: "SELECT_BUSINESS", id, scrollToMenu: true });
          }}
          onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
          onProfileClick={() => dispatch({ type: "SET_SHOW_SIDEBAR", show: true })}
          username={username}
        />
      );
    }
  } else if (state.showAllCategoriesPage) {
    content = (
      <AllCategoriesPage
        onBack={() => dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: false })}
        onCategoryClick={(categoryName, subcategoryName) => {
          dispatch({ type: "SELECT_CATEGORY", name: categoryName, subcategoryName });
          dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: false });
        }}
      />
    );
  } else {
    content = (
      <HomePage
        onArticleClick={(id) => {
          dispatch({ type: "SELECT_ARTICLE", id });
        }}
        onReviewClick={(id) => {
          dispatch({ type: "SELECT_BUSINESS", id, scrollToReview: true });
        }}
        onPlaceClick={(placeName) => {
          dispatch({ type: "SELECT_PLACE", name: placeName });
        }}
        onCategoryClick={(categoryName, subcategoryName) => {
          dispatch({ type: "SELECT_CATEGORY", name: categoryName, subcategoryName });
        }}
        onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
        onProfileClick={() => dispatch({ type: "SET_SHOW_SIDEBAR", show: true })}
        onAdvertiseClick={() => dispatch({ type: "SET_SHOW_ADVERTISE", show: true })}
        username={username}
        onShowAllCategories={() => dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: true })}
        onLogout={() => {
          setUsername(null);
          dispatch({ type: "LOGOUT" });
          alert("Logged out successfully!");
        }}
        onEditProfileClick={() => dispatch({ type: "SET_SHOW_PROFILE_WIZARD", show: true })}
        onNotificationsClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Notifications" })}
        onHelpClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Help" })}
        onMyReviewsClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "My Reviews" })}
        onSavedBusinessesClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Saved" })}
        onPrivacyPolicyClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Privacy Policy" })}
        onTermsConditionsClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Terms & Conditions" })}
      />
    );
  }

  if (state.showAdminPanel) {
    return (
      <AdminShell
        onClose={() => {
          dispatch({ type: "SET_SHOW_ADMIN", show: false });
          window.history.pushState(null, "", "#/");
        }}
        username={username}
      />
    );
  }

  if (state.showClientPanel) {
    return (
      <ClientShell
        onClose={() => {
          dispatch({ type: "SET_SHOW_CLIENT", show: false });
          window.history.pushState(null, "", "#/");
        }}
        username={username}
      />
    );
  }

  if (state.showSignIn) {
    return (
      <SignInPage
        onBack={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: false })}
        onSuccess={(name) => {
          setUsername(name);
          dispatch({ type: "SET_SHOW_SIGN_IN", show: false });
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden w-full pb-16 sm:pb-0">
      {content}

      {/* Sidebar Overlay */}
      {state.showSidebar && (
        <Sidebar
          onClose={() => dispatch({ type: "SET_SHOW_SIDEBAR", show: false })}
          username={username}
          onLogout={() => {
            setUsername(null);
            dispatch({ type: "LOGOUT" });
            alert("Logged out successfully!");
          }}
          onSignInClick={() => {
            dispatch({ type: "SET_SHOW_SIDEBAR", show: false });
            dispatch({ type: "SET_SHOW_SIGN_IN", show: true });
          }}
          onMyProfileClick={() => {
            dispatch({ type: "SET_SHOW_SIDEBAR", show: false });
            dispatch({ type: "SET_SHOW_PROFILE_WIZARD", show: true });
          }}
          onMenuClick={(page) => {
            dispatch({ type: "SET_SHOW_SIDEBAR", show: false });
            dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page });
          }}
        />
      )}

      {/* Profile Wizard Overlay */}
      {state.showProfileWizard && (
        <ProfileWizard
          onClose={() => dispatch({ type: "SET_SHOW_PROFILE_WIZARD", show: false })}
          username={username}
        />
      )}

      {/* Individual Sidebar Settings Pages */}
      {state.activeSidebarPage && (
        <SidebarPages
          activePage={state.activeSidebarPage}
          onClose={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: null })}
          username={username}
          onNavigateToBusiness={(catName, subCatName, bizId) => {
            dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: null });
            dispatch({ type: "SELECT_BUSINESS", id: bizId });
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && !state.showAdminPanel && !state.showClientPanel && !state.showSignIn && !state.showProfileWizard && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
          <div className="flex items-stretch justify-around h-16 w-full max-w-3xl mx-auto">
            {([
              { icon: Home,         label: "Home",         key: "home" },
              { icon: CalendarDays, label: "Booking",      key: "booking" },
              { icon: Receipt,      label: "Transactions", key: "transactions" },
              { icon: User,         label: "Profile",      key: "profile" },
            ] as const).map(({ icon: Icon, label, key }) => {
              const isActive = mobileTab === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setMobileTab(key);
                    if (key === "home") {
                      dispatch({ type: "SELECT_CATEGORY", name: null });
                      dispatch({ type: "SELECT_BUSINESS", id: null });
                      dispatch({ type: "SELECT_ARTICLE", id: null });
                      dispatch({ type: "SELECT_PLACE", name: null });
                      dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: false });
                    }
                  }}
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors cursor-pointer ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="relative flex items-center justify-center w-6 h-6">
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-blue-50 dark:bg-slate-800 shadow-sm scale-150" />
                    )}
                    <Icon className="h-5 w-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-semibold leading-none ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                  }`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
