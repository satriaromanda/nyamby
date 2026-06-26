import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/talent/profile/:id/ratings — PRD §3.4
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await prisma.talentProfile.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profil talenta tidak ditemukan" },
        { status: 404 }
      );
    }

    const ratings = await prisma.talentRating.findMany({
      where: { talentProfileId: id },
      include: {
        client: {
          select: { fullName: true },
        },
        job: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average
    const totalRatings = ratings.length;
    const averageScore = totalRatings > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings) * 10) / 10
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        average_score: averageScore,
        total_ratings: totalRatings,
        ratings: ratings.map((r) => ({
          score: r.score,
          comment: r.comment,
          client_name: r.client.fullName,
          job_title: r.job.title,
          created_at: r.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("[TalentRatings]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
