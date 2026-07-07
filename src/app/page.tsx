"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ─── Hooks ────────────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function useAnimatedCounter(end: number, duration = 1600, start = 0, decimals = 0) {
  const [value, setValue] = useState(start);
  const [started, setStarted] = useState(false);

  const begin = useCallback(() => {
    if (started) return;
    setStarted(true);
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start, started]);

  return { value: decimals ? value.toFixed(decimals) : Math.round(value).toString(), begin };
}

/* ─── Animation wrapper ────────────────────────────────────────── */

function AnimateIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Hero mascot showcase — floating insight cards ────────────── */

function HeroMascotShowcase() {
  const { ref, visible } = useInView(0.25);
  const matchScore = useAnimatedCounter(92, 1600, 0);

  useEffect(() => {
    if (visible) matchScore.begin();
  }, [visible, matchScore]);

  const skills = [
    { label: "TypeScript", pct: 88, color: "bg-primary-500" },
    { label: "UI Testing", pct: 72, color: "bg-primary-400" },
    { label: "Data Mgmt", pct: 60, color: "bg-amber-400" },
  ];

  return (
    <div ref={ref} className="relative w-full max-w-[540px] aspect-square mx-auto">
      {/* Mascot */}
      <Image
        src="/images/hero-mascot.png"
        alt="Nambi — maskot Nyamby yang siap membantu kariermu"
        width={430}
        height={430}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[74%] h-auto object-contain drop-shadow-2xl animate-float"
        priority
      />

      {/* Career Growth card */}
      <div
        className="card absolute top-2 right-0 w-44 p-3.5 shadow-lg animate-float"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-surface-700 inline-flex items-center gap-1">
            <Icon name="trendingUp" size={12} className="text-primary-600" />
            Career Growth
          </span>
          <span className="text-[11px] font-bold text-emerald-600">+60%</span>
        </div>
        <svg viewBox="0 0 150 40" className="w-full h-9" aria-hidden="true">
          <path
            d="M 4 34 C 30 32, 45 26, 70 22 C 100 17, 120 12, 146 6"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 4 34 C 30 32, 45 26, 70 22 C 100 17, 120 12, 146 6 L 146 40 L 4 40 Z"
            fill="url(#growthFill)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Match Score card */}
      <div
        className="card absolute left-0 top-[38%] w-40 p-3.5 shadow-lg animate-float"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="text-[10px] text-surface-400 mb-0.5 inline-flex items-center gap-1">
          <Icon name="target" size={11} className="text-emerald-600" />
          Match Score
        </div>
        <div className="text-2xl font-extrabold text-surface-900 tabular-nums mb-1.5">
          {visible ? matchScore.value : "0"}%
        </div>
        <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
          {visible && <div className="h-full rounded-full bg-emerald-500 bar-grow" style={{ width: "92%" }} />}
        </div>
      </div>

      {/* Skill Insight card */}
      <div
        className="card absolute right-0 bottom-6 w-48 p-3.5 shadow-lg animate-float"
        style={{ animationDelay: "1.8s" }}
      >
        <div className="text-[11px] font-semibold text-surface-700 mb-2 inline-flex items-center gap-1">
          <Icon name="info" size={12} className="text-primary-600" />
          Skill Insight
        </div>
        <div className="space-y-2">
          {skills.map((s, i) => (
            <div key={s.label}>
              <div className="flex justify-between text-[10px] text-surface-400 mb-0.5">
                <span>{s.label}</span>
                <span className="font-semibold text-surface-600">{s.pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-surface-100 overflow-hidden">
                {visible && (
                  <div
                    className={`h-full rounded-full ${s.color} bar-grow`}
                    style={{ width: `${s.pct}%`, animationDelay: `${i * 180}ms` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const rating = useAnimatedCounter(4.9, 1800, 0, 1);
  const talents = useAnimatedCounter(500, 1600, 0);
  const accuracy = useAnimatedCounter(95, 1400, 0);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          rating.begin();
          talents.begin();
          accuracy.begin();
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rating, talents, accuracy]);

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Show floating CTA after hero
  useEffect(() => {
    const onScroll = () => setShowFloatingCta(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAFAF8] text-slate-900 font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded-lg focus:shadow-lg"
      >
        Skip to content
      </a>

      <Navbar />

      {/* ─── Hero — clean white, mascot with floating insight cards ── */}
      <section
        id="main-content"
        className="relative pt-32 pb-16 lg:pt-36 lg:pb-24 px-6"
      >
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-7 z-10">
            <AnimateIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                <Icon name="spark" size={13} className="text-primary-600" />
                AI Career Companion #1 di Indonesia
              </div>
            </AnimateIn>

            <AnimateIn delay={100}>
              <h1 className="text-5xl lg:text-[64px] font-extrabold leading-[1.08] tracking-tight text-slate-900">
                Nyambungin Skill, <br />
                <span className="text-primary-600">
                  Nyambungin <br className="hidden lg:block" />
                  Masa Depan.
                </span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={200}>
              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                AI Career Companion yang membantu talenta Indonesia menemukan
                peluang terbaik, mengembangkan skill, dan bertumbuh lebih tinggi.
              </p>
            </AnimateIn>

            <AnimateIn delay={300}>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/register"
                  className="btn-primary group flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-all hover:shadow-xl hover:shadow-primary-500/40 active:translate-y-0"
                >
                  Mulai Perjalanan
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/how-it-works"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <Icon name="eye" size={16} className="text-primary-600" />
                  Lihat Demo
                </Link>
              </div>
            </AnimateIn>

            {/* Stats row */}
            <AnimateIn delay={400}>
              <div ref={statsRef} className="flex items-center gap-8 pt-6 flex-wrap">
                <div className="cursor-default">
                  <div className="flex items-center gap-1 text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="star" size={15} fill="currentColor" />
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {statsVisible ? rating.value : "0"}
                    </span>{" "}
                    <span className="text-slate-500">rating</span>
                  </div>
                </div>

                <div className="cursor-default">
                  <div className="text-primary-600 mb-1">
                    <Icon name="users" size={17} />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {statsVisible ? talents.value : "0"}+
                    </span>{" "}
                    <span className="text-slate-500">talent</span>
                  </div>
                </div>

                <div className="cursor-default">
                  <div className="text-emerald-500 mb-1">
                    <Icon name="target" size={17} />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {statsVisible ? accuracy.value : "0"}%
                    </span>{" "}
                    <span className="text-slate-500">match accuracy</span>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>

          {/* Right: mascot with floating cards */}
          <AnimateIn delay={200} className="relative z-10">
            <HeroMascotShowcase />
          </AnimateIn>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────── */}
      <section id="cara-kerja" className="py-24 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <AnimateIn>
            <div className="grid lg:grid-cols-[auto_1fr_1fr] items-center gap-8 lg:gap-12 mb-14">
              <div className="w-44 h-44 lg:w-56 lg:h-56 shrink-0 mx-auto lg:mx-0">
                <Image
                  src="/images/how-it-works-mascot.png"
                  alt="Nambi punya ide"
                  width={224}
                  height={224}
                  className="w-full h-full object-contain drop-shadow-xl animate-float"
                />
              </div>

              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 text-xs font-semibold text-surface-600 mb-4">
                  <Icon name="spark" size={12} /> How it works
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Nambi Punya{" "}
                  <span className="text-primary-600">Jawabannya.</span>
                </h2>
              </div>

              <p className="text-slate-500 text-lg text-center lg:text-left max-w-sm mx-auto lg:mx-0">
                Empat langkah sederhana untuk membawa karier kamu ke level
                berikutnya. Nambi mendampingi dari hari pertama.
              </p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Cari Peluang",
                desc: "AI mencocokkan skill dengan peluang terbaik.",
                image: "/images/icon-target-3d.png",
              },
              {
                title: "Cari Arah",
                desc: "AI menganalisis skill dan memberi rekomendasi.",
                image: "/images/icon-brain-3d.png",
              },
              {
                title: "Bertumbuh",
                desc: "Pantau perkembangan karier real-time.",
                image: "/images/icon-chart-3d.png",
              },
              {
                title: "Aman & Terpercaya",
                desc: "Sistem verifikasi dan escrow.",
                image: "/images/icon-shield-3d.png",
              },
            ].map((feature, i) => (
              <AnimateIn key={i} delay={i * 120}>
                <div className="card card-hover p-8 h-full cursor-default group">
                  <div className="w-20 h-20 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Matching ────────────────────────────────────────── */}
      <section id="ai-matching" className="py-24 px-6 bg-[#FAFAF8]">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn className="space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <Icon name="ai" className="text-primary-600" size={12} />{" "}
              AI Matching
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              AI Matching <br />
              yang{" "}
              <span className="text-primary-600">Mengerti Kamu</span>
            </h2>

            <p className="text-slate-500 text-lg max-w-md">
              Bukan sekadar keyword matching. Nyamby memahami pengalaman, skill,
              dan tujuan karier.
            </p>

            <ul className="space-y-4">
              {[
                "Memahami konteks dari CV dan portofolio",
                "Memberi alasan kenapa kamu cocok",
                "Rekomendasi skill yang perlu ditingkatkan",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Icon name="check" size={12} />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                href="/register"
                className="btn-primary group px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-all hover:shadow-xl hover:shadow-primary-500/40 inline-flex items-center gap-2"
              >
                Coba Gratis
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </AnimateIn>

          <AnimateIn delay={150} className="relative flex justify-center">
            <div className="relative w-full max-w-[460px]">
              <Image
                src="/images/ai-matching-mascot.png"
                alt="Nambi menunjukkan hasil AI Matching di ponsel"
                width={460}
                height={575}
                className="w-full h-auto object-contain drop-shadow-2xl animate-float"
              />
              <div
                className="card absolute top-8 left-0 px-4 py-3 shadow-lg animate-float flex items-center gap-2"
                style={{ animationDelay: "1s" }}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Icon name="check" size={14} />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-surface-900 leading-none">92% Match!</div>
                  <div className="text-[10px] text-surface-400 mt-0.5">Frontend Developer</div>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── Cerita di Balik Nyamby ─────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Cerita di Balik{" "}
              <span className="text-primary-600">Nyamby</span>
            </h2>

            <div className="space-y-4 text-slate-500 leading-relaxed">
              <p>
                Berawal dari Bandar Lampung, kami melihat{" "}
                <strong className="text-slate-800 font-semibold">
                  banyak talenta berbakat yang kesulitan menemukan peluang kerja
                  yang sesuai
                </strong>
                , sementara banyak individu dan bisnis membutuhkan bantuan untuk
                menyelesaikan berbagai pekerjaan.
              </p>
              <p>
                Di tengah berkembangnya{" "}
                <strong className="text-slate-800 font-semibold">
                  pekerjaan remote, freelance, part-time, hingga layanan berbasis
                  tugas harian
                </strong>
                , kami melihat kebutuhan akan platform yang mampu mempertemukan
                keduanya secara lebih mudah dan terpercaya.
              </p>
              <p>
                Nyamby hadir sebagai jembatan antara talenta dan peluang,
                membantu siapa pun menemukan pekerjaan, proyek, maupun bantuan
                yang mereka butuhkan — mulai dari kebutuhan personal hingga
                profesional.
              </p>
            </div>

            <blockquote className="card p-6 text-sm text-slate-600 italic leading-relaxed space-y-3">
              <p>
                &ldquo;Kami percaya bahwa kesempatan tidak seharusnya dibatasi
                oleh lokasi, gelar, atau koneksi. Setiap orang berhak
                mendapatkan peluang untuk bekerja, berkembang, dan
                menghasilkan.
              </p>
              <p>
                Nyamby hadir untuk mempertemukan mereka yang membutuhkan bantuan
                dengan mereka yang memiliki kemampuan untuk membantu.&rdquo;
              </p>
            </blockquote>
          </AnimateIn>

          <AnimateIn delay={150} className="flex justify-center">
            <Image
              src="/images/cerita-mascot.png"
              alt="Nambi dengan ide cerita Nyamby"
              width={440}
              height={440}
              className="w-full max-w-[440px] h-auto object-contain drop-shadow-2xl animate-float"
            />
          </AnimateIn>
        </div>
      </section>

      {/* ─── Final CTA — blue gradient ──────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-500 via-primary-600 to-primary-800 text-white">
        <div className="max-w-[1280px] mx-auto px-6 py-24 lg:py-28 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <AnimateIn className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Dari{" "}
              <span className="text-amber-300">Nyambi</span>
              <br />
              Menjadi Karier.
            </h2>
            <p className="text-primary-100 text-lg max-w-sm">
              Mulai perjalananmu bersama Nambi hari ini. Gratis, tanpa kartu
              kredit.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href="/register"
                className="group bg-white text-primary-700 hover:bg-primary-50 px-7 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 inline-flex items-center gap-2"
              >
                Daftar Gratis
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/how-it-works"
                className="px-7 py-3.5 rounded-full font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-all inline-flex items-center gap-2"
              >
                <Icon name="eye" size={16} />
                Lihat Demo
              </Link>
            </div>
          </AnimateIn>

          <AnimateIn delay={200}>
            <div className="relative flex justify-center lg:justify-end">
              <Image
                src="/images/cta-mascot.png"
                alt="Nambi mengajak bergabung dengan Nyamby"
                width={460}
                height={460}
                className="w-full max-w-[460px] h-auto object-contain drop-shadow-2xl animate-float"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />

      {/* Back-to-top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <Icon name="chevronDown" size={20} className="rotate-180 text-slate-600" />
      </button>

      {/* Floating CTA */}
      <Link
        href="/register"
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-primary-700 ${
          showFloatingCta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Icon name="spark" size={18} />
        <span className="text-sm font-bold hidden sm:inline">Mulai Gratis</span>
        <Icon name="arrowRight" size={16} />
      </Link>
    </div>
  );
}
