import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Seed Skills ──────────────────────────────────────────────────────────

  const webDevSkills = [
    { name: "HTML/CSS", category: "Frontend" },
    { name: "JavaScript", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Vue.js", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Express.js", category: "Backend" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "REST API", category: "Backend" },
    { name: "Git", category: "DevOps" },
  ];

  const designSkills = [
    { name: "Figma", category: "Design Tool" },
    { name: "Adobe Illustrator", category: "Design Tool" },
    { name: "Adobe Photoshop", category: "Design Tool" },
    { name: "Canva", category: "Design Tool" },
    { name: "UI/UX Design", category: "Design" },
    { name: "Brand Identity", category: "Design" },
    { name: "Motion Graphics", category: "Design" },
    { name: "Adobe XD", category: "Design Tool" },
  ];

  const allSkills = [...webDevSkills, ...designSkills];
  const createdSkills: Record<string, string> = {};

  for (const skill of allSkills) {
    const s = await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
    createdSkills[skill.name] = s.id;
  }

  console.log(`✅ Seeded ${allSkills.length} skills`);

  // ─── Seed Demo Users ──────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash("password123", 10);

  // Talent: Raka
  const raka = await prisma.user.upsert({
    where: { email: "raka@demo.com" },
    update: { onboardingComplete: true },
    create: {
      email: "raka@demo.com",
      passwordHash,
      role: "talent",
      fullName: "Raka Pratama",
      avatarUrl: null,
      onboardingComplete: true,
    },
  });

  const rakaProfile = await prisma.talentProfile.upsert({
    where: { userId: raka.id },
    update: {},
    create: {
      userId: raka.id,
      bio: "Web developer dengan 2 tahun pengalaman di React dan Next.js. Passionate tentang clean code dan user experience yang baik.",
      category: "web_dev",
      ratePerHour: 75000,
      ratePerProject: 2000000,
      availability: "available",
      location: "Bandung",
      portfolioUrl: "https://github.com/raka-demo",
      cvFile: "raka-cv-demo.pdf",
      cvText: "Raka Pratama - Web Developer. Pengalaman 2 tahun membangun landing page, dashboard, dan aplikasi Next.js untuk UMKM. Terbiasa React, Tailwind CSS, Git, dan integrasi REST API.",
      portfolioContext: "GitHub portfolio raka-demo: project landing page UMKM, dashboard analytics, dan komponen React reusable. Bukti penggunaan Next.js, Tailwind CSS, dan REST API.",
    },
  });

  // Assign skills to Raka
  const rakaSkillMap = [
    { name: "HTML/CSS", level: "expert" as const },
    { name: "JavaScript", level: "expert" as const },
    { name: "React", level: "expert" as const },
    { name: "Next.js", level: "intermediate" as const },
    { name: "Tailwind CSS", level: "intermediate" as const },
    { name: "Git", level: "intermediate" as const },
    { name: "Node.js", level: "beginner" as const },
  ];

  for (const sk of rakaSkillMap) {
    await prisma.talentSkill.upsert({
      where: {
        talentProfileId_skillId: {
          talentProfileId: rakaProfile.id,
          skillId: createdSkills[sk.name],
        },
      },
      update: {},
      create: {
        talentProfileId: rakaProfile.id,
        skillId: createdSkills[sk.name],
        level: sk.level,
      },
    });
  }

  // Talent 2: Sari (Designer)
  const sari = await prisma.user.upsert({
    where: { email: "sari@demo.com" },
    update: { onboardingComplete: true },
    create: {
      email: "sari@demo.com",
      passwordHash,
      role: "talent",
      fullName: "Sari Wulandari",
      avatarUrl: null,
      onboardingComplete: true,
    },
  });

  const sariProfile = await prisma.talentProfile.upsert({
    where: { userId: sari.id },
    update: {},
    create: {
      userId: sari.id,
      bio: "Graphic designer spesialis brand identity dan UI/UX. Berpengalaman menangani 20+ proyek UMKM.",
      category: "graphic_designer",
      ratePerHour: 85000,
      ratePerProject: 2500000,
      availability: "available",
      location: "Jakarta",
      portfolioUrl: "https://behance.net/sari-demo",
      cvFile: "sari-cv-demo.pdf",
      cvText: "Sari Wulandari - Graphic Designer. Pengalaman menangani brand identity dan UI/UX untuk 20+ proyek UMKM, termasuk logo, social media kit, dan prototype Figma.",
      portfolioContext: "Behance portfolio sari-demo: brand identity, Figma prototype, UI kit, dan desain campaign untuk UMKM.",
    },
  });

  const sariSkillMap = [
    { name: "Figma", level: "expert" as const },
    { name: "Adobe Illustrator", level: "expert" as const },
    { name: "Adobe Photoshop", level: "intermediate" as const },
    { name: "UI/UX Design", level: "expert" as const },
    { name: "Brand Identity", level: "intermediate" as const },
    { name: "Canva", level: "beginner" as const },
  ];

  for (const sk of sariSkillMap) {
    await prisma.talentSkill.upsert({
      where: {
        talentProfileId_skillId: {
          talentProfileId: sariProfile.id,
          skillId: createdSkills[sk.name],
        },
      },
      update: {},
      create: {
        talentProfileId: sariProfile.id,
        skillId: createdSkills[sk.name],
        level: sk.level,
      },
    });
  }

  // Talent 3: Andi (Web Dev)
  const andi = await prisma.user.upsert({
    where: { email: "andi@demo.com" },
    update: { onboardingComplete: true },
    create: {
      email: "andi@demo.com",
      passwordHash,
      role: "talent",
      fullName: "Andi Setiawan",
      avatarUrl: null,
      onboardingComplete: true,
    },
  });

  const andiProfile = await prisma.talentProfile.upsert({
    where: { userId: andi.id },
    update: {},
    create: {
      userId: andi.id,
      bio: "Full-stack developer dengan keahlian di Vue.js dan Node.js. Suka mengerjakan proyek SaaS dan dashboard.",
      category: "web_dev",
      ratePerHour: 100000,
      ratePerProject: 3500000,
      availability: "busy",
      location: "Surabaya",
      portfolioUrl: "https://github.com/andi-demo",
      cvFile: "andi-cv-demo.pdf",
      cvText: "Andi Setiawan - Full-stack developer. Pengalaman Vue.js, Node.js, REST API, PostgreSQL, dan dashboard SaaS.",
      portfolioContext: "GitHub portfolio andi-demo: SaaS dashboard, REST API service, dan integrasi PostgreSQL dengan Node.js.",
    },
  });

  const andiSkillMap = [
    { name: "HTML/CSS", level: "expert" as const },
    { name: "JavaScript", level: "expert" as const },
    { name: "TypeScript", level: "intermediate" as const },
    { name: "Vue.js", level: "expert" as const },
    { name: "Node.js", level: "expert" as const },
    { name: "Express.js", level: "intermediate" as const },
    { name: "PostgreSQL", level: "intermediate" as const },
    { name: "REST API", level: "expert" as const },
    { name: "Git", level: "expert" as const },
  ];

  for (const sk of andiSkillMap) {
    await prisma.talentSkill.upsert({
      where: {
        talentProfileId_skillId: {
          talentProfileId: andiProfile.id,
          skillId: createdSkills[sk.name],
        },
      },
      update: {},
      create: {
        talentProfileId: andiProfile.id,
        skillId: createdSkills[sk.name],
        level: sk.level,
      },
    });
  }

  // Client: Budi
  const budi = await prisma.user.upsert({
    where: { email: "budi@demo.com" },
    update: { onboardingComplete: true },
    create: {
      email: "budi@demo.com",
      passwordHash,
      role: "client",
      fullName: "Budi Santoso",
      avatarUrl: null,
      onboardingComplete: true,
    },
  });

  // Client profile — wajib ada supaya verify-business, refund payout, dan
  // cross-border flow bisa dites langsung dari akun demo.
  await prisma.clientProfile.upsert({
    where: { userId: budi.id },
    update: {},
    create: {
      userId: budi.id,
      companyName: "PT Karya Digital Indonesia",
      industry: "tech",
      companySize: "11-50",
      location: "Jakarta",
      description: "Perusahaan pengembangan produk digital untuk UMKM.",
      websiteUrl: "https://karyadigital.co.id",
      bankCode: "BCA",
      bankAccount: "8880012345",
      bankAccountName: "PT Karya Digital Indonesia",
      country: "indonesia",
      preferredCurrency: "IDR",
    },
  });

  // Admin: Nyamby Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@ayonyamby.com" },
    update: { onboardingComplete: true },
    create: {
      email: "admin@ayonyamby.com",
      passwordHash,
      role: "admin",
      fullName: "Nyamby Admin",
      avatarUrl: null,
      onboardingComplete: true,
    },
  });

  console.log("✅ Seeded demo users: Raka (talent), Sari (talent), Andi (talent), Budi (client), Admin (admin)");
  console.log("   All demo accounts use password: password123");

  // ─── Seed Demo Jobs ───────────────────────────────────────────────────────

  const job1 = await prisma.job.create({
    data: {
      clientUserId: budi.id,
      title: "Landing Page UMKM Fashion Batik",
      description: "Butuh landing page profesional untuk brand batik lokal. Desain sudah ada (Figma), tinggal convert ke Next.js + Tailwind. Target selesai 2 minggu.",
      category: "web_dev",
      budgetMin: 1500000,
      budgetMax: 3000000,
      status: "active",
      requiredSkills: {
        create: [
          { skillId: createdSkills["HTML/CSS"], isMandatory: true },
          { skillId: createdSkills["React"], isMandatory: true },
          { skillId: createdSkills["Next.js"], isMandatory: true },
          { skillId: createdSkills["Tailwind CSS"], isMandatory: true },
        ],
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      clientUserId: budi.id,
      title: "Dashboard Analytics Internal",
      description: "Buat dashboard internal untuk monitoring penjualan bulanan. Data dari REST API, tampilkan chart dan tabel. Butuh pengalaman Next.js + TypeScript.",
      category: "web_dev",
      budgetMin: 5000000,
      budgetMax: 8000000,
      status: "active",
      requiredSkills: {
        create: [
          { skillId: createdSkills["React"], isMandatory: true },
          { skillId: createdSkills["TypeScript"], isMandatory: true },
          { skillId: createdSkills["Next.js"], isMandatory: true },
          { skillId: createdSkills["REST API"], isMandatory: true },
          { skillId: createdSkills["Node.js"], isMandatory: false },
        ],
      },
    },
  });

  const job3 = await prisma.job.create({
    data: {
      clientUserId: budi.id,
      title: "Integrasi Payment Gateway Midtrans",
      description: "Integrasi Midtrans ke aplikasi Next.js yang sudah ada. Frontend checkout page + backend webhook handler. Wajib pengalaman payment gateway Indonesia.",
      category: "web_dev",
      budgetMin: 3000000,
      budgetMax: 5000000,
      status: "active",
      requiredSkills: {
        create: [
          { skillId: createdSkills["React"], isMandatory: true },
          { skillId: createdSkills["Next.js"], isMandatory: true },
          { skillId: createdSkills["Node.js"], isMandatory: true },
          { skillId: createdSkills["REST API"], isMandatory: true },
          { skillId: createdSkills["PostgreSQL"], isMandatory: false },
        ],
      },
    },
  });

  const job4 = await prisma.job.create({
    data: {
      clientUserId: budi.id,
      title: "Desain Logo & Brand Identity Kopi Lokal",
      description: "Brand kopi specialty baru butuh logo, color palette, dan basic brand guidelines. Style: modern, minimalis, earthy tone. Portfolio brand identity wajib.",
      category: "graphic_designer",
      budgetMin: 2000000,
      budgetMax: 3500000,
      status: "active",
      requiredSkills: {
        create: [
          { skillId: createdSkills["Figma"], isMandatory: true },
          { skillId: createdSkills["Adobe Illustrator"], isMandatory: true },
          { skillId: createdSkills["Brand Identity"], isMandatory: true },
          { skillId: createdSkills["UI/UX Design"], isMandatory: false },
        ],
      },
    },
  });

  const job5 = await prisma.job.create({
    data: {
      clientUserId: budi.id,
      title: "Social Media Kit Bulanan — 12 Post",
      description: "Butuh 12 desain post Instagram per bulan untuk brand skincare. Template Canva/Figma, deliver tiap minggu 3 post. Ada brand guidelines existing.",
      category: "graphic_designer",
      budgetMin: 1500000,
      budgetMax: 2500000,
      status: "active",
      requiredSkills: {
        create: [
          { skillId: createdSkills["Figma"], isMandatory: true },
          { skillId: createdSkills["Canva"], isMandatory: true },
          { skillId: createdSkills["Adobe Photoshop"], isMandatory: false },
          { skillId: createdSkills["UI/UX Design"], isMandatory: false },
        ],
      },
    },
  });

  const job6 = await prisma.job.create({
    data: {
      clientUserId: budi.id,
      title: "Redesign UI/UX Aplikasi Mobile Fintech",
      description: "Redesign total UI/UX aplikasi mobile fintech. Deliver: wireframe, prototype interaktif Figma, dan UI kit. Riset user sudah ada, tinggal eksekusi desain.",
      category: "graphic_designer",
      budgetMin: 8000000,
      budgetMax: 12000000,
      status: "active",
      requiredSkills: {
        create: [
          { skillId: createdSkills["Figma"], isMandatory: true },
          { skillId: createdSkills["UI/UX Design"], isMandatory: true },
          { skillId: createdSkills["Adobe Illustrator"], isMandatory: false },
          { skillId: createdSkills["Adobe Photoshop"], isMandatory: false },
        ],
      },
    },
  });

  console.log("✅ Seeded 6 demo jobs (3 web_dev + 3 graphic_designer)");

  // Trigger AI matching for all seed jobs
  console.log("🤖 Triggering AI matching for seed jobs...");
  for (const job of [job1, job2, job3, job4, job5, job6]) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/ai/match-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id, force_refresh: true }),
      });
    } catch (e) {
      console.warn(`  ⚠️ Could not trigger AI for job ${job.title}`);
    }
  }
  console.log("✅ AI matching triggered for all jobs");

  // ─── Seed Skill Gap Analysis for demo talents ─────────────────────────────

  await prisma.skillGapAnalysis.create({
    data: {
      talentProfileId: rakaProfile.id,
      recommendedSkills: [
        {
          skill_name: "TypeScript",
          priority: "high",
          reason: "Muncul di 23 dari 30 job aktif di kategorimu. Employer semakin menuntut type safety.",
          estimated_impact: "Potensi rate naik 30–40%",
        },
        {
          skill_name: "Jest / Testing",
          priority: "medium",
          reason: "12 job membutuhkan pengalaman testing. Unit test menunjukkan profesionalisme tinggi.",
          estimated_impact: "Peluang diterima naik 25%",
        },
        {
          skill_name: "Docker & CI/CD",
          priority: "low",
          reason: "5 job enterprise membutuhkan deployment knowledge. Menambah nilai di proyek skala besar.",
          estimated_impact: "Akses ke proyek enterprise dengan budget 2x lipat",
        },
      ],
      summary:
        "Skill kamu sudah solid untuk entry level web development. Pasar saat ini sangat menuntut TypeScript dan testing knowledge. Menambah kedua skill ini akan meningkatkan match rate kamu secara signifikan.",
      isLatest: true,
    },
  });

  console.log("✅ Seeded skill gap analysis for Raka");
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
