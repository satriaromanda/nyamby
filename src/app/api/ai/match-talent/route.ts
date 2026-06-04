import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateJobMatches } from "@/lib/openai";

// POST: Talent requests AI match analysis for a specific job
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa menggunakan fitur ini" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { job_id, force_refresh } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, message: "job_id wajib diisi" },
        { status: 400 }
      );
    }

    // Get talent profile
    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: { select: { fullName: true } },
        talentSkills: { include: { skill: true } },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Lengkapi profil talenta terlebih dahulu" },
        { status: 400 }
      );
    }

    // Check if match already exists (skip if force refresh)
    if (!force_refresh) {
      const existingMatch = await prisma.jobMatch.findUnique({
      where: {
        jobId_talentProfileId: {
          jobId: job_id,
          talentProfileId: profile.id,
        },
      },
    });

    if (existingMatch) {
      return NextResponse.json({
        success: true,
        message: "Match sudah ada",
        data: {
          match_id: existingMatch.id,
          match_score: existingMatch.matchScore,
          strengths: existingMatch.strengths,
          gaps: existingMatch.gaps,
          reasoning: existingMatch.reasoning,
          portfolio_evidence: existingMatch.portfolioEvidence,
          recommendation: existingMatch.recommendation,
          status: existingMatch.status,
        },
      });
    }
  }

    // Get job details
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

    if (job.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Job sudah tidak aktif" },
        { status: 400 }
      );
    }

    // Run AI matching for this single talent
    const jobData = {
      title: job.title,
      description: job.description,
      required_skills: job.requiredSkills.map((rs) => rs.skill.name),
      category: job.category,
      budget_range: `${job.budgetMin || 0} - ${job.budgetMax || "Negotiable"} IDR`,
    };

    const talentData = [
      {
        id: profile.id,
        name: profile.user.fullName,
        skills: profile.talentSkills.map((ts) => ({
          name: ts.skill.name,
          level: ts.level,
        })),
        category: profile.category,
        rate: Number(profile.ratePerHour || 0),
        bio: profile.bio || "",
        cv_text: profile.cvText,
        portfolio_context: profile.portfolioContext,
      },
    ];

    const matches = await generateJobMatches(jobData, talentData);
    const matchResult = matches[0];

    if (!matchResult) {
      return NextResponse.json(
        { success: false, message: "AI tidak dapat memproses matching" },
        { status: 500 }
      );
    }

    // Save match to DB
    const savedMatch = await prisma.jobMatch.create({
      data: {
        jobId: job_id,
        talentProfileId: profile.id,
        matchScore: matchResult.match_score,
        strengths: matchResult.strengths,
        gaps: matchResult.gaps,
        reasoning: matchResult.reasoning,
        portfolioEvidence: matchResult.portfolio_evidence || null,
        recommendation: matchResult.recommendation,
        status: "recommended",
      },
    });

    return NextResponse.json({
      success: true,
      message: "AI Match Analysis selesai!",
      data: {
        match_id: savedMatch.id,
        match_score: savedMatch.matchScore,
        strengths: savedMatch.strengths,
        gaps: savedMatch.gaps,
        reasoning: savedMatch.reasoning,
        portfolio_evidence: savedMatch.portfolioEvidence,
        recommendation: savedMatch.recommendation,
        status: savedMatch.status,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[MatchTalent]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
