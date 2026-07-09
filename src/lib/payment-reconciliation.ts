import { prisma } from "@/lib/prisma";

/**
 * Shared Pay In status → DB reconciliation logic.
 *
 * Single source of truth used by BOTH:
 *  - the passive Xenith webhook (`/api/webhooks/xenith/payin`)
 *  - the active reconcile route (`/api/escrow/[jobId]/reconcile`) triggered by the
 *    client "Cek Status" button when the webhook never lands.
 *
 * PRD v5.3 §6.13 — keeps the two paths from diverging. Cross-border origin
 * resolution is retained (Cross-Border feature stays active in this repo).
 */

type ApplyResult = { changed: boolean; status: string };

/**
 * Apply a Xenith Pay In status to our DB, transactionally.
 *
 * @param paymentId       our Payment.id
 * @param newStatusRaw    Xenith status (any case): SUCCESS | FAILED | EXPIRED | PENDING | ...
 * @param originCurrencyRaw optional currency hint from the Xenith payload
 */
export async function applyPayInStatus(
  paymentId: string,
  newStatusRaw: string,
  originCurrencyRaw: string | null = null
): Promise<ApplyResult> {
  const status = (newStatusRaw || "").toUpperCase();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      escrowTransaction: { include: { job: true } },
    },
  });

  if (!payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }

  // Idempotency: status already applied → no-op
  if (payment.status === status) {
    return { changed: false, status };
  }

  // Cross-border origin resolution (PRD v4.0 §2.3 — CB stays active here)
  let originCountry: string | null = null;
  let originCurrency: string | null = originCurrencyRaw;
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
          ...(originCountry ? { originCountry: originCountry as never } : {}),
          ...(originCurrency && originCurrency !== "IDR"
            ? { originCurrency: originCurrency as never }
            : {}),
        },
      });

      await tx.escrowTransaction.update({
        where: { id: payment.escrowId },
        data: { status: "held", heldAt: new Date() },
      });

      const escrow = payment.escrowTransaction;
      await tx.job.update({
        where: { id: escrow.jobId },
        data: { status: "in_progress" },
      });

      await tx.notification.create({
        data: {
          userId: escrow.talentUserId,
          type: "payment_held",
          message: `Dana escrow telah berhasil diamankan untuk job: ${escrow.job.title}. Anda bisa mulai bekerja!`,
          relatedJobId: escrow.jobId,
        },
      });
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
    // Unknown/other status → still record it on the payment, no side effects
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: status as never },
    });
  }

  return { changed: true, status };
}
