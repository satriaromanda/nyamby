"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    badge: "Misi Kami",
    h1a: "Mengubah \"Nyambi\" ",
    h1b: "Menjadi ",
    h1c: "Karier Profesional.",
    subtitle: "Nyamby lahir dari sebuah keresahan: banyak talenta digital luar biasa di Indonesia yang kesulitan menembus pasar kerja profesional, hanya karena mereka memulainya dari \"nyambi\" (pekerjaan sampingan).",
    storyTitleA: "Cerita di Balik ",
    storyTitleB: "Nyamby",
    storyP1: "Kami melihat <strong>banyak talenta berbakat yang kesulitan menemukan peluang kerja yang sesuai</strong>, sementara banyak individu dan bisnis membutuhkan bantuan untuk menyelesaikan berbagai pekerjaan.",
    storyP2: "<strong>Di tengah berkembangnya pekerjaan remote, freelance, part-time, hingga layanan berbasis tugas harian,</strong> kami melihat kebutuhan akan platform yang mampu mempertemukan keduanya secara lebih mudah dan terpercaya.",
    storyP3: "Nyamby hadir sebagai jembatan antara talenta dan peluang, membantu siapa pun menemukan pekerjaan, proyek, maupun bantuan yang mereka butuhkan—mulai dari kebutuhan personal hingga profesional.",
    quote: "\"Kami percaya bahwa kesempatan tidak seharusnya dibatasi oleh lokasi, gelar, atau koneksi. Setiap orang berhak mendapatkan peluang untuk bekerja, berkembang, dan menghasilkan.\n\nNyamby hadir untuk mempertemukan mereka yang membutuhkan bantuan dengan mereka yang memiliki kemampuan untuk membantu.\"",
    valuesTitle: "Nilai yang Kami Pegang",
    value1Title: "Meritokrasi Murni",
    value1Desc: "Kami percaya bakat ada di mana-mana. Sistem kami buta terhadap latar belakang kampus atau perusahaan lama, dan hanya fokus pada <strong>Skill</strong> aktual.",
    value2Title: "Keamanan Bersama",
    value2Desc: "Tidak ada pihak yang dirugikan. Escrow kami menjamin talenta dibayar atas keringatnya, dan klien mendapat hasil sesuai janjinya.",
    value3Title: "Pertumbuhan Agresif",
    value3Desc: "Kami bukan sekadar <strong>Job Portal</strong>. Kami adalah inkubator karier Anda dengan fitur analisis dan rute belajar berkelanjutan.",
    teamTitle: "Bertemu dengan Tim",
    teamSub: "Kami adalah sekumpulan desainer, engineer, dan pemimpi yang pernah berada di posisi Anda—memulai semuanya dari nyambi.",
    team: [
      { name: "Satria Romanda", role: "Co-Founder & Chief Product Officer", image: "/images/satria.jpg" },
      { name: "Rahmat Ramadhan", role: "Co-Founder & Head of Design & Community", image: "/images/rahmat.jpg" },
      { name: "Akbar Lubis", role: "Co-Founder & Chief Technology Officer", image: "/images/akbar.jpg" }
    ],
    ctaTitle: "Bergabung dalam Revolusi Ini",
    ctaSub: "Jadilah bagian dari ribuan talenta digital Indonesia yang sedang merintis masa depan mereka bersama kami.",
    ctaBtn: "Daftar Sekarang",
  },
  en: {
    badge: "Our Mission",
    h1a: "Turning \"Nyambi\" (Side Gigs) ",
    h1b: "Into ",
    h1c: "Professional Careers.",
    subtitle: "Nyamby was born from a concern: many extraordinary digital talents in Indonesia struggle to penetrate the professional job market, simply because they started from \"nyambi\" (side gigs).",
    storyTitleA: "The Story Behind ",
    storyTitleB: "Nyamby",
    storyP1: "We see <strong>many talented individuals struggling to find suitable job opportunities</strong>, while many individuals and businesses need help completing various tasks.",
    storyP2: "<strong>Amidst the rise of remote work, freelance, part-time, and daily task-based services,</strong> we see the need for a platform capable of bringing both together more easily and reliably.",
    storyP3: "Nyamby is here as a bridge between talent and opportunity, helping anyone find the jobs, projects, or help they need—from personal to professional needs.",
    quote: "\"We believe that opportunity should not be limited by location, degree, or connections. Everyone deserves a chance to work, grow, and earn.\n\nNyamby is here to bring together those who need help with those who have the ability to help.\"",
    valuesTitle: "Our Core Values",
    value1Title: "Pure Meritocracy",
    value1Desc: "We believe talent is everywhere. Our system is blind to university backgrounds or past companies, and focuses solely on actual <strong>Skills</strong>.",
    value2Title: "Mutual Security",
    value2Desc: "No party is disadvantaged. Our escrow guarantees talent gets paid for their sweat, and clients get the results they were promised.",
    value3Title: "Aggressive Growth",
    value3Desc: "We are not just a <strong>Job Portal</strong>. We are your career incubator with continuous analysis features and learning routes.",
    teamTitle: "Meet the Team",
    teamSub: "We are a group of designers, engineers, and dreamers who have been in your shoes—starting it all from a side gig.",
    team: [
      { name: "Satria Romanda", role: "Co-Founder & Chief Product Officer", image: "/images/satria.jpg" },
      { name: "Rahmat Ramadhan", role: "Co-Founder & Head of Design & Community", image: "/images/rahmat.jpg" },
      { name: "Akbar Lubis", role: "Co-Founder & Chief Technology Officer", image: "/images/akbar.jpg" }
    ],
    ctaTitle: "Join the Revolution",
    ctaSub: "Be part of thousands of Indonesian digital talents who are pioneering their future with us.",
    ctaBtn: "Sign Up Now",
  },
} as const;


