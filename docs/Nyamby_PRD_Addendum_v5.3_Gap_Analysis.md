**NYAMBY**

*Product Requirements Document — Addendum*

**PRD v5.3 — Gap Analysis, Critical Fixes, Sprint Backlog & Permintaan Fitur Baru**

| Versi | 5.3 — Post-Codebase Audit \+ Product Feature Requests \+ Keputusan Cross-Border |
| :---- | :---- |
| **Author** | Satria Romanda (CPO) |
| **Reviewer disarankan** | Akbar Lubis (CTO), Rahmat Ramadhan (Product/UX) |
| **Tanggal** | 9 Juli 2026 (v5.0 audit) — diperbarui 9 Juli 2026 (v5.1 nambah §6; v5.2 nambah §6.12–6.13; v5.3 finalisasi §6.12 \+ keputusan park Cross-Border \+ verifikasi dokumentasi Xenith) |
| **Base Ref** | PRD v1.0–v4.0 \+ `github.com/satriaromanda/nyamby` (master, ditarik langsung 9 Juli 2026\) \+ `docs.xenithpay.com` |
| **Status** | DRAFT — untuk direview & di-assign ke sprint. §6 belum ada eksekusi kode kecuali item yang ditandai SELESAI |

---

# 1\. Ringkasan Eksekutif

Dokumen ini adalah hasil audit langsung terhadap kode di `master` branch, dibandingkan satu-per-satu terhadap klaim di PRD v1.0 (MVP), Patch v2.0 (perbaikan), v3.0 (missing features & admin), dan v4.0 (cross-border Malaysia). Tujuannya: memisahkan apa yang **benar-benar sudah jalan di kode**, apa yang **kelihatan selesai tapi sebenarnya rusak**, dan apa yang **memang belum dikerjakan** — supaya sprint berikutnya tidak menebak-nebak.

**Temuan utama (headline):**

1. Cakupan fitur jauh lebih tinggi dari yang tercatat di memory/dokumen sebelumnya. Hampir semua item di PRD v3.0 (disputes, rating, feedback-stats, auto-release cron, portfolio analyzer, admin dashboard) **sudah ada kodenya dan sesuai spek**.  
2. PRD v4.0 (Cross-Border Malaysia) yang sebelumnya dicatat sebagai "100% Sprint Backlog, belum divalidasi" ternyata **sudah punya kode lengkap**: halaman `/global`, endpoint verifikasi bisnis, onboarding client dengan field negara/currency, breakdown ekspor di admin stats, mode ekspor di smart pricing.  
3. **Tapi ada bug fondasi yang membuat poin 2 kemungkinan besar tidak bisa jalan sama sekali**: kode mereferensikan field Prisma (`country`, `preferredCurrency`, dll) dan file `src/lib/validations.ts` yang **tidak ada di schema/repo saat ini**. Ini bukan "belum selesai" — ini "sudah ditulis tapi kemungkinan gagal build/runtime". Lihat §4.  
4. Beberapa item P0 dari Patch v2.0 sudah dikerjakan (JWT\_SECRET fallback sudah dihapus). Beberapa masih terbuka (`.env.example` masih hilang, `validations.ts` masih 404 — sudah ditandai sejak Juni, masih belum di-fix).  
5. **\[v5.1\]** Satria menambahkan 10 permintaan fitur/perbaikan produk baru (UX, AI matching, Gig Mode, SEO) — didokumentasikan di §6. Dua di antaranya (notifikasi dashboard \+ halaman "Ruang Kerja" talent-client) sudah dieksekusi sebagai patch kode siap-terap oleh Akbar; sisanya masih level spek, sengaja **belum dieksekusi** sesuai arahan — dokumentasi dulu, baru sprint planning.  
6. **\[v5.2\]** Bug payment redirect macet "pending" (§6.13) ditandai P0 oleh Satria dan **sudah dieksekusi** jadi patch kode (root cause: sistem 100% pasif nunggu webhook, tombol "Cek Status" ternyata cuma `router.refresh()` tanpa pernah nanya ke Xenith).  
7. **\[v5.3\] KEPUTUSAN STRATEGIS:** Satria memutuskan **Cross-Border Malaysia (PRD v4.0) DITAHAN — kemungkinan tidak diaktifkan sama sekali**. Ini membatalkan kebutuhan Sprint 1 di §5 (fix schema CRIT-002) dan mengubah rekomendasi CRIT-002 dari "perbaiki" menjadi "isolasi/hapus dari `master`". Detail di §3.3 dan §5.  
8. **\[v5.3\]** Dokumentasi resmi Xenith (`docs.xenithpay.com`) berhasil diakses — mengonfirmasi mekanisme `callbackUrl` per-request (bukan webhook dashboard generik) dan status enum Pay In, tapi endpoint pasti untuk cek status satu Pay In **masih belum ketemu** (halaman reference API di-render client-side, tidak bisa ditarik dari sesi ini) — lihat §6.13.

**Assumption yang dipakai:** Analisis ini berbasis file yang bisa ditarik dari `raw.githubusercontent.com` (branch `master`). Tidak bisa akses GitHub REST API (`api.github.com`) dari environment ini untuk listing direktori penuh — jadi kemungkinan ada file/route yang terlewat karena saya menebak path berdasarkan konvensi Next.js App Router dan spek PRD sebelumnya. Rekomendasi: Akbar cross-check §4 di lokal sebelum eksekusi fix, khusus untuk klaim "file tidak ditemukan".

---

# 2\. Metodologi

- Dibaca: `memory.md` project (histori keputusan), PRD v1.0, Patch v2.0, PRD v3.0, PRD v4.0, README repo.  
- Ditarik langsung dari `raw.githubusercontent.com/satriaromanda/nyamby/master/...`: `package.json`, `prisma/schema.prisma`, `src/lib/auth.ts`, `src/lib/validations.ts`, `vercel.json`, `.env.example`, `README.md`, dan route handler untuk: disputes, ratings, ai/feedback-stats, ai/match-job, ai/portfolio-analyzer, ai/smart-pricing, cron/auto-release, admin/users, admin/stats, client/onboarding, client/verify-business, `src/app/global/page.tsx`, `src/services/xenith.ts`.  
- Status "✅ Ada & Sesuai" hanya diberikan jika kode benar-benar dibaca dan logikanya cocok dengan spek PRD. Bukan asumsi dari nama file.

