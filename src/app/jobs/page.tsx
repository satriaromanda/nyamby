"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
  const [category, setCategory] = useState("");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [myMatches, setMyMatches] = useState<MyMatch[]>([]);

  // Fetch session
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  // Fetch talent's existing matches to show inline scores
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

    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setJobs(d.data.jobs);
      })
      .finally(() => setLoading(false));
  }, [category]);

  const getMatch = (jobId: string) => myMatches.find((m) => m.job_id === jobId);

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-sm text-white" style={{ fontFamily: "Outfit" }}>
              N
            </div>
            <span className="font-bold text-surface-900" style={{ fontFamily: "Outfit" }}>Nyamby</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href={user.role === "talent" ? "/talent/dashboard" : "/client/dashboard"}
                  className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white">
                    {user.full_name[0]}
                  </div>
                  <span className="text-sm font-medium text-surface-700 hidden md:block">{user.full_name}</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-surface-500 hover:text-surface-900">Masuk</Link>
                <Link href="/register" className="btn-primary text-xs px-4 py-2">Daftar</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
          Job Aktif 💼
        </h1>
        <p className="text-surface-500 mb-8">Temukan project yang sesuai dengan keahlianmu.</p>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {[
            { value: "", label: "Semua" },
            { value: "web_dev", label: "💻 Web Dev" },
            { value: "graphic_designer", label: "🎨 Design" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={`text-sm px-4 py-2 rounded-xl transition-all ${
                category === f.value
                  ? "gradient-primary text-white"
                  : "bg-white border border-surface-200 text-surface-500 hover:border-primary-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => {
              const existingMatch = getMatch(job.id);
              return (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                  <div className="glass rounded-2xl p-6 card-hover cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1 text-surface-900">{job.title}</h3>
                        <p className="text-sm text-surface-500 mb-3">
                          oleh {job.client_name} · {job.category === "web_dev" ? "Web Development" : "Graphic Design"}
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
                              {s.name} {s.is_mandatory && "★"}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs text-surface-400">
                          {job.budget_max && (
                            <span>💰 Rp {Number(job.budget_min || 0).toLocaleString("id-ID")} – {Number(job.budget_max).toLocaleString("id-ID")}</span>
                          )}
                          {job.deadline && (
                            <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString("id-ID")}</span>
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
                              style={{ fontFamily: "Outfit" }}
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
                        ) : (
                          <span className="btn-primary text-xs px-4 py-2">
                            {user?.role === "talent" ? "Lihat Detail →" : "Lamar →"}
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
          <div className="glass rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2 text-surface-900" style={{ fontFamily: "Outfit" }}>Belum ada job aktif</h3>
            <p className="text-surface-400 text-sm">Job baru akan muncul saat client posting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
