"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@/components/icons";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  message: string;
  related_job_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const d = await res.json();
      if (d.success) {
        setNotifications(d.data.notifications);
        setUnreadCount(d.data.unread_count);
      }
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    
    setIsOpen(false);
    
    if (notif.related_job_id) {
      const workspaceTypes = [
        "payment_held", "payment_released", "payment_failed",
        "job_started", "job_submitted", "job_revision", "job_completed", 
        "new_message", "dispute_opened", "refund_received",
        "job_accepted", "job_rejected"
      ];
      
      if (workspaceTypes.includes(notif.type)) {
        router.push(`/workspace/${notif.related_job_id}`);
      } else {
        router.push(`/jobs/${notif.related_job_id}`);
      }
    }
  };

  const typeIcons: Record<string, "target" | "check" | "x" | "money" | "spark"> = {
    new_match: "target",
    job_accepted: "check",
    job_rejected: "x",
    payment_held: "money",
    payment_released: "spark",
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-surface-100 transition-colors"
        aria-label="Notifications"
      >
        <Icon name="bell" className="text-surface-500" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl overflow-hidden shadow-xl shadow-black/10 border border-surface-200 animate-scale-in z-50">
          <div className="p-4 border-b border-surface-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-surface-900">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] text-primary-600 font-medium">
                  {unreadCount} belum dibaca
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 15).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-4 hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0 ${
                    !notif.is_read ? "bg-primary-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon name={typeIcons[notif.type] || "bell"} className="shrink-0 mt-0.5 text-primary-600" size={18} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!notif.is_read ? "text-surface-900" : "text-surface-500"}`}>
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-surface-400 mt-1 block">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <Icon name="bell" className="mx-auto mb-2 text-surface-300" size={26} />
                <p className="text-xs text-surface-400">Belum ada notifikasi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
