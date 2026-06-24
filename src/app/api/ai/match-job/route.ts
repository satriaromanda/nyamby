import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateJobMatches } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, message: "job_id wajib diisi" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: { requiredSkills: { include: { skill: true } } },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 }
      );
    }

    const { runAiJobMatching } = await import("@/services/ai-matching");
    await runAiJobMatching(job_id, job.category);

    // Fetch the newly generated matches
    const generatedMatches = await prisma.jobMatch.findMany({
      where: { jobId: job_id },
      orderBy: { matchScore: "desc" },
    });

    const topMatch = generatedMatches[0];

    return NextResponse.json({
      success: true,
      message: `Matching selesai. ${generatedMatches.length} talenta dimatch.`,
      data: {
        job_id,
        matches_generated: generatedMatches.length,
        top_match: topMatch
          ? {
              talent_id: topMatch.talentProfileId,
              match_score: Number(topMatch.matchScore),
              recommendation: topMatch.recommendation,
            }
          : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[AIMatchJob]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
