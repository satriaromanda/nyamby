# NYAMBY
## PRD Technical & Flows v2.0
### Dokumen Pelengkap PRD MVP v1.2

---

| Versi | 2.0 — Technical & Flows |
|---|---|
| Author | Satria Romanda |
| Tanggal | Mei 2026 |
| Status | **DRAFT — Internal** |
| Referensi | PRD MVP v1.2, Nyamby Concept v2.0 |
| Konteks | Digdaya X Hackathon 2026 |

---

> **Tentang dokumen ini:** PRD Technical & Flows v2.0 adalah dokumen pelengkap yang tidak menduplikasi konten PRD MVP v1.2. Fokus dokumen ini adalah flow-flow yang belum terdefinisi secara teknikal — mencakup UX flows, system flows, dan implementation specs yang dibutuhkan builder untuk menyelesaikan platform tanpa ambiguitas.

---

## Daftar Isi

1. [Filter & Search Flow](#1-filter--search-flow)
2. [Session & Auth Guard Flow](#2-session--auth-guard-flow)
3. [Onboarding Client Flow](#3-onboarding-client-flow)
4. [Role-Based Access Control](#4-role-based-access-control-rbac)
5. [CV Upload Pipeline — Teknikal](#5-cv-upload-pipeline--teknikal)
6. [Re-run AI Matching (Manual)](#6-re-run-ai-matching-manual)
7. [Cancel Job Flow](#7-cancel-job-flow)
8. [Loading & Optimistic UI](#8-loading--optimistic-ui)
9. [Seed Data Demo](#9-seed-data-demo)
10. [Error States & Empty States](#10-error-states--empty-states)
11. [Middleware Architecture](#11-middleware-architecture)
12. [Environment & Config Checklist](#12-environment--config-checklist)
13. [API Endpoint Specs Lengkap — Request & Response Schema](#13-api-endpoint-specs-lengkap--request--response-schema)
14. [Pagination — Spesifikasi Lengkap](#14-pagination--spesifikasi-lengkap)
15. [Rate Limiting](#15-rate-limiting)
16. [Prisma Migration Flow](#16-prisma-migration-flow)
17. [File Deletion Flow](#17-file-deletion-flow)
18. [Talent Search by Match](#18-talent-search-by-match-untuk-client)
19. [Ringkasan Seluruh Endpoint — Master List](#19-ringkasan-seluruh-endpoint--master-list)

---

## 1. Filter & Search Flow

### 1.1 Konteks & Scope

Filter dan search berlaku di dua halaman publik utama: **Browse Talenta** (`/talents`) dan **Browse Job Listing** (`/jobs`). Keduanya aksesibel tanpa login. Implementasi menggunakan URL query params agar hasil bisa di-share dan di-bookmark.

### 1.2 Filter Talenta — `/talents`

**Parameter URL yang didukung:**

| Parameter | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `category` | string | `?category=web_dev` | Filter by kategori utama |
| `skill` | string (multi) | `?skill=React&skill=Figma` | Filter by satu atau lebih skill |
| `availability` | string | `?availability=available` | Filter by status ketersediaan |
| `min_rate` | number | `?min_rate=100000` | Rate minimum per jam (IDR) |
| `max_rate` | number | `?max_rate=500000` | Rate maksimum per jam (IDR) |
| `q` | string | `?q=react+developer` | Full-text search pada nama, bio, skill |
| `sort` | string | `?sort=rate_asc` | Urutan: `rate_asc`, `rate_desc`, `newest` |
| `page` | number | `?page=2` | Pagination, default 1 |

**Flow UX:**

| Step | Aktor | Aksi | Output |
|---|---|---|---|
| 1 | User | Buka `/talents` | Tampil semua talenta, default sort: `newest`, 12 per halaman |
| 2 | User | Klik filter "Kategori" → pilih "Web Developer" | URL update: `?category=web_dev`. List refresh tanpa page reload. |
| 3 | User | Tambah filter skill "React" | URL update: `?category=web_dev&skill=React`. List difilter lebih ketat. |
| 4 | User | Ketik di search box | Debounce 400ms → URL update `?q=...` → list refresh |
| 5 | User | Klik "Reset Filter" | URL kembali ke `/talents`. Semua filter cleared. |
| 6 | User | Klik nama talenta di card | Navigate ke `/talents/[id]` |

**Implementasi teknikal:**

```
// app/talents/page.tsx
// Gunakan searchParams dari Next.js App Router
export default async function TalentsPage({ searchParams }) {
  const { category, skill, availability, q, sort, page } = searchParams;
  const talents = await getTalents({ category, skill, availability, q, sort, page });
  return <TalentGrid talents={talents} />;
}

// Query Prisma yang dihasilkan:
// WHERE category = ? AND skills.name IN (?) AND availability = ?
// AND (name ILIKE ? OR bio ILIKE ?)
// ORDER BY created_at DESC
// LIMIT 12 OFFSET (page-1)*12
```

> **Catatan MVP:** Full-text search (`?q=`) cukup menggunakan `ILIKE '%query%'` di PostgreSQL. Tidak perlu Elasticsearch untuk MVP. Debounce 400ms di client-side mencegah terlalu banyak API call saat user mengetik.

---

### 1.3 Filter Job Listing — `/jobs`

**Parameter URL yang didukung:**

| Parameter | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `category` | string | `?category=graphic_designer` | Filter by kategori job |
| `skill` | string (multi) | `?skill=Figma&skill=Illustrator` | Filter by skill yang dibutuhkan |
| `min_budget` | number | `?min_budget=500000` | Budget minimum job (IDR) |
| `max_budget` | number | `?max_budget=5000000` | Budget maksimum job (IDR) |
| `status` | string | `?status=active` | Default: `active`. Bisa `matched`, dll. |
| `q` | string | `?q=landing+page` | Search pada judul dan deskripsi job |
| `sort` | string | `?sort=budget_desc` | Urutan: `budget_desc`, `budget_asc`, `newest`, `deadline_soon` |
| `page` | number | `?page=1` | Pagination |

**Flow UX identik dengan filter talenta.** Perbedaan: chip filter tambahan untuk budget range (slider atau input min/max).

---

### 1.4 Komponen Filter UI — Spesifikasi

| Komponen | Deskripsi | Interaksi |
|---|---|---|
| **Filter bar** | Row horizontal di atas list. Berisi chip filter aktif + tombol "Tambah Filter" | Sticky di top saat scroll |
| **Filter chip** | Menampilkan filter aktif. Klik untuk hapus filter tersebut. | `?category=web_dev` → chip "Web Dev ×" |
| **Dropdown filter** | Muncul saat klik "Tambah Filter". Berisi semua opsi per kategori filter. | Checkbox multi-select untuk skill |
| **Search input** | Input text dengan icon search. Debounce 400ms. | Clear button muncul saat ada isi |
| **Sort dropdown** | Select box di kanan atas. | Langsung trigger re-fetch |
| **Pagination** | Prev / Next button + nomor halaman. | Smooth scroll ke top list saat ganti halaman |
| **Result count** | Teks "Menampilkan 12 dari 47 talenta" | Update real-time saat filter berubah |
| **Empty state** | Ilustrasi + teks saat tidak ada hasil | Dengan CTA "Reset semua filter" |

---

## 2. Session & Auth Guard Flow

### 2.1 Arsitektur Session — NextAuth.js

Nyamby menggunakan **NextAuth.js dengan JWT session** (bukan database session). Token disimpan di HttpOnly cookie, tidak accessible dari JavaScript.

**Data yang disimpan di JWT token:**

```typescript
// types/next-auth.d.ts
interface Session {
  user: {
    id: string;          // UUID dari tabel users
    email: string;
    full_name: string;
    role: 'talent' | 'client';
    avatar_url?: string;
  }
}
```

### 2.2 Flow: Login

| Step | Aktor | Aksi | Output |
|---|---|---|---|
| 1 | User | Buka `/login` | Halaman login dengan form email + password |
| 2 | User | Isi email & password → submit | `POST /api/auth/login` dipanggil |
| 3 | System | Validasi: cari user by email, verifikasi bcrypt hash | — |
| 4a | System (sukses) | Generate JWT token. Set HttpOnly cookie `next-auth.session-token` | Redirect ke `?callbackUrl` atau dashboard sesuai role |
| 4b | System (gagal) | Return error `401` | Toast error: "Email atau password salah" |
| 5 | System | Cek role user dari token | `role === 'talent'` → `/dashboard/talent`. `role === 'client'` → `/dashboard/client` |

### 2.3 Flow: Register

| Step | Aktor | Aksi | Output |
|---|---|---|---|
| 1 | User | Buka `/register` | Halaman register dengan pilihan role |
| 2 | User | Pilih role (Talenta / Client) | UI menyesuaikan — field yang ditampilkan berbeda |
| 3 | User | Isi nama, email, password, konfirmasi password | Client-side validation real-time |
| 4 | User | Submit | `POST /api/auth/register` |
| 5 | System | Cek email unik. Hash password bcrypt (rounds: 12). Insert ke tabel `users`. | — |
| 6a | System (sukses) | Auto-login: generate session token | Redirect ke onboarding sesuai role: `/onboarding/talent` atau `/onboarding/client` |
| 6b | System (email sudah ada) | Return error `409` | Toast: "Email sudah terdaftar. Silakan login." |

### 2.4 Flow: Auth Guard — Middleware

**File:** `middleware.ts` di root Next.js project.

**Logika routing berdasarkan session:**

| Kondisi | Route yang Diakses | Aksi Middleware |
|---|---|---|
| Tidak login | Route publik (`/`, `/talents`, `/jobs`, `/how-it-works`) | Allow — lanjut |
| Tidak login | Route protected (`/dashboard/*`, `/onboarding/*`) | Redirect ke `/login?callbackUrl=[route]` |
| Login sebagai talent | `/dashboard/talent/*` | Allow |
| Login sebagai talent | `/dashboard/client/*` | Redirect ke `/dashboard/talent` |
| Login sebagai client | `/dashboard/client/*` | Allow |
| Login sebagai client | `/dashboard/talent/*` | Redirect ke `/dashboard/client` |
| Login (any role) | `/login` atau `/register` | Redirect ke dashboard sesuai role |
| Login, onboarding belum selesai | Semua route kecuali `/onboarding/*` | Redirect ke `/onboarding/[role]` |

**Implementasi middleware:**

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Cek onboarding status
    if (token && !token.onboardingComplete) {
      if (!path.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL(`/onboarding/${token.role}`, req.url));
      }
    }

    // Role guard
    if (path.startsWith('/dashboard/talent') && token?.role !== 'talent') {
      return NextResponse.redirect(new URL('/dashboard/client', req.url));
    }
    if (path.startsWith('/dashboard/client') && token?.role !== 'client') {
      return NextResponse.redirect(new URL('/dashboard/talent', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicPaths = ['/', '/talents', '/jobs', '/how-it-works', '/login', '/register'];
        const isPublic = publicPaths.some(p => req.nextUrl.pathname.startsWith(p));
        return isPublic || !!token;
      }
    }
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### 2.5 Flow: Logout

| Step | Aktor | Aksi | Output |
|---|---|---|---|
| 1 | User | Klik avatar/nama di navbar → dropdown → "Keluar" | Konfirmasi tidak diperlukan |
| 2 | System | `POST /api/auth/logout` — hapus session cookie | Cookie dihapus |
| 3 | System | Redirect ke `/` (landing page) | User kembali ke state non-login |

### 2.6 Flow: Auth-Gate Modal (Public Pages)

Ketika user non-login mencoba melakukan aksi yang butuh auth dari halaman publik:

| Step | Aksi User | Output |
|---|---|---|
| 1 | Klik "Lamar Job Ini" di `/jobs/[id]` | Modal muncul (bukan redirect) |
| 2 | Modal tampil | Judul: "Daftar untuk melamar job ini". Dua tombol: "Daftar Sekarang" dan "Sudah punya akun? Login" |
| 3a | Klik "Daftar Sekarang" | Redirect ke `/register?callbackUrl=/jobs/[id]&intent=apply` |
| 3b | Klik "Login" | Redirect ke `/login?callbackUrl=/jobs/[id]&intent=apply` |
| 4 | Setelah register/login sukses | Redirect kembali ke `/jobs/[id]`. Intent `apply` otomatis trigger aksi lamaran. |

> `intent` parameter digunakan agar setelah login, sistem tahu aksi apa yang harus dilanjutkan secara otomatis.

---

## 3. Onboarding Client Flow

### 3.1 Konteks

Di PRD v1.2, onboarding talenta sudah didefinisikan lengkap (hybrid form + upload). Onboarding client lebih sederhana karena tidak ada AI yang berjalan — tujuannya hanya mengumpulkan data profil bisnis untuk ditampilkan ke talenta.

### 3.2 Data yang Dikumpulkan

| Field | Tipe | Status | Keterangan |
|---|---|---|---|
| `company_name` | string | Opsional | Nama perusahaan / bisnis (jika ada) |
| `industry` | enum | Wajib | `tech`, `creative`, `retail`, `f&b`, `education`, `other` |
| `company_size` | enum | Opsional | `solo`, `2-10`, `11-50`, `51+` |
| `location` | string | Wajib | Kota/lokasi bisnis |
| `description` | text | Opsional | Deskripsi singkat kebutuhan umum bisnis |
| `website_url` | string | Opsional | Website atau media sosial bisnis |

### 3.3 Flow Step-by-Step

| Step | Aktor | Aksi | Output / System Response |
|---|---|---|---|
| 1 | Budi | Selesai register sebagai client | Auto-redirect ke `/onboarding/client` |
| 2 | System | Tampil form onboarding client — 1 halaman, tidak bertahap | Form dengan progress indicator "Langkah 1 dari 1" |
| 3 | Budi | Isi nama (opsional), pilih industri (wajib), kota (wajib) | Real-time validation |
| 4 | Budi | Isi field opsional lain sesuai keinginan | Tidak ada blocking jika dikosongkan |
| 5 | Budi | Klik **"Mulai Posting Job"** | `POST /api/client/onboarding` |
| 6 | System | Simpan ke tabel `client_profiles`. Update `onboarding_complete = true` di users. | Redirect ke `/dashboard/client` |
| 7 | System | Dashboard client tampil dengan state kosong + CTA besar "Post Job Pertamamu" | Budi siap memulai |

### 3.4 Tabel: client_profiles `NEW`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → users.id | Relasi ke tabel users (1-to-1) |
| `company_name` | VARCHAR(255) | NULLABLE | Nama perusahaan atau bisnis |
| `industry` | ENUM | NOT NULL | tech, creative, retail, f&b, education, other |
| `company_size` | ENUM | NULLABLE | solo, 2-10, 11-50, 51+ |
| `location` | VARCHAR(255) | NOT NULL | Kota/lokasi bisnis |
| `description` | TEXT | NULLABLE | Deskripsi singkat kebutuhan bisnis |
| `website_url` | TEXT | NULLABLE | Website atau media sosial |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu onboarding selesai |

### 3.5 Dashboard Client — Empty State

Ketika client baru selesai onboarding dan belum posting job apapun:

| Komponen | Konten |
|---|---|
| **Hero CTA** | "Siap menemukan talenta terbaik?" + tombol besar "Post Job Pertama" |
| **How it works mini** | 3 langkah: Post Job → AI Matching → Hire. Icon filled 2D + teks. |
| **Sample matching preview** | Card blurred dengan teks "Posting job untuk lihat AI matching bekerja" |
| **Trust indicator** | "Bergabung dengan 200+ bisnis yang sudah menemukan talenta di Nyamby" (dummy) |

---

## 4. Role-Based Access Control (RBAC)

### 4.1 Matriks Akses

| Route / Aksi | Guest | Talent | Client |
|---|---|---|---|
| `/` (Landing) | ✅ | ✅ | ✅ |
| `/talents` (Browse) | ✅ | ✅ | ✅ |
| `/talents/[id]` (Profil publik) | ✅ (match score blur) | ✅ (lihat score diri sendiri) | ✅ (lihat match jika punya job aktif) |
| `/jobs` (Browse) | ✅ | ✅ | ✅ |
| `/jobs/[id]` (Detail) | ✅ (CTA auth-gate) | ✅ | ✅ |
| `/how-it-works` | ✅ | ✅ | ✅ |
| `/dashboard/talent` | ❌ → login | ✅ | ❌ → redirect |
| `/dashboard/client` | ❌ → login | ❌ → redirect | ✅ |
| `/onboarding/talent` | ❌ → login | ✅ (jika belum complete) | ❌ |
| `/onboarding/client` | ❌ → login | ❌ | ✅ (jika belum complete) |
| `POST /api/jobs` | ❌ 401 | ❌ 403 | ✅ |
| `POST /api/talent/onboarding` | ❌ 401 | ✅ | ❌ 403 |
| `POST /api/ai/match-job` | ❌ 401 | ❌ 403 | ✅ |
| `POST /api/ai/skill-gap` | ❌ 401 | ✅ | ❌ 403 |
| `GET /api/talent/dashboard` | ❌ 401 | ✅ | ❌ 403 |
| `GET /api/client/dashboard` | ❌ 401 | ❌ 403 | ✅ |
| `PATCH /api/matches/:id/status` | ❌ 401 | ✅ (own matches) | ✅ (own jobs) |
| `POST /api/escrow/*` | ❌ 401 | ❌ 403 | ✅ |

### 4.2 Implementasi RBAC di API Routes

```typescript
// lib/auth-helpers.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}

export async function requireRole(role: 'talent' | 'client') {
  const { session, error } = await requireAuth();
  if (error) return { error };
  if (session.user.role !== role) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session };
}

// Penggunaan di route handler:
// export async function POST(req) {
//   const { session, error } = await requireRole('client');
//   if (error) return error;
//   // ... logic
// }
```

### 4.3 Ownership Guard

Selain role, beberapa operasi harus memverifikasi kepemilikan data:

| Operasi | Ownership Check |
|---|---|
| `PATCH /api/talent/profile` | `talent_profile.user_id === session.user.id` |
| `PATCH /api/jobs/:id/status` | `job.client_user_id === session.user.id` |
| `PATCH /api/matches/:id/status` | Talent: `match.talent_profile.user_id === session.user.id`. Client: `match.job.client_user_id === session.user.id` |
| `POST /api/escrow/release` | `escrow.client_user_id === session.user.id` |
| `GET /api/talent/dashboard` | Return data milik `session.user.id` saja |

```typescript
// Contoh ownership guard:
const job = await prisma.jobs.findUnique({ where: { id: jobId } });
if (job.client_user_id !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 5. CV Upload Pipeline — Teknikal

### 5.1 Arsitektur End-to-End

```
User browser
    │
    │ multipart/form-data (PDF file)
    ▼
POST /api/talent/upload-cv
    │
    ├─► Validasi: tipe file (PDF only), ukuran (≤ 5MB)
    │
    ├─► Upload ke Cloudinary/Supabase Storage
    │       └── Return: file URL + public_id
    │
    ├─► pdf-parse: extract plain text dari PDF
    │       └── Truncate ke 3000 karakter
    │
    └─► Prisma update talent_profiles:
            cv_file = file_url
            cv_text = extracted_text
```

### 5.2 Implementasi Detail

**Validasi file (server-side):**

```typescript
// app/api/talent/upload-cv/route.ts
export async function POST(req: Request) {
  const { session, error } = await requireRole('talent');
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get('cv') as File;

  // Validasi
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Hanya file PDF yang diterima' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran file maks 5MB' }, { status: 400 });
  }

  // Convert ke buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload ke storage (Cloudinary contoh)
  const uploadResult = await uploadToStorage(buffer, `cv_${session.user.id}`);

  // Parse PDF
  const pdfData = await pdfParse(buffer);
  const cvText = pdfData.text.trim().slice(0, 3000); // truncate

  // Update DB
  await prisma.talent_profiles.update({
    where: { user_id: session.user.id },
    data: { cv_file: uploadResult.url, cv_text: cvText }
  });

  return NextResponse.json({ success: true, cv_text_length: cvText.length });
}
```

**Handling file kosong / tidak terbaca:**

| Kondisi | Handling |
|---|---|
| PDF terenkripsi (password protected) | pdf-parse throw error → catch → simpan `cv_file` saja, `cv_text = null`. Return warning ke client. |
| PDF berisi scan gambar (bukan teks) | pdf-parse return teks kosong → simpan `cv_text = null`. Tampilkan info: "CV berhasil disimpan, tapi teks tidak dapat diekstrak. Analisis menggunakan data form." |
| File terlalu besar setelah parsing | Truncate agresif ke 3000 karakter. Prioritaskan paragraf awal (biasanya berisi summary dan skills). |
| Upload storage gagal | Return `500`. Jangan simpan cv_text tanpa cv_file. |

### 5.3 Portfolio URL Scraper — Implementasi

```typescript
// lib/portfolio-scraper.ts
export async function scrapePortfolioUrl(url: string): Promise<string> {
  const parsed = new URL(url);
  const domain = parsed.hostname;

  // GitHub khusus: gunakan API
  if (domain === 'github.com') {
    return scrapeGitHub(parsed);
  }

  // Generic: scrape meta tags
  const response = await fetch(url, {
    headers: { 'User-Agent': 'NyambyBot/1.0' },
    signal: AbortSignal.timeout(5000) // 5 detik timeout
  });

  const html = await response.text();
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] || '';

  return `Portfolio: ${title}. ${description}`.slice(0, 1000);
}

async function scrapeGitHub(parsed: URL): Promise<string> {
  const [, username, repo] = parsed.pathname.split('/');
  if (!repo) {
    // Profile page: ambil pinned repos
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`);
    const repos = await res.json();
    const summary = repos.map((r: any) => `${r.name} (${r.language}): ${r.description}`).join('. ');
    return `GitHub: ${username}. Top repos: ${summary}`.slice(0, 1000);
  } else {
    // Specific repo
    const res = await fetch(`https://api.github.com/repos/${username}/${repo}`);
    const data = await res.json();
    return `GitHub repo ${data.full_name}: ${data.description}. Language: ${data.language}. Stars: ${data.stargazers_count}`.slice(0, 1000);
  }
}
```

---

## 6. Re-run AI Matching (Manual)

### 6.1 Konteks

Setelah AI matching pertama kali dijalankan otomatis saat job dibuat, client bisa meminta AI untuk menjalankan ulang matching — misalnya setelah ada talenta baru mendaftar atau setelah mereka mengubah kriteria job.

### 6.2 Flow

| Step | Aktor | Aksi | Output |
|---|---|---|---|
| 1 | Budi | Buka dashboard client → lihat job aktif | Card job dengan section "Matched Talents" |
| 2 | Budi | Klik **"Refresh Matching"** | Konfirmasi: "Jalankan ulang AI matching? Shortlist saat ini akan diperbarui." |
| 3 | Budi | Konfirmasi | `POST /api/ai/match-job` dengan `{ job_id, force_refresh: true }` |
| 4 | System | Ambil semua talenta terbaru (termasuk yang baru daftar setelah matching pertama) | — |
| 5 | System | Hapus `job_matches` lama dengan `status = 'recommended'`. Pertahankan yang sudah `applied/accepted/rejected`. | — |
| 6 | System | Jalankan GPT-4o matching dengan data terbaru | Loading state di UI |
| 7 | System | Simpan hasil baru ke `job_matches`. Notifikasi ke client. | Shortlist diperbarui dengan timestamp "Diperbarui 2 menit lalu" |

### 6.3 Batasan & Edge Cases

| Kondisi | Handling |
|---|---|
| Job sudah `in_progress` atau `completed` | Tombol "Refresh Matching" tidak ditampilkan — matching sudah tidak relevan |
| Tidak ada talenta baru sejak matching terakhir | Tetap jalankan (karena bisa ada perubahan skill pada talenta existing). Tampilkan info "Matching diperbarui dengan data terkini" |
| Rate limiting | Batasi re-run maksimal 1x per 30 menit per job. Tampilkan cooldown timer jika mencoba terlalu cepat. |

---

## 7. Cancel Job Flow

### 7.1 Kondisi Cancel yang Diizinkan

| Status Job | Siapa bisa cancel | Aturan Escrow |
|---|---|---|
| `active` (belum ada yang apply) | Client | Tidak ada escrow → cancel langsung, tidak ada konsekuensi finansial |
| `matched` (ada yang apply, belum konfirmasi) | Client | Tidak ada escrow → cancel langsung, notifikasi ke talenta yang sudah apply |
| `in_progress` 0–25% progres | Client | Escrow sudah ada → refund penuh ke client, talenta dapat 0% |
| `in_progress` 26–75% progres | Client (dengan konfirmasi) | Talenta dapat 50%, client refund 50% |
| `in_progress` 76–100% progres | Client (dengan konfirmasi kuat) | Talenta dapat 100%, client tidak dapat refund |
| `completed` | Tidak bisa di-cancel | — |

### 7.2 Flow: Cancel Job (Status Active/Matched)

| Step | Aktor | Aksi | Output |
|---|---|---|---|
| 1 | Budi | Buka detail job → klik menu "..." → "Batalkan Job" | Modal konfirmasi muncul |
| 2 | System | Tampil modal: "Batalkan job [nama job]? Semua pelamar akan dinotifikasi." | — |
| 3 | Budi | Konfirmasi | `PATCH /api/jobs/:id/status` dengan `{ status: 'cancelled' }` |
| 4 | System | Update status job → `cancelled`. Update semua `job_matches` terkait → `rejected`. | Notifikasi ke semua talenta yang sudah apply: "Job [nama] telah dibatalkan oleh client." |
| 5 | System | Dashboard client: job dipindah ke section "Selesai/Dibatalkan" | — |

### 7.3 Flow: Cancel Job (Status In Progress)

| Step | Aktor | Aksi | Output |
|---|---|---|---|
| 1 | Budi | Klik "Batalkan Job" di job yang sedang berjalan | Modal konfirmasi dengan peringatan escrow |
| 2 | System | Tampil informasi progres: "Job ini sedang berjalan. Pembatalan akan memproses dana sesuai aturan platform." | Slider atau input "Estimasi progres pekerjaan" |
| 3 | Budi | Isi estimasi progres (0–100%) | System kalkulasi distribusi dana sesuai aturan |
| 4 | System | Tampil preview distribusi: "Client menerima: Rp X. Talenta menerima: Rp Y." | — |
| 5 | Budi | Konfirmasi akhir (checkbox: "Saya memahami pembagian dana ini") | `POST /api/escrow/cancel` dengan `{ job_id, progress_pct }` |
| 6 | System | Update escrow status → `refunded` (partial atau full). Update job → `cancelled`. | Notifikasi ke kedua pihak dengan rincian distribusi dana. |

---

## 8. Loading & Optimistic UI

### 8.1 Prinsip Umum

| Prinsip | Penjelasan |
|---|---|
| **Skeleton over spinner** | Gunakan skeleton UI (placeholder berbentuk konten) untuk loading awal halaman. Spinner hanya untuk aksi tombol. |
| **Optimistic update** | Untuk aksi ringan (mark notif read, accept/reject), update UI dulu, rollback jika API gagal. |
| **Loading state per komponen** | Jangan block seluruh halaman. Komponen yang loading tampilkan skeleton, sisanya tetap interaktif. |
| **Minimum loading time** | Jika API sangat cepat (< 200ms), jangan flash loading state — gunakan delay minimal 300ms agar tidak terasa janky. |

### 8.2 Loading States per Halaman

| Halaman / Komponen | Loading State | Durasi Estimasi |
|---|---|---|
| Browse Talenta (`/talents`) | Skeleton 12 card talenta | < 500ms (DB query) |
| Profil Talenta (`/talents/[id]`) | Skeleton hero + skill section | < 500ms |
| Dashboard Talenta | Skeleton 2 section (skill gap + job reko) | < 1 detik |
| **AI Skill Gap Analysis** | Animated card dengan teks "AI sedang menganalisis skill kamu..." | 5–15 detik (GPT-4o) |
| **AI Job Matching** | Animated card dengan teks "AI sedang mengevaluasi talenta terbaik untukmu..." | 5–20 detik (GPT-4o) |
| Upload CV | Progress bar upload + teks "Memproses CV..." | 2–8 detik |
| Post Job | Spinner di tombol submit | < 1 detik |

### 8.3 AI Loading Component — Spesifikasi

Karena AI loading bisa berlangsung 5–20 detik, ini butuh treatment khusus:

```
┌─────────────────────────────────────────┐
│  🤖  AI sedang bekerja...               │
│                                          │
│  ████████████████░░░░░░░░  60%          │
│                                          │
│  Menganalisis 47 job aktif di platform  │
│  Membandingkan skill gap kamu...        │
│                                          │
│  Estimasi: 10–15 detik                  │
└─────────────────────────────────────────┘
```

**Detail:**
- Progress bar animasi CSS (tidak berdasarkan progress nyata — purely visual)
- Teks status berubah setiap 3 detik: "Menganalisis job aktif..." → "Membandingkan skill gap..." → "Menyusun rekomendasi..."
- Setelah 30 detik: progress bar berhenti + pesan "Masih memproses, harap tunggu..."
- Jangan ada tombol "Cancel" — membingungkan user dan tidak perlu untuk MVP

### 8.4 Optimistic UI — Implementasi

**Contoh: Mark notifikasi sebagai dibaca**

```typescript
// Optimistic: update UI dulu
const [notifications, setNotifications] = useState(initialNotifications);

async function markAsRead(id: string) {
  // 1. Update UI langsung (optimistic)
  setNotifications(prev =>
    prev.map(n => n.id === id ? { ...n, is_read: true } : n)
  );

  try {
    // 2. Sync ke server
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  } catch {
    // 3. Rollback jika gagal
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: false } : n)
    );
    toast.error('Gagal memperbarui notifikasi');
  }
}
```

### 8.5 Error States — Per Komponen

| Komponen | Error State UI |
|---|---|
| Browse Talenta (fetch gagal) | Ilustrasi + "Gagal memuat talenta. [Coba lagi]" button |
| AI Skill Gap (GPT-4o gagal) | Card error: "Analisis gagal dijalankan. Kami akan coba ulang otomatis." + tombol "Coba Sekarang" manual |
| AI Job Matching (GPT-4o gagal) | Card error: "Matching gagal. [Refresh Matching]" tombol |
| Upload CV (gagal) | Toast merah: "Upload gagal. Periksa koneksi dan coba lagi." File input reset. |
| Post Job (gagal) | Toast merah + form tetap terisi (jangan reset form saat error) |

---

## 9. Seed Data Demo

### 9.1 Tujuan

Seed data menyiapkan state database yang diperlukan untuk demo hackathon yang meyakinkan. Tanpa seed data yang baik, demo akan terlihat kosong dan AI matching tidak bisa bekerja (butuh minimal beberapa talenta untuk dibandingkan).

### 9.2 Data yang Perlu Di-seed

**Users & Profiles:**

| Akun | Role | Detail |
|---|---|---|
| `raka@demo.nyamby.id` | Talent | Web Developer, Bandung. Skills: React, Next.js, Tailwind. Level: Intermediate. Rate: 150rb/jam. |
| `dewi@demo.nyamby.id` | Talent | Graphic Designer, Jakarta. Skills: Figma, Illustrator, Canva. Level: Expert. Rate: 200rb/jam. |
| `andi@demo.nyamby.id` | Talent | Web Developer, Surabaya. Skills: Vue.js, Node.js, PostgreSQL. Level: Expert. Rate: 250rb/jam. |
| `sari@demo.nyamby.id` | Talent | Graphic Designer, Yogyakarta. Skills: Figma, Photoshop, UI Design. Level: Intermediate. Rate: 120rb/jam. |
| `budi@demo.nyamby.id` | Client | UKM owner, Jakarta. Industry: retail. |
| `citra@demo.nyamby.id` | Client | Startup founder, Bandung. Industry: tech. |

**Password semua akun demo:** `demo123456`

**Jobs (sudah dipost oleh client demo):**

| Job | Client | Skills Required | Budget |
|---|---|---|---|
| "Landing Page untuk Toko Online Pakaian" | budi | React, Tailwind, Figma | Rp 2.500.000 |
| "Branding Kit untuk Startup Fintech" | citra | Figma, Illustrator, Brand Design | Rp 3.000.000 |
| "Dashboard Admin Internal" | citra | React, TypeScript, PostgreSQL | Rp 5.000.000 |

**AI Matching Results (pre-seeded):**

Job "Landing Page" matched ke Raka (score: 87%), Andi (score: 72%), Sari (score: 45%).

**Skill Gap Analysis (pre-seeded untuk Raka):**

Rekomendasi: TypeScript (high), UI Testing (medium), Docker basics (low).

### 9.3 Prisma Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo123456', 12);

  // 1. Seed skills master
  const skills = await Promise.all([
    prisma.skills.upsert({ where: { name: 'React' }, update: {}, create: { name: 'React', category: 'Frontend' } }),
    prisma.skills.upsert({ where: { name: 'Next.js' }, update: {}, create: { name: 'Next.js', category: 'Frontend' } }),
    prisma.skills.upsert({ where: { name: 'TypeScript' }, update: {}, create: { name: 'TypeScript', category: 'Frontend' } }),
    prisma.skills.upsert({ where: { name: 'Tailwind' }, update: {}, create: { name: 'Tailwind', category: 'Frontend' } }),
    prisma.skills.upsert({ where: { name: 'Figma' }, update: {}, create: { name: 'Figma', category: 'Design Tool' } }),
    prisma.skills.upsert({ where: { name: 'Illustrator' }, update: {}, create: { name: 'Illustrator', category: 'Design Tool' } }),
    prisma.skills.upsert({ where: { name: 'Node.js' }, update: {}, create: { name: 'Node.js', category: 'Backend' } }),
    prisma.skills.upsert({ where: { name: 'PostgreSQL' }, update: {}, create: { name: 'PostgreSQL', category: 'Database' } }),
  ]);

  // 2. Seed users (talent)
  const raka = await prisma.users.upsert({
    where: { email: 'raka@demo.nyamby.id' },
    update: {},
    create: {
      email: 'raka@demo.nyamby.id',
      password_hash: passwordHash,
      role: 'talent',
      full_name: 'Raka Pratama',
      talent_profiles: {
        create: {
          bio: 'Frontend developer dengan 2 tahun pengalaman freelance. Spesialis React & Next.js.',
          category: 'web_dev',
          rate_per_hour: 150000,
          availability: 'available',
          location: 'Bandung',
          talent_skills: {
            create: [
              { skill: { connect: { name: 'React' } }, level: 'intermediate' },
              { skill: { connect: { name: 'Next.js' } }, level: 'intermediate' },
              { skill: { connect: { name: 'Tailwind' } }, level: 'expert' },
            ]
          }
        }
      }
    }
  });

  // ... (pattern sama untuk talenta dan client lainnya)

  // 3. Seed jobs
  const budi = await prisma.users.findUnique({ where: { email: 'budi@demo.nyamby.id' } });
  const job1 = await prisma.jobs.create({
    data: {
      client_user_id: budi.id,
      title: 'Landing Page untuk Toko Online Pakaian',
      description: 'Kami butuh landing page modern dan mobile-responsive untuk toko pakaian online kami...',
      category: 'web_dev',
      budget_min: 2000000,
      budget_max: 2500000,
      status: 'active',
      job_required_skills: {
        create: [
          { skill: { connect: { name: 'React' } }, is_mandatory: true },
          { skill: { connect: { name: 'Tailwind' } }, is_mandatory: true },
          { skill: { connect: { name: 'Figma' } }, is_mandatory: false },
        ]
      }
    }
  });

  // 4. Seed job_matches (pre-computed AI results)
  const rakaProfile = await prisma.talent_profiles.findUnique({ where: { user_id: raka.id } });
  await prisma.job_matches.create({
    data: {
      job_id: job1.id,
      talent_profile_id: rakaProfile.id,
      match_score: 87.5,
      reasoning: 'Raka memiliki keahlian React dan Tailwind yang sangat relevan dengan kebutuhan job ini. Pengalaman Next.js juga menjadi nilai tambah untuk performa website.',
      status: 'recommended'
    }
  });

  // 5. Seed skill gap (pre-computed)
  await prisma.skill_gap_analyses.create({
    data: {
      talent_profile_id: rakaProfile.id,
      recommended_skills: [
        { skill_name: 'TypeScript', priority: 'high', reason: 'TypeScript diminta di 18 dari 23 job web_dev aktif di platform. Meningkatkan match score rata-rata sebesar 25%', estimated_impact: 'Tinggi', evidence_basis: 'form' },
        { skill_name: 'UI Testing (Jest/Cypress)', priority: 'medium', reason: 'Skill ini membedakan talenta junior dari senior di mata client korporat', estimated_impact: 'Sedang', evidence_basis: 'form' },
        { skill_name: 'Docker Basics', priority: 'low', reason: 'Mulai muncul di job-job dengan budget lebih tinggi (>5 juta)', estimated_impact: 'Rendah', evidence_basis: 'form' },
      ],
      is_latest: true
    }
  });

  console.log('✅ Seed data berhasil dibuat');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Cara menjalankan:**
```bash
npx prisma db seed
# atau
npx ts-node prisma/seed.ts
```

**Tambahkan di `package.json`:**
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

---

## 10. Error States & Empty States

### 10.1 Empty States per Halaman

| Halaman | Kondisi | Konten Empty State |
|---|---|---|
| Dashboard Talenta — Job Rekomendasi | Belum ada job aktif yang sesuai skill | "Belum ada job yang cocok untukmu sekarang. Lengkapi profilmu agar AI bisa merekomendasikan lebih banyak job." + CTA "Lengkapi Profil" |
| Dashboard Talenta — Skill Gap | AI belum dijalankan | "Analisis skill gap sedang disiapkan..." dengan loading spinner |
| Dashboard Client — Job List | Belum pernah posting job | "Belum ada job yang kamu post. Mulai cari talenta sekarang!" + CTA besar "Post Job" |
| Dashboard Client — Matched Talents | Job baru dipost, matching berjalan | Loading state AI matching |
| Browse Talenta — Hasil Filter | Filter terlalu ketat | "Tidak ada talenta yang cocok dengan filter ini. Coba kurangi filter atau [Reset Filter]" |
| Notifikasi | Belum ada notifikasi | "Belum ada notifikasi. Kami akan memberitahu kamu saat ada aktivitas." |

### 10.2 Error Boundaries

```typescript
// app/error.tsx — Global error boundary Next.js
'use client';
export default function GlobalError({ error, reset }) {
  return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <h2>Terjadi kesalahan</h2>
      <p>Kami sudah mencatat masalah ini. Silakan coba lagi.</p>
      <button onClick={reset}>Coba Lagi</button>
    </div>
  );
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Halaman tidak ditemukan</h2>
      <a href="/">Kembali ke Beranda</a>
    </div>
  );
}
```

---

## 11. Middleware Architecture

### 11.1 Stack Middleware Next.js

```
Request masuk
    │
    ▼
[ Rate Limiter ] ← blokir abuse (opsional untuk MVP)
    │
    ▼
[ NextAuth Middleware ] ← cek session token
    │
    ├── Not authenticated → redirect /login (jika protected route)
    │
    ▼
[ Role Guard ] ← cek role dari token
    │
    ├── Wrong role → redirect ke dashboard yang sesuai
    │
    ▼
[ Onboarding Guard ] ← cek onboarding_complete flag
    │
    ├── Incomplete → redirect /onboarding/[role]
    │
    ▼
[ Route Handler ] ← logic bisnis
```

### 11.2 API Route Middleware Pattern

Setiap API route menggunakan helper functions untuk konsistensi:

```typescript
// Contoh lengkap POST /api/jobs
export async function POST(req: Request) {
  // 1. Auth check
  const { session, error } = await requireRole('client');
  if (error) return error;

  // 2. Parse & validate body
  const body = await req.json();
  const validation = jobSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
  }

  // 3. Business logic
  const job = await prisma.jobs.create({ data: { ...validation.data, client_user_id: session.user.id } });

  // 4. Side effects (trigger AI matching)
  await triggerAIMatching(job.id); // async, non-blocking

  // 5. Response
  return NextResponse.json({ job }, { status: 201 });
}
```

### 11.3 Zod Validation Schemas

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  category: z.enum(['web_dev', 'graphic_designer']),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  required_skills: z.array(z.string().uuid()).min(1),
});

export const talentOnboardingSchema = z.object({
  category: z.enum(['web_dev', 'graphic_designer']),
  skills: z.array(z.string().uuid()).min(1),
  level: z.enum(['beginner', 'intermediate', 'expert']),
  bio: z.string().max(500).optional(),
  rate_per_hour: z.number().positive().optional(),
  portfolio_url: z.string().url().optional(),
});
```

---

## 12. Environment & Config Checklist

### 12.1 File `.env.local`

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/nyamby_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o"
OPENAI_MAX_TOKENS=1000
OPENAI_TIMEOUT_MS=30000

# File Storage — pilih salah satu
# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# ATAU Supabase Storage
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_KEY="..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AI_SKILL_GAP_COOLDOWN_MINUTES=60
AI_MATCHING_COOLDOWN_MINUTES=30
```

### 12.2 Prisma Schema — Field Tambahan

Field-field baru yang perlu ditambahkan ke `schema.prisma` selain yang sudah ada di PRD v1.2:

```prisma
model users {
  // ... existing fields
  onboarding_complete Boolean @default(false)
}

model job_matches {
  // ... existing fields
  rejection_reason    String?  // NEW: data untuk AI feedback loop
}

model skill_gap_analyses {
  // ... existing fields
  status              String   @default("completed") // pending, processing, completed, failed
}

model jobs {
  // ... existing fields
  submitted_at        DateTime? // Waktu talenta submit deliverable
  submission_url      String?   // URL atau path deliverable
  submission_notes    String?   // Catatan dari talenta saat submit
}

model client_profiles {   // NEW TABLE — lihat Section 3.4
  id           String   @id @default(uuid())
  user_id      String   @unique
  company_name String?
  industry     String
  company_size String?
  location     String
  description  String?
  website_url  String?
  created_at   DateTime @default(now())
  user         users    @relation(fields: [user_id], references: [id])
}
```

### 12.3 Package Dependencies Tambahan

```bash
# Wajib install (belum ada di PRD v1.2)
npm install pdf-parse @types/pdf-parse
npm install zod
npm install bcryptjs @types/bcryptjs

# Jika pakai Cloudinary
npm install cloudinary

# Jika pakai Supabase
npm install @supabase/supabase-js

# Dev dependencies
npm install -D prisma @types/node ts-node
```

### 12.4 Pre-Launch Checklist (Hari 13 — Polish Day)

**Functionality:**
- [ ] Semua 15 fitur MUST HAVE bisa dijalankan tanpa error
- [ ] AI Skill Gap muncul setelah onboarding selesai
- [ ] AI Job Matching muncul setelah client post job
- [ ] Mock escrow flow lengkap: hold → in progress → release
- [ ] Notifikasi muncul untuk semua 10 event yang didefinisikan
- [ ] Auth guard berfungsi — halaman protected tidak bisa diakses tanpa login
- [ ] Filter & search berfungsi di `/talents` dan `/jobs`
- [ ] Role guard berfungsi — talent tidak bisa akses dashboard client (dan sebaliknya)

**UX & Polish:**
- [ ] Semua loading state terpasang (terutama AI loading)
- [ ] Semua empty state terpasang
- [ ] Error state untuk AI API failure terpasang
- [ ] Semua icon menggunakan filled 2D solid + label teks
- [ ] AI badge amber terpasang di semua touchpoint AI
- [ ] Form validation pesan error tampil di semua form
- [ ] Toast notification berfungsi untuk semua aksi penting
- [ ] Mobile responsive di lebar 375px (iPhone SE) dan 768px (tablet)

**Data & Demo:**
- [ ] Seed data sudah dijalankan
- [ ] Akun demo bisa login (raka@demo, budi@demo)
- [ ] Pre-seeded AI matching sudah tampil di dashboard client
- [ ] Pre-seeded skill gap sudah tampil di dashboard talenta
- [ ] Demo flow bisa dijalankan end-to-end dalam 7 menit

**Security (minimum):**
- [ ] Semua API route ada auth check
- [ ] Ownership guard terpasang untuk operasi sensitif
- [ ] Tidak ada API key yang ter-expose di client-side code
- [ ] `.env.local` tidak ter-commit ke git (ada di `.gitignore`)

---

*Nyamby PRD Technical & Flows v2.0 — Satria Romanda — Digdaya X Hackathon 2026*
*Dokumen ini adalah pelengkap PRD MVP v1.2 dan harus dibaca bersamaan.*

---

## 13. API Endpoint Specs Lengkap — Request & Response Schema

> Bagian ini mendefinisikan request body, response schema, dan HTTP status codes untuk setiap endpoint. Semua endpoint yang sudah disebutkan di PRD v1.2 namun belum punya spec lengkap didefinisikan di sini.

### 13.1 Auth Endpoints

---

#### `POST /api/auth/register`

**Request body:**
```json
{
  "full_name": "Raka Pratama",
  "email": "raka@example.com",
  "password": "minimum8karakter",
  "role": "talent"
}
```

**Validasi:**
| Field | Rule |
|---|---|
| `full_name` | min 2 karakter, max 255 |
| `email` | format valid, unik di tabel users |
| `password` | min 8 karakter |
| `role` | enum: `talent` atau `client` |

**Response 201 — sukses:**
```json
{
  "user": {
    "id": "uuid",
    "email": "raka@example.com",
    "full_name": "Raka Pratama",
    "role": "talent"
  },
  "redirect": "/onboarding/talent"
}
```

**Response errors:**
| Status | Kondisi | Body |
|---|---|---|
| `400` | Validasi gagal | `{ "error": "Validation failed", "fields": { "email": "Format email tidak valid" } }` |
| `409` | Email sudah terdaftar | `{ "error": "Email sudah terdaftar" }` |
| `500` | DB error | `{ "error": "Terjadi kesalahan. Silakan coba lagi." }` |

---

#### `POST /api/auth/login`

**Request body:**
```json
{
  "email": "raka@example.com",
  "password": "password123"
}
```

**Response 200 — sukses:**
```json
{
  "user": {
    "id": "uuid",
    "email": "raka@example.com",
    "full_name": "Raka Pratama",
    "role": "talent",
    "onboarding_complete": true
  },
  "redirect": "/dashboard/talent"
}
```

**Response errors:**
| Status | Kondisi | Body |
|---|---|---|
| `401` | Email tidak ditemukan atau password salah | `{ "error": "Email atau password salah" }` |
| `400` | Field kosong | `{ "error": "Email dan password wajib diisi" }` |

> Catatan keamanan: jangan bedakan pesan error antara "email tidak ditemukan" dan "password salah" — keduanya harus return pesan yang sama untuk mencegah user enumeration.

---

#### `POST /api/auth/logout`

**Request:** tidak butuh body. Session diambil dari cookie.

**Response 200:**
```json
{ "success": true }
```

---

### 13.2 Talent Endpoints

---

#### `POST /api/talent/onboarding`

**Request body (`multipart/form-data`):**
```
category:        "web_dev"
skills:          ["uuid-react", "uuid-nextjs", "uuid-tailwind"]
level:           "intermediate"
bio:             "Frontend developer 2 tahun pengalaman..."
rate_per_hour:   150000
rate_per_project: null
availability:    "available"
location:        "Bandung"
portfolio_url:   "https://github.com/raka-dev"
cv_file:         [File PDF opsional]
portfolio_file:  [File PDF/ZIP opsional]
```

**Proses internal (urutan eksekusi):**
1. Validasi semua field wajib
2. Insert ke `talent_profiles`
3. Insert ke `talent_skills` (bulk)
4. Jika `cv_file` ada: upload ke storage → parse → simpan `cv_text`
5. Jika `portfolio_file` ada: upload → parse → simpan `portfolio_context`
6. Jika `portfolio_url` ada: scrape metadata → simpan ke `portfolio_context`
7. Update `users.onboarding_complete = true`
8. Trigger async: `POST /api/ai/skill-gap` (non-blocking)
9. Return response

**Response 201:**
```json
{
  "profile": {
    "id": "uuid",
    "category": "web_dev",
    "availability": "available"
  },
  "ai_skill_gap_status": "processing",
  "redirect": "/dashboard/talent"
}
```

**Response errors:**
| Status | Kondisi |
|---|---|
| `400` | Field wajib kosong atau format salah |
| `400` | File bukan PDF / ukuran > limit |
| `401` | Tidak login |
| `403` | Role bukan talent |
| `409` | Profil sudah ada untuk user ini |

---

#### `GET /api/talent/profile/:id`

**Auth:** tidak diperlukan (public endpoint)

**Response 200:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "full_name": "Raka Pratama",
  "avatar_url": null,
  "bio": "Frontend developer...",
  "category": "web_dev",
  "rate_per_hour": 150000,
  "rate_per_project": null,
  "availability": "available",
  "location": "Bandung",
  "portfolio_url": "https://github.com/raka-dev",
  "skills": [
    { "id": "uuid", "name": "React", "category": "Frontend", "level": "intermediate" },
    { "id": "uuid", "name": "Next.js", "category": "Frontend", "level": "intermediate" },
    { "id": "uuid", "name": "Tailwind", "category": "Frontend", "level": "expert" }
  ],
  "created_at": "2026-05-01T10:00:00Z"
}
```

> `cv_text` dan `portfolio_context` **tidak direturn** di endpoint publik — data ini hanya untuk internal AI processing.

**Response errors:**
| Status | Kondisi |
|---|---|
| `404` | Talent profile tidak ditemukan |

---

#### `PATCH /api/talent/profile`

**Auth:** wajib, role `talent`

**Request body (semua field opsional — partial update):**
```json
{
  "bio": "Teks bio baru",
  "rate_per_hour": 175000,
  "availability": "busy",
  "location": "Jakarta",
  "portfolio_url": "https://behance.net/raka",
  "skills": ["uuid-react", "uuid-typescript", "uuid-tailwind"]
}
```

> Jika `skills` dikirim, sistem akan **replace** semua `talent_skills` lama dengan yang baru (delete + insert). Trigger re-run AI skill gap jika `skills` berubah.

**Response 200:**
```json
{
  "profile": { "...updated fields..." },
  "skill_gap_retriggered": true
}
```

---

#### `GET /api/talent/dashboard`

**Auth:** wajib, role `talent`

**Response 200:**
```json
{
  "talent": {
    "id": "uuid",
    "full_name": "Raka Pratama",
    "category": "web_dev",
    "availability": "available",
    "profile_completeness": 85
  },
  "skill_gap": {
    "status": "completed",
    "generated_at": "2026-05-01T10:05:00Z",
    "recommendations": [
      {
        "skill_name": "TypeScript",
        "priority": "high",
        "reason": "Diminta di 18 dari 23 job aktif",
        "estimated_impact": "Tinggi",
        "evidence_basis": "form"
      }
    ],
    "summary": "Kamu memiliki skill inti yang solid...",
    "profile_completeness_score": 72
  },
  "job_recommendations": {
    "total": 5,
    "items": [
      {
        "job_id": "uuid",
        "title": "Landing Page untuk Toko Online",
        "client_name": "Budi Santoso",
        "budget_min": 2000000,
        "budget_max": 2500000,
        "match_score": 87.5,
        "status": "recommended",
        "created_at": "2026-05-02T08:00:00Z"
      }
    ]
  },
  "active_jobs": [
    {
      "job_id": "uuid",
      "title": "Dashboard Admin Internal",
      "status": "in_progress",
      "escrow_status": "held"
    }
  ],
  "unread_notifications": 3
}
```

---

#### `GET /api/talent/skill-gap`

**Auth:** wajib, role `talent`

**Response 200 (analysis tersedia):**
```json
{
  "status": "completed",
  "generated_at": "2026-05-01T10:05:00Z",
  "is_latest": true,
  "recommendations": [
    {
      "skill_name": "TypeScript",
      "priority": "high",
      "reason": "Diminta di 18 dari 23 job aktif di platform",
      "estimated_impact": "Meningkatkan match score rata-rata 25%",
      "evidence_basis": "form"
    },
    {
      "skill_name": "UI Testing (Jest/Cypress)",
      "priority": "medium",
      "reason": "Membedakan talenta junior dari senior",
      "estimated_impact": "Sedang",
      "evidence_basis": "form"
    },
    {
      "skill_name": "Docker Basics",
      "priority": "low",
      "reason": "Muncul di job dengan budget >5 juta",
      "estimated_impact": "Rendah",
      "evidence_basis": "form"
    }
  ],
  "summary": "Skill inti kamu sudah relevan. Fokus pada TypeScript untuk impact terbesar.",
  "profile_completeness_score": 72
}
```

**Response 200 (masih processing):**
```json
{
  "status": "processing",
  "message": "AI sedang menganalisis skill gap kamu. Hasilnya akan muncul dalam beberapa menit."
}
```

**Response 200 (belum ada / gagal):**
```json
{
  "status": "pending",
  "message": "Analisis belum dijalankan."
}
```

---

#### `GET /api/talents`

**Auth:** tidak diperlukan (public endpoint)

**Query params:** `category`, `skill` (multi), `availability`, `min_rate`, `max_rate`, `q`, `sort`, `page`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Raka Pratama",
      "avatar_url": null,
      "category": "web_dev",
      "rate_per_hour": 150000,
      "availability": "available",
      "location": "Bandung",
      "skills": [
        { "name": "React", "level": "intermediate" },
        { "name": "Next.js", "level": "intermediate" }
      ],
      "portfolio_url": "https://github.com/raka-dev"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 12,
    "total": 47,
    "total_pages": 4,
    "has_next": true,
    "has_prev": false
  }
}
```

---

#### `POST /api/talent/upload-cv`

**Auth:** wajib, role `talent`

**Request body (`multipart/form-data`):**
```
cv: [File PDF, maks 5MB]
```

**Response 200:**
```json
{
  "success": true,
  "cv_file_url": "https://storage.../cv_uuid.pdf",
  "cv_text_length": 2847,
  "parsed": true
}
```

**Response 200 (upload berhasil tapi parse gagal):**
```json
{
  "success": true,
  "cv_file_url": "https://storage.../cv_uuid.pdf",
  "parsed": false,
  "warning": "CV berhasil disimpan, namun teks tidak dapat diekstrak. Analisis akan menggunakan data form."
}
```

---

#### `POST /api/talent/upload-portfolio`

**Auth:** wajib, role `talent`

**Request body (`multipart/form-data`):**
```
portfolio_file: [File PDF/ZIP opsional, maks 10MB]
portfolio_url:  "https://github.com/username" (opsional)
```

> Minimal satu dari dua field harus ada.

**Response 200:**
```json
{
  "success": true,
  "portfolio_file_url": "https://storage.../portfolio_uuid.pdf",
  "portfolio_url": "https://github.com/username",
  "portfolio_context_length": 934,
  "scraped": true
}
```

---

### 13.3 Client Endpoints

---

#### `POST /api/client/onboarding`

**Auth:** wajib, role `client`

**Request body:**
```json
{
  "company_name": "Toko Baju Budi",
  "industry": "retail",
  "company_size": "2-10",
  "location": "Jakarta",
  "description": "Toko pakaian online yang butuh bantuan digital",
  "website_url": "https://tokobajubudi.com"
}
```

**Validasi:**
| Field | Rule |
|---|---|
| `industry` | wajib, enum: tech, creative, retail, f&b, education, other |
| `location` | wajib, min 2 karakter |
| `company_name` | opsional, maks 255 karakter |

**Response 201:**
```json
{
  "profile": {
    "id": "uuid",
    "industry": "retail",
    "location": "Jakarta"
  },
  "redirect": "/dashboard/client"
}
```

---

#### `GET /api/client/profile`

**Auth:** wajib, role `client`

**Response 200:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "full_name": "Budi Santoso",
  "company_name": "Toko Baju Budi",
  "industry": "retail",
  "company_size": "2-10",
  "location": "Jakarta",
  "description": "Toko pakaian online...",
  "website_url": "https://tokobajubudi.com",
  "created_at": "2026-05-01T09:00:00Z"
}
```

---

#### `PATCH /api/client/profile`

**Auth:** wajib, role `client`

**Request body (semua opsional — partial update):**
```json
{
  "company_name": "Baju Budi Store",
  "industry": "retail",
  "location": "Tangerang"
}
```

**Response 200:**
```json
{
  "profile": { "...updated fields..." }
}
```

---

#### `GET /api/client/dashboard`

**Auth:** wajib, role `client`

**Response 200:**
```json
{
  "client": {
    "id": "uuid",
    "full_name": "Budi Santoso",
    "company_name": "Toko Baju Budi"
  },
  "jobs": {
    "active": [
      {
        "id": "uuid",
        "title": "Landing Page untuk Toko Online",
        "status": "active",
        "created_at": "2026-05-02T08:00:00Z",
        "matched_talents_count": 3,
        "ai_matching_status": "completed"
      }
    ],
    "in_progress": [],
    "completed": [],
    "cancelled": []
  },
  "unread_notifications": 2
}
```

---

### 13.4 Jobs Endpoints

---

#### `POST /api/jobs`

**Auth:** wajib, role `client`

**Request body:**
```json
{
  "title": "Landing Page untuk Toko Online Pakaian",
  "description": "Kami membutuhkan landing page modern dan mobile-responsive...",
  "category": "web_dev",
  "budget_min": 2000000,
  "budget_max": 2500000,
  "deadline": "2026-06-30",
  "required_skills": [
    { "skill_id": "uuid-react", "is_mandatory": true },
    { "skill_id": "uuid-tailwind", "is_mandatory": true },
    { "skill_id": "uuid-figma", "is_mandatory": false }
  ]
}
```

**Validasi:**
| Field | Rule |
|---|---|
| `title` | wajib, min 5, maks 255 karakter |
| `description` | wajib, min 20 karakter |
| `category` | wajib, enum: web_dev, graphic_designer |
| `required_skills` | wajib, minimal 1 item |
| `budget_min` | opsional, harus < `budget_max` jika keduanya ada |

**Proses internal:**
1. Validasi body
2. Insert ke `jobs`
3. Insert ke `job_required_skills` (bulk)
4. Trigger async: `POST /api/ai/match-job` (non-blocking)
5. Return response

**Response 201:**
```json
{
  "job": {
    "id": "uuid",
    "title": "Landing Page untuk Toko Online Pakaian",
    "status": "active",
    "created_at": "2026-05-02T08:00:00Z"
  },
  "ai_matching_status": "processing"
}
```

---

#### `GET /api/jobs`

**Auth:** tidak diperlukan (public endpoint)

**Query params:** `category`, `skill` (multi), `min_budget`, `max_budget`, `status` (default: `active`), `q`, `sort`, `page`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Landing Page untuk Toko Online",
      "category": "web_dev",
      "budget_min": 2000000,
      "budget_max": 2500000,
      "deadline": "2026-06-30",
      "status": "active",
      "required_skills": [
        { "name": "React", "is_mandatory": true },
        { "name": "Tailwind", "is_mandatory": true }
      ],
      "client": {
        "full_name": "Budi Santoso",
        "company_name": "Toko Baju Budi"
      },
      "created_at": "2026-05-02T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 12,
    "total": 15,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

---

#### `GET /api/jobs/:id`

**Auth:** tidak diperlukan (public endpoint). Jika login sebagai talent, tambahkan `my_match_score` di response.

**Response 200 (guest / client):**
```json
{
  "id": "uuid",
  "title": "Landing Page untuk Toko Online",
  "description": "Kami membutuhkan landing page modern...",
  "category": "web_dev",
  "budget_min": 2000000,
  "budget_max": 2500000,
  "deadline": "2026-06-30",
  "status": "active",
  "required_skills": [
    { "id": "uuid", "name": "React", "category": "Frontend", "is_mandatory": true },
    { "id": "uuid", "name": "Tailwind", "category": "Frontend", "is_mandatory": true },
    { "id": "uuid", "name": "Figma", "category": "Design Tool", "is_mandatory": false }
  ],
  "client": {
    "full_name": "Budi Santoso",
    "company_name": "Toko Baju Budi",
    "location": "Jakarta"
  },
  "created_at": "2026-05-02T08:00:00Z",
  "my_match_score": null
}
```

**Response 200 (login sebagai talent):**
```json
{
  "...same fields...",
  "my_match_score": 87.5,
  "my_match_status": "recommended",
  "my_match_reasoning": "Kamu memiliki React dan Tailwind yang relevan...",
  "my_application_status": null
}
```

**Response 200 (login sebagai client, pemilik job):**
```json
{
  "...same fields...",
  "matched_talents": [
    {
      "match_id": "uuid",
      "talent": {
        "id": "uuid",
        "full_name": "Raka Pratama",
        "avatar_url": null,
        "category": "web_dev",
        "rate_per_hour": 150000,
        "availability": "available",
        "skills": ["React", "Next.js", "Tailwind"]
      },
      "match_score": 87.5,
      "reasoning": "Raka memiliki skill React dan Tailwind yang sangat relevan...",
      "status": "recommended",
      "generated_at": "2026-05-02T08:05:00Z"
    }
  ],
  "ai_matching_status": "completed",
  "ai_matching_generated_at": "2026-05-02T08:05:00Z"
}
```

---

#### `PATCH /api/jobs/:id/status`

**Auth:** wajib. Client hanya bisa update job miliknya sendiri.

**Request body:**
```json
{
  "status": "cancelled",
  "progress_pct": 30,
  "submission_url": "https://drive.google.com/...",
  "submission_notes": "Berikut hasil kerja saya..."
}
```

**Status transitions yang valid:**

| Current Status | New Status | Siapa | Field tambahan |
|---|---|---|---|
| `active` | `cancelled` | client | — |
| `matched` | `in_progress` | client | — |
| `matched` | `cancelled` | client | — |
| `in_progress` | `submitted_for_review` | talent | `submission_url`, `submission_notes` |
| `in_progress` | `cancelled` | client | `progress_pct` |
| `submitted_for_review` | `revision_requested` | client | `revision_notes` |
| `submitted_for_review` | `completed` | client | — (trigger escrow release) |
| `revision_requested` | `submitted_for_review` | talent | `submission_url`, `submission_notes` |

> Semua status transition yang tidak ada di tabel ini harus return `400 Bad Request`.

**Response 200:**
```json
{
  "job": {
    "id": "uuid",
    "status": "cancelled",
    "updated_at": "2026-05-05T14:00:00Z"
  },
  "escrow_action": "refunded",
  "notifications_sent": ["talent_uuid"]
}
```

---

### 13.5 Matching & AI Endpoints

---

#### `POST /api/ai/match-job`

**Auth:** wajib, role `client` (atau dipanggil internal oleh sistem)

**Request body:**
```json
{
  "job_id": "uuid",
  "force_refresh": false
}
```

**Proses internal:**
1. Ambil data job + required_skills dari DB
2. Ambil semua talent_profiles yang categorynya cocok + `availability != 'unavailable'`
3. Untuk setiap talent, ambil skills, bio, cv_text, portfolio_context
4. Bangun payload untuk GPT-4o
5. Panggil OpenAI API
6. Parse JSON response
7. Jika `force_refresh: true`, hapus job_matches lama yang masih `recommended`
8. Insert hasil baru ke `job_matches`
9. Update `skill_gap_analyses.status = 'completed'`
10. Buat notifikasi untuk client

**Payload ke GPT-4o:**
```json
{
  "job": {
    "title": "Landing Page untuk Toko Online",
    "description": "...",
    "required_skills": ["React (mandatory)", "Tailwind (mandatory)", "Figma (optional)"],
    "category": "web_dev",
    "budget_range": "2.000.000 - 2.500.000 IDR"
  },
  "talents": [
    {
      "id": "uuid-raka",
      "name": "Raka Pratama",
      "skills": ["React (intermediate)", "Next.js (intermediate)", "Tailwind (expert)"],
      "category": "web_dev",
      "rate_per_hour": 150000,
      "bio": "Frontend developer 2 tahun pengalaman...",
      "cv_text": "Pengalaman: PT XYZ (2024-2025)...",
      "portfolio_context": "GitHub: raka-dev. Top repos: portfolio-site (JavaScript)..."
    }
  ]
}
```

**System prompt GPT-4o:**
```
Kamu adalah mesin matching profesional untuk platform freelance Indonesia.
Evaluasi kesesuaian setiap talenta terhadap job yang diberikan.
Pertimbangkan: kecocokan skill (wajib vs opsional), level skill, rate vs budget, relevansi pengalaman dari CV dan portofolio.
Jika cv_text tersedia, gunakan sebagai bukti pengalaman nyata.
Jika portfolio_context tersedia, gunakan sebagai validasi kualitas kerja.
Respons HANYA dalam format JSON array. Tidak ada teks lain di luar JSON.
```

**Response 200:**
```json
{
  "job_id": "uuid",
  "matches_created": 4,
  "top_match": {
    "talent_name": "Raka Pratama",
    "match_score": 87.5
  },
  "status": "completed"
}
```

**Response 202 (async — trigger berhasil, processing background):**
```json
{
  "job_id": "uuid",
  "status": "processing",
  "message": "AI matching sedang dijalankan. Hasilnya akan muncul dalam beberapa detik."
}
```

---

#### `POST /api/ai/skill-gap`

**Auth:** wajib, role `talent` (atau dipanggil internal oleh sistem)

**Request body:**
```json
{
  "talent_profile_id": "uuid"
}
```

**Proses internal:**
1. Ambil talent_profile (skills, level, category, bio, cv_text, portfolio_context)
2. Hitung market_demand: query jobs aktif → hitung frekuensi skill yang dibutuhkan
3. Bangun payload untuk GPT-4o
4. Set status `skill_gap_analyses.status = 'processing'`
5. Panggil OpenAI API
6. Parse JSON response
7. Update `is_latest = false` untuk analisis lama
8. Insert analisis baru dengan `status = 'completed'`
9. Buat notifikasi untuk talent

**Payload ke GPT-4o:**
```json
{
  "talent": {
    "skills": ["React (intermediate)", "Next.js (intermediate)", "Tailwind (expert)"],
    "category": "web_dev",
    "level": "intermediate",
    "bio": "Frontend developer 2 tahun pengalaman...",
    "cv_text": "...",
    "portfolio_context": "..."
  },
  "market_demand": [
    { "skill_name": "TypeScript", "frequency_in_jobs": 18, "avg_budget": 3500000 },
    { "skill_name": "React", "frequency_in_jobs": 23, "avg_budget": 2800000 },
    { "skill_name": "UI Testing", "frequency_in_jobs": 11, "avg_budget": 4200000 }
  ]
}
```

**System prompt GPT-4o:**
```
Kamu adalah career advisor AI untuk platform freelance Indonesia.
Analisis kesenjangan skill talenta berdasarkan demand pasar yang tersedia.
Jika cv_text tersedia, gunakan sebagai bukti pengalaman kerja nyata.
Jika portfolio_context tersedia, jadikan sebagai validasi skill yang diklaim.
Prioritaskan bukti konkret di atas self-report.
Berikan maksimal 3 rekomendasi skill yang paling berdampak untuk karir talenta ini.
Respons HANYA dalam format JSON. Tidak ada teks lain di luar JSON.
```

**Response 200:**
```json
{
  "talent_profile_id": "uuid",
  "status": "completed",
  "recommendations_count": 3
}
```

---

#### `PATCH /api/matches/:id/status`

**Auth:** wajib. Talent bisa update match miliknya. Client bisa update match untuk job miliknya.

**Request body:**
```json
{
  "status": "applied",
  "rejection_reason": null
}
```

**Valid transitions:**

| Current | New Status | Siapa | Field |
|---|---|---|---|
| `recommended` | `applied` | talent | — |
| `recommended` | `rejected` | talent | `rejection_reason` (wajib) |
| `applied` | `accepted` | client | — |
| `applied` | `rejected` | client | `rejection_reason` (opsional) |
| `accepted` | `rejected` | talent | `rejection_reason` (wajib) |

**Response 200:**
```json
{
  "match": {
    "id": "uuid",
    "status": "applied",
    "updated_at": "2026-05-03T10:00:00Z"
  },
  "notification_sent": true
}
```

---

### 13.6 Escrow Endpoints

---

#### `POST /api/escrow/hold`

**Auth:** wajib, role `client`

**Request body:**
```json
{
  "job_id": "uuid",
  "talent_user_id": "uuid",
  "amount": 2300000
}
```

**Validasi:**
- Job harus milik client yang login
- Job status harus `matched` (ada talent yang accepted)
- `talent_user_id` harus ada di `job_matches` dengan status `accepted`
- Belum ada escrow aktif untuk job ini

**Proses internal:**
1. Validasi semua kondisi di atas
2. Insert ke `escrow_transactions` dengan `status = 'held'`
3. Hitung `platform_fee = amount * 0.12` (12%)
4. Update job status → `in_progress`
5. Buat notifikasi untuk talent

**Response 201:**
```json
{
  "escrow": {
    "id": "uuid",
    "amount": 2300000,
    "platform_fee": 276000,
    "status": "held",
    "held_at": "2026-05-03T11:00:00Z"
  },
  "job_status": "in_progress"
}
```

---

#### `POST /api/escrow/release`

**Auth:** wajib, role `client`. Hanya pemilik job.

**Request body:**
```json
{
  "job_id": "uuid"
}
```

**Validasi:**
- Escrow harus ada dengan `status = 'held'`
- Job harus `submitted_for_review` atau `completed`

**Proses internal:**
1. Update `escrow_transactions.status = 'released'`, set `released_at`
2. Update job status → `completed`
3. Buat notifikasi untuk talent: "Dana telah dirilis!"

**Response 200:**
```json
{
  "escrow": {
    "id": "uuid",
    "status": "released",
    "released_at": "2026-05-10T15:00:00Z",
    "amount": 2300000,
    "platform_fee": 276000,
    "talent_receives": 2024000
  }
}
```

---

#### `POST /api/escrow/cancel`

**Auth:** wajib, role `client`

**Request body:**
```json
{
  "job_id": "uuid",
  "progress_pct": 30
}
```

**Logika distribusi dana:**
```
if progress_pct <= 25:
  talent_pct = 0, client_refund_pct = 100
elif progress_pct <= 75:
  talent_pct = 50, client_refund_pct = 50
else:
  talent_pct = 100, client_refund_pct = 0
```

**Response 200:**
```json
{
  "escrow": {
    "id": "uuid",
    "status": "refunded",
    "amount": 2300000,
    "talent_receives": 1150000,
    "client_refund": 1150000,
    "progress_pct": 30
  }
}
```

---

### 13.7 Notifications Endpoints

---

#### `GET /api/notifications`

**Auth:** wajib (any role)

**Query params:**
| Param | Default | Keterangan |
|---|---|---|
| `unread_only` | `false` | Jika `true`, hanya return yang belum dibaca |
| `page` | `1` | Pagination |
| `per_page` | `20` | Default 20, maks 50 |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "new_match",
      "message": "Job baru cocok untukmu: Landing Page untuk Toko Online",
      "is_read": false,
      "created_at": "2026-05-02T08:05:00Z",
      "metadata": {
        "job_id": "uuid",
        "match_score": 87.5
      }
    },
    {
      "id": "uuid",
      "type": "skill_gap_ready",
      "message": "Analisis skill gap kamu sudah siap. Lihat rekomendasi.",
      "is_read": true,
      "created_at": "2026-05-01T10:05:00Z",
      "metadata": {}
    }
  ],
  "unread_count": 3,
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 8
  }
}
```

> Field `metadata` berisi data kontekstual per tipe notifikasi untuk deep-link ke halaman yang relevan.

---

#### `PATCH /api/notifications/:id/read`

**Auth:** wajib. Hanya bisa mark notifikasi milik user sendiri.

**Request body:** tidak diperlukan.

**Response 200:**
```json
{
  "id": "uuid",
  "is_read": true
}
```

---

#### `PATCH /api/notifications/read-all`

**Auth:** wajib

**Response 200:**
```json
{
  "updated_count": 5
}
```

---

### 13.8 Skills Master Endpoints

---

#### `GET /api/skills`

**Auth:** tidak diperlukan (public endpoint)

**Query params:**
| Param | Keterangan |
|---|---|
| `category` | Filter by kategori skill |
| `q` | Search by nama skill |

**Response 200:**
```json
{
  "data": [
    { "id": "uuid", "name": "React", "category": "Frontend" },
    { "id": "uuid", "name": "Next.js", "category": "Frontend" },
    { "id": "uuid", "name": "TypeScript", "category": "Frontend" },
    { "id": "uuid", "name": "Tailwind", "category": "Frontend" },
    { "id": "uuid", "name": "Figma", "category": "Design Tool" },
    { "id": "uuid", "name": "Illustrator", "category": "Design Tool" }
  ]
}
```

> Endpoint ini digunakan oleh form onboarding dan filter. Tidak perlu pagination — total skill master untuk MVP tidak akan lebih dari 50 item.

---

## 14. Pagination — Spesifikasi Lengkap

### 14.1 Standar Response Pagination

Semua endpoint list menggunakan struktur pagination yang konsisten:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 12,
    "total": 47,
    "total_pages": 4,
    "has_next": true,
    "has_prev": false
  }
}
```

### 14.2 Default per Halaman

| Endpoint | Default per_page | Maks per_page |
|---|---|---|
| `GET /api/talents` | 12 | 48 |
| `GET /api/jobs` | 12 | 48 |
| `GET /api/notifications` | 20 | 50 |
| `GET /api/jobs/:id` matched_talents | 10 | 20 |

### 14.3 Implementasi Prisma

```typescript
// lib/paginate.ts
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const per_page = Math.min(48, Math.max(1, parseInt(searchParams.get('per_page') || '12')));
  const skip = (page - 1) * per_page;
  return { page, per_page, skip, take: per_page };
}

export function buildPaginationMeta(total: number, page: number, per_page: number) {
  const total_pages = Math.ceil(total / per_page);
  return {
    page,
    per_page,
    total,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}

// Penggunaan:
const { page, per_page, skip, take } = getPaginationParams(searchParams);
const [data, total] = await Promise.all([
  prisma.talent_profiles.findMany({ skip, take, where: filters }),
  prisma.talent_profiles.count({ where: filters }),
]);
return { data, pagination: buildPaginationMeta(total, page, per_page) };
```

---

## 15. Rate Limiting

### 15.1 Batas per Endpoint

| Endpoint | Limit | Window | Scope |
|---|---|---|---|
| `POST /api/auth/register` | 5 request | 15 menit | per IP |
| `POST /api/auth/login` | 10 request | 15 menit | per IP |
| `POST /api/ai/match-job` | 10 request | 1 jam | per user |
| `POST /api/ai/skill-gap` | 5 request | 1 jam | per user |
| `POST /api/talent/upload-cv` | 10 request | 1 jam | per user |
| `GET /api/talents` | 100 request | 1 menit | per IP |
| `GET /api/jobs` | 100 request | 1 menit | per IP |
| Semua endpoint lain | 60 request | 1 menit | per user |

> Untuk MVP: rate limiting tidak wajib diimplementasi penuh. Cukup pastikan AI endpoints punya basic protection agar tidak memboroskan OpenAI quota selama demo.

### 15.2 Response jika Rate Limit Tercapai

```json
HTTP 429 Too Many Requests
{
  "error": "Terlalu banyak permintaan. Coba lagi dalam 30 menit.",
  "retry_after_seconds": 1800
}
```

---

## 16. Prisma Migration Flow

### 16.1 Urutan Migration yang Benar

Jalankan migration dalam urutan ini untuk menghindari foreign key constraint error:

```bash
# Urutan wajib — jangan dibalik
# 1. Base tables (tidak ada FK)
npx prisma migrate dev --name create_skills_table

# 2. Users (tidak ada FK)
npx prisma migrate dev --name create_users_table

# 3. Profiles (FK ke users)
npx prisma migrate dev --name create_talent_profiles_table
npx prisma migrate dev --name create_client_profiles_table

# 4. Skill junction (FK ke talent_profiles + skills)
npx prisma migrate dev --name create_talent_skills_table

# 5. Jobs (FK ke users)
npx prisma migrate dev --name create_jobs_table

# 6. Job skills junction (FK ke jobs + skills)
npx prisma migrate dev --name create_job_required_skills_table

# 7. Matching & AI (FK ke jobs + talent_profiles)
npx prisma migrate dev --name create_job_matches_table
npx prisma migrate dev --name create_skill_gap_analyses_table

# 8. Transactions (FK ke jobs + users)
npx prisma migrate dev --name create_escrow_transactions_table

# 9. Notifications (FK ke users)
npx prisma migrate dev --name create_notifications_table
```

> Untuk development: boleh jalankan semua sekaligus dengan `npx prisma migrate dev --name initial_schema` asalkan `schema.prisma` sudah lengkap dan urutan model benar.

### 16.2 Prisma Schema Lengkap

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model users {
  id                  String    @id @default(uuid())
  email               String    @unique
  password_hash       String
  role                String    // "talent" | "client"
  full_name           String
  avatar_url          String?
  onboarding_complete Boolean   @default(false)
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  talent_profile      talent_profiles?
  client_profile      client_profiles?
  jobs_posted         jobs[]
  notifications       notifications[]
  escrow_as_client    escrow_transactions[] @relation("EscrowClient")
  escrow_as_talent    escrow_transactions[] @relation("EscrowTalent")
}

model talent_profiles {
  id                  String    @id @default(uuid())
  user_id             String    @unique
  bio                 String?
  category            String    // "web_dev" | "graphic_designer"
  rate_per_hour       Decimal?  @db.Decimal(10, 2)
  rate_per_project    Decimal?  @db.Decimal(10, 2)
  availability        String    @default("available")
  location            String?
  portfolio_url       String?
  portfolio_file      String?
  cv_file             String?
  cv_text             String?
  portfolio_context   String?
  created_at          DateTime  @default(now())

  user                users     @relation(fields: [user_id], references: [id])
  talent_skills       talent_skills[]
  job_matches         job_matches[]
  skill_gap_analyses  skill_gap_analyses[]
}

model client_profiles {
  id                  String    @id @default(uuid())
  user_id             String    @unique
  company_name        String?
  industry            String
  company_size        String?
  location            String
  description         String?
  website_url         String?
  created_at          DateTime  @default(now())

  user                users     @relation(fields: [user_id], references: [id])
}

model skills {
  id                  String    @id @default(uuid())
  name                String    @unique
  category            String

  talent_skills       talent_skills[]
  job_required_skills job_required_skills[]
}

model talent_skills {
  id                  String    @id @default(uuid())
  talent_profile_id   String
  skill_id            String
  level               String    // "beginner" | "intermediate" | "expert"

  talent_profile      talent_profiles @relation(fields: [talent_profile_id], references: [id])
  skill               skills          @relation(fields: [skill_id], references: [id])

  @@unique([talent_profile_id, skill_id])
}

model jobs {
  id                  String    @id @default(uuid())
  client_user_id      String
  title               String
  description         String
  category            String
  budget_min          Decimal?  @db.Decimal(12, 2)
  budget_max          Decimal?  @db.Decimal(12, 2)
  deadline            DateTime?
  status              String    @default("active")
  submission_url      String?
  submission_notes    String?
  submitted_at        DateTime?
  created_at          DateTime  @default(now())

  client              users     @relation(fields: [client_user_id], references: [id])
  required_skills     job_required_skills[]
  matches             job_matches[]
  escrow              escrow_transactions?
}

model job_required_skills {
  id                  String    @id @default(uuid())
  job_id              String
  skill_id            String
  is_mandatory        Boolean   @default(true)

  job                 jobs      @relation(fields: [job_id], references: [id])
  skill               skills    @relation(fields: [skill_id], references: [id])
}

model job_matches {
  id                  String    @id @default(uuid())
  job_id              String
  talent_profile_id   String
  match_score         Decimal   @db.Decimal(5, 2)
  reasoning           String
  status              String    @default("recommended")
  rejection_reason    String?
  generated_at        DateTime  @default(now())

  job                 jobs      @relation(fields: [job_id], references: [id])
  talent_profile      talent_profiles @relation(fields: [talent_profile_id], references: [id])
}

model skill_gap_analyses {
  id                  String    @id @default(uuid())
  talent_profile_id   String
  recommended_skills  Json
  status              String    @default("completed")
  generated_at        DateTime  @default(now())
  is_latest           Boolean   @default(true)

  talent_profile      talent_profiles @relation(fields: [talent_profile_id], references: [id])
}

model escrow_transactions {
  id                  String    @id @default(uuid())
  job_id              String    @unique
  client_user_id      String
  talent_user_id      String
  amount              Decimal   @db.Decimal(12, 2)
  platform_fee        Decimal   @db.Decimal(12, 2)
  status              String    @default("held")
  held_at             DateTime?
  released_at         DateTime?

  job                 jobs      @relation(fields: [job_id], references: [id])
  client              users     @relation("EscrowClient", fields: [client_user_id], references: [id])
  talent              users     @relation("EscrowTalent", fields: [talent_user_id], references: [id])
}

model notifications {
  id                  String    @id @default(uuid())
  user_id             String
  type                String
  message             String
  is_read             Boolean   @default(false)
  metadata            Json      @default("{}")
  created_at          DateTime  @default(now())

  user                users     @relation(fields: [user_id], references: [id])
}
```

---

## 17. File Deletion Flow

### 17.1 Kapan File Perlu Dihapus

| Trigger | File yang dihapus | Aksi |
|---|---|---|
| User upload CV baru | CV lama | Hapus dari storage, update `cv_file` URL baru |
| User upload portfolio baru | Portfolio file lama | Hapus dari storage, update `portfolio_file` URL baru |
| User hapus akun (future) | Semua file user | Hapus semua file dari storage, hapus record DB |

### 17.2 Implementasi

```typescript
// lib/storage.ts
export async function deleteFromStorage(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  // Ekstrak public_id dari URL Cloudinary
  // URL format: https://res.cloudinary.com/cloud/image/upload/v123/public_id.pdf
  const publicId = fileUrl.split('/').pop()?.replace('.pdf', '').replace('.zip', '');
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
}

// Dalam upload CV handler:
const existingProfile = await prisma.talent_profiles.findUnique({
  where: { user_id: session.user.id }
});

// Hapus file lama jika ada
if (existingProfile?.cv_file) {
  await deleteFromStorage(existingProfile.cv_file);
}

// Upload file baru
const uploadResult = await uploadToStorage(buffer, `cv_${session.user.id}`);
```

---

## 18. Talent Search by Match (untuk Client)

### 18.1 Konteks

Selain melihat shortlist hasil AI matching per job, client juga perlu bisa mencari talenta secara manual — misalnya untuk melihat apakah ada talenta tertentu yang sesuai sebelum posting job, atau untuk membandingkan talenta di luar shortlist AI.

### 18.2 Endpoint: `GET /api/client/search-talents`

**Auth:** wajib, role `client`

**Query params:**
| Param | Keterangan |
|---|---|
| `job_id` | Opsional. Jika diisi, tampilkan match_score talenta untuk job ini |
| `category` | Filter by kategori |
| `skill` | Multi, filter by skill |
| `max_rate` | Budget filter |
| `availability` | Filter ketersediaan |
| `q` | Search nama / bio |
| `sort` | `match_score_desc` (hanya jika job_id diisi), `rate_asc`, `newest` |

**Response 200 (tanpa job_id):**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Raka Pratama",
      "category": "web_dev",
      "rate_per_hour": 150000,
      "availability": "available",
      "skills": ["React", "Next.js", "Tailwind"],
      "match_score": null
    }
  ],
  "pagination": { "..." }
}
```

**Response 200 (dengan job_id):**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Raka Pratama",
      "category": "web_dev",
      "rate_per_hour": 150000,
      "availability": "available",
      "skills": ["React", "Next.js", "Tailwind"],
      "match_score": 87.5,
      "match_status": "recommended",
      "match_reasoning": "Raka memiliki skill inti yang relevan..."
    }
  ],
  "pagination": { "..." }
}
```

---

## 19. Ringkasan Seluruh Endpoint — Master List

> Master list ini menggabungkan semua endpoint dari PRD MVP v1.2 dan PRD Technical v2.0. Gunakan sebagai checklist implementasi.

### Auth
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Wajib MVP |
| `POST` | `/api/auth/login` | — | Wajib MVP |
| `POST` | `/api/auth/logout` | any | Wajib MVP |

### Talent
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `POST` | `/api/talent/onboarding` | talent | Wajib MVP |
| `GET` | `/api/talent/profile/:id` | — | Wajib MVP |
| `PATCH` | `/api/talent/profile` | talent | Wajib MVP |
| `GET` | `/api/talent/dashboard` | talent | Wajib MVP |
| `GET` | `/api/talent/skill-gap` | talent | Wajib MVP |
| `POST` | `/api/talent/upload-cv` | talent | Wajib MVP |
| `POST` | `/api/talent/upload-portfolio` | talent | Wajib MVP |
| `GET` | `/api/talents` | — | Wajib MVP |

### Client
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `POST` | `/api/client/onboarding` | client | Wajib MVP |
| `GET` | `/api/client/profile` | client | Wajib MVP |
| `PATCH` | `/api/client/profile` | client | Should Have |
| `GET` | `/api/client/dashboard` | client | Wajib MVP |
| `GET` | `/api/client/search-talents` | client | Should Have |

### Jobs
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `POST` | `/api/jobs` | client | Wajib MVP |
| `GET` | `/api/jobs` | — | Wajib MVP |
| `GET` | `/api/jobs/:id` | — | Wajib MVP |
| `PATCH` | `/api/jobs/:id/status` | client/talent | Wajib MVP |

### AI & Matching
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `POST` | `/api/ai/match-job` | client/system | Wajib MVP |
| `POST` | `/api/ai/skill-gap` | talent/system | Wajib MVP |
| `PATCH` | `/api/matches/:id/status` | talent/client | Wajib MVP |

### Escrow
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `POST` | `/api/escrow/hold` | client | Wajib MVP |
| `POST` | `/api/escrow/release` | client | Wajib MVP |
| `POST` | `/api/escrow/cancel` | client | Should Have |

### Notifications
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `GET` | `/api/notifications` | any | Wajib MVP |
| `PATCH` | `/api/notifications/:id/read` | any | Wajib MVP |
| `PATCH` | `/api/notifications/read-all` | any | Should Have |

### Skills Master
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| `GET` | `/api/skills` | — | Wajib MVP |

**Total: 28 endpoints** — 22 Wajib MVP, 6 Should Have.

---

*Nyamby PRD Technical & Flows v2.0 (Lengkap) — Satria Romanda — Digdaya X Hackathon 2026*
*Dokumen ini adalah pelengkap PRD MVP v1.2. Baca bersamaan untuk konteks lengkap.*
