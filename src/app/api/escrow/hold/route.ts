import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createPayIn } from "@/services/xenith";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa menahan dana" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { job_id, talent_user_id, amount } = body;

    if (!job_id || !talent_user_id || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "job_id, talent_user_id, dan amount (angka positif) wajib diisi" },
        { status: 400 }
      );
    }

    // Verify job ownership
    const job = await prisma.job.findUnique({ where: { id: job_id } });
    if (!job || job.clientUserId !== session.userId) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      );
    }

    // Check existing escrow
    const existing = await prisma.escrowTransaction.findUnique({
      where: { jobId: job_id },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Escrow sudah ada untuk job ini" },
        { status: 400 }
      );
    }

    const platformFee = Math.round(amount * 0.1 * 100) / 100; // 10% fee
    const totalAmount = amount + platformFee; // Ditambahkan ke total tagihan client

    // Save escrow + payment to DB first (status: pending), before calling Xenith
    const referenceCode = `JOB-${job_id}-${Date.now()}`;
    const customerReference = `CUST-${session.userId}`;

    const escrow = await prisma.escrowTransaction.create({
      data: {
        jobId: job_id,
        clientUserId: session.userId,
        talentUserId: talent_user_id,
        amount,
        platformFee,
        status: "pending",
      },
    });

    try {
      // Call Xenith API to create Pay In
      const payInResult = await createPayIn({
        initiatedAmount: totalAmount,
        paymentMethod: "VIRTUAL_ACCOUNT",
        paymentChannel: "BCA.VA",
        referenceCode,
        customerReference,
        customerName: session.fullName || "Client AyoNyamby",
        description: `Pembayaran Escrow untuk Job: ${job.title}`,
        callbackUrl: `${APP_URL}/api/webhooks/xenith/payin`,
        // Return user to escrow page — it shows payment status + active
        // "Cek Status" reconcile (PRD v5.3 §6.13), not the dashboard blind spot
        redirectUrl: `${APP_URL}/client/escrow/${job_id}`,
      });

      // Update escrow with payment record
      await prisma.payment.create({
        data: {
          escrowId: escrow.id,
          xenithPayinId: payInResult.id,
          referenceCode: payInResult.referenceCode || referenceCode,
          customerReference,
          amount: totalAmount,
          paymentCode: payInResult.paymentCode,
          paymentCodeType: payInResult.paymentCodeType,
          status: payInResult.status || "PENDING",
          redirectUrl: payInResult.redirectUrl,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Silakan selesaikan pembayaran untuk memulai.",
          data: {
            escrow_id: escrow.id,
            amount: escrow.amount,
            total_amount: totalAmount,
            platform_fee: escrow.platformFee,
            status: escrow.status,
            payment: {
              payment_code: payInResult.paymentCode,
              redirect_url: payInResult.redirectUrl,
            },
          },
        },
        { status: 201 }
      );
    } catch (xenithError) {
      // Rollback: hapus escrow jika Xenith API gagal
      await prisma.escrowTransaction.delete({ where: { id: escrow.id } });
      console.error("[EscrowHold] Xenith API failed, rolled back escrow:", xenithError);
      return NextResponse.json(
        { success: false, message: "Gagal membuat pembayaran. Silakan coba lagi." },
        { status: 502 }
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[EscrowHold]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
