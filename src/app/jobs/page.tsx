"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";

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

const copy = {
  id: {
    h1a: "Jelajahi ",
    h1b: "Pekerjaan",
    subtitle: "Temukan project yang sesuai dengan keahlianmu.",
    searchPlaceholder: "Cari posisi atau skill...",
    filters: {
      all: "Semua",
      webDev: "Pengembang Web",
      design: "Desain & Kreatif",
    },
    budgetLabel: "Anggaran",
    minLabel: "Min",
    maxLabel: "Max",
    sortNewest: "Terbaru",
    sortBudgetDesc: "Anggaran Tertinggi",
    sortBudgetAsc: "Anggaran Terendah",
    sortDeadline: "Tenggat Terdekat",
    resultsText: (count: number) => `${count} Hasil Pekerjaan`,
    checkMatch: "Cek Kecocokan",
    matchText: (score: number) => `${score}% Kecocokan`,
    webDevLabel: "Pengembangan Web",
    designLabel: "Desain Grafis",
    flexBudget: "Anggaran fleksibel",
    applied: "Dilamar",
    accepted: "Diterima",
    detail: "Detail",
    emptyTitle: "Belum ada job aktif",
    emptyDesc: "Coba ubah kriteria pencarianmu.",
    pageInfo: (page: number, total: number) => `Halaman ${page} dari ${total}`,
  },
  en: {
    h1a: "Explore ",
    h1b: "Jobs",
    subtitle: "Find projects that match your skills.",
    searchPlaceholder: "Search for role or skill...",
    filters: {
      all: "All",
      webDev: "Web Dev",
      design: "Design & Creative",
    },
    budgetLabel: "Budget",
    minLabel: "Min",
    maxLabel: "Max",
    sortNewest: "Newest",
    sortBudgetDesc: "Highest Budget",
    sortBudgetAsc: "Lowest Budget",
    sortDeadline: "Closest Deadline",
    resultsText: (count: number) => `${count} Job Results`,
    checkMatch: "Check Match",
    matchText: (score: number) => `${score}% Match`,
    webDevLabel: "Web Development",
    designLabel: "Graphic Design",
    flexBudget: "Flexible budget",
    applied: "Applied",
    accepted: "Accepted",
    detail: "Detail",
    emptyTitle: "No active jobs yet",
    emptyDesc: "Try changing your search criteria.",
    pageInfo: (page: number, total: number) => `Page ${page} of ${total}`,
  },
} as const;


export default function JobsPage() {
  const [lang] = useLang();
  const t = copy[lang];

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
              {t.h1a} <span className="text-gradient-brand">{t.h1b}</span>
            </h1>
            <p className="text-surface-500 mt-1 text-sm">{t.subtitle}</p>
          </div>
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-surface-400">
              <Icon name="search" size={16} />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-surface-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-8">
          
          <div className="flex overflow-x-auto pb-2 lg:pb-0 hide-scrollbar gap-2 w-full lg:w-auto">
            {[
              { value: "", label: t.filters.all },
              { value: "web_dev", label: t.filters.webDev },
              { value: "graphic_designer", label: t.filters.design },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setCategory(f.value)}
                className={`text-sm px-4 py-2 rounded-full whitespace-nowrap border transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  category === f.value
                    ? "bg-surface-900 border-surface-900 text-white font-semibold"
                    : "bg-white border-surface-200 text-surface-600 hover:border-surface-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-full pl-4 pr-2 py-1 w-full lg:w-auto">
            <span className="text-xs text-surface-500 shrink-0">{t.budgetLabel}</span>
            <input type="number" placeholder={t.minLabel} className="text-sm py-1.5 px-2.5 flex-1 min-w-[60px] max-w-[100px] bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={minBudget} onChange={e => setMinBudget(e.target.value)} />
            <span className="text-surface-300 shrink-0">–</span>
            <input type="number" placeholder={t.maxLabel} className="text-sm py-1.5 px-2.5 flex-1 min-w-[60px] max-w-[100px] bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} />
          </div>

          <select
            className="w-full lg:w-auto lg:ml-auto text-sm py-2 pl-4 pr-10 bg-white border border-surface-200 rounded-full text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 0.75rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`,
            }}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="newest">{t.sortNewest}</option>
            <option value="budget_desc">{t.sortBudgetDesc}</option>
            <option value="budget_asc">{t.sortBudgetAsc}</option>
            <option value="deadline_soon">{t.sortDeadline}</option>
          </select>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm font-semibold text-surface-900 mb-4">{t.resultsText(jobs.length)}</p>
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
                  <div className="card card-hover p-5 sm:p-6 cursor-pointer h-full flex flex-col">
                    {/* Header: Category Badge + Status + Match Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                          <Icon name={job.category === "web_dev" ? "code" : "image"} size={14} />
                          {job.category === "web_dev" ? t.webDevLabel : t.designLabel}
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          {lang === "id" ? "Aktif" : "Active"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {existingMatch ? (
                          <span className="badge-match whitespace-nowrap">
                            <Icon name="ai" size={12} />
                            {t.matchText(Math.round(existingMatch.match_score))}
                          </span>
                        ) : user?.role === "talent" ? (
                          <button
                            onClick={(e) => handleQuickAnalyze(e, job.id)}
                            disabled={analyzingId === job.id}
                            className="badge-match hover:bg-ai-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {analyzingId === job.id ? (
                              <div className="animate-spin w-3 h-3 border-2 border-ai-600 border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <Icon name="ai" size={12} /> {t.checkMatch}
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-surface-900 mb-2 line-clamp-2">{job.title}</h3>
                    
                    {/* Meta: Client & Deadline */}
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-surface-500 mb-4">
                      <span>{lang === "id" ? "diposting oleh" : "posted by"} <strong className="text-surface-700">{job.client_name}</strong></span>
                      {job.deadline && (
                        <>
                          <span>–</span>
                          <span>{new Date(job.deadline).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </>
                      )}
                    </div>

                    <p className="text-sm text-surface-600 mb-5 line-clamp-2 leading-relaxed">{job.description}</p>

                    {/* Skill chips */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {job.required_skills.map((s, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${s.is_mandatory ? "bg-ai-50 text-ai-700 border border-ai-200" : "bg-surface-100 text-surface-600 border border-surface-200"}`}>
                          {s.name}
                        </span>
                      ))}
                    </div>

                    {/* Footer: budget + status */}
                    <div className="mt-auto pt-4 border-t border-surface-100 flex items-center justify-between gap-3">
                      <span className="text-base font-extrabold text-surface-900 shrink-0">
                        {job.budget_max
                          ? `Rp ${Number(job.budget_min || 0).toLocaleString(lang === "id" ? "id-ID" : "en-US")} – ${Number(job.budget_max).toLocaleString(lang === "id" ? "id-ID" : "en-US")}`
                          : t.flexBudget}
                      </span>
                      {existingMatch?.status === "applied" ? (
                        <span className="chip !bg-amber-50 !text-amber-700 shrink-0">{t.applied}</span>
                      ) : existingMatch?.status === "accepted" ? (
                        <span className="chip !bg-emerald-50 !text-emerald-700 shrink-0">{t.accepted}</span>
                      ) : (
                        <span className="text-sm font-semibold text-primary-600 inline-flex items-center gap-1.5 shrink-0 hover:text-primary-700 transition-colors">
                          {t.detail} <Icon name="arrowRight" size={14} />
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
            <h3 className="text-xl font-bold mb-2 text-surface-900" >{t.emptyTitle}</h3>
            <p className="text-surface-400 text-sm">{t.emptyDesc}</p>
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
              {t.pageInfo(page, totalPages)}
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
