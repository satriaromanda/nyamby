# NYAMBY
## Product Requirements Document
### PRD v3.0 — Missing Features, Portfolio Analyzer AI & Admin Dashboard

| Versi | 3.0 — Missing Features & Admin |
|-------|-------------------------------|
| Status | AKTIF — Sprint Backlog |
| Author | Satria Romanda (CPO) |
| Engineer | Akbar Lubis (CTO) |
| Tanggal | Juni 2026 |
| Base Ref | Concept v2.0 + PRD v2.0 + GitHub master |
| Scope | 6 fitur missing + Portfolio AI + Admin Dashboard |

---

## 1. Overview & Konteks

Dokumen ini adalah PRD ketiga dalam seri Nyamby, disusun setelah cross-check menyeluruh antara Nyamby Concept v2.0 dan codebase aktual (master branch, Juni 2026). Tujuannya adalah mendefinisikan secara teknis semua fitur yang disebutkan di Concept v2.0 namun belum terimplementasi, sehingga sprint berikutnya dapat langsung dieksekusi oleh tim engineering.

| Fitur / Komponen | Status Saat Ini | Endpoint / Referensi |
|-----------------|----------------|---------------------|
| `POST /api/disputes` | ❌ 404 — Missing | Schema ada, admin resolve ada — user endpoint belum |
| Rating & Review System | ❌ 404 — Missing | Tidak ada tabel `talent_ratings` di schema |
| AI Feedback Stats | ❌ 404 — Missing | Data `rejection_reason` ada di DB, belum diekspose |
| Auto-release Dana 5 Hari | ❌ Missing | Tidak ada cron job / scheduled task sama sekali |
| Smart Pricing Guidance | ❌ 404 — Missing | Tidak ada logika pricing recommendation |
| Portfolio Analyzer AI | ⚠️ Parsial | `extractPortfolioContext` ada, tapi endpoint AI analyzer belum |
| Admin Dashboard | ⚠️ Parsial | Hanya admin dispute resolve — tidak ada user mgmt, monitoring |
| Bank account di Talent Onboarding | ⚠️ Perlu verifikasi | Field ada di schema, belum terkonfirmasi di UI form |

> **Catatan Arsitektur — Admin Dashboard:**
> - **Rekomendasi:** Satu repo (`github.com/satriaromanda/nyamby`), dikembangkan di branch `feat/admin-dashboard`
> - **Alasan:** Admin berbagi schema Prisma, `auth.ts` (`requireAdmin` sudah ada), dan semua service yang sama — tidak ada alasan split repo
> - **Deployment:** Deploy dari branch yang sama ke subdomain `admin.nyamby.id` menggunakan Vercel preview atau environment terpisah
> - **Merge ke master** setelah stabil dan telah melalui review CTO — jangan merge sebelum semua endpoint admin ter-test
> - **Branch protection:** Set rule di GitHub agar `feat/admin-dashboard` hanya bisa merge via Pull Request dengan approval

---

## 2. Endpoint: POST /api/disputes

### 2.1 Overview

Endpoint ini memungkinkan talenta atau client untuk membuka tiket dispute secara mandiri dari UI. Saat ini schema `DisputeTicket` sudah ada dan admin resolve sudah berfungsi, namun tidak ada cara bagi user untuk trigger dispute — menjadikan seluruh sistem dispute tidak dapat digunakan dari sisi pengguna.

### 2.2 Spesifikasi Endpoint

| Atribut | Detail |
|---------|--------|
| Method | `POST` |
| Path | `/api/disputes` |
| Auth | `requireAuth()` — talent atau client, keduanya bisa membuka dispute |
| Trigger | User klik tombol "Ajukan Dispute" di halaman detail job |
| Pre-condition | Job status harus `in_progress` atau `submitted_for_review`. Escrow status harus `held`. Belum ada `DisputeTicket` aktif untuk job yang sama. |

**Request Body:**
```json
{
  "job_id": "uuid",
  "reason": "ghosting",
  // enum DisputeReason:
  // ghosting | rejected_work | low_quality | cancellation | talent_resign
  "description": "string (min 20 char)"
}
```

**Response — Success (201):**
```json
{
  "success": true,
  "message": "Dispute berhasil diajukan. Admin akan meninjau dalam 48 jam.",
  "data": {
    "dispute_id": "uuid",
    "job_id": "uuid",
    "reason": "ghosting",
    "status": "open",
    "created_at": "ISO timestamp"
  }
}
```

