# NYAMBY
## Product Requirements Document
### Patch PRD v2.0 — Perbaikan & Kelanjutan MVP

| Versi | 2.0 — Post-Analysis Patch |
|-------|--------------------------|
| Status | AKTIF — Untuk Implementasi |
| Author | Satria Romanda (CPO) |
| Reviewer | Akbar Lubis (CTO), Rahmat Ramadhan |
| Tanggal | Juni 2026 |
| Konteks | Digdaya X Hackathon 2026 — Refinement |
| Base Ref | PRD v1.0 + GitHub master (satriaromanda/nyamby) |

---

## 1. Executive Summary & Konteks

Dokumen ini merupakan PRD lanjutan (Patch v2.0) yang disusun berdasarkan hasil code review menyeluruh terhadap codebase GitHub nyamby (master branch, Juni 2026). Tujuannya adalah dua hal:

- Mendokumentasikan gap antara PRD v1.0 dan implementasi aktual yang perlu diperbaiki sebelum demo hari-H.
- Mendefinisikan fitur-fitur lanjutan (Phase 1.5 & Phase 2) yang perlu dikerjakan pasca-hackathon untuk menuju produk yang siap divalidasi ke pengguna nyata.

| Dimensi | Temuan Utama |
|---------|-------------|
| Coverage PRD v1.0 | ~85% fitur MUST HAVE sudah terimplementasi |
| Melampaui PRD | DisputeTicket, ClientProfile terpisah, Public browsing, portfolioEvidence — semua sudah ada |
| Gap Kritis | JWT_SECRET fallback, .env.example hilang, delete-all before re-match tanpa transaction |
| AI Engine Aktif | DeepSeek (default) — bukan GPT-4o seperti di PRD v1.0. Perlu verifikasi output quality |
| Tech Stack Aktual | Next.js 16 (PRD: 14), Tailwind 4, Prisma 6, OpenAI SDK 6 |

---

## 2. Perbaikan Segera — Pre-Demo (Priority P0)

Semua item di bagian ini harus diselesaikan **SEBELUM** hari demonstrasi kepada juri. Kegagalan mengimplementasikan item P0 berpotensi menyebabkan demo gagal, data loss, atau celah keamanan yang terekspos di depan juri.

### 2.1 Security Hardening

| ID | Prioritas | Masalah | Solusi yang Diperlukan |
|----|-----------|---------|----------------------|
| FIX-001 | 🔴 P0 — KRITIS | JWT_SECRET fallback hardcoded di `auth.ts`: jika env tidak di-set, server tetap berjalan dengan secret yang dapat diprediksi | Ganti fallback dengan `throw new Error('JWT_SECRET wajib diset di .env')`. Pastikan nilai di `.env` minimal 32 karakter random. |
| FIX-002 | 🔴 P0 — KRITIS | `.env.example` tidak ada di repo — siapapun yang clone tidak tahu variabel apa yang dibutuhkan | Buat file `.env.example` dengan semua variabel: `DATABASE_URL`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `JWT_SECRET`. Tambahkan komentar penjelasan tiap variabel. |
| FIX-003 | 🔴 P0 — KRITIS | Route `POST /api/ai/match-job` melakukan `deleteMany` sebelum insert baru — jika AI call gagal, semua match hilang tanpa recovery | Pindahkan logika ke `ai-matching.ts` service yang sudah ada. Gunakan `createMany` dengan `skipDuplicates: true` (sudah benar di service). Hapus `deleteMany` dari `match-job/route.ts`. |

### 2.2 AI Quality Verification

