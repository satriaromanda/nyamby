"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const helpCategories = [
  {
    icon: "user" as const,
    title: "Memulai",
    description: "Panduan pendaftaran, profil, dan langkah pertama di Nyamby.",
    color: "#2563EB",
    bg: "#eff6ff",
  },
  {
    icon: "settings" as const,
    title: "Akun & Profil",
    description: "Pengaturan akun, keamanan, dan manajemen profil.",
    color: "#0F6E56",
    bg: "#e6f2ee",
  },
  {
    icon: "money" as const,
    title: "Pembayaran",
    description: "Escrow, penarikan dana, invoice, dan metode pembayaran.",
    color: "#854F0B",
    bg: "#faeeda",
  },
  {
    icon: "shield" as const,
    title: "Keamanan",
    description: "Verifikasi identitas, perlindungan data, dan pelaporan.",
    color: "#993C1D",
    bg: "#f5ebe6",
  },
];

const faqs = [
  {
    question: "Apa itu Nyamby?",
    answer: "Nyamby adalah platform marketplace talenta berbasis AI yang menghubungkan freelancer dan penyedia jasa dengan klien yang membutuhkan. Kami menggunakan teknologi AI untuk mencocokkan talenta dengan peluang kerja yang paling relevan.",
  },
  {
    question: "Bagaimana cara mendaftar sebagai talenta?",
    answer: "Klik tombol 'Mulai' di halaman utama, pilih peran 'Talenta', lalu isi profil kamu termasuk skill, pengalaman, rate, dan upload portfolio. Sistem AI kami akan langsung mulai mencarikan job yang cocok untukmu.",
  },
  {
    question: "Bagaimana cara mendaftar sebagai klien?",
    answer: "Klik 'Mulai' di halaman utama, pilih peran 'Client', lalu lengkapi profil perusahaan atau personal kamu. Setelah itu, kamu bisa langsung memposting job dan menerima rekomendasi talenta dari AI kami.",
  },
  {
    question: "Apakah Nyamby gratis?",
    answer: "Pendaftaran dan pembuatan profil di Nyamby sepenuhnya gratis. Kami hanya mengenakan biaya layanan kecil saat transaksi berhasil terjadi melalui sistem escrow kami.",
  },
  {
    question: "Bagaimana sistem escrow bekerja?",
    answer: "Ketika klien menyetujui project, dana akan ditahan di escrow Nyamby. Talenta bisa melihat bahwa dana sudah aman. Setelah pekerjaan selesai dan disetujui klien, dana akan dirilis ke talenta. Ini melindungi kedua belah pihak.",
  },
  {
    question: "Bagaimana AI Matching bekerja?",
    answer: "AI kami menganalisis profil talenta (skill, pengalaman, portfolio, rate) dan kebutuhan job (skill yang dibutuhkan, budget, deadline) untuk memberikan skor relevansi. Semakin lengkap profilmu, semakin akurat matchingnya.",
  },
  {
    question: "Bagaimana jika terjadi dispute dengan klien/talenta?",
    answer: "Nyamby memiliki sistem dispute resolution. Jika terjadi perselisihan, kedua pihak bisa mengajukan dispute. Tim admin kami akan memediasi dalam 48 jam untuk menemukan solusi yang adil.",
  },
  {
    question: "Apakah data saya aman?",
    answer: "Ya, kami menggunakan enkripsi end-to-end untuk data sensitif, verifikasi identitas berlapis, dan mengikuti standar keamanan industri. Baca halaman Keamanan kami untuk detail lengkap.",
  },
  {
    question: "Bagaimana cara menghubungi support?",
    answer: "Kamu bisa menghubungi kami melalui email di support@nyamby.id atau melalui halaman Kontak. Tim support kami beroperasi Senin-Jumat, 09:00-18:00 WIB.",
  },
  {
    question: "Apakah Nyamby tersedia di luar Indonesia?",
    answer: "Saat ini Nyamby fokus melayani pasar Indonesia. Kami sedang dalam proses ekspansi ke Malaysia melalui program Global (MY). Pantau terus update kami untuk ekspansi ke negara lain di Asia Tenggara.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)] -z-10" aria-hidden="true" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-primary-600 shadow-sm">
            <Icon name="book" size={16} /> Help Center
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Bagaimana Kami Bisa <br className="hidden md:block" />
            <span className="text-gradient-brand">Membantumu?</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Temukan jawaban untuk pertanyaan umum atau hubungi tim support kami.
          </p>
          {/* Search Bar (UI only) */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan atau topik..."
                className="input-dark pl-12 py-3.5 rounded-2xl text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {helpCategories.map((cat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: cat.bg }}
              >
                <Icon name={cat.icon} size={22} className="transition-transform group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-[15px]">{cat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 mb-3 tracking-wide uppercase">FAQ</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 ${
                  openIndex === i
                    ? "border-primary-200 bg-primary-50/30 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-900 text-[15px] pr-4">{faq.question}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === i ? "bg-primary-100 rotate-180" : "bg-slate-100"
                  }`}>
                    <Icon name="chevronDown" size={16} className={openIndex === i ? "text-primary-600" : "text-slate-500"} />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Masih Butuh Bantuan?</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">Jika kamu tidak menemukan jawaban yang dicari, tim support kami siap membantu.</p>
            <Link
              href="/perusahaan/kontak"
              className="btn-primary px-8 py-3 rounded-xl font-medium text-sm inline-block"
            >
              Hubungi Kami →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
