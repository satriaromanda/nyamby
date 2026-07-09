import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createPayIn } from "@/services/xenith";
import { logger } from "@/lib/logger";

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
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, message: "job_id wajib diisi" },
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

    // Talent dan amount ditentukan server-side dari match yang sudah accepted —
    // tidak menerima input client agar tidak bisa dimanipulasi
    const acceptedMatch = await prisma.jobMatch.findFirst({
      where: { jobId: job_id, status: "accepted" },
      include: { talentProfile: { select: { userId: true } } },
    });
    if (!acceptedMatch) {
      return NextResponse.json(
        { success: false, message: "Belum ada talenta yang menerima tawaran untuk job ini" },
        { status: 400 }
      );
    }
    const talentUserId = acceptedMatch.talentProfile.userId;

    const amount = Number(job.budgetMax || job.budgetMin || 0);
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Job belum memiliki budget. Lengkapi budget job terlebih dahulu." },
        { status: 400 }
      );
    }

    // Check existing escrow
    const existing = await prisma.escrowTransaction.findUnique({
      where: { jobId: job_id },
      include: { payment: true },
    });
    if (existing) {
      // Escrow pending dengan pembayaran yang belum selesai — kembalikan
      // instruksi pembayaran yang sama agar client bisa melanjutkan
      if (existing.status === "pending" && existing.payment && existing.payment.status === "PENDING") {
        return NextResponse.json({
          success: true,
          message: "Pembayaran sebelumnya masih menunggu. Silakan selesaikan pembayaran.",
          data: {
            escrow_id: existing.id,
            amount: existing.amount,
            total_amount: existing.payment.amount,
            platform_fee: existing.platformFee,
            status: existing.status,
            payment: {
              payment_code: existing.payment.paymentCode,
              payment_code_type: existing.payment.paymentCodeType,
              redirect_url: existing.payment.redirectUrl,
            },
          },
        });
      }
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
        talentUserId,
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
        paymentChannel: "BNI.VA",
        referenceCode,
        customerReference,
        customerName: session.fullName || "Client Nyamby",
        description: `Pembayaran Escrow untuk Job: ${job.title}`,
        callbackUrl: `${APP_URL}/api/webhooks/xenith/payin`,
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
              payment_code_type: payInResult.paymentCodeType,
              redirect_url: payInResult.redirectUrl,
            },
          },
        },
        { status: 201 }
      );
    } catch (xenithError) {
      // Rollback: hapus escrow jika Xenith API gagal
      await prisma.escrowTransaction.delete({ where: { id: escrow.id } });
      logger.error("escrow", "Xenith Pay In gagal, escrow di-rollback", {
        job_id,
        escrow_id: escrow.id,
        total_amount: totalAmount,
        error: xenithError,
      });
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
