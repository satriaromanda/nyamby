"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    badge: "Fitur Unggulan",
    h1a: "AI Job Matching yang ",
    h1b: "Mengerti Konteks Kariermu.",
    subtitle: "Sistem kami tidak sekadar mencocokkan kata kunci. AI Nyamby membaca pengalaman, menganalisis gaya portofolio, dan memberikan skor relevansi yang sangat akurat untuk setiap kandidat.",
    ctaHero: "Coba Gratis Sekarang",
    diffTitle: "Mengapa AI Matching Berbeda?",
    diffSub: "Tinggalkan cara lama yang membuang banyak waktu.",
    oldWay: "Cara Lama",
    oldWayItems: [
      "Menyaring ratusan CV PDF secara manual.",
      "Hanya mencari kecocokan \"keyword\" (misal: React), walau pengalaman tidak relevan.",
      "Banyak kandidat *spam* yang melamar membabi buta.",
      "Sulit menilai kualitas *soft-skill* dari tulisan.",
    ],
    newWay: "Cara Nyamby",
    newWayItems: [
      "AI menganalisis portofolio dan repo Github secara instan.",
      "Memahami *konteks* pekerjaan dan memberi skor akurasi (0-100%).",
      "Otomatis memfilter kandidat yang tidak relevan secara semantik.",
      "Menyediakan ringkasan \"Kekuatan & Kelemahan\" untuk setiap kandidat.",
    ],
    howTitle: "Bagaimana Ini Bekerja?",
    howSteps: [
      { step: "1", title: "Ekstraksi Konteks", desc: "Klien memposting pekerjaan, dan AI mengekstrak kompetensi inti yang benar-benar dibutuhkan, bukan cuma judul." },
      { step: "2", title: "Vector Search", desc: "Kami mencari di database talenta menggunakan semantic search, menemukan orang yang punya pengalaman serupa." },
      { step: "3", title: "Scoring & Insight", desc: "Setiap kandidat diberi skor kecocokan, beserta insight spesifik mengapa mereka cocok untuk proyek tersebut." }
    ],
    statsTitleA: "Menghemat ",
    statsTitleB: "80% Waktu",
    statsTitleC: " Rekrutmen",
    statsDesc: "Klien kami melaporkan penurunan drastis dalam waktu yang dihabiskan untuk *screening* kandidat. Dengan AI Matching, Anda langsung berhadapan dengan top 5% talenta.",
    testiName: "Budi Santoso",
    testiRole: "Tech Lead di Startup X",
    testiQuote: "\"Biasanya butuh 2 minggu cari freelancer React yang pas. Pake Nyamby, hari itu juga dapet 3 kandidat dengan skor 95%+ dan langsung interview.\"",
    demoTitle: "Kandidat Teratas",
    demoBadge: "Top Match",
    demoName: "Andi Setiawan",
    demoRole: "Fullstack Engineer",
    ctaTitle: "Siap Menemukan Kecocokan yang Tepat?",
    ctaSub: "Daftar sekarang dan biarkan AI kami bekerja untuk Anda.",
    ctaBtn: "Mulai Pencarian",
  },
  en: {
    badge: "Key Feature",
    h1a: "AI Job Matching that ",
    h1b: "Understands Your Career Context.",
    subtitle: "Our system doesn't just match keywords. Nyamby AI reads experience, analyzes portfolio styles, and provides highly accurate relevance scores for each candidate.",
    ctaHero: "Try It Free Now",
    diffTitle: "Why is AI Matching Different?",
    diffSub: "Leave behind the old ways that waste so much time.",
    oldWay: "The Old Way",
    oldWayItems: [
      "Manually screening hundreds of PDF CVs.",
      "Only searching for \"keyword\" matches (e.g., React), even if the experience is irrelevant.",
      "Many *spam* candidates applying blindly.",
      "Hard to assess *soft-skill* quality from writing alone.",
    ],
    newWay: "The Nyamby Way",
    newWayItems: [
      "AI analyzes portfolios and Github repos instantly.",
      "Understands job *context* and provides an accuracy score (0-100%).",
      "Automatically filters out semantically irrelevant candidates.",
      "Provides a \"Strengths & Weaknesses\" summary for each candidate.",
    ],
    howTitle: "How Does It Work?",
    howSteps: [
      { step: "1", title: "Context Extraction", desc: "Clients post a job, and AI extracts the core competencies that are truly needed, not just the job title." },
      { step: "2", title: "Vector Search", desc: "We search the talent database using semantic search, finding people with similar experience." },
      { step: "3", title: "Scoring & Insight", desc: "Each candidate is given a match score, along with specific insights on why they are a good fit for the project." }
    ],
    statsTitleA: "Save ",
    statsTitleB: "80% of Time",
    statsTitleC: " on Recruiting",
    statsDesc: "Our clients report a drastic drop in time spent *screening* candidates. With AI Matching, you instantly face the top 5% of talent.",
    testiName: "John Doe",
    testiRole: "Tech Lead at Startup X",
    testiQuote: "\"It usually takes 2 weeks to find the right React freelancer. Using Nyamby, I got 3 candidates with 95%+ scores on the same day and interviewed them immediately.\"",
    demoTitle: "Top Candidate",
    demoBadge: "Top Match",
    demoName: "Andrew Smith",
    demoRole: "Fullstack Engineer",
    ctaTitle: "Ready to Find the Perfect Match?",
    ctaSub: "Sign up now and let our AI work for you.",
    ctaBtn: "Start Searching",
  },
} as const;

