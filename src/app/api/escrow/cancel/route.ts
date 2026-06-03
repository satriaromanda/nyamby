import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa cancel escrow" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { job_id, progress_pct } = body;

    if (!job_id || progress_pct === undefined || progress_pct === null) {
      return NextResponse.json(
        { success: false, message: "job_id dan progress_pct wajib diisi" },
        { status: 400 }
      );
    }

    if (typeof progress_pct !== "number" || progress_pct < 0 || progress_pct > 100) {
      return NextResponse.json(
        { success: false, message: "progress_pct harus angka antara 0 - 100" },
        { status: 400 }
      );
    }

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { jobId: job_id },
      include: { job: true },
    });

    if (!escrow) {
      return NextResponse.json(
        { success: false, message: "Escrow tidak ditemukan" },
        { status: 404 }
      );
    }

    if (escrow.clientUserId !== session.userId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses" },
        { status: 403 }
      );
    }

    if (escrow.status !== "held") {
      return NextResponse.json(
        { success: false, message: "Escrow sudah dirilis atau di-refund" },
        { status: 400 }
      );
    }

    // Calculate distribution per PRD §7.1
    let talentPct: number;
    let clientRefundPct: number;

    if (progress_pct <= 25) {
      talentPct = 0;
      clientRefundPct = 100;
    } else if (progress_pct <= 75) {
      talentPct = 50;
      clientRefundPct = 50;
    } else {
      talentPct = 100;
      clientRefundPct = 0;
    }

    const amount = Number(escrow.amount);
    const talentReceives = Math.round((amount * talentPct) / 100);
    const clientRefund = amount - talentReceives; // Ensures exact total matching

    // Update escrow and job in transaction
    await prisma.$transaction(async (tx) => {
      await tx.escrowTransaction.update({
        where: { id: escrow.id },
        data: { status: "refunded" },
      });

      await tx.job.update({
        where: { id: job_id },
        data: { status: "cancelled" },
      });

      // Notify talent
      await tx.notification.create({
        data: {
          userId: escrow.talentUserId,
          type: "escrow_cancelled",
          message: `Job "${escrow.job.title}" dibatalkan. Kamu menerima Rp ${talentReceives.toLocaleString("id-ID")} dari total escrow.`,
          relatedJobId: job_id,
          metadata: { progress_pct, talent_receives: talentReceives, client_refund: clientRefund },
        },
      });

      // Notify client
      await tx.notification.create({
        data: {
          userId: session.userId,
          type: "escrow_cancelled",
          message: `Job "${escrow.job.title}" dibatalkan. Refund: Rp ${clientRefund.toLocaleString("id-ID")}.`,
          relatedJobId: job_id,
          metadata: { progress_pct, talent_receives: talentReceives, client_refund: clientRefund },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Escrow berhasil dibatalkan",
      data: {
        escrow: {
          id: escrow.id,
          status: "refunded",
          amount,
          talent_receives: talentReceives,
          client_refund: clientRefund,
          progress_pct,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[EscrowCancel]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
