"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, RatingStars, Logo } from "@/components/icons";
import { RatingModal } from "@/components/RatingModal";
import { NotificationBell } from "@/components/NotificationBell";

interface TopMatch {
  match_id: string;
  talent_profile_id: string;
  talent_user_id: string;
  full_name: string;
  match_score: number;
  portfolio_evidence?: string | null;
  recommendation: string;
  status: string;
  aiStatus: string;
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
  has_rating: boolean;
}

/* ─── Job Status Tracker ─────────────────────────────────────────── */

function JobStatusTracker({ status }: { status: string }) {
  const steps = [
    { key: "active", label: "Posted", icon: "file" as const },
    { key: "matched", label: "Matched", icon: "ai" as const },
    { key: "in_progress", label: "In Progress", icon: "settings" as const },
    { key: "completed", label: "Selesai", icon: "check" as const },
  ];

  const statusOrder: Record<string, number> = {
    active: 0,
    matched: 1,
    in_progress: 2,
    submitted_for_review: 2,
    revision_requested: 2,
    completed: 3,
    cancelled: -1,
  };

  const currentIndex = statusOrder[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <Icon name="x" className="text-red-600" size={14} />
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
          <div key={step.key} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all duration-500 shrink-0 ${
                  isCurrent
                    ? "gradient-primary shadow-lg shadow-primary-500/20 scale-110 text-white"
                    : isActive
                      ? "bg-accent-500/10 text-accent-600"
                      : "bg-surface-100 text-surface-400"
                }`}
              >
                {isActive && i < currentIndex ? <Icon name="check" size={12} /> : <Icon name={step.icon} size={12} />}
              </div>
              <span
                className={`text-[8px] sm:text-[9px] mt-1 font-medium transition-colors whitespace-nowrap ${
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
                className={`flex-1 h-0.5 mx-0.5 sm:mx-1 rounded-full transition-all duration-500 ${
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

/* ─── Main Dashboard ─────────────────────────────────────────────── */

export default function ClientDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; jobId: string; talentProfileId: string } | null>(null);

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

  const handleSendOffer = async (matchId: string, talentName: string) => {
    if (!confirm(`Kirim tawaran job ke ${talentName}?`)) return;

    await fetch(`/api/matches/${matchId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "offered" }),
    });

    fetchDashboard();
  };

  const handlePayEscrow = (jobId: string) => {
    router.push(`/client/escrow/${jobId}`);
  };

  const handleReleaseEscrow = async (jobId: string) => {
    if (!confirm("Terima hasil kerja dan rilis dana ke talenta? Job akan ditandai selesai.")) return;

    setUpdatingJobId(jobId);
    try {
      // First, mark job as completed
      await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      // Then, release escrow
      await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });

      fetchDashboard();
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleRequestRevision = async (jobId: string) => {
    const reason = prompt("Masukkan alasan revisi (contoh: 'Warna kurang sesuai'):");
    if (!reason) return;

    setUpdatingJobId(jobId);
    try {
      await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revision_requested" }),
      });
      fetchDashboard();
    } finally {
      setUpdatingJobId(null);
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

  const statusLabels: Record<string, string> = {
    active: "Aktif",
    matched: "Matched",
    in_progress: "In Progress",
    submitted_for_review: "Menunggu Review",
    revision_requested: "Revisi Diminta",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200" role="navigation" aria-label="Main navigation">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo height={28} />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <NotificationBell />
            <Link href="/client/post-job" className="btn-primary text-xs px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">
              + Post Job
            </Link>
            <Link href="/client/settings" className="text-surface-500 hover:text-surface-900 transition-colors hidden sm:inline" title="Pengaturan">
              <Icon name="settings" size={16} />
            </Link>
            <button onClick={handleLogout} className="text-xs text-surface-400 hover:text-surface-700 hidden sm:inline">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-surface-900" >
              Dashboard Client
            </h1>
            <p className="text-surface-500">
              Kelola job posting dan lihat talenta terbaik yang direkomendasikan AI.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: jobs.length, icon: "file" as const },
            { label: "Aktif", value: jobs.filter((j) => j.status === "active").length, icon: "check" as const },
            { label: "In Progress", value: jobs.filter((j) => j.status === "in_progress").length, icon: "settings" as const },
            { label: "Selesai", value: jobs.filter((j) => j.status === "completed").length, icon: "check" as const },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4">
              <Icon name={stat.icon} className="mb-1 text-primary-600" size={20} />
              <div className="text-2xl font-bold text-surface-900" >{stat.value}</div>
              <div className="text-xs text-surface-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Jobs List */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="glass rounded-xl overflow-hidden card-hover">
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                >
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base md:text-lg font-bold text-surface-900">{job.title}</h3>
                        <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full status-${job.status}`}>
                          {statusLabels[job.status]}
                        </span>
                        {["in_progress", "submitted_for_review", "revision_requested", "completed"].includes(job.status) && (
                          <Link
                            href={`/workspace/${job.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-primary-200 text-primary-600 hover:bg-primary-50 font-medium transition-colors"
                          >
                            Buka Ruang Kerja
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.required_skills.map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-surface-400 mb-4">
                        {job.budget_max && (
                          <span className="inline-flex items-center gap-1"><Icon name="money" size={13} />Rp {Number(job.budget_max).toLocaleString("id-ID")}</span>
                        )}
                        {job.deadline && (
                          <span className="inline-flex items-center gap-1"><Icon name="calendar" size={13} />{new Date(job.deadline).toLocaleDateString("id-ID")}</span>
                        )}
                        <span className="inline-flex items-center gap-1"><Icon name="chart" size={13} />{job.top_matches.length} talenta dimatch</span>
                      </div>

                      {/* Job Status Tracker */}
                      <JobStatusTracker status={job.status} />
                    </div>

                    <div className="text-surface-400 text-sm">
                      {expandedJob === job.id ? "Collapse" : "Expand"}
                    </div>
                  </div>
                </div>

                {/* Expanded: Matched Talents */}
                {expandedJob === job.id && (
                  <div className="px-6 pb-6 border-t border-surface-200 pt-4 animate-slide-up">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-surface-900">
                      <Icon name="ai" className="text-primary-600" size={15} />
                      AI Matched Talents
                    </h4>

                    {job.top_matches.some((m) => m.aiStatus === "processing" || m.aiStatus === "pending") ? (
                      <div className="flex flex-col items-center justify-center py-8 bg-surface-50 rounded-xl border border-surface-200">
                        <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mb-4" />
                        <h5 className="font-bold text-sm text-surface-900 mb-1">AI sedang mencarikan talenta terbaik...</h5>
                        <p className="text-xs text-surface-500">Proses ini biasanya memakan waktu beberapa detik.</p>
                      </div>
                    ) : job.top_matches.some((m) => m.aiStatus === "failed") ? (
                      <div className="flex flex-col items-center justify-center py-8 bg-red-50 rounded-xl border border-red-200">
                        <Icon name="x" className="text-red-500 mb-2" size={32} />
                        <h5 className="font-bold text-sm text-red-900 mb-1">AI Matching Gagal</h5>
                        <p className="text-xs text-red-600">Mohon maaf, sistem gagal memproses kecocokan. Silakan refresh untuk mencoba lagi.</p>
                      </div>
                    ) : job.top_matches.length > 0 ? (
                      <div className="space-y-3">
                        {job.top_matches.map((match) => (
                          <div key={match.match_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
                                {match.full_name[0]}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/talents/${match.talent_profile_id}`}
                                  className="text-sm font-medium text-surface-900 hover:text-primary-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {match.full_name}
                                </Link>
                                <div className="text-xs text-surface-400">
                                  {match.recommendation === "highly_recommended" ? "Sangat Direkomendasikan" : "Direkomendasikan"}
                                </div>
                                {match.portfolio_evidence && (
                                  <div className="mt-1 text-[10px] text-[#854F0B] max-w-xs line-clamp-1">
                                    Evidence: {match.portfolio_evidence}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3 sm:mt-0">
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
                                    handleSendOffer(match.match_id, match.full_name);
                                  }}
                                  className="btn-primary text-xs px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                >
                                  Kirim Tawaran
                                </button>
                              )}
                              {match.status === "applied" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendOffer(match.match_id, match.full_name);
                                  }}
                                  className="btn-primary text-xs px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                >
                                  Terima Lamaran
                                </button>
                              )}
                              {match.status === "offered" && (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                                  Menunggu Jawaban
                                </span>
                              )}
                              {match.status === "accepted" && !job.escrow ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePayEscrow(job.id);
                                  }}
                                  className="bg-trust-500 hover:bg-trust-600 text-white text-xs px-3 py-1.5 rounded-xl transition-all font-semibold flex items-center gap-1 shadow-md animate-pulse"
                                >
                                  <Icon name="shield" size={13} />
                                  Bayar Escrow
                                </button>
                              ) : match.status === "accepted" ? (
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-accent-600">
                                  Diterima
                                </span>
                              ) : null}
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
                            <div className="text-sm font-medium mb-1 text-surface-900 flex items-center gap-1.5">
                              <Icon name="shield" className="text-trust-500" size={16} />
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
                          {job.escrow.status === "held" && job.status === "submitted_for_review" && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestRevision(job.id);
                                }}
                                disabled={updatingJobId === job.id}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                              >
                                Minta Revisi
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReleaseEscrow(job.id);
                                }}
                                disabled={updatingJobId === job.id}
                                className="bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                <Icon name="check" size={14} /> Terima Hasil & Rilis
                              </button>
                            </div>
                          )}
                          {job.escrow.status === "held" && job.status !== "submitted_for_review" && (
                            <div className="text-xs text-surface-500 bg-surface-100 px-3 py-1.5 rounded-full">
                              Job sedang dikerjakan
                            </div>
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

                    {/* Completed Job Rating */}
                    {job.status === "completed" && (
                      <div className="mt-4 pt-4 border-t border-surface-200">
                        {!job.has_rating ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-surface-500">Pekerjaan telah selesai. Berikan penilaian untuk talenta.</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const acceptedMatch = job.top_matches.find(m => m.status === "accepted");
                                if (acceptedMatch) {
                                  setRatingModal({ isOpen: true, jobId: job.id, talentProfileId: acceptedMatch.talent_profile_id });
                                }
                              }}
                              className="btn-primary text-xs px-4 py-2"
                            >
                              Berikan Rating
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-surface-500 flex items-center gap-2">
                            <Icon name="check" className="text-emerald-500" size={16} />
                            Anda telah memberikan rating untuk pekerjaan ini.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-16 text-center">
            <Icon name="file" className="mx-auto text-surface-300" size={48} />
            <h3 className="text-xl font-bold mb-2 text-surface-900" >Belum ada job</h3>
            <p className="text-surface-500 text-sm mb-6">Post job pertamamu dan biarkan AI mencarikan talenta terbaik.</p>
            <Link href="/client/post-job" className="btn-primary">
              + Post Job Baru
            </Link>

            <div className="mt-8 pt-8 border-t border-surface-200">
              <p className="text-xs text-surface-400 mb-2">Talenta yang telah menyelesaikan job:</p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-surface-900">Raka P.</div>
                  <RatingStars rating={4.8} reviewCount={3} size={12} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-surface-900">Sari W.</div>
                  <RatingStars rating={5.0} reviewCount={5} size={12} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {ratingModal && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          jobId={ratingModal.jobId}
          talentProfileId={ratingModal.talentProfileId}
          onClose={() => setRatingModal(null)}
          onSuccess={() => {
            setRatingModal(null);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
}
