"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Icon, Logo } from "@/components/icons";
import { useRouter } from "next/navigation";

interface BankInfo {
  bankCode: string | null;
  bankAccount: string | null;
  bankAccountName: string | null;
}

interface DisputeDetail {
  id: string;
  status: string;
  reason: string;
  resolution: string | null;
  job: {
    title: string;
    budgetMin: number | null;
    budgetMax: number | null;
    client: {
      id: string;
      fullName: string;
      email: string;
      clientProfile: BankInfo | null;
    };
  };
  escrow: {
    id: string;
    amount: number;
    status: string;
    talent: {
      id: string;
      fullName: string;
      email: string;
      talentProfile: BankInfo | null;
    };
  };
  initiator: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminDisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [progressPct, setProgressPct] = useState(0);
  const [resolution, setResolution] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const res = await fetch(`/api/admin/disputes/${id}`);
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setDispute(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Gagal memuat detail dispute");
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [id, router]);

  const handleResolve = async () => {
    if (!dispute) return;
    if (!resolution.trim()) {
      showToast("Alasan resolusi wajib diisi", "error");
      return;
    }

    setResolving(true);
    try {
      const res = await fetch("/api/admin/disputes/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispute_id: dispute.id,
          progress_pct: progressPct,
          resolution,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Dispute berhasil di-resolve!", "success");
        setTimeout(() => {
          router.push("/admin/disputes");
        }, 1500);
      } else {
        showToast(data.message || "Gagal me-resolve dispute", "error");
        setResolving(false);
      }
    } catch (err) {
      showToast("Terjadi kesalahan server", "error");
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">{error || "Dispute tidak ditemukan"}</p>
        <Link href="/admin/disputes" className="btn-outline">Kembali ke Daftar</Link>
      </div>
    );
  }

  // Kalkulasi Split Dana (PRD 7.1)
  let talentPct = 0;
  if (progressPct <= 25) {
    talentPct = 0;
  } else if (progressPct <= 75) {
    talentPct = 50;
  } else {
    talentPct = 100;
  }
  
  const totalAmount = Number(dispute.escrow.amount);
  const talentAmount = Math.round((totalAmount * talentPct) / 100 * 100) / 100;
  const clientRefund = Math.round((totalAmount - talentAmount) * 100) / 100;

  const isResolved = dispute.status === "resolved";

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
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
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo height={32} />
            </Link>
            <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-md">
              ADMIN
            </span>
          </div>
          <Link href="/admin/disputes" className="text-xs text-surface-400 hover:text-surface-700">
            Kembali ke Daftar
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-surface-900">
              Detail Dispute
            </h1>
            <p className="text-surface-500">ID: {dispute.id}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              dispute.status === "open"
                ? "bg-red-100 text-red-700"
                : dispute.status === "investigating"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {dispute.status.toUpperCase()}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Info Job & Escrow */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 text-surface-900">Informasi Job & Escrow</h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-surface-500">Job Title</span>
                <span className="font-medium text-surface-900">{dispute.job.title}</span>
              </div>
              <div>
                <span className="block text-xs text-surface-500">Total Escrow</span>
                <span className="font-bold text-primary-600 text-lg">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="pt-3 border-t border-surface-200">
                <span className="block text-xs text-surface-500 mb-1">Inisiator Dispute</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-surface-900">{dispute.initiator.fullName}</span>
                  <span className="text-[10px] uppercase bg-surface-100 px-2 py-0.5 rounded text-surface-500">{dispute.initiator.role}</span>
                </div>
              </div>
              <div>
                <span className="block text-xs text-surface-500">Alasan</span>
                <p className="text-sm text-surface-700 bg-surface-50 p-3 rounded-lg border border-surface-200 mt-1">
                  {dispute.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Info Client & Talent Bank */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 text-surface-900">Rekening Tujuan</h3>
            
            <div className="mb-4">
              <span className="block text-xs font-bold text-surface-900 uppercase tracking-wider mb-2">Talent (Penerima Dana)</span>
              {dispute.escrow.talent?.talentProfile?.bankCode ? (
                <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
                  <div className="font-medium text-sm">{dispute.escrow.talent.fullName}</div>
                  <div className="text-xs text-surface-500">
                    {dispute.escrow.talent.talentProfile.bankCode} - {dispute.escrow.talent.talentProfile.bankAccount}
                    <br />a.n {dispute.escrow.talent.talentProfile.bankAccountName}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">Belum mengatur rekening</div>
              )}
            </div>

            <div>
              <span className="block text-xs font-bold text-surface-900 uppercase tracking-wider mb-2">Client (Penerima Refund)</span>
              {dispute.job.client?.clientProfile?.bankCode ? (
                <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
                  <div className="font-medium text-sm">{dispute.job.client.fullName}</div>
                  <div className="text-xs text-surface-500">
                    {dispute.job.client.clientProfile.bankCode} - {dispute.job.client.clientProfile.bankAccount}
                    <br />a.n {dispute.job.client.clientProfile.bankAccountName}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">Belum mengatur rekening</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="card p-6 border-2 border-primary-100">
          <h3 className="font-bold text-lg mb-2 text-surface-900">Resolusi Arbitrasi</h3>
          
          {isResolved ? (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                <Icon name="check" className="inline mr-2" size={20} />
                Dispute ini sudah diselesaikan.
              </div>
              <div>
                <span className="block text-xs text-surface-500">Resolusi dari Admin</span>
                <p className="text-sm font-medium mt-1">{dispute.resolution}</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-surface-500 mb-6">
                Berdasarkan evaluasi progress yang telah dikerjakan talent, tentukan persentase penyelesaian.
              </p>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-surface-900">Progress Pengerjaan: {progressPct}%</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPct}
                  onChange={(e) => setProgressPct(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-surface-400 mt-2 font-medium">
                  <span>0% (Full Refund Client)</span>
                  <span>50% (Split)</span>
                  <span>100% (Full Payout Talent)</span>
                </div>
              </div>

              {/* Preview Split */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                  <div className="text-xs text-primary-600 mb-1">Bagian Talent ({talentPct}%)</div>
                  <div className="text-xl font-bold text-primary-900">Rp {talentAmount.toLocaleString("id-ID")}</div>
                </div>
                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <div className="text-xs text-surface-600 mb-1">Refund Client ({100 - talentPct}%)</div>
                  <div className="text-xl font-bold text-surface-900">Rp {clientRefund.toLocaleString("id-ID")}</div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-surface-900 mb-2">
                  Catatan Resolusi
                </label>
                <textarea
                  className="input-dark min-h-[100px]"
                  placeholder="Jelaskan alasan penetapan progress ini..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleResolve}
                  disabled={resolving || !dispute.job.client?.clientProfile?.bankCode || !dispute.escrow.talent?.talentProfile?.bankCode}
                  className="btn-primary"
                >
                  {resolving ? "Memproses..." : "Resolve Dispute & Transfer Dana"}
                </button>
              </div>
              {(!dispute.job.client?.clientProfile?.bankCode || !dispute.escrow.talent?.talentProfile?.bankCode) && (
                <p className="text-xs text-red-500 text-right mt-2">
                  Kedua belah pihak wajib memiliki informasi bank sebelum dispute dapat di-resolve.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
