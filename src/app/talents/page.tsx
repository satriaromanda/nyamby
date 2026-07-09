"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SkeletonCardGrid } from "@/components/Skeleton";
import Image from "next/image";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    h1a: "Telusuri ",
    h1b: "Talenta",
    subtitle: "Temukan pengembang web dan desainer grafis yang sudah dipetakan skill, tarif, dan ketersediaannya.",
    searchPlaceholder: "Cari nama, keahlian, atau bio...",
    filters: {
      all: "Semua Talenta",
      webDev: "Pengembang Web",
      design: "Desainer Grafis",
    },
    rateLabel: "Tarif/Jam",
    minLabel: "Min",
    maxLabel: "Max",
    statusAll: "Status (Semua)",
    statusAvail: "Tersedia",
    statusBusy: "Sibuk",
    sortNewest: "Terbaru",
    sortRateDesc: "Tarif Tertinggi",
    sortRateAsc: "Tarif Terendah",
    emptyTitle: "Belum ada talenta ditemukan",
    emptyDesc: "Coba sesuaikan kriteria filtermu.",
    webDevLabel: "Pengembang Web",
    designLabel: "Desainer Grafis",
    locationFallback: "Indonesia",
    bioFallback: "Talenta Nyamby siap menerima proyek digital.",
    rateCard: "Tarif",
    matchCard: "Kecocokan",
    portfolioCard: "Portofolio",
    portfolioAvail: "Tersedia",
    portfolioBasic: "Dasar",
  },
  en: {
    h1a: "Browse ",
    h1b: "Talents",
    subtitle: "Find web developers and graphic designers whose skills, rates, and availability have been mapped out.",
    searchPlaceholder: "Search for name, skill, or bio...",
    filters: {
      all: "All Talents",
      webDev: "Web Developer",
      design: "Graphic Designer",
    },
    rateLabel: "Rate/Hr",
    minLabel: "Min",
    maxLabel: "Max",
    statusAll: "Status (All)",
    statusAvail: "Available",
    statusBusy: "Busy",
    sortNewest: "Newest",
    sortRateDesc: "Highest Rate",
    sortRateAsc: "Lowest Rate",
    emptyTitle: "No talents found yet",
    emptyDesc: "Try adjusting your filter criteria.",
    webDevLabel: "Web Developer",
    designLabel: "Graphic Designer",
    locationFallback: "Indonesia",
    bioFallback: "Nyamby talent is ready for digital projects.",
    rateCard: "Rate",
    matchCard: "Match",
    portfolioCard: "Portfolio",
    portfolioAvail: "Available",
    portfolioBasic: "Basic",
  },
} as const;


export default function TalentsPage() {
  const [lang] = useLang();
  const t = copy[lang];

  const categories = [
    { value: "", label: t.filters.all },
    { value: "web_dev", label: t.filters.webDev },
    { value: "graphic_designer", label: t.filters.design },
  ];

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
              {t.h1a} <span className="text-gradient-brand">{t.h1b}</span>
            </h1>
            <p className="text-surface-500 mt-1 text-sm">
              {t.subtitle}
            </p>
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
            {categories.map((f) => (
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
            <span className="text-xs text-surface-500 shrink-0">{t.rateLabel}</span>
            <input type="number" placeholder={t.minLabel} className="text-sm py-1.5 px-2.5 flex-1 min-w-[60px] max-w-[100px] bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={minRate} onChange={e => setMinRate(e.target.value)} />
            <span className="text-surface-300 shrink-0">–</span>
            <input type="number" placeholder={t.maxLabel} className="text-sm py-1.5 px-2.5 flex-1 min-w-[60px] max-w-[100px] bg-surface-50 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-primary-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={maxRate} onChange={e => setMaxRate(e.target.value)} />
          </div>

          <select
            className="w-full lg:w-auto text-sm py-2 pl-4 pr-10 bg-white border border-surface-200 rounded-full text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 0.75rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`,
            }}
            value={availability}
            onChange={e => setAvailability(e.target.value)}
          >
            <option value="">{t.statusAll}</option>
            <option value="available">{t.statusAvail}</option>
            <option value="busy">{t.statusBusy}</option>
          </select>

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
            <option value="rate_desc">{t.sortRateDesc}</option>
            <option value="rate_asc">{t.sortRateAsc}</option>
          </select>
        </div>

        {loading ? (
          <SkeletonCardGrid count={6} />
        ) : !talents || talents.length === 0 ? (
          <div className="card p-16 text-center">
            <Icon name="search" className="mx-auto mb-4 text-surface-300" size={44} />
            <h3 className="text-xl font-bold mb-2 text-surface-900">{t.emptyTitle}</h3>
            <p className="text-surface-400 text-sm">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {talents.map((talent) => {
              const categoryLabel = talent.category === "web_dev" ? t.webDevLabel : t.designLabel;

              return (
                <Link key={talent.id} href={`/talents/${talent.id}`} className="card card-hover p-6 block">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold overflow-hidden shrink-0 relative">
                        {talent.avatar_url ? (
                          <Image src={talent.avatar_url} alt={talent.full_name} fill className="object-cover" />
                        ) : (
                          talent.full_name?.[0] || "?"
                        )}
                      </div>
                      <div>
                        <h2 className="font-bold text-surface-900 line-clamp-1">{talent.full_name}</h2>
                        <p className="text-xs text-surface-500 line-clamp-1">{categoryLabel} - {talent.location || t.locationFallback}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 status-${talent.availability}`}>
                      {talent.availability}
                    </span>
                  </div>

                  <p className="text-sm text-surface-500 line-clamp-2 mb-4">
                    {talent.bio || t.bioFallback}
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
                      <div className="text-[10px] text-surface-400 mb-0.5">{t.rateCard}</div>
                      <div className="text-xs font-bold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="money" size={12} className="text-money-500 shrink-0" />
                        Rp {Number(talent.rate_per_hour || 0).toLocaleString(lang === "id" ? "id-ID" : "en-US")}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-50">
                      <div className="text-[10px] text-surface-400 mb-0.5">{t.matchCard}</div>
                      <div className="text-xs font-bold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="ai" size={12} className="text-ai-500 shrink-0" />
                        {"—"}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-surface-50">
                      <div className="text-[10px] text-surface-400 mb-0.5">{t.portfolioCard}</div>
                      <div className="text-xs font-bold text-surface-900 flex items-center justify-center gap-1">
                        <Icon name="shield" size={12} className="text-action-500 shrink-0" />
                        {talent.portfolio_url ? t.portfolioAvail : t.portfolioBasic}
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
