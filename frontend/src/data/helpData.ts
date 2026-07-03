export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "pending" | "resolved";
}

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "1",
    question: "How do I book a doctor appointment or hotel room?",
    answer:
      "Navigate to the category pages via the home screen, select your desired doctor or hotel listing, click 'Book Now', choose your date/time preferences, complete the payment, and your slot is booked instantly.",
  },
  {
    id: "2",
    question: "Where can I view my booking invoice receipt?",
    answer:
      "Once a booking or order is confirmed, the transaction receipt is stored under the 'My Transaction' page. You can click on 'View Receipt' to print or view detailed breakdowns.",
  },
  {
    id: "3",
    question: "How do I add multiple address tags?",
    answer:
      "Go to 'Edit Profile' from the sidebar menu, click 'Save & Continue' to proceed to Step 2 (Addresses), fill in the recipient details, and click 'Add Address Node'. You can save tags for Home, Work, and Office.",
  },
  {
    id: "4",
    question: "Are the services and bookings refundable?",
    answer:
      "Yes, table reservations can be cancelled with a full refund of your ₹250 booking deposit. For other service points (e.g. Plumbers or AC services), cancellation is free before the technician is assigned.",
  },
  {
    id: "5",
    question: "How can I register my own business on FindmyPoint?",
    answer:
      "Please contact our merchant support team at 1800-FMP-HELP or email merchant@findmypoint.com with your business details to complete registration.",
  },
];

export const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: "t1",
    name: "Aman Sharma",
    email: "aman.sharma@gmail.com",
    subject: "Refund Issue",
    message:
      "I cancelled my hotel booking on Ujjain point yesterday, but the ₹250 deposit has not yet refunded in my account. Please verify.",
    date: "2026-07-02 10:30 AM",
    status: "pending",
  },
  {
    id: "t2",
    name: "Priya Patel",
    email: "priya.patel@yahoo.com",
    subject: "Business Registration",
    message:
      "I want to list my interior design salon in Udaipur. I submitted details in the form but didn't receive a confirmation.",
    date: "2026-07-01 04:15 PM",
    status: "resolved",
  },
];

export function loadFAQs(): FAQItem[] {
  const data = localStorage.getItem("fmp_help_faqs:v1");
  if (!data) {
    localStorage.setItem("fmp_help_faqs:v1", JSON.stringify(DEFAULT_FAQS));
    return DEFAULT_FAQS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse FAQs", e);
    return DEFAULT_FAQS;
  }
}

export function saveFAQs(faqs: FAQItem[]): void {
  localStorage.setItem("fmp_help_faqs:v1", JSON.stringify(faqs));
}

export function loadTickets(): SupportTicket[] {
  const data = localStorage.getItem("fmp_help_tickets:v1");
  if (!data) {
    localStorage.setItem("fmp_help_tickets:v1", JSON.stringify(DEFAULT_TICKETS));
    return DEFAULT_TICKETS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse tickets", e);
    return DEFAULT_TICKETS;
  }
}

export function saveTickets(tickets: SupportTicket[]): void {
  localStorage.setItem("fmp_help_tickets:v1", JSON.stringify(tickets));
}

export function addSupportTicket(ticket: Omit<SupportTicket, "id" | "date" | "status">): void {
  const tickets = loadTickets();
  const dateObj = new Date();
  const formatTime = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = dateObj.toISOString().split("T")[0];

  const newTicket: SupportTicket = {
    ...ticket,
    id: "t_" + Date.now().toString(),
    date: `${formatDate} ${formatTime}`,
    status: "pending",
  };

  tickets.unshift(newTicket); // Prepend new tickets
  saveTickets(tickets);
}

export interface HelpContactData {
  email: string;
  phone: string;
}

export const DEFAULT_CONTACT_DATA: HelpContactData = {
  email: "support@findmypoint.com",
  phone: "1800-FMP-HELP",
};

export function loadHelpContact(): HelpContactData {
  const data = localStorage.getItem("fmp_help_contact:v1");
  if (!data) {
    localStorage.setItem("fmp_help_contact:v1", JSON.stringify(DEFAULT_CONTACT_DATA));
    return DEFAULT_CONTACT_DATA;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse contact details", e);
    return DEFAULT_CONTACT_DATA;
  }
}

export function saveHelpContact(contact: HelpContactData): void {
  localStorage.setItem("fmp_help_contact:v1", JSON.stringify(contact));
}
