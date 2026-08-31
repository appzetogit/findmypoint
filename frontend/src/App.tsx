import { useState, useEffect, useReducer, useCallback, useRef } from "react";
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
import PopularServiceDetailPage from "./pages/PopularServiceDetail";
import MobileTransactionPage from "./pages/MobileTransactionPage";
import MobileProfilePage from "./pages/MobileProfilePage";
import EmployeeVerificationPage from "./pages/EmployeeVerificationPage";
import BottomLoginPrompt from "./components/BottomLoginPrompt";
import { Home, CalendarDays, Receipt, User } from "lucide-react";
import { socketService } from "./services/socketService";
import ReviewPromptModal from "./components/ReviewPromptModal";
import { isApkEnvironment } from "./utils/apkDetection";


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
  selectedPopularServiceId: string | null;
  verifiedEmpId: string | null;
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
  selectedPopularServiceId: null,
  verifiedEmpId: null,
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
  | { type: "SELECT_POPULAR_SERVICE"; id: string | null }
  | { type: "SET_VERIFIED_EMP_ID"; empId: string | null }
  | { type: "LOGOUT" };

function appReducer(state: AppViewState, action: AppAction): AppViewState {
  switch (action.type) {
    case "SET_VERIFIED_EMP_ID":
      return {
        ...state,
        verifiedEmpId: action.empId,
        selectedArticleId: null,
        selectedBusinessId: null,
        selectedPlaceName: null,
        selectedCategoryName: null,
        selectedSubcategoryName: null,
        selectedPopularServiceId: null,
        showAdminPanel: false,
        showClientPanel: false,
        showAdvertise: false,
        showAllCategoriesPage: false,
      };
    case "SET_SHOW_SIGN_IN":
      return { ...state, showSignIn: action.show };
    case "SET_SHOW_SIDEBAR":
      return { ...state, showSidebar: action.show };
    case "SET_SHOW_PROFILE_WIZARD":
      return { ...state, showProfileWizard: action.show };
    case "SET_ACTIVE_SIDEBAR_PAGE":
      return { ...state, activeSidebarPage: action.page };
    case "SET_SHOW_ADVERTISE":
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
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
        selectedPopularServiceId: null,
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
        selectedPopularServiceId: null,
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
        selectedPopularServiceId: null,
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
        selectedPopularServiceId: null,
        scrollToReview: false,
      };
    case "SELECT_POPULAR_SERVICE":
      return {
        ...state,
        selectedArticleId: null,
        selectedBusinessId: null,
        selectedPlaceName: null,
        selectedCategoryName: null,
        selectedSubcategoryName: null,
        selectedPopularServiceId: action.id,
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
const RESERVED_ROUTES = ["admin", "client", "advertise", "sidebar", "business", "article", "place", "service", "category", "categories", "tab", "verify", "employee"];

function buildPath(state: AppViewState, mobileTab: string): string {
  if (state.verifiedEmpId !== null) return state.verifiedEmpId ? `/verify/${encodeURIComponent(state.verifiedEmpId)}` : "/verify";
  if (state.showAdminPanel) return "/admin";
  if (state.showClientPanel) return "/client";
  if (state.showAdvertise) return "/advertise";
  if (state.activeSidebarPage) return `/sidebar/${encodeURIComponent(state.activeSidebarPage)}`;
  if (state.selectedBusinessId) {
    if (state.selectedBusinessId.startsWith("/")) return state.selectedBusinessId;
    if (state.selectedBusinessId.includes("/")) return `/${state.selectedBusinessId}`;
    return `/business/${encodeURIComponent(state.selectedBusinessId)}`;
  }
  if (state.selectedArticleId !== null) return `/article/${state.selectedArticleId}`;
  if (state.selectedPlaceName) return `/place/${encodeURIComponent(state.selectedPlaceName)}`;
  if (state.selectedPopularServiceId) return `/service/${encodeURIComponent(state.selectedPopularServiceId)}`;
  if (state.selectedCategoryName && state.selectedSubcategoryName)
    return `/category/${encodeURIComponent(state.selectedCategoryName)}/${encodeURIComponent(state.selectedSubcategoryName)}`;
  if (state.selectedCategoryName)
    return `/category/${encodeURIComponent(state.selectedCategoryName)}`;
  if (state.showAllCategoriesPage) return "/categories";
  if (mobileTab !== "home") return `/tab/${mobileTab}`;
  return "/";
}

function parsePath(): {
  page: string;
  params: Record<string, string>;
} {
  const path = window.location.pathname || "/";
  const segments = path.split("/").filter(Boolean);
  const page = segments[0] || "";
  const params: Record<string, string> = {};

  // Check 3-segment SEO path: /{city}/{locality}/{slug} (e.g. /indore/vijay-nagar/appzeto)
  if (segments.length === 3 && !RESERVED_ROUTES.includes(segments[0])) {
    const city = decodeURIComponent(segments[0]);
    const locality = decodeURIComponent(segments[1]);
    const slug = decodeURIComponent(segments[2]);
    return {
      page: "business",
      params: {
        city,
        locality,
        slug,
        businessId: `/${city}/${locality}/${slug}`
      }
    };
  }

  // Check 2-segment SEO path: /{city}/{slug} (e.g. /indore/deluxe-tour-service)
  if (segments.length === 2 && !RESERVED_ROUTES.includes(segments[0])) {
    const city = decodeURIComponent(segments[0]);
    const slug = decodeURIComponent(segments[1]);
    return {
      page: "business",
      params: {
        city,
        slug,
        businessId: `/${city}/${slug}`
      }
    };
  }

  if (page === "business" && segments[1]) params.businessId = decodeURIComponent(segments[1]);
  if (page === "article" && segments[1]) params.articleId = segments[1];
  if (page === "place" && segments[1]) params.placeName = decodeURIComponent(segments[1]);
  if (page === "service" && segments[1]) params.popularServiceId = decodeURIComponent(segments[1]);
  if (page === "category") {
    if (segments[1]) params.categoryName = decodeURIComponent(segments[1]);
    if (segments[2]) params.subcategoryName = decodeURIComponent(segments[2]);
  }
  if (page === "tab" && segments[1]) params.tab = segments[1];
  if (page === "sidebar" && segments[1]) params.sidebarPage = decodeURIComponent(segments[1]);
  if ((page === "verify" || page === "employee") && segments[1]) params.verifiedEmpId = decodeURIComponent(segments[1]);
  else if (page === "verify" || page === "employee") params.verifiedEmpId = "";

  return { page, params };
}

export default function App() {
  const [activeReviewPrompt, setActiveReviewPrompt] = useState<{
    bookingId: string;
    businessId: string;
    businessName: string;
    service: string;
  } | null>(null);

  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("fmp_profile_personal:v1");
      const token = localStorage.getItem("fmp_user_token");
      if (token && savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          return parsed.firstName || null;
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [userProfile, setUserProfile] = useState<{
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile1?: string;
    dobYYYY?: string;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("fmp_profile_personal:v1");
      const token = localStorage.getItem("fmp_user_token");
      if (token && savedProfile) {
        try {
          return JSON.parse(savedProfile);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isApk, setIsApk] = useState(() => isApkEnvironment());
  const [mobileTab, setMobileTab] = useState<"home" | "booking" | "transactions" | "profile">("home");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showBottomLoginPrompt, setShowBottomLoginPrompt] = useState(false);
  const lastScrollY = useRef(0);

  const handleProfileClick = () => {
    if (isMobile) {
      setMobileTab("profile");
    } else {
      dispatch({ type: "SET_SHOW_SIDEBAR", show: true });
    }
  };


  // Scroll listener to hide/show bottom navigation in mobile view with animation
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 10) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Reset visibility on tab change
  useEffect(() => {
    setIsNavVisible(true);
  }, [mobileTab]);

  // Build initial state from current URL path on first render
  const buildInitialState = (): AppViewState => {
    const { page, params } = parsePath();
    const base = { ...initialAppState };

    if (page === "admin") return { ...base, showAdminPanel: true };
    if (page === "client") return { ...base, showClientPanel: true };
    if (page === "advertise") return { ...base, showAdvertise: true };
    if (page === "sidebar" && params.sidebarPage) return { ...base, activeSidebarPage: params.sidebarPage };
    if (page === "business" && params.businessId) return { ...base, selectedBusinessId: params.businessId };
    if (page === "article" && params.articleId) return { ...base, selectedArticleId: Number(params.articleId) };
    if (page === "place" && params.placeName) return { ...base, selectedPlaceName: params.placeName };
    if (page === "service" && params.popularServiceId) return { ...base, selectedPopularServiceId: params.popularServiceId };
    if (page === "category") {
      return {
        ...base,
        selectedCategoryName: params.categoryName || null,
        selectedSubcategoryName: params.subcategoryName || null,
      };
    }
    if (page === "categories") return { ...base, showAllCategoriesPage: true };
    if (page === "verify" || page === "employee") return { ...base, verifiedEmpId: params.verifiedEmpId || "" };
    return base;
  };

  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);

  // Auto-trigger slide-up login prompt once website loads (Mandatory for unauthenticated users)
  useEffect(() => {
    const hasToken = typeof window !== "undefined" ? localStorage.getItem("fmp_user_token") : null;

    if (
      !username &&
      !hasToken &&
      !state.showAdminPanel &&
      !state.showClientPanel &&
      !state.verifiedEmpId
    ) {
      const timer = setTimeout(() => {
        setShowBottomLoginPrompt(true);
      }, 400);
      return () => clearTimeout(timer);
    } else if (username || hasToken) {
      setShowBottomLoginPrompt(false);
    }
  }, [username, state.showAdminPanel, state.showClientPanel, state.verifiedEmpId]);

  // Restore mobileTab from path on first load
  useEffect(() => {
    const { page, params } = parsePath();
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

  // Sync URL path whenever state or mobileTab changes
  useEffect(() => {
    const newPath = buildPath(state, mobileTab);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, "", newPath);
    }
  }, [state, mobileTab]);

  // Handle browser back/forward (popstate fires on path changes too)
  const handlePopState = useCallback(() => {
    const { page, params } = parsePath();

    if (page === "admin") { dispatch({ type: "SET_SHOW_ADMIN", show: true }); return; }
    if (page === "client") { dispatch({ type: "SET_SHOW_CLIENT", show: true }); return; }
    if (page === "advertise") { dispatch({ type: "SET_SHOW_ADVERTISE", show: true }); return; }
    if (page === "sidebar" && params.sidebarPage) { dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: params.sidebarPage }); return; }
    if (page === "business" && params.businessId) { dispatch({ type: "SELECT_BUSINESS", id: params.businessId }); return; }
    if (page === "article" && params.articleId) { dispatch({ type: "SELECT_ARTICLE", id: Number(params.articleId) }); return; }
    if (page === "place" && params.placeName) { dispatch({ type: "SELECT_PLACE", name: params.placeName }); return; }
    if (page === "service" && params.popularServiceId) { dispatch({ type: "SELECT_POPULAR_SERVICE", id: params.popularServiceId }); return; }
    if (page === "category") {
      dispatch({ type: "SELECT_CATEGORY", name: params.categoryName || null, subcategoryName: params.subcategoryName });
      return;
    }
    if (page === "categories") { dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: true }); return; }
    if (page === "verify" || page === "employee") { dispatch({ type: "SET_VERIFIED_EMP_ID", empId: params.verifiedEmpId || "" }); return; }
    if (page === "tab" && params.tab) {
      setMobileTab(params.tab as "home" | "booking" | "transactions" | "profile");
      return;
    }

    // Default: back to home
    dispatch({ type: "SELECT_BUSINESS", id: null });
    dispatch({ type: "SELECT_ARTICLE", id: null });
    dispatch({ type: "SELECT_PLACE", name: null });
    dispatch({ type: "SELECT_CATEGORY", name: null });
    dispatch({ type: "SELECT_POPULAR_SERVICE", id: null });
    dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: false });
    dispatch({ type: "SET_SHOW_ADVERTISE", show: false });
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
    const handleSignInOpen = () => dispatch({ type: "SET_SHOW_SIGN_IN", show: true });
    const handleOpenPage = (e: Event) => {
      const page = (e as CustomEvent).detail;
      dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page });
    };
    const handleSelectBusiness = (e: Event) => {
      const customEvent = e as CustomEvent;
      dispatch({ type: "SELECT_BUSINESS", id: customEvent.detail });
    };
    window.addEventListener("fmp-open-advertise", handleAdvertiseOpen);
    window.addEventListener("fmp-open-signin", handleSignInOpen);
    window.addEventListener("fmp-open-page", handleOpenPage);
    window.addEventListener("fmp-select-business", handleSelectBusiness);
    return () => {
      window.removeEventListener("fmp-open-advertise", handleAdvertiseOpen);
      window.removeEventListener("fmp-open-signin", handleSignInOpen);
      window.removeEventListener("fmp-open-page", handleOpenPage);
      window.removeEventListener("fmp-select-business", handleSelectBusiness);
    };
  }, []);

  // WebSocket Connection and Event Listening for Real-time Review Prompts
  useEffect(() => {
    const registerSocket = () => {
      const token = localStorage.getItem("fmp_user_token");
      if (token) {
        try {
          const payload = token.split(".")[1];
          const decoded = JSON.parse(window.atob(payload));
          if (decoded && decoded.id) {
            socketService.registerUser(decoded.id);
          }
        } catch (e) {
          console.error("Failed to register socket user:", e);
        }
      }
    };

    // Initial registration
    registerSocket();

    // Listen for booking completed events
    socketService.onRequestReview((data) => {
      console.log("WebSocket review request received in App:", data);
      setActiveReviewPrompt(data);
    });

    // Check on storage events (sign in / logout)
    const handleStorageChange = () => {
      const token = localStorage.getItem("fmp_user_token");
      if (token) {
        registerSocket();
      } else {
        socketService.unregisterUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  let content;

  if (isMobile && mobileTab !== "home" && !state.showAdminPanel && !state.showClientPanel && !state.showSignIn && !state.showProfileWizard) {
    if (mobileTab === "booking") {
      content = <MobileBookingPage onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })} />;
    } else if (mobileTab === "transactions") {
      content = <MobileTransactionPage onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })} />;
    } else if (mobileTab === "profile") {
      content = (
        <MobileProfilePage
          username={username}
          userProfile={userProfile}
          onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
          onLogout={() => {
            localStorage.removeItem("fmp_user_token");
            localStorage.removeItem("fmp_profile_personal:v1");
            setUsername(null);
            setUserProfile(null);
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
        onProfileClick={handleProfileClick}
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
        onProfileClick={handleProfileClick}
        username={username}
      />
    );
  } else if (state.selectedCategoryName !== null) {
    if (isMobile && state.selectedSubcategoryName === null) {
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
          onBack={() => {
            if (isMobile) {
              dispatch({ type: "SELECT_CATEGORY", name: state.selectedCategoryName, subcategoryName: null });
            } else {
              dispatch({ type: "SELECT_CATEGORY", name: null });
            }
          }}
          onBusinessSelect={(id) => {
            dispatch({ type: "SELECT_BUSINESS", id });
          }}
          onBookNow={(id) => {
            dispatch({ type: "SELECT_BUSINESS", id, scrollToMenu: true });
          }}
          onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
          onProfileClick={handleProfileClick}
          username={username}
        />
      );
    }
  } else if (state.selectedPopularServiceId !== null) {
    content = (
      <PopularServiceDetailPage
        popularServiceId={state.selectedPopularServiceId}
        onBack={() => dispatch({ type: "SELECT_POPULAR_SERVICE", id: null })}
        onBusinessSelect={(id) => dispatch({ type: "SELECT_BUSINESS", id })}
        onBookNow={(id) => dispatch({ type: "SELECT_BUSINESS", id, scrollToMenu: true })}
        onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
        onProfileClick={handleProfileClick}
        username={username}
      />
    );
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
        onBusinessSelect={(id) => {
          dispatch({ type: "SELECT_BUSINESS", id });
        }}
        onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
        onProfileClick={handleProfileClick}
        onAdvertiseClick={() => dispatch({ type: "SET_SHOW_ADVERTISE", show: true })}
        username={username}
        onShowAllCategories={() => dispatch({ type: "SET_SHOW_ALL_CATEGORIES", show: true })}
        onPopularServiceClick={(id) => dispatch({ type: "SELECT_POPULAR_SERVICE", id })}
        onLogout={() => {
          localStorage.removeItem("fmp_user_token");
          localStorage.removeItem("fmp_profile_personal:v1");
          setUsername(null);
          setUserProfile(null);
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

  // Public directory pages (business profile, articles, places, categories, advertise, employee verification) MUST ALWAYS be accessible publicly
  const isPublicRoute =
    state.verifiedEmpId !== null ||
    state.selectedBusinessId !== null ||
    state.selectedArticleId !== null ||
    state.selectedPlaceName !== null ||
    state.selectedCategoryName !== null ||
    state.selectedPopularServiceId !== null ||
    state.showAllCategoriesPage ||
    state.showAdvertise;

  if (isApk && !username && !state.showAdminPanel && !state.showClientPanel && !isPublicRoute) {
    return (
      <SignInPage
        onBack={() => {}}
        onSuccess={(name) => {
          setUsername(name);
          const savedProfile = localStorage.getItem("fmp_profile_personal:v1");
          if (savedProfile) {
            try {
              setUserProfile(JSON.parse(savedProfile));
            } catch (e) {}
          }
        }}
        isMandatory={true}
      />
    );
  }

  if (state.verifiedEmpId !== null) {
    return (
      <EmployeeVerificationPage
        initialEmpId={state.verifiedEmpId}
        onBackToHome={() => {
          dispatch({ type: "SET_VERIFIED_EMP_ID", empId: null });
          window.history.pushState(null, "", "/");
        }}
      />
    );
  }

  if (state.showAdminPanel) {
    return (
      <AdminShell
        onClose={() => {
          dispatch({ type: "SET_SHOW_ADMIN", show: false });
          window.history.pushState(null, "", "/");
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
          window.history.pushState(null, "", "/");
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
          const savedProfile = localStorage.getItem("fmp_profile_personal:v1");
          if (savedProfile) {
            try {
              setUserProfile(JSON.parse(savedProfile));
            } catch (e) {}
          }
          dispatch({ type: "SET_SHOW_SIGN_IN", show: false });
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden w-full pb-4 sm:pb-0">
      {content}

      {/* Sidebar Overlay */}
      {state.showSidebar && !isMobile && (
        <Sidebar
          onClose={() => dispatch({ type: "SET_SHOW_SIDEBAR", show: false })}
          username={username}
          onLogout={() => {
            localStorage.removeItem("fmp_user_token");
            localStorage.removeItem("fmp_profile_personal:v1");
            setUsername(null);
            setUserProfile(null);
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
          onClose={() => {
            dispatch({ type: "SET_SHOW_PROFILE_WIZARD", show: false });
            const savedProfile = localStorage.getItem("fmp_profile_personal:v1");
            if (savedProfile) {
              try {
                const parsed = JSON.parse(savedProfile);
                setUserProfile(parsed);
                setUsername(parsed.firstName || null);
              } catch (e) {}
            }
          }}
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
        <nav className={`sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border transition-transform duration-300 ease-in-out ${
          isNavVisible ? "translate-y-0" : "translate-y-full"
        }`}>
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

      {/* Real-time rating/review popup prompt */}
      {activeReviewPrompt && (
        <ReviewPromptModal
          bookingId={activeReviewPrompt.bookingId}
          businessId={activeReviewPrompt.businessId}
          businessName={activeReviewPrompt.businessName}
          service={activeReviewPrompt.service}
          onClose={() => setActiveReviewPrompt(null)}
        />
      )}

      {/* Auto Slide-Up Bottom Login Sheet (Mandatory) */}
      {showBottomLoginPrompt && !username && (
        <BottomLoginPrompt
          isOpen={showBottomLoginPrompt}
          isMandatory={true}
          onClose={() => setShowBottomLoginPrompt(false)}
          onSuccess={(name) => {
            setUsername(name);
            const savedProfile = localStorage.getItem("fmp_profile_personal:v1");
            if (savedProfile) {
              try {
                setUserProfile(JSON.parse(savedProfile));
              } catch (e) {}
            }
            setShowBottomLoginPrompt(false);
          }}
          onPrivacyPolicyClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Privacy Policy" })}
          onTermsConditionsClick={() => dispatch({ type: "SET_ACTIVE_SIDEBAR_PAGE", page: "Terms & Conditions" })}
        />
      )}
    </div>
  );
}
