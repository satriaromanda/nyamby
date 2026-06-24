import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createPayOut } from "@/services/xenith";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa rilis dana" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, message: "job_id wajib diisi" },
        { status: 400 }
      );
    }

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { jobId: job_id },
      include: { 
        job: true,
        talent: {
          include: { talentProfile: true }
        }
      },
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
        { success: false, message: "Dana sudah diproses, dirilis, atau di-refund" },
        { status: 400 }
      );
    }

    const talentProfile = escrow.talent.talentProfile;
    if (!talentProfile || !talentProfile.bankCode || !talentProfile.bankAccount) {
       return NextResponse.json(
         { success: false, message: "Data rekening talent belum lengkap untuk pencairan dana" }, 
         { status: 400 }
       );
    }

    const referenceCode = `PAYOUT-${job_id}-${Date.now()}`;
    const idempotencyKey = crypto.randomUUID();

    const payoutResult = await createPayOut({
      initiatedAmount: Number(escrow.amount),
      destinationPayoutMethod: "BANK_TRANSFER", // Default method
      destinationPayoutChannel: talentProfile.bankCode,
      destinationPayoutAccount: talentProfile.bankAccount,
      destinationPayoutAccountName: talentProfile.bankAccountName || escrow.talent.fullName,
      referenceCode,
      customerReference: `TALENT-${escrow.talentUserId}`,
      description: `Pencairan Dana Escrow Job: ${escrow.job.title}`,
      callbackUrl: `${APP_URL}/api/webhooks/xenith/payout`
    }, idempotencyKey);

    // Buat payout record
    const payout = await prisma.payout.create({
      data: {
        escrowId: escrow.id,
        xenithPayoutId: payoutResult.id,
        referenceCode: payoutResult.referenceCode || referenceCode,
        customerReference: `TALENT-${escrow.talentUserId}`,
        payoutType: "talent",
        amount: escrow.amount,
        destinationAccount: talentProfile.bankAccount,
        destinationChannel: talentProfile.bankCode,
        status: payoutResult.status || "PENDING",
      },
    });

    // Job status dan notifikasi talent akan di-handle oleh webhook payout

    return NextResponse.json({
      success: true,
      message: "Proses pencairan dana sedang berjalan. Menunggu konfirmasi Xenith.",
      data: {
        escrow_id: escrow.id,
        status: escrow.status,
        payout_status: payout.status,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[EscrowRelease]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
