import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getPayInStatus } from "@/services/xenith";
import { applyPayInStatus } from "@/lib/payment-reconciliation";

/**
 * POST /api/escrow/[jobId]/reconcile
 *
 * PRD v5.3 §6.13 — active status recovery. When the passive Xenith webhook never
 * lands (callback URL unreachable in sandbox/localhost), the client "Cek Status"
 * button hits this route: pull the real status from Xenith and apply it via the
 * SAME logic the webhook uses (payment-reconciliation.ts), so the two never diverge.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await requireAuth();

    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa cek status pembayaran" },
        { status: 403 }
      );
    }

    // Verify job ownership
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.clientUserId !== session.userId) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      );
    }

    // Locate the Payment via the escrow tied to this job
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { jobId },
      include: { payment: true },
    });

    if (!escrow || !escrow.payment) {
      return NextResponse.json(
        { success: false, message: "Belum ada pembayaran untuk job ini" },
        { status: 404 }
      );
    }

    const payment = escrow.payment;

    // Already settled → nothing to reconcile, just report current status
    if (payment.status !== "PENDING") {
      return NextResponse.json({
        success: true,
        message: "Status sudah final",
        data: { status: payment.status, changed: false },
      });
    }

    // Actively ask Xenith for the latest status
    const remote = await getPayInStatus(payment.xenithPayinId);
    if (!remote.status) {
      return NextResponse.json(
        { success: false, message: "Status dari Xenith tidak terbaca. Coba lagi nanti." },
        { status: 502 }
      );
    }

    const result = await applyPayInStatus(payment.id, remote.status, remote.currency ?? null);

    return NextResponse.json({
      success: true,
      message: result.changed ? "Status diperbarui" : "Belum ada perubahan status",
      data: { status: result.status, changed: result.changed },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[EscrowReconcile]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