| ID | Prioritas | Masalah | Solusi yang Diperlukan |
|----|-----------|---------|----------------------|
| FIX-004 | 🟡 P0 — TINGGI | Default AI model adalah `deepseek-chat`, bukan GPT-4o seperti dijanjikan di PRD v1.0 dan pitch deck | Lakukan test dengan 3 skenario demo (job landing page + talenta web dev, job branding + talenta graphic designer, job fullstack + mixed skills). Verifikasi reasoning output cukup compelling untuk juri. Jika kualitas kurang, set `AI_MODEL=gpt-4o` di env production. |
| FIX-005 | 🟡 P0 — TINGGI | Tidak ada validasi bahwa `match_score` yang dikembalikan AI adalah angka 0–100. Jika AI mengembalikan format berbeda, UI bisa crash | Tambahkan parsing guard: `if (typeof match.match_score !== 'number' \|\| match.match_score < 0 \|\| match.match_score > 100)` — fallback ke 50 dan log warning. Validasi juga `recommendation` hanya berisi 3 enum value yang valid. |
| FIX-006 | 🔵 P1 — SEDANG | Tidak ada retry indicator di UI — pengguna tidak tahu apakah AI masih proses atau sudah gagal setelah timeout | Manfaatkan field `aiStatus` yang sudah ada di schema (`pending / processing / completed / failed`). Tampilkan loading spinner dengan pesan selama status `processing`, dan pesan error graceful jika `failed`. |

### 2.3 Onboarding & UX Friction

| ID | Prioritas | Masalah | Solusi yang Diperlukan |
|----|-----------|---------|----------------------|
| FIX-007 | 🟡 P0 — TINGGI | `ClientProfile.industry` dan `location` adalah `NOT NULL` di schema, tapi tidak jelas apakah form onboarding client memvalidasi ini — berpotensi gagal register di demo | Lakukan end-to-end test: register client baru → onboarding → pastikan tidak ada error 500. Tambahkan validasi Zod di onboarding client yang sinkron dengan schema Prisma. |
| FIX-008 | 🔵 P1 — SEDANG | Seed data (`prisma/seed.ts`) menggunakan password `password123` yang hardcoded — perlu dipastikan demo accounts berfungsi di environment VPS | Dokumentasikan di README: akun demo Raka (`raka@demo.com`) dan Budi (`budi@demo.com`). Pastikan seed sudah dijalankan di server sebelum hari-H. Siapkan script re-seed yang aman. |

### 2.4 Demo Rehearsal Checklist

> Checklist wajib **48 jam sebelum demo**:

- [ ] FIX-001 s/d FIX-008 semua sudah diimplementasikan dan di-commit ke master
- [ ] Seed database berjalan sukses di server VPS (`nyamby.akbarhlubis.duckdns.org`)
- [ ] Akun demo Raka dan Budi bisa login tanpa error
- [ ] Flow A (Talenta): register → onboarding → AI Skill Gap muncul → job match tersedia
- [ ] Flow B (Client): register → onboarding → post job → AI Matching shortlist muncul → escrow hold
- [ ] Full Flow: Client approve → escrow release → status Completed
- [ ] Test koneksi AI API dari server VPS (bukan localhost) — pastikan API key valid
- [ ] Screenshot/screen record seluruh flow sebagai backup jika demo live gagal

---

## 3. Phase 1.5 — Post-Hackathon Refinement (0–4 Minggu)

Fase ini mencakup pekerjaan yang tidak kritis untuk demo hackathon, namun wajib diselesaikan sebelum platform digunakan oleh pengguna nyata. Target: platform siap untuk **50 pengguna pertama**.

### 3.1 Keamanan & Infrastruktur

| ID | Prioritas | Deskripsi & Acceptance Criteria |
|----|-----------|--------------------------------|
| SEC-001 | P1 | **Rate Limiting:** Tambahkan rate limiter di endpoint AI (`/api/ai/*`) — maksimum 10 request per menit per user. Cegah abuse yang menguras OpenAI/DeepSeek credit. Gunakan `upstash/ratelimit` atau middleware berbasis in-memory Map. |
| SEC-002 | P1 | **Input Sanitization:** Audit semua field text input (`bio`, `description`, `portfolio_context`) dari XSS injection. Gunakan DOMPurify di sisi client dan strip HTML tags di server sebelum simpan ke DB. |
| SEC-003 | P2 | **Session Expiry & Refresh:** Token saat ini expire 7 hari tanpa refresh mechanism. Implementasikan silent token refresh agar user tidak mendadak di-logout saat sedang menggunakan platform. |
| SEC-004 | P2 | **File Upload Security:** `portfolioFile` dan `cvFile` menyimpan path string tanpa validasi tipe. Tambahkan: (1) whitelist ekstensi file (pdf, jpg, png, docx), (2) limit ukuran 5MB, (3) scan nama file dari path traversal. |

### 3.2 AI Engine Improvements

