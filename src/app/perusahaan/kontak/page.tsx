"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const contactChannels = [
  {
    icon: "mail" as const,
    title: "Email",
    value: "halo@nyamby.id",
    description: "Untuk pertanyaan umum dan partnership",
    href: "mailto:halo@nyamby.id",
    color: "#2563EB",
    bg: "#eff6ff",
  },
  {
    icon: "shield" as const,
    title: "Bantuan & Support",
    value: "support@nyamby.id",
    description: "Masalah akun, pembayaran, atau teknis",
    href: "mailto:support@nyamby.id",
    color: "#0F6E56",
    bg: "#e6f2ee",
  },
  {
    icon: "briefcase" as const,
    title: "Karier",
    value: "karier@nyamby.id",
    description: "Bergabung dengan tim Nyamby",
    href: "mailto:karier@nyamby.id",
    color: "#854F0B",
    bg: "#faeeda",
  },
];

export default function KontakPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)] -z-10" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-[120px] -z-10 translate-x-1/4"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold text-primary-600 shadow-sm">
            <Icon name="mail" size={16} /> Hubungi Kami
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Ada yang Bisa <br className="hidden md:block" />
            <span className="text-gradient-brand">Kami Bantu?</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Tim kami siap membantu menjawab pertanyaan, mendengar masukan, atau mendiskusikan peluang kolaborasi.
          </p>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {contactChannels.map((ch, i) => (
            <a
              key={i}
              href={ch.href}
              className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group block"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: ch.bg }}
              >
                <Icon name={ch.icon} size={22} className="transition-transform group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{ch.title}</h3>
              <p className="text-primary-600 font-medium text-sm mb-2">{ch.value}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{ch.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Kirim Pesan</h2>
            <p className="text-slate-500 mb-8">Isi form di bawah ini dan kami akan merespon dalam 1-2 hari kerja.</p>

            {submitted ? (
              <div className="p-8 rounded-2xl border border-green-200 bg-green-50 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="check" size={28} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Pesan Terkirim!</h3>
                <p className="text-green-700 text-sm">Terima kasih sudah menghubungi kami. Tim kami akan segera merespon pesan kamu.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan namamu"
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="email@contoh.com"
                      className="input-dark"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subjek</label>
                  <select className="input-dark" style={{ cursor: "pointer" }} defaultValue="" required>
                    <option value="" disabled>Pilih topik...</option>
                    <option value="umum">Pertanyaan Umum</option>
                    <option value="support">Bantuan Teknis</option>
                    <option value="partnership">Partnership</option>
                    <option value="media">Media & Press</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pesan</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tulis pesanmu di sini..."
                    className="input-dark resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary px-8 py-3 rounded-xl font-medium text-sm w-full md:w-auto"
                >
                  Kirim Pesan →
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Kantor Kami</h3>
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAFAF8]">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Nyamby HQ</strong><br />
                  Bandar Lampung, Lampung<br />
                  Indonesia
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Jam Operasional</h3>
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAFAF8] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Senin — Jumat</span>
                  <span className="text-slate-900 font-medium">09:00 — 18:00 WIB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sabtu — Minggu</span>
                  <span className="text-slate-900 font-medium">Tutup</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Ikuti Kami</h3>
              <div className="flex gap-3">
                {(["twitter", "instagram", "linkedin", "github"] as const).map((social) => (
                  <a
                    key={social}
                    href="#"
                    aria-label={social}
                    className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <Icon name={social} size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
