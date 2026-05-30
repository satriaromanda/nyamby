"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Briefcase, CheckCircle, XCircle, DollarSign, HandCoins, BellRing } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  related_job_id: string | null;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  new_match: <Briefcase className="w-3.5 h-3.5" />,
  job_accepted: <CheckCircle className="w-3.5 h-3.5" />,
  job_rejected: <XCircle className="w-3.5 h-3.5" />,
  payment_held: <DollarSign className="w-3.5 h-3.5" />,
  payment_released: <HandCoins className="w-3.5 h-3.5" />,
};

const typeColors: Record<string, string> = {
  new_match: "bg-primary-50 text-primary-600",
  job_accepted: "bg-accent-500/10 text-accent-600",
  job_rejected: "bg-red-50 text-red-600",
  payment_held: "bg-amber-50 text-amber-600",
  payment_released: "bg-accent-500/10 text-accent-600",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    const d = await res.json();
    if (d.success) {
      setNotifications(d.data.notifications || []);
      setUnreadCount(d.data.unread_count || 0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
    fetchNotifications();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-surface-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-surface-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-primary text-white text-[10px] flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-xl border border-surface-200 overflow-hidden z-50 animate-scale-in">
          <div className="p-3 border-b border-surface-200">
            <span className="text-sm font-semibold text-surface-900">Notifikasi</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`w-full text-left p-3 hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0 ${
                    !n.is_read ? "bg-primary-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[n.type] || "bg-surface-100 text-surface-500"}`}>
                      {typeIcons[n.type] || <BellRing className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-surface-900 leading-relaxed line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-surface-400 mt-1 block">{timeAgo(n.created_at)}</span>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-surface-400">Belum ada notifikasi</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
