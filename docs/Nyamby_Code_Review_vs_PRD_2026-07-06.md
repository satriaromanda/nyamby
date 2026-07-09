# Nyamby — Code Review vs PRD (2026-07-06)

Review implementasi (`src/`, `prisma/schema.prisma`) terhadap seluruh dokumen PRD di `docs/`:
`PRD.md` (v1.0), `Nyamby_PRD_MVP_v1.2.md`, `Nyamby_PRD_Technical_Flows_v2.0.md`,
`Nyamby_PRD_v2.0_Patch_dan_Kelanjutan.md`, `Nyamby_PRD_v3.0_Missing_Features_dan_Admin.md`,
`Nyamby_PRD_v4.0_CrossBorder_Malaysia_Expansion.md`, `api-spec.json`, `schema.json`.

## Ringkasan Eksekutif

| Versi PRD | Status |
|---|---|
| v1.0 / v1.2 MVP | **Selesai.** Semua 9 tabel inti, auth, onboarding hybrid, browse publik, AI matching, mock→real escrow, notifikasi, status lifecycle — semua ada di kode. |
| v2.0 Technical Flows | **Selesai.** Middleware guard, RBAC, CV/portfolio pipeline, cancel-job split, pagination, validasi Zod — semua terimplementasi. |
| v2.0 Patch (FIX-001..008) | **Mayoritas selesai**, 1 fix regresi (lihat Temuan #1). JWT_SECRET sudah wajib (tidak ada fallback), `.env.example` ada, match_score divalidasi. Model AI default masih `deepseek-chat`, bukan GPT-4o (Temuan #4). |
| v3.0 Missing Features & Admin | **Selesai.** Dispute, rating, portfolio analyzer, smart-pricing, feedback-stats, admin dashboard — endpoint semua ada sesuai spec. |
| v4.0 Cross-Border | **Parsial.** Skema (country/currency/fx) & smart-pricing export mode ada, tapi KYB minimal belum penuh (Temuan #3) dan landing `/global` punya bug UI (Temuan #5). |

Catatan stack: PRD menyebut **NextAuth.js** sebagai auth library, tapi implementasi aktual pakai JWT custom (`jose`) tanpa dependency `next-auth` sama sekali. Bukan bug, tapi dokumentasi PRD sudah tidak sinkron dengan kode — sebaiknya PRD diupdate biar tidak menyesatkan kontributor baru.

## Temuan Teknis

### 1. Re-match job menghapus match yang sudah `accepted`/`applied` — merusak auto-release & payout
**File:** `src/services/ai-matching.ts:92`

```ts
await tx.jobMatch.deleteMany({ where: { jobId } });
```

`runAiJobMatching` dipanggil baik saat job pertama kali dibuat (`src/app/api/jobs/route.ts:84`) maupun saat re-match manual (`src/app/api/ai/match-job/route.ts:33`). PRD Technical Flows v2.0 (§ Re-match Flow) eksplisit: re-match harus **menghapus match berstatus `recommended` saja, mempertahankan `applied`/`accepted`**. Kode ini menghapus *seluruh* `JobMatch` milik job tanpa filter status.

**Skenario gagal:** Client sudah punya talent `accepted` di sebuah job (job `in_progress`), lalu trigger re-match (mis. lewat tombol refresh di dashboard, atau job update yang memicu `POST /api/ai/match-job` lagi). Baris `deleteMany` menghapus row `JobMatch` yang statusnya `accepted` itu. Akibatnya:
- `GET /api/cron/auto-release` (`src/app/api/cron/auto-release/route.ts:45-61`) query `jobMatches: { where: { status: "accepted" } }` — jadi kosong, job ini **tidak akan pernah auto-release**, dana macet di escrow selamanya.
- Talent yang sudah diterima kehilangan histori match tanpa notifikasi.

Fix: filter `deleteMany({ where: { jobId, status: "recommended" } })`, atau skip re-match total kalau sudah ada match `accepted`.

### 2. Tombol OAuth di halaman register murni dekoratif — tidak ada handler
**File:** `src/app/register/page.tsx:76-90`

Tombol "Google" dan "GitHub" (`<button type="button">`) tidak punya `onClick` maupun integrasi backend (tidak ada dependency OAuth di `package.json`, tidak ada endpoint callback). User yang klik tombol ini tidak terjadi apa-apa — terlihat seperti bug ("kenapa gak jalan?") padahal memang belum diimplementasi.

**Rekomendasi:** hapus dulu tombolnya sampai OAuth beneran ada, atau kasih label "Segera Hadir" + disabled state, biar gak menyesatkan dan merusak kepercayaan di halaman pertama funnel registrasi.

### 3. KYB "light" cross-border cuma cek domain email, OTP telepon (wajib di PRD v4.0 §3.3) tidak ada
**File:** `src/app/api/client/verify-business/route.ts:30-46`

PRD v4.0 §3.3 spesifikasi light KYB: **email domain check + OTP verifikasi nomor telepon** + opsional link website untuk review manual. Endpoint yang ada cuma langkah domain check (tolak provider gratis) lalu langsung set `businessVerifiedAt`. Tidak ada field/endpoint OTP phone di manapun (`schema.prisma` juga tidak punya kolom OTP/phone verified).

**Dampak:** klien luar negeri bisa dapat badge "Verified Client" hanya dengan email kantor palsu/typosquat domain, tanpa verifikasi telepon nyata — melemahkan trust signal yang jadi selling point ekspansi Malaysia/Singapura.

### 4. Default model AI masih `deepseek-chat`, PRD minta GPT-4o (FIX-004 belum ditutup)
**File:** `src/lib/openai.ts:7`

```ts
const aiModel = process.env.AI_MODEL || "deepseek-chat";
```

PRD v2.0 Patch FIX-004 minta test kualitas output pakai GPT-4o untuk 3 skenario demo sebelum dianggap selesai. Default env masih DeepSeek. Bukan blocker teknis (kode support model apapun lewat `AI_MODEL`), tapi kalau `.env` production belum di-override, kualitas matching/skill-gap yang didemokan ke stakeholder tidak sesuai spec asli. Perlu konfirmasi `.env` production, dan idealnya di-lock lewat validasi startup (warn kalau `AI_MODEL` tidak diset eksplisit).

### 5. Halaman `/global` bikin navbar custom sendiri — tidak reuse `Navbar` bersama, dan tidak responsive
**File:** `src/app/global/page.tsx:128-148`

Semua halaman lain (`/`, `/talents`, `/fitur/career-path`, dst) pakai `src/components/layout/Navbar.tsx` yang punya hamburger menu mobile. Halaman `/global` (landing ekspansi cross-border, PRD v4.0) menulis ulang nav-nya sendiri dari nol tanpa breakpoint mobile:

```tsx
<div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
  ...badge "GLOBAL"...
  <Link href="/login" className="text-sm ...">Sign In</Link>
  <Link href="/register?...">Post a Job — Free</Link>
```

Di viewport sempit (~350-375px, HP kelas menengah umum di target pasar Malaysia/Indonesia), teks "Sign In" bertabrakan visual dengan badge "GLOBAL" karena tidak ada collapse ke hamburger menu seperti navbar lain — dikonfirmasi lewat screenshot preview browser. Ini halaman landing untuk pasar ekspor yang justru paling butuh kesan profesional, tapi paling buruk fidelity-nya di mobile.

**Fix:** ganti ke komponen `Navbar` bersama (tambah prop varian badge "GLOBAL" kalau perlu), jangan duplikasi markup.

### 6. Inkonsistensi nama brand: "AyoNyamby" muncul di copy padahal brand resmi "Nyamby"
**File:** `src/app/fitur/career-path/page.tsx:23`

```
AyoNyamby membantu memetakan langkah konkret untuk mencapai tujuanmu.
```

Semua halaman lain pakai "Nyamby" (lihat landing, footer, dsb). Kemungkinan sisa nama draft lama ("AyoNyamby MVP" — nama folder project). Detail kecil tapi kelihatan tidak niat kalau ketangkap user/investor pas baca halaman fitur unggulan.

### 7. Halaman `/fitur/career-path` menjual fitur yang belum ada endpoint-nya sama sekali
**File:** `src/app/fitur/career-path/page.tsx`

Copy halaman menjanjikan: "AI kami menganalisis tren industri dan data ribuan profesional sukses untuk merancang peta jalan karier", "Milestone yang terukur", "Estimasi gaji di setiap level". Dari inventory 52 route API, **tidak ada** endpoint career-path/roadmap AI apa pun (yang ada: skill-gap, portfolio-analyzer, smart-pricing — beda fitur). Halaman ini murni marketing tanpa produk di baliknya (vaporware), berisiko jadi dispute/kekecewaan user begitu diklik dari landing/menu fitur.

**Rekomendasi:** kasih label jelas "Coming Soon" / pindahkan ke roadmap, atau prioritaskan build fitur ini kalau memang mau dipromosikan sekarang.

## Rekomendasi "Lebih Menarik" (UI/UX & Marketing)

- **Prioritas tinggi:** fix Temuan #1 (re-match data loss) — ini bug fungsional, bukan sekadar kosmetik, langsung pengaruh ke uang macet di escrow.
- **Kepercayaan produk:** copy di halaman fitur (`/fitur/*`) sebaiknya jujur soal status (live vs coming soon) — saat ini beberapa halaman (`career-path`, kemungkinan `physical-mode`) menjual fitur yang belum built, resiko rusak trust begitu dicoba.
- **Konsistensi navbar/brand:** satukan semua landing page (termasuk `/global`) pakai satu `Navbar`/`Footer` komponen, satu nama brand ("Nyamby" saja), biar terasa satu produk bukan tempelan halaman demi halaman.
- **CTA OAuth:** rapikan elemen yang terlihat interaktif tapi mati (tombol Google/GitHub) — user pertama kali kontak dengan produk di halaman register, elemen mati di situ merusak kesan pertama.
- **Cross-border trust signal:** karena target market v4.0 adalah klien asing yang belum kenal brand lokal, KYB yang cuma "cek domain email" (Temuan #3) itu murah dibobol — pertimbangkan minimal tambahkan indikator "verifikasi manual pending" di badge biar tidak overclaim, sambil OTP phone menyusul.

## Prioritas Next Step

1. Fix `deleteMany` re-match (Temuan #1) — bug fungsional & duit macet.
2. Rapikan tombol OAuth register (Temuan #2) — cepat, dampak first-impression besar.
3. Fix brand copy "AyoNyamby" → "Nyamby" (Temuan #6) — trivial, cepat.
4. Konsolidasi navbar `/global` ke komponen bersama + fix mobile (Temuan #5).
5. Putuskan status halaman `/fitur/career-path` (build atau "coming soon") (Temuan #7).
6. Konfirmasi `AI_MODEL` production + tambah OTP phone ke KYB kalau mau klaim "verified" beneran (Temuan #4, #3).
