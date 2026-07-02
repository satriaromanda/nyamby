import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats — PRD v3.0 §8.3 + PRD v4.0 §4
export async function GET() {
  try {
    await requireAdmin();

    // User stats
    const [totalTalent, totalClient, totalAdmin] = await Promise.all([
      prisma.user.count({ where: { role: "talent" } }),
      prisma.user.count({ where: { role: "client" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = await prisma.user.count({
      where: { createdAt: { gte: oneWeekAgo } },
    });

    // Job stats
    const [totalActive, totalCompleted, totalJobs] = await Promise.all([
      prisma.job.count({ where: { status: { in: ["active", "matched", "in_progress", "submitted_for_review"] } } }),
      prisma.job.count({ where: { status: "completed" } }),
      prisma.job.count(),
    ]);

    const completionRate = totalJobs > 0
      ? Math.round((totalCompleted / totalJobs) * 1000) / 10
      : 0;

    // Financial stats
    const escrowStats = await prisma.escrowTransaction.aggregate({
      _sum: { amount: true, platformFee: true },
    });

    const escrowHeld = await prisma.escrowTransaction.aggregate({
      _sum: { amount: true },
      where: { status: "held" },
    });

    // AI matching stats
    const totalMatchesGenerated = await prisma.jobMatch.count();
    const totalAccepted = await prisma.jobMatch.count({ where: { status: "accepted" } });
    const avgMatchScore = await prisma.jobMatch.aggregate({
      _avg: { matchScore: true },
    });

    const overallAcceptanceRate = totalMatchesGenerated > 0
      ? Math.round((totalAccepted / totalMatchesGenerated) * 1000) / 10
      : 0;

    // Dispute stats
    const [totalOpenDisputes, totalResolvedDisputes] = await Promise.all([
      prisma.disputeTicket.count({ where: { status: { in: ["open", "investigating"] } } }),
      prisma.disputeTicket.count({ where: { status: "resolved" } }),
    ]);

    const totalDisputes = totalOpenDisputes + totalResolvedDisputes;
    const disputeRate = totalCompleted > 0
      ? Math.round((totalDisputes / totalCompleted) * 1000) / 10
      : 0;

    // ─── PRD v4.0 §4 — Export Monitoring Stats ───────────────────────
    // Count non-Indonesian clients
    const totalClientsNonId = await prisma.clientProfile.count({
      where: { country: { not: "indonesia" } },
    });

    // Count by country
    const [malaysiaClients, singaporeClients, otherClients] = await Promise.all([
      prisma.clientProfile.count({ where: { country: "malaysia" } }),
      prisma.clientProfile.count({ where: { country: "singapore" } }),
      prisma.clientProfile.count({ where: { country: "other" } }),
    ]);

    // Count jobs from export clients (non-Indonesian)
    const exportClientUserIds = await prisma.clientProfile.findMany({
      where: { country: { not: "indonesia" } },
      select: { userId: true },
    });
    const exportUserIds = exportClientUserIds.map((c) => c.userId);

    const totalJobsFromExport = exportUserIds.length > 0
      ? await prisma.job.count({
          where: { clientUserId: { in: exportUserIds } },
        })
      : 0;

    // GMV from export (sum of escrow amounts for export client jobs)
    const gmvExport = exportUserIds.length > 0
      ? await prisma.escrowTransaction.aggregate({
          _sum: { amount: true },
          where: { clientUserId: { in: exportUserIds } },
        })
      : { _sum: { amount: null } };

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total_talent: totalTalent,
          total_client: totalClient,
          total_admin: totalAdmin,
          new_this_week: newThisWeek,
        },
        jobs: {
          total_active: totalActive,
          total_completed: totalCompleted,
          total_jobs: totalJobs,
          completion_rate: completionRate,
        },
        financials: {
          total_gmv_idr: Number(escrowStats._sum.amount || 0),
          total_platform_fee_idr: Number(escrowStats._sum.platformFee || 0),
          escrow_held_idr: Number(escrowHeld._sum.amount || 0),
        },
        ai: {
          total_matches_generated: totalMatchesGenerated,
          overall_acceptance_rate: overallAcceptanceRate,
          avg_match_score: avgMatchScore._avg.matchScore
            ? Math.round(Number(avgMatchScore._avg.matchScore) * 10) / 10
            : 0,
        },
        disputes: {
          total_open: totalOpenDisputes,
          total_resolved: totalResolvedDisputes,
          dispute_rate: disputeRate,
        },
        // PRD v4.0 §4 — Export monitoring breakdown
        export: {
          total_clients_non_id: totalClientsNonId,
          total_jobs_from_export: totalJobsFromExport,
          gmv_export_idr_equivalent: Number(gmvExport._sum.amount || 0),
          by_country: {
            malaysia: malaysiaClients,
            singapore: singaporeClients,
            other: otherClients,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    console.error("[AdminStats]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
