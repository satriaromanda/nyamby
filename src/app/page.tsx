"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";

/* ─── Copy (ID/EN) ─────────────────────────────────────────────── */

const copy = {
  id: {
    heroBadge: "500+ talenta sudah bergabung",
    h1a: "Nyambungin Skill,",
    h1b: "Nyambungin Masa Depan.",
    heroSubPrefix: "Pendamping Karier AI yang membantu talenta Indonesia menemukan",
    typing: ["peluang terbaik.", "karier impian.", "keahlian yang tepat.", "masa depan cerah."],
    ctaTalent: "Mulai sebagai Talenta",
    ctaClient: "Cari Talenta",
    reassurance: "Gratis · Tanpa kartu kredit · Pembayaran aman",
    demoJobTag: "Web Dev",
    demoJobTime: "2 jam lalu",
    demoJobTitle: "Landing Page UMKM",
    demoJobMeta: "PT Maju Digital · Jarak Jauh",
    demoTalentRole: "Pengembang Frontend",
    demoMatch: "Kecocokan AI",
    marquee: [
      "Pembayaran aman",
      "Akurasi kecocokan 95%",
      "500+ talenta terverifikasi",
      "1.200+ proyek selesai",
      "Pengembangan Web",
      "UI/UX & Desain Grafis",
      "Analisis Kesenjangan Keahlian",
      "Jalur Karier AI",
    ],
    howBadge: "Cara kerja",
    howTitleA: "Dari daftar sampai",
    howTitleB: "dibayar.",
    howSub: "Empat langkah — Nambi mendampingi dari hari pertama.",
    steps: [
      { title: "Buat profil & unggah portofolio", desc: "AI membaca CV dan portofoliomu untuk memetakan keahlian secara otomatis." },
      { title: "AI mencarikan kecocokan terbaik", desc: "Bukan sekadar pencocokan kata kunci — AI memahami konteks pengalaman dan tujuan kariermu." },
      { title: "Kerjakan proyek dengan aman", desc: "Dana klien ditahan aman dan baru dirilis setelah hasil kerjamu disetujui." },
      { title: "Bertumbuh jadi karier", desc: "Analisis kesenjangan keahlian dan jalur karier AI memandu langkah berikutnya." },
    ],
    bentoBadge: "Fitur",
    bentoTitleA: "Bukan sekadar",
    bentoTitleB: "marketplace.",
    bentoSub: "Pendamping karier AI yang bekerja untukmu di setiap langkah.",
    aiTitle: "Pencocokan Pekerjaan AI",
    aiDesc: "AI memahami CV, portofolio, dan tujuan kariermu — lalu menjelaskan kenapa kamu cocok.",
    aiAccuracy: "95% akurat",
    aiInsightLabel: "WAWASAN AI",
    aiInsight: "“Pengalaman React 3 tahun + portofolio e-commerce kamu sangat relevan dengan proyek ini. Sorot studi kasus tokoku.id saat melamar.”",
    escrowTitle: "Pembayaran Aman",
    escrowDesc: "Dana ditahan aman, dirilis setelah kerja disetujui. Tidak ada lagi klien kabur.",
    skillGapTitle: "Analisis Kesenjangan Keahlian",
    pricingTitle: "Penentuan Harga Cerdas",
    pricingDesc: "Patokan tarif pasar untuk keahlianmu.",
    pricingUnit: "/proyek",
    careerTitle: "Jalur Karier AI",
    careerDesc: "Dari nyambi pertama sampai karier profesional.",
    globalTitle: "Nyamby Global",
    globalDesc: "Ekspansi lintas negara: klien Malaysia & internasional merekrut talenta Indonesia — pembayaran lintas negara tetap aman.",
    globalCta: "Jelajahi Nyamby Global",
    statsLabels: ["Peringkat talenta", "Talenta terverifikasi", "Akurasi kecocokan", "Proyek selesai"],
    testiBadge: "Testimoni",
    testiTitleA: "Mereka sudah",
    testiTitleB: "merasakan.",
    testiSub: "Cerita nyata talenta yang bergabung dengan Nyamby.",
    testimonials: [
      { name: "Rizky Pratama", role: "Pengembang Frontend", avatar: "RP", color: "bg-blue-500", quote: "Dalam 2 minggu setelah daftar, saya langsung dapat 3 wawancara. Pencocokan AI-nya benar-benar akurat." },
      { name: "Siti Nurhaliza", role: "Desainer UI/UX", avatar: "SN", color: "bg-pink-500", quote: "Analisis Kesenjangan Keahlian bikin saya sadar perlu belajar Figma. Sekarang punya 5 klien tetap." },
      { name: "Budi Santoso", role: "Pengembang Fullstack", avatar: "BS", color: "bg-emerald-500", quote: "Pembayaran aman bikin saya tenang. Dulu sering ditipu klien, sekarang semua terlindungi." },
      { name: "Dewi Anggraini", role: "Desainer Grafis", avatar: "DA", color: "bg-amber-500", quote: "Penentuan Harga Cerdas kasih tahu tarif pasar — saya berhenti pasang harga terlalu murah." },
      { name: "Andi Wijaya", role: "Pengembang Backend", avatar: "AW", color: "bg-purple-500", quote: "Penalaran AI menjelaskan kenapa saya cocok. Melamar jadi lebih percaya diri." },
      { name: "Maya Puspita", role: "Desainer Konten", avatar: "MP", color: "bg-cyan-500", quote: "Jalur Karier AI memandu saya dari nyambi kecil-kecilan jadi pekerja lepas purnawaktu." },
    ],
    storyTitleA: "Cerita di Balik",
    storyTitleB: "Nyamby",
    storyP1a: "Berawal dari Bandar Lampung, kami melihat ",
    storyP1b: "banyak talenta berbakat yang kesulitan menemukan peluang kerja yang sesuai",
    storyP1c: ", sementara banyak individu dan bisnis membutuhkan bantuan untuk menyelesaikan berbagai pekerjaan.",
    storyP2: "Nyamby hadir sebagai jembatan antara talenta dan peluang — membantu siapa pun menemukan pekerjaan, proyek, maupun bantuan yang mereka butuhkan.",
    storyQuote: "“Kesempatan tidak seharusnya dibatasi oleh lokasi, gelar, atau koneksi. Setiap orang berhak mendapatkan peluang untuk bekerja, berkembang, dan menghasilkan.”",
    ctaTitleA: "Dari",
    ctaTitleB: "Nyambi",
    ctaTitleC: "Menjadi Karier.",
    ctaSub: "Mulai perjalananmu bersama Nambi hari ini.",
    ctaBtnTalent: "Daftar sebagai Talenta",
    ctaBtnClient: "Cari Talenta",
    floatingCta: "Daftar Gratis",
  },
  en: {
    heroBadge: "500+ talents already joined",
    h1a: "Connecting Skills,",
    h1b: "Connecting Futures.",
    heroSubPrefix: "The AI Career Companion helping Indonesian talent find",
    typing: ["the best opportunities.", "their dream career.", "the right skills.", "a brighter future."],
    ctaTalent: "Start as Talent",
    ctaClient: "Hire Talent",
    reassurance: "Free · No credit card · Secure escrow payments",
    demoJobTag: "Web Dev",
    demoJobTime: "2 hours ago",
    demoJobTitle: "SME Landing Page",
    demoJobMeta: "PT Maju Digital · Remote",
    demoTalentRole: "Frontend Developer",
    demoMatch: "AI Match",
    marquee: [
      "Secure escrow payments",
      "95% match accuracy",
      "500+ verified talents",
      "1,200+ projects completed",
      "Web Development",
      "UI/UX & Graphic Design",
      "Skill Gap Analysis",
      "AI Career Path",
    ],
    howBadge: "How it works",
    howTitleA: "From signup to",
    howTitleB: "getting paid.",
    howSub: "Four steps — Nambi guides you from day one.",
    steps: [
      { title: "Create a profile & upload your portfolio", desc: "AI reads your CV and portfolio to map your skills automatically." },
      { title: "AI finds your best matches", desc: "Not keyword matching — AI understands your experience and career goals." },
      { title: "Work on projects with escrow", desc: "Client funds are held safely and released only after your work is approved." },
      { title: "Grow into a career", desc: "Skill gap analysis and AI career paths guide your next move." },
    ],
    bentoBadge: "Features",
    bentoTitleA: "More than a",
    bentoTitleB: "marketplace.",
    bentoSub: "An AI career companion working for you at every step.",
    aiTitle: "AI Job Matching",
    aiDesc: "AI understands your CV, portfolio, and career goals — then explains why you fit.",
    aiAccuracy: "95% accurate",
    aiInsightLabel: "AI INSIGHT",
    aiInsight: "“Your 3 years of React experience and e-commerce portfolio are highly relevant to this project. Highlight the tokoku.id case study when applying.”",
    escrowTitle: "Escrow Payment",
    escrowDesc: "Funds held safely, released once work is approved. No more clients disappearing.",
    skillGapTitle: "Skill Gap Analysis",
    pricingTitle: "Smart Pricing",
    pricingDesc: "Market rate benchmarks for your skills.",
    pricingUnit: "/project",
    careerTitle: "AI Career Path",
    careerDesc: "From your first side gig to a professional career.",
    globalTitle: "Nyamby Global",
    globalDesc: "Cross-border expansion: Malaysian and international clients hire Indonesian talent — with escrow-protected cross-border payments.",
    globalCta: "Explore Nyamby Global",
    statsLabels: ["Talent rating", "Verified talents", "Match accuracy", "Projects completed"],
    testiBadge: "Testimonials",
    testiTitleA: "They've already",
    testiTitleB: "felt it.",
    testiSub: "Real stories from talents who joined Nyamby.",
    testimonials: [
      { name: "Rizky Pratama", role: "Frontend Developer", avatar: "RP", color: "bg-blue-500", quote: "Within 2 weeks of signing up, I landed 3 interviews. The AI matching really works." },
      { name: "Siti Nurhaliza", role: "UI/UX Designer", avatar: "SN", color: "bg-pink-500", quote: "Skill Gap Analysis showed me I needed Figma. Now I have 5 regular clients." },
      { name: "Budi Santoso", role: "Fullstack Developer", avatar: "BS", color: "bg-emerald-500", quote: "Escrow payments make me feel safe. I used to get scammed by clients — now everything is protected." },
      { name: "Dewi Anggraini", role: "Graphic Designer", avatar: "DA", color: "bg-amber-500", quote: "Smart pricing showed me market rates — I stopped underpricing my work." },
      { name: "Andi Wijaya", role: "Backend Developer", avatar: "AW", color: "bg-purple-500", quote: "The AI reasoning explains why I fit. Applying feels much more confident now." },
      { name: "Maya Puspita", role: "Content Designer", avatar: "MP", color: "bg-cyan-500", quote: "The AI career path guided me from small side gigs to full-time freelancing." },
    ],
    storyTitleA: "The Story Behind",
    storyTitleB: "Nyamby",
    storyP1a: "Starting from Bandar Lampung, Indonesia, we saw ",
    storyP1b: "talented people struggling to find the right work opportunities",
    storyP1c: ", while individuals and businesses needed help getting things done.",
    storyP2: "Nyamby is the bridge between talent and opportunity — helping anyone find the work, projects, or help they need.",
    storyQuote: "“Opportunity shouldn't be limited by location, degrees, or connections. Everyone deserves the chance to work, grow, and earn.”",
    ctaTitleA: "From",
    ctaTitleB: "Side Gig",
    ctaTitleC: "To Career.",
    ctaSub: "Start your journey with Nambi today.",
    ctaBtnTalent: "Join as Talent",
    ctaBtnClient: "Hire Talent",
    floatingCta: "Start Free",
  },
} as const;

