import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, isWebhookTimestampValid } from "@/services/xenith";
import { logger } from "@/lib/logger";
import { applyPayInStatus } from "@/lib/payment-reconciliation";

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
    const originCurrencyRaw = payload.data?.currency || payload.data?.originCurrency || null;

    const payment = await prisma.payment.findUnique({
      where: { xenithPayinId: id },
      select: { id: true, escrowId: true },
    });

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    // Delegate DB update to shared reconciliation logic (single source of truth,
    // shared with POST /api/escrow/[jobId]/reconcile). Idempotency handled inside.
    await applyPayInStatus(payment.id, status, originCurrencyRaw);

    logger.info("webhook", `PayIn ${status} diproses`, { xenithPayinId: id, escrowId: payment.escrowId });
    return NextResponse.json({ success: true, message: "OK" });
  } catch (error) {
    logger.error("webhook", "PayIn webhook gagal diproses", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
