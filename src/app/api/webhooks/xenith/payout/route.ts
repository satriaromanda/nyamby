import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, isWebhookTimestampValid } from "@/services/xenith";

// Webhook endpoint — tidak memerlukan auth (diakses langsung oleh Xenith)
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("X-Xenith-Signature");
    const timestamp = request.headers.get("X-Xenith-Timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json({ success: false, message: "Missing headers" }, { status: 400 });
    }

    if (!isWebhookTimestampValid(timestamp)) {
      return NextResponse.json({ success: false, message: "Timestamp expired" }, { status: 400 });
    }

    const payloadText = await request.text();
    if (!verifyWebhookSignature(payloadText, signature)) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(payloadText);
    const { id } = payload.data;
    const status = ((payload.data.status as string) || "").toUpperCase();

    const payout = await prisma.payout.findUnique({
      where: { xenithPayoutId: id },
      include: {
        escrowTransaction: {
          include: {
            job: true,
            payouts: true,
            disputeTickets: {
              where: { status: { in: ["investigating", "open"] } },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ success: false, message: "Payout not found" }, { status: 404 });
    }

    // Idempotency: jika status sudah sama, skip processing
    if (payout.status === status) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    if (status === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        // Update payout status
        await tx.payout.update({
          where: { id: payout.id },
          data: { status: "SUCCESS" },
        });

        const escrow = payout.escrowTransaction;

        // Notifikasi penerima payout
        if (payout.payoutType === "talent") {
          await tx.notification.create({
            data: {
              userId: escrow.talentUserId,
              type: "payment_released",
              message: `Dana Rp ${Number(payout.amount).toLocaleString("id-ID")} telah berhasil ditransfer ke rekening Anda untuk job: ${escrow.job.title}.`,
              relatedJobId: escrow.jobId,
            },
          });
        } else if (payout.payoutType === "client_refund") {
          await tx.notification.create({
            data: {
              userId: escrow.clientUserId,
              type: "refund_received",
              message: `Refund Rp ${Number(payout.amount).toLocaleString("id-ID")} telah berhasil ditransfer ke rekening Anda untuk job: ${escrow.job.title}.`,
              relatedJobId: escrow.jobId,
            },
          });
        }

        // Cek apakah SEMUA payouts untuk escrow ini sudah SUCCESS
        // (refresh data setelah update di atas)
        const allPayouts = await tx.payout.findMany({
          where: { escrowId: escrow.id },
        });

        const allSuccess = allPayouts.every((p) =>
          p.id === payout.id ? true : p.status === "SUCCESS"
        );

        if (allSuccess) {
          // Tentukan final status berdasarkan konteks
          const hasDispute = escrow.disputeTickets.length > 0;

          if (hasDispute) {
            // Arbitrasi selesai → escrow refunded, job cancelled
            await tx.escrowTransaction.update({
              where: { id: escrow.id },
              data: { status: "refunded" },
            });
            await tx.job.update({
              where: { id: escrow.jobId },
              data: { status: "cancelled" },
            });
            // Resolve dispute ticket
            const activeDispute = escrow.disputeTickets[0];
            if (activeDispute) {
              await tx.disputeTicket.update({
                where: { id: activeDispute.id },
                data: { status: "resolved", resolvedAt: new Date() },
              });
            }
          } else {
            // Normal release flow → escrow released, job completed
            await tx.escrowTransaction.update({
              where: { id: escrow.id },
              data: { status: "released", releasedAt: new Date() },
            });
            await tx.job.update({
              where: { id: escrow.jobId },
              data: { status: "completed" },
            });
          }
        }
      });
    } else if (status === "FAILED") {
      await prisma.$transaction(async (tx) => {
        await tx.payout.update({
          where: { id: payout.id },
          data: { status: "FAILED" },
        });

        const escrow = payout.escrowTransaction;

        // Notifikasi berdasarkan tipe payout
        const notifyUserId =
          payout.payoutType === "client_refund"
            ? escrow.clientUserId
            : escrow.talentUserId;

        await tx.notification.create({
          data: {
            userId: notifyUserId,
            type: "payment_failed",
            message: `Proses transfer dana gagal untuk job: ${escrow.job.title}. Tim Nyamby akan menindaklanjuti.`,
            relatedJobId: escrow.jobId,
          },
        });
      });
    } else {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status },
      });
    }

    return NextResponse.json({ success: true, message: "OK" });
  } catch (error) {
    console.error("[Webhook PayOut]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
