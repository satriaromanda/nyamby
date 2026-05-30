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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setJobs(d.data.jobs);
      })
      .finally(() => setLoading(false));
  }, [category]);

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
          <div className="flex gap-4">
            <Link href="/login" className="text-sm text-surface-500 hover:text-surface-900">Masuk</Link>
            <Link href="/register" className="btn-primary text-xs px-4 py-2">Daftar</Link>
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
            {jobs.map((job) => (
              <div key={job.id} className="glass rounded-2xl p-6 card-hover">
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
                  <Link
                    href={`/login`}
                    className="btn-primary text-xs px-4 py-2 shrink-0"
                  >
                    Lamar →
                  </Link>
                </div>
              </div>
            ))}
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