### 2.3 Logika Bisnis

| # | Validasi | Detail |
|---|---------|--------|
| 1 | Job ownership | Pastikan `session.userId` adalah client atau talent yang terlibat di job ini |
| 2 | Job status check | `job.status` harus `in_progress` atau `submitted_for_review` |
| 3 | Escrow check | `escrow.status` harus `held` |
| 4 | Duplicate check | Cek tidak ada `DisputeTicket` dengan `jobId` yang sama dan status `open` atau `investigating` |
| 5 | Job status update | Setelah dispute dibuat, update `job.status` menjadi `disputed` |
| 6 | Notifikasi | Kirim notifikasi ke pihak lawan + notify admin |

### 2.4 Endpoint Tambahan: GET /api/disputes/my

| Atribut | Detail |
|---------|--------|
| Method | `GET` |
| Path | `/api/disputes/my` |
| Auth | `requireAuth()` |
| Response | List `DisputeTicket` di mana user adalah initiator atau pihak yang terlibat di job-nya |

---

## 3. Rating & Review System

### 3.1 Overview

Concept v2.0 §5.2 dan §6.2 menyebutkan rating sebagai komponen wajib setelah setiap job selesai. Saat ini tidak ada tabel ratings di schema Prisma dan tidak ada endpoint yang menghandle fitur ini.

### 3.2 Schema Prisma Baru — `talent_ratings`

```prisma
model TalentRating {
  id              String   @id @default(uuid())
  jobId           String   @unique @map("job_id")
  talentProfileId String   @map("talent_profile_id")
  clientUserId    String   @map("client_user_id")
  score           Int      // 1–5 bintang
  comment         String?  // opsional, maks 500 char
  createdAt       DateTime @default(now()) @map("created_at")

  job           Job           @relation(fields: [jobId], references: [id])
  talentProfile TalentProfile @relation(fields: [talentProfileId], references: [id])
  client        User          @relation(fields: [clientUserId], references: [id])

  @@map("talent_ratings")
}
```

**Tambahkan relasi di model yang sudah ada:**
```prisma
// Di dalam model TalentProfile:
ratings TalentRating[]

// Di dalam model Job:
talentRating TalentRating?

// Di dalam model User (untuk client):
givenRatings TalentRating[] @relation("ClientRatings")
```

### 3.3 Endpoint: POST /api/ratings

| Atribut | Detail |
|---------|--------|
| Method | `POST` |
| Auth | `requireAuth()` — role harus `client` |
| Trigger | Muncul setelah `job.status === completed`, satu kali per job |
| Pre-condition | `job.status` harus `completed` dan `jobId` belum punya `TalentRating` |

**Request Body:**
```json
{
  "job_id": "uuid",
  "score": 5,
  "comment": "string (opsional, maks 500 karakter)"
}
```

**Logika Bisnis:**

| # | Validasi | Detail |
|---|---------|--------|
| 1 | Job ownership | `session.userId` harus `job.clientUserId` |
| 2 | Job status | `job.status` harus `completed` |
| 3 | Idempotency | Cek tidak ada `TalentRating` dengan `jobId` yang sama |
| 4 | Score validation | `score` harus integer antara 1–5 |
| 5 | Notifikasi | Kirim notifikasi ke talenta: "Kamu mendapat rating X bintang dari [client]" |

### 3.4 Endpoint: GET /api/talent/profile/:id/ratings

```json
{
  "success": true,
  "data": {
    "average_score": 4.7,
    "total_ratings": 12,
    "ratings": [
      {
        "score": 5,
        "comment": "Kerja cepat dan komunikatif",
        "client_name": "Budi S.",
        "job_title": "Landing Page UKM",
        "created_at": "2026-06-01"
      }
    ]
  }
}
```

> Tambahkan `average_score` dan `total_ratings` ke response `GET /api/talent/profile/:id` yang sudah ada, agar tampil di profil publik tanpa request tambahan.

---

## 4. AI Feedback Stats — Competitive Moat Dashboard

### 4.1 Overview

Data `rejection_reason` sudah tersimpan di tabel `job_matches` sejak awal. Endpoint ini mengekspose data tersebut sebagai analytics yang dapat ditampilkan ke admin dan digunakan untuk menyempurnakan prompt AI secara berkala. Ini adalah **"bukti hidup"** dari competitive moat Nyamby yang wajib bisa ditunjukkan kepada juri.

### 4.2 Endpoint: GET /api/ai/feedback-stats