type Copy = (typeof copy)[keyof typeof copy];

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

function useTypingEffect(phrases: readonly string[], typingSpeed = 80, deletingSpeed = 50, pause = 2000) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset when the phrase set changes (language switch)
  useEffect(() => {
    setText("");
    setPhraseIdx(0);
    setIsDeleting(false);
  }, [phrases]);

  useEffect(() => {
    const current = phrases[phraseIdx] ?? phrases[0];
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

/** Interactive 3D tilt on mouse move (Web3-style card behavior). */
function useTilt(maxDeg = 7) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg)`;
  }, [maxDeg]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
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

/* ─── Hero: interactive AI-match demo with 3D tilt ─────────────── */

function HeroMatchDemo({ t }: { t: Copy }) {
  const { ref: viewRef, visible } = useInView(0.25);
  const tilt = useTilt(7);
  const score = useAnimatedCounter(92, 1800, 0);

  useEffect(() => {
    if (visible) score.begin();
  }, [visible, score]);

  return (
    <div ref={viewRef} className="relative">
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="relative w-full max-w-[560px] aspect-square mx-auto transition-transform duration-200 ease-out will-change-transform"
      >
        {/* Mascot behind */}
        <Image
          src="/images/hero-mascot.png"
          alt="Nambi — Nyamby's AI mascot"
          width={420}
          height={420}
          className="absolute right-0 bottom-0 w-[66%] h-auto object-contain opacity-95 animate-float"
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
              <stop offset="100%" stopColor="#1CCEFD" />
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
        <div className="card-glass p-4 absolute top-4 left-0 w-60 -rotate-2 transition-transform duration-300 hover:-translate-y-1 hover:rotate-0">
          <div className="flex items-center justify-between mb-2">
            <span className="chip !bg-ai-50 !text-ai-600">{t.demoJobTag}</span>
            <span className="text-[10px] text-surface-400">{t.demoJobTime}</span>
          </div>
          <div className="text-sm font-bold text-surface-900 mb-1">{t.demoJobTitle}</div>
          <div className="text-xs text-surface-500 mb-2">{t.demoJobMeta}</div>
          <div className="text-sm font-bold text-surface-900">Rp 3.5jt – 5jt</div>
        </div>

        {/* Talent mini card */}
        <div className="card-glass p-4 absolute bottom-6 right-2 w-60 rotate-2 transition-transform duration-300 hover:-translate-y-1 hover:rotate-0">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/images/satria.jpg"
              alt="Nyamby talent"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-bold text-surface-900">Satria R.</div>
              <div className="text-[10px] text-surface-400">{t.demoTalentRole}</div>
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
          <div className="gradient-border rounded-2xl glow-primary px-5 py-3 text-center bg-white">
            <div className="flex items-center gap-1.5 justify-center mb-0.5">
              <Icon name="ai" size={14} className="text-primary-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gradient-brand">{t.demoMatch}</span>
            </div>
            <div className="text-3xl font-extrabold text-surface-900 tabular-nums leading-none">
              {visible ? score.value : "0"}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Trust marquee ────────────────────────────────────────────── */

const marqueeIcons = ["shield", "ai", "user", "briefcase", "code", "design", "target", "trendingUp"] as const;

function TrustMarquee({ t }: { t: Copy }) {
  return (
    <div className="bg-white border-y border-surface-100 py-5 overflow-hidden pause-on-hover">
      <div className="marquee-track gap-4 pr-4">
        {[...t.marquee, ...t.marquee].map((label, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-50 border border-surface-100 text-sm text-surface-600 whitespace-nowrap"
          >
            <Icon name={marqueeIcons[i % marqueeIcons.length]} size={14} className="text-primary-600" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── How it works: auto-advancing steps + mascot ──────────────── */

const stepImages = [
  "/images/icon-target-3d.png",
  "/images/icon-brain-3d.png",
  "/images/icon-shield-3d.png",
  "/images/icon-chart-3d.png",
];

function HowItWorks({ t }: { t: Copy }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((a) => (a + 1) % t.steps.length), 3500);
    return () => clearInterval(timer);
  }, [t.steps.length]);

  return (
    <section id="cara-kerja" className="py-24 px-6 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <AnimateIn>
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-14">
            <div className="w-36 h-36 lg:w-44 lg:h-44 shrink-0">
              <Image
                src="/images/how-it-works-mascot.png"
                alt="Nambi has the answer"
                width={176}
                height={176}
                className="w-full h-full object-contain drop-shadow-xl animate-float"
              />
            </div>
            <div className="text-center lg:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 text-xs font-semibold text-surface-600 mb-4">
                <Icon name="spark" size={12} /> {t.howBadge}
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-surface-900 leading-tight tracking-tight mb-3">
                {t.howTitleA} <span className="text-gradient-brand">{t.howTitleB}</span>
              </h2>
              <p className="text-surface-500 text-lg max-w-md mx-auto lg:mx-0">{t.howSub}</p>
            </div>
          </div>
        </AnimateIn>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps list */}
          <AnimateIn className="space-y-3">
            {t.steps.map((step, i) => (
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
              <div className="absolute inset-0 bg-primary-400/15 rounded-full blur-[70px] animate-glow-pulse" />
              {stepImages.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={t.steps[i].title}
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

function SmartPricingCounter({ unit }: { unit: string }) {
  const { ref, visible } = useInView(0.4);
  const price = useAnimatedCounter(8.5, 1600, 0, 1);
  useEffect(() => {
    if (visible) price.begin();
  }, [visible, price]);
  return (
    <div ref={ref} className="text-3xl font-extrabold text-surface-900 tabular-nums">
      Rp {visible ? price.value : "0"}jt<span className="text-sm font-medium text-surface-400">{unit}</span>
    </div>
  );
}

function BentoFeatures({ t }: { t: Copy }) {
  return (
    <section className="py-24 px-6 bg-[#FAFAF8] relative">
      <div className="absolute inset-0 bg-grid-dots opacity-50 pointer-events-none" aria-hidden="true" />
      <div className="max-w-[1280px] mx-auto relative">
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-surface-200 text-xs font-semibold text-surface-600 mb-4">
              <Icon name="ai" size={12} className="text-primary-600" /> {t.bentoBadge}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-surface-900 leading-tight tracking-tight mb-3">
              {t.bentoTitleA} <span className="text-gradient-brand">{t.bentoTitleB}</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-md mx-auto">{t.bentoSub}</p>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:auto-rows-[210px]">
          {/* AI Matching — big cell */}
          <AnimateIn className="md:col-span-2 lg:row-span-2">
            <Link href="/fitur/ai-matching" className="gradient-border card-hover rounded-2xl p-7 flex flex-col h-full group bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-ai-50 text-primary-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <Icon name="ai" size={22} />
                </div>
                <span className="badge-match">
                  <Icon name="ai" size={12} /> {t.aiAccuracy}
                </span>
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">{t.aiTitle}</h3>
              <p className="text-sm text-surface-500 mb-5 max-w-sm">{t.aiDesc}</p>
              <div className="mt-auto p-4 rounded-xl bg-primary-50 border border-primary-100">
                <div className="text-[10px] text-primary-600 font-bold mb-1 inline-flex items-center gap-1">
                  <Icon name="ai" size={11} /> {t.aiInsightLabel}
                </div>
                <p className="text-xs text-surface-600 leading-relaxed">{t.aiInsight}</p>
              </div>
            </Link>
          </AnimateIn>

          {/* Escrow */}
          <AnimateIn delay={100}>
            <Link href="/fitur/escrow" className="card card-hover p-6 flex flex-col h-full group">
              <div className="w-11 h-11 rounded-xl bg-action-50 text-action-500 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <Icon name="shield" size={22} />
              </div>
              <h3 className="font-bold text-surface-900 mb-1">{t.escrowTitle}</h3>
              <p className="text-xs text-surface-500">{t.escrowDesc}</p>
            </Link>
          </AnimateIn>

          {/* Skill Gap */}
          <AnimateIn delay={150}>
            <Link href="/fitur/skill-gap" className="card card-hover p-6 flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-money-50 text-money-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <Icon name="target" size={22} />
                </div>
                <h3 className="font-bold text-surface-900">{t.skillGapTitle}</h3>
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
              <h3 className="font-bold text-surface-900 mb-1">{t.pricingTitle}</h3>
              <p className="text-xs text-surface-500 mb-2">{t.pricingDesc}</p>
              <SmartPricingCounter unit={t.pricingUnit} />
            </Link>
          </AnimateIn>

          {/* Career Path */}
          <AnimateIn delay={250}>
            <Link href="/fitur/career-path" className="card card-hover p-6 flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-trust-50 text-trust-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                  <Icon name="trendingUp" size={22} />
                </div>
                <h3 className="font-bold text-surface-900">{t.careerTitle}</h3>
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
              <p className="text-xs text-surface-500 mt-1">{t.careerDesc}</p>
            </Link>
          </AnimateIn>

          {/* Global — full-width banner cell */}
          <AnimateIn delay={300} className="md:col-span-2 lg:col-span-4">
            <Link
              href="/global"
              className="card-hover rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center gap-5 h-full group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white"
            >
              <div className="absolute inset-0 bg-grid-dots opacity-20" aria-hidden="true" />
              <div className="w-12 h-12 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0 relative transition-transform group-hover:scale-110 group-hover:rotate-6">
                <Icon name="globe" size={24} />
              </div>
              <div className="relative flex-1">
                <h3 className="text-lg font-bold mb-1">{t.globalTitle}</h3>
                <p className="text-sm text-primary-100 max-w-2xl">{t.globalDesc}</p>
              </div>
              <span className="relative inline-flex items-center gap-1.5 text-sm font-bold whitespace-nowrap">
                {t.globalCta}
                <Icon name="arrowRight" size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials marquee ─────────────────────────────────────── */

function TestimonialCard({ t }: { t: Copy["testimonials"][number] }) {
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

function TestimonialsSection({ t }: { t: Copy }) {
  const colA = [t.testimonials[0], t.testimonials[2], t.testimonials[4]];
  const colB = [t.testimonials[1], t.testimonials[3], t.testimonials[5]];

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 text-xs font-semibold text-surface-600 mb-4">
              <Icon name="users" size={12} /> {t.testiBadge}
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-surface-900 leading-tight tracking-tight mb-3">
              {t.testiTitleA} <span className="text-gradient-brand">{t.testiTitleB}</span>
            </h2>
            <p className="text-surface-500 text-lg max-w-md mx-auto">{t.testiSub}</p>
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
            {[...colA, ...colA].map((item, i) => (
              <TestimonialCard key={i} t={item} />
            ))}
          </div>
          <div className="marquee-vertical-track marquee-reverse gap-6">
            {[...colB, ...colB].map((item, i) => (
              <TestimonialCard key={i} t={item} />
            ))}
          </div>
        </div>

        {/* Mobile: static stack */}
        <div className="md:hidden space-y-4">
          {t.testimonials.slice(0, 3).map((item, i) => (
            <AnimateIn key={i} delay={i * 100}>
              <TestimonialCard t={item} />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
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
  const [lang] = useLang();
  const t = copy[lang];
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

  const typedText = useTypingEffect(t.typing);

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
        {/* Web3 backdrop: dot grid + aurora orbs */}
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" aria-hidden="true" />
        <div className="absolute top-10 -left-32 w-[480px] h-[480px] bg-primary-300/25 rounded-full blur-[130px] animate-aurora" aria-hidden="true" />
        <div className="absolute -bottom-20 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-[110px] animate-aurora" style={{ animationDelay: "4s" }} aria-hidden="true" />

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
                      alt="Nyamby talent"
                      width={26}
                      height={26}
                      className="w-[26px] h-[26px] rounded-full object-cover border-2 border-white"
                    />
                  ))}
                </span>
                <span className="text-xs font-semibold text-slate-700">{t.heroBadge}</span>
              </div>
            </AnimateIn>

            <AnimateIn delay={100}>
              <h1 className="text-5xl lg:text-[64px] font-extrabold leading-[1.08] tracking-tight text-slate-900">
                {t.h1a} <br />
                <span className="text-gradient-brand">{t.h1b}</span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={200}>
              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                {t.heroSubPrefix}{" "}
                <span className="inline-block min-w-[180px]">
                  <span className="text-primary-600 font-semibold border-b-2 border-primary-300">
                    {typedText}
                    <span className="animate-pulse text-primary-400">|</span>
                  </span>
                </span>
              </p>
            </AnimateIn>

            <AnimateIn delay={300}>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/register?role=talent"
                  className="btn-primary group flex items-center gap-2 px-7 py-3.5 font-semibold text-sm glow-primary hover:-translate-y-0.5 transition-all active:translate-y-0"
                >
                  <Icon name="user" size={16} />
                  {t.ctaTalent}
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/register?role=client"
                  className="btn-secondary flex items-center gap-2 px-7 py-3.5 font-semibold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <Icon name="building" size={16} />
                  {t.ctaClient}
                </Link>
              </div>
            </AnimateIn>

            <AnimateIn delay={400}>
              <p className="text-xs text-slate-400">{t.reassurance}</p>
            </AnimateIn>
          </div>

          {/* Right: interactive AI match demo */}
          <AnimateIn delay={200} className="relative z-10">
            <HeroMatchDemo t={t} />
          </AnimateIn>
        </div>
      </section>

      {/* ─── Trust marquee ──────────────────────────────────────── */}
      <TrustMarquee t={t} />

      {/* ─── How It Works ───────────────────────────────────────── */}
      <HowItWorks t={t} />

      {/* ─── Bento features ─────────────────────────────────────── */}
      <BentoFeatures t={t} />

      {/* ─── Stats band ─────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-y border-surface-100">
        <div
          ref={statsRef}
          className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center"
        >
          {[
            { value: statsVisible ? rating.value : "0", suffix: "" },
            { value: statsVisible ? talents.value : "0", suffix: "+" },
            { value: statsVisible ? accuracy.value : "0", suffix: "%" },
            { value: statsVisible ? projects.value : "0", suffix: "+" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl lg:text-5xl font-extrabold tracking-tight text-surface-900 tabular-nums">
                {stat.value}
                <span className="text-gradient-brand">{stat.suffix}</span>
              </div>
              <div className="text-sm text-surface-400 mt-1">{t.statsLabels[i]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ───────────────────────────────────────── */}
      <TestimonialsSection t={t} />

      {/* ─── Story ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#FAFAF8]">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              {t.storyTitleA} <span className="text-gradient-brand">{t.storyTitleB}</span>
            </h2>
            <div className="space-y-4 text-slate-500 leading-relaxed">
              <p>
                {t.storyP1a}
                <strong className="text-slate-800 font-semibold">{t.storyP1b}</strong>
                {t.storyP1c}
              </p>
              <p>{t.storyP2}</p>
            </div>
            <blockquote className="card p-6 text-sm text-slate-600 italic leading-relaxed">
              {t.storyQuote}
            </blockquote>
          </AnimateIn>

          <AnimateIn delay={150} className="flex justify-center">
            <Image
              src="/images/cerita-mascot.png"
              alt="Nambi with the Nyamby story"
              width={400}
              height={400}
              className="w-full max-w-[400px] h-auto object-contain drop-shadow-2xl animate-float"
            />
          </AnimateIn>
        </div>
      </section>

      {/* ─── Final CTA — Web3 dark ──────────────────────────────── */}
      <section className="bg-surface-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-dots opacity-30" aria-hidden="true" />
        <div
          className="absolute inset-0 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(620px circle at 22% 30%, rgba(37,99,235,0.4), transparent 60%), radial-gradient(520px circle at 80% 70%, rgba(28,206,253,0.18), transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-[1280px] mx-auto px-6 py-24 lg:py-32 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <AnimateIn className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              {t.ctaTitleA} <span className="text-gradient-brand">{t.ctaTitleB}</span>
              <br />
              {t.ctaTitleC}
            </h2>
            <p className="text-surface-300 text-lg max-w-sm">{t.ctaSub}</p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                href="/register?role=talent"
                className="group bg-white text-surface-900 hover:bg-surface-50 px-7 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 inline-flex items-center gap-2"
              >
                {t.ctaBtnTalent}
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
                {t.ctaBtnClient}
              </Link>
            </div>
            <p className="text-xs text-surface-400">{t.reassurance}</p>
          </AnimateIn>

          <AnimateIn delay={200}>
            <div className="relative flex justify-center lg:justify-end h-full min-h-[400px]">
              <Image
                src="/images/cta-mascot.png"
                alt="Nambi cheering you on"
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
        <span className="text-sm font-bold hidden sm:inline">{t.floatingCta}</span>
        <Icon name="arrowRight" size={16} />
      </Link>
    </div>
  );
}
