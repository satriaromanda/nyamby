"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/lib/lang";
import "./coming-soon.css"; // Import the custom CSS

const copy = {
  id: {
    phaseTag: "Phase 2",
    phaseTagSub: "Dirilis 12–24 bulan ke depan",
    title: "Nyambi fisik,",
    titleEm: "juga bisa.",
    heroSub1: "Selama ini Nyamby membantu talenta digital menemukan klien yang tepat. Sekarang kami sedang membangun sesuatu yang lebih besar — ",
    heroSub2: "platform untuk semua jenis nyambi",
    heroSub3: ", termasuk yang datang langsung ke pintu rumahmu.",
    ctaPrimary: "Beritahu saya saat rilis →",
    ctaSecondary: "Lihat semua kategori",
    roadmapLabel: "Roadmap Platform",
    phase1Period: "Sekarang — Phase 1",
    phase1Title: "Digital Mode",
    phase1Title2: "Sedang Berjalan",
    phase1Desc: "Web developer & graphic designer terhubung ke klien UKM via AI matching.",
    phase2Period: "12–24 Bulan — Phase 2",
    phase2Title: "Physical Mode",
    phase2Title2: "Launch",
    phase2Desc: "Jasa tatap muka lokal masuk ke ekosistem Nyamby, lengkap dengan safety framework.",
    phase3Period: "24–36 Bulan — Phase 3",
    phase3Title: "Full Platform",
    phase3Title2: "SEA Expansion",
    phase3Desc: "Satu akun untuk semua jenis nyambi — digital dan fisik — di seluruh Asia Tenggara.",
    catIntroTitle: "Semua yang bisa",
    catIntroTitleEm: "kamu tawarkan.",
    catIntroSub: "Dari jasa digital sampai jasa fisik — semua dalam satu platform, satu akun, satu reputasi.",
    homeServicesName: "Home Services",
    homeServicesDesc: "Monetisasi waktu luangmu dengan menawarkan jasa rumahan yang dibutuhkan orang-orang di sekitarmu.",
    homeServicesExamples: ["Kebersihan rumah", "Bantuan pindahan", "Tata ruang", "Penitipan hewan"],
    skillSharingName: "Skill Sharing",
    skillSharingDesc: "Kalau kamu bisa mengajar, ada jutaan orang yang mau belajar. Ubah keahlianmu menjadi penghasilan nyata.",
    skillSharingExamples: ["Les privat akademik", "Kursus bahasa", "Les musik", "Kursus memasak"],
    casualName: "Casual & Sosial",
    casualDesc: "Waktu luangmu bernilai. Temani orang berolahraga, jalan-jalan, atau sekadar punya teman ngobrol.",
    casualExamples: ["Teman futsal", "Teman gym", "Teman jalan", "Teman nonton"],
    errandsName: "Errands",
    errandsDesc: "Hal-hal kecil yang memakan waktu. Bantu orang menyelesaikan urusan hariannya, kapan saja.",
    errandsExamples: ["Titip beli", "Antar dokumen", "Antre", "Keperluan harian"],
    safetyTitle: "Dibangun di atas",
    safetyTitleEm: "kepercayaan.",
    safetySub: "Ketemu orang baru butuh rasa aman. Physical Mode Nyamby dirancang dengan tiga lapis perlindungan — untuk penyedia jasa dan client.",
    layer1Sub: "Layer 1",
    layer1Title: "Verifikasi Identitas",
    layer1Items: ["KTP wajib untuk semua penyedia jasa fisik", "Selfie + liveness check otomatis", "Nomor HP terverifikasi", "Profil publik dengan badge \"Terverifikasi\""],
    layer2Sub: "Layer 2",
    layer2Title: "Transaksi Aman",
    layer2Items: ["Semua pembayaran via escrow platform — tidak ada transfer langsung", "Scan QR check-in saat penyedia tiba di lokasi", "Scan QR check-out saat jasa selesai", "Dana dirilis hanya setelah client konfirmasi"],
    layer3Sub: "Layer 3",
    layer3Title: "Komunitas Terpercaya",
    layer3Items: ["Rating wajib setelah setiap job selesai", "Review publik terbuka untuk semua pengguna", "Suspend otomatis jika menerima 3 laporan", "Admin mediasi dalam 48 jam untuk dispute"],
    notifyLabel: "Jangan ketinggalan",
    notifyTitle: "Jadilah yang pertama",
    notifyTitle2: "mencoba ",
    notifyTitleEm: "Physical Mode.",
    notifyDesc: "Masukkan emailmu dan kami akan beritahu kamu saat Physical Mode siap diluncurkan di kotamu.",
    inputName: "Namamu",
    inputEmail: "Email kamu",
    selectPlaceholder: "Aku ingin bergabung sebagai...",
    selectTalent: "Penyedia jasa fisik",
    selectClient: "Mencari penyedia jasa",
    selectBoth: "Keduanya",
    notifyBtn: "Beritahu saya →",
    notifySuccess: "✓ Berhasil didaftarkan!",
  },
  en: {
    phaseTag: "Phase 2",
    phaseTagSub: "Launching in 12–24 months",
    title: "Physical gigs,",
    titleEm: "now possible.",
    heroSub1: "So far Nyamby has helped digital talent find the right clients. Now we're building something bigger — ",
    heroSub2: "a platform for all kinds of side gigs",
    heroSub3: ", including those that come right to your doorstep.",
    ctaPrimary: "Notify me at launch →",
    ctaSecondary: "See all categories",
    roadmapLabel: "Platform Roadmap",
    phase1Period: "Now — Phase 1",
    phase1Title: "Digital Mode",
    phase1Title2: "Live",
    phase1Desc: "Web developers & graphic designers connected to SME clients via AI matching.",
    phase2Period: "12–24 Months — Phase 2",
    phase2Title: "Physical Mode",
    phase2Title2: "Launch",
    phase2Desc: "Local in-person services enter the Nyamby ecosystem, complete with a safety framework.",
    phase3Period: "24–36 Months — Phase 3",
    phase3Title: "Full Platform",
    phase3Title2: "SEA Expansion",
    phase3Desc: "One account for all types of side gigs — digital and physical — across Southeast Asia.",
    catIntroTitle: "Everything you can",
    catIntroTitleEm: "offer.",
    catIntroSub: "From digital services to physical gigs — all on one platform, one account, one reputation.",
    homeServicesName: "Home Services",
    homeServicesDesc: "Monetize your free time by offering home services that people around you need.",
    homeServicesExamples: ["House cleaning", "Moving help", "Interior organizing", "Pet sitting"],
    skillSharingName: "Skill Sharing",
    skillSharingDesc: "If you can teach, there are millions of people who want to learn. Turn your expertise into real income.",
    skillSharingExamples: ["Academic tutoring", "Language courses", "Music lessons", "Cooking classes"],
    casualName: "Casual & Social",
    casualDesc: "Your free time has value. Accompany someone exercising, sightseeing, or just having a chat.",
    casualExamples: ["Futsal buddy", "Gym partner", "Walking companion", "Movie pal"],
    errandsName: "Errands",
    errandsDesc: "Small things that eat up time. Help people finish their daily errands, anytime.",
    errandsExamples: ["Pickup orders", "Deliver documents", "Queue standing", "Daily needs"],
    safetyTitle: "Built on",
    safetyTitleEm: "trust.",
    safetySub: "Meeting new people requires a sense of safety. Nyamby's Physical Mode is designed with three layers of protection — for both service providers and clients.",
    layer1Sub: "Layer 1",
    layer1Title: "Identity Verification",
    layer1Items: ["Government ID required for all physical service providers", "Selfie + automatic liveness check", "Verified phone number", "Public profile with \"Verified\" badge"],
    layer2Sub: "Layer 2",
    layer2Title: "Secure Transactions",
    layer2Items: ["All payments via platform escrow — no direct transfers", "QR check-in scan when provider arrives at location", "QR check-out scan when service is complete", "Funds released only after client confirmation"],
    layer3Sub: "Layer 3",
    layer3Title: "Trusted Community",
    layer3Items: ["Mandatory rating after every completed job", "Public reviews open to all users", "Auto-suspend after 3 reports", "Admin mediation within 48 hours for disputes"],
    notifyLabel: "Don't miss out",
    notifyTitle: "Be the first to",
    notifyTitle2: "try ",
    notifyTitleEm: "Physical Mode.",
    notifyDesc: "Enter your email and we'll notify you when Physical Mode launches in your city.",
    inputName: "Your name",
    inputEmail: "Your email",
    selectPlaceholder: "I want to join as...",
    selectTalent: "Physical service provider",
    selectClient: "Looking for service providers",
    selectBoth: "Both",
    notifyBtn: "Notify me →",
    notifySuccess: "✓ Successfully registered!",
  },
} as const;