| Atribut | Detail |
|---------|--------|
| Method | `GET` |
| Path | `/api/ai/feedback-stats` |
| Auth | `requireAdmin()` |
| Query Params | `?category=web_dev&period=30d` (opsional) |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "total_matches_generated": 234,
    "total_accepted": 89,
    "total_rejected": 145,
    "acceptance_rate": 38.0,
    "top_rejection_reasons": [
      { "reason": "rate_too_high", "count": 45, "percentage": 31.0 },
      { "reason": "skill_gap", "count": 38, "percentage": 26.0 },
      { "reason": "availability", "count": 22, "percentage": 15.0 }
    ],
    "acceptance_by_recommendation": {
      "highly_recommended": { "accepted": 72, "total": 89, "rate": 80.9 },
      "recommended":        { "accepted": 15, "total": 98, "rate": 15.3 },
      "not_recommended":    { "accepted": 2,  "total": 47, "rate": 4.3  }
    },
    "top_accepted_skill_combos": [
      { "skills": ["React", "TypeScript", "Tailwind"], "acceptance_rate": 85.0 }
    ],
    "avg_match_score_accepted": 78.4,
    "avg_match_score_rejected": 61.2
  }
}
```

### 4.3 Implementasi — Query DB

Tidak memerlukan AI call — murni agregasi Prisma:

```typescript
// Acceptance rate by recommendation level
const stats = await prisma.jobMatch.groupBy({
  by: ['recommendation', 'status'],
  _count: { id: true },
  where: {
    generatedAt: { gte: startDate },
    ...(category ? { talentProfile: { category } } : {})
  }
});

