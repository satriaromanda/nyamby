import Link from "next/link";
import { Icon, Logo } from "@/components/icons";

const steps = [
  {
    icon: "user" as const,
    title: "Talenta melengkapi profil",
    description: "Skill, level, rate, bio, CV, dan portfolio digabung menjadi konteks terstruktur untuk matching.",
    color: "#534AB7",
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
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/talents" className="text-surface-500 hover:text-surface-900">Talenta</Link>
            <Link href="/jobs" className="text-surface-500 hover:text-surface-900">Jobs</Link>
            <Link href="/register" className="btn-primary text-xs px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">Mulai</Link>
          </div>
        </div>
      </nav>

      <main role="main" className="max-w-6xl mx-auto px-6 py-12">
        <section className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] mb-5">
            <span>AI enrichment</span>
            <span>Trust-first marketplace</span>
          </div>
          <h1 className="text-4xl font-bold text-surface-900 mb-4" style={{ fontFamily: "Outfit" }}>
            Cara Nyamby Mengubah Nyambi Menjadi Karir
          </h1>
          <p className="text-surface-500 max-w-2xl">
            Nyamby membiarkan user menjelajah talenta dan job terlebih dahulu, lalu memakai AI untuk membuat keputusan matching lebih kredibel saat mereka siap daftar.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-5 mb-10">
          {steps.map((step, index) => (
            <div key={step.title} className="glass rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: step.color }}
                >
                  <Icon name={step.icon} size={22} />
                </div>
                <div>
                  <div className="text-xs text-surface-400 mb-1">Step {index + 1}</div>
                  <h2 className="font-bold text-surface-900 mb-2" style={{ fontFamily: "Outfit" }}>
                    {step.title}
                  </h2>
                  <p className="text-sm text-surface-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="glass rounded-xl p-6">
            <h2 className="font-bold text-surface-900 mb-2" style={{ fontFamily: "Outfit" }}>
              Untuk Talenta
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              Lihat skill gap, job yang cocok, dan alasan AI agar pengembangan karir lebih terarah.
            </p>
            <Link href="/register?role=talent" className="text-sm text-primary-600 font-medium">
              Daftar sebagai talenta
            </Link>
          </div>
          <div className="glass rounded-xl p-6">
            <h2 className="font-bold text-surface-900 mb-2" style={{ fontFamily: "Outfit" }}>
              Untuk Client
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              Browse talenta, post job, lalu lihat shortlist dengan score dan reasoning yang jelas.
            </p>
            <Link href="/register?role=client" className="text-sm text-primary-600 font-medium">
              Cari talenta
            </Link>
          </div>
          <div className="glass rounded-xl p-6">
            <h2 className="font-bold text-surface-900 mb-2" style={{ fontFamily: "Outfit" }}>
              Untuk Demo
            </h2>
            <p className="text-sm text-surface-500 mb-4">
              Dua momen utama: AI Skill Gap setelah onboarding dan AI Job Matching setelah client post job.
            </p>
            <Link href="/jobs" className="text-sm text-primary-600 font-medium">
              Browse job publik
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
