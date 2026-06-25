import { useState, FormEvent } from "react";

export default function CustomerServicePage() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    // save to localStorage support tickets log
    try {
      const tickets = JSON.parse(localStorage.getItem("fmp_support_tickets") || "[]");
      tickets.push({
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem("fmp_support_tickets", JSON.stringify(tickets));
      
      // Reset form fields after delay
      setTimeout(() => {
        setContactName("");
        setContactEmail("");
        setContactSubject("");
        setContactMessage("");
        setFormSubmitted(false);
      }, 3000);
    } catch (e) {
      console.error("Failed to save support ticket", e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-black text-foreground">Support Center</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Solve queries dynamically or submit a support message.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Hotlines info */}
        <div className="md:col-span-5 space-y-4 bg-secondary/15 border border-border/50 rounded-2xl p-5 flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-wider block mb-3">Support Contacts</span>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[9px] font-black uppercase text-muted-foreground block">Toll-Free Hotline</span>
                <span className="text-sm font-black text-foreground mt-0.5 block">📞 1800-FMP-HELP</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-muted-foreground block">Email Helpdesk</span>
                <span className="text-sm font-black text-foreground mt-0.5 block">✉️ support@findmypoint.com</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-muted-foreground block">Operations Hours</span>
                <span className="text-xs font-bold text-slate-600 mt-0.5 block">Mon-Sat | 09:00 AM - 08:30 PM</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-4 text-[10px] font-semibold text-muted-foreground leading-relaxed text-left">
            💡 Our support desk is dedicated to assisting you with table reservation cancellations, receipt prints, and profile settings inquiries.
          </div>
        </div>

        {/* Contact Support Form */}
        <form onSubmit={handleFormSubmit} className="md:col-span-7 bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-primary tracking-wider block text-left">Send us a Message</span>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Your Name</label>
              <input 
                type="text" 
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your Name"
                className="w-full border border-border bg-background rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary"
              />
            </div>
            <div className="text-left">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-border bg-background rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Subject</label>
            <input 
              type="text" 
              required
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="e.g. Table Reservation Cancellation Request"
              className="w-full border border-border bg-background rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
            />
          </div>

          <div className="text-left">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Message Details</label>
            <textarea 
              rows={3}
              required
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Describe your issue or request in detail..."
              className="w-full border border-border bg-background rounded-xl p-3.5 text-xs font-semibold outline-none focus:border-primary resize-none"
            />
          </div>

          {formSubmitted ? (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs font-bold text-emerald-600 animate-pulse">
              ✓ Support request received! We'll reply to your email shortly.
            </div>
          ) : (
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black py-3 rounded-xl shadow transition cursor-pointer"
            >
              Submit Support Ticket
            </button>
          )}
        </form>

      </div>
    </div>
  );
}
