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
    const { status, rejection_reason } = body;

    if (!["applied", "offered", "accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status harus applied, offered, accepted, atau rejected" },
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

    const isTalentOwner = session.role === "talent" && session.userId === match.talentProfile.userId;
    const isClientOwner = session.role === "client" && session.userId === match.job.clientUserId;
    
    if (status === "applied" && !isTalentOwner) {
      return NextResponse.json(
        { success: false, message: "Hanya talenta pemilik match yang bisa melamar" },
        { status: 403 }
      );
    }
    if (status === "offered" && !isClientOwner) {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa mengirim tawaran" },
        { status: 403 }
      );
    }
    // Allow both talent and client to accept/reject depending on the scenario
    if ((status === "accepted" || status === "rejected") && !isClientOwner && !isTalentOwner) {
      return NextResponse.json(
        { success: false, message: "Hanya pihak terkait yang bisa mengubah status ini" },
        { status: 403 }
      );
    }

    await prisma.jobMatch.update({
      where: { id },
      data: { 
        status,
        rejectionReason: rejection_reason || null
      },
    });

    // Send notification based on PRD 4B.4
    if (status === "applied") {
      await prisma.notification.create({
        data: {
          userId: match.job.clientUserId,
          type: "new_application",
          message: `Ada talenta baru melamar ${match.job.title}`,
          relatedJobId: match.jobId,
        },
      });
    } else if (status === "offered") {
      await prisma.notification.create({
        data: {
          userId: match.talentProfile.userId,
          type: "job_offer",
          message: `Kamu mendapat tawaran job dari Client untuk: ${match.job.title}`,
          relatedJobId: match.jobId,
        },
      });
    } else if (status === "accepted") {
      if (session.role === "talent") {
        await prisma.notification.create({
          data: {
            userId: match.job.clientUserId,
            type: "offer_accepted",
            message: `Talenta menerima tawaran untuk ${match.job.title}. Konfirmasi pembayaran.`,
            relatedJobId: match.jobId,
          },
        });
      }
    } else if (status === "rejected") {
      if (session.role === "talent") {
        await prisma.notification.create({
          data: {
            userId: match.job.clientUserId,
            type: "offer_rejected",
            message: `Talenta menolak tawaran job ${match.job.title}`,
            relatedJobId: match.jobId,
          },
        });
      }
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
