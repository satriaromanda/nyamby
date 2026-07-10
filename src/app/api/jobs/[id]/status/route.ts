import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const { status, submission_url, submission_notes } = body;

    // State machine: only allow legal transitions
    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      active: ["matched", "cancelled"],
      matched: ["in_progress", "active", "cancelled"],
      in_progress: ["submitted_for_review", "disputed", "cancelled"],
      submitted_for_review: ["revision_requested", "completed", "disputed"],
      revision_requested: ["submitted_for_review", "disputed", "cancelled"],
      disputed: ["cancelled"],      // only admin/webhook resolves disputes
      completed: [],                 // terminal state
      cancelled: [],                 // terminal state
    };

    if (!["active", "matched", "in_progress", "submitted_for_review", "revision_requested", "completed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 }
      );
    }

    const allowed = ALLOWED_TRANSITIONS[job.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Tidak bisa mengubah status dari '${job.status}' ke '${status}'` },
        { status: 400 }
      );
    }

    const isClientOwner = job.clientUserId === session.userId;
    let isAssignedTalent = false;

    if (session.role === "talent") {
      const match = await prisma.jobMatch.findFirst({
        where: {
          jobId: id,
          talentProfile: { userId: session.userId },
          status: "accepted"
        }
      });
      if (match) isAssignedTalent = true;
    }

    if (!isClientOwner && !isAssignedTalent) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses untuk mengubah job ini" },
        { status: 403 }
      );
    }

    // Talent only allowed to set 'submitted_for_review'
    if (isAssignedTalent && !isClientOwner && status !== "submitted_for_review") {
      return NextResponse.json(
        { success: false, message: "Talenta hanya dapat mengubah status menjadi submitted_for_review" },
        { status: 403 }
      );
    }

    // Gate: transisi kerja hanya boleh saat dana escrow sudah ter-hold.
    // Mencegah talenta submit / client menyelesaikan sebelum dana diamankan.
    const escrowGatedStatuses = ["submitted_for_review", "revision_requested", "completed"];
    if (escrowGatedStatuses.includes(status)) {
      const escrow = await prisma.escrowTransaction.findUnique({
        where: { jobId: id },
        select: { status: true },
      });
      if (!escrow || escrow.status !== "held") {
        return NextResponse.json(
          { success: false, message: "Dana escrow belum ditahan. Pembayaran harus diselesaikan terlebih dahulu." },
          { status: 400 }
        );
      }
    }

    // Deliverable Notifications based on PRD 4B.4
    if (status === "submitted_for_review") {
      await prisma.notification.create({
        data: {
          userId: job.clientUserId,
          type: "deliverable_submitted",
          message: `Talenta telah mengunggah hasil kerja untuk ${job.title}. Silakan review.`,
          relatedJobId: job.id,
        },
      });
    } else if (status === "revision_requested") {
      const match = await prisma.jobMatch.findFirst({ where: { jobId: id, status: "accepted" }, include: { talentProfile: true } });
      if (match) {
        await prisma.notification.create({
          data: {
            userId: match.talentProfile.userId,
            type: "revision_requested",
            message: `Client meminta revisi untuk ${job.title}.`,
            relatedJobId: job.id,
          },
        });
      }
    } else if (status === "completed") {
      const match = await prisma.jobMatch.findFirst({ where: { jobId: id, status: "accepted" }, include: { talentProfile: true } });
      if (match) {
        await prisma.notification.create({
          data: {
            userId: match.talentProfile.userId,
            type: "job_completed",
            message: `Pekerjaan ${job.title} selesai! Client telah menyetujui hasil.`,
            relatedJobId: job.id,
          },
        });
      }
    }

    // Build update data — include submission fields when submitting for review
    const updateData: Record<string, unknown> = { status };
    if (status === "submitted_for_review") {
      updateData.submittedAt = new Date();
      if (submission_url) updateData.submissionUrl = submission_url;
      if (submission_notes) updateData.submissionNotes = submission_notes;
    }

    await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Status berhasil diupdate",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[JobStatus]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
