import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fmp_notifications:v1");
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const defaultNotifs = [
          {
            id: 1,
            title: "Welcome to FindmyPoint!",
            text: "Your search for local points made simple. Complete your profile details to unlock premium configurations.",
            time: "2 hours ago",
            type: "info",
            read: false,
          },
          {
            id: 2,
            title: "Table Reserved Successfully",
            text: "Your reservation at Shree shyam restaurant has been confirmed. Receipt FMP-8921 generated.",
            time: "1 day ago",
            type: "success",
            read: false,
          },
          {
            id: 3,
            title: "Security Alert: New Sign-in",
            text: "Logged into your account from Jaipur, IN.",
            time: "2 days ago",
            type: "warning",
            read: true,
          },
        ];
        localStorage.setItem("fmp_notifications:v1", JSON.stringify(defaultNotifs));
        setNotifications(defaultNotifs);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  }, []);

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("fmp_notifications:v1", JSON.stringify(updated));
  };

  const deleteNotification = (id: number) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("fmp_notifications:v1", JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg font-black text-foreground">Alert Hub</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Security updates and confirmation summaries.
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-black text-primary hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-xs font-bold text-slate-400 bg-secondary/5">
          Clean state. You have no notifications.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-4 transition relative ${
                notif.read
                  ? "bg-card border-border/80 opacity-75"
                  : "bg-primary/5 border-primary/20 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-2.5 w-2.5 mt-1.5 rounded-full shrink-0 ${
                    notif.type === "success"
                      ? "bg-emerald-500"
                      : notif.type === "warning"
                        ? "bg-amber-500"
                        : "bg-primary"
                  }`}
                />
                <div>
                  <h4 className="text-xs font-black text-foreground">{notif.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed pr-8">
                    {notif.text}
                  </p>
                  <span className="text-[9px] text-slate-400 font-bold block mt-2">
                    {notif.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteNotification(notif.id)}
                className="text-slate-400 hover:text-rose-500 transition p-1 hover:bg-secondary/40 rounded-lg cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
