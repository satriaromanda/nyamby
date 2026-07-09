"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";

interface EarningTransaction {
  escrow_id: string;
  job_id: string;
  job_title: string;
  job_status: string;
  client_name: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  escrow_status: string;
  held_at: string | null;
  released_at: string | null;
  payout: {
    status: string;
    amount: number;
    destination_channel: string;
    created_at: string;
  } | null;
}

interface EarningsData {
  summary: {
    total_earned: number;
    total_pending: number;
    total_transactions: number;
  };
  transactions: EarningTransaction[];
}

export default function TalentEarningsPage() {
  const router = useRouter();
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch("/api/talent/earnings");
      const d = await res.json();
      if (!d.success && res.status === 401) {
        router.push("/login");
        return;
      }
      if (d.success) setData(d.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const formatIDR = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/talent/dashboard" className="flex items-center gap-2 shrink-0">
            <Logo height={32} />
          </Link>

          <div className="hidden sm:flex items-center gap-1 bg-surface-100/80 border border-surface-200/60 rounded-full p-1">
            <Link href="/talent/dashboard" className="pill-tab">Home</Link>
            <Link href="/jobs" className="pill-tab">Find Work</Link>
            <span className="pill-tab pill-tab-active cursor-default">Pendapatan</span>
            <Link href="/talent/activity" className="pill-tab">Aktivitas</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Link href="/talent/dashboard" className="text-surface-500 hover:text-surface-900 transition-colors sm:hidden">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="text-xs text-surface-400 hover:text-surface-700">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-surface-900">Pendapatan Saya</h1>
          <p className="text-surface-500 text-sm">
            Riwayat pembayaran dari job yang kamu kerjakan lewat escrow Nyamby.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
              <Icon name="check" className="text-emerald-500" size={14} />
              Total Diterima
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {formatIDR(data?.summary.total_earned || 0)}
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
              <Icon name="money" className="text-amber-500" size={14} />
              Dalam Escrow / Proses
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {formatIDR(data?.summary.total_pending || 0)}
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
              <Icon name="briefcase" className="text-primary-500" size={14} />
              Total Transaksi
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {data?.summary.total_transactions || 0}
            </div>
          </div>
        </div>

        {/* Transactions */}
        {!data || data.transactions.length === 0 ? (
          <div className="card p-12 text-center">
            <Icon name="money" className="mx-auto mb-4 text-surface-300" size={40} />
            <h3 className="text-lg font-bold text-surface-900 mb-2">Belum ada transaksi</h3>
            <p className="text-sm text-surface-500 mb-6">
              Pendapatanmu akan muncul di sini setelah client menahan dana di escrow untuk job yang kamu terima.
            </p>
            <Link href="/jobs" className="btn-primary text-sm">
              Cari Job Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.transactions.map((tx) => (
              <div key={tx.escrow_id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${tx.job_id}`}
                      className="font-semibold text-sm text-surface-900 hover:text-primary-600 transition-colors block truncate"
                    >
                      {tx.job_title}
                    </Link>
                    <div className="text-xs text-surface-500 mt-0.5">
                      Client: {tx.client_name}
                      {tx.held_at && (
                        <span className="ml-2 text-surface-400">
                          {new Date(tx.held_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-surface-900">{formatIDR(tx.net_amount)}</div>
                      <div className="text-[10px] text-surface-400">
                        Bruto {formatIDR(tx.gross_amount)} − fee {formatIDR(tx.platform_fee)}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                        tx.payout?.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-600"
                          : tx.payout?.status === "FAILED"
                          ? "bg-red-50 text-red-600"
                          : tx.escrow_status === "held"
                          ? "bg-amber-50 text-amber-600"
                          : tx.escrow_status === "refunded"
                          ? "bg-red-50 text-red-600"
                          : "bg-surface-100 text-surface-600"
                      }`}
                    >
                      {tx.payout?.status === "SUCCESS"
                        ? "Dibayarkan"
                        : tx.payout?.status === "PENDING"
                        ? "Payout Diproses"
                        : tx.payout?.status === "FAILED"
                        ? "Payout Gagal"
                        : tx.escrow_status === "held"
                        ? "Dana Ditahan"
                        : tx.escrow_status === "refunded"
                        ? "Direfund"
                        : tx.escrow_status}
                    </span>
                  </div>
                </div>

                {tx.payout && (
                  <div className="mt-3 pt-3 border-t border-surface-100 text-xs text-surface-500 flex items-center gap-2">
                    <Icon
                      name={tx.payout.status === "SUCCESS" ? "check" : "money"}
                      size={12}
                      className={tx.payout.status === "SUCCESS" ? "text-emerald-500" : "text-amber-500"}
                    />
                    Payout {formatIDR(tx.payout.amount)} via {tx.payout.destination_channel}
                    {tx.released_at && (
                      <span className="text-surface-400">
                        • {new Date(tx.released_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
