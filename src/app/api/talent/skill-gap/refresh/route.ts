import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateSkillGapAnalysis } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
      include: {
        talentSkills: { include: { skill: true } },
        user: { select: { fullName: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ success: false, message: "Profil belum ada" }, { status: 404 });
    }

    // Mark previous analyses as not latest
    await prisma.skillGapAnalysis.updateMany({
      where: { talentProfileId: profile.id, isLatest: true },
      data: { isLatest: false },
    });

    // Create pending analysis
    await prisma.skillGapAnalysis.create({
      data: {
        talentProfileId: profile.id,
        recommendedSkills: [],
        summary: "AI sedang menganalisis...",
        isLatest: true,
        aiStatus: "processing",
      },
    });

    // Trigger AI in background
    const skillNames = profile.talentSkills.map((ts) => ({
      name: ts.skill.name,
      level: ts.level,
    }));

    const activeJobs = await prisma.jobRequiredSkill.findMany({
      where: { job: { status: "active", category: profile.category } },
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

    generateSkillGapAnalysis(skillNames, profile.category, marketDemand, {
      bio: profile.bio,
      cv_text: profile.cvText,
      portfolio_context: profile.portfolioContext,
    })
      .then(async (result) => {
        await prisma.skillGapAnalysis.updateMany({
          where: { talentProfileId: profile.id, isLatest: true },
          data: { isLatest: false },
        });
        await prisma.skillGapAnalysis.create({
          data: {
            talentProfileId: profile.id,
            recommendedSkills: result.recommendations,
            summary: result.summary,
            profileCompletenessScore: result.profile_completeness_score ?? null,
            isLatest: true,
            aiStatus: "completed",
          },
        });
      })
      .catch(async (error) => {
        console.error("[SkillGapRefresh] AI failed:", error);
        await prisma.skillGapAnalysis.updateMany({
          where: { talentProfileId: profile.id, isLatest: true },
          data: { aiStatus: "failed" },
        });
      });

    return NextResponse.json({ success: true, message: "Analisis skill gap dimulai" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[SkillGapRefresh]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
