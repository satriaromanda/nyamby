import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/jobs — PRD v3.0 §8.2
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: { select: { fullName: true, email: true } },
          escrowTransaction: {
            select: { amount: true, status: true },
          },
          jobMatches: {
            where: { status: "accepted" },
            include: {
              talentProfile: {
                include: { user: { select: { fullName: true } } },
              },
            },
            take: 1,
          },
          _count: {
            select: { jobMatches: true, disputeTickets: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          category: j.category,
          status: j.status,
          client_name: j.client.fullName,
          client_email: j.client.email,
          assigned_talent: j.jobMatches[0]?.talentProfile.user.fullName || null,
          budget_min: j.budgetMin,
          budget_max: j.budgetMax,
          deadline: j.deadline,
          escrow: j.escrowTransaction
            ? { amount: j.escrowTransaction.amount, status: j.escrowTransaction.status }
            : null,
          total_matches: j._count.jobMatches,
          total_disputes: j._count.disputeTickets,
          submitted_at: j.submittedAt,
          created_at: j.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
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
    console.error("[AdminJobs]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
