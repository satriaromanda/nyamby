"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

interface Stats {
  users: { total_talent: number; total_client: number; total_admin: number; new_this_week: number };
  jobs: { total_active: number; total_completed: number; total_jobs: number; completion_rate: number };
  financials: { total_gmv_idr: number; total_platform_fee_idr: number; escrow_held_idr: number };
  ai: { total_matches_generated: number; overall_acceptance_rate: number; avg_match_score: number };
  disputes: { total_open: number; total_resolved: number; dispute_rate: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  const formatIDR = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-surface-900">
          Admin Dashboard
        </h1>
        <p className="text-surface-500 text-sm mt-1">
          Overview platform Nyamby — data real-time.
        </p>
      </div>

      {/* User Stats */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4">
          Users
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Talent", value: stats.users.total_talent, icon: "user" as const, color: "text-blue-600 bg-blue-50" },
            { label: "Total Client", value: stats.users.total_client, icon: "briefcase" as const, color: "text-purple-600 bg-purple-50" },
            { label: "Total Admin", value: stats.users.total_admin, icon: "shield" as const, color: "text-amber-600 bg-amber-50" },
            { label: "Baru Minggu Ini", value: stats.users.new_this_week, icon: "spark" as const, color: "text-emerald-600 bg-emerald-50" },
          ].map((stat, i) => (
            <div key={i} className="card p-5 card-hover">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon name={stat.icon} size={20} />
              </div>
              <div className="text-2xl font-bold text-surface-900">
                {stat.value}
              </div>
              <div className="text-xs text-surface-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Job & Financial Stats */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4">
            Jobs
          </h2>
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Total Jobs</span>
              <span className="text-lg font-bold text-surface-900">{stats.jobs.total_jobs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Aktif</span>
              <span className="text-lg font-bold text-blue-600">{stats.jobs.total_active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Selesai</span>
              <span className="text-lg font-bold text-emerald-600">{stats.jobs.total_completed}</span>
            </div>
            <div className="h-px bg-surface-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Completion Rate</span>
              <span className="text-lg font-bold text-surface-900">{stats.jobs.completion_rate}%</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4">
            Financials
          </h2>
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Total GMV</span>
              <span className="text-lg font-bold text-surface-900">{formatIDR(stats.financials.total_gmv_idr)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Platform Fee</span>
              <span className="text-lg font-bold text-emerald-600">{formatIDR(stats.financials.total_platform_fee_idr)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Escrow Held</span>
              <span className="text-lg font-bold text-amber-600">{formatIDR(stats.financials.escrow_held_idr)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI & Disputes */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4">
            AI Matching
          </h2>
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Total Matches</span>
              <span className="text-lg font-bold text-surface-900">{stats.ai.total_matches_generated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Acceptance Rate</span>
              <span className="text-lg font-bold text-emerald-600">{stats.ai.overall_acceptance_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Avg Match Score</span>
              <span className="text-lg font-bold text-primary-600">{stats.ai.avg_match_score}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4">
            Disputes
          </h2>
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Open</span>
              <span className={`text-lg font-bold ${stats.disputes.total_open > 0 ? "text-red-600" : "text-surface-900"}`}>
                {stats.disputes.total_open}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Resolved</span>
              <span className="text-lg font-bold text-emerald-600">{stats.disputes.total_resolved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Dispute Rate</span>
              <span className="text-lg font-bold text-surface-900">{stats.disputes.dispute_rate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
