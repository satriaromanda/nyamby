import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/users — PRD v3.0 §8.3
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status === "suspended") where.isSuspended = true;
    if (status === "active") where.isSuspended = false;
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          onboardingComplete: true,
          isSuspended: true,
          suspendReason: true,
          createdAt: true,
          _count: {
            select: {
              postedJobs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get completed job counts for each user
    const userIds = users.map((u) => u.id);
    const completedCounts = await prisma.job.groupBy({
      by: ["clientUserId"],
      _count: { id: true },
      where: {
        clientUserId: { in: userIds },
        status: "completed",
      },
    });

    const completedMap = new Map(
      completedCounts.map((c) => [c.clientUserId, c._count.id])
    );

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          full_name: u.fullName,
          role: u.role,
          onboarding_complete: u.onboardingComplete,
          is_suspended: u.isSuspended,
          suspend_reason: u.suspendReason,
          created_at: u.createdAt,
          total_jobs: u._count.postedJobs,
          total_completed: completedMap.get(u.id) || 0,
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
    console.error("[AdminUsers]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