| ID | Prioritas | Deskripsi & Acceptance Criteria |
|----|-----------|--------------------------------|
| AI-001 | P1 | **Reject Feedback Loop:** Data accept/reject dari `JobMatch.status` sudah tersimpan di DB namun belum digunakan. Buat endpoint `GET /api/ai/feedback-stats` yang mengembalikan skill apa yang paling sering menghasilkan accepted match vs rejected. Gunakan data ini untuk menyempurnakan prompt sistem secara berkala. |
| AI-002 | P1 | **Scheduled Re-Analysis:** Skill Gap Analysis saat ini hanya dijalankan sekali saat onboarding. Tambahkan trigger re-run otomatis jika: (1) talenta update skill profile, atau (2) sudah lebih dari 30 hari sejak analisis terakhir. Manfaatkan flag `isLatest` yang sudah ada. |
| AI-003 | P1 | **Token Optimization:** Saat jumlah talenta banyak, payload ke AI bisa sangat besar. Implementasikan pre-filtering: hanya kirim talent yang kategorinya match DAN setidaknya memiliki 1 skill yang overlap dengan `required_skills` job. Ini mengurangi token usage signifikan. |
| AI-004 | P2 | **Multi-Model A/B Testing:** Manfaatkan konfigurasi `AI_MODEL` yang sudah ada untuk A/B test kualitas output DeepSeek vs GPT-4o di production. Simpan `model_used` di kolom baru pada tabel `job_matches` dan `skill_gap_analyses`. |

### 3.3 Fitur Produk — Phase 1.5

| ID | Prioritas | Deskripsi & Acceptance Criteria |
|----|-----------|--------------------------------|
| FEAT-001 | P1 | **Rating System (Live):** Ganti dummy rating dengan form interaktif real. Trigger: setelah job status `Completed`, client mendapat prompt "Beri rating untuk [talenta] (1–5 bintang + komentar singkat)". Simpan di tabel baru `talent_ratings`. Tampilkan rata-rata rating di profil publik talenta. |
| FEAT-002 | P1 | **WeselAja Escrow Integration:** Ganti mock escrow dengan integrasi WeselAja API (partner yang sudah terkonfirmasi). Alur: Client pay → WeselAja hold → Nyamby notifikasi kedua pihak → Deliverable approved → WeselAja release ke talent. Simpan `weselaja_transaction_id` di tabel `escrow_transactions`. |
| FEAT-003 | P1 | **Dispute Resolution Flow:** Schema `DisputeTicket` sudah ada. Implementasikan UI-nya: (1) tombol "Ajukan Dispute" muncul setelah job In Progress, (2) form dispute dengan reason selector, (3) admin dashboard sederhana untuk resolve dispute dan trigger refund/release. |
| FEAT-004 | P2 | **Email Notification:** Ganti mock notifikasi dengan email nyata menggunakan Resend atau Nodemailer. Trigger: `new_match`, `job_accepted`, `payment_held`, `deliverable_submitted`, `payment_released`. Template sederhana dengan branding Nyamby. |
| FEAT-005 | P2 | **Talent Slug & Public Profile URL:** Field `slug` sudah ada di schema `TalentProfile` tapi belum diisi. Generate slug dari nama talenta (`raka-pratama`) saat onboarding. Aktifkan route `/talents/[slug]` sebagai halaman profil publik yang bisa dishare ke klien. |

---

## 4. Phase 2 — Gig Mode (2–4 Bulan Pasca Hackathon)

Gig Mode adalah dimensi baru Nyamby yang memungkinkan talenta memposting dan klien memesan jasa secara langsung (talent publish gig, client browse & beli), melengkapi Digital Services di Phase 1.

### 4.1 Definisi & Scope Gig Mode

| Aspek | Definisi |
|-------|----------|
| Target Audience — Talenta | Talenta Nyamby terdaftar (bukan publik umum) — wajib terverifikasi di platform. Gig eligibility diaktifkan dari profil mereka. |
| Target Audience — Client | Individu + SME — lebih luas dari client Phase 1. Contoh: orang butuh jasa desain cepat, tutor, atau asisten virtual. |
| Tipe Gig | On-demand tasks dengan scope terbatas, waktu pengerjaan singkat (1–7 hari), harga flat (bukan hourly rate). |
| Contoh Gig | Desain logo cepat 200K, Edit video 30 detik 150K, Setup WordPress 1 halaman 300K, Translate dokumen 1 halaman 50K |
| Differensiator dari Phase 1 | Phase 1: Client post job, AI match talent. Phase 2: Talent publish gig, Client browse & beli langsung. |

