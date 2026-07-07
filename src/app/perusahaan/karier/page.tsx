import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karier di Nyamby — Bergabung dengan Tim Kami",
  description: "Lowongan kerja di Nyamby. Bantu kami membangun platform AI career companion untuk talenta digital Indonesia.",
  alternates: {
    canonical: "/perusahaan/karier"
  }
};


const values = [
  {
    icon: "spark" as const,
    title: "Inovasi Tanpa Henti",
    description: "Kami selalu mencari cara baru untuk menghubungkan talenta dengan peluang menggunakan teknologi AI terdepan.",
    color: "#2563EB",
    bg: "#eff6ff",
  },
  {
    icon: "users" as const,
    title: "Inklusivitas",
    description: "Setiap orang berhak mendapat kesempatan, tanpa memandang latar belakang, lokasi, atau gelar.",
    color: "#0F6E56",
    bg: "#e6f2ee",
  },
  {
    icon: "shield" as const,
    title: "Kepercayaan",
    description: "Kami membangun platform di atas fondasi keamanan, transparansi, dan akuntabilitas.",
    color: "#993C1D",
    bg: "#f5ebe6",
  },
  {
    icon: "trendingUp" as const,
    title: "Pertumbuhan Bersama",
    description: "Kesuksesan tim kami adalah kesuksesan komunitas talenta dan klien yang kami layani.",
    color: "#854F0B",
    bg: "#faeeda",
  },
];

const positions = [
  {
    title: "Frontend Engineer",
    team: "Engineering",
    type: "Full-time · Remote",
    description: "Bangun antarmuka pengguna yang indah dan responsif menggunakan Next.js dan React.",
  },
  {
    title: "AI/ML Engineer",
    team: "AI & Data",
    type: "Full-time · Remote",
    description: "Kembangkan model AI matching dan skill gap analysis untuk mempertemukan talenta dengan peluang terbaik.",
  },
  {
    title: "Product Designer",
    team: "Design",
    type: "Full-time · Remote",
    description: "Rancang pengalaman pengguna yang intuitif dan menyenangkan untuk platform marketplace talenta.",
  },
  {
    title: "Community Manager",
    team: "Growth",
    type: "Full-time · Bandar Lampung",
    description: "Bangun dan kelola komunitas talenta & klien Nyamby, serta jalankan program engagement.",
  },
];

export default function KarierPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)] -z-10" aria-hidden="true" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-primary-600 shadow-sm">
            <Icon name="users" size={16} /> Bergabung Bersama Kami
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Bangun Masa Depan <br className="hidden md:block" />
            <span className="text-gradient-brand">Dunia Kerja Indonesia.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Di Nyamby, kami percaya setiap orang berhak mendapat kesempatan. Bergabunglah dengan tim kami dan bantu jutaan talenta Indonesia menemukan peluang karier terbaik mereka.
          </p>
          <div className="pt-2">
            <a href="#posisi" className="btn-primary px-8 py-3 rounded-full font-medium text-sm shadow-lg hover:-translate-y-0.5 transition-transform inline-block">
              Lihat Posisi Terbuka ↓
            </a>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 mb-3 tracking-wide uppercase">Budaya Kami</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Nilai yang Kami Pegang</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: v.bg }}
                >
                  <Icon name={v.icon} size={22} className="transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-[15px]">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 mb-3 tracking-wide uppercase">Keuntungan</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Kenapa Bergabung di Nyamby?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: "🌍", title: "Remote-First", desc: "Kerja dari mana saja. Kami percaya produktivitas tidak harus terikat lokasi." },
              { emoji: "📈", title: "Equity & Growth", desc: "Kompensasi kompetitif dengan opsi equity. Tumbuh bersama perusahaan." },
              { emoji: "🎓", title: "Learning Budget", desc: "Anggaran belajar tahunan untuk kursus, konferensi, dan pengembangan skill." },
              { emoji: "🏥", title: "Health Insurance", desc: "Asuransi kesehatan untuk kamu dan keluarga, termasuk gigi dan mata." },
              { emoji: "🏖️", title: "Flexible PTO", desc: "Cuti fleksibel yang cukup untuk istirahat dan recharge kapan saja." },
              { emoji: "🤝", title: "Team Retreats", desc: "Meetup tim reguler di berbagai kota untuk bonding dan brainstorming." },
            ].map((b, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{b.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 px-6 bg-white" id="posisi">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 mb-3 tracking-wide uppercase">Posisi Terbuka</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Temukan Peranmu</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Kami mencari orang-orang yang bersemangat membangun teknologi untuk memberdayakan talenta Indonesia.</p>
          </div>
          <div className="space-y-4">
            {positions.map((p, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-primary-300 hover:shadow-md transition-all duration-300 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 text-lg">{p.title}</h3>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 font-medium">{p.team}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">{p.description}</p>
                    <p className="text-xs text-slate-400">{p.type}</p>
                  </div>
                  <a
                    href="mailto:karier@nyamby.id"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shrink-0"
                  >
                    Lamar <Icon name="arrowRight" size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm">
              Tidak menemukan posisi yang cocok?{" "}
              <a href="mailto:karier@nyamby.id" className="text-primary-600 font-medium hover:underline">
                Kirim CV spekulatif →
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
