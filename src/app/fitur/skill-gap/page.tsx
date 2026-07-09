"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";
import { Breadcrumb } from "@/components/Breadcrumb";

const copy = {
  id: {
    badge: "Fitur Unggulan",
    h1a: "Tutup Celah Karier dengan ",
    h1b: "Skill Gap Analysis.",
    subtitle: "Cari tahu mengapa Anda sering ditolak. AI menganalisis profil Anda dan membandingkannya dengan permintaan pasar untuk menemukan keterampilan apa yang masih kurang.",
    demoSkill1: "React JS",
    demoSkill2: "TypeScript (Dibutuhkan Pasar)",
    demoSkill2Status: "Kurang",
    demoSkill3: "Next.js App Router",
    demoSkill3Status: "Kritis",
    whyTitle: "Berhenti Menebak Kenapa Ditolak",
    whyP1: "Banyak talenta tidak tahu mengapa profil mereka tidak pernah dipanggil klien. Seringkali, masalahnya ada pada 1 atau 2 skill spesifik yang sedang tren tapi belum mereka kuasai.",
    whyP2: "Sistem kami memindai ribuan lowongan pekerjaan untuk mengetahui *precisely* apa yang diinginkan klien saat ini.",
    featuresTitle: "Apa yang Anda Dapatkan?",
    feature1Title: "Audit Profil Otomatis",
    feature1Desc: "AI membedah CV, portofolio, dan repository Anda untuk mendeteksi *hard skill* dan *soft skill* yang Anda miliki secara objektif.",
    feature2Title: "Pemetaan Tren Industri",
    feature2Desc: "Data real-time mengenai apa yang paling sering dicari oleh klien di kategori Anda (misal: UI/UX, Web Dev, dll).",
    feature3Title: "Skor Kelengkapan Profil",
    feature3Desc: "Angka pasti (0-100) seberapa siap profil Anda bersaing di pasar kerja saat ini.",
    recoTitle: "Bukan Hanya Masalah, Tapi Solusi.",
    recoDesc: "Setelah menemukan *skill gap*, AI Nyamby akan secara otomatis menyarankan materi pembelajaran, kursus, atau proyek portofolio mini untuk menutup celah tersebut.",
    recoBadge: "Rekomendasi AI untuk Anda:",
    reco1Title: "Belajar React Hooks",
    reco1Desc: "Durasi: 3 Jam",
    reco2Title: "Proyek Clone Twitter UI",
    reco2Desc: "Tingkatkan Portofolio Tailwind",
    ctaTitle: "Ketahui Kekuranganmu Hari Ini",
    ctaSub: "Analisis profil Anda hanya butuh 3 menit. Temukan celah karier Anda sekarang.",
    ctaBtn: "Analisis Profil Saya",
  },
  en: {
    badge: "Key Feature",
    h1a: "Close the Career Gap with ",
    h1b: "Skill Gap Analysis.",
    subtitle: "Find out why you often get rejected. AI analyzes your profile and compares it with market demand to find exactly what skills you are missing.",
    demoSkill1: "React JS",
    demoSkill2: "TypeScript (Market Demand)",
    demoSkill2Status: "Lacking",
    demoSkill3: "Next.js App Router",
    demoSkill3Status: "Critical",
    whyTitle: "Stop Guessing Why You're Rejected",
    whyP1: "Many talents don't know why their profiles are never called by clients. Often, the problem lies in 1 or 2 specific trending skills they haven't mastered yet.",
    whyP2: "Our system scans thousands of job postings to find out *precisely* what clients want right now.",
    featuresTitle: "What Do You Get?",
    feature1Title: "Automated Profile Audit",
    feature1Desc: "AI dissects your CV, portfolio, and repositories to objectively detect the *hard skills* and *soft skills* you possess.",
    feature2Title: "Industry Trend Mapping",
    feature2Desc: "Real-time data on what clients are searching for most in your category (e.g., UI/UX, Web Dev, etc).",
    feature3Title: "Profile Completeness Score",
    feature3Desc: "An exact number (0-100) of how ready your profile is to compete in the current job market.",
    recoTitle: "Not Just the Problem, But the Solution.",
    recoDesc: "After finding the *skill gap*, Nyamby AI will automatically suggest learning materials, courses, or mini portfolio projects to close the gap.",
    recoBadge: "AI Recommendations for You:",
    reco1Title: "Learn React Hooks",
    reco1Desc: "Duration: 3 Hours",
    reco2Title: "Twitter UI Clone Project",
    reco2Desc: "Improve Tailwind Portfolio",
    ctaTitle: "Know Your Weaknesses Today",
    ctaSub: "Analyzing your profile takes only 3 minutes. Discover your career gaps now.",
    ctaBtn: "Analyze My Profile",
  },
} as const;


