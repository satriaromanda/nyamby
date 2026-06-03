"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

interface CancelEscrowModalProps {
  jobId: string;
  totalEscrowAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function CancelEscrowModal({
  jobId,
  totalEscrowAmount,
  isOpen,
  onClose,
  onSuccess,
}: CancelEscrowModalProps) {
  const [progressPct, setProgressPct] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Calculate refund simulation locally
  let talentPct = 0;
  let clientRefundPct = 0;

  if (progressPct <= 25) {
    talentPct = 0;
    clientRefundPct = 100;
  } else if (progressPct <= 75) {
    talentPct = 50;
    clientRefundPct = 50;
  } else {
    talentPct = 100;
    clientRefundPct = 0;
  }

  const talentReceives = Math.round((totalEscrowAmount * talentPct) / 100);
  const clientRefund = totalEscrowAmount - talentReceives;

  const handleCancel = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/escrow/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, progress_pct: progressPct }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Gagal membatalkan kontrak.");
        setLoading(false);
        return;
      }

      onSuccess(data.data);
      onClose();
    } catch {
      setError("Terjadi kesalahan sistem. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-surface-900">Batalkan Kontrak</h2>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-50 transition-colors">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-surface-500 mb-6">
            Pembatalan kontrak akan memicu pengembalian dana (refund) berdasarkan progres yang telah diselesaikan oleh talenta.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Berapa persentase progres saat ini?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressPct}
                onChange={(e) => setProgressPct(Number(e.target.value))}
                className="w-full accent-primary-600 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold w-12 text-right">{progressPct}%</span>
            </div>
            <div className="flex justify-between text-[10px] text-surface-400 mt-2 px-1">
              <span>0% (Mulai)</span>
              <span>100% (Selesai)</span>
            </div>
          </div>

          <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 mb-6">
            <h3 className="text-sm font-bold text-surface-900 mb-3">Estimasi Pengembalian Dana</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-surface-600">
                <span>Total Escrow:</span>
                <span className="font-medium">Rp {totalEscrowAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Refund Anda (Client):</span>
                <span>Rp {clientRefund.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Dibayarkan ke Talenta:</span>
                <span>Rp {talentReceives.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-surface-200 text-xs text-surface-500">
              {progressPct <= 25 && "Progres 0-25%: 100% dana dikembalikan ke client."}
              {progressPct > 25 && progressPct <= 75 && "Progres 26-75%: Dana dibagi 50% client, 50% talenta."}
              {progressPct > 75 && "Progres >75%: 100% dana dibayarkan ke talenta (pekerjaan dianggap hampir selesai)."}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg border border-surface-200 text-surface-600 font-medium hover:bg-surface-50 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Memproses..." : "Konfirmasi Batal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
