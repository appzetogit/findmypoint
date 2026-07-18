import { useState, useEffect } from "react";
import { Sliders, Save, Eye, CheckCircle, HelpCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { loadFooterData, saveFooterData, FooterData, SocialLinkItem } from "../data/footerData";
import { API_BASE_URL } from "../config";
import logoImg from "../assets/logo.png";

export default function FooterManagement() {
  const [footerData, setFooterData] = useState<FooterData>({
    tagline: "",
    socials: [],
    playstoreUrl: "",
    appstoreUrl: "",
    copyright: "",
  });

  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/footer`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.footer) {
          setFooterData(data.footer);
        } else {
          setFooterData(loadFooterData());
        }
      })
      .catch((err) => {
        console.error("Error loading footer settings from backend:", err);
        setFooterData(loadFooterData());
      });
  }, []);

  const handleChangeField = (field: keyof Omit<FooterData, "socials">, value: string) => {
    setFooterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleSocial = (id: string) => {
    setFooterData((prev) => ({
      ...prev,
      socials: prev.socials.map((s) => (s.id === id ? { ...s, show: !s.show } : s)),
    }));
  };

  const handleChangeSocialUrl = (id: string, url: string) => {
    setFooterData((prev) => ({
      ...prev,
      socials: prev.socials.map((s) => (s.id === id ? { ...s, url } : s)),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("fmp_admin_token");
    try {
      const res = await fetch(`${API_BASE_URL}/footer/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(footerData)
      });
      const data = await res.json();
      if (data.success && data.footer) {
        setFooterData(data.footer);
        saveFooterData(data.footer); // Update local backup
        setIsSavedAlert(true);
        setTimeout(() => {
          setIsSavedAlert(false);
        }, 4000);
        // Dispatch storage/custom event to notify other components (Home & Footer page)
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("fmp_footer_changed"));
      } else {
        alert("Failed to save footer: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving footer data:", err);
      alert("Network error occurred while saving footer details.");
    }
  };

  // Helper to render social SVGs for live preview
  const getSocialIconSvg = (id: string) => {
    switch (id) {
      case "facebook":
        return (
          <svg
            className="h-4 w-4 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
          </svg>
        );
      case "youtube":
        return (
          <svg
            className="h-4.5 w-4.5 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.513 3.545 12 3.545 12 3.545s-7.513 0-9.388.51C1.238 4.397.518 5.12.51 6.163.008 8.054.008 12 .008 12s0 3.945.502 5.837c.078 1.043.798 1.766 1.702 1.97 1.875.502 9.388.502 9.388.502s7.513 0 9.388-.502a2.997 2.997 0 0 0 2.11-2.108c.502-1.892.502-5.837.502-5.837s0-3.946-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case "instagram":
        return (
          <svg
            className="h-4 w-4 stroke-white fill-none stroke-[2.2]"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        );
      case "linkedin":
        return (
          <svg
            className="h-4.5 w-4.5 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        );
      case "x":
        return (
          <svg
            className="h-3.5 w-3.5 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSocialClass = (id: string) => {
    switch (id) {
      case "facebook":
        return "bg-[#1877f2] hover:scale-110";
      case "youtube":
        return "bg-[#ff0000] hover:scale-110";
      case "instagram":
        return "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:scale-110";
      case "linkedin":
        return "bg-[#0a66c2] hover:scale-110";
      case "x":
        return "bg-[#000000] hover:scale-110";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-in-up">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Footer Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage and dynamically customize social links, stores, tagline, and copyrights
            </p>
          </div>
        </div>
      </div>

      {isSavedAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in text-left">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          <span>Footer settings have been updated and saved successfully!</span>
        </div>
      )}

      {/* Two column Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left items-start">
        {/* Left: Settings Panel */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
        >
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white pb-3.5 border-b border-slate-100 dark:border-slate-850">
            Edit Footer Content
          </h2>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Footer Tagline/Description
            </label>
            <textarea
              required
              rows={2}
              value={footerData.tagline}
              onChange={(e) => handleChangeField("tagline", e.target.value)}
              placeholder="Enter local discovery platform tagline description..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-medium leading-relaxed"
            />
          </div>

          {/* Social Links Panel */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Social Media Links
            </span>
            <div className="space-y-3.5">
              {footerData.socials.map((social) => (
                <div
                  key={social.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850/60 p-3 rounded-2xl"
                >
                  {/* Name & Toggle */}
                  <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-44 shrink-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center ${getSocialClass(social.id)}`}
                      >
                        {getSocialIconSvg(social.id)}
                      </span>
                      {social.name}
                    </span>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSocial(social.id)}
                      className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        social.show ? "bg-indigo-600" : "bg-slate-250 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          social.show ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* URL Input */}
                  <input
                    type="text"
                    disabled={!social.show}
                    value={social.url}
                    onChange={(e) => handleChangeSocialUrl(social.id, e.target.value)}
                    placeholder={`Enter ${social.name} profile link...`}
                    className={`w-full text-xs px-3.5 py-1.5 rounded-lg border outline-none font-medium transition-all ${
                      social.show
                        ? "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-850 text-slate-950 dark:text-slate-100 focus:border-indigo-500"
                        : "bg-slate-100 dark:bg-slate-950/35 border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Download Buttons URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Playstore Link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Google Playstore Link
              </label>
              <input
                type="text"
                required
                value={footerData.playstoreUrl}
                onChange={(e) => handleChangeField("playstoreUrl", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
              />
            </div>

            {/* Appstore Link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Apple App Store Link
              </label>
              <input
                type="text"
                required
                value={footerData.appstoreUrl}
                onChange={(e) => handleChangeField("appstoreUrl", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
              />
            </div>
          </div>

          {/* Copyright */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Copyright Text
            </label>
            <input
              type="text"
              required
              value={footerData.copyright}
              onChange={(e) => handleChangeField("copyright", e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 outline-none text-slate-950 dark:text-slate-100 focus:border-indigo-500 transition font-semibold"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save Footer Config</span>
          </button>
        </form>

        {/* Right: Live Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-450 px-1">
            <Eye className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Footer Live Preview
            </span>
          </div>

          {/* Mock Footer Card Container */}
          <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/20 shadow-xs text-left">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/40 dark:border-slate-850/50 mb-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Section View</span>
              <span className="text-[9px] bg-slate-200/60 dark:bg-slate-800 text-slate-650 dark:text-slate-400 px-2 py-0.5 rounded">
                Footer.tsx
              </span>
            </div>

            {/* Simulated Footer Area */}
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center">
                <img
                  src={logoImg}
                  alt="FindMyPoint Logo"
                  className="h-7 w-auto object-contain brightness-100 dark:brightness-110"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>

              {/* Tagline */}
              <p className="max-w-sm text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {footerData.tagline || "Tagline goes here..."}
              </p>

              {/* Social Icons list */}
              <div className="flex gap-2.5 flex-wrap">
                {footerData.socials
                  .filter((s) => s.show)
                  .map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      onClick={(e) => e.preventDefault()}
                      title={social.name}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 shadow-sm ${getSocialClass(social.id)}`}
                    >
                      {getSocialIconSvg(social.id)}
                    </a>
                  ))}
                {footerData.socials.filter((s) => s.show).length === 0 && (
                  <span className="text-xs text-slate-400 italic font-semibold">
                    No active social networks toggled on.
                  </span>
                )}
              </div>

              {/* App download buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Google Play Button */}
                <a
                  href={footerData.playstoreUrl}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2 rounded-xl bg-[#111111] text-white px-3 py-1.5 shadow-sm border border-white/10 hover:bg-black transition text-left"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.9 22.1l13.56-10.1L1.9 1.9c-.06.22-.09.46-.09.7v18.8c0 .24.03.48.09.7"
                      fill="#3bccff"
                    />
                    <path
                      d="M16.14 11.3l-3.26-3.26L2.3 1.22c.3-.18.66-.22 1.02-.02l12.82 7.32"
                      fill="#00e676"
                    />
                    <path
                      d="M21.97 12.74a1.66 1.66 0 0 0-.03-1.48l-3.37-1.92-3.15 3.16 3.15 3.16 3.37-1.92"
                      fill="#ffe000"
                    />
                    <path
                      d="M16.14 12.7l-3.26 3.26L2.3 22.78c.3.18.66.22 1.02.02l12.82-7.32"
                      fill="#ff3a44"
                    />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-semibold text-white/70 uppercase tracking-widest leading-none">
                      GET IT ON
                    </span>
                    <span className="text-[10px] font-bold leading-tight mt-0.5">Google Play</span>
                  </div>
                </a>

                {/* App Store Button */}
                <a
                  href={footerData.appstoreUrl}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2 rounded-xl bg-[#111111] text-white px-3 py-1.5 shadow-sm border border-white/10 hover:bg-black transition text-left"
                >
                  <svg
                    className="h-4 w-4 fill-white"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.502 12.06 1.002 1.45 2.19 3.078 3.76 3.02 1.514-.06 2.09-.98 3.916-.98 1.81 0 2.333.98 3.917.948 1.606-.027 2.648-1.48 3.627-2.9 1.13-1.656 1.597-3.26 1.623-3.342-.03-.015-3.107-1.192-3.137-4.747-.025-2.978 2.443-4.41 2.56-4.484-1.393-2.04-3.548-2.27-4.316-2.32-2-.162-3.9 1.231-4.918 1.231zm2.33-4.57c.896-1.082 1.5-2.585 1.332-4.086-1.286.05-2.85.856-3.774 1.938-.796.918-1.492 2.455-1.304 3.925 1.438.113 2.875-.722 3.746-1.777z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[7.5px] font-semibold text-white/70 leading-none">
                      Download on the
                    </span>
                    <span className="text-[10px] font-bold leading-tight mt-0.5">App Store</span>
                  </div>
                </a>
              </div>

              {/* Copyright Text */}
              <div className="mt-8 pt-5 border-t border-slate-200/40 dark:border-slate-850/50 text-[11px] text-slate-400 font-semibold">
                <p>{footerData.copyright || "© Copyright text"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
