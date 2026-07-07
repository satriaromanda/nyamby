"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Icon, Logo } from "@/components/icons";
import { useLang, type Lang } from "@/lib/lang";

const navCopy = {
  id: {
    browse: "Jelajah",
    jobs: "Cari Kerja",
    jobsDesc: "Temukan project freelance aktif",
    talents: "Cari Talenta",
    talentsDesc: "Rekrut talenta terverifikasi",
    how: "Cara Kerja",
    howDesc: "4 langkah dari daftar sampai dibayar",
    global: "Nyamby Global",
    globalDesc: "Cross-border hiring (EN)",
    fitur: "Fitur",
    aiMatching: "AI Matching",
    aiMatchingDesc: "Cocokkan job & talent otomatis",
    careerPath: "Career Path",
    careerPathDesc: "Roadmap karier personal",
    skillGap: "Skill Gap Analysis",
    skillGapDesc: "Tahu skill yang harus naik",
    escrow: "Escrow Aman",
    escrowDesc: "Pembayaran terlindungi",
    company: "Perusahaan",
    about: "Tentang Kami",
    aboutDesc: "Cerita di balik Nyamby",
    blog: "Blog",
    blogDesc: "Insight karier & update produk",
    careers: "Karier",
    careersDesc: "Bergabung dengan tim kami",
    contact: "Kontak",
    contactDesc: "Hubungi tim Nyamby",
    help: "Pusat Bantuan",
    helpDesc: "FAQ & panduan platform",
    login: "Masuk",
    start: "Mulai Gratis",
    dashboard: "Dashboard",
    logout: "Keluar",
  },
  en: {
    browse: "Explore",
    jobs: "Find Work",
    jobsDesc: "Browse active freelance projects",
    talents: "Hire Talent",
    talentsDesc: "Recruit verified talent",
    how: "How It Works",
    howDesc: "4 steps from signup to payout",
    global: "Nyamby Global",
    globalDesc: "Cross-border hiring",
    fitur: "Features",
    aiMatching: "AI Matching",
    aiMatchingDesc: "Auto-match jobs & talent",
    careerPath: "Career Path",
    careerPathDesc: "Personal career roadmap",
    skillGap: "Skill Gap Analysis",
    skillGapDesc: "Know which skills to level up",
    escrow: "Secure Escrow",
    escrowDesc: "Protected payments",
    company: "Company",
    about: "About Us",
    aboutDesc: "The story behind Nyamby",
    blog: "Blog",
    blogDesc: "Career insights & product updates",
    careers: "Careers",
    careersDesc: "Join our team",
    contact: "Contact",
    contactDesc: "Reach the Nyamby team",
    help: "Help Center",
    helpDesc: "FAQ & platform guides",
    login: "Log in",
    start: "Start Free",
    dashboard: "Dashboard",
    logout: "Log out",
  },
} as const;

