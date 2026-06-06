<p align="center">
  <img src="docs/Logo%20Nyamby%20Full.svg" alt="Nyamby Logo" width="320" />
</p>

> **AI Talent Matching Platform** — mempertemukan talenta Indonesia dengan client melalui AI matching, escrow, dan workflow end-to-end.
>
> Built for **Hackathon Digdaya X 2026** | [Live Demo →](https://nyamby.akbarhlubis.duckdns.org)

![Version](https://img.shields.io/badge/version-v1.2.0-blue)
![Status](https://img.shields.io/badge/status-MVP%20Complete-brightgreen)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## ✨ Fitur

### Untuk Talenta
- **AI Skill Gap Analysis** — rekomendasi 3 skill prioritas berdasarkan CV & portfolio
- **AI Job Matching** — dapatkan match score personal untuk setiap job
- **Dashboard** — job rekomendasi, skill gap card, job aktif
- **Apply Job** — lamar langsung dari dashboard dengan 1 klik
- **Submit Deliverable** — upload hasil kerja, terima feedback client

### Untuk Client
- **Post Job** — judul, deskripsi, required skills, budget, deadline
- **AI Talent Matching** — ranked shortlist dengan reasoning per talenta
- **Dashboard** — kelola job, lihat matched talents
- **Escrow** — dana ditahan aman, rilis setelah approve

### Kedua Role
- **In-App Notifications** — bell badge + toast real-time (10 tipe trigger)
- **Public Browsing** — `/jobs` dan `/talents` aksesibel tanpa login
- **Dispute System** — ticket dispute dengan status tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| AI Engine | DeepSeek Chat (primary) / GPT-4o (fallback) |
| Auth | Session-based (iron-session) |
| Deployment | Virtual Private Server|

---

## 🚀 Getting Started

### Prasyarat

- Node.js 18+
- PostgreSQL
- API key AI (DeepSeek atau OpenAI)

### Setup

```bash
# Clone repo
git clone https://github.com/satriaromanda/nyamby.git
cd nyamby

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Isi DATABASE_URL, AI_API_KEY, SESSION_SECRET di .env

# Setup database
npx prisma db push
npx prisma db seed

# Run dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Talenta (Dev) | raka@nyamby.id | password123 |
| Talenta (Designer) | sari@nyamby.id | password123 |
| Client | budi@nyamby.id | password123 |

---

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # Route handlers (auth, ai, jobs, matches, escrow, etc.)
│   ├── talent/           # Talent pages (dashboard, onboarding, profile, settings)
│   ├── client/           # Client pages (dashboard, onboarding, post-job, escrow, settings)
│   ├── jobs/             # Public job listing & detail
│   ├── talents/          # Public talent directory & profile
│   ├── how-it-works/     # How It Works page
│   ├── fitur/            # Feature detail pages
│   ├── login/ & register/ # Auth pages
│   └── page.tsx          # Landing page
├── components/           # Shared UI components
├── lib/                  # Core logic (auth, openai, prisma, enrichment, validations)
└── middleware.ts         # Auth middleware & route protection
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Demo data seeder
docs/                     # PRD, technical flows, API spec
```

---

## 📋 PRD & Docs

- [PRD v1.2](docs/Nyamby_PRD_MVP_v1.2.md) — Product requirements lengkap
- [Technical Flows](docs/Nyamby_PRD_Technical_Flows_v2.0.md) — Detail flow teknis
- [API Spec](docs/api-spec.json) — OpenAPI specification
- [Schema](docs/schema.json) — Database schema reference

---

## 🔖 Version History

| Version | Date | Highlights |
|---------|------|-----------|
| **v1.2.0** | 2026-06-06 | MVP Complete — semua Layer 1 + Workflow v1.2 + 8 bug fixes |
| v1.1.0 | — | CV/Portfolio upload, public flows, design system |
| v1.0.0 | — | Core MVP: Auth, Onboarding, AI matching, Dashboard, Escrow |

---

## 👤 Author

**Satrio Romanda** — [GitHub](https://github.com/satriaromanda)

---

## 📄 License

Private — Hackathon Digdaya X 2026
