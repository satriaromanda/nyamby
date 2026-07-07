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

/* ─── Hero: live AI-match demo ─────────────────────────────────── */

function HeroMatchDemo() {
  const { ref, visible } = useInView(0.3);
  const score = useAnimatedCounter(92, 1800, 0);

  useEffect(() => {
    if (visible) score.begin();
  }, [visible, score]);

  return (
    <div ref={ref} className="relative w-full max-w-[560px] aspect-square mx-auto">
      {/* Mascot behind */}
      <Image
        src="/images/hero-mascot.png"
        alt="Nyamby — AI mascot yang siap membantu karier kamu"
        width={420}
        height={420}
        className="absolute right-0 bottom-0 w-[68%] h-auto object-contain opacity-90 animate-float"
        priority
      />

      {/* Animated beam connecting the two cards */}
      <svg
        viewBox="0 0 560 560"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <path
          d="M 170 130 C 300 170, 260 360, 400 420"
          fill="none"
          stroke="url(#beamGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="beam-path"
        />
      </svg>

      {/* Job mini card */}
      <div className="card p-4 absolute top-4 left-0 w-60 -rotate-2 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:rotate-0">
        <div className="flex items-center justify-between mb-2">
          <span className="chip !bg-ai-50 !text-ai-600">Web Dev</span>
          <span className="text-[10px] text-surface-400">2 jam lalu</span>
        </div>
        <div className="text-sm font-bold text-surface-900 mb-1">Landing Page UMKM</div>
        <div className="text-xs text-surface-500 mb-2">PT Maju Digital · Remote</div>
        <div className="text-sm font-bold text-surface-900">Rp 3.5jt – 5jt</div>
      </div>

      {/* Talent mini card */}
      <div className="card p-4 absolute bottom-6 right-2 w-60 rotate-2 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:rotate-0">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/images/satria.jpg"
            alt="Talent Nyamby"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="text-sm font-bold text-surface-900">Satria R.</div>
            <div className="text-[10px] text-surface-400">Frontend Developer</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="chip">React</span>
          <span className="chip">Next.js</span>
          <span className="chip">Tailwind</span>
        </div>
      </div>

      {/* Match score badge on the beam */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white border border-ai-100 rounded-2xl shadow-xl shadow-primary-500/20 px-5 py-3 text-center">
          <div className="flex items-center gap-1.5 justify-center text-primary-600 mb-0.5">
            <Icon name="ai" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Match</span>
          </div>
          <div className="text-3xl font-extrabold text-surface-900 tabular-nums leading-none">
            {visible ? score.value : "0"}%
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Trust marquee ────────────────────────────────────────────── */

const marqueeItems = [
  { icon: "shield" as const, label: "Escrow payment aman" },
  { icon: "ai" as const, label: "95% match accuracy" },
  { icon: "user" as const, label: "500+ talenta terverifikasi" },
  { icon: "briefcase" as const, label: "1.200+ project selesai" },
  { icon: "code" as const, label: "Web Development" },
  { icon: "design" as const, label: "UI/UX & Graphic Design" },
  { icon: "target" as const, label: "Skill Gap Analysis" },
  { icon: "trendingUp" as const, label: "Career Path AI" },
];

function TrustMarquee() {
  return (
    <div className="bg-white border-y border-surface-100 py-5 overflow-hidden pause-on-hover">
      <div className="marquee-track gap-4 pr-4">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-50 border border-surface-100 text-sm text-surface-600 whitespace-nowrap"
          >
            <Icon name={item.icon} size={14} className="text-primary-600" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── How it works: auto-advancing steps ───────────────────────── */

const steps = [
  {
    title: "Buat profil & upload portfolio",
    desc: "AI membaca CV dan portfolio-mu untuk memetakan skill secara otomatis.",
    image: "/images/icon-target-3d.png",
  },
  {
    title: "AI mencarikan match terbaik",
    desc: "Bukan keyword matching — AI memahami konteks pengalaman dan tujuan kariermu.",
    image: "/images/icon-brain-3d.png",
  },
  {
    title: "Kerjakan project dengan escrow",
    desc: "Dana klien ditahan aman dan baru dirilis setelah hasil kerjamu disetujui.",
    image: "/images/icon-shield-3d.png",
  },
  {
    title: "Bertumbuh jadi karier",
    desc: "Skill gap analysis dan career path AI memandu langkah berikutnya.",
    image: "/images/icon-chart-3d.png",
  },
];

function HowItWorks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((a) => (a + 1) % steps.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="cara-kerja" className="py-24 px-6 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 text-xs font-semibold text-surface-600 mb-4">
              <Icon name="spark" size={12} /> Cara kerja
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-surface-900 leading-tight tracking-tight mb-3">
              Dari daftar sampai{" "}
              <span className="text-primary-600">dibayar.</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-md mx-auto">
              Empat langkah — Nyamby mendampingi dari hari pertama.
            </p>
          </div>
        </AnimateIn>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps list */}
          <AnimateIn className="space-y-3">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                  active === i
                    ? "bg-white border-primary-200 shadow-lg shadow-primary-500/10"
                    : "bg-surface-50 border-transparent hover:border-surface-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                      active === i ? "bg-primary-600 text-white" : "bg-surface-200 text-surface-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold mb-1 ${active === i ? "text-surface-900" : "text-surface-600"}`}>
                      {step.title}
                    </div>
                    <div
                      className={`text-sm text-surface-500 overflow-hidden transition-all duration-300 ${
                        active === i ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {step.desc}
                    </div>
                    {active === i && (
                      <div className="mt-3 h-1 rounded-full bg-surface-100 overflow-hidden">
                        <div key={active} className="h-full w-full bg-primary-500 rounded-full bar-grow" style={{ animationDuration: "3.5s", animationTimingFunction: "linear" }} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </AnimateIn>

          {/* Visual crossfade */}
          <AnimateIn delay={150} className="relative flex justify-center">
            <div className="relative w-72 h-72 lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-primary-400/15 rounded-full blur-[70px]" />
              {steps.map((step, i) => (
                <Image
                  key={i}
                  src={step.image}
                  alt={step.title}
                  width={384}
                  height={384}
                  className={`absolute inset-0 w-full h-full object-contain drop-shadow-2xl transition-all duration-500 ${
                    active === i ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  }`}
                />
              ))}
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Bento feature grid ───────────────────────────────────────── */

function SkillGapBars() {
  const { ref, visible } = useInView(0.4);
  const bars = [
    { label: "React", width: "85%" },
    { label: "TypeScript", width: "60%" },
    { label: "Testing", width: "35%" },
  ];
  return (
    <div ref={ref} className="space-y-2.5">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="flex justify-between text-[10px] text-surface-400 mb-1">
            <span>{bar.label}</span>
            <span>{bar.width}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
            {visible && (
              <div
                className="h-full rounded-full bg-primary-500 bar-grow"
                style={{ width: bar.width, animationDelay: `${i * 150}ms` }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SmartPricingCounter() {
  const { ref, visible } = useInView(0.4);
  const price = useAnimatedCounter(8.5, 1600, 0, 1);
  useEffect(() => {
    if (visible) price.begin();
  }, [visible, price]);
  return (
    <div ref={ref} className="text-3xl font-extrabold text-surface-900 tabular-nums">
      Rp {visible ? price.value : "0"}jt<span className="text-sm font-medium text-surface-400">/project</span>
    </div>
  );
}

function BentoFeatures() {
  return (
    <section className="py-24 px-6 bg-[#FAFAF8]">
      <div className="max-w-[1280px] mx-auto">
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-surface-200 text-xs font-semibold text-surface-600 mb-4">
              <Icon name="ai" size={12} className="text-primary-600" /> Fitur
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-surface-900 leading-tight tracking-tight mb-3">
              Bukan sekadar <span className="text-primary-600">marketplace.</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-md mx-auto">
              AI career companion yang bekerja untukmu di setiap langkah.
            </p>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:auto-rows-[210px]">
          {/* AI Matching — big cell */}
          <AnimateIn className="md:col-span-2 lg:row-span-2">
            <Link href="/fitur/ai-matching" className="card card-hover p-7 flex flex-col h-full group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-ai-50 text-primary-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <Icon name="ai" size={22} />
                </div>
                <span className="badge-match">
                  <Icon name="ai" size={12} /> 95% akurat
                </span>
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">AI Job Matching</h3>
              <p className="text-sm text-surface-500 mb-5 max-w-sm">
                AI memahami CV, portfolio, dan tujuan kariermu — lalu menjelaskan kenapa kamu cocok.
              </p>
              <div className="mt-auto p-4 rounded-xl bg-primary-50 border border-primary-100">
                <div className="text-[10px] text-primary-600 font-bold mb-1 inline-flex items-center gap-1">
                  <Icon name="ai" size={11} /> AI INSIGHT
                </div>
                <p className="text-xs text-surface-600 leading-relaxed">
                  &ldquo;Pengalaman React 3 tahun + portfolio e-commerce kamu sangat relevan dengan project ini.
                  Highlight case study tokoku.id saat melamar.&rdquo;
                </p>
              </div>
            </Link>
          </AnimateIn>

          {/* Escrow */}
          <AnimateIn delay={100}>
            <Link href="/fitur/escrow" className="card card-hover p-6 flex flex-col h-full group">
              <div className="w-11 h-11 rounded-xl bg-action-50 text-action-500 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <Icon name="shield" size={22} />
              </div>
              <h3 className="font-bold text-surface-900 mb-1">Escrow Payment</h3>
              <p className="text-xs text-surface-500">
                Dana ditahan aman, dirilis setelah kerja disetujui. Tidak ada lagi klien kabur.
              </p>
            </Link>
          </AnimateIn>

          {/* Skill Gap */}
          <AnimateIn delay={150}>
            <Link href="/fitur/skill-gap" className="card card-hover p-6 flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-money-50 text-money-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <Icon name="target" size={22} />
                </div>
                <h3 className="font-bold text-surface-900">Skill Gap Analysis</h3>
              </div>
              <SkillGapBars />
            </Link>
          </AnimateIn>

          {/* Smart Pricing */}
          <AnimateIn delay={200}>
            <Link href="/fitur/career-path" className="card card-hover p-6 flex flex-col h-full group">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <Icon name="money" size={22} />
              </div>
              <h3 className="font-bold text-surface-900 mb-1">Smart Pricing</h3>
              <p className="text-xs text-surface-500 mb-2">Benchmark rate pasar untuk skill-mu.</p>
              <SmartPricingCounter />
            </Link>
          </AnimateIn>

          {/* Career Path */}
          <AnimateIn delay={250}>
            <Link href="/fitur/career-path" className="card card-hover p-6 flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-trust-50 text-trust-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <Icon name="trendingUp" size={22} />
                </div>
                <h3 className="font-bold text-surface-900">Career Path AI</h3>
              </div>
              <svg viewBox="0 0 200 60" className="w-full h-14" aria-hidden="true">
                <path
                  d="M 5 52 L 55 42 L 105 30 L 150 18 L 195 6"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="beam-path"
                />
              </svg>
              <p className="text-xs text-surface-500 mt-1">Dari nyambi pertama sampai karier profesional.</p>
            </Link>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials marquee ─────────────────────────────────────── */

const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Frontend Developer",
    avatar: "RP",
    color: "bg-blue-500",
    quote: "Dalam 2 minggu setelah daftar, saya langsung dapat 3 interview. AI matching-nya really works.",
  },
  {
    name: "Siti Nurhaliza",
    role: "UI/UX Designer",
    avatar: "SN",
    color: "bg-pink-500",
    quote: "Skill Gap Analysis bikin saya sadar perlu belajar Figma. Sekarang punya 5 klien tetap.",
  },
  {
    name: "Budi Santoso",
    role: "Fullstack Developer",
    avatar: "BS",
    color: "bg-emerald-500",
    quote: "Escrow payment bikin saya merasa aman. Dulu sering ditipu klien, sekarang semua terlindungi.",
  },
  {
    name: "Dewi Anggraini",
    role: "Graphic Designer",
    avatar: "DA",
    color: "bg-amber-500",
    quote: "Smart pricing kasih tahu rate pasar — saya berhenti pasang harga terlalu murah.",
  },
  {
    name: "Andi Wijaya",
    role: "Backend Developer",
    avatar: "AW",
    color: "bg-purple-500",
    quote: "AI reasoning-nya menjelaskan kenapa saya cocok. Melamar jadi lebih percaya diri.",
  },
  {
    name: "Maya Puspita",
    role: "Content Designer",
    avatar: "MP",
    color: "bg-cyan-500",
    quote: "Career path AI memandu saya dari nyambi kecil-kecilan jadi freelancer full-time.",
  },
];

function TestimonialCard({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <div className="card p-6 w-full">
      <div className="flex items-center gap-1 text-amber-400 mb-3">
        {[...Array(5)].map((_, j) => (
          <Icon key={j} name="star" size={13} fill="currentColor" />
        ))}
      </div>
      <p className="text-sm text-surface-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {t.avatar}
        </div>
        <div>
          <div className="font-semibold text-sm text-surface-900">{t.name}</div>
          <div className="text-xs text-surface-500">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const colA = [testimonials[0], testimonials[2], testimonials[4]];
  const colB = [testimonials[1], testimonials[3], testimonials[5]];

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 text-xs font-semibold text-surface-600 mb-4">
              <Icon name="users" size={12} /> Testimoni
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-surface-900 leading-tight tracking-tight mb-3">
              Mereka sudah <span className="text-primary-600">merasakan.</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-md mx-auto">
              Cerita nyata talenta yang bergabung dengan Nyamby.
            </p>
          </div>
        </AnimateIn>

        {/* Desktop: vertical marquee columns */}
        <div
          className="hidden md:grid grid-cols-2 gap-6 max-w-3xl mx-auto h-[520px] overflow-hidden pause-on-hover"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="marquee-vertical-track gap-6">
            {[...colA, ...colA].map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
          <div className="marquee-vertical-track marquee-reverse gap-6">
            {[...colB, ...colB].map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>

        {/* Mobile: static stack */}
        <div className="md:hidden space-y-4">
          {testimonials.slice(0, 3).map((t, i) => (
            <AnimateIn key={i} delay={i * 100}>
              <TestimonialCard t={t} />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
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
        className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 px-6 overflow-hidden"
      >
        {/* Aurora background */}
        <div className="absolute top-10 -left-32 w-[480px] h-[480px] bg-primary-300/25 rounded-full blur-[130px] animate-aurora" aria-hidden="true" />
        <div className="absolute -bottom-20 right-0 w-96 h-96 bg-accent-400/15 rounded-full blur-[110px] animate-aurora" style={{ animationDelay: "4s" }} aria-hidden="true" />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px] animate-aurora" style={{ animationDelay: "8s" }} aria-hidden="true" />

        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-7 z-10">
            <AnimateIn>
              <div className="inline-flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="flex -space-x-2">
                  {["/images/akbar.jpg", "/images/rahmat.jpg", "/images/satria.jpg"].map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt="Talenta Nyamby"
                      width={26}
                      height={26}
                      className="w-[26px] h-[26px] rounded-full object-cover border-2 border-white"
                    />
                  ))}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  500+ talenta sudah bergabung
                </span>
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
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register?role=talent"
                  className="btn-primary group flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-all hover:shadow-xl hover:shadow-primary-500/40 active:translate-y-0"
                >
                  <Icon name="user" size={16} />
                  Mulai sebagai Talent
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/register?role=client"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <Icon name="building" size={16} />
                  Cari Talenta
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn delay={400}>
              <p className="text-xs text-slate-400">
                Gratis · Tanpa kartu kredit · Escrow payment aman
              </p>
            </AnimateIn>
          </div>

          {/* Right: live AI match demo */}
          <AnimateIn delay={200} className="relative z-10">
            <HeroMatchDemo />
          </AnimateIn>
        </div>

        {/* Scroll cue */}
        <div className="hidden lg:flex justify-center mt-14">
          <a href="#cara-kerja" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary-600 transition-colors" aria-label="Scroll ke cara kerja">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
            <Icon name="chevronDown" size={18} className="animate-bounce" />
          </a>
        </div>
      </section>

      {/* ─── Trust marquee ──────────────────────────────────────── */}
      <TrustMarquee />

      {/* ─── How It Works ───────────────────────────────────────── */}
      <HowItWorks />

      {/* ─── Bento features ─────────────────────────────────────── */}
      <BentoFeatures />

      {/* ─── Stats band ─────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-y border-surface-100">
        <div
          ref={statsRef}
          className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center"
        >
          {[
            { value: statsVisible ? rating.value : "0", suffix: "", label: "Rating talenta" },
            { value: statsVisible ? talents.value : "0", suffix: "+", label: "Talenta terverifikasi" },
            { value: statsVisible ? accuracy.value : "0", suffix: "%", label: "Match accuracy" },
            { value: statsVisible ? projects.value : "0", suffix: "+", label: "Project selesai" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl lg:text-5xl font-extrabold tracking-tight text-surface-900 tabular-nums">
                {stat.value}
                <span className="text-primary-600">{stat.suffix}</span>
              </div>
              <div className="text-sm text-surface-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ───────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ─── Final CTA (dark) ───────────────────────────────────── */}
      <section className="bg-surface-900 text-white overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(600px circle at 20% 30%, rgba(37,99,235,0.35), transparent 60%), radial-gradient(500px circle at 80% 70%, rgba(37,99,235,0.2), transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-[1280px] mx-auto px-6 py-24 lg:py-32 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <AnimateIn className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Dari{" "}
              <span className="text-primary-400">Nyambi</span>
              <br />
              Menjadi Karier.
            </h2>
            <p className="text-surface-300 text-lg max-w-sm">
              Mulai perjalananmu bersama Nyamby hari ini.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href="/register?role=talent"
                className="group bg-white text-surface-900 hover:bg-surface-50 px-7 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 inline-flex items-center gap-2"
              >
                Daftar sebagai Talent
                <Icon
                  name="arrowRight"
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/register?role=client"
                className="px-7 py-3.5 rounded-full font-bold text-sm border border-white/25 text-white hover:bg-white/10 transition-all inline-flex items-center gap-2"
              >
                Cari Talenta
              </Link>
            </div>
            <p className="text-xs text-surface-400">
              Gratis · Tanpa kartu kredit · Escrow payment aman
            </p>
          </AnimateIn>

          <AnimateIn delay={200}>
            <div className="relative flex justify-center lg:justify-end h-full min-h-[400px]">
              <Image
                src="/images/cta-mascot.png"
                alt="Maskot Nyamby mengajak bergabung"
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
        href="/register?role=talent"
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-primary-700 ${
          showFloatingCta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Icon name="spark" size={18} />
        <span className="text-sm font-bold hidden sm:inline">Daftar Gratis</span>
        <Icon name="arrowRight" size={16} />
      </Link>
    </div>
  );
}
