"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export default function EscrowPaymentClient({
  jobId,
  talentUserId,
  amount,
}: {
  jobId: string;
  talentUserId: string;
  amount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayEscrow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/escrow/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          talent_user_id: talentUserId,
          amount,
        }),
      });

      if (res.ok) {
        // Stay on this page — server component re-renders and shows the
        // payment instructions (VA number) + status checking (PRD v5.3 §6.13)
        router.refresh();
      } else {
        alert("Gagal memproses escrow. Silakan coba lagi.");
        setLoading(false);
      }
    } catch {
      alert("Terjadi kesalahan.");
      setLoading(false);
    }
  };

  return (
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
          Bayar &amp; Mulai Project
        </>
      )}
    </button>
  );
}

// ── Payment Instructions + Active Status Check (PRD v5.3 §6.13) ─────────────

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 12;

export function PaymentInstructions({
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
