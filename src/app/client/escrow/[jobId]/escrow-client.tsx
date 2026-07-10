"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function PaymentInstructions({ payment, jobId }: { payment: PaymentInfo, jobId: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "idle" | "polling" | "verifying" | "success" | "still_pending" | "failed" | "error"
  >("idle");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [hasOpenedPayment, setHasOpenedPayment] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const MAX_AUTO_POLLS = 24; // 2 menit auto-poll (24 x 5 detik)

  // ── Server-side reconcile (crosscheck ke Xenith API) ──────────────────
  const reconcile = useCallback(
    async (source: "auto" | "manual"): Promise<boolean> => {
      if (source === "manual") setVerificationState("verifying");
      try {
        const res = await fetch(`/api/escrow/${jobId}/reconcile`, { method: "POST" });
        const json = await res.json().catch(() => null);

        if (res.ok && json?.data) {
          if (json.data.status === "SUCCESS") {
            setVerificationState("success");
            setLastMessage("Pembayaran berhasil dikonfirmasi! Mengalihkan ke dashboard...");
            setTimeout(() => router.refresh(), 2000);
            return true;
          }
          if (json.data.status === "FAILED") {
            setVerificationState("failed");
            setLastMessage("Pembayaran gagal atau ditolak. Silakan coba ulang pembayaran.");
            return true;
          }
          if (json.data.status === "EXPIRED") {
            setVerificationState("failed");
            setLastMessage("Pembayaran sudah kedaluwarsa. Silakan buat pembayaran baru.");
            return true;
          }
          // Still PENDING
          if (source === "manual") {
            setVerificationState("still_pending");
            setLastMessage("Pembayaran belum terdeteksi oleh sistem. Pastikan Anda sudah menyelesaikan pembayaran, lalu tunggu beberapa saat dan coba lagi.");
          }
        } else {
          if (source === "manual") {
            setVerificationState("error");
            setLastMessage(json?.message || "Gagal mengecek status pembayaran. Coba lagi.");
          }
        }
      } catch {
        if (source === "manual") {
          setVerificationState("error");
          setLastMessage("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        }
      }
      return false;
    },
    [jobId, router]
  );

  // ── Auto-polling setelah user membuka halaman pembayaran ──────────────
  useEffect(() => {
    if (!hasOpenedPayment) return;
    setVerificationState("polling");
    const timer = setInterval(async () => {
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_AUTO_POLLS) {
        clearInterval(timer);
        setVerificationState("idle");
        setLastMessage("Auto-verifikasi selesai. Klik tombol di bawah untuk cek manual.");
        return;
      }
      const settled = await reconcile("auto");
      if (settled) clearInterval(timer);
    }, 5000);
    pollTimerRef.current = timer;
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [hasOpenedPayment, reconcile]);

  const handleCopy = async () => {
    if (!payment.payment_code) return;
    await navigator.clipboard.writeText(payment.payment_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPayment = () => {
    setHasOpenedPayment(true);
    setLastMessage(null);
  };

  const handleManualCheck = () => {
    reconcile("manual");
  };

  const isPaymentLink = payment.payment_code_type === "PAYMENT_LINK";
  const payUrl = isPaymentLink 
    ? payment.payment_code 
    : (payment.redirect_url && !payment.redirect_url.includes("/client/escrow") ? payment.redirect_url : null);
  const showCodeBox = payment.payment_code && !isPaymentLink;

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {verificationState === "success" ? (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
          <Icon name="check" size={18} className="text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Pembayaran Berhasil!</p>
            <p className="text-xs text-green-700 mt-1">Dana telah ditahan dengan aman. Mengalihkan...</p>
          </div>
        </div>
      ) : verificationState === "polling" ? (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Memverifikasi pembayaran...</p>
            <p className="text-xs text-blue-700 mt-1">Sistem sedang mengecek status ke penyedia pembayaran secara otomatis.</p>
          </div>
        </div>
      ) : verificationState === "failed" ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <Icon name="info" size={18} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">{lastMessage}</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Icon name="info" size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            Dana <strong>belum ditahan</strong>. Selesaikan pembayaran di bawah ini.
            Escrow aktif dan talenta bisa mulai bekerja setelah pembayaran terkonfirmasi.
          </p>
        </div>
      )}

      {/* Rincian Biaya */}
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
          <span className="text-2xl font-bold text-orange-600">
            Rp {Number(payment.total_amount).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Kode Pembayaran (VA / non-link) */}
      {showCodeBox && (
        <div className="p-5 rounded-xl bg-white border-2 border-orange-200">
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
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all shrink-0"
            >
              {copied ? "Tersalin ✓" : "Salin"}
            </button>
          </div>
        </div>
      )}

      {/* Tombol Bayar Sekarang */}
      {payUrl && verificationState !== "success" && (
        <a
          href={payUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenPayment}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Icon name="external" size={18} />
          {hasOpenedPayment ? "Bayar Ulang" : "Bayar Sekarang"}
        </a>
      )}

      {/* Tombol Verifikasi — hanya aktif setelah user buka halaman pembayaran */}
      <button
        onClick={handleManualCheck}
        disabled={!hasOpenedPayment || verificationState === "verifying" || verificationState === "success"}
        className={`w-full font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
          hasOpenedPayment && verificationState !== "success"
            ? "bg-orange-100 hover:bg-orange-200 text-orange-700"
            : "bg-surface-100 text-surface-400 cursor-not-allowed opacity-50"
        }`}
      >
        {verificationState === "verifying" ? (
          <div className="animate-spin w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full" />
        ) : (
          <Icon name="check" size={16} />
        )}
        {verificationState === "verifying"
          ? "Memverifikasi ke Xenith..."
          : verificationState === "still_pending"
          ? "Coba Verifikasi Lagi"
          : "Saya Sudah Bayar — Verifikasi Pembayaran"}
      </button>

      {/* Pesan status */}
      {lastMessage && verificationState !== "success" && verificationState !== "failed" && (
        <p className={`text-xs text-center font-medium ${
          verificationState === "error" ? "text-red-500" : "text-amber-600"
        }`}>
          {lastMessage}
        </p>
      )}

      <p className="text-[10px] text-center text-surface-400 leading-relaxed">
        Verifikasi dilakukan langsung ke server penyedia pembayaran (Xenith).
        Status tidak bisa dimanipulasi karena dikonfirmasi oleh pihak ketiga.
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
    return <PaymentInstructions payment={payment} jobId={jobId} />;
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
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
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

// ── Payment Instructions + Active Status Check (PRD v5.3 §6.13) ─────────────

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 12;

export function ActivePaymentInstructions({
  jobId,
  paymentCode,
  paymentCodeType,
  amount,
}: {
  jobId: string;
  paymentCode: string | null;
  paymentCodeType: string | null;
  amount: number;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const attemptsRef = useRef(0);

  const reconcile = useCallback(
    async (manual: boolean) => {
      if (manual) setChecking(true);
      try {
        // Actively ask our server to pull latest status from Xenith —
        // NOT just router.refresh() of stale DB data (root cause §6.13)
        const res = await fetch(`/api/escrow/${jobId}/reconcile`, {
          method: "POST",
        });
        const json = await res.json().catch(() => null);

        if (res.ok && json?.data) {
          if (json.data.status !== "PENDING") {
            // Status settled — re-render server component (redirects to dashboard on held)
            router.refresh();
            return true;
          }
          if (manual) setLastMessage("Pembayaran masih menunggu. Selesaikan pembayaran Anda lalu cek lagi.");
        } else if (manual) {
          setLastMessage(json?.message || "Gagal mengecek status. Coba lagi.");
        }
      } catch {
        if (manual) setLastMessage("Gagal terhubung ke server. Coba lagi.");
      } finally {
        if (manual) setChecking(false);
      }
      return false;
    },
    [jobId, router]
  );

  // Light auto-polling while pending: every 5s, max 12 attempts (§6.13 #4)
  useEffect(() => {
    const timer = setInterval(async () => {
      attemptsRef.current += 1;
      if (attemptsRef.current > POLL_MAX_ATTEMPTS) {
        clearInterval(timer);
        return;
      }
      const settled = await reconcile(false);
      if (settled) clearInterval(timer);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reconcile]);

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" />
          <span className="text-sm font-semibold text-amber-700">Menunggu Pembayaran</span>
        </div>
        {paymentCode ? (
          <>
            <p className="text-xs text-surface-500 mb-1">
              {paymentCodeType === "VIRTUAL_ACCOUNT" || !paymentCodeType
                ? "Nomor Virtual Account"
                : paymentCodeType}
            </p>
            <p className="text-2xl font-bold tracking-wider text-surface-900 mb-2">{paymentCode}</p>
          </>
        ) : (
          <p className="text-sm text-surface-600 mb-2">
            Selesaikan pembayaran sesuai instruksi yang diberikan.
          </p>
        )}
        <p className="text-sm text-surface-600">
          Total: <span className="font-bold">Rp {amount.toLocaleString("id-ID")}</span>
        </p>
      </div>

      <button
        onClick={() => reconcile(true)}
        disabled={checking}
        className="w-full bg-trust-500 hover:bg-trust-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {checking ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            <Icon name="check" size={18} />
            Saya Sudah Bayar — Cek Status
          </>
        )}
      </button>

      {lastMessage && (
        <p className="text-sm text-center text-surface-500">{lastMessage}</p>
      )}
    </div>
  );
}
