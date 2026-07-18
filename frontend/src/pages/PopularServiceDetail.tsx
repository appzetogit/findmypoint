import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  Phone,
  MessageSquare,
  BadgeCheck,
  ChevronRight,
  Clock,
  User,
  X,
  Check,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import Footer from "./Footer";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";

interface PopularServiceDetailPageProps {
  popularServiceId: string;
  onBack: () => void;
  onBusinessSelect: (id: string) => void;
  onBookNow: (id: string) => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  username?: string | null;
}

export default function PopularServiceDetailPage({
  popularServiceId,
  onBack,
  onBusinessSelect,
  onBookNow,
  onSignInClick,
  onProfileClick,
  username,
}: PopularServiceDetailPageProps) {
  const [serviceData, setServiceData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Enquiry modal states
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedBizForEnquiry, setSelectedBizForEnquiry] = useState<any | null>(null);
  const [enquiryForm, setEnquiryForm] = useState({ name: username || "", phone: "", email: "", message: "" });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/popular-services/${popularServiceId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setServiceData(res.data);
          setError(null);
        } else {
          setError("Popular Service not found");
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load popular service details");
      })
      .finally(() => setLoading(false));
  }, [popularServiceId]);

  // Update form name when username changes
  useEffect(() => {
    if (username) {
      setEnquiryForm((prev) => ({ ...prev, name: username }));
    }
  }, [username]);

    // Local storage enquiry submission
    const handleEnquirySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!enquiryForm.name || !enquiryForm.phone) {
        alert("Please fill in your Name and Phone Number.");
        return;
      }
      setEnquirySubmitted(true);
      if (selectedBizForEnquiry) {
        const token = localStorage.getItem("fmp_user_token") || "";
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) {
          (headers as any)["Authorization"] = `Bearer ${token}`;
        }
        // Send enquiry to backend API
        fetch(`http://localhost:5000/api/businesses/${selectedBizForEnquiry.id}/enquire`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: enquiryForm.name,
            phone: enquiryForm.phone,
            email: enquiryForm.email || "",
            message: enquiryForm.message || "",
            subject: `Enquiry for ${selectedBizForEnquiry.name}`
          })
        }).then(res => res.json())
          .then(data => {
            if (data.success) {
              window.dispatchEvent(new Event("storage"));
            }
          }).catch(err => console.error("Enquiry submit failed:", err));
      }
      setTimeout(() => {
        setEnquiryModalOpen(false);
        setEnquirySubmitted(false);
        setEnquiryForm({ name: username || "", phone: "", email: "", message: "" });
      }, 2000);
    };

  const openEnquiryModal = (biz: any) => {
    setSelectedBizForEnquiry(biz);
    setEnquiryForm({ name: username || "", phone: "", email: "", message: "" });
    setEnquirySubmitted(false);
    setEnquiryModalOpen(true);
  };

  // Filter listings based on search query
  const filteredListings = useMemo(() => {
    if (!serviceData || !Array.isArray(serviceData.businesses)) return [];
    const term = searchQuery.toLowerCase().trim();
    if (!term) return serviceData.businesses;
    return serviceData.businesses.filter(
      (b: any) =>
        b.name.toLowerCase().includes(term) ||
        (b.location && b.location.toLowerCase().includes(term)) ||
        (b.address && b.address.toLowerCase().includes(term))
    );
  }, [serviceData, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-xs font-bold mt-3 text-muted-foreground">Loading service listings...</p>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 text-foreground text-center">
        <p className="text-sm font-semibold text-rose-600 mb-4">{error || "Something went wrong."}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl shrink-0">
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center gap-3 md:gap-4 px-4 sm:px-6 w-full">

          <a href="/" className="hidden md:flex items-center shrink-0">
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-8 w-auto object-contain shrink-0"
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          {/* Search bar inside popular service detail page */}
          <div className="relative flex flex-1 items-center gap-1.5 md:gap-2 rounded-full border border-border bg-card px-2 py-1 md:py-1.5 shadow-[var(--shadow-card)] max-w-xl">
            <div className="hidden sm:flex items-center gap-1.5 border-r border-border px-3 py-1.5 text-xs sm:text-sm shrink-0">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="font-semibold text-foreground/80">Mumbai</span>
            </div>
            <input
              type="text"
              placeholder={`Search in ${serviceData.title}…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
              aria-label={`Search in ${serviceData.title}`}
            />
            <button
              aria-label="Submit search"
              className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 shrink-0"
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* User profile action */}
          <div className="hidden sm:flex items-center gap-2.5 ml-auto shrink-0">
            {username ? (
              <button
                onClick={onProfileClick}
                className="flex items-center gap-1.5 md:gap-2 rounded-full border border-border bg-card px-2 sm:px-3.5 py-1 sm:py-2 text-[11px] sm:text-sm font-semibold hover:bg-secondary cursor-pointer shrink-0"
              >
                <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-[10px] md:text-[11px] font-bold text-white uppercase shrink-0">
                  {username.charAt(0)}
                </div>
                <span className="hidden sm:inline text-foreground/80">{username}</span>
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="hidden sm:flex items-center gap-1 rounded-full bg-primary px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer shrink-0"
              >
                <User className="h-3.5 w-3.5" /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8 text-left">


        {/* Heading & Back Button Row */}
        <div className="mb-6 pl-0.5 flex flex-col gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBack}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-secondary transition cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="h-4.5 w-4.5 md:h-5 md:w-5 text-foreground" />
            </button>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Top {serviceData.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 pl-12 md:pl-14">
            Showing {filteredListings.length} verified {filteredListings.length === 1 ? "listing" : "listings"} ready to assist you.
          </p>
        </div>

        {/* Listings Container */}
        <div className="w-full">
          {filteredListings.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground border border-dashed border-border rounded-3xl bg-secondary/10">
              <p className="text-sm font-semibold italic">No listings found matching your search.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filteredListings.map((biz: any, idx: number) => {
                const bizImg = biz.images?.[0] || "";
                const resolvedImg = bizImg
                  ? (bizImg.startsWith("data:") || bizImg.startsWith("http")
                    ? bizImg
                    : `${BACKEND_ORIGIN}${bizImg}`)
                  : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80";

                return (
                  <div
                    key={biz.id || biz._id || idx}
                    onClick={() => onBusinessSelect(biz.id)}
                    className="flex flex-col sm:flex-row group overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] gap-4 cursor-pointer"
                  >
                    {/* Left: Listing Image */}
                    <div
                      className="relative h-44 w-full sm:w-60 overflow-hidden rounded-xl bg-secondary shrink-0 border border-border/40"
                    >
                      <img
                        src={resolvedImg}
                        alt={biz.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                      {biz.isVerified && (
                        <span className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                          <Check className="h-3 w-3 stroke-[3.5px]" />
                        </span>
                      )}
                    </div>

                    {/* Right: Info details */}
                    <div className="flex flex-1 flex-col justify-between p-1 sm:p-2">
                      <div>
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <h2
                            className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight"
                          >
                            {biz.name}
                          </h2>
                          {biz.isVerified ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-full shrink-0">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full shrink-0">
                              Unverified
                            </span>
                          )}
                        </div>

                        {/* Ratings */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-black text-white shrink-0">
                            <span>{biz.rating ? biz.rating.toFixed(1) : "0.0"}</span>
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {biz.reviewCount || 0} Ratings
                          </span>
                        </div>

                        {/* Address & Timings */}
                        <div className="mt-4 space-y-1.5 text-[13px] text-foreground/80">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="line-clamp-1">{biz.address}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                            <span>{biz.timings}</span>
                            <span className="ml-2 font-bold text-emerald-600 text-xs">
                              Open Now
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Actions buttons */}
                      <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/50">
                        <a
                          href={`tel:${biz.phone?.replace(/[^0-9+]/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition"
                        >
                          <Phone className="h-3.5 w-3.5 text-accent" />
                          Call
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEnquiryModal(biz);
                          }}
                          className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-primary px-4.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm hover:scale-[1.02]"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Enquire Now
                        </button>

                        {!biz.isBookingDisabled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookNow(biz.id);
                            }}
                            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm hover:scale-[1.02]"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Book Here
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBusinessSelect(biz.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-secondary/30 hover:bg-secondary px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition sm:ml-auto cursor-pointer"
                        >
                          Details <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Enquiry Modal */}
      {enquiryModalOpen && selectedBizForEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setEnquiryModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            {!enquirySubmitted ? (
              <form onSubmit={handleEnquirySubmit}>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">Send Enquiry</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Send your enquiry to{" "}
                  <span className="font-bold text-primary">{selectedBizForEnquiry.name}</span>
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="enquiryName" className="block text-xs font-bold text-foreground/80 mb-1.5">
                      Your Name*
                    </label>
                    <input
                      required
                      type="text"
                      id="enquiryName"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="enquiryPhone" className="block text-xs font-bold text-foreground/80 mb-1.5">
                      Your Phone Number*
                    </label>
                    <input
                      required
                      type="tel"
                      id="enquiryPhone"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="enquiryEmail" className="block text-xs font-bold text-foreground/80 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="enquiryEmail"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="enquiryMessage" className="block text-xs font-bold text-foreground/80 mb-1.5">
                      Message / Special Request
                    </label>
                    <textarea
                      id="enquiryMessage"
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm((prev) => ({ ...prev, message: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent resize-none"
                      placeholder="Specify dates, timings, or details of request..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition shadow-md cursor-pointer"
                  >
                    Submit Enquiry
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">Enquiry Sent!</h3>
                <p className="text-xs text-muted-foreground">
                  The business provider will reach out to you shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