---

# 3\. Status Matrix — Fitur vs Implementasi Aktual

## 3.1 MVP Layer 1 (PRD v1.0) & Patch v2.0

| Fitur / Item | Status | Evidence |
| :---- | :---- | :---- |
| Auth (register/login, JWT custom via `jose`) | ✅ Ada | `src/lib/auth.ts` — cookie httpOnly, 7 hari, role talent/client/admin |
| **FIX-001** JWT\_SECRET fallback hardcoded | ✅ **Sudah diperbaiki** | `auth.ts` sekarang `throw new Error(...)` jika `JWT_SECRET` kosong/\<32 char — tidak ada fallback lagi |
| **FIX-002** `.env.example` hilang | ❌ **Masih terbuka** | Fetch `.env.example` di master → 404\. README masih instruksikan `cp .env.example .env` — akan gagal untuk siapapun yang clone baru |
| **FIX-003** `deleteMany` sebelum insert re-match | ⚠️ Perlu verifikasi ulang | `match-job/route.ts` sekarang delegasi penuh ke `runAiJobMatching()` di `src/services/ai-matching.ts` (tidak terlihat `deleteMany` langsung di route) — tapi isi `ai-matching.ts` sendiri belum ditarik, verifikasi dulu sebelum dianggap selesai |
| **FIX-004** Model AI default `deepseek-chat`, bukan GPT-4o | ❌ **Masih sesuai temuan lama** | `portfolio-analyzer/route.ts`: `aiModel = process.env.AI_MODEL || "deepseek-chat"`. README juga bilang "DeepSeek (primary) / GPT-4o (fallback)" — **kebalikan dari klaim di pitch deck PRD v1.0 yang bilang GPT-4o**. Ini risiko konsistensi kalau juri tanya model apa yang dipakai |
| **DEBT-001** `src/lib/validations.ts` tidak ditemukan | ❌ **Masih terbuka sejak Juni** | Fetch langsung ke path itu → kosong/404, padahal `client/onboarding/route.ts` dan (menurut Patch v2.0) `jobs/route.ts` meng-import schema dari sana. Kalau file ini benar tidak ada, **seluruh build kemungkinan gagal** — ini prioritas tertinggi untuk dicek Akbar hari ini, bukan sprint depan |
| Escrow via Xenith (payin/payout, HMAC signature, idempotency key, timing-safe webhook check) | ✅ Ada & solid | `src/services/xenith.ts` — signature HMAC-SHA256, `timingSafeEqual` untuk verifikasi webhook, `X-Idempotency-Key` di setiap request. Ini implementasi yang lebih matang dari yang tercatat di dokumen manapun |
| Job status tracker, submission\_url/notes, submittedAt | ✅ Ada | Sudah di schema (`Job.submissionUrl`, `submissionNotes`, `submittedAt`) — dependency untuk auto-release cron sudah terpenuhi |

## 3.2 PRD v3.0 — Missing Features (per Juni 2026\)

| Fitur | Status Juni (v3.0) | Status Sekarang | Evidence |
| :---- | :---- | :---- | :---- |
| `POST /api/disputes` | ❌ Missing | ✅ **Selesai, sesuai spek** | Validasi ownership, status job, status escrow, duplicate check, transaction-safe, notifikasi kedua pihak \+ admin — semua 6 poin logika bisnis di PRD terpenuhi |
| Rating & Review (`talent_ratings`) | ❌ Missing | ✅ **Selesai, sesuai spek** | Model `TalentRating` ada di schema, endpoint `POST /api/ratings` cocok persis dengan spek (role client only, job completed, idempotent, notifikasi) |
| `GET /api/ai/feedback-stats` | ❌ Missing | ✅ **Selesai, sesuai spek** | Agregasi Prisma murni (tanpa AI call, sesuai rekomendasi), termasuk breakdown per recommendation level dan top rejection reasons |
| Auto-release 5 hari kerja | ❌ Missing | ✅ **Selesai** | `cron/auto-release/route.ts` \+ `vercel.json` crons config `0 1 * * *`. Logika business-days, cek bank account talent, trigger Xenith payout, update status — lengkap |
| Smart Pricing Guidance | ❌ Missing | ✅ **Selesai (domestik)** | Agregasi `ratePerHour`/`ratePerProject`, fallback ke kategori jika sample \<5 — sesuai spek |
| Portfolio Analyzer AI | ⚠️ Parsial | ✅ **Selesai** | Endpoint lengkap, 4 dimensi evaluasi, update `profileCompletenessScore` di `SkillGapAnalysis` — sesuai spek §7 |
| Admin: `GET /api/admin/users` | ❌ Missing | ✅ **Selesai** | Filter role/status/search, pagination, total\_jobs & total\_completed per user |
| Admin: `GET /api/admin/stats` | ❌ Missing | ✅ **Selesai (bagian domestik)** | Users, jobs, financials, AI, disputes — semua field sesuai spek §8.3. **Bagian `export` di dalamnya masuk kategori bermasalah — lihat §4** |
| Bank account di onboarding | ⚠️ Perlu verifikasi | ✅ Ada di schema | `bankCode`/`bankAccount`/`bankAccountName` ada di `TalentProfile` **dan** `ClientProfile` |

## 3.3 PRD v4.0 — Cross-Border Malaysia (per Juli 2026, base ref sebelumnya "Sprint Backlog")