### 4.2 Open Questions — Harus Diputuskan Sebelum Build

> ⚠️ Seluruh pertanyaan berikut harus didiskusikan dan diputuskan bersama tim sebelum sprint Phase 2 dimulai.

1. **Q1:** Apakah Gig Mode dan Digital Services berbagi tabel `users` yang sama, atau Gig Mode punya flow register terpisah?
2. **Q2:** Apakah penilaian kualitas gig menggunakan AI matching atau pure browse (talent publish, client pilih sendiri)?
3. **Q3:** Apakah WeselAja escrow bisa dipakai untuk transaksi Gig Mode dengan nilai kecil (50K–500K)? Ada minimum fee?
4. **Q4:** Apakah Gig Mode perlu sistem verifikasi identitas talenta yang lebih ketat (KTP, portofolio reviewed)?
5. **Q5:** Platform fee Gig Mode — apakah tetap 10% atau berbeda mengingat margin transaksi kecil?

### 4.3 Schema Database Tambahan — Gig Mode

#### Tabel Baru: `gigs`

| Field | Tipe | Constraint | Keterangan |
|-------|------|-----------|-----------|
| id | UUID | PK | Primary key |
| talent_user_id | UUID | FK → users.id | Talenta yang publish gig |
| title | VARCHAR(255) | NOT NULL | Judul gig (maks 100 karakter) |
| description | TEXT | NOT NULL | Deskripsi detail apa yang diberikan |
| category | ENUM | NOT NULL | `web_dev \| graphic_designer \| video \| writing \| translate \| other` |
| price | DECIMAL(12,2) | NOT NULL | Harga flat dalam IDR |
| delivery_days | INTEGER | NOT NULL | Estimasi hari penyelesaian |
| revision_count | INTEGER | DEFAULT 1 | Berapa kali revisi termasuk |
| is_active | BOOLEAN | DEFAULT true | Status gig aktif atau tidak |
| status | ENUM | DEFAULT 'published' | `draft \| published \| paused \| archived` |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu publish |

#### Tabel Baru: `gig_orders`

| Field | Tipe | Constraint | Keterangan |
|-------|------|-----------|-----------|
| id | UUID | PK | Primary key |
| gig_id | UUID | FK → gigs.id | Gig yang dipesan |
| client_user_id | UUID | FK → users.id | Client yang memesan |
| requirements | TEXT | NOT NULL | Detail kebutuhan spesifik dari client |
| status | ENUM | DEFAULT 'pending' | `pending \| in_progress \| delivered \| revision \| completed \| cancelled` |
| amount_paid | DECIMAL(12,2) | NOT NULL | Total yang dibayar client |
| platform_fee | DECIMAL(12,2) | NOT NULL | Fee platform (10% dari amount) |
| deadline | TIMESTAMP | NOT NULL | Computed: `created_at + gig.delivery_days` |
| revision_used | INTEGER | DEFAULT 0 | Counter revisi yang sudah dipakai |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu order dibuat |

### 4.4 User Stories — Gig Mode

| Aktor | User Story | Acceptance Criteria |
|-------|-----------|-------------------|
| Talenta | Sebagai talenta, aku ingin membuat listing gig dengan harga flat sehingga client bisa langsung memesan tanpa negosiasi panjang | Halaman "My Gigs" dengan form create gig: judul, deskripsi, kategori, harga, delivery days, revisi. Preview tampilan sebelum publish. |
| Client | Sebagai client, aku ingin browse gig berdasarkan kategori dan harga sehingga aku bisa temukan jasa yang sesuai budget dengan cepat | Halaman `/gigs` dengan filter: kategori, budget range, delivery time. Card gig menampilkan foto talenta, judul, harga, rating, delivery days. |
| Client | Sebagai client, aku ingin memesan gig secara langsung dengan bayar di awal sehingga talenta langsung mulai mengerjakan | Tombol "Pesan Sekarang" → form requirements → payment → status In Progress. Kedua pihak mendapat notifikasi. |
| Talenta | Sebagai talenta, aku ingin submit deliverable dan mengelola request revision dari client agar proses serah terima terstruktur | Upload deliverable → Client pilih "Terima" atau "Minta Revisi". Counter revisi otomatis berkurang. Setelah revisi habis, hanya opsi Terima atau Dispute. |
| Sistem | Sistem harus mencatat feedback order setelah job selesai untuk membangun trust score talenta | Post-completion: client diberi form rating 3 dimensi (kualitas, komunikasi, sesuai ekspektasi). Skor ditampilkan di profil gig talenta. |

