"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

type PaymentInfo = {
  payment_code: string | null;
  payment_code_type: string | null;
  redirect_url: string | null;
  total_amount: number;
  platform_fee: number;
  amount: number;
};

export function PaymentInstructions({ payment }: { payment: PaymentInfo }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCopy = async () => {
    if (!payment.payment_code) return;
    await navigator.clipboard.writeText(payment.payment_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckStatus = () => {
    setChecking(true);
    router.refresh();
    setTimeout(() => setChecking(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Icon name="info" size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          Dana <strong>belum ditahan</strong>. Selesaikan pembayaran di bawah ini.
          Escrow aktif dan talenta bisa mulai bekerja setelah pembayaran terkonfirmasi.
        </p>
      </div>

      <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-surface-200">
          <span className="text-surface-500 text-sm">Nilai Project</span>
          <span className="font-semibold text-surface-900 text-sm">
            Rp {Number(payment.amount).toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-surface-200">
          <span className="text-surface-500 text-sm">Biaya Platform (10%)</span>
          <span className="font-semibold text-surface-900 text-sm">
            Rp {Number(payment.platform_fee).toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-surface-500 font-medium">Total Pembayaran</span>
          <span className="text-2xl font-bold text-trust-600">
            Rp {Number(payment.total_amount).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {payment.payment_code && (
        <div className="p-5 rounded-xl bg-white border-2 border-trust-200">
          <div className="text-xs text-surface-500 mb-1">
            {payment.payment_code_type === "VIRTUAL_ACCOUNT" || !payment.payment_code_type
              ? "Nomor Virtual Account BCA"
              : `Kode Pembayaran (${payment.payment_code_type})`}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl font-bold tracking-wider text-surface-900 font-mono">
              {payment.payment_code}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-trust-50 text-trust-600 hover:bg-trust-100 transition-all shrink-0"
            >
              {copied ? "Tersalin ✓" : "Salin"}
            </button>
          </div>
        </div>
      )}

      {payment.redirect_url && (
        <a
          href={payment.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-trust-500 hover:bg-trust-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Icon name="external" size={18} />
          Buka Halaman Pembayaran
        </a>
      )}

      <button
        onClick={handleCheckStatus}
        disabled={checking}
        className="w-full bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {checking ? (
          <div className="animate-spin w-4 h-4 border-2 border-surface-400 border-t-transparent rounded-full" />
        ) : (
          <Icon name="check" size={16} />
        )}
        Saya Sudah Bayar — Cek Status
      </button>

      <p className="text-xs text-center text-surface-400">
        Status akan diperbarui otomatis setelah pembayaran dikonfirmasi oleh penyedia pembayaran.
      </p>
    </div>
  );
}

export default function EscrowPaymentClient({
  jobId,
  amount,
}: {
  jobId: string;
  amount: number;
}) {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePayEscrow = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/escrow/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      });
      const json = await res.json();

      if (res.ok && json.data?.payment) {
        setPayment({
          payment_code: json.data.payment.payment_code ?? null,
          payment_code_type: json.data.payment.payment_code_type ?? null,
          redirect_url: json.data.payment.redirect_url ?? null,
          total_amount: Number(json.data.total_amount),
          platform_fee: Number(json.data.platform_fee),
          amount: Number(json.data.amount),
        });
      } else {
        setError(json.message || "Gagal memproses escrow. Silakan coba lagi.");
        setLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  if (payment) {
    return <PaymentInstructions payment={payment} />;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center text-sm text-surface-500 px-1">
        <span>Biaya platform 10%</span>
        <span>
          Total: Rp {(amount + Math.round(amount * 0.1 * 100) / 100).toLocaleString("id-ID")}
        </span>
      </div>
      <button
        onClick={handlePayEscrow}
        disabled={loading}
        className="w-full bg-trust-500 hover:bg-trust-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            <Icon name="shield" size={18} />
            Lanjut ke Pembayaran
          </>
        )}
      </button>
    </div>
  );
}