export default function SkillGapPage() {
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
          { label: "Skill Gap Analysis", href: "/fitur/skill-gap" },
        ]}
      />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[100px] -z-10 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-amber-600 shadow-sm">
            <Icon name="spark" size={16} /> {t.badge}
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            {t.h1a} <br className="hidden md:block"/>
            <span className="text-amber-600">{t.h1b}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* 2. Mengapa Penting */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-amber-50 p-8 rounded-3xl border border-amber-100 flex items-center justify-center min-h-[300px]">
            <div className="space-y-4 w-full">
              <div className="flex justify-between text-sm font-bold text-slate-700"><span>{t.demoSkill1}</span> <span>80%</span></div>
              <div className="w-full h-2 bg-slate-200 rounded-full"><div className="w-[80%] h-full bg-emerald-500 rounded-full"></div></div>
              
              <div className="flex justify-between text-sm font-bold text-slate-700 mt-4"><span>{t.demoSkill2}</span> <span className="text-amber-600">{t.demoSkill2Status}</span></div>
              <div className="w-full h-2 bg-slate-200 rounded-full"><div className="w-[20%] h-full bg-amber-500 rounded-full"></div></div>
              
              <div className="flex justify-between text-sm font-bold text-slate-700 mt-4"><span>{t.demoSkill3}</span> <span className="text-red-500">{t.demoSkill3Status}</span></div>
              <div className="w-full h-2 bg-slate-200 rounded-full"><div className="w-[0%] h-full bg-red-500 rounded-full"></div></div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-3xl font-bold mb-4">{t.whyTitle}</h2>
            <p className="text-slate-500">
              {t.whyP1}
            </p>
            <p className="text-slate-500">
              {t.whyP2}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Laporan Detail */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">{t.featuresTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Icon name="search" className="text-amber-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">{t.feature1Title}</h3>
              <p className="text-slate-500 text-sm">{t.feature1Desc}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Icon name="chart" className="text-amber-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">{t.feature2Title}</h3>
              <p className="text-slate-500 text-sm">{t.feature2Desc}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Icon name="check" className="text-amber-500 mb-4" size={32} />
              <h3 className="font-bold text-lg mb-2">{t.feature3Title}</h3>
              <p className="text-slate-500 text-sm">{t.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rekomendasi Pelatihan */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold">{t.recoTitle}</h2>
            <p className="text-slate-400 text-lg">
              {t.recoDesc}
            </p>
          </div>
          <div className="flex-1 bg-slate-800 p-8 rounded-3xl border border-slate-700">
             <div className="text-sm text-slate-400 mb-4">{t.recoBadge}</div>
             <div className="bg-slate-700 p-4 rounded-xl flex items-center justify-between mb-3">
               <div><div className="font-bold">{t.reco1Title}</div><div className="text-xs text-slate-400">{t.reco1Desc}</div></div>
               <Icon name="arrowRight" className="text-amber-400" />
             </div>
             <div className="bg-slate-700 p-4 rounded-xl flex items-center justify-between">
               <div><div className="font-bold">{t.reco2Title}</div><div className="text-xs text-slate-400">{t.reco2Desc}</div></div>
               <Icon name="arrowRight" className="text-amber-400" />
             </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-white py-20 px-6 text-center border-t border-slate-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">{t.ctaTitle}</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">
          {t.ctaSub}
        </p>
        <Link href="/register" className="btn-primary bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-full font-bold shadow-xl transition-colors inline-block">
          {t.ctaBtn}
        </Link>
      </section>

      <Footer />
    </div>
  );
}
