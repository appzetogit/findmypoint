import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  CalendarDays,
  Edit2,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Bell,
  Heart,
  HelpCircle,
  BookOpen,
  Settings,
  BadgeCheck,
  Trash2,
} from "lucide-react";

interface MobileProfilePageProps {
  username?: string | null;
  onSignInClick?: () => void;
  onLogout?: () => void;
  onEditProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onHelpClick?: () => void;
  onMyReviewsClick?: () => void;
  onSavedBusinessesClick?: () => void;
  onPrivacyPolicyClick?: () => void;
  onTermsConditionsClick?: () => void;
}

const MOCK_USER = {
  name: "Rahul Sharma",
  email: "rahul.sharma@gmail.com",
  phone: "+91 98765 43210",
  city: "Ujjain, Madhya Pradesh",
  memberSince: "January 2025",
  totalBookings: 12,
  reviews: 5,
  savedBusinesses: 8,
};

const MENU_SECTIONS = [
  {
    title: "Account",
    items: [
      { icon: Edit2, label: "Edit Profile", sub: "Update personal details" },
      { icon: Bell, label: "Notifications", sub: "Manage alerts & updates" },
    ],
  },
  {
    title: "Activity",
    items: [
      { icon: Heart, label: "Saved Businesses", sub: `${MOCK_USER.savedBusinesses} saved` },
      { icon: Star, label: "My Reviews", sub: `${MOCK_USER.reviews} reviews posted` },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & Support", sub: "FAQs, contact us" },
      { icon: ShieldCheck, label: "Privacy Policy", sub: "View our privacy policy" },
      { icon: BookOpen, label: "Terms & Conditions", sub: "View our terms of service" },
    ],
  },
];

export default function MobileProfilePage({
  username,
  onSignInClick,
  onLogout,
  onEditProfileClick,
  onNotificationsClick,
  onHelpClick,
  onMyReviewsClick,
  onSavedBusinessesClick,
  onPrivacyPolicyClick,
  onTermsConditionsClick,
}: MobileProfilePageProps) {
  const isLoggedIn = !!username;
  const displayName = username || MOCK_USER.name;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="h-[calc(100vh-64px)] h-[calc(100dvh-64px)] flex flex-col overflow-hidden bg-background text-foreground">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-0">
        {/* Profile Card */}
        <div className="mx-4 mt-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-md">
            <span className="text-primary-foreground font-serif text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-base font-bold text-foreground truncate">{displayName}</p>
              {isLoggedIn && (
                <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{MOCK_USER.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">{MOCK_USER.city}</span>
            </div>
          </div>
        </div>

        {/* Contact row */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Phone</p>
              <p className="text-xs font-semibold text-foreground">{MOCK_USER.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Member Since</p>
              <p className="text-xs font-semibold text-foreground">{MOCK_USER.memberSince}</p>
            </div>
          </div>
        </div>
      </div>



      {/* Menu Sections */}
      <div className="px-4 mt-3">
        <div className="divide-y divide-border/50">
          {MENU_SECTIONS.flatMap((section) => section.items).map(({ icon: Icon, label, sub }) => (
            <div key={label} className="w-full">
              <button
                onClick={() => {
                  if (label === "Edit Profile" && onEditProfileClick) {
                    onEditProfileClick();
                  } else if (label === "Notifications" && onNotificationsClick) {
                    onNotificationsClick();
                  } else if (label === "Help & Support" && onHelpClick) {
                    onHelpClick();
                  } else if (label === "My Reviews" && onMyReviewsClick) {
                    onMyReviewsClick();
                  } else if (label === "Saved Businesses" && onSavedBusinessesClick) {
                    onSavedBusinessesClick();
                  } else if (label === "Privacy Policy" && onPrivacyPolicyClick) {
                    onPrivacyPolicyClick();
                  } else if (label === "Terms & Conditions" && onTermsConditionsClick) {
                    onTermsConditionsClick();
                  }
                }}
                className="w-full flex items-center gap-3 py-3 transition cursor-pointer text-left hover:bg-secondary/20"
              >
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              </button>
            </div>
          ))}
        </div>

        {/* Sign In / Log Out / Delete Account */}
        <div className="border-t border-border/50 mb-0">
            <button
              className="w-full flex items-center gap-3 py-3 transition cursor-pointer text-left hover:bg-rose-50/50"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <LogOut className="h-4 w-4 text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-600">Log Out</p>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-3 py-3 border-t border-border/30 transition cursor-pointer text-left hover:bg-red-50/50"
              onClick={() => {
                const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is permanent.");
                if (confirmDelete) {
                  alert("Account deletion request submitted.");
                  onLogout?.();
                }
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-600">Delete Account</p>
              </div>
            </button>
        </div>
      </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-24">
          <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-7 w-7 text-rose-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Log Out?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to log out of your account?
              </p>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                  if (onSignInClick) onSignInClick();
                }}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition cursor-pointer"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
