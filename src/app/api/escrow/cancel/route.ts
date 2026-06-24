import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { job_id, reason, description } = body;

    if (!job_id || !description) {
      return NextResponse.json(
        { success: false, message: "job_id dan description wajib diisi" },
        { status: 400 }
      );
    }

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { jobId: job_id },
      include: { job: true },
    });

    if (!escrow) {
      return NextResponse.json(
        { success: false, message: "Escrow tidak ditemukan untuk job ini" },
        { status: 404 }
      );
    }

    // Hanya client pemilik job atau talent yang terlibat yang bisa membatalkan
    const isClient = escrow.clientUserId === session.userId;
    const isTalent = escrow.talentUserId === session.userId;

    if (!isClient && !isTalent) {
      return NextResponse.json(
        { success: false, message: "Anda bukan peserta dalam job ini" },
        { status: 403 }
      );
    }

    if (escrow.status !== "held") {
      return NextResponse.json(
        { success: false, message: "Escrow tidak dalam status aktif (held)" },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada dispute yang masih terbuka untuk job ini
    const existingDispute = await prisma.disputeTicket.findFirst({
      where: {
        jobId: job_id,
        status: { in: ["open", "investigating"] },
      },
    });

    if (existingDispute) {
      return NextResponse.json(
        { success: false, message: "Sudah ada dispute yang sedang diproses untuk job ini" },
        { status: 400 }
      );
    }

    // Tentukan reason berdasarkan role
    const disputeReason = reason || (isTalent ? "talent_resign" : "cancellation");

    // Buat DisputeTicket dan update job status dalam satu transaksi
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.disputeTicket.create({
        data: {
          jobId: job_id,
          escrowId: escrow.id,
          initiatorUserId: session.userId,
          reason: disputeReason,
          description,
          status: "open",
        },
      });

      // Update job status ke disputed
      await tx.job.update({
        where: { id: job_id },
        data: { status: "disputed" },
      });

      // Notifikasi ke pihak lawan
      const otherUserId = isClient ? escrow.talentUserId : escrow.clientUserId;
      const initiatorRole = isClient ? "Client" : "Talent";

      await tx.notification.create({
        data: {
          userId: otherUserId,
          type: "dispute_opened",
          message: `${initiatorRole} mengajukan pembatalan untuk job "${escrow.job.title}". Tim AyoNyamby akan meninjau dan menentukan keputusan.`,
          relatedJobId: job_id,
          metadata: { dispute_id: ticket.id, reason: disputeReason },
        },
      });

      // Notifikasi ke initiator (konfirmasi)
      await tx.notification.create({
        data: {
          userId: session.userId,
          type: "dispute_opened",
          message: `Pengajuan pembatalan untuk job "${escrow.job.title}" telah diterima. Tim AyoNyamby akan meninjau dalam 1-3 hari kerja.`,
          relatedJobId: job_id,
          metadata: { dispute_id: ticket.id },
        },
      });

      return ticket;
    });

    return NextResponse.json({
      success: true,
      message: "Pengajuan pembatalan berhasil. Menunggu keputusan arbitrasi tim AyoNyamby.",
      data: {
        dispute_id: result.id,
        job_id,
        status: "open",
        reason: disputeReason,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[EscrowCancel]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
