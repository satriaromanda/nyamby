"use client";

import Link from "next/link";
import { Icon, Logo } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#FAFAF8] text-slate-900 font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded-lg focus:shadow-lg">Skip to content</a>
      
      {/* ─── Navigation ─────────────────────────────────────────── */}
      <Navbar />

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section id="main-content" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-6 overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <Icon name="spark" className="text-primary-600" size={14} />
              AI Career Companion #1 di Indonesia
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900" >
              Nyambungin Skill, <br />
              <span className="text-primary-600">Nyambungin <br className="hidden lg:block"/>Masa Depan.</span>
            </h1>

            <p className="text-lg text-slate-500 max-w-md leading-relaxed">
              AI Career Companion yang membantu talenta Indonesia menemukan peluang terbaik, mengembangkan skill, dan bertumbuh lebih tinggi.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/register" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-transform">
                Mulai Perjalanan <Icon name="arrowRight" size={16} />
              </Link>
              <a href="#demo" className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700">
                Lihat Demo
              </a>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                  <Icon name="star" size={16} fill="currentColor" />
                  <Icon name="star" size={16} fill="currentColor" />
                  <Icon name="star" size={16} fill="currentColor" />
                  <Icon name="star" size={16} fill="currentColor" />
                  <Icon name="star" size={16} fill="currentColor" />
                </div>
                <div className="text-sm"><span className="font-bold text-slate-900">4.9</span> <span className="text-slate-500">rating</span></div>
              </div>
              <div>
                <div className="text-primary-600 mb-1"><Icon name="user" size={18} /></div>
                <div className="text-sm"><span className="font-bold text-slate-900">500+</span> <span className="text-slate-500">talent</span></div>
              </div>
              <div>
                <div className="text-emerald-500 mb-1"><Icon name="target" size={18} /></div>
                <div className="text-sm"><span className="font-bold text-slate-900">95%</span> <span className="text-slate-500">match accuracy</span></div>
              </div>
            </div>
          </div>

          {/* Right Mascot Image */}
          <div className="relative flex justify-center lg:justify-end z-10">
            {/* Glow behind mascot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-400/20 rounded-full blur-[80px] -z-10"></div>
            
            <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
              <img 
                src="/images/hero-mascot.png" 
                alt="Nambi Mascot Hero" 
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ───────────────────────────────── */}
      <section id="cara-kerja" className="py-24 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
            <div className="w-48 h-48 lg:w-64 lg:h-64 shrink-0 flex items-center justify-center relative">
              <img 
                src="/images/how-it-works-mascot.png" 
                alt="Nambi Idea" 
                className="w-full h-full object-contain relative z-10 drop-shadow-xl"
              />
            </div>
            
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 mb-4">
                <Icon name="spark" size={12} /> How it works
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4" >
                Nambi Punya <br className="hidden lg:block"/><span className="text-primary-600">Jawabannya.</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-md">
                Empat langkah sederhana untuk membawa karier kamu ke level berikutnya. Nambi mendampingi dari hari pertama.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Cari Peluang", desc: "AI mencocokkan skill dengan peluang terbaik.", image: "/images/icon-target-3d.png" },
              { title: "Cari Arah", desc: "AI menganalisis skill dan memberi rekomendasi.", image: "/images/icon-brain-3d.png" },
              { title: "Bertumbuh", desc: "Pantau perkembangan karier real-time.", image: "/images/icon-chart-3d.png" },
              { title: "Aman & Terpercaya", desc: "Sistem verifikasi dan escrow.", image: "/images/icon-shield-3d.png" }
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                <div className="w-[88px] h-[88px] mb-6 relative flex items-center justify-center">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── AI Matching Section ────────────────────────────────── */}
      <section id="ai-matching" className="py-24 px-6 bg-[#FAFAF8]">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <Icon name="link" className="text-primary-600" size={12} /> AI Matching
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight" >
              AI Matching <br />
              yang <span className="text-primary-600">Mengerti Kamu</span>
            </h2>
            
            <p className="text-slate-500 text-lg max-w-md">
              Bukan sekadar keyword matching. Nyamby memahami pengalaman, skill, dan tujuan karier.
            </p>
            
            <ul className="space-y-4">
              {[
                "Memahami konteks dari CV dan portofolio",
                "Memberi ulasan kenapa kamu cocok",
                "Rekomendasi skill yang perlu ditingkatkan"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Icon name="check" size={12} />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <Link href="/register" className="btn-primary px-8 py-3 rounded-full shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-transform inline-block">
                Coba Gratis <Icon name="arrowRight" size={16} className="inline ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 flex justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-400/20 rounded-full blur-[60px] -z-10"></div>
            <div className="w-full max-w-[500px] aspect-[4/5] flex items-center justify-center relative">
              <img 
                src="/images/ai-matching-mascot.png" 
                alt="Nambi AI Matching" 
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────────────── */}
      <section className="bg-primary-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-800 rounded-full blur-[80px] opacity-50 translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-[1280px] mx-auto px-6 py-24 lg:py-32 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight" >
              Dari <span className="text-amber-400">Nyambi</span><br />
              Menjadi Karier.
            </h2>
            <p className="text-primary-100 text-lg max-w-sm">
              Mulai perjalananmu bersama Nambi hari ini. Gratis, tanpa kartu kredit.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/register" className="bg-white text-primary-700 hover:bg-slate-50 px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition-transform hover:-translate-y-0.5">
                Daftar Gratis <Icon name="arrowRight" size={16} className="inline ml-1" />
              </Link>
              <a href="#demo" className="border border-primary-400 hover:bg-primary-600/50 text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center gap-2">
                Lihat Demo
              </a>
            </div>
          </div>
          
           <div className="relative flex justify-center lg:justify-end h-full min-h-[400px]">
              <img 
                src="/images/cta-mascot.png" 
                alt="Nambi CTA" 
                className="w-full max-w-[500px] h-auto object-contain relative z-10 drop-shadow-2xl lg:absolute lg:-bottom-24"
              />
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
