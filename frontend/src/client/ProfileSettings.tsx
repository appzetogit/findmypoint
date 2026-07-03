import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Globe } from "lucide-react";

interface ClientSession {
  email: string;
  name: string;
  phone: string;
  websiteLink?: string;
}

interface ProfileSettingsProps {
  session: ClientSession | null;
  onProfileUpdate: (updatedSession: ClientSession) => void;
}

export default function ProfileSettings({ session, onProfileUpdate }: ProfileSettingsProps) {
  // General Info states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  // Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Eye icon toggle states
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status states
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Populate from session on mount or change
  useEffect(() => {
    if (session) {
      setName(session.name || "");
      setEmail(session.email || "");
      setPhone(session.phone || "");
      setWebsiteLink(session.websiteLink || "");
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!session) return;

    // 1. Password Verification (If changing password or modifying profile)
    const storedPass = localStorage.getItem(`fmp_client_password:${session.email}`) || "client";

    if (currentPassword !== storedPass) {
      setErrorMsg("Incorrect current password. Profile updates require verification.");
      return;
    }

    // 2. New Password matching check
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg("New password and confirm password fields do not match.");
        return;
      }
      if (newPassword.length < 4) {
        setErrorMsg("New password should be at least 4 characters long.");
        return;
      }
    }

    // 3. Save profile changes
    const updatedSession: ClientSession = {
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      websiteLink: websiteLink.trim() || undefined,
    };

    // Update session in LocalStorage
    localStorage.setItem("fmp_client_session:v1", JSON.stringify(updatedSession));

    // Update password in LocalStorage if new password is set
    if (newPassword) {
      localStorage.setItem(`fmp_client_password:${updatedSession.email}`, newPassword);
      // Reset password inputs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    // Notify parent to sync state
    onProfileUpdate(updatedSession);
    
    setSuccessMsg("Your profile and credentials have been updated successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up text-left">
      {/* Page Header */}
      <div>
        <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Profile Settings</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your personal contact information and manage portal security credentials.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Account Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              Personal Information
            </h4>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Owner Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Demo Client"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="client@fmp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Primary Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="9988776655"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Website Link <span className="text-slate-400 dark:text-slate-650">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="url"
                  placeholder="https://www.yourwebsite.com"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 font-semibold"
                />
              </div>
              {websiteLink && (
                <a
                  href={websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline transition-colors mt-0.5"
                >
                  <Globe className="h-3 w-3" />
                  Open link in new tab
                </a>
              )}
            </div>
          </div>

          {/* Card 2: Security & Password Update */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-850 pb-2.5">
              Portal Security Credentials
            </h4>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Current Password <span className="text-indigo-500">(Required to verify changes)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type={showCurrentPass ? "text" : "password"}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-11 py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showCurrentPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                New Password <span className="text-slate-400 dark:text-slate-650">(Optional)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type={showNewPass ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-11 py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showNewPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs pl-11 pr-11 py-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition duration-200 cursor-pointer text-center text-xs"
        >
          Verify & Save Profile Settings
        </button>
      </form>
    </div>
  );
}
