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

    const allTalents = await prisma.talentProfile.findMany({
      where: { category: job.category },
      include: {
        user: { select: { fullName: true } },
        talentSkills: { include: { skill: true } },
      },
    });

    const jobData = {
      title: job.title,
      description: job.description,
      required_skills: job.requiredSkills.map((rs) => rs.skill.name),
      category: job.category,
      budget_range: `${job.budgetMin || 0} - ${job.budgetMax || "Negotiable"} IDR`,
    };

    const talentData = allTalents.map((t) => ({
      id: t.id,
      name: t.user.fullName,
      skills: t.talentSkills.map((ts) => ({ name: ts.skill.name, level: ts.level })),
      category: t.category,
      rate: Number(t.ratePerHour || 0),
      bio: t.bio || "",
      cv_text: t.cvText,
      portfolio_context: t.portfolioContext,
    }));

    const matches = await generateJobMatches(jobData, talentData);

    // Clear old matches and save new ones
    await prisma.jobMatch.deleteMany({ where: { jobId: job_id } });

    for (const match of matches) {
      await prisma.jobMatch.create({
        data: {
          jobId: job_id,
          talentProfileId: match.talent_id,
          matchScore: match.match_score,
          strengths: match.strengths,
          gaps: match.gaps,
          reasoning: match.reasoning,
          portfolioEvidence: match.portfolio_evidence || null,
          recommendation: match.recommendation,
        },
      });
    }

    const topMatch = matches.sort((a, b) => b.match_score - a.match_score)[0];

    return NextResponse.json({
      success: true,
      message: `Matching selesai. ${matches.length} talenta dievaluasi.`,
      data: {
        job_id,
        matches_generated: matches.length,
        top_match: topMatch
          ? {
              talent_id: topMatch.talent_id,
              match_score: topMatch.match_score,
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
