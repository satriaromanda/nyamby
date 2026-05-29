import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa akses dashboard ini" },
        { status: 403 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: { clientUserId: session.userId },
      include: {
        requiredSkills: { include: { skill: true } },
        jobMatches: {
          include: {
            talentProfile: {
              include: {
                user: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { matchScore: "desc" },
          take: 5,
        },
        escrowTransaction: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          category: j.category,
          status: j.status,
          budget_min: j.budgetMin,
          budget_max: j.budgetMax,
          deadline: j.deadline,
          created_at: j.createdAt,
          required_skills: j.requiredSkills.map((rs) => rs.skill.name),
          top_matches: j.jobMatches.map((m) => ({
            match_id: m.id,
            talent_profile_id: m.talentProfileId,
            talent_user_id: m.talentProfile.userId,
            full_name: m.talentProfile.user.fullName,
            avatar_url: m.talentProfile.user.avatarUrl,
            match_score: m.matchScore,
            recommendation: m.recommendation,
            status: m.status,
          })),
          escrow: j.escrowTransaction
            ? {
                status: j.escrowTransaction.status,
                amount: j.escrowTransaction.amount,
              }
            : null,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[ClientDashboard]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
