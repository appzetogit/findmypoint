import { useState, useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  ArrowLeft,
  Sun,
  Moon,
  Lock,
  Mail,
  Tag,
  Sparkles,
  Megaphone,
  User,
  LogOut,
  Compass,
  Info,
  Sliders,
  Scale,
  HelpCircle,
  Image as ImageIcon,
  Calendar,
  CreditCard,
  MessageSquare,
  Percent,
  Send,
  Wallet,
  Briefcase,
} from "lucide-react";
import Dashboard from "./Dashboard";
import AdminEntryForm from "./AdminEntryForm";
import AddCategoryForm from "./AddCategoryForm";
import AddSubcategoryForm from "./AddSubcategoryForm";
import AdvertiseRequests from "./AdvertiseRequests";
import AdminProfileSettings from "./AdminProfileSettings";
import BusinessListings from "./BusinessListings";
import AddTouristPlaceForm from "./AddTouristPlaceForm";
import UsersManagement from "./UsersManagement";
import AboutManagement from "./AboutManagement";
import FooterManagement from "./FooterManagement";
import BannerManagement from "./BannerManagement";
import EmployeeManagement from "./EmployeeManagement";
import PrivacyPolicyManagement from "./PrivacyPolicyManagement";
import TermsConditionsManagement from "./TermsConditionsManagement";
import HelpCenterManagement from "./HelpCenterManagement";
import AllBookings from "./AllBookings";
import AdminPaymentManagement from "./AdminPaymentManagement";
import AllEnquiries from "./AllEnquiries";
import AllClientDashboard from "./AllClientDashboard";
import BusinessCommission from "./BusinessCommission";
import AdminWithdrawals from "./AdminWithdrawals";
import AdminBusinessWallets from "./AdminBusinessWallets";
import BusinessRequests from "./BusinessRequests";
import logoImg from "../assets/logo.png";

interface AdminShellProps {
  onClose: () => void;
  username: string | null;
}

export type AdminView =
  | "dashboard"
  | "add"
  | "edit"
  | "add_category"
  | "add_subcategory"
  | "advertise_requests"
  | "profile_settings"
  | "listings"
  | "tourist_places"
  | "users"
  | "about"
  | "footer"
  | "banner_management"
  | "employee_management"
  | "privacy_policy"
  | "terms_conditions"
  | "help_center"
  | "bookings"
  | "payments"
  | "all_enquiries"
  | "all_client_dashboard"
  | "commissions"
  | "admin_withdrawals"
  | "business_wallets"
  | "business_requests";

