# NYAMBY
## Product Requirements Document
### PRD v4.0 — Cross-Border Expansion (Malaysia-First)

| Versi | 4.0 — Cross-Border Expansion |
|-------|-------------------------------|
| Status | AKTIF — Sprint Backlog |
| Author | Satria Romanda (CPO) |
| Engineer | Akbar Lubis (CTO) |
| Tanggal | Juli 2026 |
| Base Ref | PRD v3.0 + Codebase master (Juli 2026) + Riset Reposisi Cross-Border |
| Keputusan Strategis | Domestik tetap berjalan sebagai basis (tidak dimatikan). Ekspor Malaysia jadi arah ekspansi utama berikutnya. Singapura jadi Phase berikutnya setelah Malaysia tervalidasi. |

---

## 1. Overview & Konteks

Dokumen ini mendefinisikan perubahan teknis yang dibutuhkan agar Nyamby bisa melayani klien Malaysia (dan Singapura di fase berikutnya) tanpa mengorbankan basis klien domestik yang sudah berjalan. Ini BUKAN pivot — model domestik (IDR, klien Indonesia) tetap menjadi mesin utama yang terbukti; ekspor adalah lapisan tambahan di atas produk yang sama, memakai talent pool, AI matching engine, dan escrow yang sudah ada.

**Konfirmasi kunci dari vendor:** Xenith Pay sudah dikonfirmasi bisa menerima pembayaran dari luar negeri — ini menghapus blocker teknis terbesar yang sebelumnya diidentifikasi sebagai risiko kritis di riset reposisi.

| Dimensi | Temuan |
|---------|--------|
| Payment cross-border | ✅ Dikonfirmasi — Xenith Pay mendukung payin dari luar negeri |
| Currency/locale di schema | ❌ Belum ada — seluruh model (`Job`, `EscrowTransaction`, `ClientProfile`, `Payment`) berasumsi IDR |
| UI berbahasa Inggris | ❌ Belum ada — seluruh copy produk saat ini Bahasa Indonesia |
| Trust signal untuk klien asing (KYB ringan) | ❌ Belum ada — `ClientProfile` tidak punya field verifikasi bisnis |
| Smart Pricing versi ekspor (benchmark non-IDR) | ❌ Belum ada — `ai/smart-pricing` saat ini hanya agregasi `ratePerHour` domestik |
| Data rate riil pasar Malaysia | ❌ Belum ada — riset sekunder baru pakai benchmark umum SEA (USD 15–50/jam), belum validasi langsung ke SME Malaysia |
| Akses ke komunitas/SME Malaysia | ❌ Belum ada — perlu dibangun dari nol di fase pilot |

> **Prinsip kerja fase ini:** jangan bangun infrastruktur besar (multi-currency penuh, i18n seluruh aplikasi) sebelum ada validasi permintaan riil dari Malaysia. Sprint 1–2 fokus ke perubahan minimal yang memungkinkan *satu* pilot klien Malaysia bisa dilayani end-to-end. Perluasan penuh menunggu hasil pilot.

---

## 2. Schema Changes

### 2.1 `ClientProfile` — tambahan field

```prisma
model ClientProfile {
  // ...field yang sudah ada tetap
  country            ClientCountry  @default(indonesia) @map("country")
  preferredCurrency  Currency       @default(IDR) @map("preferred_currency")
  businessVerifiedAt DateTime?      @map("business_verified_at")
  businessEmailDomain String?       @map("business_email_domain")
}

enum ClientCountry {
  indonesia
  malaysia
  singapore
  other
}

enum Currency {
  IDR
  MYR
  SGD
  USD
}
```

**Catatan:** `businessVerifiedAt` diisi lewat verifikasi ringan (lihat §3.3), bukan e-KYC penuh. Ini cukup untuk trust signal awal tanpa investasi kepatuhan berat di fase pilot.

### 2.2 `Job` — tambahan field untuk tampilan mata uang

```prisma
model Job {
  // ...field yang sudah ada tetap
  displayCurrency   Currency  @default(IDR) @map("display_currency")
  fxRateAtPosting   Decimal?  @map("fx_rate_at_posting") @db.Decimal(12, 6)
}
```

Budget tetap disimpan dalam IDR (`budgetMin`/`budgetMax` existing) sebagai source of truth untuk perhitungan komisi & escrow — `displayCurrency` + `fxRateAtPosting` hanya untuk render tampilan ke klien asing. Ini menghindari kompleksitas rekonsiliasi multi-currency penuh di escrow.

### 2.3 `Payment` — tambahan field untuk rekonsiliasi

```prisma
model Payment {
  // ...field yang sudah ada tetap
  originCountry     ClientCountry? @map("origin_country")
  originCurrency    Currency?      @map("origin_currency")
}
```

