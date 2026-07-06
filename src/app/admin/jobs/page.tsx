"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";

interface AdminJob {
  id: string;
  title: string;
  category: string;
  status: string;
  client_name: string;
  client_email: string;
  assigned_talent: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  escrow: { amount: number; status: string } | null;
  total_matches: number;
  total_disputes: number;
  submitted_at: string | null;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-blue-50 text-blue-600",
  matched: "bg-indigo-50 text-indigo-600",
  in_progress: "bg-amber-50 text-amber-600",
  submitted_for_review: "bg-purple-50 text-purple-600",
  revision_requested: "bg-orange-50 text-orange-600",
  disputed: "bg-red-50 text-red-600",
  completed: "bg-emerald-50 text-emerald-600",
  cancelled: "bg-surface-100 text-surface-500",
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data.jobs);
        setTotalPages(data.data.pagination.total_pages);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatIDR = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">Job Management</h1>
        <p className="text-surface-500 text-sm mt-1">Pantau dan moderasi seluruh job posting di platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none w-full sm:w-56"
        >
          <option value="">Semua Status</option>
          <option value="active">Active</option>
          <option value="matched">Matched</option>
          <option value="in_progress">In Progress</option>
          <option value="submitted_for_review">Submitted for Review</option>
          <option value="revision_requested">Revision Requested</option>
          <option value="disputed">Disputed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="bg-white border border-surface-200 rounded-lg px-4 py-2 text-sm focus:border-primary-500 outline-none w-full sm:w-56"
        >
          <option value="">Semua Kategori</option>
          <option value="web_dev">Web Development</option>
          <option value="graphic_designer">Graphic Design</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Job / Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Talent</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Budget / Escrow</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Matches / Disputes</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">
                    <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-400">Tidak ada job ditemukan.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-surface-900 hover:text-primary-600 transition-colors block truncate max-w-[220px]"
                        title={job.title}
                      >
                        {job.title}
                      </Link>
                      <div className="text-xs text-surface-500 truncate max-w-[220px]">
                        {job.client_name} • {job.client_email}
                      </div>
                      <div className="text-[10px] text-surface-400 mt-0.5">
                        {job.category === "web_dev" ? "Web Dev" : "Graphic Design"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyles[job.status] || "bg-surface-100 text-surface-600"}`}>
                        {job.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {job.assigned_talent ? (
                        <div className="text-sm font-medium text-surface-900">{job.assigned_talent}</div>
                      ) : (
                        <span className="text-xs text-surface-400">Belum ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-surface-600">
                        {job.budget_min || job.budget_max
                          ? `${job.budget_min ? formatIDR(Number(job.budget_min)) : "?"} – ${job.budget_max ? formatIDR(Number(job.budget_max)) : "?"}`
                          : "Nego"}
                      </div>
                      {job.escrow && (
                        <div className="text-[10px] mt-1 flex items-center gap-1">
                          <Icon
                            name={job.escrow.status === "released" ? "check" : "money"}
                            size={10}
                            className={job.escrow.status === "released" ? "text-emerald-500" : "text-amber-500"}
                          />
                          Escrow {formatIDR(Number(job.escrow.amount))} ({job.escrow.status})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-surface-600">
                          <Icon name="ai" size={12} className="text-primary-500" />
                          {job.total_matches}
                        </span>
                        <span className={`flex items-center gap-1 ${job.total_disputes > 0 ? "text-red-600 font-semibold" : "text-surface-400"}`}>
                          <Icon name="shield" size={12} />
                          {job.total_disputes}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-surface-500 text-right whitespace-nowrap">
                      {new Date(job.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-200 flex items-center justify-between bg-white">
          <span className="text-xs text-surface-500">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-surface-100 hover:bg-surface-200 text-surface-600 text-xs rounded transition-colors disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-surface-100 hover:bg-surface-200 text-surface-600 text-xs rounded transition-colors disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
