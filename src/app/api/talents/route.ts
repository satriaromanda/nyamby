import { NextRequest, NextResponse } from "next/server";
import { Prisma, TalentCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const skill = searchParams.get("skill");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 50);

    const where: Prisma.TalentProfileWhereInput = {};
    if (category && Object.values(TalentCategory).includes(category as TalentCategory)) {
      where.category = category as TalentCategory;
    }
    if (skill) {
      where.talentSkills = {
        some: { skill: { name: { contains: skill, mode: "insensitive" } } },
      };
    }

    const [talents, total] = await Promise.all([
      prisma.talentProfile.findMany({
        where,
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          talentSkills: { include: { skill: true } },
          jobMatches: { select: { matchScore: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.talentProfile.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        talents: talents.map((talent) => {
          const scores = talent.jobMatches.map((match) => Number(match.matchScore));
          const averageMatchScore =
            scores.length > 0
              ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
              : null;

          return {
            id: talent.id,
            full_name: talent.user.fullName,
            avatar_url: talent.user.avatarUrl,
            bio: talent.bio,
            category: talent.category,
            rate_per_hour: talent.ratePerHour,
            rate_per_project: talent.ratePerProject,
            availability: talent.availability,
            location: talent.location,
            portfolio_url: talent.portfolioUrl,
            has_cv_enrichment: Boolean(talent.cvText),
            has_portfolio_enrichment: Boolean(talent.portfolioContext),
            average_match_score: averageMatchScore,
            skills: talent.talentSkills.map((talentSkill) => ({
              name: talentSkill.skill.name,
              level: talentSkill.level,
              category: talentSkill.skill.category,
            })),
          };
        }),
        pagination: { page, limit, total },
      },
    });
  } catch (error) {
    console.error("[ListTalents]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
