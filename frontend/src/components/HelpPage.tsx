import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function HelpPage() {
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I book a doctor appointment or hotel room?", a: "Navigate to the category pages via the home screen, select your desired doctor or hotel listing, click 'Book Now', choose your date/time preferences, complete the payment, and your slot is booked instantly." },
    { q: "Where can I view my booking invoice receipt?", a: "Once a booking or order is confirmed, the transaction receipt is stored under the 'My Transaction' page. You can click on 'View Receipt' to print or view detailed breakdowns." },
    { q: "How do I add multiple address tags?", a: "Go to 'Edit Profile' from the sidebar menu, click 'Save & Continue' to proceed to Step 2 (Addresses), fill in the recipient details, and click 'Add Address Node'. You can save tags for Home, Work, and Office." },
    { q: "Are the services and bookings refundable?", a: "Yes, table reservations can be cancelled with a full refund of your ₹250 booking deposit. For other service points (e.g. Plumbers or AC services), cancellation is free before the technician is assigned." },
    { q: "How can I register my own business on FindmyPoint?", a: "Please contact our merchant support team at 1800-FMP-HELP or email merchant@findmypoint.com with your business details to complete registration." }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Frequently Asked Questions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Explore accordion answers or search specific queries.</p>
      </div>

      {/* Search FAQ */}
      <input 
        type="text" 
        value={faqSearch}
        onChange={(e) => setFaqSearch(e.target.value)}
        placeholder="Search FAQ keywords: 'hotel', 'refund', 'booking'..."
        className="w-full border border-border bg-card rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-primary shadow-sm"
      />

      {/* FAQ Accordion List */}
      <div className="space-y-2.5 text-left">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-bold border border-dashed border-border rounded-xl bg-card">
            No matching questions found for '{faqSearch}'.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 bg-secondary/5 hover:bg-secondary/10 transition text-left cursor-pointer outline-none border-none"
              >
                <span className="text-xs font-black text-slate-800 pr-4">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                )}
              </button>
              
              {openFaq === idx && (
                <div className="p-4 border-t border-border text-xs text-slate-600 leading-relaxed font-medium bg-card">
                  {faq.a}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
