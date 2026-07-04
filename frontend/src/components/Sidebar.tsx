import { useState, useEffect, useMemo } from "react";
import {
  X,
  Heart,
  Bookmark,
  User,
  Receipt,
  Bell,
  Headphones,
  Shield,
  MessageSquare,
  Handshake,
  LogOut,
  LogIn,
} from "lucide-react";

interface SidebarProps {
  onClose: () => void;
  username: string | null;
  onLogout: () => void;
  onSignInClick: () => void;
  onMyProfileClick?: () => void;
  onMenuClick?: (page: string) => void;
}

export default function Sidebar({
  onClose,
  username,
  onLogout,
  onSignInClick,
  onMyProfileClick,
  onMenuClick,
}: SidebarProps) {
  const isGuest = !username;
  const userInitial = username ? username.charAt(0).toUpperCase() : "G";
  const displayName = username || "Guest User";

  const avatarUrl = useMemo(() => {
    if (!username) return null;
    try {
      const savedPersonal = localStorage.getItem("fmp_profile_personal:v1");
      if (savedPersonal) {
        const parsed = JSON.parse(savedPersonal);
        return parsed.avatar || null;
      }
    } catch (e) {
      console.error("Failed to load profile data from local storage", e);
    }
    return null;
  }, [username]);

  const handleProfileClick = () => {
    if (isGuest) {
      onSignInClick();
    } else {
      onMyProfileClick?.();
    }
    onClose();
  };

  const handleItemClick = (label: string, action?: () => void) => {
    if (isGuest && label !== "Help" && label !== "Policy") {
      onSignInClick();
      onClose();
      return;
    }
    if (action) {
      action();
    } else {
      alert(`Navigating to ${label}...`);
    }
  };

  const handleAuthAction = () => {
    if (isGuest) {
      onSignInClick();
    } else {
      onLogout();
    }
    onClose();
  };

  const group1 = [
    {
      label: "Favorites",
      icon: Heart,
      action: () => {
        onMenuClick?.("Favorites");
        onClose();
      },
    },
    {
      label: "Saved",
      icon: Bookmark,
      action: () => {
        onMenuClick?.("Saved");
        onClose();
      },
    },
    { label: "Edit Profile", icon: User, action: onMyProfileClick },
    {
      label: "My Transaction",
      icon: Receipt,
      action: () => {
        onMenuClick?.("My Transaction");
        onClose();
      },
    },
  ];

  const group2 = [
    {
      label: "Notifications",
      icon: Bell,
      action: () => {
        onMenuClick?.("Notifications");
        onClose();
      },
    },
    {
      label: "Customer Service",
      icon: Headphones,
      action: () => {
        onMenuClick?.("Customer Service");
        onClose();
      },
    },
  ];

  const group3 = [
    {
      label: "Policy",
      icon: Shield,
      action: () => {
        onMenuClick?.("Policy");
        onClose();
      },
    },
    {
      label: "Help",
      icon: Handshake,
      action: () => {
        onMenuClick?.("Help");
        onClose();
      },
    },
  ];

  const renderItem = (label: string, Icon: any, action?: () => void) => {
    return (
      <button
        key={label}
        onClick={() => handleItemClick(label, action)}
        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-all duration-200 cursor-pointer text-left border border-transparent"
      >
        <Icon className="h-5 w-5 text-slate-700 stroke-[1.5] shrink-0" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] transition-all duration-300 animate-in fade-in"
      />

      {/* Sidebar Panel */}
      <div className="relative h-full w-[310px] sm:w-[340px] bg-white shadow-2xl flex flex-col justify-start p-5 z-50 animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar text-left">
        <div>
          {/* Close Button */}
          <div className="flex justify-start mb-4">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 transition p-1 hover:bg-slate-50 rounded-full cursor-pointer"
            >
              <X className="h-6 w-6 stroke-[1.5]" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between pb-6 mt-2 border-b border-slate-100">
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{displayName}</h3>
              <button
                onClick={handleProfileClick}
                className="text-xs text-slate-500 font-medium hover:text-primary transition mt-1 text-left bg-transparent border-none p-0 cursor-pointer"
              >
                {isGuest ? "Click to login" : "Click to view profile"}
              </button>
            </div>
            {/* Circle Avatar */}
            <div
              onClick={handleProfileClick}
              className="h-14 w-14 rounded-full overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer shadow-sm flex items-center justify-center hover:scale-105 transition shrink-0"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div
                  className={`h-full w-full flex items-center justify-center text-white text-lg font-black bg-gradient-to-tr ${isGuest ? "from-slate-400 to-slate-500" : "from-[#0062ff] to-[#00a2ff]"}`}
                >
                  {userInitial}
                </div>
              )}
            </div>
          </div>

          {/* Group 1 Menu Items */}
          <nav className="mt-4 space-y-1">
            {group1.map((item) => renderItem(item.label, item.icon, item.action))}
          </nav>

          <div className="h-[1px] w-full bg-slate-100 my-4" />

          {/* Group 2 Menu Items */}
          <nav className="space-y-1">
            {group2.map((item) => renderItem(item.label, item.icon, item.action))}
          </nav>

          <div className="h-[1px] w-full bg-slate-100 my-4" />

          {/* Group 3 Menu Items */}
          <nav className="space-y-1">
            {group3.map((item) => renderItem(item.label, item.icon, item.action))}
            {/* Logout/Login item inside group 3 list */}
            {renderItem(isGuest ? "Log In" : "Logout", isGuest ? LogIn : LogOut, handleAuthAction)}
          </nav>
        </div>
      </div>
    </div>
  );
}
