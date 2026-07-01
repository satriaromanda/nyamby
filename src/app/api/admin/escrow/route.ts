import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/escrow — PRD v3.0 §8.2
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [escrows, total] = await Promise.all([
      prisma.escrowTransaction.findMany({
        where,
        include: {
          job: { select: { title: true, status: true } },
          client: { select: { fullName: true, email: true } },
          talent: { select: { fullName: true, email: true } },
          payment: {
            select: { status: true, paymentCode: true, paymentCodeType: true },
          },
          payouts: {
            select: { status: true, payoutType: true, amount: true, destinationChannel: true },
          },
        },
        orderBy: { heldAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.escrowTransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        escrows: escrows.map((e) => ({
          id: e.id,
          job_id: e.jobId,
          job_title: e.job.title,
          job_status: e.job.status,
          client_name: e.client.fullName,
          client_email: e.client.email,
          talent_name: e.talent.fullName,
          talent_email: e.talent.email,
          amount: e.amount,
          platform_fee: e.platformFee,
          status: e.status,
          held_at: e.heldAt,
          released_at: e.releasedAt,
          payment: e.payment
            ? {
                status: e.payment.status,
                payment_code: e.payment.paymentCode,
                payment_code_type: e.payment.paymentCodeType,
              }
            : null,
          payouts: e.payouts.map((p) => ({
            status: p.status,
            payout_type: p.payoutType,
            amount: p.amount,
            destination_channel: p.destinationChannel,
          })),
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
    console.error("[AdminEscrow]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
