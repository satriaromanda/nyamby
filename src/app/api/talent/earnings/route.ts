import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/talent/earnings — riwayat pembayaran & saldo talent
export async function GET() {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa akses halaman ini" },
        { status: 403 }
      );
    }

    const escrows = await prisma.escrowTransaction.findMany({
      where: { talentUserId: session.userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            client: { select: { fullName: true } },
          },
        },
        payouts: {
          where: { payoutType: "talent" },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { heldAt: "desc" },
    });

    let totalEarned = 0;
    let totalPending = 0;

    const transactions = escrows.map((escrow) => {
      const netAmount = Number(escrow.amount) - Number(escrow.platformFee);
      const successPayout = escrow.payouts.find((p) => p.status === "SUCCESS");
      const pendingPayout = escrow.payouts.find((p) => p.status === "PENDING");

      if (successPayout) {
        totalEarned += Number(successPayout.amount);
      } else if (escrow.status === "held" || pendingPayout) {
        totalPending += netAmount;
      }

      return {
        escrow_id: escrow.id,
        job_id: escrow.job.id,
        job_title: escrow.job.title,
        job_status: escrow.job.status,
        client_name: escrow.job.client.fullName,
        gross_amount: Number(escrow.amount),
        platform_fee: Number(escrow.platformFee),
        net_amount: netAmount,
        escrow_status: escrow.status,
        held_at: escrow.heldAt,
        released_at: escrow.releasedAt,
        payout: escrow.payouts[0]
          ? {
              status: escrow.payouts[0].status,
              amount: Number(escrow.payouts[0].amount),
              destination_channel: escrow.payouts[0].destinationChannel,
              created_at: escrow.payouts[0].createdAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_earned: totalEarned,
          total_pending: totalPending,
          total_transactions: transactions.length,
        },
        transactions,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[TalentEarnings]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
