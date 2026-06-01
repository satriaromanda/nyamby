import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: { select: { fullName: true, avatarUrl: true } },
        requiredSkills: { include: { skill: true } },
        jobMatches: {
          include: {
            talentProfile: {
              include: {
                user: { select: { fullName: true, avatarUrl: true } },
                talentSkills: { include: { skill: true } },
              },
            },
          },
          orderBy: { matchScore: "desc" },
        },
        escrowTransaction: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 }
      );
    }

    // Public job details are visible, but match reasoning is scoped.
    let matchedTalents = job.jobMatches;
    if (session?.role === "talent") {
      const profile = await prisma.talentProfile.findUnique({
        where: { userId: session.userId },
      });
      if (profile) {
        matchedTalents = matchedTalents.filter(
          (m) => m.talentProfileId === profile.id
        );
      }
    } else if (session?.role === "client" && session.userId === job.clientUserId) {
      matchedTalents = job.jobMatches;
    } else {
      matchedTalents = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        job: {
          id: job.id,
          title: job.title,
          description: job.description,
          category: job.category,
          client_name: job.client.fullName,
          budget_min: job.budgetMin,
          budget_max: job.budgetMax,
          deadline: job.deadline,
          status: job.status,
          created_at: job.createdAt,
          required_skills: job.requiredSkills.map((rs) => ({
            name: rs.skill.name,
            is_mandatory: rs.isMandatory,
          })),
        },
        matched_talents: matchedTalents.map((m) => ({
          match_id: m.id,
          talent_profile_id: m.talentProfileId,
          full_name: m.talentProfile.user.fullName,
          avatar_url: m.talentProfile.user.avatarUrl,
          match_score: m.matchScore,
          strengths: m.strengths,
          gaps: m.gaps,
          reasoning: m.reasoning,
          portfolio_evidence: m.portfolioEvidence,
          recommendation: m.recommendation,
          status: m.status,
          skills: m.talentProfile.talentSkills.map((ts) => ({
            name: ts.skill.name,
            level: ts.level,
          })),
          rate_per_hour: m.talentProfile.ratePerHour,
          location: m.talentProfile.location,
        })),
        escrow: job.escrowTransaction
          ? {
              id: job.escrowTransaction.id,
              amount: job.escrowTransaction.amount,
              platform_fee: job.escrowTransaction.platformFee,
              status: job.escrowTransaction.status,
              held_at: job.escrowTransaction.heldAt,
              released_at: job.escrowTransaction.releasedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[JobDetail]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
