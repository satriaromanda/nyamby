"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { NotificationBell } from "@/components/NotificationBell";
import { JobStatusTracker } from "@/components/JobStatusTracker";
import { StatCard } from "@/components/StatCard";
import { FileText, Circle, Clock, CheckCircle, Bot, Sparkles, Banknote, Calendar, BarChart3, ChevronDown, ChevronUp, Search, CreditCard } from "lucide-react";

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

const statusLabels: Record<string, string> = {
  active: "Aktif",
  matched: "Matched",
  in_progress: "In Progress",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

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

    const job = jobs.find((j) => j.id === jobId);
    if (job) {
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

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/client/post-job" className="btn-primary text-xs px-4 py-2">
              + Post Job Baru
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
              Dashboard Client
            </h1>
            <p className="text-surface-500">
              Kelola job posting dan lihat talenta terbaik yang direkomendasikan AI.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} value={jobs.length} label="Total Jobs" />
          <StatCard icon={Circle} value={jobs.filter((j) => j.status === "active").length} label="Aktif" />
          <StatCard icon={Clock} value={jobs.filter((j) => j.status === "in_progress").length} label="In Progress" />
          <StatCard icon={CheckCircle} value={jobs.filter((j) => j.status === "completed").length} label="Selesai" />
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
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {job.top_matches.length} talenta dimatch
                        </span>
                      </div>

                      <JobStatusTracker status={job.status} />
                    </div>

                    <div className="text-surface-400">
                      {expandedJob === job.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded: Matched Talents */}
                {expandedJob === job.id && (
                  <div className="px-6 pb-6 border-t border-surface-200 pt-4 animate-slide-up">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-surface-900">
                      <Bot className="w-4 h-4 text-primary-500" />
                      AI Matched Talents
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
                                <div className="text-xs flex items-center gap-1">
                                  {match.recommendation === "highly_recommended" ? (
                                    <span className="flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                      <span className="text-surface-400">Sangat Direkomendasikan</span>
                                    </span>
                                  ) : (
                                    <span className="text-surface-400">Direkomendasikan</span>
                                  )}
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
                            <div className="text-sm font-medium mb-1 flex items-center gap-1.5 text-surface-900">
                              <CreditCard className="w-4 h-4 text-primary-500" />
                              Status Escrow
                            </div>
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
                              className="bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve & Rilis Dana
                            </button>
                          )}
                        </div>

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
            <Search className="w-12 h-12 text-surface-300 mx-auto mb-4" />
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