export function Navbar() {
  const pathname = usePathname();
  const [lang, setLang] = useLang();
  const t = navCopy[lang];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [session, setSession] = useState<{ role: string; fullName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setSession(data.user);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  };

  // Navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const clickedInside = navRef.current?.contains(e.target as Node) ||
                            mobilePanelRef.current?.contains(e.target as Node);
      if (!clickedInside) {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleDropdown = useCallback((name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  }, []);

  const closeAll = useCallback(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? "shadow-lg shadow-slate-200/50" : "border-b border-slate-200"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeAll}>
            <Logo height={36} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Browse Dropdown */}
            <Dropdown
              label={t.browse}
              active={
                pathname.startsWith("/jobs") ||
                pathname.startsWith("/talents") ||
                pathname.startsWith("/how-it-works") ||
                pathname.startsWith("/global")
              }
              isOpen={activeDropdown === "browse"}
              onToggle={() => toggleDropdown("browse")}
              onClose={closeAll}
            >
              <DropdownLink href="/jobs" icon="briefcase" iconColor="blue" title={t.jobs} desc={t.jobsDesc} onClick={closeAll} />
              <DropdownLink href="/talents" icon="users" iconColor="pink" title={t.talents} desc={t.talentsDesc} onClick={closeAll} />
              <DropdownLink href="/how-it-works" icon="book" iconColor="green" title={t.how} desc={t.howDesc} onClick={closeAll} />
              <DropdownLink href="/global" icon="globe" iconColor="cyan" title={t.global} desc={t.globalDesc} onClick={closeAll} />
            </Dropdown>

            {/* Fitur Dropdown */}
            <Dropdown
              label={t.fitur}
              active={pathname.startsWith("/fitur")}
              isOpen={activeDropdown === "fitur"}
              onToggle={() => toggleDropdown("fitur")}
              onClose={closeAll}
            >
              <DropdownLink href="/fitur/ai-matching" icon="ai" iconColor="purple" title={t.aiMatching} desc={t.aiMatchingDesc} onClick={closeAll} />
              <DropdownLink href="/fitur/career-path" icon="trendingUp" iconColor="green" title={t.careerPath} desc={t.careerPathDesc} onClick={closeAll} />
              <DropdownLink href="/fitur/skill-gap" icon="target" iconColor="amber" title={t.skillGap} desc={t.skillGapDesc} onClick={closeAll} />
              <DropdownLink href="/fitur/escrow" icon="shield" iconColor="cyan" title={t.escrow} desc={t.escrowDesc} onClick={closeAll} />
            </Dropdown>

            {/* Company Dropdown */}
            <Dropdown
              label={t.company}
              active={pathname.startsWith("/perusahaan") || pathname.startsWith("/blog") || pathname.startsWith("/help")}
              isOpen={activeDropdown === "company"}
              onToggle={() => toggleDropdown("company")}
              onClose={closeAll}
            >
              <DropdownLink href="/perusahaan/tentang" icon="info" iconColor="blue" title={t.about} desc={t.aboutDesc} onClick={closeAll} />
              <DropdownLink href="/blog" icon="book" iconColor="purple" title={t.blog} desc={t.blogDesc} onClick={closeAll} />
              <DropdownLink href="/perusahaan/karier" icon="briefcase" iconColor="amber" title={t.careers} desc={t.careersDesc} onClick={closeAll} />
              <DropdownLink href="/perusahaan/kontak" icon="mail" iconColor="green" title={t.contact} desc={t.contactDesc} onClick={closeAll} />
              <DropdownLink href="/help" icon="info" iconColor="cyan" title={t.help} desc={t.helpDesc} onClick={closeAll} />
            </Dropdown>
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            <LangToggle lang={lang} setLang={setLang} />

            {loading ? (
              <>
                <div className="h-9 w-20 bg-surface-200 animate-pulse rounded-xl" />
                <div className="h-9 w-32 bg-surface-200 animate-pulse rounded-full" />
              </>
            ) : session ? (
              <>
                <Link
                  href={`/${session.role}/dashboard`}
                  className="text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors px-4 py-2 flex items-center gap-2"
                >
                  <Icon name={session.role === "talent" ? "user" : "building"} size={16} />
                  {t.dashboard}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors px-4 py-2 rounded-xl"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors px-4 py-2"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full shadow-md shadow-primary-500/20"
                >
                  <Icon name="spark" size={16} />
                  {t.start}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <LangToggle lang={lang} setLang={setLang} />
            <button
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <Icon name={mobileOpen ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={closeAll}
        />

        {/* Panel */}
        <div
          ref={mobilePanelRef}
          className={`absolute top-0 right-0 w-[min(85vw,360px)] h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100">
            <Logo height={32} />
            <button
              onClick={closeAll}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <Icon name="x" size={22} />
            </button>
          </div>

          <div className="px-6 py-6 space-y-1 overflow-y-auto h-[calc(100%-5rem)]">
            <MobileNavLink href="/jobs" icon="briefcase" label={t.jobs} onClick={closeAll} />
            <MobileNavLink href="/talents" icon="users" label={t.talents} onClick={closeAll} />
            <MobileNavLink href="/how-it-works" icon="book" label={t.how} onClick={closeAll} />
            <MobileNavLink href="/global" icon="globe" label={t.global} onClick={closeAll} />

            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3">{t.fitur}</p>
            </div>
            <MobileNavLink href="/fitur/ai-matching" icon="ai" label={t.aiMatching} onClick={closeAll} />
            <MobileNavLink href="/fitur/career-path" icon="trendingUp" label={t.careerPath} onClick={closeAll} />
            <MobileNavLink href="/fitur/skill-gap" icon="target" label={t.skillGap} onClick={closeAll} />
            <MobileNavLink href="/fitur/escrow" icon="shield" label={t.escrow} onClick={closeAll} />

            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3">{t.company}</p>
            </div>
            <MobileNavLink href="/perusahaan/tentang" icon="info" label={t.about} onClick={closeAll} />
            <MobileNavLink href="/blog" icon="book" label={t.blog} onClick={closeAll} />
            <MobileNavLink href="/help" icon="info" label={t.help} onClick={closeAll} />

            <div className="pt-6 space-y-3">
              {loading ? (
                <>
                  <div className="h-12 w-full bg-surface-200 animate-pulse rounded-xl" />
                  <div className="h-12 w-full bg-surface-200 animate-pulse rounded-xl" />
                </>
              ) : session ? (
                <>
                  <Link
                    href={`/${session.role}/dashboard`}
                    onClick={closeAll}
                    className="block w-full text-center text-sm font-medium text-surface-700 border border-surface-200 rounded-xl px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    {t.dashboard} ({session.role})
                  </Link>
                  <button
                    onClick={() => {
                      closeAll();
                      handleLogout();
                    }}
                    className="block w-full text-center text-sm font-medium text-red-600 bg-red-50 rounded-xl px-5 py-3 hover:bg-red-100 transition-colors"
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeAll}
                    className="block w-full text-center text-sm font-medium text-surface-700 border border-surface-200 rounded-xl px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    {t.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeAll}
                    className="block w-full text-center btn-primary text-sm rounded-xl px-5 py-3"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Icon name="spark" size={16} />
                      {t.start}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Language toggle ─────────────────────────────────────────── */

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-surface-100 rounded-full p-0.5 border border-surface-200/70">
      {(["id", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${
            lang === l ? "bg-white text-surface-900 shadow-sm" : "text-surface-400 hover:text-surface-600"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ─── Dropdown Component ──────────────────────────────────────── */

function Dropdown({
  label,
  active = false,
  isOpen,
  onToggle,
  onClose,
  children,
}: {
  label: string;
  active?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        className={`pill-tab ${active ? "pill-tab-active" : ""}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        {label}
        <Icon
          name="chevronDown"
          size={16}
          className={`text-surface-500 transition-transform duration-200 ${isOpen ? "-rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute top-full left-0 pt-2 transition-all duration-200 transform origin-top-left ${
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-2 pointer-events-none"
        }`}
        role="menu"
      >
        <div className="w-[280px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-3 flex flex-col gap-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function DropdownLink({
  href,
  icon,
  iconColor,
  title,
  desc,
  onClick,
}: {
  href: string;
  icon: any;
  iconColor: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-500 group-hover/item:bg-blue-100",
    pink: "bg-pink-50 text-pink-500 group-hover/item:bg-pink-100",
    purple: "bg-purple-50 text-purple-500 group-hover/item:bg-purple-100",
    green: "bg-green-50 text-green-500 group-hover/item:bg-green-100",
    amber: "bg-amber-50 text-amber-500 group-hover/item:bg-amber-100",
    cyan: "bg-cyan-50 text-cyan-500 group-hover/item:bg-cyan-100",
  };

  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${colorMap[iconColor] || colorMap.blue}`}
      >
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div className="font-semibold text-sm text-slate-900">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
      </div>
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-surface-700 hover:bg-slate-50 transition-colors"
    >
      <Icon name={icon} size={18} className="text-surface-400" />
      {label}
    </Link>
  );
}
