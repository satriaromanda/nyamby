import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST: User (talent or client) opens a dispute ticket — PRD §2.2
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { job_id, reason, description } = body;

    // --- Basic field validation ---
    if (!job_id || !reason || !description) {
      return NextResponse.json(
        { success: false, message: "job_id, reason, dan description wajib diisi" },
        { status: 400 }
      );
    }

    const validReasons = ["ghosting", "rejected_work", "low_quality", "cancellation", "talent_resign"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, message: `reason harus salah satu dari: ${validReasons.join(", ")}` },
        { status: 400 }
      );
    }

    if (typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { success: false, message: "Deskripsi dispute minimal 20 karakter" },
        { status: 400 }
      );
    }

    // --- Fetch job + escrow ---
    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: { escrowTransaction: true },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!job.escrowTransaction) {
      return NextResponse.json(
        { success: false, message: "Tidak ada escrow untuk job ini" },
        { status: 400 }
      );
    }

    // --- PRD §2.3 #1: Job ownership check ---
    const isClient = job.clientUserId === session.userId;
    const isTalent = job.escrowTransaction.talentUserId === session.userId;

    if (!isClient && !isTalent) {
      return NextResponse.json(
        { success: false, message: "Anda bukan pihak yang terlibat dalam job ini" },
        { status: 403 }
      );
    }

    // --- PRD §2.3 #2: Job status check ---
    if (!["in_progress", "submitted_for_review"].includes(job.status)) {
      return NextResponse.json(
        { success: false, message: "Dispute hanya bisa diajukan saat job berstatus in_progress atau submitted_for_review" },
        { status: 400 }
      );
    }

    // --- PRD §2.3 #3: Escrow check ---
    if (job.escrowTransaction.status !== "held") {
      return NextResponse.json(
        { success: false, message: "Dispute hanya bisa diajukan saat escrow berstatus held" },
        { status: 400 }
      );
    }

    // --- PRD §2.3 #4: Duplicate check ---
    const existingDispute = await prisma.disputeTicket.findFirst({
      where: {
        jobId: job_id,
        status: { in: ["open", "investigating"] },
      },
    });

    if (existingDispute) {
      return NextResponse.json(
        { success: false, message: "Sudah ada dispute aktif untuk job ini" },
        { status: 400 }
      );
    }

    // --- PRD §2.3 #5 & #6: Create dispute + update job status + notify ---
    const result = await prisma.$transaction(async (tx) => {
      // Create dispute ticket
      const ticket = await tx.disputeTicket.create({
        data: {
          jobId: job.id,
          escrowId: job.escrowTransaction!.id,
          initiatorUserId: session.userId,
          reason,
          description: description.trim(),
          status: "open",
        },
      });

      // Update job status to 'disputed'
      await tx.job.update({
        where: { id: job_id },
        data: { status: "disputed" },
      });

      // Determine the other party for notification
      const otherPartyUserId = isClient
        ? job.escrowTransaction!.talentUserId
        : job.clientUserId;

      // Notify the other party
      await tx.notification.create({
        data: {
          userId: otherPartyUserId,
          type: "dispute_opened",
          message: `Dispute diajukan untuk job "${job.title}". Alasan: ${reason}.`,
          relatedJobId: job.id,
          metadata: { dispute_id: ticket.id, reason },
        },
      });

      // Notify admin(s)
      const admins = await tx.user.findMany({
        where: { role: "admin" },
        select: { id: true },
      });

      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "dispute_opened_admin",
            message: `Dispute baru untuk job "${job.title}" oleh ${session.fullName}. Alasan: ${reason}.`,
            relatedJobId: job.id,
            metadata: { dispute_id: ticket.id, reason, initiator_role: isClient ? "client" : "talent" },
          })),
        });
      }

      return ticket;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Dispute berhasil diajukan. Admin akan meninjau dalam 48 jam.",
        data: {
          dispute_id: result.id,
          job_id: result.jobId,
          reason: result.reason,
          status: result.status,
          created_at: result.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[PostDispute]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
