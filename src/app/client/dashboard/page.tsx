"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface TopMatch {
  match_id: string;
  talent_profile_id: string;
  talent_user_id: string;
  full_name: string;
  match_score: number;
  recommendation: string;
  status: string;
}

interface JobItem {
  id: string;
  title: string;
  category: string;
  status: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  created_at: string;
  required_skills: string[];
  top_matches: TopMatch[];
  escrow: { status: string; amount: number } | null;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  related_job_id: string | null;
  is_read: boolean;
  created_at: string;
}

/* ─── Job Status Tracker ─────────────────────────────────────────── */

function JobStatusTracker({ status }: { status: string }) {
  const steps = [
    { key: "active", label: "Posted", icon: "📝" },
    { key: "matched", label: "Matched", icon: "🤖" },
    { key: "in_progress", label: "In Progress", icon: "⚙️" },
    { key: "completed", label: "Selesai", icon: "✅" },
  ];

  const statusOrder: Record<string, number> = {
    active: 0,
    matched: 1,
    in_progress: 2,
    completed: 3,
    cancelled: -1,
  };

  const currentIndex = statusOrder[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <span className="text-sm">❌</span>
        <span className="text-xs text-red-600 font-medium">Dibatalkan</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const isActive = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                  isCurrent
                    ? "gradient-primary shadow-lg shadow-primary-500/20 scale-110 text-white"
                    : isActive
                      ? "bg-accent-500/10 text-accent-600"
                      : "bg-surface-100 text-surface-400"
                }`}
              >
                {isActive && i < currentIndex ? "✓" : step.icon}
              </div>
              <span
                className={`text-[9px] mt-1 font-medium transition-colors ${
                  isCurrent
                    ? "text-primary-600"
                    : isActive
                      ? "text-accent-600"
                      : "text-surface-300"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500 ${
                  i < currentIndex ? "bg-accent-500/30" : "bg-surface-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Notification Bell ──────────────────────────────────────────── */

function NotificationBell() {
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

  const typeIcons: Record<string, string> = {
    new_match: "🎯",
    job_accepted: "✅",
    job_rejected: "❌",
    payment_held: "💰",
    payment_released: "🎉",
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
      >
        <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
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
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`w-full text-left p-4 hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0 ${
                    !notif.is_read ? "bg-primary-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">
                      {typeIcons[notif.type] || "🔔"}
                    </span>
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
                <div className="text-2xl mb-2">🔔</div>
                <p className="text-xs text-surface-400">Belum ada notifikasi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */

export default function ClientDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/client/dashboard");
      const d = await res.json();
      if (!d.success && res.status === 401) {
        router.push("/login");
        return;
      }
      setJobs(d.data?.jobs || []);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAcceptTalent = async (matchId: string, jobId: string, talentName: string, talentUserId: string) => {
    if (!confirm(`Pilih ${talentName} untuk job ini?`)) return;

    await fetch(`/api/matches/${matchId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });

    // Find the job to get budget info
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      // Create escrow — now using the correct talent_user_id
      await fetch("/api/escrow/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          talent_user_id: talentUserId,
          amount: Number(job.budget_max || job.budget_min || 1000000),
        }),
      });
    }

    fetchDashboard();
  };

  const handleReleaseEscrow = async (jobId: string) => {
    if (!confirm("Rilis dana ke talenta? Job akan ditandai selesai.")) return;

    await fetch("/api/escrow/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId }),
    });

    fetchDashboard();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    active: "Aktif",
    matched: "Matched",
    in_progress: "In Progress",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Nav */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-sm text-white" style={{ fontFamily: "Outfit" }}>
              N
            </div>
            <span className="font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>Nyamby</span>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/client/post-job" className="btn-primary text-xs px-4 py-2">
              + Post Job Baru
            </Link>
            <Link href="/client/settings" className="text-sm text-surface-500 hover:text-surface-900 transition-colors" title="Pengaturan">
              ⚙️
            </Link>
            <button onClick={handleLogout} className="text-xs text-surface-400 hover:text-surface-700">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
              Dashboard Client 📋
            </h1>
            <p className="text-surface-500">
              Kelola job posting dan lihat talenta terbaik yang direkomendasikan AI.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: jobs.length, icon: "📝" },
            { label: "Aktif", value: jobs.filter((j) => j.status === "active").length, icon: "🟢" },
            { label: "In Progress", value: jobs.filter((j) => j.status === "in_progress").length, icon: "⏳" },
            { label: "Selesai", value: jobs.filter((j) => j.status === "completed").length, icon: "✅" },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>{stat.value}</div>
              <div className="text-xs text-surface-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Jobs List */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="glass rounded-2xl overflow-hidden card-hover">
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-surface-900">{job.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full status-${job.status}`}>
                          {statusLabels[job.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.required_skills.map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-surface-400 mb-4">
                        {job.budget_max && (
                          <span>💰 Rp {Number(job.budget_max).toLocaleString("id-ID")}</span>
                        )}
                        {job.deadline && (
                          <span>📅 {new Date(job.deadline).toLocaleDateString("id-ID")}</span>
                        )}
                        <span>📊 {job.top_matches.length} talenta dimatch</span>
                      </div>

                      {/* Job Status Tracker */}
                      <JobStatusTracker status={job.status} />
                    </div>

                    <div className="text-surface-400 text-sm">
                      {expandedJob === job.id ? "▲" : "▼"}
                    </div>
                  </div>
                </div>

                {/* Expanded: Matched Talents */}
                {expandedJob === job.id && (
                  <div className="px-6 pb-6 border-t border-surface-200 pt-4 animate-slide-up">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-surface-900">
                      🤖 AI Matched Talents
                    </h4>

                    {job.top_matches.length > 0 ? (
                      <div className="space-y-3">
                        {job.top_matches.map((match) => (
                          <div key={match.match_id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                                {match.full_name[0]}
                              </div>
                              <div>
                                <Link
                                  href={`/talent/profile/${match.talent_profile_id}`}
                                  className="text-sm font-medium text-surface-900 hover:text-primary-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {match.full_name}
                                </Link>
                                <div className="text-xs text-surface-400">
                                  {match.recommendation === "highly_recommended" ? "⭐ Sangat Direkomendasikan" : "✓ Direkomendasikan"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`text-xl font-bold ${Number(match.match_score) >= 80 ? "text-accent-600" : "text-primary-600"}`}>
                                  {Math.round(Number(match.match_score))}%
                                </div>
                                <div className="text-[10px] text-surface-400">Match Score</div>
                              </div>
                              {match.status === "recommended" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptTalent(match.match_id, job.id, match.full_name, match.talent_user_id);
                                  }}
                                  className="btn-primary text-xs px-3 py-1.5"
                                >
                                  Pilih & Bayar
                                </button>
                              )}
                              {match.status === "applied" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptTalent(match.match_id, job.id, match.full_name, match.talent_user_id);
                                  }}
                                  className="btn-primary text-xs px-3 py-1.5"
                                >
                                  Terima
                                </button>
                              )}
                              {match.status === "accepted" && (
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-accent-600">
                                  Diterima
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-surface-400">Belum ada talenta yang dimatch.</p>
                    )}

                    {/* Escrow Status */}
                    {job.escrow && (
                      <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium mb-1 text-surface-900">💳 Status Escrow</div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-3 py-1 rounded-full status-${job.escrow.status}`}>
                                {job.escrow.status === "held" ? "Dana Ditahan" : job.escrow.status === "released" ? "Dana Dirilis" : job.escrow.status}
                              </span>
                              <span className="text-sm text-surface-500">
                                Rp {Number(job.escrow.amount).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                          {job.escrow.status === "held" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReleaseEscrow(job.id);
                              }}
                              className="bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                            >
                              ✓ Approve & Rilis Dana
                            </button>
                          )}
                        </div>

                        {/* Visual Escrow Flow */}
                        <div className="flex items-center gap-2 mt-4">
                          {[
                            { label: "Dana Ditahan", active: true },
                            { label: "In Progress", active: job.escrow.status !== "held" || job.status === "in_progress" },
                            { label: "Dana Dirilis", active: job.escrow.status === "released" },
                          ].map((step, i) => (
                            <div key={i} className="flex items-center gap-2 flex-1">
                              <div className={`w-3 h-3 rounded-full ${step.active ? "bg-accent-500" : "bg-surface-200"}`} />
                              <span className={`text-[10px] ${step.active ? "text-accent-600" : "text-surface-400"}`}>
                                {step.label}
                              </span>
                              {i < 2 && <div className={`flex-1 h-px ${step.active ? "bg-accent-500/30" : "bg-surface-200"}`} />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>Belum ada job</h3>
            <p className="text-surface-500 text-sm mb-6">Post job pertamamu dan biarkan AI mencarikan talenta terbaik.</p>
            <Link href="/client/post-job" className="btn-primary">
              + Post Job Baru
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
