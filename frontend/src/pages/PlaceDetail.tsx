import { useState, useRef, useEffect } from "react";
import {
  MapPin, ArrowLeft, Bookmark, Share2,
  Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  MessageSquare, Phone, Info
} from "lucide-react";
import logoImg from "@/assets/logo.jpeg";
import { touristPlacesData, TouristPlaceDetailData } from "../data/touristPlacesData";
import Footer from "./Footer";

interface PlaceDetailPageProps {
  placeName: string;
  onBack: () => void;
  onBusinessSelect?: (id: string) => void;
  onSignInClick?: () => void;
  onProfileClick?: () => void;
  username?: string | null;
}

export default function PlaceDetailPage({ placeName, onBack, onBusinessSelect, onSignInClick, onProfileClick, username }: PlaceDetailPageProps) {
  // Get data for selected place or default to Ujjain
  const placeData: TouristPlaceDetailData = touristPlacesData[placeName] || touristPlacesData.Ujjain;

  const [bookmarked, setBookmarked] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  
  // Custom reviews state
  const [reviewsList, setReviewsList] = useState([
    {
      userName: "Rahul Sharma",
      userInitial: "R",
      userColor: "from-blue-500 to-indigo-600",
      rating: 5,
      date: "2 days ago",
      reviewText: `Our trip to ${placeData.name} was absolutely incredible. The temples are beautiful and the city has a magical spiritual vibe. Must visit for everyone!`
    },
    {
      userName: "Priya Patel",
      userInitial: "P",
      userColor: "from-rose-500 to-pink-600",
      rating: 4,
      date: "1 week ago",
      reviewText: `Loved exploring the local markets and the heritage sites. Street food was exceptionally delicious! Highly recommend visiting during the winters.`
    }
  ]);

  const [newReview, setNewReview] = useState({
    name: "",
    rating: 5,
    text: ""
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Scroll references for carousels
  const templesScrollRef = useRef<HTMLDivElement>(null);
  const hotelsScrollRef = useRef<HTMLDivElement>(null);
  const restaurantsScrollRef = useRef<HTMLDivElement>(null);
  const spasScrollRef = useRef<HTMLDivElement>(null);
  const activitiesScrollRef = useRef<HTMLDivElement>(null);

  // Scroll visibility states
  const [scrollStates, setScrollStates] = useState({
    temples: { left: false, right: true },
    hotels: { left: false, right: true },
    restaurants: { left: false, right: true },
    spas: { left: false, right: true },
    activities: { left: false, right: true }
  });

  const checkSectionScroll = (ref: React.RefObject<HTMLDivElement | null>, section: keyof typeof scrollStates) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setScrollStates(prev => ({
        ...prev,
        [section]: {
          left: scrollLeft > 10,
          right: scrollLeft + clientWidth < scrollWidth - 10
        }
      }));
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [placeName]);

  useEffect(() => {
    // Initial check
    const timers = [
      setTimeout(() => checkSectionScroll(templesScrollRef, "temples"), 200),
      setTimeout(() => checkSectionScroll(hotelsScrollRef, "hotels"), 200),
      setTimeout(() => checkSectionScroll(restaurantsScrollRef, "restaurants"), 200),
      setTimeout(() => checkSectionScroll(spasScrollRef, "spas"), 200),
      setTimeout(() => checkSectionScroll(activitiesScrollRef, "activities"), 200)
    ];

    return () => timers.forEach(clearTimeout);
  }, [placeName]);

  const handleCarouselScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right", section: keyof typeof scrollStates) => {
    if (ref.current) {
      const container = ref.current;
      const cardWidth = container.firstElementChild
        ? (container.firstElementChild as HTMLElement).offsetWidth
        : 280;
      const gap = 16;
      const scrollAmount = cardWidth + gap;

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });

      // Recalculate after smooth scroll ends
      setTimeout(() => checkSectionScroll(ref, section), 500);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${placeData.name} Tourism`,
        text: placeData.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("City tourism link copied to clipboard!");
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) {
      alert("Please enter both your name and review details.");
      return;
    }

    const firstLetter = newReview.name.charAt(0).toUpperCase();
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-purple-500 to-fuchsia-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600"
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setReviewsList([
      {
        userName: newReview.name,
        userInitial: firstLetter || "U",
        userColor: randomColor,
        rating: newReview.rating,
        date: "Just now",
        reviewText: newReview.text
      },
      ...reviewsList
    ]);

    setReviewSubmitted(true);
    setNewReview({ name: "", rating: 5, text: "" });
    
    setTimeout(() => {
      setReviewSubmitted(false);
    }, 4000);
  };

  const scrollToCategory = (categoryName: string) => {
    let elementId = "";
    if (categoryName === "Temples" || categoryName === "Forts & Palaces") elementId = "temples-sec";
    else if (categoryName === "Hotels") elementId = "hotels-sec";
    else if (categoryName === "Food Point") elementId = "food-sec";
    else if (categoryName === "Spas") elementId = "spas-sec";
    else if (categoryName === "Sightseeing" || categoryName === "Wine Tours") elementId = "activities-sec";

    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-6">
          <button onClick={onBack} className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition group-hover:bg-secondary">
              <ArrowLeft className="h-4 w-4 text-foreground animate-none group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-muted-foreground transition group-hover:text-foreground">Back</span>
          </button>

          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="flex items-center">
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-8 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          <div className="hidden md:flex ml-auto flex-1 max-w-md items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-[var(--shadow-card)]">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <input
              type="text"
              placeholder={`Search attractions in ${placeData.name}...`}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto md:ml-0">
            <button 
              onClick={() => onBack()}
              className="px-4 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground"
            >
              Home
            </button>
            <button className="hidden sm:block rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold transition hover:bg-secondary">
              Discover
            </button>
            {!username && (
              <button 
                onClick={onSignInClick}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 cursor-pointer"
              >
                Sign In
              </button>
            )}
            {username && (
              <button 
                onClick={onProfileClick}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:scale-105 transition-all duration-300 shadow-sm cursor-pointer font-bold text-xs bg-primary"
                title="Open Profile Menu"
              >
                {username.charAt(0).toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 pt-6 pb-20">
        
        {/* Collage Collage Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[260px] md:h-[380px] overflow-hidden rounded-3xl border border-border/80 shadow-md">
          {/* Main Large Image */}
          <div className="col-span-1 md:col-span-8 h-full relative group overflow-hidden">
            <img 
              src={placeData.coverImage} 
              alt={placeData.name} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-6 text-white pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/95 text-primary-foreground backdrop-blur-md mb-2 shadow-sm">
                Explore Destination
              </span>
              <h1 className="text-3xl md:text-5xl font-serif font-black leading-tight drop-shadow-md">
                {placeData.name}
              </h1>
            </div>
          </div>

          {/* Side Small Images Grid */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-4 h-full">
            {placeData.images.slice(1, 4).map((imgUrl, idx) => (
              <div key={idx} className="flex-1 relative overflow-hidden group rounded-xl border border-border/40">
                <img 
                  src={imgUrl} 
                  alt={`${placeData.name} scene ${idx + 1}`} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Title Block & Info Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Main details */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{placeData.name} Tourism</h2>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold shadow-sm">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>{placeData.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {placeData.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full border border-border bg-card text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex h-11 px-5 items-center gap-2 rounded-full border text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm ${bookmarked ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary text-foreground border-border"}`}
                >
                  <Bookmark className={`h-4.5 w-4.5 ${bookmarked ? "fill-primary-foreground" : ""}`} />
                  <span>{bookmarked ? "Saved" : "Save"}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition shadow-sm cursor-pointer"
                  title="Share Destination"
                >
                  <Share2 className="h-4.5 w-4.5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Overview / Description */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-foreground">About the Destination</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {placeData.description}
              </p>
            </div>
            
            {/* Category selection bar */}
            <div className="mt-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">Jump to Categories</h3>
              <div className="flex overflow-x-auto gap-3 pb-3 scroll-smooth no-scrollbar" style={{ scrollbarWidth: "none" }}>
                {placeData.categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => scrollToCategory(cat.name)}
                    className="flex items-center gap-2 bg-card hover:bg-secondary/80 border border-border/80 px-4 py-2.5 rounded-full text-xs font-bold text-foreground/90 shadow-sm shrink-0 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right quick stats panel */}
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)]">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <Info className="h-4.5 w-4.5 text-accent" />
              Quick Travel Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-bold text-muted-foreground">Best Time:</span>
                <span className="text-xs font-semibold text-foreground text-right">October to March (Winter)</span>
              </div>
              <div className="flex justify-between items-start gap-4 border-t border-border/40 pt-3">
                <span className="text-xs font-bold text-muted-foreground">Ideal Duration:</span>
                <span className="text-xs font-semibold text-foreground text-right">2 - 3 Days</span>
              </div>
              <div className="flex justify-between items-start gap-4 border-t border-border/40 pt-3">
                <span className="text-xs font-bold text-muted-foreground">Nearest Airport:</span>
                <span className="text-xs font-semibold text-foreground text-right">Indore (IDR) for Ujjain, Jaipur (JAI) for Jaipur</span>
              </div>
              <div className="flex justify-between items-start gap-4 border-t border-border/40 pt-3">
                <span className="text-xs font-bold text-muted-foreground">Local Transport:</span>
                <span className="text-xs font-semibold text-foreground text-right">Auto Rickshaw, E-Rickshaw, Cabs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Category Lists / Carousels */}
        
        {/* Section 1: Places to Visit / Temples */}
        {placeData.temples && placeData.temples.length > 0 && (
          <section id="temples-sec" className="mt-16 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Sightseeing</span>
                <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
                  Popular Places & Temples in {placeData.name}
                </h3>
              </div>
              {/* Carousel controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCarouselScroll(templesScrollRef, "left", "temples")}
                  disabled={!scrollStates.temples.left}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.temples.left ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronLeft className="h-4.5 w-4.5 text-foreground" />
                </button>
                <button
                  onClick={() => handleCarouselScroll(templesScrollRef, "right", "temples")}
                  disabled={!scrollStates.temples.right}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.temples.right ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronRight className="h-4.5 w-4.5 text-foreground" />
                </button>
              </div>
            </div>

            <div
              ref={templesScrollRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 w-full no-scrollbar pb-3 px-1"
              style={{ scrollbarWidth: "none" }}
              onScroll={() => checkSectionScroll(templesScrollRef, "temples")}
            >
              {placeData.temples.map((temple) => (
                <div
                  key={temple.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md snap-start shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <img 
                      src={temple.image} 
                      alt={temple.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span>{temple.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{temple.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2 italic">"{temple.desc}"</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {temple.tags.map(t => (
                        <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Hotels */}
        {placeData.hotels && placeData.hotels.length > 0 && (
          <section id="hotels-sec" className="mt-16 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Stays</span>
                <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
                  Top Hotels & Stays in {placeData.name}
                </h3>
              </div>
              {/* Carousel controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCarouselScroll(hotelsScrollRef, "left", "hotels")}
                  disabled={!scrollStates.hotels.left}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.hotels.left ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronLeft className="h-4.5 w-4.5 text-foreground" />
                </button>
                <button
                  onClick={() => handleCarouselScroll(hotelsScrollRef, "right", "hotels")}
                  disabled={!scrollStates.hotels.right}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.hotels.right ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronRight className="h-4.5 w-4.5 text-foreground" />
                </button>
              </div>
            </div>

            <div
              ref={hotelsScrollRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 w-full no-scrollbar pb-3 px-1"
              style={{ scrollbarWidth: "none" }}
              onScroll={() => checkSectionScroll(hotelsScrollRef, "hotels")}
            >
              {placeData.hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md snap-start shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span>{hotel.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{hotel.name}</h4>
                      <p className="text-[11px] font-semibold text-accent mt-1">{hotel.price}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{hotel.desc}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
                      <span className="text-[9px] font-extrabold text-muted-foreground px-2 py-0.5 rounded bg-secondary uppercase">{hotel.tags[0]}</span>
                      <button 
                        onClick={() => {
                          if (onBusinessSelect && hotel.businessId) {
                            onBusinessSelect(hotel.businessId);
                          } else {
                            alert("Contacting Hotel Booking Desk...");
                          }
                        }}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-semibold px-3 py-1.5 rounded-full text-[10px] transition-colors duration-300 cursor-pointer"
                      >
                        <Phone className="h-2.5 w-2.5" /> Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Restaurants */}
        {placeData.restaurants && placeData.restaurants.length > 0 && (
          <section id="food-sec" className="mt-16 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Food & Dining</span>
                <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
                  Where to Eat: Best Restaurants in {placeData.name}
                </h3>
              </div>
              {/* Carousel controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCarouselScroll(restaurantsScrollRef, "left", "restaurants")}
                  disabled={!scrollStates.restaurants.left}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.restaurants.left ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronLeft className="h-4.5 w-4.5 text-foreground" />
                </button>
                <button
                  onClick={() => handleCarouselScroll(restaurantsScrollRef, "right", "restaurants")}
                  disabled={!scrollStates.restaurants.right}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.restaurants.right ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronRight className="h-4.5 w-4.5 text-foreground" />
                </button>
              </div>
            </div>

            <div
              ref={restaurantsScrollRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 w-full no-scrollbar pb-3 px-1"
              style={{ scrollbarWidth: "none" }}
              onScroll={() => checkSectionScroll(restaurantsScrollRef, "restaurants")}
            >
              {placeData.restaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md snap-start shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <img 
                      src={rest.image} 
                      alt={rest.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span>{rest.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{rest.name}</h4>
                      <p className="text-[11px] font-semibold text-accent mt-1">{rest.price}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{rest.desc}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
                      <span className="text-[9px] font-extrabold text-muted-foreground px-2 py-0.5 rounded bg-secondary uppercase">{rest.tags[0]}</span>
                      <button 
                        onClick={() => alert("Connecting to Restaurant Desk for Table Booking...")}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-semibold px-3 py-1.5 rounded-full text-[10px] transition-colors duration-300 cursor-pointer"
                      >
                        Book Table
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Spas */}
        {placeData.spas && placeData.spas.length > 0 && (
          <section id="spas-sec" className="mt-16 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Relaxation</span>
                <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
                  Spas & Wellness in {placeData.name}
                </h3>
              </div>
              {/* Carousel controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCarouselScroll(spasScrollRef, "left", "spas")}
                  disabled={!scrollStates.spas.left}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.spas.left ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronLeft className="h-4.5 w-4.5 text-foreground" />
                </button>
                <button
                  onClick={() => handleCarouselScroll(spasScrollRef, "right", "spas")}
                  disabled={!scrollStates.spas.right}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.spas.right ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronRight className="h-4.5 w-4.5 text-foreground" />
                </button>
              </div>
            </div>

            <div
              ref={spasScrollRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 w-full no-scrollbar pb-3 px-1"
              style={{ scrollbarWidth: "none" }}
              onScroll={() => checkSectionScroll(spasScrollRef, "spas")}
            >
              {placeData.spas.map((spa) => (
                <div
                  key={spa.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md snap-start shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <img 
                      src={spa.image} 
                      alt={spa.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span>{spa.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{spa.name}</h4>
                      <p className="text-[11px] font-semibold text-accent mt-1">{spa.price}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{spa.desc}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
                      <span className="text-[9px] font-extrabold text-muted-foreground px-2 py-0.5 rounded bg-secondary uppercase">{spa.tags[0]}</span>
                      <button 
                        onClick={() => alert("Enquiring about spa packages...")}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-semibold px-3 py-1.5 rounded-full text-[10px] transition-colors duration-300 cursor-pointer"
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Activities */}
        {placeData.activities && placeData.activities.length > 0 && (
          <section id="activities-sec" className="mt-16 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Things to Do</span>
                <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
                  Popular Activities & Tour Packages
                </h3>
              </div>
              {/* Carousel controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCarouselScroll(activitiesScrollRef, "left", "activities")}
                  disabled={!scrollStates.activities.left}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.activities.left ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronLeft className="h-4.5 w-4.5 text-foreground" />
                </button>
                <button
                  onClick={() => handleCarouselScroll(activitiesScrollRef, "right", "activities")}
                  disabled={!scrollStates.activities.right}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm cursor-pointer transition ${!scrollStates.activities.right ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"}`}
                >
                  <ChevronRight className="h-4.5 w-4.5 text-foreground" />
                </button>
              </div>
            </div>

            <div
              ref={activitiesScrollRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 w-full no-scrollbar pb-3 px-1"
              style={{ scrollbarWidth: "none" }}
              onScroll={() => checkSectionScroll(activitiesScrollRef, "activities")}
            >
              {placeData.activities.map((act) => (
                <div
                  key={act.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md snap-start shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <img 
                      src={act.image} 
                      alt={act.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span>{act.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{act.name}</h4>
                      <p className="text-[11px] font-semibold text-accent mt-1">Cost: {act.price}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{act.desc}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
                      <span className="text-[9px] font-extrabold text-muted-foreground px-2 py-0.5 rounded bg-secondary uppercase">{act.tags[0]}</span>
                      <button 
                        onClick={() => alert("Booking activity details...")}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-semibold px-3 py-1.5 rounded-full text-[10px] transition-colors duration-300 cursor-pointer"
                      >
                        Book Activity
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs Section */}
        <section className="mt-20 border-t border-border/50 pt-16">
          <div className="max-w-3xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">FAQs</span>
            <h2 className="text-2xl font-serif font-black text-foreground mt-1 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {placeData.faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="rounded-xl border border-border/60 bg-card p-4.5 cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition hover:border-border/80"
                  onClick={() => setActiveFaqIndex(activeFaqIndex === index ? null : index)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-foreground">{faq.question}</span>
                    {activeFaqIndex === index ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  {activeFaqIndex === index && (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground border-t border-border/40 pt-3">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews-section" className="mt-20 border-t border-border/50 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews list */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-8">
                <MessageSquare className="h-5 w-5 text-accent" />
                <h2 className="text-2xl font-bold tracking-tight text-foreground">User Reviews & Experiences</h2>
              </div>

              <div className="space-y-6">
                {reviewsList.map((rev, index) => (
                  <div key={index} className="bg-card border border-border/60 p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-tr ${rev.userColor} shadow-inner`}>
                          {rev.userInitial}
                        </div>
                        <div>
                          <span className="text-[13px] font-bold text-foreground leading-tight block">{rev.userName}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">{rev.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < rev.rating ? "text-amber-500 fill-amber-500" : "text-border"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3.5 text-xs text-muted-foreground/90 leading-relaxed italic">
                      "{rev.reviewText}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Write a review form */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border/80 p-6 rounded-2xl shadow-md sticky top-24">
                <h3 className="text-[17px] font-bold text-foreground mb-4">Share Your Experience</h3>
                
                {reviewSubmitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
                    <span className="text-xs font-bold text-emerald-600 block">Thank you!</span>
                    <span className="text-[11px] text-muted-foreground mt-1 block">Your review has been successfully submitted.</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">Your Name</label>
                      <input 
                        type="text"
                        placeholder="Enter your name"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="cursor-pointer transition transform hover:scale-110"
                          >
                            <Star 
                              className={`h-6 w-6 ${star <= newReview.rating ? "text-amber-500 fill-amber-500" : "text-border"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">Your Review</label>
                      <textarea
                        rows={4}
                        placeholder="Write details about your travel experience..."
                        value={newReview.text}
                        onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 text-xs outline-none focus:border-primary resize-none"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold py-3 rounded-xl transition duration-300 cursor-pointer shadow"
                    >
                      Submit Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
