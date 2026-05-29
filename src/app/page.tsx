"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ─── Navigation ─────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center font-bold text-lg" style={{ fontFamily: "Outfit" }}>
              N
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "Outfit" }}>
              Nyamby
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-surface-200 hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#how-it-works" className="text-sm text-surface-200 hover:text-white transition-colors">
              Cara Kerja
            </a>
            <a href="#ai-power" className="text-sm text-surface-200 hover:text-white transition-colors">
              AI Engine
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-surface-200 hover:text-white transition-colors px-4 py-2"
            >
              Masuk
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section className="gradient-hero relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className={`space-y-8 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-300">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              Digdaya X Hackathon 2026
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight" style={{ fontFamily: "Outfit" }}>
              Dari{" "}
              <span className="gradient-text">Nyambi</span>
              <br />
              ke Karir
              <br />
              Profesional
            </h1>

            <p className="text-lg text-surface-200 max-w-lg leading-relaxed">
              Platform <strong className="text-white">AI-powered</strong> yang menghubungkan
              talenta digital Indonesia dengan klien yang tepat — lewat{" "}
              <strong className="text-primary-300">smart matching</strong> dan{" "}
              <strong className="text-accent-400">career growth insights</strong>.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/register?role=talent" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Daftar sebagai Talenta
              </Link>
              <Link href="/register?role=client" className="btn-secondary text-base px-8 py-3.5">
                Cari Talenta / Post Job
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-4">
              {[
                { num: "46M+", label: "Freelancer Indonesia" },
                { num: "87%", label: "Akurasi AI Matching" },
                { num: "<3s", label: "Waktu Matching" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold gradient-text" style={{ fontFamily: "Outfit" }}>
                    {stat.num}
                  </div>
                  <div className="text-xs text-surface-200 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual — AI Matching Card */}
          <div
            className={`hidden lg:block ${isVisible ? "animate-slide-in-right" : "opacity-0"}`}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative">
              <div className="absolute -inset-4 gradient-glow rounded-3xl" />
              <div className="relative glass rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold">
                    🤖
                  </div>
                  <div>
                    <div className="font-semibold text-sm">AI Job Matching</div>
                    <div className="text-xs text-surface-200">Powered by GPT-4o</div>
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full bg-accent-500/20 text-accent-400 text-xs font-medium">
                    Live
                  </div>
                </div>

                {/* Match Results Preview */}
                {[
                  { name: "Raka Pratama", role: "Web Developer", score: 87, status: "highly_recommended" },
                  { name: "Sari Wulandari", role: "UI/UX Designer", score: 72, status: "recommended" },
                  { name: "Andi Setiawan", role: "Full-stack Dev", score: 65, status: "recommended" },
                ].map((talent, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    style={{ animationDelay: `${0.5 + i * 0.2}s` }}
                  >
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold">
                      {talent.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{talent.name}</div>
                      <div className="text-xs text-surface-200">{talent.role}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${talent.score >= 80 ? "text-accent-400" : "text-primary-300"}`}>
                        {talent.score}%
                      </div>
                      <div className="text-[10px] text-surface-200 uppercase tracking-wide">match</div>
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-white/10 text-center">
                  <span className="text-xs text-surface-200">
                    ✨ 3 talenta dievaluasi dalam 2.3 detik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ───────────────────────────────────── */}
      <section id="features" className="py-24 bg-surface-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Outfit" }}>
              Dua Dimensi, Satu <span className="gradient-text">Platform</span>
            </h2>
            <p className="text-surface-200 max-w-2xl mx-auto">
              Nyamby melayani kedua sisi pasar — talenta yang mencari peluang dan
              klien yang membutuhkan keahlian terbaik.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Talent Side */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center text-2xl mb-6">
                🚀
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "Outfit" }}>
                Untuk Talenta
              </h3>
              <p className="text-surface-200 mb-6">
                Bangun karir profesional dari kemampuanmu. AI kami membantu menemukan
                job yang tepat dan menunjukkan skill apa yang harus ditingkatkan.
              </p>
              <ul className="space-y-3">
                {[
                  "AI Skill Gap Analysis — tahu harus belajar apa",
                  "Job Matching otomatis — tidak perlu cari manual",
                  "Portofolio terstruktur — impresi pertama yang kuat",
                  "Escrow payment — bayaran dijamin aman",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-accent-400 mt-0.5">✓</span>
                    <span className="text-surface-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Side */}
            <div className="glass rounded-2xl p-8 card-hover">
              <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center text-2xl mb-6">
                🎯
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "Outfit" }}>
                Untuk Client
              </h3>
              <p className="text-surface-200 mb-6">
                Post kebutuhanmu dan biarkan AI menemukan talenta terbaik. Tidak ada
                lagi ghosting atau mismatch.
              </p>
              <ul className="space-y-3">
                {[
                  "AI Matching — shortlist talenta terbaik otomatis",
                  "Match Score & reasoning — keputusan berbasis data",
                  "Talent pool terverifikasi — bukan asal daftar",
                  "Escrow system — bayar aman, hasil pasti",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-accent-400 mt-0.5">✓</span>
                    <span className="text-surface-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-surface-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Outfit" }}>
              Cara Kerja
            </h2>
            <p className="text-surface-200 max-w-2xl mx-auto">
              3 langkah simple untuk memulai journey-mu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Daftar & Isi Profil",
                desc: "Pilih role-mu (Talenta atau Client), buat akun, dan lengkapi profilmu.",
                icon: "📝",
                color: "from-primary-500/20 to-primary-600/5",
              },
              {
                step: "02",
                title: "AI Bekerja Untukmu",
                desc: "Untuk talenta: AI analisis skill gap-mu. Untuk client: AI matching talent pool otomatis.",
                icon: "🤖",
                color: "from-purple-500/20 to-purple-600/5",
              },
              {
                step: "03",
                title: "Mulai Berkolaborasi",
                desc: "Terima job, kerjakan project, dan terima pembayaran melalui escrow yang aman.",
                icon: "🤝",
                color: "from-accent-500/20 to-accent-600/5",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent -translate-x-8" />
                )}
                <div className="glass rounded-2xl p-8 card-hover h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-6`}>
                    {item.icon}
                  </div>
                  <div className="text-xs text-primary-400 font-semibold mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Outfit" }}>{item.title}</h3>
                  <p className="text-surface-200 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Power Section ───────────────────────────────────── */}
      <section id="ai-power" className="py-24 bg-surface-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-300 mb-6">
              <span>⚡</span> Powered by GPT-4o
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Outfit" }}>
              AI yang <span className="gradient-text">Benar-benar Bekerja</span>
            </h2>
            <p className="text-surface-200 max-w-2xl mx-auto">
              Bukan hanya buzzword. AI kami menganalisis skill, mencocokkan dengan demand pasar,
              dan memberikan rekomendasi yang actionable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Matching Card */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ fontFamily: "Outfit" }}>
                🎯 AI Job Matching
              </h3>
              <p className="text-surface-200 text-sm mb-6">
                Setiap job yang dipost, AI mengevaluasi seluruh talent pool dan menghasilkan ranked shortlist.
              </p>
              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-200">Input</span>
                  <span className="text-primary-300">Required Skills + Talent Pool</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-200">Output</span>
                  <span className="text-accent-400">Match Score + Reasoning</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-200">Latency</span>
                  <span className="text-white font-medium">&lt; 3 detik</span>
                </div>
              </div>
            </div>

            {/* Skill Gap Card */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ fontFamily: "Outfit" }}>
                📊 AI Skill Gap Analysis
              </h3>
              <p className="text-surface-200 text-sm mb-6">
                AI menganalisis skill talenta vs demand pasar dan memberikan 3 rekomendasi skill prioritas.
              </p>
              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-200">Input</span>
                  <span className="text-primary-300">Current Skills + Market Data</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-200">Output</span>
                  <span className="text-accent-400">3 Rekomendasi + Impact</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-200">Accuracy</span>
                  <span className="text-white font-medium">Based on real demand</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────────────── */}
      <section className="py-24 gradient-hero relative">
        <div className="absolute inset-0 gradient-glow" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "Outfit" }}>
            Siap Bertransisi dari{" "}
            <span className="gradient-text">Nyambi ke Pro</span>?
          </h2>
          <p className="text-lg text-surface-200 mb-10 max-w-2xl mx-auto">
            Bergabung dengan platform yang memahami perjalanan karirmu.
            Mulai sekarang — gratis.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register?role=talent" className="btn-primary text-lg px-10 py-4">
              Daftar sebagai Talenta
            </Link>
            <Link href="/register?role=client" className="btn-secondary text-lg px-10 py-4">
              Post Job Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-surface-950 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-sm" style={{ fontFamily: "Outfit" }}>
                N
              </div>
              <span className="font-bold" style={{ fontFamily: "Outfit" }}>Nyamby</span>
              <span className="text-surface-200 text-sm ml-2">— AI Career Platform</span>
            </div>
            <div className="text-sm text-surface-200">
              © 2026 Nyamby. Built for Digdaya X Hackathon.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
