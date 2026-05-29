"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface SkillGapRec {
  skill_name: string;
  priority: string;
  reason: string;
  estimated_impact: string;
}

interface RecommendedJob {
  match_id: string;
  job_id: string;
  title: string;
  client_name: string;
  category: string;
  match_score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  recommendation: string;
  match_status: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  required_skills: string[];
}

interface DashboardData {
  needs_onboarding?: boolean;
  profile?: {
    id: string;
    full_name: string;
    category: string;
    availability: string;
    skills: { name: string; level: string }[];
  };
  skill_gap?: {
    recommendations: SkillGapRec[];
    summary: string;
    generated_at: string;
  };
  recommended_jobs?: RecommendedJob[];
  active_jobs?: { job_id: string; title: string; client_name: string; status: string }[];
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
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <span className="text-sm">❌</span>
        <span className="text-xs text-red-400 font-medium">Dibatalkan</span>
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
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-500 ${
                  isCurrent
                    ? "gradient-primary shadow-lg shadow-primary-500/30 scale-110"
                    : isActive
                      ? "bg-accent-500/20 text-accent-400"
                      : "bg-white/5 text-surface-200/50"
                }`}
              >
                {isActive && i < currentIndex ? "✓" : step.icon}
              </div>
              <span
                className={`text-[8px] mt-1 font-medium transition-colors ${
                  isCurrent
                    ? "text-primary-300"
                    : isActive
                      ? "text-accent-400"
                      : "text-surface-200/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-0.5 rounded-full transition-all duration-500 ${
                  i < currentIndex ? "bg-accent-500/40" : "bg-white/5"
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
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
      >
        <svg className="w-5 h-5 text-surface-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl overflow-hidden shadow-2xl shadow-black/30 animate-scale-in z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] text-primary-300 font-medium">
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
                  className={`w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                    !notif.is_read ? "bg-primary-500/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">
                      {typeIcons[notif.type] || "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!notif.is_read ? "text-white" : "text-surface-200"}`}>
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-surface-200/60 mt-1 block">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary-400 shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-2xl mb-2">🔔</div>
                <p className="text-xs text-surface-200">Belum ada notifikasi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */

export default function TalentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/talent/dashboard");
      const d = await res.json();
      if (!d.success && res.status === 401) {
        router.push("/login");
        return;
      }
      setData(d.data);
      if (d.data?.needs_onboarding) {
        router.push("/talent/onboarding");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleApply = async (matchId: string) => {
    setApplyingId(matchId);
    try {
      await fetch(`/api/matches/${matchId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "applied" }),
      });
      fetchDashboard();
    } finally {
      setApplyingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data?.profile) return null;

  const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
    high: { color: "text-red-400", bg: "bg-red-500/15", label: "Prioritas Tinggi" },
    medium: { color: "text-warning-400", bg: "bg-warning-500/15", label: "Prioritas Sedang" },
    low: { color: "text-accent-400", bg: "bg-accent-500/15", label: "Prioritas Rendah" },
  };

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Top Nav */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-sm" style={{ fontFamily: "Outfit" }}>
              N
            </div>
            <span className="font-bold" style={{ fontFamily: "Outfit" }}>Nyamby</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/jobs" className="text-sm text-surface-200 hover:text-white transition-colors">
              Browse Jobs
            </Link>
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold">
                {data.profile.full_name[0]}
              </div>
              <span className="text-sm font-medium hidden md:block">{data.profile.full_name}</span>
            </div>
            <button onClick={handleLogout} className="text-xs text-surface-200 hover:text-white">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Outfit" }}>
            Halo, {data.profile.full_name.split(" ")[0]}! 👋
          </h1>
          <p className="text-surface-200">
            Dashboard karirmu — lihat insight AI dan job yang cocok untukmu.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Skills", value: data.profile.skills.length, icon: "⚡" },
            { label: "Job Match", value: data.recommended_jobs?.length || 0, icon: "🎯" },
            { label: "Active Jobs", value: data.active_jobs?.length || 0, icon: "💼" },
            {
              label: "Status",
              value: data.profile.availability === "available" ? "Available" : data.profile.availability,
              icon: "🟢",
            },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 card-hover">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>
                {stat.value}
              </div>
              <div className="text-xs text-surface-200">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Skill Gap Analysis Card ─────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm">
                  📊
                </div>
                <div>
                  <h2 className="font-bold text-sm">Insight Karir AI</h2>
                  <span className="text-[10px] text-surface-200">Skill Gap Analysis</span>
                </div>
              </div>

              {data.skill_gap ? (
                <>
                  <p className="text-xs text-surface-200 mb-4 leading-relaxed">
                    {data.skill_gap.summary}
                  </p>

                  <div className="space-y-3">
                    {(data.skill_gap.recommendations as unknown as SkillGapRec[]).map((rec, i) => {
                      const cfg = priorityConfig[rec.priority] || priorityConfig.medium;
                      return (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">{rec.skill_name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-surface-200 mb-1">{rec.reason}</p>
                          <p className="text-xs text-accent-400">💡 {rec.estimated_impact}</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-surface-200">Belum ada analisis. Lengkapi profilmu.</p>
              )}
            </div>

            {/* Skills */}
            <div className="glass rounded-2xl p-6 mt-4">
              <h3 className="font-bold text-sm mb-3">Skill-mu</h3>
              <div className="flex flex-wrap gap-2">
                {data.profile.skills.map((s, i) => (
                  <span key={i} className={`skill-badge skill-badge-${s.level}`}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Recommended Jobs ────────────────────────────────── */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "Outfit" }}>
              🎯 Job Untukmu
              <span className="text-xs font-normal text-surface-200 bg-white/5 px-2 py-1 rounded-full">
                AI Matched
              </span>
            </h2>

            {data.recommended_jobs && data.recommended_jobs.length > 0 ? (
              <div className="space-y-4">
                {data.recommended_jobs.map((job) => (
                  <div key={job.match_id} className="glass rounded-xl p-5 card-hover">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{job.title}</h3>
                          {job.recommendation === "highly_recommended" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400">
                              ⭐ Top Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-surface-200 mb-3">
                          oleh {job.client_name} · {job.category === "web_dev" ? "Web Dev" : "Design"}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.required_skills.map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-surface-200">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-4 text-xs text-surface-200">
                          {job.budget_max && (
                            <span>💰 Rp {Number(job.budget_max).toLocaleString("id-ID")}</span>
                          )}
                          {job.deadline && (
                            <span>📅 {new Date(job.deadline).toLocaleDateString("id-ID")}</span>
                          )}
                        </div>

                        {/* AI Reasoning */}
                        <div className="mt-3 p-3 rounded-lg bg-primary-500/5 border border-primary-500/10">
                          <div className="text-[10px] text-primary-300 font-medium mb-1">🤖 AI Insight</div>
                          <p className="text-xs text-surface-200">{job.reasoning}</p>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-center shrink-0">
                        <div className={`text-3xl font-bold ${Number(job.match_score) >= 80 ? "text-accent-400" : "text-primary-300"}`} style={{ fontFamily: "Outfit" }}>
                          {Math.round(Number(job.match_score))}%
                        </div>
                        <div className="text-[10px] text-surface-200 mb-3">Match</div>

                        {job.match_status === "recommended" ? (
                          <button
                            onClick={() => handleApply(job.match_id)}
                            disabled={applyingId === job.match_id}
                            className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                          >
                            {applyingId === job.match_id ? "..." : "Lamar"}
                          </button>
                        ) : (
                          <span className={`text-xs px-3 py-1 rounded-full status-${job.match_status}`}>
                            {job.match_status === "applied" ? "Dilamar" : job.match_status === "accepted" ? "Diterima" : job.match_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-surface-200">
                  Belum ada job yang cocok. Job baru akan muncul saat client posting.
                </p>
              </div>
            )}

            {/* Active Jobs with Status Tracker */}
            {data.active_jobs && data.active_jobs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Outfit" }}>
                  💼 Job Aktif
                </h2>
                <div className="space-y-3">
                  {data.active_jobs.map((job) => (
                    <div key={job.job_id} className="glass rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-medium text-sm">{job.title}</div>
                          <div className="text-xs text-surface-200">{job.client_name}</div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full status-${job.status}`}>
                          {job.status === "in_progress" ? "In Progress" : job.status === "completed" ? "Selesai" : job.status}
                        </span>
                      </div>
                      <JobStatusTracker status={job.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
