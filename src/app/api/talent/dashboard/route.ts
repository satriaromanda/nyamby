import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa akses dashboard ini" },
        { status: 403 }
      );
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
      include: { talentSkills: { include: { skill: true } } },
    });

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: { needs_onboarding: true },
      });
    }

    // Get latest skill gap analysis
    const skillGap = await prisma.skillGapAnalysis.findFirst({
      where: { talentProfileId: profile.id, isLatest: true },
      orderBy: { generatedAt: "desc" },
    });

    // Get recommended jobs (matched)
    const jobMatches = await prisma.jobMatch.findMany({
      where: { talentProfileId: profile.id },
      include: {
        job: {
          include: {
            requiredSkills: { include: { skill: true } },
            client: { select: { fullName: true } },
          },
        },
      },
      orderBy: { matchScore: "desc" },
      take: 10,
    });

    // Get active jobs (accepted/in_progress)
    const activeJobs = await prisma.jobMatch.findMany({
      where: {
        talentProfileId: profile.id,
        status: { in: ["accepted"] },
      },
      include: {
        job: { include: { client: { select: { fullName: true } } } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          full_name: session.fullName,
          category: profile.category,
          availability: profile.availability,
          skills: profile.talentSkills.map((ts) => ({
            name: ts.skill.name,
            level: ts.level,
          })),
        },
        skill_gap: skillGap
          ? {
              recommendations: skillGap.recommendedSkills,
              summary: skillGap.summary,
              profile_completeness_score: skillGap.profileCompletenessScore,
              generated_at: skillGap.generatedAt,
              ai_status: skillGap.aiStatus,
            }
          : null,
        recommended_jobs: jobMatches.map((jm) => ({
          match_id: jm.id,
          job_id: jm.jobId,
          title: jm.job.title,
          client_name: jm.job.client.fullName,
          category: jm.job.category,
          match_score: jm.matchScore,
          strengths: jm.strengths,
          gaps: jm.gaps,
          reasoning: jm.reasoning,
          portfolio_evidence: jm.portfolioEvidence,
          recommendation: jm.recommendation,
          match_status: jm.status,
          budget_min: jm.job.budgetMin,
          budget_max: jm.job.budgetMax,
          deadline: jm.job.deadline,
          required_skills: jm.job.requiredSkills.map((rs) => rs.skill.name),
        })),
        active_jobs: activeJobs.map((jm) => ({
          job_id: jm.jobId,
          title: jm.job.title,
          client_name: jm.job.client.fullName,
          status: jm.job.status,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[TalentDashboard]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