---

## 5. Phase 3 — Growth & Ekspansi (4–12 Bulan)

### 5.1 Roadmap Ekspansi Kategori

| Timeframe | Kategori Baru | Target Talenta | Catatan |
|-----------|--------------|---------------|---------|
| M1–M3 | Video Editor, Content Writer | 200–500 talenta baru | Validasi demand dari waitlist. Perlu skill master baru di DB. |
| M3–M6 | Digital Marketing, SEO, Social Media Manager | 500–1000 talenta | Perlu AI prompt tuning untuk skill marketing yang lebih abstract. |
| M6–M9 | Data Analyst, Python Developer, Mobile Dev | 1000–2000 talenta | Kategori premium — potensi rate lebih tinggi, platform fee lebih besar. |
| M9–M12 | Ekspansi Malaysia (pilot) | 200 talenta diaspora | Perlu MYR currency support dan WeselAja cross-border capability. |

### 5.2 AI Moat — Proprietary Feedback Loop

Keunggulan kompetitif jangka panjang Nyamby bukan di AI model (semua bisa pakai GPT-4o), tapi di **data rejeksi yang terkumpul** dari setiap interaksi.

- **Layer 1 — Explicit Signal:** Accept/Reject dari talenta dan client sudah terekam di `job_matches.status`.
- **Layer 2 — Implicit Signal:** Waktu antara job match dan keputusan accept (semakin cepat = semakin relevan). Perlu tambahkan kolom `decided_at` di `job_matches`.
- **Layer 3 — Outcome Signal:** Apakah job yang di-accept berakhir Completed atau Dispute? Ini adalah sinyal kualitas match yang paling kuat.
- **Layer 4 — Prompt Refinement:** Setiap bulan, tim analisis 20 kasus rejected match dan 20 accepted match. Update system prompt AI berdasarkan pola yang ditemukan.
- **Layer 5 — Embedding (long-term):** Setelah 1000+ data points, pertimbangkan fine-tuning atau RAG dengan vector embedding dari profil talenta.

### 5.3 Business Model Evolution

| Phase | Revenue Stream | Estimasi Nilai | Status |
|-------|--------------|---------------|--------|
| Phase 1 MVP | Platform fee escrow 10% | Rp 50K–150K per job | Sudah ada di kode (`platformFee = amount * 0.1`) |
| Phase 1.5 | WeselAja transaction fee share | TBD — negosiasi dengan WeselAja | Bergantung pada integrasi FEAT-002 |
| Phase 2 | Gig Mode platform fee 10–15% | Rp 10K–75K per gig | Perlu keputusan % fee yang kompetitif vs Fiverr/SideGigX |
| Phase 3 | Talent Boost (prioritas dalam shortlist) | Rp 50K–200K per 30 hari | Perlu validasi willingness to pay dari talenta dulu |
| Phase 3 | Client Subscription (post unlimited jobs + analytics) | Rp 200K–500K/bulan | Cocok untuk SME yang rutin rekrut freelancer |

---

## 6. Technical Debt & Arsitektur Jangka Panjang

### 6.1 Technical Debt yang Perlu Dibayar

