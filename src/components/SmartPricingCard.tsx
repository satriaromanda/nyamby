"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";

interface SmartPricingData {
  benchmark: {
    per_hour: { min: number; median: number; max: number; currency: string };
    per_project: { min: number; median: number; max: number; currency: string };
  };
  sample_size: number;
  recommendation: string;
  market_insight: string;
}

// Live rate benchmark from /api/ai/smart-pricing (PRD v3.0 §6.2) — aggregated
// from real talent rates on the platform, replaces static guidance numbers.
export function SmartPricingCard({
  category,
  skills,
  level,
}: {
  category: string;
  skills: string[];
  level?: string;
}) {
  const [data, setData] = useState<SmartPricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const skillsKey = skills.join(",");

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const params = new URLSearchParams({ category });
        if (skillsKey) params.set("skills", skillsKey);
        if (level) params.set("level", level);
        const res = await fetch(`/api/ai/smart-pricing?${params.toString()}`);
        const d = await res.json();
        if (!cancelled) {
          if (d.success) setData(d.data);
          else setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, skillsKey, level]);

  if (!category || failed) return null;

  const formatIDR = (amount: number) =>
    amount >= 1_000_000
      ? `Rp ${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`
      : `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

  return (
    <div className="bg-[#FAEEDA] p-4 rounded-xl border border-[#F5D8A9] flex items-start gap-3">
      <Icon name="info" className="text-[#854F0B] mt-0.5 shrink-0" size={18} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-[#854F0B] flex items-center gap-2">
          💡 Smart Pricing Guidance
        </div>

        {loading && !data ? (
          <div className="mt-2 space-y-2">
            <div className="h-3 bg-[#854F0B]/10 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-[#854F0B]/10 animate-pulse rounded w-1/2" />
          </div>
        ) : data ? (
          <>
            <p className="text-xs text-[#854F0B]/80 mt-1 leading-relaxed">{data.recommendation}</p>

            {data.sample_size > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#854F0B]">
                <span>⏱️ {formatIDR(data.benchmark.per_hour.min)} – {formatIDR(data.benchmark.per_hour.max)}/jam</span>
                {data.benchmark.per_project.median > 0 && (
                  <span>📦 median {formatIDR(data.benchmark.per_project.median)}/project</span>
                )}
              </div>
            )}

            {data.market_insight && (
              <p className="text-[11px] text-[#854F0B]/70 mt-2 italic">{data.market_insight}</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
