"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";

interface Dispute {
  id: string;
  job_id: string;
  job_title: string;
  job_status: string;
  escrow_amount: number;
  escrow_status: string;
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  is_initiator: boolean;
  created_at: string;
  resolved_at: string | null;
}

export default function ClientDisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = useCallback(async () => {
    try {
      const res = await fetch("/api/disputes/my");
      const d = await res.json();
      if (!d.success && res.status === 401) {
        router.push("/login");
        return;
      }
      if (d.success) {
        setDisputes(d.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

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

  const formatIDR = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/client/dashboard" className="flex items-center gap-2 shrink-0">
            <Logo height={32} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Link href="/client/dashboard" className="text-surface-500 hover:text-surface-900 transition-colors">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="text-xs text-surface-400 hover:text-surface-700 ml-4">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-surface-900">Dispute Pekerjaan</h1>
          <p className="text-surface-500 text-sm">
            Pantau status laporan masalah untuk pekerjaan yang sedang berjalan.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Icon name="check" className="mx-auto mb-4 text-emerald-500" size={40} />
            <h3 className="text-lg font-bold text-surface-900 mb-2">Semua Aman</h3>
            <p className="text-sm text-surface-500">
              Anda tidak memiliki dispute aktif saat ini.
            </p>
            <Link href="/client/dashboard" className="btn-secondary mt-6 px-6 py-2 inline-block">
              Kembali ke Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div key={dispute.id} className="glass rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        dispute.status === "resolved" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {dispute.status === "open" ? "Menunggu Admin" : dispute.status === "investigating" ? "Sedang Diinvestigasi" : "Selesai"}
                      </span>
                      {dispute.is_initiator && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-600">
                          Anda Pelapor
                        </span>
                      )}
                    </div>
                    <Link href={`/jobs/${dispute.job_id}`} className="text-lg font-bold text-primary-600 hover:underline">
                      {dispute.job_title}
                    </Link>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-surface-500 mb-1">Nilai Escrow</div>
                    <div className="text-sm font-bold text-surface-900">{formatIDR(dispute.escrow_amount)}</div>
                  </div>
                </div>

                <div className="bg-surface-50 rounded-lg p-4 mb-4">
                  <div className="text-xs font-semibold text-surface-700 mb-1">
                    Alasan: {dispute.reason.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
                    {dispute.description}
                  </p>
                </div>

                {dispute.resolution && (
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 mb-2">
                      <Icon name="check" size={14} /> Keputusan Admin
                    </div>
                    <p className="text-sm text-surface-700 leading-relaxed">
                      {dispute.resolution}
                    </p>
                    {dispute.resolved_at && (
                      <div className="text-[10px] text-surface-400 mt-2">
                        Diselesaikan pada: {new Date(dispute.resolved_at).toLocaleDateString("id-ID")}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-surface-200 text-[10px] text-surface-400">
                  Dibuat pada: {new Date(dispute.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
