"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, Logo } from "@/components/icons";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200" role="navigation" aria-label="Main navigation">
      <div className="max-w-[1280px] mx-auto px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo height={36} />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          
          {/* Browse Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors py-2">
              Browse
              <Icon name="chevronDown" size={16} className="text-surface-400 group-hover:text-surface-700 transition-transform group-hover:-rotate-180 duration-200" />
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0">
              <div className="w-[280px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-3 flex flex-col gap-1">
                <Link href="/jobs" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover/item:bg-blue-100 transition-colors">
                    <Icon name="briefcase" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Browse Jobs</div>
                    <div className="text-xs text-slate-500 mt-0.5">Cari project untuk talent</div>
                  </div>
                </Link>
                <Link href="/talents" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0 group-hover/item:bg-pink-100 transition-colors">
                    <Icon name="users" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Browse Talents</div>
                    <div className="text-xs text-slate-500 mt-0.5">Temukan talenta terbaik</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/about" className="flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors py-2">
            <Icon name="info" size={16} className="text-surface-400" />
            About Us
          </Link>

          <a href="/#cara-kerja" className="flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors py-2">
            <Icon name="book" size={16} className="text-surface-400" />
            Cara Kerja
          </a>

          {/* Fitur Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors py-2">
              Fitur
              <Icon name="chevronDown" size={16} className="text-surface-400 group-hover:text-surface-700 transition-transform group-hover:-rotate-180 duration-200" />
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left translate-y-2 group-hover:translate-y-0">
              <div className="w-[320px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-3 flex flex-col gap-1">
                <a href="/#ai-matching" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 group-hover/item:bg-purple-100 transition-colors">
                    <Icon name="ai" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">AI Matching</div>
                    <div className="text-xs text-slate-500 mt-0.5">Cocokkan job & talent otomatis</div>
                  </div>
                </a>
                <Link href="/features/career-path" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0 group-hover/item:bg-green-100 transition-colors">
                    <Icon name="trendingUp" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Career Path</div>
                    <div className="text-xs text-slate-500 mt-0.5">Roadmap karier personal</div>
                  </div>
                </Link>
                <Link href="/features/skill-gap" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover/item:bg-amber-100 transition-colors">
                    <Icon name="target" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Skill Gap Analysis</div>
                    <div className="text-xs text-slate-500 mt-0.5">Tahu skill yang harus naik</div>
                  </div>
                </Link>
                <Link href="/features/escrow" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 group-hover/item:bg-cyan-100 transition-colors">
                    <Icon name="shield" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Escrow Aman</div>
                    <div className="text-xs text-slate-500 mt-0.5">Pembayaran terlindungi</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors px-4 py-2"
          >
            Masuk
          </Link>
          <Link href="/register" className="btn-primary text-sm inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full shadow-md shadow-primary-500/20">
            <Icon name="spark" size={16} />
            Mulai Gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
