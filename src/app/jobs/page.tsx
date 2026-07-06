"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon, Logo } from "@/components/icons";
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
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200" role="navigation" aria-label="Main navigation">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 md:h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo height={28} />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            {user ? (
              <>
                <Link
                  href={user.role === "talent" ? "/talent/dashboard" : "/client/dashboard"}
                  className="text-surface-500 hover:text-surface-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/talents" className="text-surface-500 hover:text-surface-900 transition-colors">
                  Talenta
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white">
                    {user.full_name[0]}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-surface-700 hidden md:block">{user.full_name}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/talents" className="text-surface-500 hover:text-surface-900">Talenta</Link>
                <Link href="/login" className="text-surface-500 hover:text-surface-900">Masuk</Link>
                <Link href="/register" className="btn-primary text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">Daftar</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main role="main" className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 text-surface-900 flex items-center gap-3" >
          <Icon name="briefcase" className="text-primary-600" size={28} />
          Job Aktif
        </h1>
        <p className="text-surface-500 mb-8">Temukan project yang sesuai dengan keahlianmu.</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              <Icon name="search" size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari posisi atau skill..."
              className="input-dark pl-10 w-full"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { value: "", label: "Semua", icon: null },
              { value: "web_dev", label: "Web Dev", icon: "code" as const },
              { value: "graphic_designer", label: "Design", icon: "design" as const },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setCategory(f.value)}
                className={`text-sm px-4 py-2 rounded-xl whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  category === f.value
                    ? "gradient-primary text-white"
                    : "bg-white border border-surface-200 text-surface-500 hover:border-primary-200"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {f.icon && <Icon name={f.icon} size={14} />}
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8 p-4 bg-white rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-surface-500">Budget:</span>
            <input type="number" placeholder="Min" className="input-dark text-sm py-1.5 px-3 w-24" value={minBudget} onChange={e => setMinBudget(e.target.value)} />
            <span className="text-surface-300">-</span>
            <input type="number" placeholder="Max" className="input-dark text-sm py-1.5 px-3 w-24" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm text-surface-500">Urutkan:</span>
            <select className="input-dark text-sm py-1.5 px-3" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Terbaru</option>
              <option value="budget_desc">Budget Tertinggi</option>
              <option value="budget_asc">Budget Terendah</option>
              <option value="deadline_soon">Deadline Terdekat</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 rounded-xl" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => {
              const existingMatch = getMatch(job.id);
              return (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                  <div className="glass rounded-xl p-6 card-hover cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1 text-surface-900">{job.title}</h3>
                        <p className="text-sm text-surface-500 mb-3">
                          oleh {job.client_name} - {job.category === "web_dev" ? "Web Development" : "Graphic Design"}
                        </p>
                        <p className="text-sm text-surface-400 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.required_skills.map((s, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                s.is_mandatory ? "bg-primary-50 text-primary-600" : "bg-surface-100 text-surface-500"
                              }`}
                            >
                              {s.name} {s.is_mandatory && <Icon name="spark" className="inline ml-1" size={10} />}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-surface-400">
                          {job.budget_max && (
                            <span className="inline-flex items-center gap-1">
                              <Icon name="money" size={13} />
                              Rp {Number(job.budget_min || 0).toLocaleString("id-ID")} - {Number(job.budget_max).toLocaleString("id-ID")}
                            </span>
                          )}
                          {job.deadline && (
                            <span className="inline-flex items-center gap-1">
                              <Icon name="calendar" size={13} />
                              Deadline: {new Date(job.deadline).toLocaleDateString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-center gap-2">
                        {existingMatch ? (
                          <>
                            <div
                              className={`text-2xl font-bold ${
                                existingMatch.match_score >= 80 ? "text-accent-600" : "text-primary-600"
                              }`}
                              
                            >
                              {Math.round(existingMatch.match_score)}%
                            </div>
                            <span className="text-[10px] text-surface-400">AI Match</span>
                            {existingMatch.status === "applied" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full status-applied">Dilamar</span>
                            )}
                            {existingMatch.status === "accepted" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-accent-600">Diterima</span>
                            )}
                          </>
                        ) : user?.role === "talent" ? (
                          <button
                            onClick={(e) => handleQuickAnalyze(e, job.id)}
                            disabled={analyzingId === job.id}
                            className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                          >
                            {analyzingId === job.id ? (
                              <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Icon name="ai" size={12} /> Cek Kecocokan
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="btn-primary text-xs px-4 py-2">
                            <span className="inline-flex items-center gap-1">
                              Lamar
                              <Icon name="arrowRight" size={13} />
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-xl p-16 text-center">
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
