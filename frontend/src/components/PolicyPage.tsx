import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import {
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  Lock,
  BookOpen,
  Scale,
  HelpCircle,
} from "lucide-react";

interface PolicyPageProps {
  initialTab?: "privacy" | "terms" | "refunds";
}

export default function PolicyPage({ initialTab = "privacy" }: PolicyPageProps) {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "refunds">(initialTab);
  const [termsData, setTermsData] = useState<{ lastUpdated: string; sections: any[] }>({
    lastUpdated: "July 2026",
    sections: []
  });
  const [privacyData, setPrivacyData] = useState<{ lastUpdated: string; sections: any[] }>({
    lastUpdated: "July 2026",
    sections: []
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/policies/terms`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.terms) {
          setTermsData(data.terms);
        }
      })
      .catch((err) => console.error("Error fetching terms", err));

    fetch(`${API_BASE_URL}/policies/privacy`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.privacy) {
          setPrivacyData(data.privacy);
        }
      })
      .catch((err) => console.error("Error fetching privacy policy", err));
  }, []);

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "lock":
        return <Lock className="h-4 w-4 text-indigo-500" />;
      case "cookie":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "globe":
        return <Info className="h-4 w-4 text-indigo-500" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "scale":
        return <Scale className="h-4 w-4 text-indigo-500" />;
      case "file":
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case "shield":
        return <Shield className="h-4 w-4 text-indigo-500" />;
      default:
        return <Info className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left max-w-6xl mx-auto py-4">
      {/* Left Column: Navigation Sidebar */}
      <div className="hidden lg:block lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Legal Agreement Index
        </h3>

        <div className="space-y-1">
          {/* Privacy Policy Tab */}
          <button
            onClick={() => setActiveTab("privacy")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "privacy"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400"
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <Shield className="h-4.5 w-4.5" />
            <span>Privacy Policy</span>
          </button>

          {/* Terms & Conditions Tab */}
          <button
            onClick={() => setActiveTab("terms")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "terms"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400"
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <Scale className="h-4.5 w-4.5" />
            <span>Terms & Conditions</span>
          </button>

          {/* Cancellations & Refunds Tab */}
          <button
            onClick={() => setActiveTab("refunds")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === "refunds"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400"
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            <span>Cancellations & Refunds</span>
          </button>
        </div>

        {/* Sidebar Info Card */}
        <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
          <div className="flex gap-2.5 items-start">
            <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                Need Legal Help?
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                If you have queries regarding our user policies, please open a support ticket in
                Customer Service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Policy Content Reading Area */}
      <div className="lg:col-span-8 lg:bg-white lg:dark:bg-slate-900 lg:border lg:border-slate-200/60 lg:dark:border-slate-800/60 lg:rounded-3xl p-0 md:p-8 lg:shadow-sm">
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-855 pb-4">
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Privacy Policy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last Updated: {privacyData.lastUpdated}
              </p>
            </div>

            <div className="space-y-5 text-slate-600 dark:text-slate-455 text-xs font-semibold leading-relaxed">
              {privacyData.sections && privacyData.sections.length > 0 ? (
                privacyData.sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {getIconComponent(section.icon)}
                      {section.title}
                    </h4>
                    <p>{section.content}</p>
                  </div>
                ))
              ) : (
                <p className="italic text-slate-400">No privacy policy sections configured.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-855 pb-4">
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Terms & Conditions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last Updated: {termsData.lastUpdated}
              </p>
            </div>

            <div className="space-y-5 text-slate-600 dark:text-slate-455 text-xs font-semibold leading-relaxed">
              {termsData.sections && termsData.sections.length > 0 ? (
                termsData.sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {getIconComponent(section.icon)}
                      {section.title}
                    </h4>
                    <p>{section.content}</p>
                  </div>
                ))
              ) : (
                <p className="italic text-slate-450">No terms & conditions sections configured.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "refunds" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-855 pb-4">
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Cancellations & Refunds
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last Updated: July 2026
              </p>
            </div>

            <div className="space-y-5 text-slate-600 dark:text-slate-455 text-xs font-semibold leading-relaxed">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  1. Table Reservations
                </h4>
                <p>
                  Table bookings made under Food Point listings requiring deposit payments (₹250.00)
                  can be cancelled directly through the hotline 2 hours prior to the reservation
                  slot for a complete refund. No refunds are initiated for cancellations made inside
                  the 2-hour window.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-500" />
                  2. Medical & Hotel bookings
                </h4>
                <p>
                  Clinic appointment bookings and Room accommodations fall under their respective
                  clinic/hotel policies. Refunds are processed securely to the original payment mode
                  within 5-7 working days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
