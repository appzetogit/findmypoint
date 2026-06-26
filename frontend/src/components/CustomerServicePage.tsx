import { useReducer, FormEvent } from "react";

interface ServiceFormState {
  contactName: string;
  contactEmail: string;
  contactSubject: string;
  contactMessage: string;
  formSubmitted: boolean;
}

type ServiceFormAction =
  | { type: "CHANGE_FIELD"; field: keyof Omit<ServiceFormState, "formSubmitted">; value: string }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "RESET" };

const initialServiceFormState: ServiceFormState = {
  contactName: "",
  contactEmail: "",
  contactSubject: "",
  contactMessage: "",
  formSubmitted: false,
};

function serviceFormReducer(state: ServiceFormState, action: ServiceFormAction): ServiceFormState {
  switch (action.type) {
    case "CHANGE_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_SUBMITTED":
      return { ...state, formSubmitted: action.value };
    case "RESET":
      return initialServiceFormState;
    default:
      return state;
  }
}

export default function CustomerServicePage() {
  const [state, dispatch] = useReducer(serviceFormReducer, initialServiceFormState);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_SUBMITTED", value: true });
    // save to localStorage support tickets log
    try {
      const tickets = JSON.parse(localStorage.getItem("fmp_support_tickets:v1") || "[]");
      tickets.push({
        name: state.contactName,
        email: state.contactEmail,
        subject: state.contactSubject,
        message: state.contactMessage,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem("fmp_support_tickets:v1", JSON.stringify(tickets));
      
      // Reset form fields after delay
      setTimeout(() => {
        dispatch({ type: "RESET" });
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
              <label htmlFor="contactName" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Your Name</label>
              <input 
                id="contactName"
                type="text" 
                required
                value={state.contactName}
                onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "contactName", value: e.target.value })}
                placeholder="Your Name"
                className="w-full border border-border bg-background rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary"
              />
            </div>
            <div className="text-left">
              <label htmlFor="contactEmail" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Email Address</label>
              <input 
                id="contactEmail"
                type="email" 
                required
                value={state.contactEmail}
                onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "contactEmail", value: e.target.value })}
                placeholder="name@example.com"
                className="w-full border border-border bg-background rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="text-left">
            <label htmlFor="contactSubject" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Subject</label>
            <input 
              id="contactSubject"
              type="text" 
              required
              value={state.contactSubject}
              onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "contactSubject", value: e.target.value })}
              placeholder="e.g. Table Reservation Cancellation Request"
              className="w-full border border-border bg-background rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary"
            />
          </div>

          <div className="text-left">
            <label htmlFor="contactMessage" className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Message Details</label>
            <textarea 
              id="contactMessage"
              rows={3}
              required
              value={state.contactMessage}
              onChange={(e) => dispatch({ type: "CHANGE_FIELD", field: "contactMessage", value: e.target.value })}
              placeholder="Describe your issue or request in detail..."
              className="w-full border border-border bg-background rounded-xl p-3.5 text-xs font-semibold outline-none focus:border-primary resize-none"
            />
          </div>

          {state.formSubmitted ? (
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