Field ini murni pencatatan (untuk laporan admin & analitik ekspor di §4), tidak mengubah logika settlement yang sudah ada.

---

## 3. Perubahan Endpoint & Flow

### 3.1 Onboarding Klien — tambahan field

`POST /api/client/onboarding` — tambahkan `country` dan `preferredCurrency` ke request body. Jika `country !== indonesia`, tampilkan langkah verifikasi bisnis ringan (§3.3) sebelum onboarding selesai.

### 3.2 Post Job — tampilan currency

`POST /api/jobs` tidak berubah secara struktural (tetap terima budget dalam angka), tapi UI post-job untuk klien non-Indonesia menampilkan input dalam `preferredCurrency` milik klien, lalu backend mengonversi ke IDR memakai `fxRateAtPosting` (ambil dari API kurs pihak ketiga, mis. exchangerate-api atau kurs yang disediakan Xenith) sebelum disimpan sebagai `budgetMin`/`budgetMax`.

### 3.3 Verifikasi Bisnis Ringan (KYB Minimal) — BARU

| Atribut | Detail |
|---------|--------|
| Method | `POST` |
| Path | `/api/client/verify-business` |
| Trigger | Muncul otomatis saat `ClientProfile.country !== indonesia` |
| Langkah verifikasi | (1) Email domain bisnis (bukan gmail/yahoo) — cek otomatis; (2) Nomor telepon terverifikasi OTP; (3) Opsional: link halaman perusahaan (website/LinkedIn) untuk review manual admin |
| Output | `businessVerifiedAt` terisi jika lolos; badge "Klien Terverifikasi" tampil di job posting mereka — meningkatkan kepercayaan talenta untuk accept match dari klien asing baru |

> Ini BUKAN e-KYC penuh (KTP/passport, liveness check) — itu tetap didorong ke Phase 2 seperti sudah direncanakan di PRD v2.0 Patch untuk Physical Mode. Untuk pilot Malaysia, verifikasi ringan ini cukup untuk mengurangi risiko fraud tanpa menambah friction onboarding yang berlebihan.

### 3.4 Smart Pricing — Mode Ekspor

`GET /api/ai/smart-pricing` — tambahkan parameter opsional `?market=export`. Ketika `market=export`, response memakai benchmark rate internasional (bukan agregasi `ratePerHour` talenta domestik yang sample size-nya kecil dan dalam IDR), dengan sumber data awal dari riset sekunder (USD 15–50/jam untuk talenta SEA) sampai ada data riil dari pilot Malaysia.

```json
{
  "success": true,
  "data": {
    "market": "export",
    "category": "web_dev",
    "benchmark": {
      "per_hour_usd": { "min": 15, "max": 50, "median": 28 },
      "source": "estimasi riset sekunder SEA freelance market, belum tervalidasi khusus Malaysia",
      "confidence": "low — akan diperbarui setelah pilot"
    },
    "disclaimer": "Angka ini adalah estimasi awal, bukan data transaksi riil Nyamby. Akan diperbarui otomatis begitu ada cukup data dari job ekspor yang selesai."
  }
}
```

**Penting:** field `disclaimer` wajib ditampilkan di UI, bukan hanya di response API — konsisten dengan prinsip "jangan menggunakan data yang tidak bisa diverifikasi" di panduan submission maupun etika produk secara umum.

### 3.5 Xenith Payin — Konfirmasi Alur Cross-Border

Karena Xenith sudah dikonfirmasi mendukung payin luar negeri, tugas engineering di sini murni memastikan:
1. `webhooks/xenith/payin/route.ts` bisa memproses payload dengan `originCurrency` selain IDR (cek dengan dokumentasi Xenith apakah mereka mengirim field ini, atau perlu di-mapping manual dari `paymentCodeType`).
2. Simpan `originCountry`/`originCurrency` ke `Payment` (§2.3) untuk keperluan pelaporan.
3. **Wajib dilakukan sebelum klaim "export ready" di mana pun (proposal, video, marketing):** jalankan 1 transaksi sandbox dengan simulasi payin dari luar negeri (kalau Xenith sandbox mendukung ini) untuk membuktikan alur benar-benar berfungsi, bukan hanya "dikonfirmasi mendukung secara teori oleh vendor."

### 3.6 Halaman Landing Khusus Klien Ekspor — BARU

