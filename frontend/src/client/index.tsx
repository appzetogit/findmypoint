import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Building,
  LogOut,
  Sun,
  Moon,
  Settings,
  ClipboardList,
  Calendar,
  MessageSquare,
  Star,
  HelpCircle,
  CreditCard,
  PlusCircle
} from "lucide-react";
import logoImg from "../assets/logo.png";
import { businessesData, BusinessListingData } from "../data/businessesData";
import AdminEntryForm from "../admin/AdminEntryForm";
import Dashboard from "./Dashboard";
import MyBusinesses from "./MyBusinesses";
import ProfileSettings from "./ProfileSettings";
import Login from "./Login";
import ServiceForm from "./ServiceForm";
import Bookings from "./Bookings";
import Enquiries from "./Enquiries";
import Reviews from "./Reviews";
import FAQManagement from "./FAQManagement";
import PaymentManagement from "./PaymentManagement";
import AddProduct from "./AddProduct";

interface ClientShellProps {
  onClose: () => void;
  username: string | null;
}

export type ClientView =
  | "overview"
  | "listings"
  | "bookings"
  | "payments"
  | "enquiries"
  | "add"
  | "edit"
  | "settings"
  | "serviceform"
  | "addproduct"
  | "reviews"
  | "faq";

interface ClientSession {
  email: string;
  name: string;
  phone: string;
}

