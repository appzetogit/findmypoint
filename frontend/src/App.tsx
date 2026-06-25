import { useState, useEffect } from "react";
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


export default function App() {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [scrollToReview, setScrollToReview] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [activeSidebarPage, setActiveSidebarPage] = useState<string | null>(null);
  const [showAdvertise, setShowAdvertise] = useState(false);

  useEffect(() => {
    const handleAdvertiseOpen = () => setShowAdvertise(true);
    window.addEventListener("fmp-open-advertise", handleAdvertiseOpen);
    return () => window.removeEventListener("fmp-open-advertise", handleAdvertiseOpen);
  }, []);

  let content;

  if (showAdvertise) {
    content = (
      <Advertise
        onClose={() => setShowAdvertise(false)}
        username={username}
      />
    );
  } else if (selectedArticleId !== null) {
    content = (
      <ArticleDetailPage
        articleId={selectedArticleId}
        onBack={() => {
          setSelectedArticleId(null);
          setScrollToReview(false);
        }}
        onArticleSelect={(id) => {
          setSelectedPlaceName(null);
          setSelectedBusinessId(null);
          setSelectedArticleId(id);
          setScrollToReview(false);
        }}
      />
    );
  } else if (selectedBusinessId !== null) {
    content = (
      <BusinessDetailPage
        businessId={selectedBusinessId}
        onBack={() => {
          setSelectedBusinessId(null);
          setScrollToReview(false);
        }}
        onBusinessSelect={(id) => {
          setSelectedBusinessId(id);
          setScrollToReview(false);
        }}
        scrollToReview={scrollToReview}
        onSignInClick={() => setShowSignIn(true)}
        onProfileClick={() => setShowSidebar(true)}
        username={username}
      />
    );
  } else if (selectedPlaceName !== null) {
    content = (
      <PlaceDetailPage
        placeName={selectedPlaceName}
        onBack={() => setSelectedPlaceName(null)}
        onBusinessSelect={(id) => {
          setSelectedPlaceName(null);
          setSelectedBusinessId(id);
          setScrollToReview(false);
        }}
        onSignInClick={() => setShowSignIn(true)}
        onProfileClick={() => setShowSidebar(true)}
        username={username}
      />
    );
  } else if (selectedCategoryName !== null) {
    content = (
      <CategoryDetailPage
        categoryName={selectedCategoryName}
        onBack={() => setSelectedCategoryName(null)}
        onBusinessSelect={(id) => {
          setSelectedCategoryName(null);
          setSelectedBusinessId(id);
          setScrollToReview(false);
        }}
        onSignInClick={() => setShowSignIn(true)}
        onProfileClick={() => setShowSidebar(true)}
        username={username}
      />
    );
  } else {
    content = (
      <HomePage 
        onArticleClick={(id) => {
          setSelectedPlaceName(null);
          setSelectedBusinessId(null);
          setSelectedArticleId(id);
          setScrollToReview(false);
        }} 
        onReviewClick={(id) => {
          setSelectedPlaceName(null);
          setSelectedArticleId(null);
          setSelectedBusinessId(id);
          setScrollToReview(true);
        }}
        onPlaceClick={(placeName) => {
          setSelectedArticleId(null);
          setSelectedBusinessId(null);
          setSelectedPlaceName(placeName);
          setScrollToReview(false);
        }}
        onCategoryClick={(categoryName) => {
          setSelectedArticleId(null);
          setSelectedBusinessId(null);
          setSelectedPlaceName(null);
          setSelectedCategoryName(categoryName);
          setScrollToReview(false);
        }}
        onSignInClick={() => setShowSignIn(true)}
        onProfileClick={() => setShowSidebar(true)}
        onAdvertiseClick={() => setShowAdvertise(true)}
        username={username}
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      {content}
      
      {/* Sign In Overlay */}
      {showSignIn && (
        <SignInPage
          onBack={() => setShowSignIn(false)}
          onSuccess={(name) => {
            setUsername(name);
            setShowSignIn(false);
          }}
        />
      )}

      {/* Sidebar Overlay */}
      {showSidebar && (
        <Sidebar
          onClose={() => setShowSidebar(false)}
          username={username}
          onLogout={() => {
            setUsername(null);
            setShowSidebar(false);
            alert("Logged out successfully!");
          }}
          onSignInClick={() => {
            setShowSidebar(false);
            setShowSignIn(true);
          }}
          onMyProfileClick={() => {
            setShowSidebar(false);
            setShowProfileWizard(true);
          }}
          onMenuClick={(page) => {
            setShowSidebar(false);
            setActiveSidebarPage(page);
          }}
        />
      )}

      {/* Profile Wizard Overlay */}
      {showProfileWizard && (
        <ProfileWizard
          onClose={() => setShowProfileWizard(false)}
          username={username}
        />
      )}

      {/* Individual Sidebar Settings Pages */}
      {activeSidebarPage && (
        <SidebarPages
          activePage={activeSidebarPage}
          onClose={() => setActiveSidebarPage(null)}
          username={username}
        />
      )}
    </div>
  );
}


