import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST /api/ratings — PRD §3.3: Client rates a talent after job completion
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // PRD §3.3 #1: Only clients can rate
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa memberi rating" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { job_id, score, comment } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, message: "job_id wajib diisi" },
        { status: 400 }
      );
    }

    // PRD §3.3 #4: Score validation
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return NextResponse.json(
        { success: false, message: "Score harus integer antara 1–5" },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment !== undefined && comment !== null && typeof comment === "string" && comment.length > 500) {
      return NextResponse.json(
        { success: false, message: "Komentar maksimal 500 karakter" },
        { status: 400 }
      );
    }

    // Fetch job with accepted talent match
    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: {
        jobMatches: {
          where: { status: "accepted" },
          include: { talentProfile: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 }
      );
    }

    // PRD §3.3 #1: Job ownership check
    if (job.clientUserId !== session.userId) {
      return NextResponse.json(
        { success: false, message: "Anda bukan pemilik job ini" },
        { status: 403 }
      );
    }

    // PRD §3.3 #2: Job must be completed
    if (job.status !== "completed") {
      return NextResponse.json(
        { success: false, message: "Rating hanya bisa diberikan setelah job selesai (status: completed)" },
        { status: 400 }
      );
    }

    // Find the assigned talent
    const acceptedMatch = job.jobMatches[0];
    if (!acceptedMatch) {
      return NextResponse.json(
        { success: false, message: "Tidak ada talenta yang di-assign ke job ini" },
        { status: 400 }
      );
    }

    // PRD §3.3 #3: Idempotency — check no existing rating for this job
    const existingRating = await prisma.talentRating.findUnique({
      where: { jobId: job_id },
    });

    if (existingRating) {
      return NextResponse.json(
        { success: false, message: "Job ini sudah diberi rating" },
        { status: 400 }
      );
    }

    // Create rating + send notification in a transaction
    const rating = await prisma.$transaction(async (tx) => {
      const newRating = await tx.talentRating.create({
        data: {
          jobId: job_id,
          talentProfileId: acceptedMatch.talentProfileId,
          clientUserId: session.userId,
          score,
          comment: comment?.trim() || null,
        },
      });

      // PRD §3.3 #5: Notify talent
      await tx.notification.create({
        data: {
          userId: acceptedMatch.talentProfile.userId,
          type: "new_rating",
          message: `Kamu mendapat rating ${score} bintang dari ${session.fullName} untuk job "${job.title}"`,
          relatedJobId: job_id,
          metadata: { rating_id: newRating.id, score },
        },
      });

      return newRating;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Rating berhasil diberikan",
        data: {
          rating_id: rating.id,
          job_id: rating.jobId,
          talent_profile_id: rating.talentProfileId,
          score: rating.score,
          comment: rating.comment,
          created_at: rating.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[PostRating]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