export default function AdminShell({ onClose, username }: AdminShellProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState("admin@fmp.com");
  const [passwordInput, setPasswordInput] = useState("admin");
  const [loginError, setLoginError] = useState("");

  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<"admin" | "client">("admin");

  const [adminProfile, setAdminProfile] = useState({
    username: "Guest Root",
    email: "admin@fmp.com",
    role: "System Administrator",
  });

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("fmp_admin_profile:v1");
    if (saved) {
      try {
        setAdminProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Simple state for local dark mode toggle
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (typeof window !== "undefined") {
      if (nextMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    let correctEmail = "admin@fmp.com";
    let correctPassword = "admin";

    const savedProfile = localStorage.getItem("fmp_admin_profile:v1");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.email) correctEmail = parsed.email.trim().toLowerCase();
      } catch (err) {}
    }

    const savedPassword = localStorage.getItem("fmp_admin_password:v1");
    if (savedPassword) {
      correctPassword = savedPassword;
    }

    if (emailInput.trim().toLowerCase() === correctEmail && passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError(`Invalid email or password. Use: ${correctEmail} / ${correctPassword}`);
    }
  };

  const handleEditBusiness = (id: string) => {
    setEditingBusinessId(id);
    setCurrentView("edit");
  };

  const handleAddNew = () => {
    setEditingBusinessId(null);
    setCurrentView("add");
  };

  const handleViewChange = (view: AdminView) => {
    if (view !== "edit") {
      setEditingBusinessId(null);
    }
    setCurrentView(view);
  };

  // 1. Unauthenticated Login Gate View
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen font-sans flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 w-full relative overflow-hidden`}
      >
        {/* Floating background blur effects */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            {isDarkMode ? (
              <div className="bg-white px-5 py-2 rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-slate-200/40">
                <img
                  src={logoImg}
                  alt="FindMyPoint Logo"
                  className="h-8 w-auto object-contain animate-fade-in shrink-0"
                />
              </div>
            ) : (
              <img
                src={logoImg}
                alt="FindMyPoint Logo"
                className="h-10 w-auto object-contain mb-5 animate-fade-in shrink-0"
                style={{ mixBlendMode: "multiply" }}
              />
            )}
            <h2 className="font-serif text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[280px]">
              Access the FindmyPoint admin database. Please sign in with your credentials.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-4 text-left">
            {loginError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/45 text-rose-600 dark:text-rose-450 p-3 rounded-xl text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="adminEmail"
                className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  id="adminEmail"
                  type="email"
                  required
                  placeholder="admin@fmp.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="adminPassword"
                className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  id="adminPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Quick Demo Hint */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3 text-[11.5px] text-slate-500 dark:text-slate-400 text-center font-semibold">
              Demo Credentials:
              <br />
              Email:{" "}
              <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                admin@fmp.com
              </span>{" "}
              & Password:{" "}
              <span className="text-slate-800 dark:text-slate-200 font-extrabold">admin</span>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.99] transition duration-200 cursor-pointer text-center text-sm flex items-center justify-center gap-2"
            >
              <Shield className="h-4.5 w-4.5" />
              <span>Verify & Enter Dashboard</span>
            </button>
          </form>

          {/* Footer Back actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Dashboard Layout
  return (
    <div
      className={`h-screen overflow-hidden font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300 w-full`}
    >
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-68 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between pt-3.5 px-5 pb-5 md:h-screen overflow-y-auto no-scrollbar shrink-0 shadow-2xl border-r border-slate-800/40 relative">
        <div>
          {/* Admin Header */}
          <div className="flex flex-col items-center pt-0.5 pb-2.5 border-b border-slate-800/60 mb-4 text-center w-full">
            <div className="bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center border border-slate-200/50 max-w-[150px]">
              <img src={logoImg} alt="FindMyPoint Logo" className="h-4.5 w-auto object-contain" />
            </div>
          </div>

          {/* Nav Items */}
          <div className="space-y-4">
            {adminTab === "admin" ? (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                  Core Database
                </div>
                <nav className="space-y-2">
                  <button
                    onClick={() => handleViewChange("dashboard")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "dashboard"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "dashboard" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <LayoutDashboard
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "dashboard" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Dashboard Overview</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("users")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "users"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "users" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <User
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "users" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Users</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("add_category")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "add_category"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "add_category" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Tag
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "add_category" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Add Category</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("add_subcategory")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "add_subcategory"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "add_subcategory" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Sparkles
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "add_subcategory" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Add Subcategory</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("advertise_requests")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "advertise_requests"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "advertise_requests" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Megaphone
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "advertise_requests" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Advertise Requests</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("tourist_places")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "tourist_places"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "tourist_places" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Compass
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "tourist_places" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Tourist Places</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("about")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "about"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "about" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Info
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "about" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>About FindmyPoint</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("footer")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "footer"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "footer" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Sliders
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "footer" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Footer Management</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("banner_management")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "banner_management"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "banner_management" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <ImageIcon
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "banner_management" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Banner Management</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("employee_management")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "employee_management"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "employee_management" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Briefcase
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "employee_management" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Employee Management</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("privacy_policy")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "privacy_policy"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "privacy_policy" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Shield
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "privacy_policy" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Privacy Policy</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("terms_conditions")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "terms_conditions"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "terms_conditions" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Scale
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "terms_conditions" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Terms & Conditions</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("help_center")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "help_center"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-855 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "help_center" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <HelpCircle
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "help_center" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Help Center Management</span>
                  </button>
                </nav>
              </>
            ) : (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                  Business Directory
                </div>
                <nav className="space-y-2">
                  <button
                    onClick={() => handleViewChange("all_client_dashboard")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "all_client_dashboard"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "all_client_dashboard" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <LayoutDashboard
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "all_client_dashboard" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>All Client Dashboard</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("listings")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "listings" || currentView === "add" || currentView === "edit"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {(currentView === "listings" ||
                      currentView === "add" ||
                      currentView === "edit") && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <PlusCircle
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "listings" || currentView === "add" || currentView === "edit" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Register Business</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("bookings")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "bookings"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "bookings" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Calendar
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "bookings" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>All Bookings</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("payments")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "payments"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "payments" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <CreditCard
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "payments" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Admin Payment Management</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("all_enquiries")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "all_enquiries"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "all_enquiries" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <MessageSquare
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "all_enquiries" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>All Enquiries</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("commissions")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "commissions"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "commissions" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Percent
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "commissions" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Business Commission</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("admin_withdrawals")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "admin_withdrawals"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "admin_withdrawals" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Send
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "admin_withdrawals" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Withdrawal Requests</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("business_requests")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "business_requests"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "business_requests" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <ImageIcon
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "business_requests" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Business Requests</span>
                  </button>

                  <button
                    onClick={() => handleViewChange("business_wallets")}
                    className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                      currentView === "business_wallets"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                    }`}
                  >
                    {currentView === "business_wallets" && (
                      <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                    )}
                    <Wallet
                      className={`h-4.5 w-4.5 transition-colors ${currentView === "business_wallets" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                    />
                    <span>Business Wallet</span>
                  </button>
                </nav>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Right Column (Header + Main Area) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0c1322] border-b border-slate-800/80 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-sm text-white">
          {/* Left: Section Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => {
                setAdminTab("admin");
                handleViewChange("dashboard");
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                adminTab === "admin"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-450 hover:text-white bg-transparent"
              }`}
            >
              Admin Panel
            </button>
            <button
              onClick={() => {
                setAdminTab("client");
                handleViewChange("listings");
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                adminTab === "client"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-450 hover:text-white bg-transparent"
              }`}
            >
              Admin Client Panel
            </button>
          </div>

          {/* Right: User profile options */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white transition-colors cursor-pointer border border-slate-700/80 shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-white leading-tight">
                {adminProfile.username}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                {adminProfile.role}
              </span>
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={() => handleViewChange("profile_settings")}
              className={`h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-[0.98] transition cursor-pointer border ${
                currentView === "profile_settings"
                  ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 border-transparent"
                  : "border-slate-200/20 dark:border-slate-800"
              }`}
              title="Admin Profile Settings"
            >
              {adminProfile.username.substring(0, 2).toUpperCase()}
            </button>

            {/* Logout Button (Red color) */}
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentView("dashboard");
              }}
              className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-450 transition-colors cursor-pointer shadow-sm"
              title="Logout Admin Session"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto no-scrollbar">
          {currentView === "dashboard" && <Dashboard />}

          {currentView === "users" && <UsersManagement />}

          {(currentView === "add" || currentView === "edit") && (
            <AdminEntryForm
              businessId={editingBusinessId}
              onCancel={() => handleViewChange("listings")}
              onSuccess={() => handleViewChange("listings")}
            />
          )}

          {currentView === "listings" && (
            <BusinessListings
              onAddNew={handleAddNew}
              onEditBusiness={handleEditBusiness}
              onClosePortal={onClose}
            />
          )}

          {currentView === "add_category" && (
            <AddCategoryForm
              onCancel={() => handleViewChange("dashboard")}
              onSuccess={() => handleViewChange("dashboard")}
            />
          )}

          {currentView === "add_subcategory" && (
            <AddSubcategoryForm
              onCancel={() => handleViewChange("dashboard")}
              onSuccess={() => handleViewChange("dashboard")}
            />
          )}

          {currentView === "advertise_requests" && (
            <AdvertiseRequests onCancel={() => handleViewChange("dashboard")} />
          )}

          {currentView === "tourist_places" && (
            <AddTouristPlaceForm onCancel={() => handleViewChange("dashboard")} />
          )}

          {currentView === "about" && <AboutManagement />}

          {currentView === "footer" && <FooterManagement />}

          {currentView === "banner_management" && <BannerManagement />}

          {currentView === "employee_management" && <EmployeeManagement />}

          {currentView === "privacy_policy" && <PrivacyPolicyManagement />}

          {currentView === "terms_conditions" && <TermsConditionsManagement />}

          {currentView === "help_center" && <HelpCenterManagement />}

          {currentView === "bookings" && <AllBookings />}

          {currentView === "payments" && <AdminPaymentManagement />}

          {currentView === "all_enquiries" && <AllEnquiries />}

          {currentView === "all_client_dashboard" && <AllClientDashboard />}

          {currentView === "commissions" && <BusinessCommission />}

          {currentView === "admin_withdrawals" && <AdminWithdrawals />}

          {currentView === "business_requests" && <BusinessRequests />}

          {currentView === "business_wallets" && <AdminBusinessWallets />}

          {currentView === "profile_settings" && (
            <AdminProfileSettings
              onCancel={() => handleViewChange("dashboard")}
              onUpdate={(updated) => setAdminProfile(updated)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
