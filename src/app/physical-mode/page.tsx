"use client";
import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function PhysicalMode() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animation = "fadeUp .5s ease both";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".tl-phase, .cat-card, .safety-layer").forEach(el => {
      (el as HTMLElement).style.opacity = "0";
      observer.observe(el);
      el.addEventListener("animationstart", () => (el as HTMLElement).style.opacity = "1");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const btn = document.getElementById("submit-btn") as HTMLButtonElement;
    const nameInput = document.getElementById("name-input") as HTMLInputElement;
    const emailInput = document.getElementById("email-input") as HTMLInputElement;
    const roleInput = document.getElementById("role-input") as HTMLSelectElement;

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Mengirim...";
    }

    try {
      const res = await fetch("/api/waitlist/physical-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput?.value,
          email: emailInput?.value,
          role: roleInput?.value || null,
        }),
      });
      const data = await res.json();

      if (data.success && btn) {
        btn.textContent = "✓ Berhasil didaftarkan!";
        btn.classList.add("sent");
        document.querySelectorAll(".notify-form input, .notify-form select").forEach(el => ((el as HTMLInputElement).disabled = true));
      } else if (btn) {
        btn.textContent = "Gagal, coba lagi →";
        btn.disabled = false;
      }
    } catch {
      if (btn) {
        btn.textContent = "Gagal, coba lagi →";
        btn.disabled = false;
      }
    }
  };

  return (
    <>
      <Head>
        
<meta charSet="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Nyamby — Physical Mode Coming Soon</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
<style dangerouslySetInnerHTML={{ __html: `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --purple: #2563EB;
  --purple-light: #7F77DD;
  --purple-pale: #EEEDFE;
  --teal: #0F6E56;
  --teal-mid: #1D9E75;
  --teal-pale: #E1F5EE;
  --amber: #854F0B;
  --amber-mid: #EF9F27;
  --amber-pale: #FAEEDA;
  --coral: #993C1D;
  --coral-pale: #FAECE7;
  --green: #3B6D11;
  --green-pale: #EAF3DE;
  --ink: #1A1A2E;
  --ink-2: #2C2C4A;
  --muted: #5F5E7A;
  --border: rgba(83,74,183,0.12);
  --bg: #FAFAF8;
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Sora', sans-serif;
  background: var(--bg);
  color: var(--ink);
  overflow-x: hidden;
  min-height: 100vh;
}

/* ── NOISE TEXTURE ── */
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 0; opacity: 0.4;
}

/* ── NAVBAR ── */
nav {
  position: fixed; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 48px;
  background: rgba(250,250,248,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 0.5px solid var(--border);
  z-index: 100;
}
.nav-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 22px; color: var(--purple);
  letter-spacing: -0.5px;
}
.nav-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500;
  padding: 6px 14px; border-radius: 20px;
  background: var(--purple-pale); color: var(--purple);
  border: 0.5px solid rgba(83,74,183,0.2);
}
.nav-badge::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: var(--purple-light);
  animation: pulse 2s ease-in-out infinite;
}

/* ── HERO ── */
.hero {
  position: relative;
  padding: 160px 48px 100px;
  max-width: 1100px;
  margin: 0 auto;
}

.phase-tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--teal);
  background: var(--teal-pale);
  border: 0.5px solid rgba(15,110,86,0.2);
  padding: 6px 16px; border-radius: 20px;
  margin-bottom: 32px;
}
.phase-tag span { opacity: 0.6; }

h1 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(52px, 8vw, 96px);
  line-height: 1.0;
  letter-spacing: -2px;
  color: var(--ink);
  margin-bottom: 8px;
}
h1 em {
  font-style: italic;
  color: var(--purple);
  display: block;
}
.hero-sub {
  font-size: 18px; font-weight: 300; line-height: 1.7;
  color: var(--muted); max-width: 540px;
  margin: 28px 0 48px;
}
.hero-sub strong { color: var(--ink); font-weight: 500; }

.hero-cta {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--purple); color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 14px; font-weight: 500;
  padding: 14px 28px; border-radius: 40px;
  border: none; cursor: pointer; text-decoration: none;
  transition: transform .2s, background .2s;
}
.btn-primary:hover { background: var(--purple-light); transform: translateY(-2px); }
.btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Sora', sans-serif;
  font-size: 14px; font-weight: 500; color: var(--ink);
  text-decoration: none; padding: 14px 4px;
  border-bottom: 1.5px solid var(--ink);
  transition: color .2s, border-color .2s;
}
.btn-ghost:hover { color: var(--purple); border-color: var(--purple); }

/* ── FLOATING BLOB BACKGROUND ── */
.blob-wrap {
  position: absolute; top: 80px; right: -80px;
  width: 580px; height: 580px;
  pointer-events: none; z-index: -1;
}
.blob {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.12;
  animation: float 8s ease-in-out infinite;
}
.blob-1 { width: 360px; height: 360px; background: var(--purple); top: 0; right: 40px; animation-delay: 0s; }
.blob-2 { width: 260px; height: 260px; background: var(--teal-mid); top: 180px; right: 0; animation-delay: -3s; }
.blob-3 { width: 200px; height: 200px; background: var(--amber-mid); top: 80px; right: 200px; animation-delay: -5s; }

/* ── DIVIDER ── */
.divider {
  border: none; border-top: 0.5px solid var(--border);
  margin: 0 48px;
}

/* ── TIMELINE ── */
.timeline-section {
  max-width: 1100px; margin: 80px auto;
  padding: 0 48px;
}
.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--muted);
  margin-bottom: 48px;
}

.timeline {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.tl-phase {
  background: var(--bg);
  padding: 40px 36px;
  position: relative;
  transition: background .2s;
}
.tl-phase:hover { background: #F4F2FF; }
.tl-phase.active { background: var(--purple); }
.tl-phase.active .tl-title { color: #fff; }
.tl-phase.active .tl-period { color: rgba(255,255,255,0.6); }
.tl-phase.active .tl-desc { color: rgba(255,255,255,0.75); }
.tl-phase.active .tl-pill { background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.2); }

.tl-period {
  font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--muted);
  margin-bottom: 12px;
}
.tl-title {
  font-family: 'DM Serif Display', serif;
  font-size: 22px; line-height: 1.2;
  color: var(--ink); margin-bottom: 12px;
}
.tl-desc {
  font-size: 13px; font-weight: 300; line-height: 1.6;
  color: var(--muted); margin-bottom: 20px;
}
.tl-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.tl-pill {
  font-size: 11px; font-weight: 500;
  padding: 4px 12px; border-radius: 12px;
  background: var(--purple-pale); color: var(--purple);
  border: 0.5px solid rgba(83,74,183,0.15);
}
.tl-pill.teal { background: var(--teal-pale); color: var(--teal); border-color: rgba(15,110,86,0.15); }
.tl-pill.amber { background: var(--amber-pale); color: var(--amber); border-color: rgba(133,79,11,0.15); }
.tl-pill.coral { background: var(--coral-pale); color: var(--coral); border-color: rgba(153,60,29,0.15); }

/* ── CATEGORIES GRID ── */
.categories-section {
  max-width: 1100px; margin: 80px auto;
  padding: 0 48px;
}

.cat-intro {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 48px; flex-wrap: wrap; gap: 24px;
}
.cat-intro h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 40px; line-height: 1.1; letter-spacing: -1px;
}
.cat-intro h2 em { font-style: italic; color: var(--teal); }
.cat-intro p {
  font-size: 14px; font-weight: 300; color: var(--muted);
  max-width: 300px; line-height: 1.6;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  background: var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.cat-card {
  background: var(--bg);
  padding: 40px;
  display: flex; flex-direction: column;
  gap: 16px;
  position: relative;
  transition: background .2s;
  cursor: default;
}
.cat-card:hover { background: #FAFEF9; }
.cat-card.phase3 { background: #FEFEFE; opacity: 0.8; }
.cat-card.phase3:hover { opacity: 1; }

.cat-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}
.cat-icon.home { background: var(--teal-pale); }
.cat-icon.skill { background: var(--amber-pale); }
.cat-icon.social { background: var(--purple-pale); }
.cat-icon.errands { background: var(--coral-pale); }

.cat-phase-badge {
  position: absolute; top: 20px; right: 20px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px; border-radius: 8px;
}
.badge-p2 { background: var(--teal-pale); color: var(--teal); }
.badge-p3 { background: var(--amber-pale); color: var(--amber); }

.cat-name {
  font-size: 20px; font-weight: 600; color: var(--ink);
  line-height: 1.2;
}
.cat-desc {
  font-size: 13px; font-weight: 300; color: var(--muted);
  line-height: 1.6;
}
.cat-examples {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: 4px;
}
.cat-ex {
  font-size: 11px; font-weight: 400;
  padding: 4px 12px; border-radius: 20px;
  background: var(--bg); color: var(--muted);
  border: 0.5px solid var(--border);
}

/* ── SAFETY FRAMEWORK ── */
.safety-section {
  max-width: 1100px; margin: 80px auto;
  padding: 0 48px;
}
.safety-header {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 64px; align-items: end;
  margin-bottom: 48px;
}
.safety-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 40px; line-height: 1.1; letter-spacing: -1px;
}
.safety-header h2 em { font-style: italic; color: var(--coral); }
.safety-header p {
  font-size: 14px; font-weight: 300;
  color: var(--muted); line-height: 1.7;
}

.safety-layers {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 2px; background: var(--border);
  border-radius: 16px; overflow: hidden;
}
.safety-layer {
  background: var(--bg); padding: 36px 32px;
  position: relative;
}
.layer-num {
  font-family: 'DM Serif Display', serif;
  font-size: 64px; line-height: 1;
  color: var(--border);
  position: absolute; top: 24px; right: 28px;
  user-select: none;
}
.layer-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; margin-bottom: 16px;
}
.li-1 { background: var(--purple-pale); }
.li-2 { background: var(--teal-pale); }
.li-3 { background: var(--amber-pale); }
.layer-title {
  font-size: 16px; font-weight: 600; color: var(--ink);
  margin-bottom: 8px;
}
.layer-subtitle {
  font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted);
  margin-bottom: 16px;
}
.layer-items { display: flex; flex-direction: column; gap: 10px; }
.layer-item {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.5;
}
.layer-item::before {
  content: '→';
  font-size: 12px; color: var(--muted); opacity: 0.5;
  margin-top: 2px; flex-shrink: 0;
}

/* ── NOTIFY SECTION ── */
.notify-section {
  max-width: 1100px; margin: 80px auto 0;
  padding: 0 48px;
}
.notify-card {
  background: var(--ink); color: #fff;
  border-radius: 20px; padding: 64px 64px;
  display: grid; grid-template-columns: 1fr auto;
  gap: 48px; align-items: center;
  position: relative; overflow: hidden;
}
.notify-card::before {
  content: '';
  position: absolute; top: -60px; right: 80px;
  width: 300px; height: 300px; border-radius: 50%;
  background: var(--purple); opacity: 0.15;
  filter: blur(60px);
}
.notify-card::after {
  content: '';
  position: absolute; bottom: -40px; right: -20px;
  width: 200px; height: 200px; border-radius: 50%;
  background: var(--teal-mid); opacity: 0.1;
  filter: blur(50px);
}
.notify-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(255,255,255,0.4);
  margin-bottom: 16px;
}
.notify-title {
  font-family: 'DM Serif Display', serif;
  font-size: 36px; line-height: 1.15; letter-spacing: -0.5px;
  margin-bottom: 12px;
}
.notify-title em { font-style: italic; color: var(--amber-mid); }
.notify-desc {
  font-size: 14px; font-weight: 300;
  color: rgba(255,255,255,0.6); line-height: 1.6;
}
.notify-form {
  display: flex; flex-direction: column; gap: 12px;
  min-width: 320px; position: relative; z-index: 1;
}
.notify-input {
  background: rgba(255,255,255,0.07);
  border: 0.5px solid rgba(255,255,255,0.15);
  border-radius: 12px; padding: 14px 18px;
  color: #fff; font-family: 'Sora', sans-serif;
  font-size: 14px; outline: none;
  transition: border-color .2s, background .2s;
}
.notify-input::placeholder { color: rgba(255,255,255,0.3); }
.notify-input:focus { border-color: var(--purple-light); background: rgba(255,255,255,0.1); }
.notify-btn {
  background: var(--purple-light); color: #fff;
  border: none; border-radius: 12px;
  padding: 14px 24px; font-family: 'Sora', sans-serif;
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: background .2s, transform .15s;
}
.notify-btn:hover { background: var(--purple); transform: translateY(-1px); }
.notify-btn.sent { background: var(--teal); }

/* ── FOOTER ── */
footer {
  max-width: 1100px; margin: 64px auto 0;
  padding: 32px 48px;
  border-top: 0.5px solid var(--border);
  display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 16px;
}
.footer-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 18px; color: var(--purple);
}
.footer-tagline {
  font-size: 12px; font-weight: 300; color: var(--muted);
}
.footer-links { display: flex; gap: 24px; }
.footer-links a {
  font-size: 12px; color: var(--muted); text-decoration: none;
  transition: color .2s;
}
.footer-links a:hover { color: var(--purple); }

/* ── ANIMATIONS ── */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.03); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero > * {
  animation: fadeUp .6s ease both;
}
.hero > *:nth-child(1) { animation-delay: .1s; }
.hero > *:nth-child(2) { animation-delay: .2s; }
.hero > *:nth-child(3) { animation-delay: .3s; }
.hero > *:nth-child(4) { animation-delay: .45s; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  nav { padding: 16px 24px; }
  .hero { padding: 120px 24px 72px; }
  .timeline { grid-template-columns: 1fr; }
  .cat-grid { grid-template-columns: 1fr; }
  .safety-header { grid-template-columns: 1fr; gap: 24px; }
  .safety-layers { grid-template-columns: 1fr; }
  .notify-card { grid-template-columns: 1fr; padding: 40px 32px; }
  .notify-form { min-width: unset; }
  .timeline-section, .categories-section, .safety-section, .notify-section { padding: 0 24px; }
  footer { padding: 32px 24px; flex-direction: column; align-items: flex-start; }
  .divider { margin: 0 24px; }
}
` }} />

      </Head>
      


<nav>
  <span className="nav-logo">Nyamby</span>
  <span className="nav-badge">Physical Mode — Coming Soon</span>
</nav>


<section className="hero">
  <div className="blob-wrap">
    <div className="blob blob-1"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
  </div>

  <div className="phase-tag">
    <span>Phase 2</span>
    <span>·</span>
    Dirilis 12–24 bulan ke depan
  </div>

  <h1>
    Nyambi fisik,
    <em>juga bisa.</em>
  </h1>

  <p className="hero-sub">
    Selama ini Nyamby membantu talenta digital menemukan klien yang tepat. 
    Sekarang kami sedang membangun sesuatu yang lebih besar — 
    <strong>platform untuk semua jenis nyambi</strong>, 
    termasuk yang datang langsung ke pintu rumahmu.
  </p>

  <div className="hero-cta">
    <a href="#notify" className="btn-primary">
      Beritahu saya saat rilis →
    </a>
    <a href="#kategori" className="btn-ghost">
      Lihat semua kategori
    </a>
  </div>
</section>

<hr className="divider" />


<section className="timeline-section">
  <p className="section-label">Roadmap Platform</p>

  <div className="timeline">
    <div className="tl-phase active">
      <p className="tl-period">Sekarang — Phase 1</p>
      <h3 className="tl-title">Digital Mode<br />Sedang Berjalan</h3>
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
      <h3 className="tl-title">Physical Mode<br />Launch</h3>
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
      <h3 className="tl-title">Full Platform<br />SEA Expansion</h3>
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

<hr className="divider" />


<section className="categories-section" id="kategori">
  <div className="cat-intro">
    <h2>Semua yang bisa<br /><em>kamu tawarkan.</em></h2>
    <p>Dari jasa digital sampai jasa fisik — semua dalam satu platform, satu akun, satu reputasi.</p>
  </div>

  <div className="cat-grid">

    
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

<hr className="divider" />


<section className="safety-section">
  <div className="safety-header">
    <h2>Dibangun di atas<br /><em>kepercayaan.</em></h2>
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


<section className="notify-section" id="notify">
  <div className="notify-card">
    <div>
      <p className="notify-label">Jangan ketinggalan</p>
      <h2 className="notify-title">Jadilah yang pertama<br />mencoba <em>Physical Mode.</em></h2>
      <p className="notify-desc">Masukkan emailmu dan kami akan beritahu kamu saat Physical Mode siap diluncurkan di kotamu.</p>
    </div>
    <form className="notify-form" onSubmit={handleSubmit}>
      <input className="notify-input" type="text" placeholder="Namamu" id="name-input" required />
      <input className="notify-input" type="email" placeholder="Email kamu" id="email-input" required />
      <select className="notify-input" id="role-input" style={{ cursor: 'pointer' }}>
        <option value="" disabled selected style={{ color: '#999' }}>Aku ingin bergabung sebagai...</option>
        <option value="talent">Penyedia jasa fisik</option>
        <option value="client">Mencari penyedia jasa</option>
        <option value="both">Keduanya</option>
      </select>
      <button className="notify-btn" type="submit" id="submit-btn">
        Beritahu saya →
      </button>
    </form>
  </div>
</section>


<footer>
  <div>
    <div className="footer-logo">Nyamby</div>
    <p className="footer-tagline">Dari nyambi, menuju profesional.</p>
  </div>
  <div className="footer-links">
    <a href="#">Platform Digital</a>
    <a href="#">Tentang Kami</a>
    <a href="#">Kebijakan Privasi</a>
  </div>
</footer>



    </>
  );
}
