"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon, RatingStars, Logo } from "@/components/icons";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  client_name: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  status: string;
  created_at: string;
  required_skills: { name: string; is_mandatory: boolean }[];
}

interface MatchData {
  match_id: string;
  match_score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  portfolio_evidence?: string | null;
  recommendation: string;
  status: string;
}

interface SessionUser {
  id: string;
  role: string;
  full_name: string;
}

/* ─── Score Ring Component ───────────────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#059669" : score >= 60 ? "#6366f1" : "#d97706";

  return (
    <div className="score-ring relative" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle className="score-ring-bg" cx="50" cy="50" r={radius} />
        <circle
          className="score-ring-fill"
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: "Outfit", color }}
        >
          {Math.round(score)}%
        </span>
        <span className="text-[10px] text-surface-400">Match</span>
      </div>
    </div>
  );
}

/* ─── Job Status Tracker ────────────────────────────────────────── */

function JobStatusTracker({ status }: { status: string }) {
  const steps = [
    { key: "active", label: "Aktif", icon: "file" as const },
    { key: "matched", label: "Matched", icon: "ai" as const },
    { key: "in_progress", label: "In Progress", icon: "settings" as const },
    { key: "completed", label: "Selesai", icon: "check" as const },
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
        <Icon name="x" className="text-red-600" size={15} />
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
                {isActive && i < currentIndex ? <Icon name="check" size={14} /> : <Icon name={step.icon} size={14} />}
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

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch session
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  // Fetch job detail
  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const d = await res.json();
      if (d.success) {
        setJob(d.data.job);
        // If there's a match for the current user (talent), pick it
        if (d.data.matched_talents && d.data.matched_talents.length > 0) {
          const myMatch = d.data.matched_talents[0]; // API filters for talent
          setMatch({
            match_id: myMatch.match_id,
            match_score: Number(myMatch.match_score),
            strengths: myMatch.strengths || [],
            gaps: myMatch.gaps || [],
            reasoning: myMatch.reasoning,
            portfolio_evidence: myMatch.portfolio_evidence,
            recommendation: myMatch.recommendation,
            status: myMatch.status,
          });
        }
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Analyze match via AI
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/match-talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });
      const d = await res.json();
      if (d.success) {
        setMatch({
          match_id: d.data.match_id,
          match_score: Number(d.data.match_score),
          strengths: d.data.strengths || [],
          gaps: d.data.gaps || [],
          reasoning: d.data.reasoning,
          portfolio_evidence: d.data.portfolio_evidence,
          recommendation: d.data.recommendation,
          status: d.data.status,
        });
        showToast("AI Match Analysis selesai!");
      } else {
        showToast(d.message || "Gagal menganalisis", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  // Apply to job
  const handleApply = async () => {
    if (!match) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/matches/${match.match_id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "applied" }),
      });
      const d = await res.json();
      if (d.success) {
        setMatch((prev) => (prev ? { ...prev, status: "applied" } : prev));
        showToast("Lamaran berhasil dikirim! Client akan segera review.");
      } else {
        showToast(d.message || "Gagal melamar", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <nav className="glass sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Logo height={32} />
            </Link>
          </div>
        </nav>
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
          <div className="skeleton h-8 w-64 rounded-xl" />
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="glass rounded-2xl p-16 text-center max-w-md">
          <Icon name="search" className="mx-auto mb-4 text-surface-300" size={44} />
          <h2
            className="text-xl font-bold mb-2 text-surface-900"
            style={{ fontFamily: "Outfit" }}
          >
            Job Tidak Ditemukan
          </h2>
          <p className="text-surface-400 text-sm mb-6">
            Job yang kamu cari tidak tersedia atau sudah dihapus.
          </p>
          <Link href="/jobs" className="btn-primary text-sm">
            <span className="inline-flex items-center gap-1"><Icon name="arrowLeft" size={14} />Kembali ke Job List</span>
          </Link>
        </div>
      </div>
    );
  }

  const isTalent = user?.role === "talent";
  const categoryLabel = job.category === "web_dev" ? "Web Development" : "Graphic Design";
  const categoryIcon = job.category === "web_dev" ? "code" : "design";

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Toast */}
      {toast && (
        <div className="toast">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-accent-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
            >
              <span className="inline-flex items-center gap-1"><Icon name="arrowLeft" size={14} />Kembali</span>
            </button>
            {user ? (
              <Link
                href={user.role === "talent" ? "/talent/dashboard" : "/client/dashboard"}
                className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href={`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`} className="text-sm text-surface-500 hover:text-surface-900">
                  Masuk
                </Link>
                <Link href={`/register?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`} className="btn-primary text-xs px-4 py-2">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link href="/jobs" className="hover:text-primary-600 transition-colors">
            Jobs
          </Link>
          <span>/</span>
          <span className="text-surface-600">{job.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Main Content ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="glass rounded-2xl p-8 animate-slide-up">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={categoryIcon} className="text-primary-600" size={20} />
                    <span className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 font-medium">
                      {categoryLabel}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full status-${job.status}`}>
                      {job.status === "active"
                        ? "Aktif"
                        : job.status === "in_progress"
                          ? "In Progress"
                          : job.status === "completed"
                            ? "Selesai"
                            : job.status}
                    </span>
                  </div>
                  <h1
                    className="text-2xl font-bold text-surface-900 mb-1"
                    style={{ fontFamily: "Outfit" }}
                  >
                    {job.title}
                  </h1>
                  <p className="text-sm text-surface-500">
                    diposting oleh <span className="font-medium text-surface-700">{job.client_name}</span>
                    {" - "}
                    {new Date(job.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Job Status Tracker */}
              <div className="mb-6">
                <JobStatusTracker status={job.status} />
                {job.status === "completed" && (
                  <div className="mt-4 pt-4 border-t border-surface-200">
                    <p className="text-xs text-surface-400 mb-2">Rating dari client:</p>
                    <RatingStars rating={4.8} reviewCount={3} size={14} />
                  </div>
                )}
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {job.budget_max && (
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <div className="text-xs text-surface-400 mb-1 inline-flex items-center gap-1"><Icon name="money" size={12} />Budget</div>
                    <div className="text-sm font-semibold text-surface-900">
                      Rp {Number(job.budget_min || 0).toLocaleString("id-ID")} -{" "}
                      {Number(job.budget_max).toLocaleString("id-ID")}
                    </div>
                  </div>
                )}
                {job.deadline && (
                  <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                    <div className="text-xs text-surface-400 mb-1 inline-flex items-center gap-1"><Icon name="calendar" size={12} />Deadline</div>
                    <div className="text-sm font-semibold text-surface-900">
                      {new Date(job.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
                  <div className="text-xs text-surface-400 mb-1 inline-flex items-center gap-1"><Icon name="briefcase" size={12} />Kategori</div>
                  <div className="text-sm font-semibold text-surface-900">{categoryLabel}</div>
                </div>
              </div>

              {/* Required Skills */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-surface-900 mb-3">Skill yang Dibutuhkan</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((s, i) => (
                    <span
                      key={i}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        s.is_mandatory
                          ? "bg-primary-50 text-primary-600 border border-primary-200"
                          : "bg-surface-100 text-surface-500 border border-surface-200"
                      }`}
                    >
                      {s.name} {s.is_mandatory && <Icon name="spark" className="inline ml-1" size={11} />}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-surface-400 mt-2"><Icon name="spark" className="inline mr-1" size={11} />= Skill wajib</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-surface-900 mb-3">Deskripsi Pekerjaan</h3>
                <div className="text-sm text-surface-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* AI Match Card */}
            {isTalent && (
              <div
                className="glass rounded-2xl p-6 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-sm">
                    <Icon name="ai" className="text-primary-600" size={17} /></div>
                  <div>
                    <h3 className="font-bold text-sm text-surface-900">AI Match Analysis</h3>
                    <span className="text-[10px] text-surface-400">
                      Powered by GPT-4o
                    </span>
                  </div>
                </div>

                {match ? (
                  <div className="space-y-4">
                    {/* Score Ring */}
                    <div className="flex justify-center">
                      <ScoreRing score={match.match_score} />
                    </div>

                    {/* Recommendation Badge */}
                    <div className="flex justify-center">
                      <span
                        className={`text-xs px-4 py-1.5 rounded-full font-medium ${
                          match.recommendation === "highly_recommended"
                            ? "bg-emerald-50 text-accent-600 border border-emerald-200"
                            : match.recommendation === "recommended"
                              ? "bg-primary-50 text-primary-600 border border-primary-200"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {match.recommendation === "highly_recommended"
                          ? "Sangat Direkomendasikan" : match.recommendation === "recommended" ? "Direkomendasikan" : "Kurang Cocok"}
                      </span>
                    </div>

                    {/* Strengths */}
                    {Array.isArray(match.strengths) && match.strengths.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-accent-600 mb-2">
                          Kelebihanmu
                        </h4>
                        <div className="space-y-1">
                          {match.strengths.map((s, i) => (
                            <div
                              key={i}
                              className="text-xs text-surface-600 flex items-start gap-1.5"
                            >
                              <Icon name="check" className="text-accent-500 mt-0.5 shrink-0" size={12} />
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gaps */}
                    {Array.isArray(match.gaps) && match.gaps.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-amber-600 mb-2">
                          Perlu Ditingkatkan
                        </h4>
                        <div className="space-y-1">
                          {match.gaps.map((g, i) => (
                            <div
                              key={i}
                              className="text-xs text-surface-600 flex items-start gap-1.5"
                            >
                              <Icon name="arrowRight" className="text-amber-500 mt-0.5 shrink-0" size={12} />
                              {g}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Reasoning */}
                    <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                      <div className="text-[10px] text-primary-600 font-medium mb-1">
                        AI Reasoning
                      </div>
                      <p className="text-xs text-surface-600 leading-relaxed">
                        {match.reasoning}
                      </p>
                      {match.portfolio_evidence && (
                        <div className="mt-2 text-[10px] text-[#854F0B] leading-relaxed">
                          Portfolio evidence: {match.portfolio_evidence}
                        </div>
                      )}
                    </div>

                    {/* Apply Button */}
                    {match.status === "recommended" && job.status === "active" && (
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="w-full btn-primary py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {applying ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Mengirim lamaran...
                          </>
                        ) : (
                          <><Icon name="briefcase" size={15} />Lamar Job Ini</>
                        )}
                      </button>
                    )}

                    {match.status === "applied" && (
                      <div className="w-full py-3 text-center text-sm font-semibold rounded-xl bg-primary-50 text-primary-600 border border-primary-200">
                        Lamaran Terkirim
                      </div>
                    )}

                    {match.status === "accepted" && (
                      <div className="w-full py-3 text-center text-sm font-semibold rounded-xl bg-emerald-50 text-accent-600 border border-emerald-200">
                        Kamu Diterima!
                      </div>
                    )}

                    {match.status === "rejected" && (
                      <div className="w-full py-3 text-center text-sm font-semibold rounded-xl bg-red-50 text-red-600 border border-red-200">
                        Job ini tidak dilanjutkan
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Icon name="search" className="mx-auto mb-3 text-surface-300" size={30} />
                    <p className="text-xs text-surface-500 mb-4">
                      Analisis kesesuaian skill-mu dengan job ini menggunakan AI
                    </p>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing || job.status !== "active"}
                      className="w-full btn-primary py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {analyzing ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          AI sedang menganalisis...
                        </>
                      ) : (
                        <><Icon name="ai" size={15} />Analyze Match Score</>
                      )}
                    </button>
                    {job.status !== "active" && (
                      <p className="text-[10px] text-surface-400 mt-2">
                        Job sudah tidak aktif
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Not logged in CTA */}
            {!user && (
              <div
                className="glass rounded-2xl p-6 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="text-center">
                  <Icon name="spark" className="mx-auto mb-3 text-primary-600" size={30} />
                  <h3
                    className="font-bold text-sm mb-2 text-surface-900"
                    style={{ fontFamily: "Outfit" }}
                  >
                    Tertarik dengan job ini?
                  </h3>
                  <p className="text-xs text-surface-500 mb-4">
                    Daftar sebagai Talenta untuk melihat AI Match Score dan melamar.
                  </p>
                  <Link href={`/register?role=talent&redirect=${encodeURIComponent(`/jobs/${jobId}`)}`} className="btn-primary text-sm w-full block text-center">
                    Daftar Sekarang
                  </Link>
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`}
                    className="text-xs text-primary-600 mt-3 block hover:underline"
                  >
                    Sudah punya akun? Masuk
                  </Link>
                </div>
              </div>
            )}

            {/* Client viewing */}
            {user?.role === "client" && (
              <div
                className="glass rounded-2xl p-6 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="text-center">
                  <Icon name="search" className="mx-auto mb-3 text-surface-300" size={30} />
                  <p className="text-xs text-surface-500 mb-4">
                    Kelola job dan lihat hasil AI matching di dashboard.
                  </p>
                  <Link
                    href="/client/dashboard"
                    className="btn-primary text-sm w-full block text-center"
                  >
                    Buka Dashboard
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Info Card */}
            <div
              className="glass rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h3 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2"><Icon name="briefcase" size={15} />Info Job</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Client</span>
                  <span className="text-xs font-medium text-surface-700">{job.client_name}</span>
                </div>
                <div className="h-px bg-surface-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Kategori</span>
                  <span className="text-xs font-medium text-surface-700">{categoryLabel}</span>
                </div>
                <div className="h-px bg-surface-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Skills</span>
                  <span className="text-xs font-medium text-surface-700">
                    {job.required_skills.length} skill
                  </span>
                </div>
                <div className="h-px bg-surface-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Diposting</span>
                  <span className="text-xs font-medium text-surface-700">
                    {new Date(job.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
