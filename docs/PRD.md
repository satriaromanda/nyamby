# Nyamby — Product Requirements Document (PRD)

> **Versi:** 1.0 — MVP Hackathon  
> **Author:** Satria Romanda  
> **Tanggal:** Mei 2026  
> **Status:** `DRAFT — Internal`  
> **Konteks:** Digdaya X Hackathon 2026

---

## Daftar Isi

1. [Overview Produk](#1-overview-produk)
2. [User Personas](#2-user-personas)
3. [Daftar Fitur MVP](#3-daftar-fitur-mvp)
4. [User Flow](#4-user-flow)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [Spesifikasi Prompt AI](#7-spesifikasi-prompt-ai)
8. [Tech Stack & Arsitektur](#8-tech-stack--arsitektur)
9. [Timeline Build — 14 Hari](#9-timeline-build--14-hari)
10. [Demo Script untuk Pitching](#10-demo-script-untuk-pitching)

---

## 1. Overview Produk

### 1.1 Visi & Misi

Nyamby adalah platform **AI-powered dua dimensi** yang membantu talenta Indonesia bertransisi dari sekadar melakukan pekerjaan sampingan (_"nyambi"_) menjadi memiliki karir profesional yang mapan.

| Dimensi | Deskripsi |
|---------|-----------|
| **Supply** | Pemberdayaan talenta digital: skill mapping, AI job matching, career growth tracking |
| **Demand** | Pemenuhan kebutuhan klien/industri: job posting, AI-matched talent shortlist, escrow payment |

### 1.2 Scope MVP Hackathon

Fokus Phase 1: **Digital Services** untuk Web Developer & Graphic Designer di pasar Indonesia.

MVP ini dirancang untuk:
- Dapat didemonstrasikan secara **live** di depan juri dalam < 10 menit
- Memperlihatkan **AI bekerja secara nyata** (bukan hanya slide)
- Menceritakan journey lengkap dari sisi **Talenta DAN Client**

### 1.3 Dua "WOW Moment" AI untuk Demo

| Fitur AI | Input | Output yang Terlihat |
|----------|-------|----------------------|
| **AI Job Matching** | Skill talenta + Job requirements dari client | Match Score (%) + reasoning + ranked list talenta/job |
| **AI Skill Gap Analysis** | Skill talenta saat ini + demand job di platform | 3 skill rekomendasi + alasan relevansi pasar |

> **Catatan teknis:** Keduanya dijalankan via satu API call GPT-4o dengan prompt engineering terstruktur — tidak memerlukan ML pipeline terpisah untuk MVP.

---

## 2. User Personas

### 2.1 Persona Talenta — "Raka"

| Atribut | Detail |
|---------|--------|
| **Profil** | Mahasiswa tingkat akhir, Web Developer, Bandung |
| **Pain Point** | Sulit dapat klien pertama, tidak tahu skill apa yang perlu ditingkatkan, tidak punya portofolio terstruktur |
| **Goal** | Monetisasi skill, bangun reputasi, transisi ke freelancer profesional |
| **Behaviour** | Aktif di komunitas Telegram/Discord, mencari side-job di sosial media, rate masih rendah |

### 2.2 Persona Client — "Budi"

| Atribut | Detail |
|---------|--------|
| **Profil** | Pemilik UKM, Jakarta, butuh landing page & branding kit |
| **Pain Point** | Susah menemukan talenta terpercaya, sering ghosting, tidak ada jaminan kualitas |
| **Goal** | Dapat freelancer qualified dengan cepat, bayar aman, hasil sesuai ekspektasi |
| **Behaviour** | Pernah pakai Sribulancer/Projects.co.id, kecewa dengan pengalaman matching manual |

---

## 3. Daftar Fitur MVP

### 3.1 Layer 1 — MUST HAVE ✅

| # | Fitur | AI? | Deskripsi |
|---|-------|-----|-----------|
| 1 | Landing Page | ❌ | Value proposition, CTA utama, social proof (dummy), navigasi ke register |
| 2 | Auth — Register & Login (2 role) | ❌ | Role: Talenta & Client. Email + password, session management |
| 3 | Onboarding Form Talenta | ❌ | Skill tags, level, rate, availability, bio, portfolio upload/URL |
| 4 | Profil Talenta | ❌ | Halaman publik: skill map, rate, portofolio, availability status |
| 5 | **AI Skill Gap Analysis** | ✅ GPT-4o | Rekomendasikan 3 skill yang perlu ditingkatkan sesuai demand pasar |
| 6 | Client: Post Job | ❌ | Form: judul, deskripsi, kategori, required skills, budget, deadline |
| 7 | Job Listing Page | ❌ | Daftar job aktif, filter by kategori & skill |
| 8 | **AI Job Matching** | ✅ GPT-4o | Match Score (%) per talenta + reasoning + ranked shortlist |
| 9 | Dashboard Talenta | ❌ | Job rekomendasi + skill gap insight card + status job aktif |
| 10 | Dashboard Client | ❌ | Job yang dipost + matched talent shortlist per job |
| 11 | Mock Escrow UI | ❌ | Status visual: Dana Ditahan → In Progress → Released |
| 12 | Job Status Tracker | ❌ | Progress: Posted → Matched → In Progress → Completed |

### 3.2 Layer 2 — SHOULD HAVE 🟡

| # | Fitur | Catatan |
|---|-------|---------|
| 13 | In-App Notifikasi Match | Badge/toast UI. Tidak perlu push notif real |
| 14 | Accept/Reject Job oleh Talenta | Simple CTA di card job |
| 15 | Rating Dummy Post-Job | Hardcode bintang 4–5 untuk visual demo |

### 3.3 Layer 3 — OUT OF SCOPE ❌

> Fitur-fitur ini **sengaja tidak dibangun** di MVP. Akan disampaikan sebagai roadmap saat pitching.

- Rating & Review system (form interaktif live)
- Dispute & mediasi system
- Escrow release otomatis + payment gateway live (Midtrans/Xendit)
- Portfolio Analyzer AI
- Physical Mode (Phase 2)
- Email / push notification real
- Referral system

---

## 4. User Flow

### 4.1 Flow A — Journey Talenta (Raka)

| Step | Aktor | Aksi | Output / System Response |
|------|-------|------|--------------------------|
| 1 | Raka | Buka landing page → klik "Daftar sebagai Talenta" | Redirect ke halaman register |
| 2 | Raka | Isi form registrasi: nama, email, password, role "Talenta" | Akun dibuat, redirect ke onboarding form |
| 3 | Raka | Isi Onboarding Form: kategori, skill tags, level, rate, availability, bio, upload portofolio | Profil tersimpan di database |
| 4 | **System** | 🤖 **AI Skill Gap Analysis** dijalankan otomatis setelah onboarding | 3 rekomendasi skill muncul di Dashboard |
| 5 | Raka | Masuk Dashboard → lihat "Insight Karir" dan "Job Untukmu" | Raka melihat AI bekerja untuk kepentingannya |
| 6 | Raka | Klik job rekomendasi → lihat detail job + Match Score dirinya | Halaman detail job dengan AI Match Score & skill breakdown |
| 7 | Raka | Klik "Lamar Job" → konfirmasi | Status: Applied. Client mendapat notifikasi |
| 8 | Client | Setuju → konfirmasi & trigger mock escrow "Dana Ditahan" | Status: In Progress. Raka dapat notifikasi |
| 9 | Raka | Kerjakan job → submit deliverable (file atau link) | Job status: Submitted for Review |
| 10 | Client | Review hasil → klik "Approve & Rilis Dana" | Status: Completed. Mock escrow: Released |

### 4.2 Flow B — Journey Client (Budi)

| Step | Aktor | Aksi | Output / System Response |
|------|-------|------|--------------------------|
| 1 | Budi | Buka landing page → klik "Cari Talenta / Post Job" | Redirect ke halaman register Client |
| 2 | Budi | Isi form registrasi: nama, email, password, role "Client" | Akun dibuat, redirect ke dashboard client |
| 3 | Budi | Klik "Post Job Baru" → isi form lengkap | Job tersimpan, status: Active |
| 4 | **System** | 🤖 **AI Job Matching** dijalankan: bandingkan required skills vs semua talenta | Ranked shortlist talenta + Match Score + reasoning |
| 5 | Budi | Lihat halaman "Hasil Matching" → shortlist terurut dari Match Score tertinggi | Budi melihat AI merekomendasikan talenta terbaik |
| 6 | Budi | Klik profil talenta → lihat portofolio, skill, rate, AI Match breakdown | Halaman profil talenta + match reasoning |
| 7 | Budi | Pilih talenta → klik "Hubungi & Konfirmasi" | Talenta mendapat notifikasi job offer |
| 8 | Budi | Talenta accept → Budi konfirmasi & mock pembayaran ke escrow | Status: In Progress. Dana: Ditahan |
| 9 | System | Talenta submit deliverable | Budi mendapat notifikasi untuk review |
| 10 | Budi | Review hasil → klik "Approve & Rilis Dana" | Status: Completed. Mock escrow: Released |

### 4.3 Titik Integrasi AI — Ringkasan

| Fitur AI | Trigger | Input ke GPT-4o | Output Ditampilkan |
|----------|---------|-----------------|-------------------|
| Skill Gap Analysis | Auto setelah onboarding selesai | Daftar skill talenta + job aktif di platform | 3 rekomendasi skill + alasan pasar |
| Job Matching | Auto setelah client post job | Required skills job + profil semua talenta | Ranked shortlist + Match Score + reasoning |

> **Catatan teknis:** Untuk MVP, kedua AI feature dapat di-trigger on-demand (bukan real-time async) untuk menyederhanakan implementasi. Tampilkan loading state saat API call berlangsung.

---

## 5. Database Schema

> Lihat file [`schema.json`](./schema.json) untuk versi machine-readable.  
> Tech stack: **PostgreSQL** + **Prisma ORM**.  
> Semua tabel menggunakan **UUID** sebagai primary key.

### Tabel: `users`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key, auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email untuk login |
| password_hash | TEXT | NOT NULL | Bcrypt hash password |
| role | ENUM('talent','client') | NOT NULL | Role pengguna di platform |
| full_name | VARCHAR(255) | NOT NULL | Nama lengkap |
| avatar_url | TEXT | NULLABLE | URL foto profil |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu registrasi |
| updated_at | TIMESTAMP | AUTO UPDATE | Waktu update terakhir |

### Tabel: `talent_profiles`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → users.id | Relasi ke users (1-to-1) |
| bio | TEXT | NULLABLE | Deskripsi diri singkat |
| category | ENUM('web_dev','graphic_designer') | NOT NULL | Kategori utama talenta |
| rate_per_hour | DECIMAL(10,2) | NULLABLE | Rate per jam dalam IDR |
| rate_per_project | DECIMAL(10,2) | NULLABLE | Rate per project dalam IDR |
| availability | ENUM('available','busy','unavailable') | DEFAULT 'available' | Status ketersediaan |
| location | VARCHAR(255) | NULLABLE | Kota/lokasi talenta |
| portfolio_url | TEXT | NULLABLE | Link Behance, GitHub, dll |
| portfolio_file | TEXT | NULLABLE | Path file portofolio yang diupload |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan profil |

### Tabel: `skills`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Nama skill (cth: React, Figma) |
| category | VARCHAR(100) | NOT NULL | Kelompok skill (cth: Frontend, Design Tool) |

### Tabel: `talent_skills`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| talent_profile_id | UUID | FK → talent_profiles.id | Relasi ke profil talenta |
| skill_id | UUID | FK → skills.id | Relasi ke master skill |
| level | ENUM('beginner','intermediate','expert') | NOT NULL | Level kemampuan |

### Tabel: `skill_gap_analyses`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| talent_profile_id | UUID | FK → talent_profiles.id | Relasi ke profil talenta |
| recommended_skills | JSONB | NOT NULL | Array: [{skill, reason, priority}] |
| generated_at | TIMESTAMP | DEFAULT NOW() | Waktu analisis dijalankan |
| is_latest | BOOLEAN | DEFAULT true | Flag analisis terbaru (1 aktif per talenta) |

### Tabel: `jobs`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| client_user_id | UUID | FK → users.id | Client yang memposting |
| title | VARCHAR(255) | NOT NULL | Judul job |
| description | TEXT | NOT NULL | Deskripsi lengkap kebutuhan |
| category | ENUM('web_dev','graphic_designer') | NOT NULL | Kategori job |
| budget_min | DECIMAL(12,2) | NULLABLE | Budget minimum (IDR) |
| budget_max | DECIMAL(12,2) | NULLABLE | Budget maksimum (IDR) |
| deadline | DATE | NULLABLE | Target selesai |
| status | ENUM('active','matched','in_progress','completed','cancelled') | DEFAULT 'active' | Status job |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu post job |

### Tabel: `job_required_skills`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| job_id | UUID | FK → jobs.id | Relasi ke job |
| skill_id | UUID | FK → skills.id | Skill yang dibutuhkan |
| is_mandatory | BOOLEAN | DEFAULT true | True = wajib, False = nice-to-have |

### Tabel: `job_matches`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| job_id | UUID | FK → jobs.id | Job yang dimatching |
| talent_profile_id | UUID | FK → talent_profiles.id | Talenta yang direkomendasikan |
| match_score | DECIMAL(5,2) | NOT NULL | Skor kesesuaian 0–100 dari AI |
| reasoning | TEXT | NOT NULL | Penjelasan AI mengapa cocok/tidak |
| status | ENUM('recommended','applied','accepted','rejected') | DEFAULT 'recommended' | Status match |
| generated_at | TIMESTAMP | DEFAULT NOW() | Waktu matching dijalankan |

### Tabel: `escrow_transactions`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| job_id | UUID | FK → jobs.id, UNIQUE | Satu job satu escrow (1-to-1) |
| client_user_id | UUID | FK → users.id | Client yang membayar |
| talent_user_id | UUID | FK → users.id | Talenta yang menerima |
| amount | DECIMAL(12,2) | NOT NULL | Nilai transaksi (IDR) |
| platform_fee | DECIMAL(12,2) | NOT NULL | Fee platform (10–15%) |
| status | ENUM('held','released','refunded') | DEFAULT 'held' | Status dana escrow |
| held_at | TIMESTAMP | NULLABLE | Waktu dana ditahan |
| released_at | TIMESTAMP | NULLABLE | Waktu dana dirilis |

### Tabel: `notifications`
| Field | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → users.id | Penerima notifikasi |
| type | VARCHAR(100) | NOT NULL | Tipe: 'new_match', 'job_accepted', dll |
| message | TEXT | NOT NULL | Isi pesan notifikasi |
| is_read | BOOLEAN | DEFAULT false | Status baca |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu dibuat |

> **Total: 9 tabel core.** Cukup untuk menjalankan semua 12 fitur MUST HAVE di MVP.

---

## 6. API Endpoints

> Lihat file [`api-spec.json`](./api-spec.json) untuk versi machine-readable.  
> Base URL: `/api` — semua endpoint adalah Next.js Route Handlers.

### Auth
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/auth/register` | Register user baru (talent/client) |
| `POST` | `/api/auth/login` | Login, return JWT session token |
| `POST` | `/api/auth/logout` | Invalidate session |

### Talent
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/talent/onboarding` | Simpan onboarding form + trigger AI Skill Gap |
| `GET` | `/api/talent/profile/:id` | Ambil profil talenta (publik) |
| `PATCH` | `/api/talent/profile` | Update profil talenta (auth required) |
| `GET` | `/api/talent/dashboard` | Data dashboard: job matches + skill gap insight |
| `GET` | `/api/talent/skill-gap` | Ambil hasil AI Skill Gap Analysis terbaru |

### Jobs
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/jobs` | Client buat job baru + trigger AI Matching |
| `GET` | `/api/jobs` | List semua job aktif (dengan filter) |
| `GET` | `/api/jobs/:id` | Detail satu job + matched talents |
| `PATCH` | `/api/jobs/:id/status` | Update status job |

### AI & Matching
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/ai/match-job` | 🤖 Jalankan AI Matching untuk job tertentu |
| `POST` | `/api/ai/skill-gap` | 🤖 Jalankan AI Skill Gap untuk talenta tertentu |
| `PATCH` | `/api/matches/:id/status` | Talenta accept/reject job offer |

### Escrow & Notifikasi
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/escrow/hold` | Client konfirmasi → dana ditahan (mock) |
| `POST` | `/api/escrow/release` | Client approve → dana dirilis (mock) |
| `GET` | `/api/notifications` | Ambil notifikasi user yang login |
| `PATCH` | `/api/notifications/:id/read` | Mark notifikasi sebagai dibaca |

---

## 7. Spesifikasi Prompt AI

### 7.1 AI Job Matching

**Trigger:** `POST /api/ai/match-job` dipanggil otomatis setelah client berhasil post job.

**System Prompt:**
```
Kamu adalah mesin matching profesional untuk platform freelance Indonesia.
Tugasmu adalah mengevaluasi kesesuaian setiap talenta terhadap job yang diberikan.
Selalu respons dalam format JSON array. Jangan tambahkan teks di luar JSON.
```

**Input Structure:**
```json
{
  "job": {
    "title": "string",
    "description": "string",
    "required_skills": ["skill1", "skill2"],
    "category": "web_dev | graphic_designer",
    "budget_range": "string"
  },
  "talents": [
    {
      "id": "uuid",
      "name": "string",
      "skills": [{ "name": "string", "level": "beginner|intermediate|expert" }],
      "category": "string",
      "rate": "number",
      "bio": "string"
    }
  ]
}
```

**Expected Output:**
```json
[
  {
    "talent_id": "uuid",
    "match_score": 87,
    "strengths": ["React Expert", "3 tahun pengalaman"],
    "gaps": ["Belum ada pengalaman TypeScript"],
    "reasoning": "Talenta memiliki 85% skill yang dibutuhkan...",
    "recommendation": "highly_recommended | recommended | not_recommended"
  }
]
```

> Backend sort by `match_score DESC` sebelum simpan dan return ke client.

---

### 7.2 AI Skill Gap Analysis

**Trigger:** `POST /api/ai/skill-gap` dipanggil otomatis setelah onboarding talenta selesai.

**System Prompt:**
```
Kamu adalah career advisor AI untuk platform freelance Indonesia.
Analisis kesenjangan skill talenta berdasarkan demand pasar yang tersedia.
Berikan maksimal 3 rekomendasi. Respons dalam format JSON. Jangan tambahkan teks di luar JSON.
```

**Input Structure:**
```json
{
  "talent": {
    "skills": [{ "name": "string", "level": "string" }],
    "category": "string"
  },
  "market_demand": [
    {
      "skill_name": "string",
      "frequency_in_jobs": 23,
      "avg_budget": 5000000
    }
  ]
}
```

**Expected Output:**
```json
{
  "recommendations": [
    {
      "skill_name": "TypeScript",
      "priority": "high | medium | low",
      "reason": "Muncul di 23 dari 30 job aktif di kategorimu",
      "estimated_impact": "Potensi rate naik 30–40%"
    }
  ],
  "summary": "Skill kamu sudah solid untuk pemula, tapi pasar butuh TypeScript dan testing."
}
```

---

## 8. Tech Stack & Arsitektur

| Layer | Teknologi | Alasan Pemilihan |
|-------|-----------|-----------------|
| **Frontend** | Next.js 14 (App Router) | SSR + API routes dalam satu project, DX terbaik untuk MVP cepat |
| **Styling** | Tailwind CSS | Rapid styling, utility-first, tidak perlu custom CSS |
| **Database** | PostgreSQL | Relational, gratis di Supabase/Railway |
| **ORM** | Prisma | Type-safe, auto-generate client dari schema, mudah migration |
| **Auth** | NextAuth.js | Native Next.js, JWT session, multi-provider ready |
| **AI Engine** | GPT-4o via OpenAI API | Best reasoning + JSON output, latency acceptable untuk demo |
| **File Upload** | Cloudinary / Supabase Storage | Free tier cukup untuk MVP |
| **Deployment** | Vercel | Zero-config Next.js deploy, free tier, perfect untuk hackathon demo |

### Arsitektur Singkat

```
Browser
  └── Next.js App (Vercel)
        ├── /app         → Pages & UI Components
        ├── /api         → Route Handlers (REST API)
        │     ├── auth/
        │     ├── talent/
        │     ├── jobs/
        │     ├── ai/      → Calls OpenAI GPT-4o
        │     ├── escrow/
        │     └── notifications/
        └── /lib
              ├── prisma.ts   → DB Client
              └── openai.ts   → AI Client
```

---

## 9. Timeline Build — 14 Hari

| Hari | Fokus | Target Output |
|------|-------|---------------|
| **Hari 1–2** | Setup: Next.js, Prisma schema, PostgreSQL, NextAuth | Project running, auth bisa login/register, DB terhubung |
| **Hari 3–4** | Onboarding form talenta + halaman profil | Talenta bisa register, isi profil, lihat profil publik |
| **Hari 5** | Client: post job form + job listing page | Client bisa posting job, job muncul di listing |
| **Hari 6–7** | 🤖 AI Job Matching: prompt engineering + integrasi GPT-4o | Match score muncul di dashboard client |
| **Hari 8–9** | 🤖 AI Skill Gap: prompt + API + UI card insight | 3 rekomendasi skill muncul otomatis setelah onboarding |
| **Hari 10–11** | Dashboard talenta & client + job status tracker + mock escrow UI | Full flow bisa dijalankan end-to-end |
| **Hari 12–13** | Landing page + UI polish + edge case handling | Tampilan siap presentasi, tidak ada broken flow |
| **Hari 14** | 🎯 Full demo rehearsal — simulasi live demo juri | Go / No-Go sebelum hari H pitching |

> **Prinsip buffer:** Hari 13 adalah "polish day" — jangan tambah fitur baru. Hari 14 hanya untuk rehearsal dan perbaikan edge case yang ditemukan saat demo.

---

## 10. Demo Script untuk Pitching

> **Durasi target:** 7–10 menit.  
> **Struktur:** Narasi pembuka → Live demo → Back to slide untuk roadmap.

### 10.1 Pembuka (1 menit)

1. _"Di Indonesia, ada 46 juta freelancer yang nyambi. Mereka punya skill, tapi tidak punya akses ke klien yang tepat dan tidak tahu harus berkembang ke mana."_
2. _"Nyamby hadir sebagai AI-powered career platform yang mengubah nyambi menjadi karir profesional yang terstruktur."_

### 10.2 Demo Flow (5–6 menit)

1. Buka sebagai **Raka (Talenta)** → register → isi onboarding form → _[jeda]_ "Di sinilah AI bekerja untuk pertama kalinya"
2. Tunjukkan **dashboard talenta** → Skill Gap Analysis card: _"AI mendeteksi bahwa Raka perlu belajar TypeScript dan UI Testing berdasarkan 23 job aktif di platform"_
3. Switch ke akun **Budi (Client)** → post job → _[jeda]_ "Setelah Budi post, AI langsung bekerja"
4. Tunjukkan **hasil matching**: _"Dalam hitungan detik, AI mengevaluasi seluruh talent pool dan merekomendasikan Raka dengan Match Score 87% — lengkap dengan reasoning"_
5. Klik profil Raka → confirm → mock escrow **"Dana Ditahan"** → job In Progress → approve → **"Dana Dirilis"**

### 10.3 Penutup & Roadmap (1–2 menit)

1. _"Yang baru saja Anda lihat adalah Phase 1. Dalam 12 bulan ke depan: 500 talenta aktif, ekspansi ke Malaysia, dan launch Physical Mode untuk jasa lokal."_
2. _"Competitive moat kami bukan hanya AI-nya — tapi data rejection feedback loop yang proprietary. Setiap penolakan membuat matching kami semakin akurat."_

---

_Dokumen ini adalah living document. Update setiap ada perubahan keputusan produk._