| Item | Status di v4.0 doc | Status kode (ditemukan) | Evidence & Masalah |
| :---- | :---- | :---- | :---- |
| Schema `country`/`preferredCurrency`/`Currency` enum | ❌ Belum ada | ❌ **Masih benar-benar tidak ada** | `prisma/schema.prisma` yang ditarik dari master **tidak** punya enum `ClientCountry`/`Currency`, dan `ClientProfile` **tidak** punya field `country`/`preferredCurrency`/`businessVerifiedAt`/`businessEmailDomain` |
| Onboarding client dgn field negara/currency | ❌ Belum ada | ⚠️ **Kode sudah ditulis, tapi bergantung pada schema yang belum ada** | `client/onboarding/route.ts` men-set `country: country || "indonesia"` dan `preferredCurrency` ke `prisma.clientProfile.create()` — **field ini tidak ada di model Prisma yang aktif**. Kemungkinan besar TypeScript build error atau Prisma runtime error "Unknown argument" |
| Verifikasi bisnis ringan (`/api/client/verify-business`) | ❌ Belum ada | ⚠️ **Kode lengkap, blocker sama** | Logic email-domain check sudah bagus (whitelist provider gratis ditolak), tapi `update()` menulis `businessEmailDomain`/`businessVerifiedAt` — field yang sama tidak ada di schema |
| Landing page `/global` | ❌ Belum ada | ✅ **Sudah jadi, kualitas bagus** | Hero, value prop, kalkulator perbandingan biaya IDR/USD vs MYR lengkap dengan disclaimer sesuai spek §3.4 — **ini bagian yang aman, tidak bergantung ke field schema yang hilang** |
| Smart Pricing mode ekspor (`?market=export`) | ❌ Belum ada | ✅ **Sudah jadi, aman** | Benchmark hardcoded per kategori \+ disclaimer wajib tampil — sesuai spek, dan tidak bergantung pada field schema yang bermasalah |
| Admin stats — breakdown ekspor | ❌ Belum ada | ⚠️ **Kode ada, blocker sama** | `admin/stats/route.ts` query `prisma.clientProfile.count({ where: { country: ... } })` — field `country` tidak ada di schema aktif |
| Xenith payin cross-border tervalidasi sandbox | ❌ Belum diuji | ❌ **Belum ada bukti pengujian** | `xenith.ts` men-support currency parameter generik, tapi tidak ada test/log yang membuktikan payin luar negeri sudah dicoba di sandbox |

**Kesimpulan §3.3:** Progress v4.0 jauh lebih maju dari catatan sebelumnya ("0% \- masih sprint backlog") — kira-kira 70% kode sudah ditulis. Tapi **secara fungsional kemungkinan besar 0% bisa berjalan** karena fondasi schema-nya belum di-deploy. Ini pola berbahaya: enak dilihat di code review (banyak file baru), tapi tidak bisa dibuktikan berfungsi.

**🛑 KEPUTUSAN — 9 Juli 2026 (v5.3):** Satria memutuskan **Cross-Border Malaysia DITAHAN, kemungkinan tidak diaktifkan sama sekali**. Efeknya terhadap temuan di atas:

- CRIT-002 (field schema hilang) **tidak perlu diperbaiki** — malah sebaliknya, kode yang bergantung padanya (onboarding country/currency, verify-business, breakdown ekspor di admin stats, smart-pricing mode ekspor) sebaiknya **diisolasi keluar dari `master`**, bukan dibuatkan schema-nya. Fitur setengah-jadi yang di-park lebih aman dikeluarkan dari branch utama daripada dibiarkan nyangkut dan berisiko diaktifkan tidak sengaja.  
- Halaman `/global` dan mode ekspor `smart-pricing` **tidak bergantung ke field schema yang hilang** (lihat tabel di atas) — aman ditinggal di `master` kalau memang masih mau dipakai sebagai halaman landing biasa, TAPI karena keputusannya "mungkin tidak diaktifkan sama sekali", pertimbangkan untuk sekalian dipindah bareng ke branch `feat/cross-border` yang di-park, supaya tidak ada linked promise ("Now serving Malaysia") yang aktif tanpa fitur di baliknya benar-benar berfungsi.  
- Patch payment-reconciliation di §6.13 **sudah disesuaikan**: logika baca/tulis field cross-border (`ClientProfile.country`, `Payment.originCountry`, dst) yang tadinya ada di webhook asli **sudah dihapus** dari `payment-reconciliation.ts` — bukan cuma didiamkan, supaya tidak mewarisi bug dari fitur yang sedang di-park.  
- CRIT-006 (uji sandbox payin cross-border) **tidak relevan lagi** selama keputusan ini berlaku — jangan dikerjakan sampai ada keputusan sebaliknya.

---

# 4\. Temuan Kritis — Wajib Dicek Sebelum Sprint Planning

| ID | Prioritas | Temuan | Dampak jika tidak diperbaiki |
| :---- | :---- | :---- | :---- |
| **CRIT-001** | 🔴 P0 | `src/lib/validations.ts` tidak ditemukan di master, padahal di-import minimal oleh `client/onboarding/route.ts` (dan diduga `jobs/route.ts`, `verify-business/route.ts`) | Build/dev server kemungkinan gagal total dari awal clone. Ini bisa jadi false-negative dari cara saya fetch (raw GitHub kadang cache/branch berbeda) — **Akbar wajib konfirmasi langsung di lokal hari ini** |
| **CRIT-002** | 🟢 **DITAHAN (bukan lagi P0-fix)** | ~~Schema Prisma tidak punya field/enum yang dipakai kode v4.0~~ — **Keputusan 9 Juli 2026 (§3.3): Cross-Border DITAHAN**, jadi field ini TIDAK perlu ditambahkan. Tindakan yang benar sekarang: **isolasi/hapus kode yang bergantung padanya** dari `master` (lihat Sprint 0 item 2 di §5) | Kalau tidak diisolasi, kode mati (dead code) ini tetap jadi risiko bingung buat siapa pun yang baca repo, dan tetap berpotensi break build kalau ada yang iseng aktifkan tanpa sadar schema-nya belum ada |
| **CRIT-003** | 🔴 P0 | `.env.example` tidak ada, README menyuruh copy dari file itu | Onboarding developer baru (termasuk kalau CTO ganti laptop/server) langsung gagal di step pertama |
| **CRIT-004** | 🟡 P1 | Klaim model AI tidak konsisten: PRD v1.0/pitch bilang GPT-4o, README & kode default-nya DeepSeek | Risiko kredibilitas ke juri kalau ditanya detail — selaraskan satu narasi sebelum submission berikutnya |
| **CRIT-005** | 🟡 P1 | `FIX-003` (deleteMany sebelum insert) belum terverifikasi tuntas — isi `src/services/ai-matching.ts` belum diaudit | Berpotensi masih ada risiko data loss saat re-matching kalau service tidak pakai transaction dengan benar |
| **CRIT-006** | ⚪ **TIDAK RELEVAN (Cross-Border ditahan)** | ~~Belum ada bukti test sandbox Xenith untuk payin luar negeri~~ — tidak perlu dikerjakan selama keputusan park di §3.3 berlaku | — |
| **CRIT-007** | 🔵 P2 | `SEC-001` (rate limiting endpoint AI), `SEC-002` (sanitasi XSS), `DEBT-004` (monitoring/Sentry), `DEBT-005` (test coverage — Playwright ada di devDependencies tapi kemungkinan 0 test file) — belum diverifikasi ada/tidaknya di kode | Tidak blocking demo, tapi blocking sebelum onboarding user nyata pertama |