export default function TentangKamiPage() {
  const [lang] = useLang();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)] -z-10" aria-hidden="true" />
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-600">
            {t.badge}
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            {t.h1a} <br className="hidden md:block" />
            {t.h1b}<span className="text-gradient-brand">{t.h1c}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* 2. Latar Belakang */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold mb-6 text-slate-900 tracking-tight">{t.storyTitleA}<span className="text-[#2563eb]">{t.storyTitleB}</span></h2>

            <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
              <p dangerouslySetInnerHTML={{ __html: t.storyP1 }} />
              <p dangerouslySetInnerHTML={{ __html: t.storyP2 }} />
              <p dangerouslySetInnerHTML={{ __html: t.storyP3 }} />
            </div>

            <div className="p-6 md:p-8 rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
              <p className="italic text-slate-800 leading-relaxed text-[15px] font-medium whitespace-pre-line">
                {t.quote}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="w-full aspect-square md:aspect-[4/5] bg-slate-50/50 rounded-3xl overflow-hidden flex items-center justify-center relative">
              {/* Fallback Icon behind the image */}
              <Icon name="image" size={48} className="absolute z-0 text-slate-200" />

              <Image
                src="/images/cerita-mascot.png"
                alt="Nyamby Mascot"
                fill
                className="object-contain p-4 z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Value Perusahaan */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">{t.valuesTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 flex items-center justify-center rounded-2xl mb-6">
                <Icon name="check" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">{t.value1Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t.value1Desc }} />
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-2xl mb-6">
                <Icon name="shield" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">{t.value2Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t.value2Desc }} />
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl mb-6">
                <Icon name="chart" size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">{t.value3Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t.value3Desc }} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tim */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t.teamTitle}</h2>
          <p className="text-slate-500 mb-16 max-w-2xl mx-auto">{t.teamSub}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {t.team.map((member, i) => (
              <div key={i} className="space-y-4">
                <div className="w-32 h-32 mx-auto bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-slate-400 relative border-4 border-white shadow-lg">
                  <Icon name="user" size={40} className="absolute z-0 opacity-50" />
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover z-10"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{member.name}</h3>
                  <p className="text-sm text-primary-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-slate-900 text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.ctaTitle}</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          {t.ctaSub}
        </p>
        <Link href="/register" className="btn-primary px-8 py-3.5 rounded-full font-bold shadow-xl transition-colors inline-block">
          {t.ctaBtn}
        </Link>
      </section>

      <Footer />
    </div>
  );
}
