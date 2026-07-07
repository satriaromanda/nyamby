"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icons";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";

const copy = {
  id: {
    contactUs: "Hubungi Kami",
    titleA: "Ada yang Bisa ",
    titleB: "Kami Bantu?",
    subtitle: "Tim kami siap membantu menjawab pertanyaan, mendengar masukan, atau mendiskusikan peluang kolaborasi.",
    channels: [
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
    ],
    formTitle: "Kirim Pesan",
    formDesc: "Isi form di bawah ini dan kami akan merespon dalam 1-2 hari kerja.",
    sentTitle: "Pesan Terkirim!",
    sentDesc: "Terima kasih sudah menghubungi kami. Tim kami akan segera merespon pesan kamu.",
    nameLabel: "Nama Lengkap",
    namePlaceholder: "Masukkan namamu",
    emailLabel: "Email",
    emailPlaceholder: "email@contoh.com",
    subjectLabel: "Subjek",
    subjectPlaceholder: "Pilih topik...",
    subjectOptions: [
      { value: "umum", label: "Pertanyaan Umum" },
      { value: "support", label: "Bantuan Teknis" },
      { value: "partnership", label: "Partnership" },
      { value: "media", label: "Media & Press" },
      { value: "lainnya", label: "Lainnya" },
    ],
    msgLabel: "Pesan",
    msgPlaceholder: "Tulis pesanmu di sini...",
    sendBtn: "Kirim Pesan →",
    officeTitle: "Kantor Kami",
    officeLoc: "Nyamby HQ",
    officeAddress: "Bandar Lampung, Lampung\nIndonesia",
    hoursTitle: "Jam Operasional",
    hoursWeekday: "Senin — Jumat",
    hoursWeekend: "Sabtu — Minggu",
    closed: "Tutup",
    followTitle: "Ikuti Kami",
  },
  en: {
    contactUs: "Contact Us",
    titleA: "How Can We ",
    titleB: "Help You?",
    subtitle: "Our team is ready to answer questions, listen to feedback, or discuss collaboration opportunities.",
    channels: [
      {
        icon: "mail" as const,
        title: "Email",
        value: "halo@nyamby.id",
        description: "For general inquiries and partnerships",
        href: "mailto:halo@nyamby.id",
        color: "#2563EB",
        bg: "#eff6ff",
      },
      {
        icon: "shield" as const,
        title: "Help & Support",
        value: "support@nyamby.id",
        description: "Account, payment, or technical issues",
        href: "mailto:support@nyamby.id",
        color: "#0F6E56",
        bg: "#e6f2ee",
      },
      {
        icon: "briefcase" as const,
        title: "Careers",
        value: "karier@nyamby.id",
        description: "Join the Nyamby team",
        href: "mailto:karier@nyamby.id",
        color: "#854F0B",
        bg: "#faeeda",
      },
    ],
    formTitle: "Send a Message",
    formDesc: "Fill out the form below and we will respond within 1-2 business days.",
    sentTitle: "Message Sent!",
    sentDesc: "Thank you for contacting us. Our team will respond to your message shortly.",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your name",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    subjectLabel: "Subject",
    subjectPlaceholder: "Select a topic...",
    subjectOptions: [
      { value: "umum", label: "General Inquiry" },
      { value: "support", label: "Technical Support" },
      { value: "partnership", label: "Partnership" },
      { value: "media", label: "Media & Press" },
      { value: "lainnya", label: "Other" },
    ],
    msgLabel: "Message",
    msgPlaceholder: "Write your message here...",
    sendBtn: "Send Message →",
    officeTitle: "Our Office",
    officeLoc: "Nyamby HQ",
    officeAddress: "Bandar Lampung, Lampung\nIndonesia",
    hoursTitle: "Business Hours",
    hoursWeekday: "Monday — Friday",
    hoursWeekend: "Saturday — Sunday",
    closed: "Closed",
    followTitle: "Follow Us",
  },
} as const;

export default function KontakPage() {
  const [lang] = useLang();
  const t = copy[lang];
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
            <Icon name="mail" size={16} /> {t.contactUs}
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            {t.titleA}<br className="hidden md:block" />
            <span className="text-gradient-brand">{t.titleB}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {t.channels.map((ch, i) => (
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
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{t.formTitle}</h2>
            <p className="text-slate-500 mb-8">{t.formDesc}</p>

            {submitted ? (
              <div className="p-8 rounded-2xl border border-green-200 bg-green-50 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="check" size={28} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">{t.sentTitle}</h3>
                <p className="text-green-700 text-sm">{t.sentDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t.nameLabel}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.namePlaceholder}
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t.emailLabel}</label>
                    <input
                      type="email"
                      required
                      placeholder={t.emailPlaceholder}
                      className="input-dark"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.subjectLabel}</label>
                  <select className="input-dark" style={{ cursor: "pointer" }} defaultValue="" required>
                    <option value="" disabled>{t.subjectPlaceholder}</option>
                    {t.subjectOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.msgLabel}</label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t.msgPlaceholder}
                    className="input-dark resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary px-8 py-3 rounded-xl font-medium text-sm w-full md:w-auto"
                >
                  {t.sendBtn}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg">{t.officeTitle}</h3>
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAFAF8]">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  <strong className="text-slate-900">{t.officeLoc}</strong><br />
                  {t.officeAddress}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg">{t.hoursTitle}</h3>
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#FAFAF8] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t.hoursWeekday}</span>
                  <span className="text-slate-900 font-medium">09:00 — 18:00 WIB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t.hoursWeekend}</span>
                  <span className="text-slate-900 font-medium">{t.closed}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg">{t.followTitle}</h3>
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
