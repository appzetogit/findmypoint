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

export function loadFAQs(): FAQItem[] {
  const data = localStorage.getItem("fmp_help_faqs:v1");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse FAQs", e);
    return [];
  }
}

export function saveFAQs(faqs: FAQItem[]): void {
  localStorage.setItem("fmp_help_faqs:v1", JSON.stringify(faqs));
}

export function loadTickets(): SupportTicket[] {
  const data = localStorage.getItem("fmp_help_tickets:v1");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse tickets", e);
    return [];
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

export function loadHelpContact(): HelpContactData {
  const data = localStorage.getItem("fmp_help_contact:v1");
  if (!data) return { email: "", phone: "" };
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse contact details", e);
    return { email: "", phone: "" };
  }
}

export function saveHelpContact(contact: HelpContactData): void {
  localStorage.setItem("fmp_help_contact:v1", JSON.stringify(contact));
}
