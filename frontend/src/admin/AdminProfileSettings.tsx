import { useState, useEffect } from "react";
import { User, Lock, Mail, Check, Save, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../config";

interface AdminProfile {
  username: string;
  email: string;
  role: string;
}

interface AdminProfileSettingsProps {
  onCancel: () => void;
  onUpdate: (updated: AdminProfile) => void;
}

export default function AdminProfileSettings({ onCancel, onUpdate }: AdminProfileSettingsProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load profile from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("fmp_admin_token");
    if (!token) return;

    fetch(`${API_BASE_URL}/admin/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.admin) {
        setUsername(data.admin.name);
        setEmail(data.admin.email);
        setRole(data.admin.role || "System Administrator");
      }
    })
    .catch(err => {
      console.error("Failed to fetch admin profile", err);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const token = localStorage.getItem("fmp_admin_token");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const body: any = {
        name: username.trim(),
        email: email.trim(),
      };
      if (password) {
        body.password = password;
      }

      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();

      if (data.success && data.admin) {
        const updatedProfile = {
          username: data.admin.name,
          email: data.admin.email,
          role: data.admin.role || "System Administrator"
        };
        onUpdate(updatedProfile);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        setPassword("");
        setConfirmPassword("");
        alert("Admin profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save admin profile.");
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-in-up">
      {/* Flat Header */}
      <div className="flex items-center gap-3 text-left">
        <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            Admin Profile Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Update your superuser credentials and details
          </p>
        </div>
      </div>

      <div className="max-w-2xl text-left bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 md:p-7 shadow-xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 [&_input]:bg-white [&_input]:dark:bg-slate-900 [&_input]:shadow-sm [&_input]:py-2 [&_input]:px-3.5 [&_input]:text-xs [&_input]:rounded-lg [&_label]:text-[10px] [&_h3]:text-sm [&_.grid]:gap-4 [&_.space-y-6]:space-y-4"
        >
          {isSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              <span>Profile settings saved successfully!</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Superadmin Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Superadmin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@fmp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Change Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep same"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350 transition-colors bg-transparent border-0 outline-none cursor-pointer p-0 flex items-center justify-center"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350 transition-colors bg-transparent border-0 outline-none cursor-pointer p-0 flex items-center justify-center"
                    title={showConfirmPassword ? "Hide Password" : "Show Password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-55 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
