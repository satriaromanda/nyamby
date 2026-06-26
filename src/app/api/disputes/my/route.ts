import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/disputes/my — PRD §2.4: List disputes where user is involved
export async function GET() {
  try {
    const session = await requireAuth();

    const disputes = await prisma.disputeTicket.findMany({
      where: {
        OR: [
          { initiatorUserId: session.userId },
          { job: { clientUserId: session.userId } },
          { escrow: { talentUserId: session.userId } },
        ],
      },
      include: {
        job: {
          select: {
            title: true,
            status: true,
          },
        },
        escrow: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: disputes.map((d) => ({
        id: d.id,
        job_id: d.jobId,
        job_title: d.job.title,
        job_status: d.job.status,
        escrow_amount: d.escrow.amount,
        escrow_status: d.escrow.status,
        reason: d.reason,
        description: d.description,
        status: d.status,
        resolution: d.resolution,
        is_initiator: d.initiatorUserId === session.userId,
        created_at: d.createdAt,
        resolved_at: d.resolvedAt,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[MyDisputes]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
