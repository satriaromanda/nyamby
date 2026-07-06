"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./coming-soon.css"; // Import the custom CSS

export default function ComingSoonPage() {
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
          <span>Phase 2</span>
          <span>·</span>
          Dirilis 12–24 bulan ke depan
        </div>

        <h1 className="cs-title animate-[fadeUp_0.6s_ease_both_0.3s]">
          Nyambi fisik,
          <em>juga bisa.</em>
        </h1>

        <p className="hero-sub animate-[fadeUp_0.6s_ease_both_0.45s]">
          Selama ini Nyamby membantu talenta digital menemukan klien yang tepat.
          Sekarang kami sedang membangun sesuatu yang lebih besar — 
          <strong>platform untuk semua jenis nyambi</strong>, 
          termasuk yang datang langsung ke pintu rumahmu.
        </p>

        <div className="hero-cta animate-[fadeUp_0.6s_ease_both_0.6s]">
          <a href="#notify" className="btn-primary-cs">
            Beritahu saya saat rilis →
          </a>
          <a href="#kategori" className="btn-ghost-cs">
            Lihat semua kategori
          </a>
        </div>
      </section>

      <hr className="cs-divider" />

      {/* TIMELINE */}
      <section className="timeline-section">
        <p className="section-label">Roadmap Platform</p>

        <div className="timeline">
          <div className="tl-phase active">
            <p className="tl-period">Sekarang — Phase 1</p>
            <h3 className="tl-title">Digital Mode<br/>Sedang Berjalan</h3>
            <p className="tl-desc">Web developer & graphic designer terhubung ke klien UKM via AI matching.</p>
            <div className="tl-pills">
              <span className="tl-pill">AI Matching</span>
              <span className="tl-pill">Skill Gap AI</span>
              <span className="tl-pill">Mock Escrow</span>
              <span className="tl-pill">Indonesia</span>
            </div>
          </div>

          <div className="tl-phase">
            <p className="tl-period">12–24 Bulan — Phase 2</p>
            <h3 className="tl-title">Physical Mode<br/>Launch</h3>
            <p className="tl-desc">Jasa tatap muka lokal masuk ke ekosistem Nyamby, lengkap dengan safety framework.</p>
            <div className="tl-pills">
              <span className="tl-pill teal">Home Services</span>
              <span className="tl-pill teal">Skill Sharing</span>
              <span className="tl-pill teal">KTP Verify</span>
              <span className="tl-pill teal">Malaysia Digital</span>
            </div>
          </div>

          <div className="tl-phase">
            <p className="tl-period">24–36 Bulan — Phase 3</p>
            <h3 className="tl-title">Full Platform<br/>SEA Expansion</h3>
            <p className="tl-desc">Satu akun untuk semua jenis nyambi — digital dan fisik — di seluruh Asia Tenggara.</p>
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
          <h2>Semua yang bisa<br/><em>kamu tawarkan.</em></h2>
          <p>Dari jasa digital sampai jasa fisik — semua dalam satu platform, satu akun, satu reputasi.</p>
        </div>

        <div className="cat-grid">
          {/* Home Services */}
          <div className="cat-card">
            <span className="cat-phase-badge badge-p2">Phase 2</span>
            <div className="cat-icon home">🏠</div>
            <p className="cat-name">Home Services</p>
            <p className="cat-desc">
              Monetisasi waktu luangmu dengan menawarkan jasa rumahan yang dibutuhkan orang-orang di sekitarmu.
            </p>
            <div className="cat-examples">
              <span className="cat-ex">Kebersihan rumah</span>
              <span className="cat-ex">Bantuan pindahan</span>
              <span className="cat-ex">Tata ruang</span>
              <span className="cat-ex">Penitipan hewan</span>
            </div>
          </div>

          {/* Skill Sharing */}
          <div className="cat-card">
            <span className="cat-phase-badge badge-p2">Phase 2</span>
            <div className="cat-icon skill">📚</div>
            <p className="cat-name">Skill Sharing</p>
            <p className="cat-desc">
              Kalau kamu bisa mengajar, ada jutaan orang yang mau belajar. Ubah keahlianmu menjadi penghasilan nyata.
            </p>
            <div className="cat-examples">
              <span className="cat-ex">Les privat akademik</span>
              <span className="cat-ex">Kursus bahasa</span>
              <span className="cat-ex">Les musik</span>
              <span className="cat-ex">Kursus memasak</span>
            </div>
          </div>

          {/* Casual & Sosial */}
          <div className="cat-card phase3">
            <span className="cat-phase-badge badge-p3">Phase 3</span>
            <div className="cat-icon social">🤝</div>
            <p className="cat-name">Casual & Sosial</p>
            <p className="cat-desc">
              Waktu luangmu bernilai. Temani orang berolahraga, jalan-jalan, atau sekadar punya teman ngobrol.
            </p>
            <div className="cat-examples">
              <span className="cat-ex">Teman futsal</span>
              <span className="cat-ex">Teman gym</span>
              <span className="cat-ex">Teman jalan</span>
              <span className="cat-ex">Teman nonton</span>
            </div>
          </div>

          {/* Errands */}
          <div className="cat-card phase3">
            <span className="cat-phase-badge badge-p3">Phase 3</span>
            <div className="cat-icon errands">📦</div>
            <p className="cat-name">Errands</p>
            <p className="cat-desc">
              Hal-hal kecil yang memakan waktu. Bantu orang menyelesaikan urusan hariannya, kapan saja.
            </p>
            <div className="cat-examples">
              <span className="cat-ex">Titip beli</span>
              <span className="cat-ex">Antar dokumen</span>
              <span className="cat-ex">Antre</span>
              <span className="cat-ex">Keperluan harian</span>
            </div>
          </div>
        </div>
      </section>

      <hr className="cs-divider" />

      {/* SAFETY FRAMEWORK */}
      <section className="safety-section">
        <div className="safety-header">
          <h2>Dibangun di atas<br/><em>kepercayaan.</em></h2>
          <p>Ketemu orang baru butuh rasa aman. Physical Mode Nyamby dirancang dengan tiga lapis perlindungan — untuk penyedia jasa dan client.</p>
        </div>

        <div className="safety-layers">
          <div className="safety-layer">
            <span className="layer-num">1</span>
            <div className="layer-icon li-1">🪪</div>
            <p className="layer-subtitle">Layer 1</p>
            <p className="layer-title">Verifikasi Identitas</p>
            <div className="layer-items">
              <div className="layer-item">KTP wajib untuk semua penyedia jasa fisik</div>
              <div className="layer-item">Selfie + liveness check otomatis</div>
              <div className="layer-item">Nomor HP terverifikasi</div>
              <div className="layer-item">Profil publik dengan badge "Terverifikasi"</div>
            </div>
          </div>

          <div className="safety-layer">
            <span className="layer-num">2</span>
            <div className="layer-icon li-2">🔒</div>
            <p className="layer-subtitle">Layer 2</p>
            <p className="layer-title">Transaksi Aman</p>
            <div className="layer-items">
              <div className="layer-item">Semua pembayaran via escrow platform — tidak ada transfer langsung</div>
              <div className="layer-item">Scan QR check-in saat penyedia tiba di lokasi</div>
              <div className="layer-item">Scan QR check-out saat jasa selesai</div>
              <div className="layer-item">Dana dirilis hanya setelah client konfirmasi</div>
            </div>
          </div>

          <div className="safety-layer">
            <span className="layer-num">3</span>
            <div className="layer-icon li-3">⭐</div>
            <p className="layer-subtitle">Layer 3</p>
            <p className="layer-title">Komunitas Terpercaya</p>
            <div className="layer-items">
              <div className="layer-item">Rating wajib setelah setiap job selesai</div>
              <div className="layer-item">Review publik terbuka untuk semua pengguna</div>
              <div className="layer-item">Suspend otomatis jika menerima 3 laporan</div>
              <div className="layer-item">Admin mediasi dalam 48 jam untuk dispute</div>
            </div>
          </div>
        </div>
      </section>

      {/* NOTIFY */}
      <section className="notify-section" id="notify">
        <div className="notify-card">
          <div>
            <p className="notify-label">Jangan ketinggalan</p>
            <h2 className="notify-title">Jadilah yang pertama<br/>mencoba <em>Physical Mode.</em></h2>
            <p className="notify-desc">Masukkan emailmu dan kami akan beritahu kamu saat Physical Mode siap diluncurkan di kotamu.</p>
          </div>
          <form className="notify-form" onSubmit={handleSubmit}>
            <input className="notify-input" type="text" placeholder="Namamu" required disabled={notified} />
            <input className="notify-input" type="email" placeholder="Email kamu" required disabled={notified} />
            <select className="notify-input" style={{cursor: "pointer"}} disabled={notified} defaultValue="">
              <option value="" disabled style={{color: "#999"}}>Aku ingin bergabung sebagai...</option>
              <option value="talent">Penyedia jasa fisik</option>
              <option value="client">Mencari penyedia jasa</option>
              <option value="both">Keduanya</option>
            </select>
            <button className={`notify-btn ${notified ? 'sent' : ''}`} type="submit" disabled={notified}>
              {notified ? '✓ Berhasil didaftarkan!' : 'Beritahu saya →'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
