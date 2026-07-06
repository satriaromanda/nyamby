"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  client_name: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  status: string;
  required_skills: { name: string; is_mandatory: boolean }[];
}

interface SessionUser {
  id: string;
  role: string;
  full_name: string;
}

interface MyMatch {
  job_id: string;
  match_score: number;
  status: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sort, setSort] = useState("newest");
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [user, setUser] = useState<SessionUser | null>(null);
  const [myMatches, setMyMatches] = useState<MyMatch[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === "talent") {
      fetch("/api/talent/dashboard")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data?.recommended_jobs) {
            setMyMatches(
              d.data.recommended_jobs.map((j: { job_id: string; match_score: number; match_status: string }) => ({
                job_id: j.job_id,
                match_score: Number(j.match_score),
                status: j.match_status,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (minBudget) params.set("min_budget", minBudget);
    if (maxBudget) params.set("max_budget", maxBudget);
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());

    // Debounce fetch slightly to prevent spam if typing fast
    const timer = setTimeout(() => {
      fetch(`/api/jobs?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setJobs(d.data);
            setTotalPages(d.pagination?.total_pages || 1);
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [category, q, minBudget, maxBudget, sort, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, q, minBudget, maxBudget, sort]);

  const getMatch = (jobId: string) => myMatches.find((m) => m.job_id === jobId);

  const handleQuickAnalyze = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); // prevent navigating to job detail
    setAnalyzingId(jobId);
    try {
      const res = await fetch("/api/ai/match-talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, force_refresh: true }),
      });
      const d = await res.json();
      if (d.success) {
        setMyMatches((prev) => [
          ...prev.filter((m) => m.job_id !== jobId),
          { job_id: jobId, match_score: Number(d.data.match_score), status: d.data.status },
        ]);
      }
    } catch {
      // silently fail
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main role="main" className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Title row — big heading left, search right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-surface-900">
              Explore Jobs
            </h1>
            <p className="text-surface-500 mt-1 text-sm">Temukan project yang sesuai dengan keahlianmu.</p>
          </div>
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
              <Icon name="search" size={16} />
            </div>
            <input
              type="text"
              placeholder="Cari posisi atau skill..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-surface-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { value: "", label: "Semua" },
            { value: "web_dev", label: "Web Dev" },
            { value: "graphic_designer", label: "Design & Creative" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={`text-sm px-4 py-2 rounded-full whitespace-nowrap border transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                category === f.value
                  ? "bg-surface-900 border-surface-900 text-white font-semibold"
                  : "bg-white border-surface-200 text-surface-600 hover:border-surface-300"
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-full pl-4 pr-2 py-1">
            <span className="text-xs text-surface-500">Budget</span>
            <input type="number" placeholder="Min" className="text-sm py-1 px-2 w-20 bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400" value={minBudget} onChange={e => setMinBudget(e.target.value)} />
            <span className="text-surface-300">–</span>
            <input type="number" placeholder="Max" className="text-sm py-1 px-2 w-20 bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} />
          </div>

          <select
            className="ml-auto text-sm py-2 px-4 bg-white border border-surface-200 rounded-full text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="budget_desc">Budget Tertinggi</option>
            <option value="budget_asc">Budget Terendah</option>
            <option value="deadline_soon">Deadline Terdekat</option>
          </select>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm font-semibold text-surface-900 mb-4">{jobs.length} Jobs Results</p>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-56 rounded-2xl" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">
            {jobs.map((job) => {
              const existingMatch = getMatch(job.id);
              return (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block h-full">
                  <div className="card card-hover p-6 cursor-pointer h-full flex flex-col">
                    {/* Header: client + match badge */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-700">
                        {job.client_name}
                        <Icon name="check" size={12} className="text-primary-500" />
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {existingMatch ? (
                          <span className="badge-match">
                            <Icon name="ai" size={12} />
                            {Math.round(existingMatch.match_score)}% Match
                          </span>
                        ) : user?.role === "talent" ? (
                          <button
                            onClick={(e) => handleQuickAnalyze(e, job.id)}
                            disabled={analyzingId === job.id}
                            className="badge-match hover:bg-ai-100 transition-colors disabled:opacity-50"
                          >
                            {analyzingId === job.id ? (
                              <div className="animate-spin w-3 h-3 border-2 border-ai-600 border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <Icon name="ai" size={12} /> Cek Match
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Title + meta */}
                    <h3 className="text-lg font-bold text-surface-900 mb-1.5">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-400 mb-3">
                      <span>{job.category === "web_dev" ? "Web Development" : "Graphic Design"}</span>
                      {job.deadline && (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="calendar" size={12} />
                          {new Date(job.deadline).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-surface-500 mb-4 line-clamp-2">{job.description}</p>

                    {/* Skill chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.required_skills.map((s, i) => (
                        <span key={i} className={`chip ${s.is_mandatory ? "!bg-ai-50 !text-ai-600" : ""}`}>
                          {s.name}
                        </span>
                      ))}
                    </div>

                    {/* Footer: budget + status */}
                    <div className="mt-auto pt-4 border-t border-surface-100 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-surface-900">
                        {job.budget_max
                          ? `Rp ${Number(job.budget_min || 0).toLocaleString("id-ID")} – ${Number(job.budget_max).toLocaleString("id-ID")}`
                          : "Budget fleksibel"}
                      </span>
                      {existingMatch?.status === "applied" ? (
                        <span className="chip !bg-amber-50 !text-amber-700">Dilamar</span>
                      ) : existingMatch?.status === "accepted" ? (
                        <span className="chip !bg-emerald-50 !text-emerald-700">Diterima</span>
                      ) : (
                        <span className="text-xs font-semibold text-primary-600 inline-flex items-center gap-1">
                          Detail <Icon name="arrowRight" size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <Icon name="search" className="mx-auto mb-4 text-surface-300" size={44} />
            <h3 className="text-xl font-bold mb-2 text-surface-900" >Belum ada job aktif</h3>
            <p className="text-surface-400 text-sm">Coba ubah kriteria pencarianmu.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-surface-200 bg-white text-surface-600 disabled:opacity-50 hover:bg-surface-50"
            >
              <Icon name="arrowLeft" size={16} />
            </button>
            <span className="text-sm font-medium text-surface-600">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-surface-200 bg-white text-surface-600 disabled:opacity-50 hover:bg-surface-50"
            >
              <Icon name="arrowRight" size={16} />
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
