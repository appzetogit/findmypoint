import { useState, useEffect, useRef } from "react";
import {
  Bell,
  BellRing,
  Send,
  Image as ImageIcon,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Upload,
  Clock,
  Sparkles
} from "lucide-react";
import { API_BASE_URL, BACKEND_ORIGIN } from "../config";

interface NotificationHistoryItem {
  _id: string;
  title: string;
  body: string;
  imageUrl?: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  status: "sent" | "partially_sent" | "failed";
  sentBy?: string;
  createdAt: string;
}

export default function NotificationManagement() {
  // Form State - Only Title, Description, and Image
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Send State
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // History State
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAdminToken = () => localStorage.getItem("fmp_admin_token") || "";

  // ─── Fetch History ──────────────────────────────────────────────────────────
  const fetchHistory = async (page = 1, search = historySearch) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications/history?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${getAdminToken()}` }
        }
      );
      const data = await res.json();
      if (data.success) {
        setHistory(data.notifications || []);
        setHistoryTotal(data.total || 0);
        setHistoryPage(data.page || 1);
      }
    } catch (err) {
      console.error("Failed to load notification history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  // ─── Image Upload Handler (File only) ───────────────────────────────────────
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB for fast push delivery.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        alert("Failed to read image file");
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error reading image:", err);
      setIsUploadingImage(false);
    }
  };

  // ─── Send Notification (Broadcast to All Users) ────────────────────────────
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSendFeedback({ type: "error", message: "Please provide a notification title." });
      return;
    }
    if (!description.trim()) {
      setSendFeedback({ type: "error", message: "Please enter the notification description." });
      return;
    }

    if (!window.confirm("Are you sure you want to send this push notification to ALL users?")) {
      return;
    }

    setIsSending(true);
    setSendFeedback(null);

    try {
      const res = await fetch(`${API_BASE_URL}/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          imageUrl: imageUrl.trim() || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendFeedback({
          type: "success",
          message: data.message || `Notification sent successfully to ${data.successCount} users!`
        });
        // Reset form
        setTitle("");
        setDescription("");
        setImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchHistory(1);
      } else {
        setSendFeedback({
          type: data.recipientCount === 0 ? "warning" : "error",
          message: data.message || "Failed to dispatch notification."
        });
      }
    } catch (err: any) {
      console.error("Error sending notification:", err);
      setSendFeedback({ type: "error", message: err.message || "Server connection error." });
    } finally {
      setIsSending(false);
    }
  };

  // ─── Delete History Item ────────────────────────────────────────────────────
  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification record?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
        setHistoryTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  // Helper for image URL
  const formatImageSrc = (img?: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http://") || img.startsWith("https://")) {
      return img;
    }
    return `${BACKEND_ORIGIN}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Notification Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <span>Send push notification to all users</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                  <Clock className="h-3 w-3" /> Auto-expires from database after 3 days (TTL)
                </span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchHistory(historyPage)}
          className="self-start sm:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
          title="Refresh History"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── Feedback Banner ──────────────────────────────────────────────── */}
      {sendFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-sm border ${
            sendFeedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
              : sendFeedback.type === "warning"
              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50"
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {sendFeedback.type === "success" ? (
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
            ) : sendFeedback.type === "warning" ? (
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            ) : (
              <XCircle className="h-4.5 w-4.5 shrink-0" />
            )}
            <span>{sendFeedback.message}</span>
          </div>
          <button
            onClick={() => setSendFeedback(null)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── Two-Column Section: Form + Live Device Preview ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Composer Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-7 shadow-sm">
          <form onSubmit={handleSendNotification} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                <span>Send Notification</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900">
                To: All Users
              </span>
            </div>

            {/* Notification Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notification Title <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-bold ${title.length > 60 ? "text-amber-500" : "text-slate-400"}`}>
                  {title.length}/65 chars
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Special Offer: 20% Off on Top Doctors in Noida!"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notification Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notification Description <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-bold ${description.length > 180 ? "text-amber-500" : "text-slate-400"}`}>
                  {description.length}/220 chars
                </span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={250}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Explore verified local services, consult top professionals, and get exclusive discounts now on FindmyPoint."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Notification Image (File upload only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
                <span>Notification Image (Optional)</span>
              </label>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="notif-image-upload"
                />
                {!imageUrl ? (
                  <label
                    htmlFor="notif-image-upload"
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-850/50 group"
                  >
                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2">
                      {isUploadingImage ? "Processing image..." : "Click to upload notification image"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG, or WEBP (Max 2MB)
                    </span>
                  </label>
                ) : null}
              </div>

              {/* Image Preview Thumbnail */}
              {imageUrl && (
                <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={formatImageSrc(imageUrl)}
                    alt="Notification Attachment"
                    className="w-full max-h-48 object-cover"
                    onError={() => console.warn("Failed to preview image")}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                      Image Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-md transition cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit & Reset Buttons */}
            <div className="pt-3 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSending}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer ${
                  isSending
                    ? "bg-indigo-400 opacity-60 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Sending Notification to All Users...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Notification to All Users</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setImageUrl("");
                  setSendFeedback(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Mockup Preview (Clean Mobile Mockup only) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Preview
                </span>
              </div>
            </div>

            {/* Mobile Mockup */}
            <div className="mt-4">
              <div className="relative mx-auto max-w-[340px] rounded-[38px] border-4 border-slate-800 dark:border-slate-700 bg-slate-950 p-3 shadow-2xl text-white">
                {/* Speaker Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-4 w-28 bg-slate-800 rounded-full flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-900 mr-2" />
                  <div className="h-1 w-8 bg-slate-900 rounded-full" />
                </div>

                {/* Phone Status Bar */}
                <div className="pt-6 pb-2 px-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>12:30</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Notification Card */}
                <div className="py-2">
                  <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60 shadow-lg animate-fadeIn transition-all">
                    {/* Top Header of Notification */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src="/logo.png"
                          alt="FMP Logo"
                          className="h-4.5 w-4.5 rounded-md object-contain bg-white/10 p-0.5"
                          onError={(e: any) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span className="text-[11px] font-black tracking-wide text-slate-200">
                          FindMyPoint
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400">now</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {title.trim() || "Notification Title Appears Here"}
                    </h4>

                    {/* Description */}
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-3">
                      {description.trim() || "Your notification description text will be displayed right here on the user's mobile screen."}
                    </p>

                    {/* Attached Image Banner */}
                    {imageUrl && (
                      <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-700/70 max-h-36 bg-slate-950">
                        <img
                          src={formatImageSrc(imageUrl)}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-2 flex justify-center">
                  <div className="h-1 w-24 bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Sent Notification History ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-indigo-500" />
              <span>Sent Notifications ({historyTotal})</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Records are automatically deleted from database after 3 days</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  fetchHistory(1, e.target.value);
                }}
                placeholder="Search notifications..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => fetchHistory(historyPage)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              title="Refresh History"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table of History */}
        {loadingHistory ? (
          <div className="py-12 flex items-center justify-center text-slate-400 gap-2 text-xs font-semibold">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
            <span>Loading sent notifications...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-dashed border-slate-200 dark:border-slate-800">
            <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300">
              No notifications sent in the last 3 days
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Notifications automatically expire and delete after 3 days.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider rounded-xl">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Notification Details</th>
                  <th className="py-3 px-3">Image</th>
                  <th className="py-3 px-3">Target</th>
                  <th className="py-3 px-3">Delivered</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Sent Time</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                    {/* Title & Body */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {item.body}
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-3.5 px-3">
                      {item.imageUrl ? (
                        <div className="h-11 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                          <img
                            src={formatImageSrc(item.imageUrl)}
                            alt="Notif thumb"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No image</span>
                      )}
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        🌐 All Users
                      </span>
                    </td>

                    {/* Delivery Stats */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.successCount} / {item.recipientCount}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.failureCount > 0 ? `${item.failureCount} failed` : "100% delivered"}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "sent"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                            : item.status === "partially_sent"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                        }`}
                      >
                        {item.status === "sent"
                          ? "Delivered"
                          : item.status === "partially_sent"
                          ? "Partial"
                          : "Failed"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteHistory(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
