import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createPayOut } from "@/services/xenith";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// PRD §7.1: Kalkulasi pembagian dana berdasarkan progress
function calculateSplit(progressPct: number, amount: number) {
  let talentPct: number;

  if (progressPct <= 25) {
    talentPct = 0;
  } else if (progressPct <= 75) {
    talentPct = 50;
  } else {
    talentPct = 100;
  }

  const talentAmount = Math.round((amount * talentPct) / 100 * 100) / 100;
  const clientRefund = Math.round((amount - talentAmount) * 100) / 100;

  return { talentPct, talentAmount, clientRefund };
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const { dispute_id, progress_pct, resolution } = body;

    if (!dispute_id || progress_pct === undefined || !resolution) {
      return NextResponse.json(
        { success: false, message: "dispute_id, progress_pct, dan resolution wajib diisi" },
        { status: 400 }
      );
    }

    if (typeof progress_pct !== "number" || progress_pct < 0 || progress_pct > 100) {
      return NextResponse.json(
        { success: false, message: "progress_pct harus angka antara 0 - 100" },
        { status: 400 }
      );
    }

    // Ambil dispute beserta escrow, talent, dan client profile
    const dispute = await prisma.disputeTicket.findUnique({
      where: { id: dispute_id },
      include: {
        escrow: {
          include: {
            job: true,
            talent: { include: { talentProfile: true } },
            client: { include: { clientProfile: true } },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, message: "Dispute tidak ditemukan" },
        { status: 404 }
      );
    }

    if (dispute.status === "resolved") {
      return NextResponse.json(
        { success: false, message: "Dispute sudah di-resolve sebelumnya" },
        { status: 400 }
      );
    }

    const escrow = dispute.escrow;
    const amount = Number(escrow.amount);
    const { talentAmount, clientRefund } = calculateSplit(progress_pct, amount);

    // Validasi data rekening sebelum trigger payout
    const talentProfile = escrow.talent.talentProfile;
    const clientProfile = escrow.client.clientProfile;

    if (talentAmount > 0 && (!talentProfile?.bankCode || !talentProfile?.bankAccount)) {
      return NextResponse.json(
        { success: false, message: "Data rekening talent belum lengkap untuk pencairan" },
        { status: 400 }
      );
    }

    if (clientRefund > 0 && (!clientProfile?.bankCode || !clientProfile?.bankAccount)) {
      return NextResponse.json(
        { success: false, message: "Data rekening client belum lengkap untuk refund" },
        { status: 400 }
      );
    }

    // Update dispute ke investigating & simpan kalkulasi
    await prisma.disputeTicket.update({
      where: { id: dispute_id },
      data: {
        status: "investigating",
        progressPct: progress_pct,
        talentAmount,
        clientRefundAmount: clientRefund,
        resolution,
        resolvedByUserId: session.userId,
      },
    });

    const payoutsCreated: string[] = [];

    // Trigger PayOut ke Talent (jika ada)
    if (talentAmount > 0 && talentProfile) {
      const talentRefCode = `DISPUTE-T-${dispute_id}-${Date.now()}`;
      const talentIdempotencyKey = crypto.randomUUID();

      const talentPayoutResult = await createPayOut({
        initiatedAmount: talentAmount,
        destinationPayoutMethod: "BANK_TRANSFER",
        destinationPayoutChannel: talentProfile.bankCode!,
        destinationPayoutAccount: talentProfile.bankAccount!,
        destinationPayoutAccountName: talentProfile.bankAccountName || escrow.talent.fullName,
        referenceCode: talentRefCode,
        customerReference: `TALENT-${escrow.talentUserId}`,
        description: `Arbitrasi Job: ${escrow.job.title} - Bagian Talent`,
        callbackUrl: `${APP_URL}/api/webhooks/xenith/payout`,
      }, talentIdempotencyKey);

      await prisma.payout.create({
        data: {
          escrowId: escrow.id,
          xenithPayoutId: talentPayoutResult.id,
          referenceCode: talentPayoutResult.referenceCode || talentRefCode,
          customerReference: `TALENT-${escrow.talentUserId}`,
          payoutType: "talent",
          amount: talentAmount,
          destinationAccount: talentProfile.bankAccount!,
          destinationChannel: talentProfile.bankCode!,
          status: talentPayoutResult.status || "PENDING",
        },
      });
      payoutsCreated.push("talent");
    }

    // Trigger PayOut ke Client (refund, jika ada)
    if (clientRefund > 0 && clientProfile) {
      const clientRefCode = `DISPUTE-C-${dispute_id}-${Date.now()}`;
      const clientIdempotencyKey = crypto.randomUUID();

      const clientPayoutResult = await createPayOut({
        initiatedAmount: clientRefund,
        destinationPayoutMethod: "BANK_TRANSFER",
        destinationPayoutChannel: clientProfile.bankCode!,
        destinationPayoutAccount: clientProfile.bankAccount!,
        destinationPayoutAccountName: clientProfile.bankAccountName || escrow.client.fullName,
        referenceCode: clientRefCode,
        customerReference: `CLIENT-${escrow.clientUserId}`,
        description: `Arbitrasi Job: ${escrow.job.title} - Refund Client`,
        callbackUrl: `${APP_URL}/api/webhooks/xenith/payout`,
      }, clientIdempotencyKey);

      await prisma.payout.create({
        data: {
          escrowId: escrow.id,
          xenithPayoutId: clientPayoutResult.id,
          referenceCode: clientPayoutResult.referenceCode || clientRefCode,
          customerReference: `CLIENT-${escrow.clientUserId}`,
          payoutType: "client_refund",
          amount: clientRefund,
          destinationAccount: clientProfile.bankAccount!,
          destinationChannel: clientProfile.bankCode!,
          status: clientPayoutResult.status || "PENDING",
        },
      });
      payoutsCreated.push("client_refund");
    }

    // Jika kedua pihak mendapat 0 (seharusnya tidak terjadi), langsung resolve
    if (payoutsCreated.length === 0) {
      await prisma.$transaction(async (tx) => {
        await tx.disputeTicket.update({
          where: { id: dispute_id },
          data: { status: "resolved", resolvedAt: new Date() },
        });
        await tx.escrowTransaction.update({
          where: { id: escrow.id },
          data: { status: "refunded" },
        });
        await tx.job.update({
          where: { id: escrow.jobId },
          data: { status: "cancelled" },
        });
      });
    }

    // Notifikasi kedua pihak
    await prisma.$transaction(async (tx) => {
      await tx.notification.create({
        data: {
          userId: escrow.talentUserId,
          type: "dispute_resolved",
          message: `Hasil arbitrasi job "${escrow.job.title}": Anda menerima Rp ${talentAmount.toLocaleString("id-ID")}. ${resolution}`,
          relatedJobId: escrow.jobId,
          metadata: { dispute_id, progress_pct, talent_amount: talentAmount },
        },
      });

      await tx.notification.create({
        data: {
          userId: escrow.clientUserId,
          type: "dispute_resolved",
          message: `Hasil arbitrasi job "${escrow.job.title}": Refund Rp ${clientRefund.toLocaleString("id-ID")}. ${resolution}`,
          relatedJobId: escrow.jobId,
          metadata: { dispute_id, progress_pct, client_refund: clientRefund },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Dispute berhasil di-resolve. Proses pencairan dana sedang berjalan.",
      data: {
        dispute_id,
        progress_pct,
        talent_amount: talentAmount,
        client_refund: clientRefund,
        payouts_triggered: payoutsCreated,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[AdminDisputeResolve]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