Route baru `/global` atau `/export` (Bahasa Inggris) — landing page khusus untuk klien Malaysia/Singapura, isi:
- Value proposition: talenta terverifikasi Indonesia, escrow aman, harga kompetitif vs hire lokal
- Kalkulator perbandingan biaya sederhana (estimasi hemat vs hire freelancer lokal Malaysia — pakai benchmark yang sama seperti §3.4, dengan disclaimer sama)
- CTA: "Post a Job" (bahasa Inggris) yang mengarah ke flow onboarding klien dengan `country` pre-selected non-Indonesia

Tidak perlu translate seluruh aplikasi ke Inggris di fase ini — cukup landing page + flow onboarding + post-job untuk klien asing.

---

## 4. Admin Dashboard — Tambahan Monitoring Ekspor

`GET /api/admin/stats` — tambahkan breakdown baru:

```json
{
  "export": {
    "total_clients_non_id": 0,
    "total_jobs_from_export": 0,
    "gmv_export_idr_equivalent": 0,
    "by_country": { "malaysia": 0, "singapore": 0, "other": 0 }
  }
}
```

Ini penting bukan hanya untuk monitoring internal, tapi juga jadi sumber data konkret untuk klaim "traction" di submission/pitch berikutnya — saat ini datanya nol karena belum ada pilot, tapi struktur pelaporan harus siap sebelum pilot dimulai supaya setiap transaksi pilot pertama langsung terekam.

---

## 5. Roadmap Implementasi

### 5.1 Sprint Plan

| Sprint | Fokus | Item |
|--------|-------|------|
| **Sprint 1 (1 minggu)** | Fondasi data | Schema changes (§2.1–2.3) + migration; tambahkan `country`/`preferredCurrency` ke form onboarding klien |
| **Sprint 2 (1 minggu)** | Trust & display | Verifikasi bisnis ringan (§3.3); tampilan currency di post-job (§3.2); halaman `/global` (§3.6) |
| **Sprint 3 (1 minggu)** | Payment & pricing | Validasi & uji sandbox payin cross-border Xenith (§3.5); Smart Pricing mode ekspor (§3.4) |
| **Sprint 4 (ongoing)** | Pilot & validasi pasar | Admin export stats (§4); mulai outreach manual ke 5–10 SME Malaysia (lewat komunitas/LinkedIn/referral) untuk pilot job pertama; kumpulkan data rate riil untuk menggantikan benchmark estimasi di §3.4 |

### 5.2 Dependency Map

1. Schema changes (§2) — *blocking* untuk semua item lain, kerjakan lebih dulu.
2. Verifikasi bisnis ringan (§3.3) — independen, bisa paralel dengan §3.2.
3. Uji sandbox Xenith cross-border (§3.5) — *blocking* sebelum pilot pertama dijalankan dengan uang sungguhan.
4. Outreach pilot Malaysia (§5.1 Sprint 4) — baru mulai setelah §3.3 dan §3.5 selesai, supaya klien pilot pertama mendapat pengalaman yang sudah aman & terverifikasi.

### 5.3 Checklist Sebelum Klaim "Export Ready" di Proposal/Pitch

- [ ] Schema currency/locale ter-deploy dan teruji
- [ ] Minimal 1 transaksi sandbox payin cross-border berhasil disimulasikan lewat Xenith
- [ ] Halaman `/global` live dan bisa diakses publik
- [ ] Verifikasi bisnis ringan berfungsi (email domain check + OTP)
- [ ] Disclaimer benchmark rate tampil di UI Smart Pricing mode ekspor
- [ ] Admin export stats menampilkan angka (meski masih nol) — bukan error/kosong

---

## 6. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Klaim "Xenith mendukung payin luar negeri" belum diuji langsung di sandbox | Wajibkan uji sandbox nyata sebelum submission/video menyebut fitur ini sebagai "berfungsi" — bedakan "dikonfirmasi vendor" vs "teruji tim sendiri" di narasi manapun |
| Belum ada kontak SME Malaysia — outreach pilot bisa lebih lambat dari estimasi | Mulai dari channel yang sudah divalidasi cocok untuk talenta Indonesia (komunitas, referral, LinkedIn organik) alih-alih menunggu partnership formal |
| Benchmark rate ekspor masih estimasi sekunder, bisa meleset jauh dari realita Malaysia | Tampilkan disclaimer eksplisit di produk (§3.4), perbarui begitu ada 3–5 transaksi riil |
| Menambah kompleksitas (currency, i18n parsial, KYB) berisiko mengganggu stabilitas fitur domestik yang sudah jalan | Semua perubahan schema bersifat *additive* (kolom baru, default value aman), tidak mengubah logika existing untuk klien domestik — jalankan regression test pada flow domestik setelah tiap sprint |

---

*Nyamby — PRD v4.0 | Cross-Border Expansion (Malaysia-First) | Satria Romanda (CPO) | Juli 2026 | Confidential — Internal Document*
