"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { NotificationBell } from "@/components/NotificationBell";
import { JobStatusTracker } from "@/components/JobStatusTracker";
import { StatCard } from "@/components/StatCard";
import {
  Zap, Target, Briefcase, Circle, BarChart3,
  Sparkles, Search, Banknote, Calendar, Lightbulb,
} from "lucide-react";

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

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: "text-red-600", bg: "bg-red-50", label: "Prioritas Tinggi" },
  medium: { color: "text-amber-600", bg: "bg-amber-50", label: "Prioritas Sedang" },
  low: { color: "text-accent-600", bg: "bg-emerald-50", label: "Prioritas Rendah" },
};

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
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data?.profile) return null;

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />

          <div className="flex items-center gap-3">
            <Link href="/jobs" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
              Browse Jobs
            </Link>
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                {data.profile.full_name[0]}
              </div>
              <span className="text-sm font-medium hidden md:block text-surface-900">{data.profile.full_name}</span>
            </div>
            <button onClick={handleLogout} className="text-xs text-surface-400 hover:text-surface-700">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
            Halo, {data.profile.full_name.split(" ")[0]}!
          </h1>
          <p className="text-surface-500">
            Dashboard karirmu — lihat insight AI dan job yang cocok untukmu.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Zap} value={data.profile.skills.length} label="Skills" />
          <StatCard icon={Target} value={data.recommended_jobs?.length || 0} label="Job Match" />
          <StatCard icon={Briefcase} value={data.active_jobs?.length || 0} label="Active Jobs" />
          <StatCard
            icon={Circle}
            value={data.profile.availability === "available" ? "Available" : data.profile.availability}
            label="Status"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Skill Gap Analysis */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-surface-900">Insight Karir AI</h2>
                  <span className="text-[10px] text-surface-400">Skill Gap Analysis</span>
                </div>
              </div>

              {data.skill_gap ? (
                <>
                  <p className="text-xs text-surface-500 mb-4 leading-relaxed">
                    {data.skill_gap.summary}
                  </p>

                  <div className="space-y-3">
                    {(data.skill_gap.recommendations as unknown as SkillGapRec[]).map((rec, i) => {
                      const cfg = priorityConfig[rec.priority] || priorityConfig.medium;
                      return (
                        <div key={i} className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-surface-900">{rec.skill_name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-surface-500 mb-1">{rec.reason}</p>
                          <p className="text-xs text-accent-600 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            {rec.estimated_impact}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-surface-500">Belum ada analisis. Lengkapi profilmu.</p>
              )}
            </div>

            {/* Skills */}
            <div className="glass rounded-2xl p-6 mt-4">
              <h3 className="font-bold text-sm mb-3 text-surface-900">Skill-mu</h3>
              <div className="flex flex-wrap gap-2">
                {data.profile.skills.map((s, i) => (
                  <span key={i} className={`skill-badge skill-badge-${s.level}`}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
              <Target className="w-5 h-5 text-primary-500" />
              Job Untukmu
              <span className="text-xs font-normal text-surface-500 bg-surface-100 px-2 py-1 rounded-full">
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
                          <h3 className="font-bold text-surface-900">{job.title}</h3>
                          {job.recommendation === "highly_recommended" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-accent-600">
                              <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                              Top Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-surface-500 mb-3">
                          oleh {job.client_name} · {job.category === "web_dev" ? "Web Dev" : "Design"}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.required_skills.map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-4 text-xs text-surface-400">
                          {job.budget_max && (
                            <span className="flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              Rp {Number(job.budget_max).toLocaleString("id-ID")}
                            </span>
                          )}
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(job.deadline).toLocaleDateString("id-ID")}
                            </span>
                          )}
                        </div>

                        {/* AI Reasoning */}
                        <div className="mt-3 p-3 rounded-lg bg-primary-50 border border-primary-100">
                          <div className="text-[10px] text-primary-600 font-medium mb-1">AI Insight</div>
                          <p className="text-xs text-surface-500">{job.reasoning}</p>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-center shrink-0">
                        <div className={`text-3xl font-bold ${Number(job.match_score) >= 80 ? "text-accent-600" : "text-primary-600"}`} style={{ fontFamily: "Outfit" }}>
                          {Math.round(Number(job.match_score))}%
                        </div>
                        <div className="text-[10px] text-surface-400 mb-3">Match</div>

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
                <Search className="w-10 h-10 text-surface-300 mx-auto mb-4" />
                <p className="text-surface-500">
                  Belum ada job yang cocok. Job baru akan muncul saat client posting.
                </p>
              </div>
            )}

            {/* Active Jobs */}
            {data.active_jobs && data.active_jobs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-surface-900 flex items-center gap-2" style={{ fontFamily: "Outfit" }}>
                  <Briefcase className="w-5 h-5 text-primary-500" />
                  Job Aktif
                </h2>
                <div className="space-y-3">
                  {data.active_jobs.map((job) => (
                    <div key={job.job_id} className="glass rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-medium text-sm text-surface-900">{job.title}</div>
                          <div className="text-xs text-surface-400">{job.client_name}</div>
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