export default function ClientShell({ onClose }: ClientShellProps) {
  // Session State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<ClientSession | null>(null);

  // View States
  const [currentView, setCurrentView] = useState<ClientView>("overview");
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");



  // Dark Mode State
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

  useEffect(() => {
    const saved = localStorage.getItem("fmp_client_session:v1");
    if (saved) {
      try {
        const parsed: ClientSession = JSON.parse(saved);
        setSession(parsed);
        setIsAuthenticated(true);
      } catch (e) {}
    }
  }, []);

  const saveSession = (newSession: ClientSession) => {
    localStorage.setItem("fmp_client_session:v1", JSON.stringify(newSession));
    setSession(newSession);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("fmp_client_session:v1");
    setSession(null);
    setIsAuthenticated(false);
    setCurrentView("overview");
  };

  // Helper to load current businesses matching the client
  const [allListings, setAllListings] = useState<BusinessListingData[]>(businessesData);
  
  const loadBusinesses = () => {
    setAllListings([...businessesData]);
  };

  useEffect(() => {
    loadBusinesses();
    const handleStorage = () => {
      loadBusinesses();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Filter listings belonging to this client
  const clientListings = useMemo(() => {
    if (!session) return [];
    
    const matched = allListings.filter((b) => {
      const matchesEmail = b.email?.trim().toLowerCase() === session.email.toLowerCase();
      const matchesPhone = b.phone?.replace(/[\s+-]/g, "").includes(session.phone.replace(/[\s+-]/g, "")) || 
                            b.phone?.includes(session.phone);
      return matchesEmail || matchesPhone;
    });

    if (session.email === "client@fmp.com" && matched.length === 0) {
      const vishal = allListings.find(b => b.id === "vishal-mega-mart");
      if (vishal) {
        return [vishal];
      }
    }

    return matched;
  }, [allListings, session]);

  // Filter listings matching search input
  const filteredListings = useMemo(() => {
    return clientListings.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [clientListings, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const totalListings = clientListings.length;
    const totalReviews = clientListings.reduce((sum, item) => sum + (item.reviewCount || 0), 0);
    const avgRating = totalListings > 0
      ? Number((clientListings.reduce((sum, item) => sum + (item.rating || 0), 0) / totalListings).toFixed(1))
      : 0.0;

    return { totalListings, totalReviews, avgRating };
  }, [clientListings]);

  const allBookingsDisabled = useMemo(() => {
    return clientListings.length > 0 && clientListings.every((b) => b.isBookingDisabled);
  }, [clientListings]);

  useEffect(() => {
    if (allBookingsDisabled) {
      if (currentView === "bookings" || currentView === "payments" || currentView === "serviceform") {
        setCurrentView("overview");
      }
    }
  }, [allBookingsDisabled, currentView]);

  const handleEditBusiness = (id: string) => {
    setEditingBusinessId(id);
    setCurrentView("edit");
  };

  const handleViewListing = (id: string) => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("fmp-select-business", { detail: id }));
    }, 50);
  };

  // 1. Unauthenticated view (Client Login Form)
  if (!isAuthenticated || !session) {
    return (
      <Login
        onLoginSuccess={saveSession}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  // 2. Authenticated Dashboard Layout
  return (
    <div className={`h-screen overflow-hidden font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300 w-full`}>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-68 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between pt-3.5 px-5 pb-5 md:h-screen overflow-y-auto no-scrollbar shrink-0 shadow-2xl border-r border-slate-800/40 relative">
        <div>
          {/* Logo Header */}
          <div className="flex flex-col items-center pt-0.5 pb-2.5 border-b border-slate-800/60 mb-6 text-center w-full">
            <div className="bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center border border-slate-200/50 max-w-[150px]">
              <img src={logoImg} alt="FindMyPoint Logo" className="h-4.5 w-auto object-contain" />
            </div>
            <div className="text-[10px] font-black tracking-widest text-indigo-400 mt-2 uppercase">Client Panel</div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4 font-semibold">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
              Navigation
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setCurrentView("overview");
                }}
                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                  currentView === "overview"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                }`}
              >
                {currentView === "overview" && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                )}
                <LayoutDashboard
                  className={`h-4.5 w-4.5 transition-colors ${currentView === "overview" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                />
                <span>Overview Stats</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView("listings");
                }}
                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                  currentView === "listings"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                }`}
              >
                {currentView === "listings" && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                )}
                <Building
                  className={`h-4.5 w-4.5 transition-colors ${currentView === "listings" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                />
                <span>My Businesses</span>
              </button>

              {!allBookingsDisabled && (
                <button
                  onClick={() => {
                    setCurrentView("bookings");
                  }}
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
                  <span>Bookings</span>
                </button>
              )}

              {!allBookingsDisabled && (
                <button
                  onClick={() => {
                    setCurrentView("payments");
                  }}
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
                  <span>Payment Management</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentView("enquiries");
                }}
                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                  currentView === "enquiries"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                }`}
              >
                {currentView === "enquiries" && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                )}
                <MessageSquare
                  className={`h-4.5 w-4.5 transition-colors ${currentView === "enquiries" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                />
                <span>Enquiries</span>
              </button>

              {!allBookingsDisabled && (
                <button
                  onClick={() => {
                    setCurrentView("serviceform");
                  }}
                  className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                    currentView === "serviceform"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                      : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                  }`}
                >
                  {currentView === "serviceform" && (
                    <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                  )}
                  <ClipboardList
                    className={`h-4.5 w-4.5 transition-colors ${currentView === "serviceform" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                  />
                  <span>Service Form</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentView("addproduct");
                }}
                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                  currentView === "addproduct"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                }`}
              >
                {currentView === "addproduct" && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                )}
                <PlusCircle
                  className={`h-4.5 w-4.5 transition-colors ${currentView === "addproduct" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                />
                <span>Add Product</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView("reviews");
                }}
                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                  currentView === "reviews"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                }`}
              >
                {currentView === "reviews" && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                )}
                <Star
                  className={`h-4.5 w-4.5 transition-colors ${currentView === "reviews" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                />
                <span>Reviews & Ratings</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView("faq");
                }}
                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                  currentView === "faq"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                }`}
              >
                {currentView === "faq" && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                )}
                <HelpCircle
                  className={`h-4.5 w-4.5 transition-colors ${currentView === "faq" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                />
                <span>FAQ Management</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView("settings");
                }}
                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-left border ${
                  currentView === "settings"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/20 translate-x-1"
                    : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-850 border-transparent hover:translate-x-1"
                }`}
              >
                {currentView === "settings" && (
                  <span className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-white rounded-r-md" />
                )}
                <Settings
                  className={`h-4.5 w-4.5 transition-colors ${currentView === "settings" ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                />
                <span>Profile Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/60 mt-auto flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-900/30 hover:border-rose-900/50 bg-rose-950/10 hover:bg-rose-950/20 text-rose-400 text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Right Content Space */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0c1322] border-b border-slate-800/80 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-sm text-white">
          <h2 className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>Welcome,</span>
            <span className="text-indigo-400">{session.name}</span>
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white transition-colors cursor-pointer border border-slate-750"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </header>

        {/* Dashboard Main Area */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto overflow-y-auto no-scrollbar">
          {currentView === "overview" && (
            <Dashboard stats={stats} />
          )}

          {currentView === "listings" && (
            <MyBusinesses
              filteredListings={filteredListings}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onViewListing={handleViewListing}
              onEditListing={handleEditBusiness}
            />
          )}

          {currentView === "bookings" && (
            <Bookings clientListings={clientListings} />
          )}

          {currentView === "payments" && (
            <PaymentManagement clientListings={clientListings} />
          )}

          {currentView === "enquiries" && (
            <Enquiries clientListings={clientListings} />
          )}

          {currentView === "serviceform" && (
            <ServiceForm clientListings={clientListings} />
          )}

          {currentView === "addproduct" && (
            <AddProduct clientListings={clientListings} />
          )}

          {currentView === "reviews" && (
            <Reviews clientListings={clientListings} />
          )}

          {currentView === "faq" && (
            <FAQManagement clientListings={clientListings} />
          )}

          {currentView === "edit" && (
            <div className="animate-fade-in-up">
              <AdminEntryForm
                businessId={editingBusinessId}
                onCancel={() => {
                  setCurrentView("listings");
                }}
                onSuccess={() => {
                  setCurrentView("listings");
                  loadBusinesses();
                }}
              />
            </div>
          )}

          {currentView === "settings" && (
            <ProfileSettings
              session={session}
              onProfileUpdate={(updatedSession) => {
                setSession(updatedSession);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
