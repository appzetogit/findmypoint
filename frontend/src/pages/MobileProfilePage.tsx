import { useState, useEffect, useRef } from "react";
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
  BadgeCheck,
  Trash2,
  LogIn,
  Sparkles,
  Camera,
} from "lucide-react";
import { API_BASE_URL } from "../config";

interface MobileProfilePageProps {
  username?: string | null;
  userProfile?: {
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile1?: string;
    dobYYYY?: string;
    avatar?: string;
  } | null;
  onSignInClick?: () => void;
  onLogout?: () => void;
  onEditProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onHelpClick?: () => void;
  onMyReviewsClick?: () => void;
  onSavedBusinessesClick?: () => void;
  onPrivacyPolicyClick?: () => void;
  onTermsConditionsClick?: () => void;
  onProfileUpdate?: (profile: any) => void;
}

const MENU_SECTIONS = [
  {
    title: "Account",
    items: [
      { icon: Edit2, label: "Edit Profile", sub: "Update personal details", requiresAuth: true },
      { icon: Bell, label: "Notifications", sub: "Manage alerts & updates", requiresAuth: true },
    ],
  },
  {
    title: "Activity",
    items: [
      { icon: Heart, label: "Saved Businesses", sub: "View saved places", requiresAuth: true },
      { icon: Star, label: "My Reviews", sub: "Manage your ratings & reviews", requiresAuth: true },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & Support", sub: "FAQs, contact us", requiresAuth: false },
      { icon: ShieldCheck, label: "Privacy Policy", sub: "View our privacy policy", requiresAuth: false },
      { icon: BookOpen, label: "Terms & Conditions", sub: "View our terms of service", requiresAuth: false },
    ],
  },
];

export default function MobileProfilePage({
  username,
  userProfile,
  onSignInClick,
  onLogout,
  onEditProfileClick,
  onNotificationsClick,
  onHelpClick,
  onMyReviewsClick,
  onSavedBusinessesClick,
  onPrivacyPolicyClick,
  onTermsConditionsClick,
  onProfileUpdate,
}: MobileProfilePageProps) {
  const isLoggedIn = !!username;
  const displayName = userProfile
    ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || username || "User"
    : (username || "Guest User");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile avatar state (from userProfile prop or localStorage fallback)
  const [avatar, setAvatar] = useState<string | null>(() => {
    if (userProfile?.avatar) return userProfile.avatar;
    try {
      const saved = localStorage.getItem("fmp_profile_personal:v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.avatar || null;
      }
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    if (userProfile?.avatar) {
      setAvatar(userProfile.avatar);
    } else {
      try {
        const saved = localStorage.getItem("fmp_profile_personal:v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.avatar) setAvatar(parsed.avatar);
        }
      } catch (e) {}
    }
  }, [userProfile?.avatar, username]);

  // Handle direct photo upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAvatar(base64);

      // Save to localStorage
      try {
        const saved = localStorage.getItem("fmp_profile_personal:v1");
        const current = saved ? JSON.parse(saved) : {};
        const updated = { ...current, ...userProfile, avatar: base64 };
        localStorage.setItem("fmp_profile_personal:v1", JSON.stringify(updated));
        onProfileUpdate?.(updated);
      } catch (err) {}

      // Save to backend if token exists
      const token = localStorage.getItem("fmp_user_token");
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatar: base64 }),
          });
        } catch (err) {
          console.error("Failed to update profile photo on server:", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-[calc(100vh-78px)] h-[calc(100dvh-78px)] flex flex-col overflow-hidden bg-background text-foreground">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Profile / Guest Card */}
        {isLoggedIn ? (
          <div className="mx-4 mt-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Avatar Photo / Initial with Camera Upload */}
              <div className="relative shrink-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-md overflow-hidden cursor-pointer border border-border/80 group"
                  title="Click to upload profile photo"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-primary-foreground font-serif text-2xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Camera upload badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-primary shadow-md flex items-center justify-center border border-border hover:scale-110 active:scale-95 transition cursor-pointer"
                  title="Upload / Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold text-foreground truncate">{displayName}</p>
                  <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {userProfile?.email || "No email address"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">
                    Madhya Pradesh, India
                  </span>
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
                  <p className="text-xs font-semibold text-foreground truncate">
                    {userProfile?.mobile1 ? "+91 " + userProfile.mobile1 : "Registered"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                  <p className="text-xs font-semibold text-emerald-600">
                    Active Member
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-4 relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold mb-1.5">
                  <Sparkles className="h-3 w-3" />
                  <span>Welcome to FindMyPoint</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">Sign In to Your Account</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Access your personalized bookings, reviews, saved places and exclusive local deals.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSignInClick?.()}
              className="mt-4 w-full py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Login / Register with OTP</span>
            </button>
          </div>
        )}

        {/* Menu Sections */}
        <div className="px-4 mt-4">
          <div className="divide-y divide-border/50 bg-card rounded-2xl border border-border px-4 py-1">
            {MENU_SECTIONS.flatMap((section) => section.items).map(({ icon: Icon, label, sub, requiresAuth }) => (
              <div key={label} className="w-full">
                <button
                  onClick={() => {
                    if (requiresAuth && !isLoggedIn) {
                      onSignInClick?.();
                      return;
                    }
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
                  className="w-full flex items-center gap-3 py-3 transition cursor-pointer text-left hover:bg-secondary/20 rounded-xl"
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

          {/* Log Out / Delete Account (Only for logged in users) */}
          {isLoggedIn && (
            <div className="mt-4 bg-card rounded-2xl border border-border px-4 divide-y divide-border/30">
              <button
                className="w-full flex items-center gap-3 py-3.5 transition cursor-pointer text-left hover:bg-rose-50/50"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                  <LogOut className="h-4 w-4 text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-rose-600">Log Out</p>
                </div>
              </button>

              <button
                className="w-full flex items-center gap-3 py-3.5 transition cursor-pointer text-left hover:bg-red-50/50"
                onClick={() => {
                  const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is permanent.");
                  if (confirmDelete) {
                    alert("Account deletion request submitted.");
                    onLogout?.();
                  }
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-600">Delete Account</p>
                </div>
              </button>
            </div>
          )}
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
