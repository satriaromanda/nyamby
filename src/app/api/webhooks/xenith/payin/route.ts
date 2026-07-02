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
    const { id, status } = payload.data;

    // PRD v4.0 §3.5 — Extract cross-border payment info from Xenith payload
    const originCurrencyRaw = payload.data?.currency || payload.data?.originCurrency || null;
    const paymentCodeType = payload.data?.paymentCodeType || null;

    const payment = await prisma.payment.findUnique({
      where: { xenithPayinId: id },
      include: {
        escrowTransaction: {
          include: { job: true },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    // Idempotency: jika status sudah sama, skip processing
    if (payment.status === status) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // PRD v4.0 §2.3 — Resolve cross-border origin info
    let originCountry = null;
    let originCurrency = originCurrencyRaw;
    if (payment.escrowTransaction) {
      const clientProfile = await prisma.clientProfile.findFirst({
        where: { userId: payment.escrowTransaction.clientUserId },
        select: { country: true, preferredCurrency: true },
      });
      if (clientProfile && clientProfile.country !== "indonesia") {
        originCountry = clientProfile.country;
        originCurrency = originCurrency || clientProfile.preferredCurrency;
      }
    }

    if (status === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            // PRD v4.0 §2.3 — Store cross-border origin data
            ...(originCountry ? { originCountry } : {}),
            ...(originCurrency && originCurrency !== "IDR" ? { originCurrency } : {}),
          },
        });

        await tx.escrowTransaction.update({
          where: { id: payment.escrowId },
          data: {
            status: "held",
            heldAt: new Date(),
          },
        });

        const escrow = payment.escrowTransaction;

        await tx.job.update({
          where: { id: escrow.jobId },
          data: { status: "in_progress" },
        });

        // Notifikasi talent
        await tx.notification.create({
          data: {
            userId: escrow.talentUserId,
            type: "payment_held",
            message: `Dana escrow telah berhasil diamankan untuk job: ${escrow.job.title}. Anda bisa mulai bekerja!`,
            relatedJobId: escrow.jobId,
          },
        });

        // Notifikasi client
        await tx.notification.create({
          data: {
            userId: escrow.clientUserId,
            type: "payment_success",
            message: `Pembayaran escrow Anda untuk job: ${escrow.job.title} berhasil.`,
            relatedJobId: escrow.jobId,
          },
        });
      });
    } else if (status === "FAILED") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });

        const escrow = payment.escrowTransaction;
        await tx.notification.create({
          data: {
            userId: escrow.clientUserId,
            type: "payment_failed",
            message: `Pembayaran escrow Anda gagal. Silakan coba lagi.`,
            relatedJobId: escrow.jobId,
          },
        });
      });
    } else if (status === "EXPIRED") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "EXPIRED" },
        });

        // Cleanup: hapus escrow yang masih pending
        if (payment.escrowTransaction.status === "pending") {
          await tx.escrowTransaction.delete({
            where: { id: payment.escrowId },
          });
        }
      });
    } else {
      // Status lain (jika ada), update payment saja
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status },
      });
    }

    return NextResponse.json({ success: true, message: "OK" });
  } catch (error) {
    console.error("[Webhook PayIn]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
