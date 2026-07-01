"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  talentProfileId: string;
  onSuccess: () => void;
}

export function RatingModal({ isOpen, onClose, jobId, talentProfileId, onSuccess }: RatingModalProps) {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (score < 1 || score > 5) {
      setError("Silakan berikan rating bintang");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          talent_profile_id: talentProfileId,
          score,
          comment,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
        <h3 className="text-xl font-bold text-surface-900 mb-2">Nilai Kinerja Talenta</h3>
        <p className="text-sm text-surface-500 mb-6">
          Berikan ulasan untuk membantu talenta ini membangun reputasinya.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverScore(s)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => setScore(s)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Icon
                  name="star"
                  size={32}
                  className={
                    s <= (hoverScore || score) ? "text-amber-400" : "text-surface-200"
                  }
                  fill={s <= (hoverScore || score) ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-surface-600">
            {score === 1 ? "Sangat Buruk" : score === 2 ? "Buruk" : score === 3 ? "Biasa Saja" : score === 4 ? "Bagus" : score === 5 ? "Sangat Bagus" : "Pilih Bintang"}
          </span>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Ulasan Tambahan (Opsional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-all"
            rows={4}
            placeholder="Tuliskan pengalaman Anda bekerja dengan talenta ini..."
            maxLength={500}
          />
          <div className="text-right text-xs text-surface-400 mt-1">
            {comment.length}/500
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
            disabled={submitting}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || score === 0}
            className="btn-primary text-sm px-6 py-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Mengirim...
              </>
            ) : (
              "Kirim Penilaian"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
