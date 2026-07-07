"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    blogBadge: "Blog",
    h1a: "Insight & Cerita ",
    h1b: "dari Nyamby.",
    subtitle: "Tips karier, update produk, cerita komunitas, dan di balik layar engineering — semua ada di sini.",
    categories: ["Semua", "Produk", "Tips Karier", "Engineering", "Komunitas"],
    articles: [
      {
        title: "Bagaimana AI Matching Nyamby Menemukan Talenta Terbaik",
        snippet: "Pelajari bagaimana sistem AI kami menganalisis skill, portfolio, dan pengalaman untuk memberikan rekomendasi yang akurat.",
        category: "Produk",
        date: "28 Jun 2026",
        readTime: "5 menit",
        color: "#2563EB",
        bg: "#eff6ff",
      },
      {
        title: "5 Tips Membangun Portfolio Freelance yang Menarik",
        snippet: "Portfolio adalah kunci utama mendapatkan klien. Berikut tips yang terbukti efektif dari top talent di Nyamby.",
        category: "Tips Karier",
        date: "22 Jun 2026",
        readTime: "7 menit",
        color: "#0F6E56",
        bg: "#e6f2ee",
      },
      {
        title: "Nyamby Kini Hadir di Malaysia — Apa yang Berubah?",
        snippet: "Ekspansi pertama kami ke Asia Tenggara. Pelajari fitur baru khusus pasar Malaysia Digital.",
        category: "Produk",
        date: "15 Jun 2026",
        readTime: "4 menit",
        color: "#854F0B",
        bg: "#faeeda",
      },
      {
        title: "Membangun Escrow System dari Nol: Engineering di Balik Layar",
        snippet: "Tim engineering kami berbagi pengalaman teknis merancang sistem escrow yang aman dan transparan.",
        category: "Engineering",
        date: "10 Jun 2026",
        readTime: "10 menit",
        color: "#993C1D",
        bg: "#f5ebe6",
      },
      {
        title: "Dari Nyambi ke Karier: Kisah Sukses 3 Talenta Nyamby",
        snippet: "Tiga cerita inspiratif talenta yang mengubah pekerjaan sampingan menjadi karier profesional melalui Nyamby.",
        category: "Komunitas",
        date: "5 Jun 2026",
        readTime: "6 menit",
        color: "#3B6D11",
        bg: "#eaf1e2",
      },
      {
        title: "Skill Gap Analysis: Fitur Baru untuk Pengembangan Karier",
        snippet: "Fitur terbaru kami membantu talenta memahami gap antara skill mereka dan kebutuhan pasar, lengkap dengan rekomendasi.",
        category: "Produk",
        date: "1 Jun 2026",
        readTime: "5 menit",
        color: "#2563EB",
        bg: "#eff6ff",
      },
    ],
    readAction: "Baca",
    newsTitle: "Jangan Lewatkan Update Terbaru",
    newsDesc: "Dapatkan artikel terbaru, tips karier, dan berita produk langsung di inbox kamu.",
    emailPlaceholder: "Masukkan email kamu",
    subscribeBtn: "Berlangganan",
  },
  en: {
    blogBadge: "Blog",
    h1a: "Insights & Stories ",
    h1b: "from Nyamby.",
    subtitle: "Career tips, product updates, community stories, and behind-the-scenes engineering — all right here.",
    categories: ["All", "Product", "Career Tips", "Engineering", "Community"],
    articles: [
      {
        title: "How Nyamby's AI Matching Finds the Best Talent",
        snippet: "Learn how our AI system analyzes skills, portfolios, and experience to provide accurate recommendations.",
        category: "Product",
        date: "Jun 28, 2026",
        readTime: "5 min",
        color: "#2563EB",
        bg: "#eff6ff",
      },
      {
        title: "5 Tips for Building an Attractive Freelance Portfolio",
        snippet: "A portfolio is the main key to landing clients. Here are proven tips from top talent on Nyamby.",
        category: "Career Tips",
        date: "Jun 22, 2026",
        readTime: "7 min",
        color: "#0F6E56",
        bg: "#e6f2ee",
      },
      {
        title: "Nyamby is Now in Malaysia — What's Changed?",
        snippet: "Our first expansion into Southeast Asia. Learn about the new features tailored for the Malaysian Digital market.",
        category: "Product",
        date: "Jun 15, 2026",
        readTime: "4 min",
        color: "#854F0B",
        bg: "#faeeda",
      },
      {
        title: "Building an Escrow System from Scratch: Engineering Behind the Scenes",
        snippet: "Our engineering team shares technical experiences designing a secure and transparent escrow system.",
        category: "Engineering",
        date: "Jun 10, 2026",
        readTime: "10 min",
        color: "#993C1D",
        bg: "#f5ebe6",
      },
      {
        title: "From Side Gig to Career: Success Stories of 3 Nyamby Talents",
        snippet: "Three inspiring stories of talent who turned side gigs into professional careers through Nyamby.",
        category: "Community",
        date: "Jun 5, 2026",
        readTime: "6 min",
        color: "#3B6D11",
        bg: "#eaf1e2",
      },
      {
        title: "Skill Gap Analysis: A New Feature for Career Development",
        snippet: "Our newest feature helps talent understand the gap between their skills and market needs, complete with recommendations.",
        category: "Product",
        date: "Jun 1, 2026",
        readTime: "5 min",
        color: "#2563EB",
        bg: "#eff6ff",
      },
    ],
    readAction: "Read",
    newsTitle: "Don't Miss the Latest Updates",
    newsDesc: "Get the latest articles, career tips, and product news straight to your inbox.",
    emailPlaceholder: "Enter your email",
    subscribeBtn: "Subscribe",
  },
} as const;


export default function BlogPage() {
  const [lang] = useLang();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)] -z-10" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-[120px] -z-10 -translate-x-1/3"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-primary-600 shadow-sm">
            <Icon name="book" size={16} /> {t.blogBadge}
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            {t.h1a}<br className="hidden md:block" />
            <span className="text-gradient-brand">{t.h1b}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-8">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {t.categories.map((cat, i) => (
            <button
              key={i}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                i === 0
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.articles.map((article, i) => (
            <article
              key={i}
              className="rounded-2xl border border-slate-100 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              {/* Color Bar */}
              <div className="h-1.5 w-full" style={{ background: article.color }}></div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: article.bg, color: article.color }}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400">{article.readTime}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-[15px] mb-3 leading-snug group-hover:text-primary-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{article.snippet}</p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{article.date}</span>
                  <span className="text-xs text-primary-600 font-medium group-hover:underline flex items-center gap-1">
                    {t.readAction} <Icon name="arrowRight" size={12} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{t.newsTitle}</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">{t.newsDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                className="input-dark flex-1"
              />
              <button className="btn-primary px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap">
                {t.subscribeBtn}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
