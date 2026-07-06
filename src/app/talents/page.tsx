"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SkeletonCardGrid } from "@/components/Skeleton";

const categories = [
  { value: "", label: "Semua Talenta" },
  { value: "web_dev", label: "Web Developer" },
  { value: "graphic_designer", label: "Graphic Designer" },
];

export default function TalentsPage() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("newest");
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [user, setUser] = useState<{ role: string; full_name: string } | null>(null);

  useEffect(() => {
    async function fetchTalents() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          category,
          q,
          minRate,
          maxRate,
          availability,
          sort,
          page: page.toString()
        });
        const res = await fetch(`/api/talents?${query.toString()}`);
        const data = await res.json();
        setTalents(data.talents || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch talents", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTalents();
  }, [category, q, minRate, maxRate, availability, sort, page]);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main role="main" className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Title row — big heading left, search right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-surface-900">
              Browse Talenta
            </h1>
            <p className="text-surface-500 mt-1 text-sm">
              Temukan web developer dan graphic designer yang sudah dipetakan skill, rate, dan availability-nya.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
              <Icon name="search" size={16} />
            </div>
            <input
              type="text"
              placeholder="Cari nama, skill, atau bio..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-surface-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((f) => (
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
            <span className="text-xs text-surface-500">Rate/Jam</span>
            <input type="number" placeholder="Min" className="text-sm py-1 px-2 w-20 bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400" value={minRate} onChange={e => setMinRate(e.target.value)} />
            <span className="text-surface-300">–</span>
            <input type="number" placeholder="Max" className="text-sm py-1 px-2 w-20 bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400" value={maxRate} onChange={e => setMaxRate(e.target.value)} />
          </div>

          <select
            className="text-sm py-2 px-4 bg-white border border-surface-200 rounded-full text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
            value={availability}
            onChange={e => setAvailability(e.target.value)}
          >
            <option value="">Status (Semua)</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>

          <select
            className="ml-auto text-sm py-2 px-4 bg-white border border-surface-200 rounded-full text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="rate_desc">Rate Tertinggi</option>
            <option value="rate_asc">Rate Terendah</option>
          </select>
        </div>

        {loading ? (
          <SkeletonCardGrid count={6} />
        ) : !talents || talents.length === 0 ? (
          <div className="card p-16 text-center">
            <Icon name="search" className="mx-auto mb-4 text-surface-300" size={44} />
            <h3 className="text-xl font-bold mb-2 text-surface-900">Belum ada talenta ditemukan</h3>
            <p className="text-surface-400 text-sm">Coba sesuaikan kriteria filtermu.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {talents.map((talent) => {
              const categoryLabel = talent.category === "web_dev" ? "Web Developer" : "Graphic Designer";

              return (
                <Link key={talent.id} href={`/talents/${talent.id}`} className="card card-hover p-6 block">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold overflow-hidden">
                        {talent.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={talent.avatar_url} alt={talent.full_name} className="w-full h-full object-cover" />
                        ) : (
                          talent.full_name?.[0] || "?"
                        )}
                      </div>
                      <div>
                        <h2 className="font-bold text-surface-900">{talent.full_name}</h2>
                        <p className="text-xs text-surface-500">{categoryLabel} - {talent.location || "Indonesia"}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full status-${talent.availability}`}>
                      {talent.availability}
                    </span>
                  </div>

                  <p className="text-sm text-surface-500 line-clamp-2 mb-4">
                    {talent.bio || "Talenta Nyamby siap menerima project digital."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {talent.skills?.slice(0, 5).map((skill: any, idx: number) => (
                      <span key={idx} className={`skill-badge skill-badge-${skill.level}`}>
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-surface-100">
                    <div className="p-2 rounded-xl bg-surface-50">
                      <div className="text-[10px] text-surface-400 mb-0.5">Rate</div>
                      <div className="text-xs font-bold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="money" size={12} className="text-money-500" />
                        Rp {Number(talent.rate_per_hour || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-50">
                      <div className="text-[10px] text-surface-400 mb-0.5">Match</div>
                      <div className="text-xs font-bold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="ai" size={12} className="text-ai-500" />
                        {"—"}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-50">
                      <div className="text-[10px] text-surface-400 mb-0.5">Portofolio</div>
                      <div className="text-xs font-bold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="shield" size={12} className="text-action-500" />
                        {talent.portfolio_url ? "Tersedia" : "Basic"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
