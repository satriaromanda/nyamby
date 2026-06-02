"use client";

import { useState } from "react";
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
        router.push("/client/dashboard?escrow_success=1");
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
          Bayar & Mulai Project
        </>
      )}
    </button>
  );
}
