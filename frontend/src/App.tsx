import { useState, useEffect, useReducer } from "react";
import HomePage from "./pages/Home";
import ArticleDetailPage from "./pages/ArticleDetail";
import BusinessDetailPage from "./pages/BusinessDetail";
import PlaceDetailPage from "./pages/PlaceDetail";
import CategoryDetailPage from "./pages/CategoryDetail";
import SignInPage from "./pages/SignIn";
import Sidebar from "./components/Sidebar";
import ProfileWizard from "./pages/ProfileWizard";
import SidebarPages from "./components/SidebarPages";
import Advertise from "./pages/Advertise";

interface AppViewState {
  selectedArticleId: number | null;
  selectedBusinessId: string | null;
  selectedPlaceName: string | null;
  selectedCategoryName: string | null;
  selectedSubcategoryName: string | null;
  showSignIn: boolean;
  showSidebar: boolean;
  scrollToReview: boolean;
  showProfileWizard: boolean;
  activeSidebarPage: string | null;
  showAdvertise: boolean;
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
  showProfileWizard: false,
  activeSidebarPage: null,
  showAdvertise: false,
};

type AppAction =
  | { type: "SET_SHOW_SIGN_IN"; show: boolean }
  | { type: "SET_SHOW_SIDEBAR"; show: boolean }
  | { type: "SET_SHOW_PROFILE_WIZARD"; show: boolean }
  | { type: "SET_ACTIVE_SIDEBAR_PAGE"; page: string | null }
  | { type: "SET_SHOW_ADVERTISE"; show: boolean }
  | { type: "SELECT_ARTICLE"; id: number | null }
  | { type: "SELECT_BUSINESS"; id: string | null; scrollToReview?: boolean }
  | { type: "SELECT_PLACE"; name: string | null }
  | { type: "SELECT_CATEGORY"; name: string | null; subcategoryName?: string | null }
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
    default:
      return state;
  }
}

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    const handleAdvertiseOpen = () => dispatch({ type: "SET_SHOW_ADVERTISE", show: true });
    window.addEventListener("fmp-open-advertise", handleAdvertiseOpen);
    return () => window.removeEventListener("fmp-open-advertise", handleAdvertiseOpen);
  }, []);

  let content;

  if (state.showAdvertise) {
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
    content = (
      <CategoryDetailPage
        categoryName={state.selectedCategoryName}
        initialSubcategory={state.selectedSubcategoryName}
        onBack={() => dispatch({ type: "SELECT_CATEGORY", name: null })}
        onBusinessSelect={(id) => {
          dispatch({ type: "SELECT_BUSINESS", id });
        }}
        onSignInClick={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: true })}
        onProfileClick={() => dispatch({ type: "SET_SHOW_SIDEBAR", show: true })}
        username={username}
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
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden w-full">
      {content}
      
      {/* Sign In Overlay */}
      {state.showSignIn && (
        <SignInPage
          onBack={() => dispatch({ type: "SET_SHOW_SIGN_IN", show: false })}
          onSuccess={(name) => {
            setUsername(name);
            dispatch({ type: "SET_SHOW_SIGN_IN", show: false });
          }}
        />
      )}

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
        />
      )}
    </div>
  );
}


