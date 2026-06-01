import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa akses ini" },
        { status: 403 }
      );
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profil belum dibuat" },
        { status: 404 }
      );
    }

    const analysis = await prisma.skillGapAnalysis.findFirst({
      where: { talentProfileId: profile.id, isLatest: true },
      orderBy: { generatedAt: "desc" },
    });

    if (!analysis) {
      return NextResponse.json(
        { success: false, message: "Belum ada analisis skill gap" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        generated_at: analysis.generatedAt,
        recommendations: analysis.recommendedSkills,
        summary: analysis.summary,
        profile_completeness_score: analysis.profileCompletenessScore,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[SkillGap]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