export default function AiMatchingPage() {
  const [lang] = useLang();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />
      {/* SEO breadcrumb JSON-LD only — hero has no room for visible trail (PRD v5.3 §6.11) */}
      <Breadcrumb
        jsonLdOnly
        items={[
          { label: "Beranda", href: "/" },
          { label: "Fitur", href: "/#fitur" },
          { label: "AI Job Matching", href: "/fitur/ai-matching" },
        ]}
      />

      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[100px] -z-10 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-primary-600 shadow-sm">
            <Icon name="spark" size={16} /> {t.badge}
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            {t.h1a} <br className="hidden md:block"/>
            <span className="text-gradient-brand">{t.h1b}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 rounded-full font-medium text-sm shadow-lg hover:-translate-y-0.5 transition-transform">
              {t.ctaHero}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Masalah vs Solusi */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t.diffTitle}</h2>
            <p className="text-slate-500">{t.diffSub}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-red-50 border border-red-100">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <Icon name="x" size={20} /> {t.oldWay}
              </h3>
              <ul className="space-y-4 text-slate-700">
                {t.oldWayItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Icon name="spark" size={120} />
              </div>
              <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <Icon name="check" size={20} /> {t.newWay}
              </h3>
              <ul className="space-y-4 text-slate-700 relative z-10">
                {t.newWayItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cara Kerja */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">{t.howTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.howSteps.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative pt-12">
                <div className="absolute top-0 -translate-y-1/2 w-12 h-12 bg-primary-600 text-white font-bold text-xl rounded-full flex items-center justify-center border-4 border-slate-50">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Statistik / Testimonial */}
      <section className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold leading-tight">{t.statsTitleA}<span className="text-gradient-brand">{t.statsTitleB}</span>{t.statsTitleC}</h2>
            <p className="text-slate-500 text-lg">
              {t.statsDesc}
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 rounded-full bg-slate-200"></div>
              <div>
                <p className="font-bold">{t.testiName}</p>
                <p className="text-sm text-slate-500">{t.testiRole}</p>
              </div>
            </div>
            <p className="italic text-slate-600">{t.testiQuote}</p>
          </div>
          <div className="flex-1 w-full bg-slate-100 rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="font-bold">{t.demoTitle}</div>
                <div className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{t.demoBadge}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">{t.demoName.charAt(0)}</div>
                <div>
                  <div className="font-semibold text-sm">{t.demoName}</div>
                  <div className="text-xs text-slate-500">{t.demoRole}</div>
                </div>
                <div className="ml-auto text-emerald-600 font-bold">98%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-primary-900 text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.ctaTitle}</h2>
        <p className="text-primary-200 mb-8 max-w-xl mx-auto">
          {t.ctaSub}
        </p>
        <Link href="/register" className="bg-white text-primary-900 px-8 py-3.5 rounded-full font-bold shadow-xl hover:bg-slate-50 transition-colors inline-block">
          {t.ctaBtn}
        </Link>
      </section>

      <Footer />
    </div>
  );
}