---

# 5\. Sprint Backlog — Task List

*Urutan berdasarkan dependency dan risiko. Silakan tambah/adjust langsung — ini draft awal untuk didiskusikan dengan Akbar & Rahmat.*

### Sprint 0 — Verifikasi & Stop-the-Bleeding (1–2 hari, sebelum sprint apapun dimulai)

1. **Konfirmasi lokal:** jalankan `npm run build` di lokal/CI — pastikan CRIT-001 (`validations.ts`) benar-benar error atau cuma masalah fetch saya.  
2. **Isolasi kode Cross-Border dari `master`** (bukan lagi kondisional "kalau bug nyata" — ini sekarang tindakan pasti mengikuti keputusan park di §3.3): pindahkan `client/onboarding` bagian country/currency, `api/client/verify-business`, bagian `export` di `admin/stats`, mode `?market=export` di `ai/smart-pricing`, dan (didiskusikan dulu dengan tim) halaman `/global` ke branch `feat/cross-border` yang tidak di-merge sampai ada keputusan aktivasi ulang. Tujuannya: `master` bersih dari fitur setengah-jadi yang bisa bikin bingung atau ke-trigger tidak sengaja.  
3. Buat `.env.example` (CRIT-003) — 15 menit kerjaan, tidak ada alasan ditunda.

### ~~Sprint 1 — Fondasi Cross-Border~~ — DIBATALKAN (lihat keputusan §3.3, 9 Juli 2026\)

Sprint ini sebelumnya berisi: tambah field schema cross-border, re-test onboarding non-Indonesia, uji sandbox Xenith payin luar negeri. **Semua item ini dibatalkan** mengikuti keputusan Satria untuk menahan Cross-Border Malaysia. Jangan dikerjakan sampai ada keputusan bisnis baru yang eksplisit mengaktifkan kembali fitur ini.

### Sprint 2 — Konsistensi & Kredibilitas Demo

7. Selaraskan narasi model AI (CRIT-004): putuskan satu — GPT-4o atau DeepSeek — set `AI_MODEL` di production sesuai keputusan, lalu update semua materi (pitch deck, README, PRD) supaya konsisten.  
8. Audit `src/services/ai-matching.ts` untuk memastikan FIX-003 benar tuntas (pakai transaction, tidak ada `deleteMany` tanpa proteksi).  
9. Update README: perbaiki klaim "iron-session" (kode aktual pakai custom JWT via `jose`, bukan iron-session) — dokumentasi yang salah bisa membingungkan reviewer/juri yang cek repo.

### Sprint 3 — Hardening Sebelum User Real Pertama (paralel, tidak blocking demo)

10. Rate limiting di `/api/ai/*` (SEC-001).  
11. Input sanitization untuk field bebas teks (`bio`, `description`, `portfolio_context`) (SEC-002).  
12. Minimal 2 e2e test Playwright untuk critical path: (a) register→onboarding→AI skill gap, (b) post job→AI matching→shortlist (DEBT-005).  
13. Setup error tracking dasar (Sentry atau alternatif) sebelum ada trafik user nyata (DEBT-004).

### Backlog — Tidak Urgent, Tapi Jangan Dilupakan

14. Verifikasi test end-to-end lengkap sesuai checklist Patch v2.0 §2.4 (demo rehearsal) sebelum submission berikutnya.  
15. Putuskan open questions Gig Mode/Phase 2 (lihat Patch v2.0 §4.2) — belum perlu dieksekusi, tapi perlu keputusan tim supaya tidak jadi scope creep tiba-tiba.

---

# 6\. Permintaan Fitur Baru — Product Backlog (ditambahkan 9 Juli 2026\)

*Sumber: arahan langsung Satria (CPO) setelah review v5.0. Sengaja didokumentasikan dulu sebagai spek — **belum jadi perintah eksekusi sprint** kecuali dua item yang eksplisit ditandai SELESAI di bawah. Setiap item mengikuti format: Kebutuhan → Status Saat Ini → Rencana Teknis → Dependency/Risiko → Prioritas.*

## 6.1 Status Ringkas

| \# | Item | Status | Prioritas Usulan |
| :---- | :---- | :---- | :---- |
| 1 | Job flow: talent-client connect & progress tracking | ✅ **v1 SELESAI** (patch terlampir) | P1 |
| 2 | Notifikasi dashboard: fungsional \+ deep-link | ✅ **SELESAI** (patch terlampir) | P0 |
| 3 | Post job: opsi level entry & parameter relevan | 📝 Spek — belum dikerjakan | P2 |
| 4 | Animasi status matching sesuai progress real | 📝 Spek — belum dikerjakan | P2 |
| 5 | Navigasi: konsistensi ukuran & perilaku klik | 📝 Spek — belum dikerjakan | P1 |
| 6 | Input pengalaman/project di profil talent utk AI | 📝 Spek — belum dikerjakan | P1 |
| 7 | AI matching lebih teliti \+ rekomendasi job \>60% di dashboard | 📝 Spek — belum dikerjakan | P0 |
| 8 | Homepage: tampilkan job terbaru (feel job portal) | 📝 Spek — belum dikerjakan | P1 |
| 9 | Talent bisa buat Gig \+ rekomendasi harga AI | 📝 Spek — belum dikerjakan | P2 (overlap Gig Mode Phase 2, lihat §6.9) |
| 10 | Breadcrumb SEO-friendly | 📝 Spek — belum dikerjakan | P3 |
| 11 | Dashboard talent & client pakai sidebar (menu \+ settings/profile), konsisten | 📝 Spek — belum dikerjakan, **butuh referensi desain dari Satria** (link share tidak bisa diakses, perlu login) | P1 |
| 12 | Payment redirect masih "pending" walau sudah disimulasikan | ✅ **SELESAI** (patch terlampir) — lihat §6.13 | **P0 (ditandai prioritas oleh Satria)** |

## 6.2 Job Flow: Talent-Client Connect & Progress Tracking

