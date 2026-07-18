import React, { useState } from "react";
import { Mail, Lock, ShieldCheck, Sun, Moon, AlertCircle, Loader2 } from "lucide-react";
import logoImg from "../assets/logo.png";

interface ClientSession {
  email: string;
  name: string;
  phone: string;
  businessId?: string;
  token?: string;
}

interface LoginProps {
  onLoginSuccess: (session: ClientSession) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Login({ onLoginSuccess, isDarkMode, toggleDarkMode }: LoginProps) {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/businesses/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      // Save token for future authenticated requests
      if (data.token) {
        localStorage.setItem("fmp_business_token", data.token);
      }

      const session: ClientSession = {
        email: data.data.email || email,
        name: data.data.name || "Business Owner",
        phone: data.data.phone || "",
        businessId: data.data.id,
        token: data.token,
      };

      onLoginSuccess(session);
    } catch {
      setLoginError("Could not connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 w-full relative overflow-hidden animate-fade-in">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {isDarkMode ? (
            <div className="bg-white px-5 py-2 rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-slate-200/40">
              <img src={logoImg} alt="FindMyPoint Logo" className="h-8 w-auto object-contain animate-fade-in shrink-0" />
            </div>
          ) : (
            <img src={logoImg} alt="FindMyPoint Logo" className="h-10 w-auto object-contain mb-5 animate-fade-in shrink-0" style={{ mixBlendMode: "multiply" }} />
          )}
          <h2 className="font-serif text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            Client Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[280px]">
            Sign in with the email and password set by your admin during business registration.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4 text-left">
          {loginError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/45 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label htmlFor="clientEmail" className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Registered Business Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                id="clientEmail"
                type="email"
                required
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label htmlFor="clientPassword" className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
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

          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3.5 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
            💡 Use the <strong>email</strong> and <strong>password</strong> set by the admin when your business was registered.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.99] transition duration-200 cursor-pointer text-center text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying...</span></>
            ) : (
              <><ShieldCheck className="h-4 w-4" /><span>Verify & Access Dashboard</span></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
