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
    const { status } = body;

    if (!["applied", "accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status harus applied, accepted, atau rejected" },
        { status: 400 }
      );
    }

    const match = await prisma.jobMatch.findUnique({
      where: { id },
      include: { job: true, talentProfile: true },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, message: "Match tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.jobMatch.update({
      where: { id },
      data: { status },
    });

    // Send notification
    if (status === "applied") {
      // Notify the client
      await prisma.notification.create({
        data: {
          userId: match.job.clientUserId,
          type: "job_accepted",
          message: `Talenta telah melamar untuk job: ${match.job.title}`,
          relatedJobId: match.jobId,
        },
      });
    } else if (status === "accepted") {
      // Update job status to in_progress
      await prisma.job.update({
        where: { id: match.jobId },
        data: { status: "in_progress" },
      });

      await prisma.notification.create({
        data: {
          userId: match.talentProfile.userId,
          type: "job_accepted",
          message: `Selamat! Kamu diterima untuk job: ${match.job.title}`,
          relatedJobId: match.jobId,
        },
      });
    } else if (status === "rejected") {
      await prisma.notification.create({
        data: {
          userId: match.talentProfile.userId,
          type: "job_rejected",
          message: `Job ${match.job.title} tidak dilanjutkan.`,
          relatedJobId: match.jobId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Status match diupdate",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[MatchStatus]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
