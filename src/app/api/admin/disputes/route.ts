import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const disputes = await prisma.disputeTicket.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        job: {
          select: {
            title: true,
            budgetMin: true,
            budgetMax: true,
          }
        },
        escrowTransaction: {
          select: {
            amount: true,
          }
        },
        initiatorUser: {
          select: {
            fullName: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const formattedDisputes = disputes.map(d => ({
      id: d.id,
      job_id: d.jobId,
      job_title: d.job.title,
      escrow_amount: d.escrowTransaction.amount,
      initiator: {
        id: d.initiatorUserId,
        name: d.initiatorUser.fullName,
        role: d.initiatorUser.role,
        email: d.initiatorUser.email,
      },
      reason: d.reason,
      status: d.status,
      created_at: d.createdAt,
      resolved_at: d.resolvedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedDisputes,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    console.error("[AdminDisputesGet]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