// Top rejection reasons
const rejections = await prisma.jobMatch.groupBy({
  by: ['rejectionReason'],
  _count: { id: true },
  where: { status: 'rejected', rejectionReason: { not: null } },
  orderBy: { _count: { id: 'desc' } },
  take: 10
});
```

---

## 5. Auto-Release Dana — 5 Hari Kerja

### 5.1 Overview

Concept v2.0 §5.2 menyebutkan: _"Client tidak merespons 5 hari kerja → dana auto-release ke talenta. Platform eksekusi otomatis."_ Saat ini tidak ada mekanisme ini — release hanya bisa dilakukan manual oleh client.

### 5.2 Arsitektur yang Direkomendasikan

| Opsi | Detail |
|------|--------|
| **Opsi A — Vercel Cron (Recommended)** | Gunakan Vercel Cron Jobs (Next.js + Vercel). Buat route `GET /api/cron/auto-release`. Schedule: `'0 1 * * *'` (jam 08.00 WIB setiap hari) |
| Opsi B — External Cron | Layanan cron eksternal (cron-job.org gratis) yang hit endpoint setiap hari |
| Opsi C — On-demand Check | Cek saat user buka dashboard. Lebih sederhana tapi tidak reliable |

### 5.3 Endpoint: GET /api/cron/auto-release

| Atribut | Detail |
|---------|--------|
| Method | `GET` |
| Auth | Header: `Authorization: Bearer {CRON_SECRET}` |
| Schedule | `'0 1 * * *'` UTC = 08.00 WIB |
| Logika | Cari semua job `submitted_for_review` di mana `submittedAt > 5 hari kerja` dan `escrow.status === held` |

```typescript
// Hitung 5 hari kerja (skip Sabtu-Minggu)
function addBusinessDays(date: Date, days: number): Date {
  let count = 0;
  const result = new Date(date);
  while (count < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return result;
}

const overdueJobs = await prisma.job.findMany({
  where: {
    status: 'submitted_for_review',
    submittedAt: { lte: fiveBusinessDaysAgo }
  },
  include: {
    escrowTransaction: {
      where: { status: 'held' },
      include: { talent: { include: { talentProfile: true } } }
    }
  }
});

// Untuk setiap job: trigger createPayOut ke Xenith
// Update job.status = 'completed'
// Notifikasi kedua pihak
```

### 5.4 Vercel Cron Configuration

```json
// vercel.json — tambahkan di root project
{
  "crons": [
    {
      "path": "/api/cron/auto-release",
      "schedule": "0 1 * * *"
    }
  ]
}
```

```bash
# .env — tambahkan:
CRON_SECRET=random-string-minimal-32-karakter
```

---

## 6. Smart Pricing Guidance

### 6.1 Overview

Concept v2.0 §4.2: _"Rekomendasi rate berbasis skill level, tipe proyek, dan benchmark pasar. Mencegah underpricing talenta Indonesia."_ Implementasi tidak memerlukan AI call — cukup agregasi data dari talenta yang sudah ada.

### 6.2 Endpoint: GET /api/ai/smart-pricing

| Atribut | Detail |
|---------|--------|
| Method | `GET` |
| Path | `/api/ai/smart-pricing` |
| Auth | `requireAuth()` — tersedia untuk talent dan client |
| Query Params | `?category=web_dev&skills=React,TypeScript&level=intermediate` |

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "web_dev",
    "skill_match": ["React", "TypeScript"],
    "level": "intermediate",
    "benchmark": {
      "per_hour": {
        "min": 75000,
        "median": 125000,
        "max": 250000,
        "currency": "IDR"
      },
      "per_project": {
        "min": 1500000,
        "median": 3500000,
        "max": 8000000,
        "currency": "IDR"
      }
    },
    "sample_size": 23,
    "recommendation": "Berdasarkan 23 talenta aktif dengan skill serupa, rate pasar saat ini Rp 100.000–175.000/jam.",
    "market_insight": "TypeScript meningkatkan rate rata-rata 28% dibanding JavaScript only di kategori ini."
  }
}
```

```typescript
// Prisma query:
const benchmark = await prisma.talentProfile.aggregate({
  _min: { ratePerHour: true },
  _avg: { ratePerHour: true },
  _max: { ratePerHour: true },
  where: {
    category: category as TalentCategory,
    ratePerHour: { not: null },
    availability: { not: 'unavailable' },
    talentSkills: {
      some: { skill: { name: { in: skills } } }
    }
  }
});

// Jika sample_size < 5, fallback ke benchmark kategori saja
```

---

## 7. Portfolio Analyzer AI

### 7.1 Overview

Concept v2.0 §4.2 mendeferral fitur ini ke Phase 2. Namun infrastruktur dasar sudah ada: `extractPortfolioContext()` di `enrichment.ts`, field `portfolioContext` di `TalentProfile`, dan `portfolioEvidence` di `JobMatch`. Endpoint AI analyzer yang berdiri sendiri tinggal satu langkah dari selesai.

**Perbedaan dengan Skill Gap Analysis:**
- Skill Gap: menganalisis GAP antara skill saat ini dan kebutuhan pasar
- Portfolio Analyzer: mengevaluasi KUALITAS dan KELENGKAPAN portofolio yang diunggah

### 7.2 Spesifikasi Endpoint

| Atribut | Detail |
|---------|--------|
| Method | `POST` |
| Path | `/api/ai/portfolio-analyzer` |
| Auth | `requireAuth()` — role harus `talent` |
| Trigger | Manual: talent klik "Analisis Portofolioku" di dashboard |
| Input | `portfolio_url`, `portfolio_context`, `cv_text` — minimal satu wajib |
| AI Model | Sama dengan skill gap: `AI_MODEL` env var |

### 7.3 System Prompt

```
Kamu adalah portfolio reviewer profesional untuk platform freelance Indonesia.
Tugasmu adalah mengevaluasi portofolio talenta digital secara konstruktif.

Evaluasi berdasarkan 4 dimensi:
1. KELENGKAPAN — apakah ada deskripsi proyek, konteks, dan hasil akhir?
2. RELEVANSI — apakah proyek relevan dengan kategori dan skill yang diklaim?
3. KEJELASAN — apakah klien awam bisa memahami value dari karya ini?
4. DAYA JUAL — apakah portofolio ini meyakinkan untuk memenangkan proyek?

RESPON HANYA JSON:
{
  "overall_score": 72,
  "dimensions": {
    "completeness":  { "score": 80, "feedback": "..." },
    "relevance":     { "score": 75, "feedback": "..." },
    "clarity":       { "score": 65, "feedback": "..." },
    "marketability": { "score": 68, "feedback": "..." }
  },
  "strengths": ["kelebihan 1", "kelebihan 2"],
  "improvements": [
    {
      "priority": "high",
      "action": "Tambahkan deskripsi problem yang diselesaikan di setiap proyek",
      "impact": "Meningkatkan daya jual portofolio hingga 40%"
    }
  ],
  "summary": "Ringkasan evaluasi dalam 2-3 kalimat"
}
```

### 7.4 Response (201)

```json
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "overall_score": 72,
    "dimensions": { "..." },
    "strengths": ["..."],
    "improvements": ["..."],
    "summary": "string",
    "generated_at": "ISO timestamp"
  }
}
```

### 7.5 Schema Prisma Baru — `portfolio_analyses`

```prisma
model PortfolioAnalysis {
  id              String   @id @default(uuid())
  talentProfileId String   @map("talent_profile_id")
  overallScore    Int      @map("overall_score")
  dimensions      Json     @db.JsonB
  strengths       Json     @db.JsonB
  improvements    Json     @db.JsonB
  summary         String
  isLatest        Boolean  @default(true) @map("is_latest")
  generatedAt     DateTime @default(now()) @map("generated_at")

  talentProfile TalentProfile @relation(fields: [talentProfileId], references: [id], onDelete: Cascade)

  @@map("portfolio_analyses")
}
```

> **Integrasi dengan Skill Gap:**
> - Setelah Portfolio Analyzer berjalan, gunakan `overall_score` untuk update `profileCompletenessScore` di `SkillGapAnalysis`
> - Jika `portfolio_context` berubah (talenta upload portfolio baru), trigger ulang Portfolio Analyzer secara background
> - Tampilkan `overall_score` di profil publik talenta sebagai "Portfolio Score"

---

## 8. Admin Dashboard

### 8.1 Setup Branch

```bash
git checkout master
git pull origin master
git checkout -b feat/admin-dashboard
# semua pekerjaan admin dikerjakan di branch ini
# merge ke master via Pull Request setelah stabil
```

**Struktur folder:**
```
src/app/
├── admin/              ← root semua halaman admin (feat/admin-dashboard)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── users/
│   │   └── page.tsx
│   ├── disputes/
│   │   └── page.tsx
│   ├── escrow/
│   │   └── page.tsx
│   └── ai-stats/
│       └── page.tsx
└── api/
    └── admin/
        ├── users/route.ts          ← baru
        ├── users/[id]/status/      ← baru
        ├── jobs/route.ts           ← baru
        ├── stats/route.ts          ← baru
        ├── escrow/route.ts         ← baru
        ├── disputes/route.ts       ← sudah ada ✅
        └── disputes/resolve/       ← sudah ada ✅
```

### 8.2 Status Endpoint Admin

| # | Endpoint | Status | Deskripsi |
|---|---------|--------|-----------|
| 1 | `GET /api/admin/disputes` | ✅ Ada | List semua dispute dengan filter status |
| 2 | `POST /api/admin/disputes/resolve` | ✅ Ada | Resolve + trigger Xenith payout split |
| 3 | `GET /api/admin/users` | ❌ Missing | List semua user dengan filter |
| 4 | `PATCH /api/admin/users/:id/status` | ❌ Missing | Suspend / reaktifasi user |
| 5 | `GET /api/admin/jobs` | ❌ Missing | List semua job + status |
| 6 | `GET /api/admin/stats` | ❌ Missing | Platform overview: GMV, user, dispute rate |
| 7 | `GET /api/admin/escrow` | ❌ Missing | List escrow + payment Xenith status |
| 8 | `GET /api/ai/feedback-stats` | ❌ Missing | AI matching accuracy (lihat Section 4) |

### 8.3 Spesifikasi Endpoint Baru

**GET /api/admin/users**
```
Auth: requireAdmin()
Query: ?role=talent|client|admin&status=active|suspended&q=search&page=1
Response: id, email, full_name, role, onboarding_complete, created_at,
          is_suspended, total_jobs, total_completed
```

**PATCH /api/admin/users/:id/status**
```json
// Request:
{
  "status": "suspended" | "active",
  "reason": "string"  // wajib jika suspend
}
```
Logika: set `isSuspended` di tabel `users` (tambah kolom baru), middleware cek flag ini saat login, kirim notifikasi ke user.

**GET /api/admin/stats**
```json
{
  "success": true,
  "data": {
    "users": {
      "total_talent": 47,
      "total_client": 23,
      "new_this_week": 8
    },
    "jobs": {
      "total_active": 12,
      "total_completed": 34,
      "completion_rate": 72.3
    },
    "financials": {
      "total_gmv_idr": 45000000,
      "total_platform_fee_idr": 4500000,
      "escrow_held_idr": 8500000
    },
    "ai": {
      "total_matches_generated": 234,
      "overall_acceptance_rate": 38.0,
      "avg_match_score": 71.4
    },
    "disputes": {
      "total_open": 2,
      "total_resolved": 5,
      "dispute_rate": 4.7
    }
  }
}
```

---

## 9. Deliverable Submission — Penyempurnaan

### 9.1 Penyempurnaan PATCH /api/jobs/:id/status

Tambahkan `submission_url` dan `submission_notes` ke body request saat status `submitted_for_review`:

```typescript
// Request body tambahan:
{
  "status": "submitted_for_review",
  "submission_url": "https://...",   // link ke file/folder hasil kerja
  "submission_notes": "string"       // catatan dari talenta ke client
}

// Update Prisma:
await prisma.job.update({
  where: { id },
  data: {
    status: 'submitted_for_review',
    submissionUrl: submission_url || null,
    submissionNotes: submission_notes || null,
    submittedAt: new Date(),  // ← penting untuk auto-release timer
  }
});
```

### 9.2 Bank Account di Onboarding Talenta

Verifikasi bahwa form onboarding talenta di UI sudah include field berikut:

| Field | Sifat | Keterangan |
|-------|-------|-----------|
| `bank_code` | Wajib untuk release | Kode bank: BCA, BNI, MANDIRI, BRI, GOPAY, OVO |
| `bank_account` | Wajib untuk release | Nomor rekening atau nomor HP e-wallet |
| `bank_account_name` | Opsional | Nama pemilik rekening untuk verifikasi Xenith |

> Jika talenta belum mengisi bank_account, tampilkan banner peringatan di dashboard: _"Lengkapi data rekening kamu untuk bisa menerima pembayaran."_

---

## 10. Roadmap Implementasi

### 10.1 Sprint Plan — 2 Minggu

| Sprint | Fokus | Item yang Dikerjakan |
|--------|-------|---------------------|
| **Sprint 1, Hari 1–3** | Critical path | Bank account di onboarding form · `POST /api/disputes` · `submittedAt` di job update |
| **Sprint 1, Hari 4–7** | Core missing | Rating system (schema + endpoints) · `GET /api/ai/feedback-stats` |
| **Sprint 2, Hari 1–4** | AI features | Portfolio Analyzer AI · Smart Pricing |
| **Sprint 2, Hari 5–7** | Admin & infra | Branch `feat/admin-dashboard` · Admin endpoints · Auto-release cron |

### 10.2 Dependency Map

> ⚠️ Urutan pengerjaan yang harus diikuti:

1. **Bank account field di form** *(BLOCKING)* → tanpa ini, escrow release tidak bisa ditest
2. **`submittedAt` field di job update** *(BLOCKING)* → tanpa ini, auto-release cron tidak bisa hitung 5 hari
3. **`POST /api/disputes`** *(independent)* → bisa dikerjakan paralel dengan item 1–2
4. **Rating system** *(SETELAH job flow complete)* → butuh `job.status === completed` untuk trigger
5. **`GET /api/ai/feedback-stats`** *(independent)* → hanya query, tidak ada dependency
6. **Portfolio Analyzer** *(SETELAH onboarding flow stable)* → perlu `portfolioContext` tersedia
7. **Smart Pricing** *(independent)* → hanya query agregasi
8. **Admin Dashboard** *(SETELAH semua endpoint utama selesai)* → admin butuh data yang akurat
9. **Auto-release cron** *(SETELAH `submittedAt` + Xenith payout teruji)* → jangan run di production sebelum flow dasar aman

### 10.3 Checklist Testing sebelum Merge ke Master

- [ ] Talent register → onboarding (dengan bank account) → AI skill gap muncul → profil publik dengan slug aktif
- [ ] Client register → post job → AI matching → pilih talent → escrow hold (Xenith VA muncul)
- [ ] Talent submit deliverable (dengan `submission_url`) → `submittedAt` tersimpan
- [ ] Client approve → escrow release → Xenith payout trigger → webhook update status `completed`
- [ ] Client beri rating → notifikasi ke talent → rata-rata muncul di profil publik
- [ ] Talent buka dispute → job status `disputed` → admin list dispute → admin resolve → split payout
- [ ] Portfolio Analyzer: upload portfolio → AI return score → score muncul di profil
- [ ] Smart Pricing: GET dengan kategori + skills → return benchmark yang masuk akal
- [ ] Admin: `GET /stats` mengembalikan angka yang akurat
- [ ] Cron: trigger manual `GET /api/cron/auto-release` → job yang sudah 5 hari auto-complete

---

*Nyamby — PRD v3.0 | Missing Features, Portfolio AI & Admin Dashboard*
*Satria Romanda (CPO) | Juni 2026 | Confidential — Internal Document*
