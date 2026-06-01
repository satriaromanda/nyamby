"use client";

import Link from "next/link";

import { Icon, Logo } from "@/components/icons";

export default function LandingPage() {

  return (
    <div className="min-h-screen overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded-lg focus:shadow-lg">Skip to content</a>
      {/* ─── Navigation ─────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200" role="navigation" aria-label="Main navigation">
        <div className="max-w-[1280px] mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={36} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
              Fitur
            </a>
            <Link href="/how-it-works" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
              Cara Kerja
            </Link>
            <Link href="/talents" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
              Browse Talenta
            </Link>
            <Link href="/jobs" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
              Browse Jobs
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-surface-500 hover:text-surface-900 transition-colors px-4 py-2"
            >
              Masuk
            </Link>
            <Link href="/register" className="btn-primary text-sm inline-flex items-center gap-1.5">
              <Icon name="spark" size={14} />
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section id="main-content" className="relative overflow-hidden min-h-screen flex items-center" style={{ background: "#F8FAFC" }}>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, #BFDBFE 0%, transparent 70%)" }} />
          <div className="absolute top-40 -right-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-50"
            style={{ background: "radial-gradient(circle, #DBEAFE 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, #FEF3C7 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 text-sm" style={{ color: "#0F172A", fontWeight: 600, fontSize: 16 }}>
              <span className="w-2 h-2 rounded-full bg-green-500" />
              AI Career Companion #1 di Indonesia
            </div>

            <h1 className="mt-8" style={{ color: "#0F172A" }}>
              <span className="block" style={{ fontSize: 64, lineHeight: "76px", fontWeight: 800, letterSpacing: "-1.44px" }}>
                Nyambungin Skill,
              </span>
              <span className="block" style={{ fontSize: 88, lineHeight: "103px", fontWeight: 800, letterSpacing: "-1.97px", background: "linear-gradient(135deg, #12378C 0%, #0054F8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Nyambungin Masa Depan.
              </span>
            </h1>

            <p className="mt-7 max-w-[560px]" style={{ fontSize: 20, lineHeight: "31px", color: "#475569", fontWeight: 400 }}>
              AI Career Companion yang membantu talenta Indonesia menemukan peluang
              terbaik, mengembangkan skill, dan bertumbuh lebih tinggi.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/register?role=talent" className="btn-primary text-base inline-flex items-center gap-2 group">
                Mulai Perjalanan
                <Icon name="arrowRight" size={20} />
              </Link>
              <Link href="/register?role=client" className="btn-secondary text-base">
                Cari Talenta / Post Job
              </Link>
              <Link href="/talents" className="btn-secondary text-base">
                Browse Talenta
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
                  <div className="text-xs text-surface-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual — AI Matching Card */}
          <div className="hidden lg:block animate-slide-in-right" style={{ animationDelay: "0.3s" }}
          >
            <div className="relative">
              <div className="absolute -inset-4 gradient-glow rounded-3xl" />
              <div className="relative glass rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-200">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-white">
                    <Icon name="ai" size={20} /></div>
                  <div>
                    <div className="font-semibold text-sm text-surface-900">AI Job Matching</div>
                    <div className="text-xs text-surface-400">Powered by GPT-4o</div>
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                    AI Live
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
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-100 transition-colors"
                    style={{ animationDelay: `${0.5 + i * 0.2}s` }}
                  >
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white">
                      {talent.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-surface-900">{talent.name}</div>
                      <div className="text-xs text-surface-400">{talent.role}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${talent.score >= 80 ? "text-accent-600" : "text-primary-600"}`}>
                        {talent.score}%
                      </div>
                      <div className="text-[10px] text-surface-400 uppercase tracking-wide">match</div>
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-surface-200 text-center">
                  <span className="inline-flex items-center justify-center gap-1 text-xs text-surface-400"><Icon name="spark" size={13} />3 talenta dievaluasi dalam 2.3 detik</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ───────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-surface-900" style={{ fontFamily: "Outfit" }}>
              Dua Dimensi, Satu <span className="gradient-text">Platform</span>
            </h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              Nyamby melayani kedua sisi pasar — talenta yang mencari peluang dan
              klien yang membutuhkan keahlian terbaik.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Talent Side */}
            <div className="glass rounded-xl p-8 card-hover">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-2xl mb-6">
                <Icon name="user" className="text-primary-600" size={28} /></div>
              <h3 className="text-2xl font-bold mb-3 text-surface-900" style={{ fontFamily: "Outfit" }}>
                Untuk Talenta
              </h3>
              <p className="text-surface-500 mb-6">
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
                    <Icon name="check" className="text-accent-600 mt-0.5 shrink-0" size={15} />
                    <span className="text-surface-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Side */}
            <div className="glass rounded-xl p-8 card-hover">
              <div className="w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center text-2xl mb-6">
                <Icon name="target" className="text-accent-600" size={28} /></div>
              <h3 className="text-2xl font-bold mb-3 text-surface-900" style={{ fontFamily: "Outfit" }}>
                Untuk Client
              </h3>
              <p className="text-surface-500 mb-6">
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
                    <Icon name="check" className="text-accent-600 mt-0.5 shrink-0" size={15} />
                    <span className="text-surface-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-surface-900" style={{ fontFamily: "Outfit" }}>
              Cara Kerja
            </h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              3 langkah simple untuk memulai journey-mu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Daftar & Isi Profil",
                desc: "Pilih role-mu (Talenta atau Client), buat akun, dan lengkapi profilmu.",
                icon: "file" as const,
                color: "from-primary-500/10 to-primary-600/5",
              },
              {
                step: "02",
                title: "AI Bekerja Untukmu",
                desc: "Untuk talenta: AI analisis skill gap-mu. Untuk client: AI matching talent pool otomatis.",
                icon: "ai" as const,
                color: "from-primary-500/10 to-primary-600/5",
              },
              {
                step: "03",
                title: "Mulai Berkolaborasi",
                desc: "Terima job, kerjakan project, dan terima pembayaran melalui escrow yang aman.",
                icon: "shield" as const,
                color: "from-accent-500/10 to-accent-600/5",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-surface-200 to-transparent -translate-x-8" />
                )}
                <div className="glass rounded-xl p-8 card-hover h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-6`}>
                    <Icon name={item.icon} size={30} />
                  </div>
                  <div className="text-xs text-primary-600 font-semibold mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold mb-3 text-surface-900" style={{ fontFamily: "Outfit" }}>{item.title}</h3>
                  <p className="text-surface-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Power Section ───────────────────────────────────── */}
      <section id="ai-power" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-600 mb-6">
              <Icon name="spark" size={14} /> Powered by GPT-4o
            </div>
            <h2 className="text-4xl font-bold mb-4 text-surface-900" style={{ fontFamily: "Outfit" }}>
              AI yang <span className="gradient-text">Benar-benar Bekerja</span>
            </h2>
            <p className="text-surface-500 max-w-2xl mx-auto">
              Bukan hanya buzzword. AI kami menganalisis skill, mencocokkan dengan demand pasar,
              dan memberikan rekomendasi yang actionable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Matching Card */}
            <div className="glass rounded-xl p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
                <Icon name="target" className="text-primary-600" size={20} /> AI Job Matching
              </h3>
              <p className="text-surface-500 text-sm mb-6">
                Setiap job yang dipost, AI mengevaluasi seluruh talent pool dan menghasilkan ranked shortlist.
              </p>
              <div className="bg-surface-50 rounded-xl p-4 space-y-3 border border-surface-200">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Input</span>
                  <span className="text-primary-600">Required Skills + Talent Pool</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Output</span>
                  <span className="text-accent-600">Match Score + Reasoning</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Latency</span>
                  <span className="text-surface-900 font-medium">&lt; 3 detik</span>
                </div>
              </div>
            </div>

            {/* Skill Gap Card */}
            <div className="glass rounded-xl p-8">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-surface-900" style={{ fontFamily: "Outfit" }}>
                <Icon name="chart" className="text-primary-600" size={20} /> AI Skill Gap Analysis
              </h3>
              <p className="text-surface-500 text-sm mb-6">
                AI menganalisis skill talenta vs demand pasar dan memberikan 3 rekomendasi skill prioritas.
              </p>
              <div className="bg-surface-50 rounded-xl p-4 space-y-3 border border-surface-200">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Input</span>
                  <span className="text-primary-600">Current Skills + Market Data</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Output</span>
                  <span className="text-accent-600">3 Rekomendasi + Impact</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Accuracy</span>
                  <span className="text-surface-900 font-medium">Based on real demand</span>
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
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-surface-900" style={{ fontFamily: "Outfit" }}>
            Siap Bertransisi dari{" "}
            <span className="gradient-text">Nyambi ke Pro</span>?
          </h2>
          <p className="text-lg text-surface-500 mb-10 max-w-2xl mx-auto">
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
      <footer className="bg-white border-t border-surface-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo height={32} />
              <span className="text-surface-400 text-sm ml-2">— AI Career Platform</span>
            </div>
            <div className="text-sm text-surface-400">
              © 2026 Nyamby. Built for Digdaya X Hackathon.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