**Kebutuhan:** Saat job berjalan, talent dan client bisa saling terhubung dan melihat progress pekerjaan yang sama — bukan cuma status enum terpisah di masing-masing dashboard.

**Status saat ini:** Kedua dashboard (`talent/dashboard`, `client/dashboard`) sudah punya tombol "Buka Ruang Kerja" yang mengarah ke `/workspace/[id]` — tapi halaman itu **tidak pernah dibuat** (404). Sudah dibuat versi pertamanya: `src/app/workspace/[id]/page.tsx`, reuse `GET /api/jobs/:id` yang sudah ada. Isinya: status tracker real (`JobStatusTracker` berdasarkan `job.status`), kartu kontak dasar (nama \+ avatar pihak lain), dan aksi sesuai role & tahap (upload deliverable, release escrow, minta revisi, ajukan dispute — dispute sebelumnya sudah ada endpoint-nya tapi **belum pernah ada UI-nya sama sekali**).

**Yang belum:** "Saling terhubung" di sini masih level kontak dasar, **bukan chat/messaging real-time**. Tidak ada model `Message` di schema Prisma. Kalau yang dimaksud chat sungguhan, itu perlu: (a) model `Message` baru (jobId, senderId, body, createdAt), (b) endpoint kirim/list pesan, (c) polling atau websocket untuk real-time. Ini scope terpisah, belum diestimasi.

**Dependency:** Tidak ada — halaman sudah reuse endpoint existing, aman digabung ke `master` begitu Akbar review.

## 6.3 Notifikasi Dashboard: Fungsional \+ Deep-Link

**Kebutuhan:** Notifikasi di dashboard harus berfungsi baik dan klik notifikasi harus membuka halaman yang sesuai dengan isi pesannya.

**Status saat ini:** `src/components/NotificationBell.tsx` sebelumnya cuma `markAsRead()` saat diklik — **tidak ada navigasi sama sekali**, ini akar masalahnya. Sudah diperbaiki: klik notifikasi sekarang `router.push()` ke `/workspace/{related_job_id}` (field `relatedJobId` di model `Notification` sudah ada dari awal, cuma belum dipakai di frontend). Icon mapping juga dilengkapi untuk tipe yang sebelumnya tidak dikenali (`deliverable_submitted`, `revision_requested`, `job_completed`, `dispute_opened`, `new_rating`).

**Dependency:** Berfungsi penuh begitu §6.2 (halaman workspace) ikut di-merge — keduanya harus jalan bareng, deep-link tidak berguna kalau halaman tujuannya masih 404\.

## 6.4 Post Job: Opsi Level Entry & Parameter Relevan

**Kebutuhan:** Saat client posting job, ada pilihan level (entry/intermediate/expert atau setara) dan parameter matching menyesuaikan level tersebut.

**Status saat ini:** Belum diverifikasi form post-job (`client/post-job`) — enum `SkillLevel` (`beginner`/`intermediate`/`expert`) sudah ada di schema untuk talent skill, tapi `Job` model **tidak** punya field level yang setara. Belum dicek apakah UI form-nya sudah ada opsi ini.

**Rencana teknis:** Tambah field `experienceLevel` (enum, sama seperti `SkillLevel` talent) ke model `Job`. Masukkan sebagai parameter tambahan di prompt AI Job Matching (§7.1 PRD v1.0) — talent dengan level jauh di bawah/atas requirement job dapat penalti/bonus di reasoning, bukan cuma skill overlap.

**Dependency:** Perubahan schema (`prisma db push`) \+ update prompt matching (`src/services/ai-matching.ts`).

## 6.5 Animasi Status Matching Sesuai Progress Real

**Kebutuhan:** Animasi saat proses matching AI dan status berikutnya harus merefleksikan progress asli, bukan animasi generik.

**Status saat ini:** Ternyata **sudah cukup baik** — `aiStatus` (enum `pending/processing/completed/failed`) sudah ada di schema untuk `SkillGapAnalysis` dan `JobMatch`, dan sudah dipakai di UI: client dashboard menampilkan spinner khusus saat `aiStatus === "processing"/"pending"` dan pesan error saat `"failed"` (bukan animasi generik yang tidak nyambung ke data).

**Yang perlu dicek:** Apakah *semua* titik AI (skill gap refresh, portfolio analyzer, smart pricing) konsisten pakai pola yang sama, atau ada yang masih pakai animasi hardcoded tanpa polling status asli. Perlu audit per halaman, bukan asumsi berdasarkan satu contoh.

## 6.6 Navigasi: Konsistensi Ukuran & Perilaku Klik

**Kebutuhan:** Seluruh navigasi disamakan — banyak yang tidak konsisten saat diklik maupun berubah ukuran.

**Status saat ini:** Ditemukan **3 implementasi navbar berbeda** yang tidak saling berbagi komponen: `Navbar.tsx` (landing/publik, tinggi `h-20`, dropdown mega-menu), nav inline di `talent/dashboard/page.tsx` (tinggi `h-16`, pill-tab sederhana), dan nav inline di `client/dashboard/page.tsx` (tinggi `h-16`, pill-tab beda isi). Tidak ada satu `<DashboardNavbar>` yang dipakai bersama — ini kemungkinan besar sumber "tidak konsisten ketika diklik maupun berubah ukuran" yang dikeluhkan.

**Rencana teknis:** Ekstrak satu komponen `DashboardNavbar` (role-aware: talent/client) dipakai di kedua dashboard, standarkan tinggi (`h-16`), breakpoint, dan perilaku dropdown/hover supaya konsisten dengan `Navbar.tsx` publik.

## 6.7 Input Pengalaman/Project di Profil Talent untuk AI

**Kebutuhan:** Tambah input pengalaman kerja dan project di profil talent, sebagai data tambahan untuk AI matching dan analysis.

**Status saat ini:** `TalentProfile` saat ini hanya punya `bio`, `portfolioUrl`, `portfolioFile`, `cvFile`, `cvText`, `portfolioContext` — semua bebas teks/tidak terstruktur. Tidak ada tabel pengalaman kerja atau daftar project terstruktur (nama project, peran, tech stack, durasi, hasil).

**Rencana teknis:** Tabel baru `talent_experiences` (talentProfileId, title, company/client, description, startDate, endDate, techStack\[\]) dan/atau `talent_projects` (title, description, role, techStack\[\], url, year). Masukkan sebagai input tambahan ke prompt AI Job Matching dan Portfolio Analyzer (§6.8) — ini yang paling menaikkan kualitas reasoning AI dibanding data bebas teks yang ada sekarang.

