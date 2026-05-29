import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa rilis dana" },
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

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { jobId: job_id },
      include: { job: true },
    });

    if (!escrow) {
      return NextResponse.json(
        { success: false, message: "Escrow tidak ditemukan" },
        { status: 404 }
      );
    }

    if (escrow.clientUserId !== session.userId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses" },
        { status: 403 }
      );
    }

    if (escrow.status !== "held") {
      return NextResponse.json(
        { success: false, message: "Dana sudah dirilis atau di-refund" },
        { status: 400 }
      );
    }

    const updated = await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: {
        status: "released",
        releasedAt: new Date(),
      },
    });

    // Update job status to completed
    await prisma.job.update({
      where: { id: job_id },
      data: { status: "completed" },
    });

    // Notify talent
    await prisma.notification.create({
      data: {
        userId: escrow.talentUserId,
        type: "payment_released",
        message: `Dana Rp ${Number(escrow.amount).toLocaleString("id-ID")} telah dirilis untuk job: ${escrow.job.title}. Selamat!`,
        relatedJobId: job_id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dana berhasil dirilis ke talenta. Job selesai!",
      data: {
        escrow_id: updated.id,
        status: updated.status,
        released_at: updated.releasedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[EscrowRelease]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
