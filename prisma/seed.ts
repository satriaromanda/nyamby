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
    update: {},
    create: {
      email: "raka@demo.com",
      passwordHash,
      role: "talent",
      fullName: "Raka Pratama",
      avatarUrl: null,
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
    update: {},
    create: {
      email: "sari@demo.com",
      passwordHash,
      role: "talent",
      fullName: "Sari Wulandari",
      avatarUrl: null,
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
    update: {},
    create: {
      email: "andi@demo.com",
      passwordHash,
      role: "talent",
      fullName: "Andi Setiawan",
      avatarUrl: null,
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
  await prisma.user.upsert({
    where: { email: "budi@demo.com" },
    update: {},
    create: {
      email: "budi@demo.com",
      passwordHash,
      role: "client",
      fullName: "Budi Santoso",
      avatarUrl: null,
    },
  });

  console.log("✅ Seeded demo users: Raka (talent), Sari (talent), Andi (talent), Budi (client)");
  console.log("   All demo accounts use password: password123");

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
