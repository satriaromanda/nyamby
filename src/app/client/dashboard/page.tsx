"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { RatingModal } from "@/components/RatingModal";
import { NotificationBell } from "@/components/NotificationBell";
import { JobStatusTracker } from "@/components/JobStatusTracker";

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
  talent_bid_amount?: number | null;
  talent_message?: string | null;
  talent_portfolio_link?: string | null;
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

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  matched: "Matched",
  in_progress: "In Progress",
  submitted_for_review: "Review",
  revision_requested: "Revisi",
  completed: "Selesai",
  cancelled: "Batal",
  disputed: "Sengketa",
};

const ACTIVE_STATUSES = ["active", "matched", "in_progress", "submitted_for_review", "revision_requested"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 30) return `${days}h lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */

export default function ClientDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; jobId: string; talentProfileId: string } | null>(null);
  const [historyTab, setHistoryTab] = useState<"all" | "completed" | "cancelled">("all");
  const [rightPanel, setRightPanel] = useState<"detail" | "history">("history");
  const [reviewMatch, setReviewMatch] = useState<TopMatch | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/client/dashboard");
      const d = await res.json();
      if (!d.success && res.status === 401) { router.push("/login"); return; }
      setJobs(d.data?.jobs || []);
    } catch { router.push("/login"); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleSendOffer = async (matchId: string, talentName: string) => {
    if (!confirm(`Kirim tawaran job ke ${talentName}?`)) return;
    await fetch(`/api/matches/${matchId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "offered" }) });
    fetchDashboard();
  };

  const handlePayEscrow = (jobId: string) => { router.push(`/client/escrow/${jobId}`); };

  const handleReleaseEscrow = async (jobId: string) => {
    if (!confirm("Terima hasil kerja dan rilis dana ke talenta?")) return;
    setUpdatingJobId(jobId);
    try {
      await fetch(`/api/jobs/${jobId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) });
      await fetch("/api/escrow/release", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job_id: jobId }) });
      fetchDashboard();
    } finally { setUpdatingJobId(null); }
  };

  const handleRequestRevision = async (jobId: string) => {
    const reason = prompt("Masukkan alasan revisi:");
    if (!reason) return;
    setUpdatingJobId(jobId);
    try {
      await fetch(`/api/jobs/${jobId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "revision_requested" }) });
      fetchDashboard();
    } finally { setUpdatingJobId(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status));
  const selectedJob = expandedJob ? jobs.find((j) => j.id === expandedJob) : null;
  const acceptedTalent = (job: JobItem) => job.top_matches.find((m) => m.status === "accepted");

  const historyJobs = historyTab === "completed"
    ? jobs.filter((j) => j.status === "completed")
    : historyTab === "cancelled"
    ? jobs.filter((j) => j.status === "cancelled")
    : jobs;

  const selectJob = (id: string) => {
    setExpandedJob(expandedJob === id ? null : id);
    setRightPanel("detail");
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1 text-surface-900">
              Dashboard <span className="text-gradient-brand">Client</span>
            </h1>
            <p className="text-surface-500 text-sm">Kelola job posting dan lihat talenta terbaik yang direkomendasikan AI.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start">
            <NotificationBell />
            <Link href="/client/post-job" className="btn-primary text-xs px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">+ Post Job Baru</Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Jobs", value: jobs.length, icon: "file" as const, color: "text-primary-600" },
            { label: "Aktif", value: jobs.filter((j) => j.status === "active").length, icon: "check" as const, color: "text-blue-600" },
            { label: "In Progress", value: jobs.filter((j) => ["in_progress", "submitted_for_review", "revision_requested"].includes(j.status)).length, icon: "settings" as const, color: "text-amber-600" },
            { label: "Selesai", value: jobs.filter((j) => j.status === "completed").length, icon: "check" as const, color: "text-emerald-600" },
          ].map((stat, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-surface-50 ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon name={stat.icon} size={16} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-surface-900 leading-none mb-0.5">{stat.value}</div>
                <div className="text-[10px] text-surface-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MAIN 2-COLUMN LAYOUT ═══ */}
      <div className="max-w-7xl mx-auto px-6 pb-8 w-full flex-1 min-h-0">
        <div className="flex gap-6 h-[calc(100vh-320px)] min-h-[480px]">

          {/* ── LEFT: Job List (scrollable) ── */}
          <div className="w-[380px] shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-surface-900 flex items-center gap-2">
                <Icon name="briefcase" className="text-primary-600" size={16} />
                Job Aktif ({activeJobs.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {activeJobs.map((job) => {
                const talent = acceptedTalent(job);
                const isSelected = expandedJob === job.id && rightPanel === "detail";
                return (
                  <div
                    key={job.id}
                    onClick={() => selectJob(job.id)}
                    className={`rounded-xl p-3.5 cursor-pointer transition-all duration-150 border ${
                      isSelected
                        ? "border-primary-400 bg-primary-50/50 shadow-sm"
                        : "border-surface-200 bg-white hover:border-primary-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-[13px] font-bold text-surface-900 truncate flex-1">{job.title}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 status-${job.status}`}>
                        {STATUS_LABELS[job.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-surface-400">
                      {job.budget_max && (
                        <span className="inline-flex items-center gap-0.5">
                          <Icon name="money" size={10} />Rp {Number(job.budget_max).toLocaleString("id-ID")}
                        </span>
                      )}
                      {talent ? (
                        <span className="inline-flex items-center gap-0.5"><Icon name="users" size={10} />{talent.full_name}</span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5"><Icon name="chart" size={10} />{job.top_matches.length} match</span>
                      )}
                      <span className="inline-flex items-center gap-0.5"><Icon name="calendar" size={10} />{timeAgo(job.created_at)}</span>
                    </div>
                    {/* Mini action row */}
                    {["in_progress", "submitted_for_review", "revision_requested"].includes(job.status) && (
                      <div className="mt-2 pt-2 border-t border-surface-100 flex items-center gap-2">
                        <Link
                          href={`/workspace/${job.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 hover:bg-primary-100 font-medium transition-colors"
                        >
                          Buka Workspace
                        </Link>
                        {job.escrow?.status === "pending" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePayEscrow(job.id); }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 font-medium transition-colors animate-pulse"
                          >
                            Bayar Escrow
                          </button>
                        )}
                      </div>
                    )}
                    {job.status === "matched" && job.top_matches.some(m => m.status === "accepted") && !job.escrow && (
                      <div className="mt-2 pt-2 border-t border-surface-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePayEscrow(job.id); }}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 font-medium transition-colors animate-pulse"
                        >
                          Bayar Escrow
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {activeJobs.length === 0 && (
                <div className="rounded-xl border border-dashed border-surface-300 p-8 text-center">
                  <Icon name="file" className="mx-auto text-surface-300 mb-2" size={32} />
                  <p className="text-xs text-surface-400">Belum ada job aktif</p>
                  <Link href="/client/post-job" className="btn-primary text-[10px] px-3 py-1 mt-3 inline-block">+ Post Job</Link>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Detail Panel / History ── */}
          <div className="flex-1 min-w-0 flex flex-col">
            {selectedJob ? (
              /* ── Job Detail Panel ── */
              <div className="flex-1 overflow-y-auto card p-6 border border-surface-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-surface-900 truncate">{selectedJob.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 status-${selectedJob.status}`}>
                      {STATUS_LABELS[selectedJob.status]}
                    </span>
                  </div>
                  <button onClick={() => setExpandedJob(null)} className="text-surface-400 hover:text-surface-600 p-1 rounded-lg hover:bg-surface-100">
                    <Icon name="x" size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedJob.required_skills.map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">{s}</span>
                  ))}
                </div>

                <JobStatusTracker status={selectedJob.status} />

                <div className="flex flex-wrap gap-3 text-xs text-surface-400 my-4 pb-4 border-b border-surface-200">
                  {selectedJob.budget_max && <span className="inline-flex items-center gap-1"><Icon name="money" size={13} />Rp {Number(selectedJob.budget_max).toLocaleString("id-ID")}</span>}
                  {selectedJob.deadline && <span className="inline-flex items-center gap-1"><Icon name="calendar" size={13} />{new Date(selectedJob.deadline).toLocaleDateString("id-ID")}</span>}
                </div>

                {/* AI Matched Talents */}
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-surface-900">
                  <Icon name="ai" className="text-primary-600" size={15} />AI Matched Talents
                </h4>

                {selectedJob.top_matches.some((m) => m.aiStatus === "processing" || m.aiStatus === "pending") ? (
                  <div className="flex flex-col items-center py-6 bg-surface-50 rounded-xl border border-surface-200">
                    <div className="w-6 h-6 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mb-3" />
                    <p className="text-xs text-surface-500">AI sedang mencarikan talenta...</p>
                  </div>
                ) : selectedJob.top_matches.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {selectedJob.top_matches.map((match) => (
                      <div key={match.match_id} className="flex flex-col p-2.5 rounded-xl bg-surface-50 border border-surface-200 gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0">{match.full_name[0]}</div>
                            <div className="min-w-0">
                              <Link href={`/talents/${match.talent_profile_id}`} onClick={(e) => e.stopPropagation()} className="text-xs font-medium text-surface-900 hover:text-primary-600">{match.full_name}</Link>
                              <div className="text-[9px] text-surface-400">{match.recommendation === "highly_recommended" ? "Sangat Direkomendasikan" : "Direkomendasikan"}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-sm font-bold ${Number(match.match_score) >= 80 ? "text-accent-600" : "text-primary-600"}`}>{Math.round(Number(match.match_score))}%</span>
                            {match.status === "recommended" && <button onClick={(e) => { e.stopPropagation(); handleSendOffer(match.match_id, match.full_name); }} className="btn-primary text-[10px] px-2 py-1">Kirim Tawaran</button>}
                            {match.status === "applied" && <button onClick={(e) => { e.stopPropagation(); setReviewMatch(match); }} className="btn-primary text-[10px] px-2 py-1">Lihat Detail</button>}
                            {match.status === "offered" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Menunggu</span>}
                            {match.status === "accepted" && !selectedJob.escrow ? (
                              <button onClick={(e) => { e.stopPropagation(); handlePayEscrow(selectedJob.id); }} className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-2 py-1 rounded-lg font-semibold flex items-center gap-1 animate-pulse">
                                <Icon name="shield" size={11} />Bayar Escrow
                              </button>
                            ) : match.status === "accepted" ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-accent-600">Diterima</span> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-surface-400 mb-4">Belum ada talenta yang dimatch.</p>}

                {/* Escrow */}
                {selectedJob.escrow && (
                  <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-surface-900 flex items-center gap-1.5 mb-1">
                          <Icon name="shield" className="text-trust-500" size={14} />Status Escrow
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full status-${selectedJob.escrow.status}`}>
                            {selectedJob.escrow.status === "held" ? "Dana Ditahan" : selectedJob.escrow.status === "released" ? "Dana Dirilis" : selectedJob.escrow.status === "pending" ? "Menunggu Bayar" : selectedJob.escrow.status}
                          </span>
                          <span className="text-xs text-surface-500">Rp {Number(selectedJob.escrow.amount).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                      {selectedJob.escrow.status === "held" && selectedJob.status === "submitted_for_review" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleRequestRevision(selectedJob.id)} disabled={updatingJobId === selectedJob.id} className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50">Minta Revisi</button>
                          <button onClick={() => handleReleaseEscrow(selectedJob.id)} disabled={updatingJobId === selectedJob.id} className="bg-accent-500 hover:bg-accent-600 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 flex items-center gap-1"><Icon name="check" size={12} />Terima & Rilis</button>
                        </div>
                      )}
                      {selectedJob.escrow.status === "pending" && (
                        <button onClick={() => handlePayEscrow(selectedJob.id)} className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 animate-pulse"><Icon name="shield" size={11} />Lanjutkan Bayar</button>
                      )}
                    </div>
                    {selectedJob.escrow.status === "held" && selectedJob.status !== "completed" && (
                      <Link href={`/workspace/${selectedJob.id}`} className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 py-2 rounded-xl transition-all">
                        <Icon name="users" size={14} />Buka Ruang Kerja
                      </Link>
                    )}
                  </div>
                )}

                {/* Rating */}
                {selectedJob.status === "completed" && (
                  <div className="pt-4 border-t border-surface-200">
                    {!selectedJob.has_rating ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-surface-500">Berikan penilaian untuk talenta.</span>
                        <button onClick={() => { const am = selectedJob.top_matches.find(m => m.status === "accepted"); if (am) setRatingModal({ isOpen: true, jobId: selectedJob.id, talentProfileId: am.talent_profile_id }); }} className="btn-primary text-[10px] px-3 py-1.5">Berikan Rating</button>
                      </div>
                    ) : (
                      <div className="text-xs text-surface-500 flex items-center gap-2"><Icon name="check" className="text-emerald-500" size={14} />Rating sudah diberikan.</div>
                    )}
                  </div>
                )}
              </div>

            ) : (
              <div className="flex-1 card p-8 border border-surface-200 flex flex-col items-center justify-center text-center">
                <Icon name="briefcase" className="text-surface-200 mb-3" size={48} />
                <p className="text-sm text-surface-400 font-medium">Pilih job di sebelah kiri untuk melihat detail</p>
                <p className="text-xs text-surface-300 mt-1">Klik pada salah satu job aktif</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ COMPLETED JOBS HISTORY ═══ */}
      <div className="max-w-7xl mx-auto px-6 pb-8 w-full">
        <h2 className="text-sm font-bold text-surface-900 flex items-center gap-2 mb-4">
          <Icon name="check" className="text-emerald-600" size={16} />
          Riwayat Job Selesai ({jobs.filter(j => j.status === "completed").length})
        </h2>
        <div className="card overflow-hidden border border-surface-200">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-surface-50 border-b border-surface-200 text-[9px] font-semibold text-surface-400 uppercase tracking-wider">
            <div className="col-span-4">Job</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Talent</div>
            <div className="col-span-2">Budget</div>
            <div className="col-span-2">Tanggal Selesai</div>
          </div>
          <div className="divide-y divide-surface-100 max-h-[400px] overflow-y-auto scrollbar-thin">
            {jobs.filter((j) => j.status === "completed").map((job) => {
              const talent = acceptedTalent(job);
              return (
                <div key={job.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-surface-50 transition-colors group">
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
                    <span className="text-xs font-medium text-surface-900 truncate group-hover:text-primary-600 transition-colors">{job.title}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full status-completed">Selesai</span>
                  </div>
                  <div className="col-span-2">
                    {talent ? (
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-[9px] font-bold text-white shrink-0">{talent.full_name[0]}</div>
                        <span className="text-[11px] font-medium text-surface-700 truncate">{talent.full_name}</span>
                      </div>
                    ) : <span className="text-[10px] text-surface-300">—</span>}
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-medium text-surface-700">{job.budget_max ? `Rp ${(Number(job.budget_max) / 1000000).toFixed(1)}jt` : "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-surface-500">{new Date(job.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
            {jobs.filter((j) => j.status === "completed").length === 0 && (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
                  <Icon name="check" className="text-surface-300" size={20} />
                </div>
                <p className="text-xs text-surface-400">Belum ada job yang telah diselesaikan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {ratingModal && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          jobId={ratingModal.jobId}
          talentProfileId={ratingModal.talentProfileId}
          onClose={() => setRatingModal(null)}
          onSuccess={() => { setRatingModal(null); fetchDashboard(); }}
        />
      )}

      {reviewMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-surface-900">Review Lamaran Talent</h3>
              <button onClick={() => setReviewMatch(null)} className="text-surface-400 hover:text-surface-600">
                <Icon name="x" size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200 mb-6">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-base font-bold text-white shrink-0">
                {reviewMatch.full_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/talents/${reviewMatch.talent_profile_id}`} target="_blank" className="text-base font-bold text-surface-900 hover:text-primary-600 flex items-center gap-1">
                  {reviewMatch.full_name} <Icon name="external" size={14} className="text-surface-400" />
                </Link>
                <div className="text-xs text-surface-500">
                  Kecocokan AI: <span className="font-bold text-primary-600">{Math.round(Number(reviewMatch.match_score))}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-surface-500 mb-1 uppercase tracking-wider">Penawaran Harga (Bid)</label>
                <div className="text-lg font-bold text-primary-700">
                  {reviewMatch.talent_bid_amount ? `Rp ${Number(reviewMatch.talent_bid_amount).toLocaleString("id-ID")}` : (selectedJob?.budget_max ? `Rp ${Number(selectedJob.budget_max).toLocaleString("id-ID")} (Sesuai Budget Client)` : "Sesuai Budget")}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-500 mb-1 uppercase tracking-wider">Cover Letter / Pesan</label>
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-sm text-surface-700 whitespace-pre-wrap">
                  {reviewMatch.talent_message || <span className="text-surface-400 italic">Tidak ada pesan yang dilampirkan.</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-500 mb-1 uppercase tracking-wider">Portfolio Tambahan</label>
                {reviewMatch.talent_portfolio_link ? (
                  <a href={reviewMatch.talent_portfolio_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors text-sm font-medium">
                    <Icon name="link" size={16} /> Lihat Portfolio <Icon name="external" size={14} className="ml-auto" />
                  </a>
                ) : (
                  <div className="text-sm text-surface-400 italic">Tidak melampirkan portfolio spesifik.</div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-surface-200">
              <button
                onClick={() => setReviewMatch(null)}
                className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleSendOffer(reviewMatch.match_id, reviewMatch.full_name);
                  setReviewMatch(null);
                }}
                className="btn-primary text-sm px-6 py-2.5 flex items-center justify-center gap-2"
              >
                <Icon name="check" size={16} /> Terima Lamaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
