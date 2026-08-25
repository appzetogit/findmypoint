import { useState, useEffect } from "react";
import { X, BellOff } from "lucide-react";

export interface NotificationItem {
  id: string | number;
  title: string;
  text: string;
  time: string;
  type?: "info" | "success" | "warning" | "error";
  read?: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    try {
      // Remove legacy mock storage if present
      localStorage.removeItem("fmp_notifications:v1");

      const saved = localStorage.getItem("fmp_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        } else {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
      setNotifications([]);
    }
  }, []);

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("fmp_notifications", JSON.stringify(updated));
  };

  const deleteNotification = (id: string | number) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("fmp_notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem("fmp_notifications", JSON.stringify([]));
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
        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={clearAll}
              className="text-[11px] font-medium text-slate-400 hover:text-rose-500 cursor-pointer transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center text-xs font-medium text-muted-foreground bg-secondary/5 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-1">
            <BellOff className="w-5 h-5" />
          </div>
          <span className="font-bold text-foreground text-sm">No notifications yet</span>
          <span className="text-muted-foreground text-[11px] max-w-xs">
            You're all caught up! New alerts and updates will appear here.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`py-3.5 px-4 rounded-xl border border-border/60 bg-white shadow-xs text-left flex items-start justify-between gap-4 transition relative group ${
                notif.read ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-2.5 w-2.5 mt-1.5 rounded-full shrink-0 ${
                    notif.type === "success"
                      ? "bg-emerald-500"
                      : notif.type === "warning"
                        ? "bg-amber-500"
                        : notif.type === "error"
                          ? "bg-rose-500"
                          : "bg-primary"
                  }`}
                />
                <div>
                  <h4 className="text-xs font-black text-foreground">{notif.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {notif.text}
                  </p>
                  <span className="text-[9px] text-slate-400 font-bold block mt-2">
                    {notif.time}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteNotification(notif.id)}
                className="text-muted-foreground/50 hover:text-rose-500 transition p-1 cursor-pointer rounded"
                title="Delete notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
