import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayOut } from "@/services/xenith";

// GET /api/cron/auto-release — PRD v3.0 §5.3
// Auto-release escrow after 5 business days of no client response
export async function GET(request: NextRequest) {
  try {
    // Auth: verify CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[AutoRelease] CRON_SECRET not configured");
      return NextResponse.json(
        { success: false, message: "Cron not configured" },
        { status: 500 }
      );
    }

    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    if (token !== cronSecret) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate 5 business days ago
    const fiveBusinessDaysAgo = subtractBusinessDays(new Date(), 5);

    // Find overdue jobs
    const overdueJobs = await prisma.job.findMany({
      where: {
        status: "submitted_for_review",
        submittedAt: { lte: fiveBusinessDaysAgo },
      },
      include: {
        escrowTransaction: {
          include: {
            payouts: true,
          },
        },
        client: { select: { id: true, fullName: true } },
        jobMatches: {
          where: { status: "accepted" },
          include: {
            talentProfile: {
              include: {
                user: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
    });

    // Filter to only those with held escrow
    const eligibleJobs = overdueJobs.filter(
      (job) => job.escrowTransaction && job.escrowTransaction.status === "held"
    );

    const results: { job_id: string; status: string; error?: string }[] = [];

    for (const job of eligibleJobs) {
      try {
        const escrow = job.escrowTransaction!;
        const talentMatch = job.jobMatches[0];

        if (!talentMatch) {
          results.push({ job_id: job.id, status: "skipped", error: "No accepted talent" });
          continue;
        }

        const talentProfile = talentMatch.talentProfile;

        if (!talentProfile.bankCode || !talentProfile.bankAccount) {
          results.push({ job_id: job.id, status: "skipped", error: "Talent has no bank account" });
          continue;
        }

        // Talent receives full escrow amount — platformFee was charged
        // separately on top of this to the client (see escrow/hold route).
        const talentAmount = Number(escrow.amount);
        const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://nyamby.id"}/api/webhooks/xenith/payout`;
        const referenceCode = `AUTO-REL-${job.id.slice(0, 8)}-${Date.now()}`;

        // Trigger Xenith payout
        const payoutResult = await createPayOut(
          {
            initiatedAmount: talentAmount,
            currency: "IDR",
            destinationPayoutMethod: "BANK_TRANSFER",
            destinationPayoutChannel: talentProfile.bankCode,
            destinationPayoutAccount: talentProfile.bankAccount,
            destinationPayoutAccountName: talentProfile.bankAccountName || talentProfile.user.fullName,
            referenceCode,
            customerReference: `auto-release-${job.id}`,
            description: `Auto-release escrow untuk job: ${job.title}`,
            callbackUrl,
          },
          `auto-release-${job.id}`
        );

        // Update database in transaction
        await prisma.$transaction(async (tx) => {
          // Update job status
          await tx.job.update({
            where: { id: job.id },
            data: { status: "completed" },
          });

          // Update escrow status
          await tx.escrowTransaction.update({
            where: { id: escrow.id },
            data: { status: "released", releasedAt: new Date() },
          });

          // Save payout record
          await tx.payout.create({
            data: {
              escrowId: escrow.id,
              xenithPayoutId: payoutResult.data?.id || referenceCode,
              referenceCode,
              customerReference: `auto-release-${job.id}`,
              payoutType: "talent",
              amount: talentAmount,
              destinationAccount: talentProfile.bankAccount!,
              destinationChannel: talentProfile.bankCode!,
              status: "PENDING",
            },
          });

          // Notify talent
          await tx.notification.create({
            data: {
              userId: talentProfile.user.id,
              type: "auto_release",
              message: `Pembayaran untuk job "${job.title}" telah di-release otomatis karena client tidak merespons dalam 5 hari kerja.`,
              relatedJobId: job.id,
              metadata: { amount: talentAmount },
            },
          });

          // Notify client
          await tx.notification.create({
            data: {
              userId: job.client.id,
              type: "auto_release",
              message: `Job "${job.title}" telah selesai secara otomatis dan pembayaran di-release ke talenta karena tidak ada respons dalam 5 hari kerja.`,
              relatedJobId: job.id,
              metadata: { amount: talentAmount },
            },
          });
        });

        results.push({ job_id: job.id, status: "released" });
      } catch (error) {
        console.error(`[AutoRelease] Failed for job ${job.id}:`, error);
        results.push({
          job_id: job.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        results,
        checked_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[AutoRelease]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Subtract N business days from a date (skip Saturday & Sunday)
 */
function subtractBusinessDays(date: Date, days: number): Date {
  let count = 0;
  const result = new Date(date);
  while (count < days) {
    result.setDate(result.getDate() - 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return result;
}
