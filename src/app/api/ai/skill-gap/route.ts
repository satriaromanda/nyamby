import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateSkillGapAnalysis } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    let { talent_profile_id } = body;

    // If not specified, use logged-in talent's profile
    if (!talent_profile_id && session.role === "talent") {
      const profile = await prisma.talentProfile.findUnique({
        where: { userId: session.userId },
      });
      if (profile) talent_profile_id = profile.id;
    }

    if (!talent_profile_id) {
      return NextResponse.json(
        { success: false, message: "talent_profile_id wajib diisi" },
        { status: 400 }
      );
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { id: talent_profile_id },
      include: { talentSkills: { include: { skill: true } } },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profil talenta tidak ditemukan" },
        { status: 404 }
      );
    }

    const skillNames = profile.talentSkills.map((ts) => ({
      name: ts.skill.name,
      level: ts.level,
    }));

    // Get market demand
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

    const result = await generateSkillGapAnalysis(skillNames, profile.category, marketDemand, {
      bio: profile.bio,
      cv_text: profile.cvText,
      portfolio_context: profile.portfolioContext,
    });

    // Mark old analyses as not latest
    await prisma.skillGapAnalysis.updateMany({
      where: { talentProfileId: talent_profile_id, isLatest: true },
      data: { isLatest: false },
    });

    // Save new analysis
    await prisma.skillGapAnalysis.create({
      data: {
        talentProfileId: talent_profile_id,
        recommendedSkills: result.recommendations,
        summary: result.summary,
        profileCompletenessScore: result.profile_completeness_score ?? null,
        isLatest: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendations: result.recommendations,
        summary: result.summary,
        profile_completeness_score: result.profile_completeness_score,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[AISkillGap]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