| ID | Urgency | Deskripsi |
|----|---------|-----------|
| DEBT-001 | 🔴 Segera | `validations.ts` tidak ditemukan di repo (404). Padahal `jobs/route.ts` mengimport `jobCreateSchema` dari sana. Pastikan file ini ada dan ter-commit, atau codebase tidak bisa dijalankan dari awal. |
| DEBT-002 | 🟡 3 bulan | **Background job processing:** AI matching saat ini dijalankan via Promise fire-and-forget di dalam request handler. Pada skala besar ini tidak reliable. Migrasikan ke job queue (BullMQ + Redis) untuk retry, monitoring, dan dead letter queue. |
| DEBT-003 | 🟡 3 bulan | **N+1 query pada AI matching:** Pertimbangkan cursor-based pagination untuk talent pool > 500 orang agar performa tidak degradasi. |
| DEBT-004 | ⚪ 6 bulan | **Monitoring & Observability:** Tidak ada error tracking (Sentry), performance monitoring, atau AI cost tracking. Penting sebelum scale untuk mencegah surprise billing dari OpenAI/DeepSeek. |
| DEBT-005 | ⚪ 6 bulan | **Test coverage:** Playwright sudah ada di devDependencies tapi tidak ada test file. Minimal buat e2e test untuk 2 critical path: (1) register → onboarding → AI gap analysis, (2) post job → AI matching → shortlist muncul. |

### 6.2 Arsitektur Saat Ini vs Target

| Layer | Saat Ini (MVP) | Target (6 Bulan) |
|-------|--------------|----------------|
| Deployment | VPS tunggal (duckdns.org) | Vercel (frontend) + Railway/Supabase (DB) — lebih reliable, auto-scale |
| AI Jobs | Fire-and-forget Promise | BullMQ + Redis job queue dengan retry logic dan dead letter queue |
| Database | PostgreSQL single instance | Connection pooling via PgBouncer, read replica untuk query analytics |
| File Storage | Local path (portfolioFile) | Cloudinary atau Supabase Storage dengan CDN |
| Notifications | In-app only (DB polling) | In-app + Email (Resend) + WhatsApp Business API |
| Auth | JWT custom (jose) | Tetap custom JWT, tambahkan OAuth (Google login) untuk reduce friction |

---

## 7. Master Roadmap — Summary

| Fase | Timeline | Deliverable Utama | Indikator Sukses |
|------|----------|------------------|-----------------|
| **P0 — Pre-Demo** | 0–3 hari | FIX-001 s/d FIX-008 selesai, demo rehearsal passed | Tidak ada broken flow saat full end-to-end test |
| **Phase 1.5 Batch A** | Minggu 1–2 | SEC-001,002 + AI-001,002,003 + FEAT-001 | Platform aman untuk 50 beta user pertama |
| **Phase 1.5 Batch B** | Minggu 3–4 | FEAT-002 (WeselAja) + FEAT-003 (Dispute UI) + FEAT-004,005 | Transaksi real pertama berhasil end-to-end |
| **Phase 2 — Design** | Bulan 2 | Open questions diputuskan, schema Gig Mode finalized, wireframe disetujui | Sign-off dari seluruh tim co-founder |
| **Phase 2 — Build** | Bulan 3–4 | Gig Mode MVP: publish gig, browse, order, deliver, rating | 10 gig order pertama berhasil completed |
| **Phase 3 — Growth** | Bulan 5–12 | 3 kategori baru, 500+ talenta aktif, feedback loop produktif | MRR pertama, retention > 40% setelah 3 bulan |

### 7.1 Prinsip yang Harus Dijaga di Semua Fase

- **Verified talent pool sebagai moat:** Jangan pernah izinkan publik umum mengerjakan gig tanpa verifikasi Nyamby. Ini adalah trust layer yang memisahkan kita dari platform casual lainnya.
- **Data feedback loop adalah aset:** Setiap accept/reject/dispute adalah data training masa depan. Pastikan semua event tercatat dengan konteks yang cukup.
- **AI harus terlihat bekerja:** Di setiap demo dan onboarding, AI harus memberikan output yang terasa personal dan relevan, bukan generic. Kualitas prompt engineering sama pentingnya dengan model yang dipilih.
- **Dokumentasi-first:** Setiap fitur baru wajib punya PRD section sebelum di-code. Ini memastikan semua co-founder aligned sebelum memulai implementasi.
- **Escrow sebagai trust anchor:** Jangan pernah allow transaksi di luar escrow. Ini adalah jaminan kepercayaan yang menjadi alasan client memilih Nyamby vs WhatsApp langsung.

---

*Nyamby — Patch PRD v2.0 | Disusun oleh Satria Romanda (CPO) | Juni 2026 | Confidential — Internal Document*
