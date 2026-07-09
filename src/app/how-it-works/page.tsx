"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    tag1: "AI enrichment",
    tag2: "Trust-first marketplace",
    h1a: "Cara Nyamby Mengubah ",
    h1b: "Nyambi Menjadi Karir",
    subtitle: "Nyamby membiarkan user menjelajah talenta dan job terlebih dahulu, lalu memakai AI untuk membuat keputusan matching lebih kredibel saat mereka siap daftar.",
    steps: [
      {
        icon: "user" as const,
        title: "Talenta melengkapi profil",
        description: "Skill, level, rate, bio, CV, dan portfolio digabung menjadi konteks terstruktur untuk matching.",
        color: "#2563EB",
      },
      {
        icon: "ai" as const,
        title: "AI enrichment membaca bukti",
        description: "CV dan portfolio dipakai sebagai validasi, sehingga rekomendasi tidak hanya bergantung pada self-report.",
        color: "#0F6E56",
      },
      {
        icon: "briefcase" as const,
        title: "Client post job",
        description: "Kebutuhan project, budget, deadline, dan required skills menjadi input demand side.",
        color: "#854F0B",
      },
      {
        icon: "shield" as const,
        title: "Escrow mock menjaga trust",
        description: "Dana divisualkan sebagai ditahan, in progress, lalu released setelah hasil disetujui.",
        color: "#993C1D",
      },
    ],
    stepLabel: (index: number) => `Step ${index}`,
    cardTalentTitle: "Untuk Talenta",
    cardTalentDesc: "Lihat skill gap, job yang cocok, dan alasan AI agar pengembangan karir lebih terarah.",
    cardTalentLink: "Daftar sebagai talenta",
    cardClientTitle: "Untuk Client",
    cardClientDesc: "Browse talenta, post job, lalu lihat shortlist dengan score dan reasoning yang jelas.",
    cardClientLink: "Cari talenta",
    cardDemoTitle: "Untuk Demo",
    cardDemoDesc: "Dua momen utama: AI Skill Gap setelah onboarding dan AI Job Matching setelah client post job.",
    cardDemoLink: "Browse job publik",
  },
  en: {
    tag1: "AI enrichment",
    tag2: "Trust-first marketplace",
    h1a: "How Nyamby Turns ",
    h1b: "Side Gigs into Careers",
    subtitle: "Nyamby lets users explore talents and jobs first, then uses AI to make matching decisions more credible when they are ready to sign up.",
    steps: [
      {
        icon: "user" as const,
        title: "Talent completes profile",
        description: "Skills, level, rate, bio, CV, and portfolio are combined into a structured context for matching.",
        color: "#2563EB",
      },
      {
        icon: "ai" as const,
        title: "AI enrichment reads evidence",
        description: "CV and portfolio are used as validation, so recommendations do not rely solely on self-reporting.",
        color: "#0F6E56",
      },
      {
        icon: "briefcase" as const,
        title: "Client posts job",
        description: "Project requirements, budget, deadline, and required skills become the demand side input.",
        color: "#854F0B",
      },
      {
        icon: "shield" as const,
        title: "Escrow mock maintains trust",
        description: "Funds are visualized as held, in progress, and then released after results are approved.",
        color: "#993C1D",
      },
    ],
    stepLabel: (index: number) => `Step ${index}`,
    cardTalentTitle: "For Talent",
    cardTalentDesc: "See skill gaps, matching jobs, and AI reasoning so career development is more focused.",
    cardTalentLink: "Sign up as talent",
    cardClientTitle: "For Clients",
    cardClientDesc: "Browse talents, post jobs, then see a shortlist with clear scores and reasoning.",
    cardClientLink: "Find talent",
    cardDemoTitle: "For Demo",
    cardDemoDesc: "Two main moments: AI Skill Gap after onboarding and AI Job Matching after client posts job.",
    cardDemoLink: "Browse public jobs",
  },
} as const;

export default function HowItWorksPage() {
  const [lang] = useLang();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main role="main" className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        <section className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] mb-5">
            <span>{t.tag1}</span>
            <span>{t.tag2}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 mb-4">
            {t.h1a}
            <span className="text-gradient-brand">{t.h1b}</span>
          </h1>
          <p className="text-surface-500 max-w-2xl">
            {t.subtitle}
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-5 mb-10">
          {t.steps.map((step, index) => (
            <div key={step.title} className="card p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: step.color }}
                >
                  <Icon name={step.icon} size={22} />
                </div>
                <div>
                  <div className="text-xs text-surface-400 mb-1">{t.stepLabel(index + 1)}</div>
                  <h2 className="font-bold text-surface-900 mb-2" >
                    {step.title}
                  </h2>
                  <p className="text-sm text-surface-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="card p-6">
            <h2 className="font-bold text-surface-900 mb-2" >
              {t.cardTalentTitle}
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              {t.cardTalentDesc}
            </p>
            <Link href="/register?role=talent" className="text-sm text-primary-600 font-medium">
              {t.cardTalentLink}
            </Link>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-surface-900 mb-2" >
              {t.cardClientTitle}
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              {t.cardClientDesc}
            </p>
            <Link href="/register?role=client" className="text-sm text-primary-600 font-medium">
              {t.cardClientLink}
            </Link>
          </div>
          <div className="card p-6">
            <h2 className="font-bold text-surface-900 mb-2" >
              {t.cardDemoTitle}
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              {t.cardDemoDesc}
            </p>
            <Link href="/jobs" className="text-sm text-primary-600 font-medium">
              {t.cardDemoLink}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