**Dependency:** Blocking untuk §6.8 (AI matching lebih teliti) — tanpa data terstruktur ini, AI cuma bisa parsing dari teks bebas yang kualitasnya tidak konsisten.

## 6.8 AI Matching Lebih Teliti \+ Rekomendasi Job di Dashboard (Match \>60%)

**Kebutuhan:** AI matching menilai CV, input pengalaman, skill secara teliti terhadap requirement job dan project yang relevan. Rekomendasi job otomatis muncul di dashboard talent kalau match score AI di atas 60%.

**Status saat ini:** AI Job Matching (`src/services/ai-matching.ts`) sudah jalan dan sudah tersimpan di `job_matches` dengan `matchScore`, `strengths`, `gaps`, `reasoning` — dan **memang sudah muncul otomatis** di dashboard talent sebagai "Job Untukmu" (lihat `talent/dashboard/page.tsx`, section Recommended Jobs). Yang **belum dikonfirmasi**: apakah ada threshold eksplisit 60% yang memfilter mana yang tampil, atau semua match ditampilkan tanpa filter skor.

**Rencana teknis:** (a) Tambah filter di API dashboard talent: hanya tampilkan match dengan `match_score >= 60`. (b) Perkaya input prompt matching dengan data terstruktur dari §6.7 (pengalaman & project), bukan cuma skill tags — supaya reasoning AI benar-benar "menilai CV & pengalaman", bukan cuma cocokkan nama skill.

**Dependency:** Bergantung pada §6.7 untuk kualitas data input; filter 60% berdiri sendiri, bisa dikerjakan duluan.

## 6.9 Homepage: Tampilkan Job Terbaru

**Kebutuhan:** Homepage saat ini terasa seperti company profile — tambahkan job listing terbaru langsung di homepage supaya terasa seperti job portal.

**Status saat ini:** Belum diverifikasi isi `src/app/page.tsx` (landing page utama) secara langsung — berdasarkan pola halaman lain yang sudah dilihat (`/global`), kemungkinan besar isinya value proposition \+ CTA \+ fitur, tanpa data job real-time.

**Rencana teknis:** Tambahkan section "Job Terbaru" di homepage yang fetch dari `GET /api/jobs` (endpoint publik yang sudah ada, dipakai di `/jobs`) — tampilkan 4-6 job teraktif dengan CTA ke listing lengkap.

## 6.10 Talent Bisa Buat Gig \+ Rekomendasi Harga AI

**Kebutuhan:** Talent bisa membuat gig untuk menawarkan pekerjaan/skill mereka duluan (bukan menunggu di-match), dengan harga bisa manual atau rekomendasi AI.

**Status saat ini:** Ini **sama persis dengan "Gig Mode Phase 2"** yang sudah didefinisikan lengkap di Patch PRD v2.0 §4 (skema `gigs`/`gig_orders`, 5 open question yang belum diputuskan tim, roadmap bulan 2-4 pasca-hackathon). Belum ada satu pun kode untuk ini di master.

**Rekomendasi:** Jangan mulai coding sebelum 5 open question di Patch v2.0 §4.2 diputuskan tim (shared users table atau tidak, AI matching vs pure browse, escrow untuk nilai kecil, verifikasi identitas, platform fee). Untuk rekomendasi harga AI, bisa reuse `GET /api/ai/smart-pricing` yang sudah ada — tinggal expose ke form create-gig.

## 6.11 Breadcrumb SEO-Friendly

**Kebutuhan:** Breadcrumb navigation untuk halaman yang relevan, demi SEO.

**Rencana teknis:** Komponen `<Breadcrumb>` \+ JSON-LD `BreadcrumbList` schema.org, dipasang di halaman publik yang punya hierarki jelas: `/jobs/[id]`, `/talents/[id]`, `/fitur/*`, `/blog/*`, `/perusahaan/*`. Tidak relevan untuk halaman dashboard (tidak diindex search engine).

**Prioritas:** Rendah — tidak berpengaruh ke demo/pitch, murni SEO jangka panjang pasca-hackathon.

## 6.12 Sidebar Navigation — Dashboard Talent & Client (Menu \+ Settings/Profile) — SPEK FINAL

**Kebutuhan:** Dashboard talent maupun client menggunakan sidebar untuk menu utama dan settings/profile, konsisten satu sama lain. **Keputusan final (9 Juli 2026):** adopsi **struktur/layout** dari referensi desain yang dibagikan Satria (screenshot Client Dashboard), tapi **warna & bahasa visual pakai sistem yang sudah ada di produk** — bukan tiru warna referensi mentah-mentah.

**Referensi desain yang diterima:** Screenshot "Client Dashboard" — sidebar icon kiri (navy gelap, \~64px, 6 icon tanpa label \+ logo di atas), header halaman ("CLIENT PORTAL" \+ nama & perusahaan client \+ bell notif \+ tombol "+ Post Job Baru"), 4 stat card berjajar dengan delta kecil (Job Aktif, Talenta Cocok, Dalam Escrow, Proyek Selesai), lalu 2 kolom konten: **"Job Postingan Aktif"** (list card job dengan badge status seperti "Matched"/"In Progress", avatar overlap talenta cocok, % top match) dan **"AI Matched Talent"** (list ranked, avatar \+ nama \+ role \+ % match berwarna).

**Kenapa strukturnya diadopsi, tapi warnanya tidak:**

- Struktur (sidebar persisten \+ stat row \+ 2 kolom job list & ranked AI match) adalah **upgrade layout nyata** dibanding kondisi sekarang (§6.6: 3 top-nav berbeda, tidak ada sidebar sama sekali).  
- Warna referensi (navy solid \+ krem/beige) **beda total** dari bahasa visual produk saat ini (semua halaman pakai `surface-*` terang \+ `gradient-primary`) — kalau ditiru mentah, dashboard jadi kelihatan seperti produk lain dari landing page & halaman publik. Reskin ke token existing menjaga satu identitas visual di seluruh produk.  
- Icon-only tanpa label (seperti di referensi) dihindari — item \#6.6 sudah mencatat keluhan navigasi "tidak konsisten pas diklik"; label teks di sebelah icon mengurangi ambiguitas, terutama untuk persona client (Budi, pemilik UKM — bukan digital-native) yang butuh menu jelas, bukan nebak ikon.

