import { useState, useEffect } from "react";
import {
  MapPin, Clock, ArrowLeft, Bookmark, Share2,
  CheckCircle, MessageSquare, Eye, Calendar,
  ChevronRight, Phone, Heart, Award, ArrowRight, Star
} from "lucide-react";
import logoImg from "@/assets/logo.jpeg";
import { articlesData, ArticleData } from "../data/articlesData";
import Footer from "./Footer";

interface ArticleDetailPageProps {
  articleId: number;
  onBack: () => void;
  onArticleSelect?: (id: number) => void;
}

export default function ArticleDetailPage({ articleId, onBack, onArticleSelect }: ArticleDetailPageProps) {
  const article: ArticleData | undefined = articlesData.find((a) => a.id === articleId);

  // Fallback to first article if not found
  const currentArticle = article || articlesData[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentCount, setCommentCount] = useState(currentArticle.commentsCount);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Categories for the subheader (consistent with JDCollections / reference layout)
  const categoryBar = [
    { label: "Food & Beverage", active: currentArticle.category === "Food & Dining" },
    { label: "Travel & Tourism", active: false },
    { label: "Beauty & Fashion", active: currentArticle.category === "Wedding Style" },
    { label: "Health & Fitness", active: false },
    { label: "Recreation", active: false },
    { label: "Education & Career", active: currentArticle.category === "Home Decor" },
    { label: "Daily Needs", active: false }
  ];

  // Scroll to top when article changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
  }, [articleId]);

  const handleEnquire = (businessName: string) => {
    alert(`Enquiry submitted for ${businessName}! A customer representative will contact you soon.`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentArticle.title,
        text: currentArticle.introParagraphs[0],
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-6">
          <button onClick={onBack} className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition group-hover:bg-secondary">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-muted-foreground transition group-hover:text-foreground">Back to Home</span>
          </button>

          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="flex items-center">
            <img
              src={logoImg}
              alt="FindMyPoint Logo"
              className="h-8 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </a>

          {/* Search bar */}
          <div className="hidden md:flex ml-auto flex-1 max-w-md items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-[var(--shadow-card)]">
            <input
              type="text"
              placeholder="Search in this article..."
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
            <button className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
              Sign In
            </button>
          </div>
        </div>

        {/* Sub-Header Category Bar */}
        <div className="border-t border-border bg-card/60 overflow-x-auto no-scrollbar">
          <div className="mx-auto max-w-7xl flex items-center gap-6 px-6 py-2.5 whitespace-nowrap text-xs font-bold text-muted-foreground">
            {categoryBar.map((cat, idx) => (
              <span 
                key={idx} 
                className={`cursor-pointer transition-colors duration-200 hover:text-primary ${cat.active ? "text-primary border-b-2 border-primary pb-0.5" : ""}`}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-6">
          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:text-primary transition-colors">Home</a>
          <ChevronRight className="h-3 w-3 stroke-[2.5px]" />
          <span className="hover:text-primary transition-colors cursor-pointer">{currentArticle.category}</span>
          <ChevronRight className="h-3 w-3 stroke-[2.5px]" />
          <span className="text-foreground font-extrabold truncate max-w-xs sm:max-w-md">{currentArticle.title}</span>
        </nav>

        {/* Article Header Title */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground leading-[1.15] font-black">
            {currentArticle.title}
          </h1>

          {/* Views, Likes, Share Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {currentArticle.views}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" /> Comments ({commentCount})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLiked(!liked)} 
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card shadow-sm hover:bg-secondary transition-colors ${liked ? "text-rose-500 border-rose-200 bg-rose-50/30" : "text-muted-foreground"}`}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-rose-500" : ""}`} />
              </button>
              <button 
                onClick={() => setBookmarked(!bookmarked)} 
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card shadow-sm hover:bg-secondary transition-colors ${bookmarked ? "text-amber-500 border-amber-200 bg-amber-50/30" : "text-muted-foreground"}`}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-amber-500" : ""}`} />
              </button>
              <button 
                onClick={handleShare} 
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card shadow-sm hover:bg-secondary transition-colors text-muted-foreground"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Content (left) and Sidebar (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Gallery Section */}
            <div className="relative rounded-2xl overflow-hidden bg-secondary border border-border shadow-sm">
              <div className="aspect-[16/9] w-full overflow-hidden relative">
                <img
                  src={currentArticle.galleryImages[activeImageIndex] || currentArticle.mainImage}
                  alt={currentArticle.title}
                  className="h-full w-full object-cover transition-all duration-500"
                />
              </div>
              
              {/* Thumbnails list */}
              {currentArticle.galleryImages.length > 0 && (
                <div className="flex gap-2.5 p-4 bg-card border-t border-border">
                  {currentArticle.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-12 w-20 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImageIndex ? "border-primary scale-95 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Intro Text */}
            <div className="prose max-w-none text-[13px] leading-relaxed text-muted-foreground/95 font-semibold space-y-4">
              {currentArticle.introParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* List of Businesses details */}
            <div className="flex flex-col gap-12 mt-4">
              {currentArticle.businesses.map((biz) => (
                <section key={biz.id} id={biz.id} className="scroll-mt-28 border-t border-border/60 pt-8 flex flex-col gap-6">
                  {/* Business H3 Title */}
                  <div className="flex items-center justify-between border-b border-border/30 pb-3">
                    <h3 className="text-xl font-serif font-black text-foreground hover:text-primary transition-colors cursor-pointer">
                      {biz.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, sIdx) => {
                        const starVal = biz.rating || 5;
                        return (
                          <Star
                            key={sIdx}
                            className={`h-4 w-4 ${sIdx < Math.floor(starVal) ? "text-amber-500 fill-amber-500" : "text-muted/30"}`}
                          />
                        );
                      })}
                      <span className="text-xs font-bold text-muted-foreground ml-1">({biz.rating || 5.0})</span>
                    </div>
                  </div>

                  {/* Two Column Images (Side-by-side) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {biz.images.map((img, idx) => (
                      <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-sm bg-secondary group">
                        <img 
                          src={img} 
                          alt={`${biz.name} dish ${idx + 1}`} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      </div>
                    ))}
                  </div>

                  {/* Business Description */}
                  <p className="text-[13px] text-muted-foreground/90 font-medium leading-relaxed">
                    {biz.description}
                  </p>

                  {/* Testimonial Quote */}
                  {biz.quote && (
                    <div className="relative rounded-2xl bg-secondary/35 border border-border/40 p-6 flex flex-col gap-2">
                      <span className="absolute top-2 left-4 text-4xl text-accent/20 font-serif leading-none select-none">“</span>
                      <p className="text-xs italic text-muted-foreground font-semibold pl-4 z-10 leading-relaxed">
                        {biz.quote}
                      </p>
                      <span className="absolute bottom-2 right-4 text-4xl text-accent/20 font-serif leading-none select-none">”</span>
                    </div>
                  )}

                  {/* Business Meta Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    {/* Food Range */}
                    {biz.foodRange && (
                      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1.5 shadow-[var(--shadow-card)]">
                        <div className="flex items-center gap-2 text-accent">
                          <Award className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Range / Service</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                          {biz.foodRange}
                        </p>
                      </div>
                    )}

                    {/* Must Try */}
                    {biz.mustTry && (
                      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1.5 shadow-[var(--shadow-card)]">
                        <div className="flex items-center gap-2 text-amber-500">
                          <Award className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Must Try</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                          {biz.mustTry}
                        </p>
                      </div>
                    )}

                    {/* Price For Two */}
                    {biz.priceForTwo && (
                      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1.5 shadow-[var(--shadow-card)]">
                        <div className="flex items-center gap-2 text-emerald-500">
                          <Award className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price Estimate</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-snug">
                          {biz.priceForTwo}
                        </p>
                      </div>
                    )}

                    {/* Timings */}
                    {biz.timings && (
                      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1.5 shadow-[var(--shadow-card)]">
                        <div className="flex items-center gap-2 text-indigo-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timings</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-snug">
                          {biz.timings}
                        </p>
                      </div>
                    )}

                    {/* Address */}
                    {biz.address && (
                      <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-4 flex flex-col gap-1.5 shadow-[var(--shadow-card)]">
                        <div className="flex items-center gap-2 text-rose-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-snug line-clamp-1">
                          {biz.address}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex justify-end gap-3 mt-2">
                    <button 
                      onClick={() => handleEnquire(biz.name)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition shadow-sm cursor-pointer"
                    >
                      View Menu
                    </button>
                    <button 
                      onClick={() => handleEnquire(biz.name)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-md cursor-pointer"
                    >
                      <Phone className="h-3 w-3" /> Enquire Now
                    </button>
                  </div>
                </section>
              ))}
            </div>

            {/* Also Read Widget */}
            <div className="border-t border-border/60 pt-10 mt-6">
              <h4 className="text-[15px] font-black text-foreground mb-4">Also Read</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {currentArticle.recommendations.map((rec, rIdx) => (
                  <div key={rIdx} className="group flex flex-col gap-2 cursor-pointer">
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-secondary border border-border shadow-sm">
                      <img 
                        src={rec.img} 
                        alt={rec.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    <span className="text-[11.5px] font-bold text-foreground/80 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {rec.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
            
            {/* Author Profile Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-4">
                <img 
                  src={currentArticle.author.avatar} 
                  alt={currentArticle.author.name}
                  className="h-12 w-12 rounded-full object-cover border border-border shadow-sm"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-foreground">{currentArticle.author.name}</span>
                    {currentArticle.author.verified && (
                      <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-0.5">{currentArticle.author.role}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-accent" /> {currentArticle.author.date}
                </span>
                <span className="bg-secondary px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider text-primary">
                  {currentArticle.readTime}
                </span>
              </div>
            </div>

            {/* List of Contents (Table of Contents) */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-3">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest">List of Contents</h4>
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              </div>

              <ul className="flex flex-col gap-2.5">
                {currentArticle.businesses.map((biz) => (
                  <li key={biz.id}>
                    <a 
                      href={`#${biz.id}`} 
                      className="group flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-0.5"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(biz.id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <span className="truncate pr-4">{biz.name}</span>
                      <ChevronRight className="h-3 w-3 stroke-[2.5px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* More Like This (Vertical Widget) */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest">More like this</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="text-[10px] font-bold text-primary hover:underline lowercase">explore</a>
              </div>

              <div className="flex flex-col gap-4">
                {articlesData
                  .filter((a) => a.id !== currentArticle.id)
                  .map((art) => (
                    <div 
                      key={art.id} 
                      onClick={() => onArticleSelect && onArticleSelect(art.id)}
                      className="group flex items-start gap-3 cursor-pointer"
                    >
                      <div className="h-14 w-20 rounded-lg overflow-hidden bg-secondary border border-border shadow-sm shrink-0">
                        <img 
                          src={art.mainImage} 
                          alt={art.title} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent leading-none">
                          {art.category}
                        </span>
                        <h5 className="text-[11.5px] font-black text-foreground leading-snug group-hover:text-primary transition-colors mt-1 line-clamp-2">
                          {art.title}
                        </h5>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Related Tags */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-3">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Related Tags</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentArticle.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="cursor-pointer text-[10px] font-bold text-muted-foreground border border-border/60 bg-secondary/25 px-2.5 py-1.5 rounded-lg hover:border-primary/20 hover:bg-card hover:text-primary transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
