import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/ai/feedback-stats — PRD v3.0 §4.2
// Admin-only endpoint: AI matching accuracy analytics
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const period = searchParams.get("period") || "30d";

    // Calculate start date from period
    const days = parseInt(period.replace("d", "")) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Base where clause
    const baseWhere = {
      generatedAt: { gte: startDate },
      ...(category ? { talentProfile: { category: category as "web_dev" | "graphic_designer" } } : {}),
    };

    // Total matches
    const totalMatches = await prisma.jobMatch.count({ where: baseWhere });

    // Acceptance by status
    const statusCounts = await prisma.jobMatch.groupBy({
      by: ["status"],
      _count: { id: true },
      where: baseWhere,
    });

    const acceptedCount = statusCounts.find((s) => s.status === "accepted")?._count?.id || 0;
    const rejectedCount = statusCounts.find((s) => s.status === "rejected")?._count?.id || 0;

    // Top rejection reasons
    const rejections = await prisma.jobMatch.groupBy({
      by: ["rejectionReason"],
      _count: { id: true },
      where: {
        ...baseWhere,
        status: "rejected",
        rejectionReason: { not: null },
      },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const topRejectionReasons = rejections.map((r) => ({
      reason: r.rejectionReason,
      count: r._count.id,
      percentage: rejectedCount > 0 ? Math.round((r._count.id / rejectedCount) * 1000) / 10 : 0,
    }));

    // Acceptance by recommendation level
    const recStats = await prisma.jobMatch.groupBy({
      by: ["recommendation", "status"],
      _count: { id: true },
      where: baseWhere,
    });

    const buildRecStat = (rec: string) => {
      const entries = recStats.filter((r) => r.recommendation === rec);
      const total = entries.reduce((sum, e) => sum + e._count.id, 0);
      const accepted = entries.find((e) => e.status === "accepted")?._count?.id || 0;
      return {
        accepted,
        total,
        rate: total > 0 ? Math.round((accepted / total) * 1000) / 10 : 0,
      };
    };

    // Average match scores
    const avgAccepted = await prisma.jobMatch.aggregate({
      _avg: { matchScore: true },
      where: { ...baseWhere, status: "accepted" },
    });

    const avgRejected = await prisma.jobMatch.aggregate({
      _avg: { matchScore: true },
      where: { ...baseWhere, status: "rejected" },
    });

    return NextResponse.json({
      success: true,
      data: {
        period,
        total_matches_generated: totalMatches,
        total_accepted: acceptedCount,
        total_rejected: rejectedCount,
        acceptance_rate: totalMatches > 0 ? Math.round((acceptedCount / totalMatches) * 1000) / 10 : 0,
        top_rejection_reasons: topRejectionReasons,
        acceptance_by_recommendation: {
          highly_recommended: buildRecStat("highly_recommended"),
          recommended: buildRecStat("recommended"),
          not_recommended: buildRecStat("not_recommended"),
        },
        avg_match_score_accepted: avgAccepted._avg.matchScore ? Number(avgAccepted._avg.matchScore) : null,
        avg_match_score_rejected: avgRejected._avg.matchScore ? Number(avgRejected._avg.matchScore) : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    console.error("[FeedbackStats]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