export default function ComingSoonPage() {
  const [lang] = useLang();
  const t = copy[lang];
  const [notified, setNotified] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animation = 'fadeUp .5s ease both';
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tl-phase, .cat-card, .safety-layer').forEach(el => {
      (el as HTMLElement).style.opacity = '0';
      observerRef.current?.observe(el);
      el.addEventListener('animationstart', () => (el as HTMLElement).style.opacity = '1');
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotified(true);
  };

  return (
    <div className="coming-soon-page">
      <Navbar />

      {/* HERO */}
      <section className="cs-hero mt-12 animate-[fadeUp_0.6s_ease_both_0.1s]">
        <div className="blob-wrap">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <div className="phase-tag animate-[fadeUp_0.6s_ease_both_0.2s]">
          <span>{t.phaseTag}</span>
          <span>·</span>
          {t.phaseTagSub}
        </div>

        <h1 className="cs-title animate-[fadeUp_0.6s_ease_both_0.3s]">
          {t.title}
          <em>{t.titleEm}</em>
        </h1>

        <p className="hero-sub animate-[fadeUp_0.6s_ease_both_0.45s]">
          {t.heroSub1}
          <strong>{t.heroSub2}</strong>
          {t.heroSub3}
        </p>

        <div className="hero-cta animate-[fadeUp_0.6s_ease_both_0.6s]">
          <a href="#notify" className="btn-primary-cs">
            {t.ctaPrimary}
          </a>
          <a href="#kategori" className="btn-ghost-cs">
            {t.ctaSecondary}
          </a>
        </div>
      </section>

      <hr className="cs-divider" />

      {/* TIMELINE */}
      <section className="timeline-section">
        <p className="section-label">{t.roadmapLabel}</p>

        <div className="timeline">
          <div className="tl-phase active">
            <p className="tl-period">{t.phase1Period}</p>
            <h3 className="tl-title">{t.phase1Title}<br/>{t.phase1Title2}</h3>
            <p className="tl-desc">{t.phase1Desc}</p>
            <div className="tl-pills">
              <span className="tl-pill">AI Matching</span>
              <span className="tl-pill">Skill Gap AI</span>
              <span className="tl-pill">Mock Escrow</span>
              <span className="tl-pill">Indonesia</span>
            </div>
          </div>

          <div className="tl-phase">
            <p className="tl-period">{t.phase2Period}</p>
            <h3 className="tl-title">{t.phase2Title}<br/>{t.phase2Title2}</h3>
            <p className="tl-desc">{t.phase2Desc}</p>
            <div className="tl-pills">
              <span className="tl-pill teal">Home Services</span>
              <span className="tl-pill teal">Skill Sharing</span>
              <span className="tl-pill teal">KTP Verify</span>
              <span className="tl-pill teal">Malaysia Digital</span>
            </div>
          </div>

          <div className="tl-phase">
            <p className="tl-period">{t.phase3Period}</p>
            <h3 className="tl-title">{t.phase3Title}<br/>{t.phase3Title2}</h3>
            <p className="tl-desc">{t.phase3Desc}</p>
            <div className="tl-pills">
              <span className="tl-pill amber">Casual & Sosial</span>
              <span className="tl-pill amber">Errands</span>
              <span className="tl-pill amber">SEA Market</span>
              <span className="tl-pill amber">10K+ Talenta</span>
            </div>
          </div>
        </div>
      </section>

      <hr className="cs-divider" />

      {/* CATEGORIES */}
      <section className="categories-section" id="kategori">
        <div className="cat-intro">
          <h2>{t.catIntroTitle}<br/><em>{t.catIntroTitleEm}</em></h2>
          <p>{t.catIntroSub}</p>
        </div>

        <div className="cat-grid">
          {/* Home Services */}
          <div className="cat-card">
            <span className="cat-phase-badge badge-p2">Phase 2</span>
            <div className="cat-icon home">🏠</div>
            <p className="cat-name">{t.homeServicesName}</p>
            <p className="cat-desc">{t.homeServicesDesc}</p>
            <div className="cat-examples">
              {t.homeServicesExamples.map((ex, i) => <span key={i} className="cat-ex">{ex}</span>)}
            </div>
          </div>

          {/* Skill Sharing */}
          <div className="cat-card">
            <span className="cat-phase-badge badge-p2">Phase 2</span>
            <div className="cat-icon skill">📚</div>
            <p className="cat-name">{t.skillSharingName}</p>
            <p className="cat-desc">{t.skillSharingDesc}</p>
            <div className="cat-examples">
              {t.skillSharingExamples.map((ex, i) => <span key={i} className="cat-ex">{ex}</span>)}
            </div>
          </div>

          {/* Casual & Sosial */}
          <div className="cat-card phase3">
            <span className="cat-phase-badge badge-p3">Phase 3</span>
            <div className="cat-icon social">🤝</div>
            <p className="cat-name">{t.casualName}</p>
            <p className="cat-desc">{t.casualDesc}</p>
            <div className="cat-examples">
              {t.casualExamples.map((ex, i) => <span key={i} className="cat-ex">{ex}</span>)}
            </div>
          </div>

          {/* Errands */}
          <div className="cat-card phase3">
            <span className="cat-phase-badge badge-p3">Phase 3</span>
            <div className="cat-icon errands">📦</div>
            <p className="cat-name">{t.errandsName}</p>
            <p className="cat-desc">{t.errandsDesc}</p>
            <div className="cat-examples">
              {t.errandsExamples.map((ex, i) => <span key={i} className="cat-ex">{ex}</span>)}
            </div>
          </div>
        </div>
      </section>

      <hr className="cs-divider" />

      {/* SAFETY FRAMEWORK */}
      <section className="safety-section">
        <div className="safety-header">
          <h2>{t.safetyTitle}<br/><em>{t.safetyTitleEm}</em></h2>
          <p>{t.safetySub}</p>
        </div>

        <div className="safety-layers">
          <div className="safety-layer">
            <span className="layer-num">1</span>
            <div className="layer-icon li-1">🪪</div>
            <p className="layer-subtitle">{t.layer1Sub}</p>
            <p className="layer-title">{t.layer1Title}</p>
            <div className="layer-items">
              {t.layer1Items.map((item, i) => <div key={i} className="layer-item">{item}</div>)}
            </div>
          </div>

          <div className="safety-layer">
            <span className="layer-num">2</span>
            <div className="layer-icon li-2">🔒</div>
            <p className="layer-subtitle">{t.layer2Sub}</p>
            <p className="layer-title">{t.layer2Title}</p>
            <div className="layer-items">
              {t.layer2Items.map((item, i) => <div key={i} className="layer-item">{item}</div>)}
            </div>
          </div>

          <div className="safety-layer">
            <span className="layer-num">3</span>
            <div className="layer-icon li-3">⭐</div>
            <p className="layer-subtitle">{t.layer3Sub}</p>
            <p className="layer-title">{t.layer3Title}</p>
            <div className="layer-items">
              {t.layer3Items.map((item, i) => <div key={i} className="layer-item">{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* NOTIFY */}
      <section className="notify-section" id="notify">
        <div className="notify-card">
          <div>
            <p className="notify-label">{t.notifyLabel}</p>
            <h2 className="notify-title">{t.notifyTitle}<br/>{t.notifyTitle2}<em>{t.notifyTitleEm}</em></h2>
            <p className="notify-desc">{t.notifyDesc}</p>
          </div>
          <form className="notify-form" onSubmit={handleSubmit}>
            <input className="notify-input" type="text" placeholder={t.inputName} required disabled={notified} />
            <input className="notify-input" type="email" placeholder={t.inputEmail} required disabled={notified} />
            <select className="notify-input" style={{cursor: "pointer"}} disabled={notified} defaultValue="">
              <option value="" disabled style={{color: "#999"}}>{t.selectPlaceholder}</option>
              <option value="talent">{t.selectTalent}</option>
              <option value="client">{t.selectClient}</option>
              <option value="both">{t.selectBoth}</option>
            </select>
            <button className={`notify-btn ${notified ? 'sent' : ''}`} type="submit" disabled={notified}>
              {notified ? t.notifySuccess : t.notifyBtn}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
