import React, { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Share2,
  Download,
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare,
  Bot,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sliders,
  Palette,
  Type,
  Maximize2,
  Send,
  History,
  TrendingUp,
  Clock,
  Eye,
  Plus
} from "lucide-react";
import { BusinessListingData } from "../data/businessesData";

interface PostMediaProps {
  clientListings: BusinessListingData[];
}

interface SocialChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
  profileName?: string;
  colorClass: string;
}

interface CampaignLog {
  id: string;
  timestamp: string;
  prompt: string;
  bizName: string;
  caption: string;
  aspectRatio: string;
  primaryColor: string;
  title: string;
  discount: string;
  channels: string[];
  reach: number;
  clicks: number;
}

export default function PostMedia({ clientListings }: PostMediaProps) {
  // Config states
  const [selectedBizId, setSelectedBizId] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"square" | "story" | "landscape">("square");
  const [primaryColor, setPrimaryColor] = useState("#6366f1"); // default Indigo
  const [fontStyle, setFontStyle] = useState<"sans" | "serif" | "mono">("sans");
  const [discountVal, setDiscountVal] = useState("20% OFF");
  
  // Custom text overlays
  const [customTitle, setCustomTitle] = useState("EXCLUSIVE SUMMER DEALS");
  const [customSub, setCustomSub] = useState("Premium Service Available Today");
  const [customContact, setCustomContact] = useState("+91 98765 43210");

  // Output generated poster/caption states
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [posterTitle, setPosterTitle] = useState("");

  // Social networks states
  const [channels, setChannels] = useState<SocialChannel[]>([
    { id: "facebook", name: "Meta Graph API (FB)", icon: <Facebook className="h-4 w-4" />, isConnected: true, profileName: "Official Page", colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
    { id: "instagram", name: "Meta Graph API (IG)", icon: <Instagram className="h-4 w-4" />, isConnected: true, profileName: "@biz_official", colorClass: "text-pink-600 bg-pink-50 dark:bg-pink-950/20" },
    { id: "whatsapp", name: "Z-API (WhatsApp)", icon: <MessageSquare className="h-4 w-4" />, isConnected: false, colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" },
    { id: "linkedin", name: "LinkedIn API", icon: <Linkedin className="h-4 w-4" />, isConnected: true, profileName: "Company Profile", colorClass: "text-sky-700 bg-sky-50 dark:bg-sky-950/20" },
  ]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["facebook", "instagram"]);

  // Publishing simulation states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<string[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Saved campaigns logs
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);

  // Automatically select the first business if available
  useEffect(() => {
    if (clientListings.length > 0 && !selectedBizId) {
      setSelectedBizId(clientListings[0].id);
    }
  }, [clientListings]);

  // Load history logs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fmp_marketing_campaigns");
      if (saved) {
        setCampaignLogs(JSON.parse(saved));
      } else {
        // Generate mock logs for premium feel
        const mockLogs: CampaignLog[] = [
          {
            id: `camp-${Date.now() - 86400000 * 2}`,
            timestamp: "02/07/2026 14:35",
            prompt: "Special discount for grand opening AC repairs service",
            bizName: clientListings[0]?.name || "Vishal Mega Mart",
            caption: "🚨 MEGA OPENING OFFER! 🚨 Get your AC services done with an exclusive discount. Fast & reliable. Book your slot now! #ACRepair #OpeningDiscount",
            aspectRatio: "square",
            primaryColor: "#059669",
            title: "GRAND OPENING SALE",
            discount: "25% DISCOUNT",
            channels: ["facebook", "instagram"],
            reach: 1240,
            clicks: 185
          },
          {
            id: `camp-${Date.now() - 86400000 * 5}`,
            timestamp: "29/06/2026 09:10",
            prompt: "Monsoon cleaning services catalog launch",
            bizName: clientListings[0]?.name || "Vishal Mega Mart",
            caption: "Keep your spaces pristine this monsoon season. Our professional cleaning agents are fully sanitized and ready to help. 🧼🌧️ #MonsoonReady #DeepCleaning",
            aspectRatio: "landscape",
            primaryColor: "#4f46e5",
            title: "MONSOON CLEANING DEALS",
            discount: "SPECIAL PACKAGE",
            channels: ["facebook", "linkedin"],
            reach: 890,
            clicks: 112
          }
        ];
        setCampaignLogs(mockLogs);
        localStorage.setItem("fmp_marketing_campaigns", JSON.stringify(mockLogs));
      }
    } catch (e) {}
  }, [clientListings]);

  const activeBiz = useMemo(() => {
    return clientListings.find(b => b.id === selectedBizId);
  }, [selectedBizId, clientListings]);

  // Parse prompt keywords to design poster title
  const handleGeneratePoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    
    // Simulate Gemini API processing prompt & parsing parameters
    setTimeout(() => {
      const upperPrompt = promptInput.toUpperCase();
      let genTitle = "EXCLUSIVE PROMOTIONS";
      let genSub = "Top Rated Services & Quality Catalog";
      let genDiscount = "SPECIAL PRICE";

      if (upperPrompt.includes("DISCOUNT") || upperPrompt.includes("OFF") || upperPrompt.includes("%")) {
        const match = promptInput.match(/\d+%/);
        genDiscount = match ? `${match[0]} DISCOUNT` : "SPECIAL DISCOUNT";
      }

      // Keyword based titles
      if (upperPrompt.includes("AC") || upperPrompt.includes("REPAIR")) {
        genTitle = "PROFESSIONAL REPAIRS";
        genSub = "Expert technicians at your doorstep";
      } else if (upperPrompt.includes("CLEAN") || upperPrompt.includes("DEEP CLEAN")) {
        genTitle = "PREMIUM DEEP CLEANING";
        genSub = "Sparkling clean home and office spaces";
      } else if (upperPrompt.includes("FESTIVE") || upperPrompt.includes("DIWALI") || upperPrompt.includes("SALE")) {
        genTitle = "FESTIVE MEGA SALE";
        genSub = "Celebrate with special offers";
      } else {
        // Fallback to prompt words
        const words = promptInput.split(" ").filter(w => w.length > 3);
        if (words.length > 1) {
          genTitle = `${words[0].toUpperCase()} ${words[1].toUpperCase()}`;
        }
      }

      setPosterTitle(genTitle);
      setCustomTitle(genTitle);
      setCustomSub(genSub);
      setDiscountVal(genDiscount);
      if (activeBiz) {
        setCustomContact(activeBiz.phone || "+91 98765 43210");
      }

      // Generate AI Social media caption
      const generatedCaption = `🔥 SPECIAL OFFER FROM ${activeBiz?.name.toUpperCase() || "US"}! 🔥\n\nWe are launching our new campaign: "${promptInput}".\n\n✅ ${genSub}\n💥 Offer Details: ${genDiscount}\n📞 Contact us now: ${activeBiz?.phone || "+91 98765 43210"}\n\n#${activeBiz?.category.replace(/\s+/g, '') || "Marketing"} #PromoCampaign #GeminiAI #AutoPoster`;
      setCaptionText(generatedCaption);

      setIsGenerated(true);
      setIsGenerating(false);
    }, 1800);
  };

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(c => c !== channelId) 
        : [...prev, channelId]
    );
  };

  const handlePublishCampaign = () => {
    if (selectedChannels.length === 0) {
      alert("Please select at least one social media channel.");
      return;
    }

    setShowPublishModal(true);
    setIsPublishing(true);
    setPublishProgress([]);

    const steps = [
      "Analyzing generated marketing canvas...",
      "Compiling Gemini SVG high-resolution poster render...",
      "Uploading binary assets to media hosting server...",
      ...selectedChannels.map(ch => {
        if (ch === "facebook") return "Meta Graph API: Creating feed node for Facebook Page...";
        if (ch === "instagram") return "Meta Graph API: Publishing photo container to Instagram Business Profile...";
        if (ch === "whatsapp") return "Z-API Gateway: Sending broadcast status status update...";
        if (ch === "linkedin") return "LinkedIn API: Sharing partner share URN update...";
        return `Publishing to ${ch} node...`;
      }),
      "Finalizing campaign registry & links..."
    ];

    let currentStep = 0;
    const runSimulation = () => {
      if (currentStep < steps.length) {
        setPublishProgress(prev => [...prev, steps[currentStep]]);
        currentStep++;
        setTimeout(runSimulation, 800);
      } else {
        // Complete
        setIsPublishing(false);
        
        // Add to logs
        const newCampaign: CampaignLog = {
          id: `camp-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-IN", { hour12: false }).replace(",", ""),
          prompt: promptInput,
          bizName: activeBiz?.name || "General Business",
          caption: captionText,
          aspectRatio,
          primaryColor,
          title: customTitle,
          discount: discountVal,
          channels: selectedChannels,
          reach: Math.floor(Math.random() * 200) + 10, // initial simulated reach
          clicks: 0
        };

        const updatedLogs = [newCampaign, ...campaignLogs];
        setCampaignLogs(updatedLogs);
        localStorage.setItem("fmp_marketing_campaigns", JSON.stringify(updatedLogs));
      }
    };

    setTimeout(runSimulation, 500);
  };

  // Helper colors for selection
  const colorSwatches = ["#6366f1", "#059669", "#dc2626", "#d97706", "#2563eb", "#db2777", "#7c3aed"];

  return (
    <div className="space-y-8 animate-fade-in-up text-left max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h3 className="font-serif text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-500" />
            AI Poster &amp; Media Marketing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prompt-to-poster templates powered by Gemini LLM &amp; multi-channel social API posting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Creator inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              1. Gemini Campaign Generator
            </h4>

            <form onSubmit={handleGeneratePoster} className="space-y-4">
              {/* Select Business */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Target Listing</label>
                <select
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  {clientListings.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name} ({biz.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Creative Prompt</label>
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe your offer... E.g., 'Diwali sale offering 20% discount on professional deep sofa cleaning services'"
                  rows={3}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["square", "story", "landscape"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase border transition cursor-pointer ${
                        aspectRatio === ratio
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Brand Color Theme</label>
                <div className="flex flex-wrap items-center gap-2">
                  {colorSwatches.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPrimaryColor(color)}
                      className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 shadow-sm relative transition transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: color }}
                    >
                      {primaryColor === color && (
                        <span className="absolute inset-0.5 rounded-full border border-white flex items-center justify-center text-[10px] text-white">✓</span>
                      )}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-6 w-6 rounded-full border-none p-0 cursor-pointer overflow-hidden shadow-sm"
                    title="Choose Custom Color"
                  />
                </div>
              </div>

              {/* Font Family selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Typography</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["sans", "serif", "mono"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFontStyle(style)}
                      className={`py-1.5 rounded-lg text-[10px] font-black uppercase border transition cursor-pointer ${
                        fontStyle === style
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Trigger */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Gemini Designing Canvas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                    <span>Generate Poster Design</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Visual Canvas & Publishing channels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!isGenerated ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-550 shadow-sm flex flex-col items-center justify-center h-full min-h-[380px]">
              <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-800 mb-4 animate-bounce" />
              <h5 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">Poster Canvas Workspace</h5>
              <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">
                Fill in the AI Creative prompt on the left and click Generate to design your custom vector marketing poster instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Poster Canvas Preview (md:col-span-7) */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-slate-100 dark:bg-slate-950 p-4 border border-slate-200/40 dark:border-slate-800/50 rounded-3xl flex justify-center items-center shadow-inner overflow-hidden min-h-[340px]">
                  {/* Dynamic SVG Poster Canvas */}
                  <div
                    className="w-full relative shadow-lg overflow-hidden border border-slate-200/30 transition-all rounded-2xl flex flex-col justify-between p-5 text-white"
                    style={{
                      backgroundColor: primaryColor,
                      fontFamily: fontStyle === "mono" ? "monospace" : fontStyle === "serif" ? "Georgia, serif" : "sans-serif",
                      aspectRatio: aspectRatio === "story" ? "9/16" : aspectRatio === "landscape" ? "16/9" : "1/1",
                      maxWidth: "100%",
                      width: aspectRatio === "story" ? "210px" : "320px"
                    }}
                  >
                    {/* SVG Graphic Elements */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
                      <svg width="100%" height="100%">
                        <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                          <circle cx="20" cy="20" r="2" fill="#ffffff" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#pattern)" />
                      </svg>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[8px] font-black uppercase bg-white/20 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                        {activeBiz?.name || "Business Brand"}
                      </span>
                      <span className="text-[7px] font-bold text-white/70 uppercase">
                        {activeBiz?.category || "Services"}
                      </span>
                    </div>

                    {/* Core Body Text */}
                    <div className="my-auto py-4 z-10 text-left space-y-3">
                      {/* Sub header overlay */}
                      <input
                        type="text"
                        value={customSub}
                        onChange={(e) => setCustomSub(e.target.value.toUpperCase())}
                        className="text-[9px] font-black tracking-widest text-white/80 uppercase bg-transparent border-b border-transparent hover:border-white/30 focus:border-white w-full focus:outline-none py-0.5"
                      />

                      {/* Main Title Overlay */}
                      <textarea
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value.toUpperCase())}
                        rows={2}
                        className="text-lg font-black leading-tight tracking-tight uppercase bg-transparent border border-transparent hover:border-white/30 focus:border-white w-full resize-none focus:outline-none p-0.5"
                      />

                      {/* Discount pill overlay */}
                      <input
                        type="text"
                        value={discountVal}
                        onChange={(e) => setDiscountVal(e.target.value)}
                        className="w-fit text-[9px] font-black uppercase bg-yellow-400 text-slate-950 px-2 py-0.8 rounded-md shadow-md block border border-transparent hover:border-slate-900 focus:outline-none"
                      />
                    </div>

                    {/* Footer Contact overlay */}
                    <div className="flex items-center justify-between border-t border-white/20 pt-3.5 z-10">
                      <div className="text-[8px] space-y-0.5 text-left">
                        <span className="text-white/60 block">Book Service at</span>
                        <input
                          type="text"
                          value={customContact}
                          onChange={(e) => setCustomContact(e.target.value)}
                          className="font-extrabold bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none w-full py-0.5"
                        />
                      </div>
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shadow">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-350 fill-yellow-350" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-semibold text-slate-400 text-center flex items-center justify-center gap-1">
                  <Maximize2 className="h-3 w-3" />
                  <span>Tip: Click and edit the poster title/contact texts directly on the canvas!</span>
                </div>
              </div>

              {/* Publisher Dashboard (md:col-span-5) */}
              <div className="md:col-span-5 space-y-5">
                {/* AI Caption Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1">
                      <Bot className="h-4 w-4 text-indigo-500" />
                      AI Copy Caption
                    </h5>
                    <button
                      onClick={() => {
                        const regenerated = `🚨 HASSLE FREE ${activeBiz?.name.toUpperCase()} SOLUTIONS! 🚨\n\nTake advantage of this limited offer:\n\n🔥 ${customTitle}\n📢 Offer details: ${discountVal}\n📞 Contact details: ${customContact}\n\n#BestDeals #AIProductivity #FindmyPoint`;
                        setCaptionText(regenerated);
                      }}
                      className="text-[9px] font-black text-indigo-500 uppercase hover:underline cursor-pointer"
                    >
                      Rewrite
                    </button>
                  </div>
                  <textarea
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    rows={4}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* API Connections & Channels */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-5 shadow-sm space-y-4">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    2. Select Social Channels
                  </h5>

                  <div className="space-y-2">
                    {channels.map((chan) => (
                      <div
                        key={chan.id}
                        onClick={() => handleChannelToggle(chan.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedChannels.includes(chan.id)
                            ? "bg-slate-50/80 dark:bg-slate-950/60 border-indigo-500/55 shadow-sm"
                            : "border-slate-200/60 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-950/20 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${chan.colorClass}`}>
                            {chan.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black text-slate-800 dark:text-white">{chan.name}</p>
                            <p className="text-[9px] text-slate-400 font-semibold">
                              {chan.isConnected ? `Connected: ${chan.profileName}` : "Disconnected (Click to configure)"}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(chan.id)}
                          onChange={() => {}} // toggled on container click
                          className="h-3.5 w-3.5 accent-indigo-600 rounded border-slate-300"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePublishCampaign}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Publish Social Campaign</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Logs History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <History className="h-5 w-5 text-indigo-500" />
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Campaign Registry logs</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaignLogs.map((log) => (
            <div
              key={log.id}
              className="border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 flex gap-4 hover:border-slate-350 dark:hover:border-slate-700 transition"
            >
              {/* Poster Thumbnail */}
              <div
                className="w-20 rounded-xl flex flex-col justify-between p-2 text-[6px] font-bold text-white shrink-0 shadow overflow-hidden"
                style={{
                  backgroundColor: log.primaryColor,
                  aspectRatio: log.aspectRatio === "story" ? "9/16" : log.aspectRatio === "landscape" ? "16/9" : "1/1",
                  height: "80px"
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate max-w-[40px] font-black uppercase text-[5px] bg-white/20 px-1 py-0.2 rounded">
                    {log.bizName}
                  </span>
                </div>
                <div className="my-auto font-black text-center text-[7px] leading-tight uppercase truncate">
                  {log.title}
                </div>
                <div className="text-[5px] text-white/80">
                  {log.discount}
                </div>
              </div>

              {/* Campaign Content Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between text-xs font-semibold">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-slate-900 dark:text-white truncate">{log.bizName}</span>
                    <span className="text-[9px] font-black text-slate-400 shrink-0">{log.timestamp.split(" ")[0]}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2" title={log.caption}>
                    {log.caption}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                  <div className="flex items-center gap-1">
                    {log.channels.map((ch) => (
                      <span
                        key={ch}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 hover:scale-105 transition"
                        title={`Published to ${ch}`}
                      >
                        {ch === "facebook" && <Facebook className="h-3.5 w-3.5 text-blue-600" />}
                        {ch === "instagram" && <Instagram className="h-3.5 w-3.5 text-pink-600" />}
                        {ch === "whatsapp" && <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />}
                        {ch === "linkedin" && <Linkedin className="h-3.5 w-3.5 text-sky-700" />}
                      </span>
                    ))}
                  </div>

                  {/* Reach/Clicks simulated KPIs */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {log.reach} Reach</span>
                    <span className="flex items-center gap-1 text-indigo-500"><TrendingUp className="h-3.5 w-3.5" /> {log.clicks} Clicks</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Simulation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-in text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2.5">
              {isPublishing ? (
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              )}
              <h4 className="font-bold text-base">
                {isPublishing ? "Publishing Multi-Channel Campaign..." : "Campaign Published Successfully!"}
              </h4>
            </div>

            {/* Simulated steps logger */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-xs font-mono space-y-2 h-44 overflow-y-auto no-scrollbar">
              {publishProgress.map((step, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-650 dark:text-slate-350">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end text-xs font-bold pt-2">
              <button
                disabled={isPublishing}
                onClick={() => setShowPublishModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
