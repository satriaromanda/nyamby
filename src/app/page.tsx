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

function useTypingEffect(phrases: string[], typingSpeed = 80, deletingSpeed = 50, pause = 2000) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === current) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    } else {
      const delta = isDeleting ? deletingSpeed : typingSpeed;
      timer = setTimeout(() => {
        setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1));
      }, delta);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pause]);

  return text;
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

/* ─── Page ─────────────────────────────────────────────────────── */

/* ─── Latest Jobs (PRD v5.3 §6.9 — job-portal feel) ─────────────── */

interface HomeJob {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  required_skills: { name: string; is_mandatory: boolean }[];
  client: { full_name: string; company_name: string | null };
}

function LatestJobs() {
  const [jobs, setJobs] = useState<HomeJob[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/jobs?per_page=6&status=active")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setJobs(d.data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Graceful: hide entire section when no jobs (fresh DB / API error)
  if (loaded && jobs.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <AnimateIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 mb-4">
              <Icon name="briefcase" size={12} /> Job Terbaru
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              Peluang yang baru{" "}
              <span className="text-primary-600">dibuka</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Project nyata dari client terverifikasi — langsung lamar dengan bantuan AI match.
            </p>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {!loaded
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-48 rounded-2xl" />
              ))
            : jobs.map((job, i) => (
                <AnimateIn key={job.id} delay={i * 80}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block h-full bg-[#FAFAF8] rounded-2xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 font-medium">
                        {job.category === "web_dev" ? "Web Development" : "Graphic Design"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      {job.client.company_name || job.client.full_name}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.required_skills.slice(0, 3).map((s, si) => (
                        <span
                          key={si}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
                        >
                          {s.name}
                        </span>
                      ))}
                      {job.required_skills.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                          +{job.required_skills.length - 3}
                        </span>
                      )}
                    </div>
                    {job.budget_max && (
                      <p className="text-sm font-bold text-slate-900">
                        Rp {Number(job.budget_min || 0).toLocaleString("id-ID")} –{" "}
                        {Number(job.budget_max).toLocaleString("id-ID")}
                      </p>
                    )}
                  </Link>
                </AnimateIn>
              ))}
        </div>

        <AnimateIn>
          <div className="text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Lihat Semua Job
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const rating = useAnimatedCounter(4.9, 1800, 0, 1);
  const talents = useAnimatedCounter(500, 1600, 0);
  const accuracy = useAnimatedCounter(95, 1400, 0);
  const projects = useAnimatedCounter(1200, 2000, 0);

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
          projects.begin();
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rating, talents, accuracy, projects]);

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

  const typedText = useTypingEffect([
    "peluang terbaik.",
    "karier impian.",
    "skill yang tepat.",
    "masa depan cerah.",
  ]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAFAF8] text-slate-900 font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded-lg focus:shadow-lg"
      >
        Skip to content
      </a>

      <Navbar />

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section
        id="main-content"
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-6 overflow-hidden"
      >
        {/* Animated background orbs */}
        <div className="absolute top-20 -left-32 w-96 h-96 bg-primary-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 z-10">
            <AnimateIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                AI Career Companion #1 di Indonesia
              </div>
            </AnimateIn>

            <AnimateIn delay={100}>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                Nyambungin Skill, <br />
                <span className="text-primary-600">
                  Nyambungin <br className="hidden lg:block" />
                  Masa Depan.
                </span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={200}>
              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                AI Career Companion yang membantu talenta Indonesia menemukan{" "}
                <span className="inline-block min-w-[180px]">
                  <span className="text-primary-600 font-semibold border-b-2 border-primary-300">
                    {typedText}
                    <span className="animate-pulse text-primary-400">|</span>
                  </span>
                </span>
              </p>
            </AnimateIn>

            <AnimateIn delay={300}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="btn-primary group flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-all hover:shadow-xl hover:shadow-primary-500/40 active:translate-y-0"
                >
                  Mulai Perjalanan
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </AnimateIn>

            {/* Stats row */}
            <AnimateIn delay={400}>
              <div
                ref={statsRef}
                className="flex items-center gap-8 pt-8 flex-wrap"
              >
                <div className="group cursor-default">
                  <div className="flex items-center gap-1 text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="inline-block transition-transform group-hover:scale-110"
                        style={{ transitionDelay: `${i * 50}ms` }}
                      >
                        <Icon name="star" size={16} fill="currentColor" />
                      </span>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {statsVisible ? rating.value : "0"}
                    </span>{" "}
                    <span className="text-slate-500">rating</span>
                  </div>
                </div>

                <div className="group cursor-default">
                  <div className="text-primary-600 mb-1 transition-transform group-hover:scale-110">
                    <Icon name="user" size={18} />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {statsVisible ? talents.value : "0"}+
                    </span>{" "}
                    <span className="text-slate-500">talent</span>
                  </div>
                </div>

                <div className="group cursor-default">
                  <div className="text-emerald-500 mb-1 transition-transform group-hover:scale-110">
                    <Icon name="target" size={18} />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {statsVisible ? accuracy.value : "0"}%
                    </span>{" "}
                    <span className="text-slate-500">match accuracy</span>
                  </div>
                </div>

                <div className="group cursor-default">
                  <div className="text-amber-500 mb-1 transition-transform group-hover:scale-110">
                    <Icon name="briefcase" size={18} />
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {statsVisible ? projects.value : "0"}+
                    </span>{" "}
                    <span className="text-slate-500">projects</span>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>

          {/* Right Mascot Image */}
          <AnimateIn delay={200} className="relative flex justify-center lg:justify-end z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-400/20 rounded-full blur-[80px] -z-10" />
            <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
              <Image
                src="/images/hero-mascot.png"
                alt="Nyamby \u2014 AI mascot yang siap membantu karier kamu"
                width={600}
                height={600}
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-float"
                priority
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── How It Works Section ───────────────────────────────── */}
      <section id="cara-kerja" className="py-24 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <AnimateIn>
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
              <div className="w-48 h-48 lg:w-64 lg:h-64 shrink-0 flex items-center justify-center relative">
                <Image
                  src="/images/how-it-works-mascot.png"
                  alt="Nyamby Idea"
                  width={256}
                  height={256}
                  className="w-full h-full object-contain relative z-10 drop-shadow-xl"
                />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 mb-4">
                  <Icon name="spark" size={12} /> How it works
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
                  Nyamby Punya{" "}
                  <br className="hidden lg:block" />
                  <span className="text-primary-600">Jawabannya.</span>
                </h2>
                <p className="text-slate-500 text-lg max-w-md">
                  Empat langkah sederhana untuk membawa karier kamu ke level
                  berikutnya. Nyamby mendampingi dari hari pertama.
                </p>
              </div>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Cari Peluang",
                desc: "AI mencocokkan skill dengan peluang terbaik.",
                image: "/images/icon-target-3d.png",
                color: "from-blue-500/10 to-transparent",
              },
              {
                title: "Cari Arah",
                desc: "AI menganalisis skill dan memberi rekomendasi.",
                image: "/images/icon-brain-3d.png",
                color: "from-purple-500/10 to-transparent",
              },
              {
                title: "Bertumbuh",
                desc: "Pantau perkembangan karier real-time.",
                image: "/images/icon-chart-3d.png",
                color: "from-emerald-500/10 to-transparent",
              },
              {
                title: "Aman & Terpercaya",
                desc: "Sistem verifikasi dan escrow.",
                image: "/images/icon-shield-3d.png",
                color: "from-amber-500/10 to-transparent",
              },
            ].map((feature, i) => (
              <AnimateIn key={i} delay={i * 120}>
                <div className="group relative bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-default">
                  {/* Hover gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}
                  />
                  <div className="relative z-10">
                    <div className="w-[88px] h-[88px] mb-6 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={88}
                        height={88}
                        className="w-full h-full object-contain relative z-10"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Matching Section ────────────────────────────────── */}
      <section id="ai-matching" className="py-24 px-6 bg-[#FAFAF8]">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn className="order-2 lg:order-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <Icon name="link" className="text-primary-600" size={12} />{" "}
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
                "Memberi ulasan kenapa kamu cocok",
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

            <div className="pt-4">
              <Link
                href="/register"
                className="btn-primary group px-8 py-3 rounded-full shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-all hover:shadow-xl hover:shadow-primary-500/40 inline-flex items-center gap-1.5"
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

          <AnimateIn delay={150} className="order-1 lg:order-2 flex justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-400/20 rounded-full blur-[60px] -z-10" />
            <div className="w-full max-w-[500px] aspect-[4/5] flex items-center justify-center relative">
              <Image
                src="/images/ai-matching-mascot.png"
                alt="Nyamby AI Matching"
                width={500}
                height={625}
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-float"
              />
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── Latest Jobs Section (PRD v5.3 §6.9) ────────────────── */}
      <LatestJobs />

      {/* ─── Testimonials Section ───────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <AnimateIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 mb-4">
                <Icon name="users" size={12} /> Testimoni
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
                Mereka Sudah{" "}
                <span className="text-primary-600">Merasakan</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto">
                Cerita nyata dari talenta yang sudah bergabung dengan Nyamby.
              </p>
            </div>
          </AnimateIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Rizky Pratama",
                role: "Frontend Developer",
                avatar: "RP",
                color: "bg-blue-500",
                quote:
                  "Dalam 2 minggu setelah daftar, saya langsung dapat 3 interview. AI matching-nya really works — skill React saya langsung cocok dengan project yang dicari.",
                rating: 5,
              },
              {
                name: "Siti Nurhaliza",
                role: "UI/UX Designer",
                avatar: "SN",
                color: "bg-pink-500",
                quote:
                  "Fitur Skill Gap Analysis membantu saya sadar kalau saya perlu belajar Figma. Sekarang saya sudah punya 5 klien tetap lewat platform ini.",
                rating: 5,
              },
              {
                name: "Budi Santoso",
                role: "Fullstack Developer",
                avatar: "BS",
                color: "bg-emerald-500",
                quote:
                  "Escrow payment bikin saya merasa aman. Dulu sering ditipu client, sekarang semua transaksi terlindungi. Game changer banget.",
                rating: 5,
              },
            ].map((t, i) => (
              <AnimateIn key={i} delay={i * 120}>
                <div className="group bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col cursor-default">
                  {/* Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Icon key={j} name="star" size={14} fill="currentColor" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div
                      className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────────────── */}
      <section className="bg-primary-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-800 rounded-full blur-[80px] opacity-50 translate-y-1/3 -translate-x-1/4" aria-hidden="true" />

        <div className="max-w-[1280px] mx-auto px-6 py-24 lg:py-32 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <AnimateIn className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Dari{" "}
              <span className="text-amber-400">Nyambi</span>
              <br />
              Menjadi Karier.
            </h2>
            <p className="text-primary-100 text-lg max-w-sm">
              Mulai perjalananmu bersama Nyamby hari ini. Gratis, tanpa kartu
              kredit.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/register"
                className="group bg-white text-primary-700 hover:bg-slate-50 px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 inline-flex items-center gap-1.5"
              >
                Daftar Gratis
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </AnimateIn>

          <AnimateIn delay={200}>
            <div className="relative flex justify-center lg:justify-end h-full min-h-[400px]">
              <Image
                src="/images/cta-mascot.png"
                alt="Nambi CTA"
                width={500}
                height={500}
                className="w-full max-w-[500px] h-auto object-contain relative z-10 drop-shadow-2xl lg:absolute lg:-bottom-24 animate-float"
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
