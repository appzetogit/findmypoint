import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Hourglass,
  Search,
  ChevronRight,
  Inbox,
} from "lucide-react";

interface Booking {
  id: string;
  businessName: string;
  category: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  amount: number;
  location: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "BK001",
    businessName: "Royal Banquet Hall",
    category: "Hotel Point",
    service: "Banquet Hall Booking",
    date: "2026-07-20",
    time: "07:00 PM",
    status: "confirmed",
    amount: 25000,
    location: "Ujjain, MP",
  },
  {
    id: "BK002",
    businessName: "Sharma AC Service",
    category: "Service Point",
    service: "AC Repair & Gas Refill",
    date: "2026-07-10",
    time: "11:00 AM",
    status: "completed",
    amount: 1200,
    location: "Indore, MP",
  },
  {
    id: "BK003",
    businessName: "Luxe Spa & Wellness",
    category: "Spa Point",
    service: "Full Body Massage",
    date: "2026-07-08",
    time: "03:00 PM",
    status: "pending",
    amount: 1800,
    location: "Bhopal, MP",
  },
  {
    id: "BK004",
    businessName: "Dr. Priya Mehta Clinic",
    category: "Doctor Point",
    service: "General Consultation",
    date: "2026-06-28",
    time: "10:30 AM",
    status: "cancelled",
    amount: 500,
    location: "Ujjain, MP",
  },
  {
    id: "BK005",
    businessName: "Kapoor Interior Studio",
    category: "Service Point",
    service: "Home Interior Design",
    date: "2026-07-15",
    time: "01:00 PM",
    status: "confirmed",
    amount: 5000,
    location: "Indore, MP",
  },
];

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  pending: {
    label: "Pending",
    icon: Hourglass,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-400",
  },
};

export default function MobileBookingPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_BOOKINGS.filter((b) => {
    return (
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="h-[calc(100vh-64px)] h-[calc(100dvh-64px)] flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <div className="shrink-0 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-4 pb-3">
        <h1 className="font-serif text-xl font-bold mb-3">My Bookings</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Booking List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">No bookings found</p>
            <p className="text-xs text-muted-foreground/70">Try a different filter or search term.</p>
          </div>
        ) : (
          filtered.map((b) => {
            const cfg = STATUS_CONFIG[b.status];
            const isOpen = expanded === b.id;
            const formattedDate = new Date(b.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={b.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Card header */}
                <button
                  className="w-full text-left p-4 flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{b.businessName}</p>
                      <ChevronRight
                        className={`shrink-0 h-4 w-4 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{b.service}</p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.classes}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formattedDate} · {b.time}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="border-t border-border px-4 py-3 space-y-2 bg-secondary/30 text-[12px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{b.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{b.time}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">Booking ID</span>
                      <span className="font-mono font-semibold text-foreground">{b.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold text-foreground text-sm">
                        ₹{b.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-semibold text-foreground">{b.category}</span>
                    </div>

                    {(b.status === "confirmed" || b.status === "pending") && (
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 py-2 rounded-xl border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-50 transition cursor-pointer">
                          Cancel Booking
                        </button>
                        <button className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition cursor-pointer">
                          Reschedule
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
