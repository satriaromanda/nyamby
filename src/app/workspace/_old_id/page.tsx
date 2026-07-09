"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { JobStatusTracker } from "@/components/JobStatusTracker";

/**
 * Ruang Kerja — shared talent↔client workspace for a running job (PRD v5.3 §6.2).
 * Reuses GET /api/jobs/:id, PATCH /api/jobs/:id/status, POST /api/escrow/release,
 * POST /api/escrow/dispute. No new backend.
 * Deliberately NOT real-time chat — no Message model yet (separate scope).
 */

interface WorkspaceJob {
  id: string;
  title: string;
  description: string;
  category: string;
  client_name: string;
  client_avatar: string | null;
  client_user_id: string;
  budget_min: number;
  budget_max: number;
  deadline: string | null;
  status: string;
  created_at: string;
  submission_url: string | null;
  submission_notes: string | null;
  submitted_at: string | null;
}

interface MatchedTalent {
  match_id: string;
  full_name: string;
  avatar_url: string | null;
  status: string;
}

interface EscrowInfo {
  id: string;
  amount: number;
  status: string;
  held_at: string | null;
  released_at: string | null;
}

interface SessionUser {
  id: string;
  role: string;
  full_name: string;
}

function Avatar({ name, url, size = 44 }: { name: string; url?: string | null; size?: number }) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full gradient-primary text-white flex items-center justify-center font-bold"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<WorkspaceJob | null>(null);
  const [acceptedTalent, setAcceptedTalent] = useState<MatchedTalent | null>(null);
  const [escrow, setEscrow] = useState<EscrowInfo | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  // Actions state
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("ghosting");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [sessRes, jobRes] = await Promise.all([
        fetch("/api/auth/session").then((r) => r.json()),
        fetch(`/api/jobs/${jobId}`).then((r) => r.json()),
      ]);

      const sessionUser: SessionUser | null =
        sessRes?.success && sessRes.user ? sessRes.user : null;
      setUser(sessionUser);

      if (!jobRes?.success) {
        setJob(null);
        return;
      }

      const j: WorkspaceJob = jobRes.data.job;
      const talents: MatchedTalent[] = jobRes.data.matched_talents || [];
      const accepted = talents.find((t) => t.status === "accepted") || null;

      // Access guard: only client-owner or the accepted talent belong here
      const isOwner = sessionUser?.id === j.client_user_id;
      const isAcceptedTalent = sessionUser?.role === "talent" && !!accepted;
      if (!sessionUser || (!isOwner && !isAcceptedTalent)) {
        setDenied(true);
        return;
      }

      setJob(j);
      setAcceptedTalent(accepted);
      setEscrow(jobRes.data.escrow || null);
    } catch {
      // network error → show not-found state
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const patchStatus = async (
    status: string,
    extra: Record<string, string> = {},
    successMsg = "Status diperbarui"
  ) => {
    setActing(status);
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(successMsg);
        await fetchAll();
      } else {
        showToast(d.message || "Gagal memperbarui status", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setActing(null);
    }
  };

  const handleSubmitDeliverable = () => {
    if (!submissionUrl.trim()) {
      showToast("Link hasil kerja wajib diisi", "error");
      return;
    }
    patchStatus(
      "submitted_for_review",
      { submission_url: submissionUrl.trim(), submission_notes: submissionNotes.trim() },
      "Hasil kerja terkirim! Client akan segera review."
    );
  };

  const handleReleaseEscrow = async () => {
    setActing("release");
    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("Pencairan dana sedang diproses.");
        await fetchAll();
      } else {
        showToast(d.message || "Gagal merilis dana", "error");
      }
    } catch {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setActing(null);
    }
  };

  const handleDispute = async () => {
    if (!disputeDesc.trim()) {
      showToast("Tolong jelaskan masalahnya secara detail", "error");
      return;
    }
    setActing("dispute");
    try {
      const res = await fetch("/api/escrow/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, reason: disputeReason, description: disputeDesc }),
      });
      const d = await res.json();
      if (d.success) {
        showToast("Tiket dispute berhasil dibuat. Tim Nyamby akan menghubungi Anda dalam 1x24 jam.");
        setShowDisputeModal(false);
        setDisputeDesc("");
        await fetchAll();
      } else {
        showToast(d.error || d.message || "Gagal membuat laporan", "error");
      }
    } catch {
      showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <nav className="glass sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <Logo height={32} />
          </div>
        </nav>
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
          <div className="skeleton h-8 w-64 rounded-xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (denied || !job || !user) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="glass rounded-xl p-16 text-center max-w-md">
          <Icon name="shield" className="mx-auto mb-4 text-surface-300" size={44} />
          <h2 className="text-xl font-bold mb-2 text-surface-900">
            Ruang Kerja Tidak Tersedia
          </h2>
          <p className="text-surface-400 text-sm mb-6">
            Halaman ini hanya untuk client dan talenta yang terlibat di job ini.
          </p>
          <Link href="/" className="btn-primary text-sm">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isClient = user.id === job.client_user_id;
  const otherParty = isClient
    ? { name: acceptedTalent?.full_name || "Talenta", avatar: acceptedTalent?.avatar_url, label: "Talenta" }
    : { name: job.client_name, avatar: job.client_avatar, label: "Client" };
  const canDispute = ["in_progress", "submitted_for_review", "revision_requested"].includes(job.status);

  return (
    <div className="min-h-screen bg-surface-50">
      {toast && (
        <div className="toast">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === "success" ? "bg-accent-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav role="navigation" aria-label="Main navigation" className="glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <Link
            href={isClient ? "/client/dashboard" : "/talent/dashboard"}
            className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
          >
            <span className="inline-flex items-center gap-1">
              <Icon name="arrowLeft" size={14} />
              Dashboard
            </span>
          </Link>
        </div>
      </nav>

      <main role="main" className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-wider text-primary-600 uppercase mb-1">
            Ruang Kerja
          </p>
          <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Main column ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <h3 className="text-sm font-bold text-surface-900 mb-4">Progress Pekerjaan</h3>
              <JobStatusTracker
                status={job.status}
                onDispute={canDispute ? () => setShowDisputeModal(true) : undefined}
              />
            </div>

            {/* Deliverable (visible once submitted) */}
            {job.submission_url && (
              <div className="bg-white rounded-2xl border border-surface-200 p-6">
                <h3 className="text-sm font-bold text-surface-900 mb-3">Hasil Kerja</h3>
                <a
                  href={job.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline break-all inline-flex items-center gap-1"
                >
                  <Icon name="file" size={14} />
                  {job.submission_url}
                </a>
                {job.submission_notes && (
                  <p className="text-sm text-surface-600 mt-3 whitespace-pre-line">
                    {job.submission_notes}
                  </p>
                )}
                {job.submitted_at && (
                  <p className="text-xs text-surface-400 mt-3">
                    Dikirim {new Date(job.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            )}

            {/* Talent: submit / resubmit deliverable */}
            {!isClient && ["in_progress", "revision_requested"].includes(job.status) && (
              <div className="bg-white rounded-2xl border border-surface-200 p-6">
                <h3 className="text-sm font-bold text-surface-900 mb-1">
                  {job.status === "revision_requested" ? "Kirim Revisi" : "Kirim Hasil Kerja"}
                </h3>
                <p className="text-xs text-surface-400 mb-4">
                  Bagikan link hasil kerja (Google Drive, Figma, GitHub, dsb).
                </p>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <textarea
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Catatan untuk client (opsional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    onClick={handleSubmitDeliverable}
                    disabled={acting === "submitted_for_review"}
                    className="btn-primary text-sm px-6 py-3 disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {acting === "submitted_for_review" ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Icon name="arrowRight" size={14} />
                    )}
                    Kirim untuk Review
                  </button>
                </div>
              </div>
            )}

            {/* Client: review actions */}
            {isClient && job.status === "submitted_for_review" && (
              <div className="bg-white rounded-2xl border border-surface-200 p-6">
                <h3 className="text-sm font-bold text-surface-900 mb-1">Review Hasil Kerja</h3>
                <p className="text-xs text-surface-400 mb-4">
                  Periksa hasil kerja di atas, lalu setujui atau minta revisi.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      patchStatus("completed", {}, "Pekerjaan selesai! Terima kasih.")
                    }
                    disabled={!!acting}
                    className="btn-primary text-sm px-6 py-3 disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {acting === "completed" ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Icon name="check" size={14} />
                    )}
                    Setujui &amp; Selesaikan
                  </button>
                  <button
                    onClick={() =>
                      patchStatus("revision_requested", {}, "Permintaan revisi terkirim ke talenta.")
                    }
                    disabled={!!acting}
                    className="px-6 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    Minta Revisi
                  </button>
                </div>
              </div>
            )}

            {/* Client: release escrow after completion */}
            {isClient && job.status === "completed" && escrow?.status === "held" && (
              <div className="bg-white rounded-2xl border border-trust-100 p-6">
                <h3 className="text-sm font-bold text-surface-900 mb-1">Rilis Dana Escrow</h3>
                <p className="text-xs text-surface-400 mb-4">
                  Pekerjaan selesai — rilis dana ke talenta sekarang, atau sistem akan merilis
                  otomatis dalam 5 hari kerja.
                </p>
                <button
                  onClick={handleReleaseEscrow}
                  disabled={acting === "release"}
                  className="w-full bg-trust-500 hover:bg-trust-600 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {acting === "release" ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Icon name="money" size={16} />
                  )}
                  Rilis Dana Rp {Number(escrow.amount).toLocaleString("id-ID")}
                </button>
              </div>
            )}

            {/* Job brief */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <h3 className="text-sm font-bold text-surface-900 mb-3">Deskripsi Pekerjaan</h3>
              <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Contact card (basic connect — not chat, see §6.2 scope note) */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-bold text-surface-900 mb-4">{otherParty.label}</h3>
              <div className="flex items-center gap-3">
                <Avatar name={otherParty.name} url={otherParty.avatar} />
                <div>
                  <p className="text-sm font-semibold text-surface-900">{otherParty.name}</p>
                  <p className="text-xs text-surface-400">{otherParty.label} di job ini</p>
                </div>
              </div>
            </div>

            {/* Escrow status */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Icon name="shield" size={15} />
                Escrow
              </h3>
              {escrow ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-400">Jumlah</span>
                    <span className="text-xs font-semibold text-surface-700">
                      Rp {Number(escrow.amount).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="h-px bg-surface-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-400">Status</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        escrow.status === "held"
                          ? "bg-trust-50 text-trust-600"
                          : escrow.status === "released"
                            ? "bg-emerald-50 text-accent-600"
                            : "bg-surface-100 text-surface-500"
                      }`}
                    >
                      {escrow.status === "held"
                        ? "Dana Diamankan"
                        : escrow.status === "released"
                          ? "Dana Dirilis"
                          : escrow.status}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-surface-400">Belum ada dana escrow untuk job ini.</p>
              )}
            </div>

            {/* Key info */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                <Icon name="briefcase" size={15} />
                Info Job
              </h3>
              <div className="space-y-3">
                {job.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-400">Deadline</span>
                    <span className="text-xs font-medium text-surface-700">
                      {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
                <div className="h-px bg-surface-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Detail lengkap</span>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-xs font-medium text-primary-600 hover:underline"
                  >
                    Lihat Job →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dispute Modal (same flow as jobs/[id] — POST /api/escrow/dispute) */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-surface-900 mb-2">Laporkan Masalah</h3>
            <p className="text-sm text-surface-500 mb-4">
              Tim Nyamby akan meninjau laporan Anda dalam 1x24 jam.
            </p>
            <label className="block text-xs font-semibold text-surface-600 mb-1">Alasan</label>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ghosting">Tidak ada kabar (ghosting)</option>
              <option value="quality_issue">Kualitas tidak sesuai</option>
              <option value="scope_change">Scope berubah sepihak</option>
              <option value="other">Lainnya</option>
            </select>
            <label className="block text-xs font-semibold text-surface-600 mb-1">Detail masalah</label>
            <textarea
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
              rows={4}
              placeholder="Jelaskan masalah yang terjadi..."
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDisputeModal(false)}
                disabled={acting === "dispute"}
                className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDispute}
                disabled={acting === "dispute"}
                className="btn-primary text-sm px-6 py-2 flex items-center justify-center gap-2"
              >
                {acting === "dispute" ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Kirim Laporan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
