"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon, Logo } from "@/components/icons";
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
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200" role="navigation">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 md:h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm whitespace-nowrap">
            <Link href="/jobs" className="text-surface-500 hover:text-surface-900">Browse Jobs</Link>
            <Link href="/how-it-works" className="text-surface-500 hover:text-surface-900">Cara Kerja</Link>
            <Link href="/register?role=client" className="btn-primary text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">Post Job</Link>
          </div>
        </div>
      </nav>

      <main role="main" className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] mb-4">
              <span>AI-powered</span>
              <span>Public talent discovery</span>
            </div>
            <h1 className="text-3xl font-bold text-surface-900 mb-2" >
              Browse Talenta
            </h1>
            <p className="text-surface-500">
              Temukan web developer dan graphic designer yang sudah dipetakan skill, rate, dan availability-nya.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              <Icon name="search" size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari nama, skill, atau bio..."
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
            <span className="text-sm text-surface-500">Rate/Jam:</span>
            <input type="number" placeholder="Min" className="input-dark text-sm py-1.5 px-3 w-24" value={minRate} onChange={e => setMinRate(e.target.value)} />
            <span className="text-surface-300">-</span>
            <input type="number" placeholder="Max" className="input-dark text-sm py-1.5 px-3 w-24" value={maxRate} onChange={e => setMaxRate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <select className="input-dark text-sm py-1.5 px-3" value={availability} onChange={e => setAvailability(e.target.value)}>
              <option value="">Status (Semua)</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm text-surface-500">Urutkan:</span>
            <select className="input-dark text-sm py-1.5 px-3" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Terbaru</option>
              <option value="rate_desc">Rate Tertinggi</option>
              <option value="rate_asc">Rate Terendah</option>
            </select>
          </div>
        </div>

        {loading ? (
          <SkeletonCardGrid count={6} />
        ) : !talents || talents.length === 0 ? (
          <div className="glass rounded-xl p-16 text-center">
            <Icon name="search" className="mx-auto mb-4 text-surface-300" size={44} />
            <h3 className="text-xl font-bold mb-2 text-surface-900">Belum ada talenta ditemukan</h3>
            <p className="text-surface-400 text-sm">Coba sesuaikan kriteria filtermu.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {talents.map((talent) => {
              const categoryLabel = talent.category === "web_dev" ? "Web Developer" : "Graphic Designer";

              return (
                <Link key={talent.id} href={`/talents/${talent.id}`} className="glass rounded-xl p-6 card-hover block">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold overflow-hidden">
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

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-surface-50 border border-surface-200">
                      <div className="text-[10px] text-[#854F0B]">Rate</div>
                      <div className="text-xs font-semibold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="money" size={12} />
                        Rp {Number(talent.rate_per_hour || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-50 border border-surface-200">
                      <div className="text-[10px] text-[#534AB7]">Match</div>
                      <div className="text-xs font-semibold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="ai" size={12} />
                        {"—"}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-50 border border-surface-200">
                      <div className="text-[10px] text-[#0F6E56]">Portofolio</div>
                      <div className="text-xs font-semibold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="shield" size={12} />
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
