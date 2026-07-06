"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  related_job_id: string | null;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, "target" | "check" | "x" | "money" | "spark" | "shield" | "bell"> = {
  new_match: "target",
  job_offer: "target",
  job_accepted: "check",
  job_rejected: "x",
  payment_held: "money",
  payment_released: "spark",
  payment_confirmed: "money",
  payment_failed: "x",
  auto_release: "spark",
  new_rating: "spark",
  dispute_opened: "shield",
  dispute_resolved: "shield",
};

export default function TalentActivityPage() {
  const router = useRouter();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${page}&per_page=20`);
      const d = await res.json();
      if (!d.success && res.status === 401) {
        router.push("/login");
        return;
      }
      if (d.success) {
        setItems(d.data.notifications);
        setUnreadCount(d.data.unread_count);
        setTotalPages(d.pagination?.total_pages || 1);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [router, page]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/talent/dashboard" className="flex items-center gap-2 shrink-0">
            <Logo height={28} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Link href="/talent/dashboard" className="text-surface-500 hover:text-surface-900 transition-colors">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="text-xs text-surface-400 hover:text-surface-700 ml-4">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-surface-900">Aktivitas</h1>
            <p className="text-surface-500 text-sm">
              Riwayat lengkap semua kejadian di akunmu — match baru, status job, pembayaran, dan dispute.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap shrink-0"
            >
              Tandai semua dibaca ({unreadCount})
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Icon name="bell" className="mx-auto mb-4 text-surface-300" size={40} />
            <h3 className="text-lg font-bold text-surface-900 mb-2">Belum ada aktivitas</h3>
            <p className="text-sm text-surface-500">
              Aktivitas akunmu akan muncul di sini begitu ada job match, pembayaran, atau update lainnya.
            </p>
          </div>
        ) : (
          <>
            <div className="glass rounded-xl overflow-hidden divide-y divide-surface-100">
              {items.map((item) => {
                const inner = (
                  <div className="flex items-start gap-3 p-4">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        item.is_read ? "bg-surface-100 text-surface-400" : "bg-primary-50 text-primary-600"
                      }`}
                    >
                      <Icon name={typeIcons[item.type] || "bell"} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${item.is_read ? "text-surface-500" : "text-surface-900 font-medium"}`}>
                        {item.message}
                      </p>
                      <span className="text-[11px] text-surface-400 mt-1 block">{timeAgo(item.created_at)}</span>
                    </div>
                    {!item.is_read && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />}
                  </div>
                );

                return item.related_job_id ? (
                  <Link
                    key={item.id}
                    href={`/jobs/${item.related_job_id}`}
                    className="block hover:bg-surface-50 transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={item.id}>{inner}</div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-xs text-surface-500">
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 bg-white border border-surface-200 hover:bg-surface-50 text-surface-600 text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 bg-white border border-surface-200 hover:bg-surface-50 text-surface-600 text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
