import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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

    if (!job_id || !talent_user_id || !amount) {
      return NextResponse.json(
        { success: false, message: "job_id, talent_user_id, dan amount wajib diisi" },
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

    const escrow = await prisma.escrowTransaction.create({
      data: {
        jobId: job_id,
        clientUserId: session.userId,
        talentUserId: talent_user_id,
        amount,
        platformFee,
        status: "held",
        heldAt: new Date(),
      },
    });

    // Update job status
    await prisma.job.update({
      where: { id: job_id },
      data: { status: "in_progress" },
    });

    // Notify talent
    await prisma.notification.create({
      data: {
        userId: talent_user_id,
        type: "payment_held",
        message: `Dana Rp ${amount.toLocaleString("id-ID")} telah ditahan untuk job: ${job.title}. Anda bisa mulai bekerja!`,
        relatedJobId: job_id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Dana berhasil ditahan. Talenta dapat mulai bekerja.",
        data: {
          escrow_id: escrow.id,
          amount: escrow.amount,
          platform_fee: escrow.platformFee,
          status: escrow.status,
        },
      },
      { status: 201 }
    );
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
