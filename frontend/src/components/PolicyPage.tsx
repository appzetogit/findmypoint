import { useState } from "react";

export default function PolicyPage() {
  const [policyTab, setPolicyTab] = useState("privacy");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Policies & Agreements</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Please review our rules and legal clauses.</p>
      </div>

      {/* Policy Tabs */}
      <div className="flex border-b border-border gap-2">
        {[
          { id: "privacy", label: "Privacy Policy" },
          { id: "terms", label: "Terms of Use" },
          { id: "cancellation", label: "Cancellations & Refunds" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setPolicyTab(tab.id)}
            className={`pb-3.5 text-xs font-black transition-all border-b-2 px-3 cursor-pointer -mb-[1.5px] ${
              policyTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Policy text box */}
      <div className="bg-secondary/10 border border-border/80 rounded-2xl p-5 text-xs text-slate-600 leading-relaxed space-y-4 max-h-[300px] overflow-y-auto no-scrollbar font-medium text-left">
        {policyTab === "privacy" && (
          <>
            <h4 className="font-bold text-slate-800 text-sm">1. Data Collected</h4>
            <p>We collect personal identifiers including First Name, Last Name, Birthdates, Marital Status, and primary/secondary contact numbers to establish user configurations under your local storage profiles. Photos uploaded as avatars are processed locally as Base64 strings and are not shared with external vendors.</p>
            <h4 className="font-bold text-slate-800 text-sm mt-3">2. Cookie Policy</h4>
            <p>Cookies are utilized solely to maintain session credentials and layout configurations (e.g. sidebar state). No target advertisements cookies are configured.</p>
          </>
        )}
        {policyTab === "terms" && (
          <>
            <h4 className="font-bold text-slate-800 text-sm">1. Usage Responsibility</h4>
            <p>Users agree to submit accurate, non-fraudulent information when booking tables, clinics, or rooms. Submitting spam bookings or utilizing automated scripts to stress check availability will result in profile limitations.</p>
            <h4 className="font-bold text-slate-800 text-sm mt-3">2. Merchant Liability</h4>
            <p>FindmyPoint acts as an intermediate directory search hub. Any quality issues with services rendered by local plumbing, salon, or medical clinics are directly the concern of the respective service provider.</p>
          </>
        )}
        {policyTab === "cancellation" && (
          <>
            <h4 className="font-bold text-slate-800 text-sm">1. Table Reservations</h4>
            <p>Table bookings made under Food Point listings requiring deposit payments (₹250.00) can be cancelled directly through the hotline 2 hours prior to the reservation slot for a complete refund. No refunds are initiated for cancellations made inside the 2-hour window.</p>
            <h4 className="font-bold text-slate-800 text-sm mt-3">2. Medical & Hotel bookings</h4>
            <p>Clinic appointment bookings and Room accommodations fall under their respective clinic/hotel policies. Refunds are processed securely to the original payment mode within 5-7 working days.</p>
          </>
        )}
      </div>
    </div>
  );
}
