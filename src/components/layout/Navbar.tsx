"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { Icon, Logo } from "@/components/icons";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [session, setSession] = useState<{ role: string; fullName: string } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setSession(data.user);
        }
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

  // Close mobile menu on resize to desktop
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
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
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
        className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeAll}>
            <Logo height={36} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Browse Dropdown */}
            <Dropdown
              label="Browse"
              isOpen={activeDropdown === "browse"}
              onToggle={() => toggleDropdown("browse")}
              onClose={closeAll}
            >
              <DropdownLink
                href="/jobs"
                icon="briefcase"
                iconColor="blue"
                title="Browse Jobs"
                desc="Cari project untuk talent"
                onClick={closeAll}
              />
              <DropdownLink
                href="/talents"
                icon="users"
                iconColor="pink"
                title="Browse Talents"
                desc="Temukan talenta terbaik"
                onClick={closeAll}
              />
            </Dropdown>

            <Link
              href="/perusahaan/tentang"
              className="flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors py-2"
            >
              <Icon name="info" size={16} className="text-surface-500" />
              About Us
            </Link>

            <a
              href="/#cara-kerja"
              className="flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors py-2"
            >
              <Icon name="book" size={16} className="text-surface-500" />
              Cara Kerja
            </a>

            {/* Fitur Dropdown */}
            <Dropdown
              label="Fitur"
              isOpen={activeDropdown === "fitur"}
              onToggle={() => toggleDropdown("fitur")}
              onClose={closeAll}
            >
              <DropdownLink
                href="/fitur/ai-matching"
                icon="ai"
                iconColor="purple"
                title="AI Matching"
                desc="Cocokkan job & talent otomatis"
                onClick={closeAll}
              />
              <DropdownLink
                href="/fitur/career-path"
                icon="trendingUp"
                iconColor="green"
                title="Career Path"
                desc="Roadmap karier personal"
                onClick={closeAll}
              />
              <DropdownLink
                href="/fitur/skill-gap"
                icon="target"
                iconColor="amber"
                title="Skill Gap Analysis"
                desc="Tahu skill yang harus naik"
                onClick={closeAll}
              />
              <DropdownLink
                href="/fitur/escrow"
                icon="shield"
                iconColor="cyan"
                title="Escrow Aman"
                desc="Pembayaran terlindungi"
                onClick={closeAll}
              />
            </Dropdown>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href={`/${session.role}/dashboard`}
                  className="text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors px-4 py-2 flex items-center gap-2"
                >
                  <Icon name={session.role === "talent" ? "user" : "building"} size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors px-4 py-2 rounded-xl"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors px-4 py-2"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full shadow-md shadow-primary-500/20"
                >
                  <Icon name="spark" size={16} />
                  Mulai Gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <Icon name={mobileOpen ? "x" : "book"} size={22} />
          </button>
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
            <MobileNavLink href="/jobs" icon="briefcase" label="Browse Jobs" onClick={closeAll} />
            <MobileNavLink href="/talents" icon="users" label="Browse Talents" onClick={closeAll} />
            <MobileNavLink href="/perusahaan/tentang" icon="info" label="About Us" onClick={closeAll} />
            <MobileNavLink href="/#cara-kerja" icon="book" label="Cara Kerja" onClick={closeAll} />

            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3">Fitur</p>
            </div>
            <MobileNavLink href="/fitur/ai-matching" icon="ai" label="AI Matching" onClick={closeAll} />
            <MobileNavLink href="/fitur/career-path" icon="trendingUp" label="Career Path" onClick={closeAll} />
            <MobileNavLink href="/fitur/skill-gap" icon="target" label="Skill Gap Analysis" onClick={closeAll} />
            <MobileNavLink href="/fitur/escrow" icon="shield" label="Escrow Aman" onClick={closeAll} />

            <div className="pt-6 space-y-3">
              {session ? (
                <>
                  <Link
                    href={`/${session.role}/dashboard`}
                    onClick={closeAll}
                    className="block w-full text-center text-sm font-medium text-surface-700 border border-surface-200 rounded-xl px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    Dashboard ({session.role})
                  </Link>
                  <button
                    onClick={() => {
                      closeAll();
                      handleLogout();
                    }}
                    className="block w-full text-center text-sm font-medium text-red-600 bg-red-50 rounded-xl px-5 py-3 hover:bg-red-100 transition-colors"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeAll}
                    className="block w-full text-center text-sm font-medium text-surface-700 border border-surface-200 rounded-xl px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeAll}
                    className="block w-full text-center btn-primary text-sm rounded-xl px-5 py-3"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Icon name="spark" size={16} />
                      Mulai Gratis
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

/* ─── Dropdown Component ──────────────────────────────────────── */

function Dropdown({
  label,
  isOpen,
  onToggle,
  onClose,
  children,
}: {
  label: string;
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
        className="flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors py-2"
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
  const isHash = href.startsWith("/#");

  if (isHash) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-surface-700 hover:bg-slate-50 transition-colors"
      >
        <Icon name={icon} size={18} className="text-surface-400" />
        {label}
      </a>
    );
  }

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
