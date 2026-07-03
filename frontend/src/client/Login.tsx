import React, { useState } from "react";
import { Mail, Lock, ShieldCheck, Sun, Moon, AlertCircle } from "lucide-react";
import logoImg from "../assets/logo.png";
import { loadAdminUsers } from "../data/usersData";

interface ClientSession {
  email: string;
  name: string;
  phone: string;
}

interface LoginProps {
  onLoginSuccess: (session: ClientSession) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Login({ onLoginSuccess, isDarkMode, toggleDarkMode }: LoginProps) {
  const [emailInput, setEmailInput] = useState("client@fmp.com");
  const [passwordInput, setPasswordInput] = useState("client");
  const [loginError, setLoginError] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    // 1. Check Default Demo Account
    if (emailLower === "client@fmp.com" && password === "client") {
      const defaultSession: ClientSession = {
        email: "client@fmp.com",
        name: "Demo Client",
        phone: "9988776655"
      };
      onLoginSuccess(defaultSession);
      return;
    }

    // 2. Load and verify against registered users list
    const registeredUsers = loadAdminUsers();
    const matchedUser = registeredUsers.find(
      (u) =>
        u.addresses.some((addr) => addr.email.trim().toLowerCase() === emailLower) ||
        (u.personal.mobile1 && u.personal.mobile1 === password)
    );

    if (matchedUser) {
      const primaryAddress = matchedUser.addresses.find((a) => a.email.trim().toLowerCase() === emailLower) || matchedUser.addresses[0];
      const userEmail = primaryAddress ? primaryAddress.email : emailLower;
      const userPhone = matchedUser.personal.mobile1 || matchedUser.personal.mobile2 || primaryAddress?.phone || "";
      const fullName = `${matchedUser.personal.title || ""} ${matchedUser.personal.firstName || ""} ${matchedUser.personal.lastName || ""}`.trim();

      const correctPass = localStorage.getItem(`fmp_client_password:${userEmail}`) || "client";

      if (password === correctPass || password === userPhone) {
        const userSession: ClientSession = {
          email: userEmail,
          name: fullName || "Registered Business Owner",
          phone: userPhone
        };
        onLoginSuccess(userSession);
        return;
      }
    }

    setLoginError("Invalid email or password. Hint: Use default credentials.");
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 w-full relative overflow-hidden animate-fade-in">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl">
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
          <h2 className="font-serif text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            Client Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[280px]">
            Manage and advertise your businesses. Sign in with your registered owner email.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4 text-left">
          {loginError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/45 text-rose-600 dark:text-rose-450 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="clientEmail"
              className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              Owner Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              <input
                id="clientEmail"
                type="email"
                required
                placeholder="client@fmp.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="clientPassword"
              className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              <input
                id="clientPassword"
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3.5 text-[11.5px] text-slate-500 dark:text-slate-400 text-center font-semibold">
            Demo Credentials:
            <br />
            Email: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">client@fmp.com</span> & Password: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">client</span>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.99] transition duration-200 cursor-pointer text-center text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            <span>Verify & Access Dashboard</span>
          </button>
        </form>

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
