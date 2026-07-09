"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    badge: "Keamanan Prioritas",
    h1a: "Kerja Tenang dengan ",
    h1b: "Sistem Pembayaran Escrow.",
    subtitle: "Tidak ada lagi drama klien kabur atau freelancer menghilang. Dana diamankan oleh pihak ketiga (Nyamby) hingga pekerjaan selesai dan disetujui bersama.",
    talentTitle: "Untuk Talenta",
    talentDesc: "Tidak perlu khawatir bekerja tanpa dibayar. Klien harus menyetorkan dana penuh sebelum pekerjaan dimulai. Fokus saja memberikan hasil terbaik.",
    talentItems: [
      "Dana 100% diamankan di awal",
      "Pencairan otomatis bila disetujui",
      "Perlindungan dari pembatalan sepihak",
    ],
    clientTitle: "Untuk Klien",
    clientDesc: "Uang Anda aman. Dana tidak akan diteruskan ke freelancer hingga Anda meninjau dan menyetujui hasil pekerjaannya sesuai kesepakatan.",
    clientItems: [
      "Hanya bayar untuk hasil yang disetujui",
      "Sistem resolusi sengketa yang adil",
      "Uang kembali jika freelancer wanprestasi",
    ],
    flowTitle: "Bagaimana Escrow Nyamby Bekerja?",
    flowSteps: [
      {
        icon: "check" as const,
        title: "1. Kesepakatan",
        desc: "Klien dan talenta sepakat pada harga dan tenggat waktu."
      },
      {
        icon: "money" as const,
        title: "2. Deposit Dana",
        desc: "Klien menyetor dana ke rekening bersama Nyamby (Escrow)."
      },
      {
        icon: "code" as const,
        title: "3. Pengerjaan",
        desc: "Talenta mulai bekerja dengan tenang karena dana sudah terjamin."
      },
      {
        icon: "bolt" as const,
        title: "4. Rilis Dana",
        desc: "Pekerjaan disetujui, dana otomatis diteruskan ke talenta."
      }
    ],
    ctaTitle: "Mulai Proyek Pertamamu dengan Aman",
    ctaSub: "Tinggalkan cara lama yang penuh risiko. Di Nyamby, semua pihak dilindungi.",
    ctaBtn: "Daftar Gratis Sekarang",
  },
  en: {
    badge: "Security First",
    h1a: "Work with Peace of Mind using ",
    h1b: "the Escrow Payment System.",
    subtitle: "No more drama of clients running away or freelancers disappearing. Funds are secured by a third party (Nyamby) until the work is completed and mutually approved.",
    talentTitle: "For Talent",
    talentDesc: "No need to worry about working without getting paid. Clients must deposit full funds before work begins. Just focus on delivering the best results.",
    talentItems: [
      "Funds 100% secured upfront",
      "Automatic release upon approval",
      "Protection from unilateral cancellation",
    ],
    clientTitle: "For Clients",
    clientDesc: "Your money is safe. Funds will not be forwarded to the freelancer until you review and approve their work according to the agreement.",
    clientItems: [
      "Only pay for approved results",
      "Fair dispute resolution system",
      "Money back if freelancer fails to deliver",
    ],
    flowTitle: "How Does Nyamby Escrow Work?",
    flowSteps: [
      {
        icon: "check" as const,
        title: "1. Agreement",
        desc: "Client and talent agree on the price and deadline."
      },
      {
        icon: "money" as const,
        title: "2. Fund Deposit",
        desc: "Client deposits funds into Nyamby's joint account (Escrow)."
      },
      {
        icon: "code" as const,
        title: "3. Execution",
        desc: "Talent starts working with peace of mind knowing funds are secured."
      },
      {
        icon: "bolt" as const,
        title: "4. Fund Release",
        desc: "Work is approved, funds are automatically forwarded to the talent."
      }
    ],
    ctaTitle: "Start Your First Project Safely",
    ctaSub: "Leave behind the risky old ways. On Nyamby, everyone is protected.",
    ctaBtn: "Sign Up Free Now",
  },
} as const;


export default function EscrowPage() {
  const [lang] = useLang();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />
      {/* SEO breadcrumb JSON-LD only — hero has no room for visible trail (PRD v5.3 §6.11) */}
      <Breadcrumb
        jsonLdOnly
        items={[
          { label: "Beranda", href: "/" },
          { label: "Fitur", href: "/#fitur" },
          { label: "Escrow Aman", href: "/fitur/escrow" },
        ]}
      />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px] -z-10 translate-x-1/3"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-cyan-600 shadow-sm">
            <Icon name="spark" size={16} /> {t.badge}
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
            {t.h1a} <br className="hidden md:block"/>
            <span className="text-cyan-600">{t.h1b}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* 2. Jaminan Keamanan */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-cyan-50 p-10 rounded-3xl border border-cyan-100">
              <Icon name="shield" size={48} className="text-cyan-600 mb-6" />
              <h3 className="text-2xl font-bold text-cyan-900 mb-4">{t.talentTitle}</h3>
              <p className="text-slate-600 mb-6">
                {t.talentDesc}
              </p>
              <ul className="space-y-3">
                {t.talentItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-cyan-500" size={18}/> {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200">
              <Icon name="briefcase" size={48} className="text-slate-600 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.clientTitle}</h3>
              <p className="text-slate-600 mb-6">
                {t.clientDesc}
              </p>
              <ul className="space-y-3">
                {t.clientItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium"><Icon name="check" className="text-slate-500" size={18}/> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Alur Transaksi */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">{t.flowTitle}</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-slate-700 -z-10"></div>
            
            {t.flowSteps.map((step, i) => (
              <div key={i} className="relative">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 border-slate-900 mb-6 ${i === 3 ? "bg-cyan-600 shadow-[0_0_30px_rgba(8,145,178,0.5)]" : "bg-slate-800"}`}>
                  <Icon name={step.icon} size={32} className={i === 3 ? "text-white" : "text-cyan-400"} />
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="bg-white py-20 px-6 text-center border-t border-slate-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">{t.ctaTitle}</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">
          {t.ctaSub}
        </p>
        <Link href="/register" className="btn-primary bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3.5 rounded-full font-bold shadow-xl transition-colors inline-block">
          {t.ctaBtn}
        </Link>
      </section>

      <Footer />
    </div>
  );
}