**Struktur final (layout dari referensi \+ style dari sistem existing):**

| Bagian | Dari Referensi (struktur) | Diterapkan Dengan (style existing) |
| :---- | :---- | :---- |
| Sidebar kiri | Persisten, logo di atas, list menu vertikal, 1 item settings di bawah | Background `surface-white`/`surface-50` (bukan navy solid) dengan border kanan tipis `border-surface-200`; item aktif pakai `gradient-primary` sebagai pill/background highlight (pola yang sama dipakai di `pill-tab-active` sekarang) |
| Item menu | Icon \+ (di referensi: tanpa label) | Icon dari `@/components/icons` **\+ label teks** di sebelahnya (bukan icon-only) — collapse ke icon-only opsional cuma di breakpoint sempit/tablet |
| Header halaman | "CLIENT PORTAL" label kecil \+ nama user & perusahaan, bell notif, CTA primer di kanan | Sama persis strukturnya; CTA pakai `btn-primary` existing, `NotificationBell` (§6.3) tetap dipakai apa adanya di posisi ini |
| Stat card row | 4 card sejajar dengan angka besar \+ delta kecil hijau/merah | Pakai pola `card card-hover p-5` yang sudah dipakai di dashboard sekarang (lihat Quick Stats di `talent/dashboard` & `client/dashboard` existing) — cuma ditata ulang biar sejajar dengan style referensi |
| Kolom kiri: Job List | Card per job, badge status, avatar overlap talenta cocok, % top match | Reuse data & badge status yang sudah ada (`status-${job.status}` class sudah dipakai di client dashboard) — ditata ulang jadi card list sesuai referensi |
| Kolom kanan: AI Matched Talent | List ranked, avatar \+ nama \+ role \+ % match warna | Reuse data `top_matches` yang sudah di-fetch client dashboard sekarang — cuma presentasinya diubah jadi ranked-list terpisah, bukan collapsed di dalam job card |

**Rencana teknis:**

- Satu komponen `DashboardSidebar` (role-aware, prop `role: "talent" | "client"`), dipakai via shared layout `src/app/talent/layout.tsx` dan `src/app/client/layout.tsx` (perlu dicek apakah layout file ini sudah ada — belum ditarik dari repo).  
- Isi menu talent: Dashboard, Find Work (`/jobs`), Pendapatan (`/talent/earnings`), Aktivitas (`/talent/activity`), Settings di bawah — dipindah dari pill-tab top-nav yang ada sekarang.  
- Isi menu client: Dashboard, Cari Talenta (`/talents`), Disputes (`/client/disputes`), Post Job, Settings di bawah — dipindah dari pill-tab top-nav client yang ada sekarang.  
- Bagian bawah sidebar: avatar \+ nama user, link Settings/Profile, tombol logout.  
- Token visual: `gradient-primary`, palet `surface-*`, radius `rounded-xl`/`rounded-2xl`, komponen `Icon` — semua sudah ada di codebase, tidak perlu token warna baru.  
- Struktur dashboard (stat row \+ 2 kolom) diterapkan ke **kedua** dashboard (talent & client), bukan cuma client — talent dashboard dapat versi sepadan: stat row existing \+ kolom "Job Untukmu" & panel AI insight (skill gap/portfolio) yang sudah ada, ditata ulang mengikuti pola yang sama.

**Dependency & risiko:** Perubahan ini menyentuh banyak halaman sekaligus (semua route di bawah `/talent/*` dan `/client/*`) — risikonya lebih tinggi dari item lain di §6. **Wajib dikerjakan di branch terpisah** (`feat/dashboard-sidebar`) dan di-review visual oleh Satria/Rahmat sebelum merge ke `master`, bukan langsung diterapkan.

## 6.13 Bug: Redirect Payment Masih "Pending" Walau Sudah Disimulasikan

**Kebutuhan Satria:** perlu ada route redirect untuk hasil payment yang sukses — saat ini walau pembayaran sudah disimulasikan (kemungkinan besar via Xenith sandbox), status di aplikasi tetap "pending".

**Root cause ditemukan (bukan dugaan — sudah ditelusuri sampai ke kode):**

1. `POST /api/escrow/hold` (`src/app/api/escrow/hold/route.ts`) membuat `Payment` dengan `status: "PENDING"`, lalu set `redirectUrl` Xenith ke `/client/escrow/{job_id}` — ini murni **redirect browser**, tidak membawa status pembayaran apa pun di URL.  
2. Update status sebenarnya **cuma bergantung ke satu jalur**: webhook async `POST /api/webhooks/xenith/payin` (`src/app/api/webhooks/xenith/payin/route.ts`). Kalau webhook ini tidak sampai — karena URL callback tidak reachable dari server Xenith (misal masih localhost/VPS belum expose, atau webhook belum didaftarkan di dashboard Xenith), atau signature verification gagal — DB **tidak akan pernah ter-update**, walau di sisi Xenith pembayaran sudah "SUCCESS".  
3. Halaman `src/app/client/escrow/[jobId]/page.tsx` cuma baca status dari DB (server component) dan redirect ke dashboard **hanya kalau** `escrow.status !== "pending"`. Kalau DB masih pending, halaman ini akan terus-menerus menampilkan instruksi pembayaran yang sama.  
4. Tombol **"Saya Sudah Bayar — Cek Status"** di `escrow-client.tsx` (`handleCheckStatus`) **cuma memanggil `router.refresh()`** — ini cuma re-render ulang data yang SUDAH ADA di DB, bukan menanyakan status terbaru ke Xenith. Kalau webhook belum/tidak pernah masuk, tombol ini secara efektif **tidak melakukan apa-apa** selain re-fetch data lama. Ini persis yang dilaporkan: "sudah disimulasiin payment \[di sisi Xenith\], tapi status masih pending \[di aplikasi\]".

**Kesimpulan:** Tidak ada satu pun jalur di kode saat ini yang secara aktif menanyakan status pembayaran ke Xenith. Sistem murni pasif menunggu webhook — kalau webhook gagal terkirim/terverifikasi (sangat mungkin di lingkungan testing/sandbox/demo yang jaringannya belum tentu reachable dari luar), status akan macet di "pending" selamanya, tanpa cara recovery dari sisi user maupun sistem.

