"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, RatingStars, Logo } from "@/components/icons";
import { NotificationBell } from "@/components/NotificationBell";
import { JobStatusTracker } from "@/components/JobStatusTracker";
import { SmartPricingCard } from "@/components/SmartPricingCard";

interface SkillGapRec {
  skill_name: string;
  priority: string;
  reason: string;
  estimated_impact: string;
  evidence_basis?: "form" | "cv" | "portfolio";
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
  portfolio_evidence?: string | null;
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
    has_bank_account?: boolean;
    skills: { name: string; level: string }[];
  };
  skill_gap?: {
    recommendations: SkillGapRec[];
    summary: string;
    profile_completeness_score?: number | null;
    generated_at: string;
    ai_status?: string;
  };
  portfolio_analysis?: {
    overall_score: number;
    dimensions: Record<string, { score: number, feedback: string }>;
    strengths: string[];
    improvements: { priority: string, action: string, impact: string }[];
    summary: string;
    generated_at: string;
  };
  recommended_jobs?: RecommendedJob[];
  active_jobs?: { job_id: string; title: string; client_name: string; status: string }[];
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */

export default function TalentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [analyzingPortfolio, setAnalyzingPortfolio] = useState(false);
  const [offerModalJob, setOfferModalJob] = useState<RecommendedJob | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingOffer, setProcessingOffer] = useState(false);
  const [uploadingDeliverableId, setUploadingDeliverableId] = useState<string | null>(null);
  const [refreshingGap, setRefreshingGap] = useState(false);

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

  const handleRefreshSkillGap = async () => {
    setRefreshingGap(true);
    try {
      await fetch("/api/talent/skill-gap/refresh", { method: "POST" });
      // Poll until AI finishes
      let attempts = 0;
      while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        await fetchDashboard();
        const res = await fetch("/api/talent/dashboard");
        const d = await res.json();
        if (d.data?.skill_gap?.ai_status !== "processing" && d.data?.skill_gap?.ai_status !== "pending") {
          break;
        }
        attempts++;
      }
    } catch {
      // fallback
    } finally {
      setRefreshingGap(false);
    }
  };

  const handleAnalyzePortfolio = async () => {
    setAnalyzingPortfolio(true);
    try {
      const res = await fetch("/api/ai/portfolio-analyzer", { method: "POST" });
      if (res.ok) fetchDashboard();
    } catch {
      // silently fail
    } finally {
      setAnalyzingPortfolio(false);
    }
  };

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

  const handleRespondOffer = async (status: "accepted" | "rejected") => {
    if (!offerModalJob) return;
    if (status === "rejected" && !rejectReason.trim()) {
      alert("Harap isi alasan penolakan");
      return;
    }
    setProcessingOffer(true);
    try {
      await fetch(`/api/matches/${offerModalJob.match_id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          rejection_reason: status === "rejected" ? rejectReason : undefined 
        }),
      });
      setOfferModalJob(null);
      setRejectReason("");
      fetchDashboard();
    } finally {
      setProcessingOffer(false);
    }
  };

  const handleUploadDeliverable = async (jobId: string) => {
    const link = prompt("Masukkan link Google Drive / Figma / file hasil kerja Anda:");
    if (!link) return;

    setUploadingDeliverableId(jobId);
    try {
      await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "submitted_for_review" }),
      });
      // In a real app we'd save the link. For now we just update status.
      fetchDashboard();
    } finally {
      setUploadingDeliverableId(null);
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

  const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
    high: { color: "text-red-600", bg: "bg-red-50", label: "Prioritas Tinggi" },
    medium: { color: "text-amber-600", bg: "bg-amber-50", label: "Prioritas Sedang" },
    low: { color: "text-accent-600", bg: "bg-emerald-50", label: "Prioritas Rendah" },
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200" role="navigation" aria-label="Main navigation">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo height={32} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Link href="/jobs" className="text-surface-500 hover:text-surface-900 transition-colors hidden sm:inline">
              Browse Jobs
            </Link>
            <Link href="/talent/earnings" className="text-surface-500 hover:text-surface-900 transition-colors hidden sm:inline">
              Pendapatan
            </Link>
            <Link href="/talent/activity" className="text-surface-500 hover:text-surface-900 transition-colors hidden sm:inline">
              Aktivitas
            </Link>
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-primary flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                {data.profile.full_name[0]}
              </div>
              <span className="text-xs sm:text-sm font-medium hidden sm:block text-surface-900">{data.profile.full_name}</span>
            </div>
            <Link href="/talent/settings" className="text-surface-500 hover:text-surface-900 transition-colors" title="Pengaturan">
              <Icon name="settings" size={16} />
            </Link>
            <button onClick={handleLogout} className="text-xs text-surface-400 hover:text-surface-700">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-surface-900" >
              Halo, {data.profile.full_name.split(" ")[0]}!
            </h1>
            <p className="text-surface-500 text-sm">
              Dashboard karirmu - lihat insight AI dan job yang cocok untukmu.
            </p>
          </div>
          <Link href="/talent/edit-profile" className="btn-secondary text-xs sm:text-sm inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 shrink-0 self-start">
            <Icon name="spark" size={14} /> Edit Profil
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Skills", value: data.profile.skills.length, icon: "spark" as const },
            { label: "Job Match", value: data.recommended_jobs?.length || 0, icon: "target" as const },
            { label: "Active Jobs", value: data.active_jobs?.length || 0, icon: "briefcase" as const },
            {
              label: "Status",
              value: data.profile.availability === "available" ? "Available" : data.profile.availability,
              icon: "check" as const,
            },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 card-hover">
              <Icon name={stat.icon} className="mb-1 text-primary-600" size={20} />
              <div className="text-2xl font-bold text-surface-900" >
                {stat.value}
              </div>
              <div className="text-xs text-surface-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bank Account Warning Banner — PRD v3.0 §9.2 */}
        {data.profile.has_bank_account === false && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <Icon name="info" className="text-amber-600 shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Lengkapi data rekening kamu untuk bisa menerima pembayaran.
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Tanpa data rekening, pembayaran escrow tidak bisa di-release ke kamu.
              </p>
            </div>
            <Link href="/talent/edit-profile" className="btn-primary text-xs py-1.5 px-3 rounded-lg shrink-0">
              Lengkapi
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Skill Gap Analysis Card ─────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 card-hover">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-sm">
                    <Icon name="settings" size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-surface-900">Insight Karir AI</h2>
                    <span className="text-[10px] text-surface-400">Skill Gap Analysis</span>
                  </div>
                </div>
                {data.skill_gap && data.skill_gap.ai_status !== "processing" && data.skill_gap.ai_status !== "pending" && (
                  <button
                    onClick={handleRefreshSkillGap}
                    disabled={refreshingGap}
                    className="text-[10px] text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Icon name={refreshingGap ? "settings" : "spark"} size={12} className={refreshingGap ? "animate-spin" : ""} />
                    {refreshingGap ? "Menganalisis..." : "Analisis Ulang"}
                  </button>
                )}
              </div>

              {data.skill_gap ? (
                data.skill_gap.ai_status === "pending" || data.skill_gap.ai_status === "processing" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-amber-600 mb-3">
                      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">AI sedang menganalisis skill gap...</span>
                    </div>
                    <div className="h-4 bg-surface-100 animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-surface-100 animate-pulse rounded w-1/2" />
                    <div className="h-4 bg-surface-100 animate-pulse rounded w-2/3" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-surface-500 mb-4 leading-relaxed">
                      {data.skill_gap.summary}
                    </p>
                    {data.skill_gap.profile_completeness_score != null && (
                      <div className="mb-4 p-3 rounded-xl bg-[#FAEEDA] border border-amber-100">
                        <div className="text-[10px] text-[#854F0B] font-medium mb-1">
                          AI enrichment completeness
                        </div>
                        <div className="text-lg font-bold text-surface-900">
                          {data.skill_gap.profile_completeness_score}%
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {(Array.isArray(data.skill_gap.recommendations) ? data.skill_gap.recommendations : []).map((rec, i) => {
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
                            <p className="text-xs text-accent-600"><Icon name="spark" className="inline mr-1" size={12} />{rec.estimated_impact}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )
              ) : (
                <p className="text-sm text-surface-500">Belum ada analisis. Lengkapi profilmu.</p>
              )}
            </div>

            {/* Skills */}
            <div className="glass rounded-xl p-6 mt-4">
              <h3 className="font-bold text-sm mb-3 text-surface-900">Skill-mu</h3>
              <div className="flex flex-wrap gap-2">
                {data.profile.skills.map((s, i) => (
                  <span key={i} className={`skill-badge skill-badge-${s.level}`}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Smart Pricing Benchmark */}
            <div className="mt-4">
              <SmartPricingCard
                category={data.profile.category}
                skills={data.profile.skills.map((s) => s.name)}
                level={
                  data.profile.skills.some((s) => s.level === "expert")
                    ? "expert"
                    : data.profile.skills.some((s) => s.level === "intermediate")
                      ? "intermediate"
                      : "beginner"
                }
              />
            </div>

            {/* Portfolio Analysis */}
            <div className="glass rounded-xl p-6 mt-4 card-hover">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm">
                    <Icon name="file" size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-surface-900">Portfolio Analyzer</h2>
                    <span className="text-[10px] text-surface-400">AI Portfolio Review</span>
                  </div>
                </div>
                <button
                  onClick={handleAnalyzePortfolio}
                  disabled={analyzingPortfolio || (!data.profile.has_bank_account && !data.portfolio_analysis)}
                  className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 shrink-0"
                >
                  {analyzingPortfolio ? (
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon name="spark" size={12} />
                  )}
                  {analyzingPortfolio ? "Menganalisis..." : data.portfolio_analysis ? "Analisis Ulang" : "Mulai Analisis"}
                </button>
              </div>

              {data.portfolio_analysis ? (
                <>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="text-3xl font-bold text-surface-900">{data.portfolio_analysis.overall_score}</div>
                    <div className="text-xs text-surface-500 leading-tight">
                      Score Portofolio Anda.<br/>{data.portfolio_analysis.summary}
                    </div>
                  </div>
                  
                  {data.portfolio_analysis.improvements && data.portfolio_analysis.improvements.length > 0 && (
                    <div className="space-y-3 mt-4 border-t border-surface-200 pt-4">
                      <h3 className="text-xs font-bold text-surface-900 mb-2">Saran Peningkatan</h3>
                      {data.portfolio_analysis.improvements.map((imp, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-surface-900">{imp.action}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full ${imp.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                              {imp.priority === 'high' ? 'Tinggi' : 'Sedang'}
                            </span>
                          </div>
                          <p className="text-[10px] text-accent-600 mt-1"><Icon name="spark" className="inline mr-1" size={10} />{imp.impact}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-surface-500">
                  {data.profile.has_bank_account 
                    ? "Belum ada analisis portofolio. Klik tombol di atas untuk memulai." 
                    : "Lengkapi profil dan CV/Portfolio Anda terlebih dahulu."}
                </p>
              )}
            </div>
          </div>

          {/* ─── Recommended Jobs ────────────────────────────────── */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-surface-900" >
              <Icon name="target" className="text-primary-600" size={20} />Job Untukmu
              <span className="text-xs font-normal text-surface-500 bg-surface-100 px-2 py-1 rounded-full">
                AI Matched
              </span>
            </h2>

            {data.recommended_jobs && data.recommended_jobs.length > 0 ? (
              <div className="space-y-4">
                {data.recommended_jobs.map((job) => (
                  <Link key={job.match_id} href={`/jobs/${job.job_id}`} className="glass rounded-xl p-5 card-hover block focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-surface-900">{job.title}</h3>
                          {job.recommendation === "highly_recommended" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-accent-600">
                              Top Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-surface-500 mb-3">
                          oleh {job.client_name} - {job.category === "web_dev" ? "Web Dev" : "Design"}
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
                            <span className="inline-flex items-center gap-1"><Icon name="money" size={13} />Rp {Number(job.budget_max).toLocaleString("id-ID")}</span>
                          )}
                          {job.deadline && (
                            <span className="inline-flex items-center gap-1"><Icon name="calendar" size={13} />{new Date(job.deadline).toLocaleDateString("id-ID")}</span>
                          )}
                        </div>

                        {/* AI Reasoning */}
                        <div className="mt-3 p-3 rounded-lg bg-primary-50 border border-primary-100">
                          <div className="text-[10px] text-primary-600 font-medium mb-1 inline-flex items-center gap-1"><Icon name="ai" size={12} />AI Insight</div>
                          <p className="text-xs text-surface-500">{job.reasoning}</p>
                          {job.portfolio_evidence && (
                            <div className="mt-2 text-[10px] text-[#854F0B]">
                              Evidence: {job.portfolio_evidence}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-center shrink-0">
                        <div className={`text-3xl font-bold ${Number(job.match_score) >= 80 ? "text-accent-600" : "text-primary-600"}`} >
                          {Math.round(Number(job.match_score))}%
                        </div>
                        <div className="text-[10px] text-surface-400 mb-3">Match</div>

                        {job.match_status === "recommended" ? (
                          <button
                            onClick={(e) => { e.preventDefault(); handleApply(job.match_id); }}
                            disabled={applyingId === job.match_id}
                            className="btn-primary text-xs px-4 py-2 disabled:opacity-50 relative z-10"
                          >
                            {applyingId === job.match_id ? "..." : "Lamar"}
                          </button>
                        ) : job.match_status === "offered" ? (
                          <button
                            onClick={(e) => { e.preventDefault(); setOfferModalJob(job); }}
                            className="bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md relative z-10 animate-pulse"
                          >
                            Lihat Tawaran
                          </button>
                        ) : (
                          <span className={`text-xs px-3 py-1 rounded-full status-${job.match_status}`}>
                            {job.match_status === "applied" ? "Dilamar" : job.match_status === "accepted" ? "Diterima" : job.match_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <Icon name="search" className="mx-auto mb-4 text-surface-300" size={40} />
                <p className="text-surface-500">
                  Belum ada job yang cocok. Job baru akan muncul saat client posting.
                </p>
              </div>
            )}

            {/* Active Jobs with Status Tracker */}
            {data.active_jobs && data.active_jobs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-surface-900" >
                  <Icon name="briefcase" className="inline mr-2 text-primary-600" size={20} />Job Aktif
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
                          {job.status === "in_progress" ? "In Progress" 
                           : job.status === "submitted_for_review" ? "Menunggu Review" 
                           : job.status === "revision_requested" ? "Revisi Diminta"
                           : job.status === "completed" ? "Selesai" : job.status}
                        </span>
                      </div>
                      <JobStatusTracker status={job.status} />
                      
                      {/* Deliverable Actions */}
                      <div className="mt-4 pt-4 border-t border-surface-200">
                        {job.status === "in_progress" || job.status === "revision_requested" ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-surface-500">
                              {job.status === "revision_requested" ? "Client meminta revisi. Silakan perbaiki dan unggah ulang." : "Sudah selesai mengerjakan?"}
                            </span>
                            <button
                              onClick={() => handleUploadDeliverable(job.job_id)}
                              disabled={uploadingDeliverableId === job.job_id}
                              className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
                            >
                              <Icon name="file" size={14} />
                              {uploadingDeliverableId === job.job_id ? "Mengirim..." : "Unggah Hasil"}
                            </button>
                          </div>
                        ) : job.status === "submitted_for_review" ? (
                          <div className="flex items-center gap-2 text-sm text-surface-600 bg-surface-50 p-3 rounded-lg border border-surface-100">
                            <Icon name="check" className="text-primary-600" size={16} />
                            Hasil kerja telah dikirim, menunggu review dari Client.
                          </div>
                        ) : job.status === "completed" && (
                          <div className="text-center">
                            <div className="text-xs font-semibold text-accent-600 mb-2">Job Selesai!</div>
                            <RatingStars rating={4.8} reviewCount={3} size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {offerModalJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center">
                <Icon name="briefcase" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-900">Tawaran Job</h3>
                <p className="text-xs text-surface-500">dari {offerModalJob.client_name}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 mb-6">
              <div className="font-semibold text-sm text-surface-900 mb-2">{offerModalJob.title}</div>
              <div className="flex flex-col gap-2 text-xs text-surface-600">
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-medium">Rp {Number(offerModalJob.budget_max || offerModalJob.budget_min).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadline:</span>
                  <span className="font-medium">{offerModalJob.deadline ? new Date(offerModalJob.deadline).toLocaleDateString("id-ID") : "-"}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-surface-700 mb-2">
                Alasan Penolakan (wajib jika menolak)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Misal: Sedang banyak antrean job lain..."
                className="w-full text-sm p-3 rounded-xl border border-surface-200 focus:outline-none focus:border-primary-500 bg-white min-h-[80px]"
                disabled={processingOffer}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRespondOffer("rejected")}
                disabled={processingOffer || !rejectReason.trim()}
                className="flex-1 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Tolak Tawaran
              </button>
              <button
                onClick={() => handleRespondOffer("accepted")}
                disabled={processingOffer}
                className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
              >
                {processingOffer ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>Terima Tawaran</>
                )}
              </button>
            </div>
            
            <button
              onClick={() => { setOfferModalJob(null); setRejectReason(""); }}
              className="absolute top-4 right-4 text-surface-400 hover:text-surface-700"
              disabled={processingOffer}
            >
              <Icon name="x" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
