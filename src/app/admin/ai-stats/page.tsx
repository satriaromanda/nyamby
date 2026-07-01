"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";

interface FeedbackStats {
  period: string;
  total_matches_generated: number;
  total_accepted: number;
  total_rejected: number;
  acceptance_rate: number;
  top_rejection_reasons: { reason: string; count: number; percentage: number }[];
  acceptance_by_recommendation: {
    highly_recommended: { accepted: number; total: number; rate: number };
    recommended: { accepted: number; total: number; rate: number };
    not_recommended: { accepted: number; total: number; rate: number };
  };
  avg_match_score_accepted: number | null;
  avg_match_score_rejected: number | null;
}

export default function AdminAiStatsPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [category, setCategory] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (category) params.append("category", category);

      const res = await fetch(`/api/ai/feedback-stats?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [period, category]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">AI Feedback Stats</h1>
        <p className="text-surface-500 text-sm mt-1">Pantau akurasi AI Matching dan metrik penerimaan klien.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none"
        >
          <option value="7d">7 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="90d">90 Hari Terakhir</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none"
        >
          <option value="">Semua Kategori</option>
          <option value="web_dev">Web Developer</option>
          <option value="graphic_designer">Graphic Designer</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-6">
              <Icon name="ai" className="text-primary-600 mb-2" size={24} />
              <div className="text-sm text-surface-500 mb-1">Total AI Matches</div>
              <div className="text-3xl font-bold text-surface-900">{stats.total_matches_generated}</div>
            </div>
            <div className="glass rounded-xl p-6">
              <Icon name="check" className="text-emerald-500 mb-2" size={24} />
              <div className="text-sm text-surface-500 mb-1">Match Diterima</div>
              <div className="text-3xl font-bold text-emerald-600">{stats.total_accepted}</div>
            </div>
            <div className="glass rounded-xl p-6">
              <Icon name="x" className="text-red-500 mb-2" size={24} />
              <div className="text-sm text-surface-500 mb-1">Match Ditolak</div>
              <div className="text-3xl font-bold text-red-600">{stats.total_rejected}</div>
            </div>
            <div className="glass rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Icon name="target" size={64} />
              </div>
              <Icon name="spark" className="text-accent-600 mb-2" size={24} />
              <div className="text-sm text-surface-500 mb-1">Acceptance Rate</div>
              <div className="text-3xl font-bold text-accent-600">{stats.acceptance_rate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Acceptance by Recommendation */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-bold text-surface-900 mb-6">Penerimaan Berdasarkan AI Confidence</h2>
              <div className="space-y-6">
                {[
                  { key: 'highly_recommended', label: 'Highly Recommended', data: stats.acceptance_by_recommendation.highly_recommended, color: 'bg-emerald-500' },
                  { key: 'recommended', label: 'Recommended', data: stats.acceptance_by_recommendation.recommended, color: 'bg-primary-500' },
                  { key: 'not_recommended', label: 'Not Recommended', data: stats.acceptance_by_recommendation.not_recommended, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.key}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-surface-900">{item.label}</span>
                      <span className="text-surface-500">{item.data.accepted} / {item.data.total} ({item.data.rate}%)</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.data.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Scores & Rejection Reasons */}
            <div className="space-y-8">
              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-bold text-surface-900 mb-4">Rata-rata Match Score</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="text-sm text-emerald-800 mb-1">Match Diterima</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {stats.avg_match_score_accepted ? Math.round(stats.avg_match_score_accepted) : 0}%
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <div className="text-sm text-red-800 mb-1">Match Ditolak</div>
                    <div className="text-2xl font-bold text-red-600">
                      {stats.avg_match_score_rejected ? Math.round(stats.avg_match_score_rejected) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h2 className="text-lg font-bold text-surface-900 mb-4">Top Alasan Penolakan</h2>
                {stats.top_rejection_reasons.length > 0 ? (
                  <div className="space-y-4">
                    {stats.top_rejection_reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="text-sm font-medium text-surface-900 w-1/3 truncate" title={reason.reason}>
                          {reason.reason}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-surface-100 rounded-full h-1.5">
                            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${reason.percentage}%` }} />
                          </div>
                        </div>
                        <div className="text-xs text-surface-500 w-16 text-right">
                          {reason.percentage}% ({reason.count})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-400">Belum ada data penolakan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-surface-500 py-12">Gagal memuat data statistik.</div>
      )}
    </div>
  );
}