**Rencana teknis yang diusulkan:**

| \# | Perubahan | File Target |
| :---- | :---- | :---- |
| 1 | Tambah fungsi `getPayInStatus(xenithPayinId)` — panggil endpoint status Xenith (perlu konfirmasi Akbar path pastinya, kemungkinan `GET /v1/payins/{id}` mengikuti pola `GET /v1/payins/channels` yang sudah dipakai) | `src/services/xenith.ts` |
| 2 | Route baru: `POST /api/escrow/[jobId]/reconcile` — auth client-owner, ambil `Payment` terkait, kalau masih `PENDING` maka panggil `getPayInStatus`, lalu jalankan **logika update yang sama persis** dengan webhook handler (set `SUCCESS`→escrow `held`\+job `in_progress`\+notifikasi, atau `FAILED`/`EXPIRED` sesuai kondisi) — supaya tidak ada dua sumber logika berbeda yang bisa divergen | `src/app/api/escrow/[jobId]/reconcile/route.ts` (baru) |
| 3 | Ganti `handleCheckStatus` di `escrow-client.tsx` — dari `router.refresh()` polos menjadi: panggil route reconcile di atas dulu, baru `router.refresh()` setelah dapat response | `src/app/client/escrow/[jobId]/escrow-client.tsx` |
| 4 | (Opsional, robust) Tambah polling ringan (misal tiap 5 detik, maks 12x) otomatis di halaman ini selama status masih pending, supaya user tidak harus klik manual berkali-kali | sama seperti \#3 |

**Status: ✅ SELESAI — patch kode sudah dibuat** (9 Juli 2026, atas permintaan prioritas Satria). File yang diubah/ditambah:

- `src/services/xenith.ts` — tambah `getPayInStatus()`.  
- `src/lib/payment-reconciliation.ts` — **baru**, isi logika update DB yang dipakai bareng webhook & reconcile (supaya tidak divergen, sesuai poin risiko di atas). **Catatan penting:** logika cross-border origin (baca `ClientProfile.country`, tulis `Payment.originCountry`/`originCurrency`) yang ada di webhook ASLI sekarang **dihapus**, bukan cuma dibiarkan — mengikuti keputusan park Cross-Border di §3.3 sekaligus menghindari bug laten field schema yang belum ada (CRIT-002, kini juga tidak relevan).  
- `src/app/api/webhooks/xenith/payin/route.ts` — refactor, verifikasi signature/timestamp **tidak diubah**, logika update DB dipindah ke `payment-reconciliation.ts`.  
- `src/app/api/escrow/[jobId]/reconcile/route.ts` — **baru**, dipanggil dari tombol cek status.  
- `src/app/client/escrow/[jobId]/escrow-client.tsx` — tombol "Cek Status" sekarang benar-benar memanggil route reconcile dulu sebelum refresh (sebelumnya cuma `router.refresh()`).  
- `src/app/client/escrow/[jobId]/page.tsx` — teruskan `jobId` ke komponen `PaymentInstructions`.

**Verifikasi ke `docs.xenithpay.com` (9 Juli 2026\) — apa yang SUDAH terkonfirmasi:**

- Status Pay In di Xenith: **Pending / Success / Failed / Expired / Refunded**. Kode kita pakai `PENDING`/`SUCCESS`/`FAILED`/`EXPIRED` (mengikuti enum `PaymentStatus` yang sudah ada) — **`REFUNDED` belum ada di enum kita**, gap kecil, catat sebagai follow-up terpisah (bukan blocking, escrow refund saat ini ditangani lewat flow dispute/admin resolve, bukan lewat status Payment).  
- `createPayIn` mengirim `callbackUrl` **per-request** (sudah benar di kode kita) — ini jalur webhook yang relevan untuk payin kita. Dokumen "Webhook" yang terpisah di Settings → Developer Settings ternyata untuk kategori event lain (maintenance, dsb), **bukan** untuk notifikasi per-transaksi payin. Artinya kemungkinan besar root cause status macet bukan "webhook belum didaftarkan", **melainkan `APP_URL`/`NEXT_PUBLIC_APP_URL` tidak reachable dari server Xenith** (misal masih localhost, atau VPS belum expose ke publik saat testing) — **ini yang harus Akbar cek duluan**, lebih prioritas dari path `getPayInStatus`.

**Yang MASIH jadi asumsi, WAJIB Akbar konfirmasi sebelum merge:**

- Path exact `GET /v1/payins/:id` di `getPayInStatus()` **belum ketemu** di dokumentasi — halaman "Create Pay In" cuma menyebut nama "Get Payin List API" tanpa link slug yang bisa ditarik dari sesi ini (reference API docs Xenith di-render client-side). Cek langsung di `docs.xenithpay.com/reference` (bagian Pay Ins) atau tanya support Xenith untuk path & response shape pasti.  
- Response shape `data.status` di `getPayInStatus()` juga masih asumsi mengikuti pola webhook payload — sesuaikan kalau ternyata beda.

---

# 7\. Assumptions & Hal yang Perlu Dikonfirmasi Tim

- **Assumption:** Semua path file di atas mengikuti struktur `src/app/api/...` standar Next.js App Router seperti disebut README. Kalau Akbar pakai struktur beda (misal route group), beberapa "404" saya bisa jadi false positive.  
- **Assumption:** `prisma db push` dipakai (bukan `prisma migrate`) — tidak ada folder migrations untuk cross-check, jadi `schema.prisma` di master adalah satu-satunya sumber kebenaran skema saat ini.  
- **Perlu dikonfirmasi Akbar:** apakah CRIT-001 memang bug nyata, atau ada commit lebih baru yang belum ke-reflect di `raw.githubusercontent.com` (cache CDN GitHub kadang delay beberapa menit).  
- **~~Perlu keputusan Satria+tim:~~** ~~apakah cross-border Malaysia tetap dilanjutkan...~~ **SUDAH DIPUTUSKAN 9 Juli 2026: ditahan, kemungkinan tidak diaktifkan sama sekali.** Lihat §3.3.

---

*Nyamby — PRD Addendum v5.2 | Disusun oleh Satria Romanda (CPO) berdasarkan audit langsung codebase \+ permintaan fitur produk | 9 Juli 2026 | Confidential — Internal Document*  
