import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateSkillGapAnalysis } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa mengisi onboarding" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bio, category, rate_per_hour, rate_per_project, availability, location, portfolio_url, skills } = body;

    if (!category || !skills || skills.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori dan minimal 1 skill wajib diisi" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existing = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Profil sudah ada. Gunakan PATCH untuk update." },
        { status: 400 }
      );
    }

    // Create talent profile
    const profile = await prisma.talentProfile.create({
      data: {
        userId: session.userId,
        bio: bio || null,
        category,
        ratePerHour: rate_per_hour || null,
        ratePerProject: rate_per_project || null,
        availability: availability || "available",
        location: location || null,
        portfolioUrl: portfolio_url || null,
      },
    });

    // Link skills
    for (const sk of skills) {
      await prisma.talentSkill.create({
        data: {
          talentProfileId: profile.id,
          skillId: sk.skill_id,
          level: sk.level,
        },
      });
    }

    // Trigger AI Skill Gap Analysis
    const talentSkills = await prisma.talentSkill.findMany({
      where: { talentProfileId: profile.id },
      include: { skill: true },
    });

    const skillNames = talentSkills.map((ts) => ({
      name: ts.skill.name,
      level: ts.level,
    }));

    // Get market demand (count skills in active jobs)
    const activeJobs = await prisma.jobRequiredSkill.findMany({
      include: { skill: true, job: true },
    });

    const demandMap: Record<string, { count: number; totalBudget: number }> = {};
    for (const jrs of activeJobs) {
      const sn = jrs.skill.name;
      if (!demandMap[sn]) demandMap[sn] = { count: 0, totalBudget: 0 };
      demandMap[sn].count++;
      demandMap[sn].totalBudget += Number(jrs.job.budgetMax || 0);
    }

    const marketDemand = Object.entries(demandMap).map(([skill_name, data]) => ({
      skill_name,
      frequency_in_jobs: data.count,
      avg_budget: data.count > 0 ? Math.round(data.totalBudget / data.count) : 0,
    }));

    const skillGapResult = await generateSkillGapAnalysis(skillNames, category, marketDemand);

    const analysis = await prisma.skillGapAnalysis.create({
      data: {
        talentProfileId: profile.id,
        recommendedSkills: skillGapResult.recommendations,
        summary: skillGapResult.summary,
        isLatest: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil dibuat. AI sedang menganalisis skill gap kamu.",
        data: {
          talent_profile_id: profile.id,
          skill_gap_analysis_id: analysis.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[Onboarding]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
