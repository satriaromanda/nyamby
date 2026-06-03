import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getPaginationParams, buildPaginationMeta } from "@/lib/paginate";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa akses endpoint ini" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { page, per_page, skip, take } = getPaginationParams(searchParams);
    const jobId = searchParams.get("job_id");
    const category = searchParams.get("category");
    const skill = searchParams.get("skill");
    const maxRate = searchParams.get("max_rate");
    const availability = searchParams.get("availability");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause
    const where: Prisma.TalentProfileWhereInput = {};

    if (category) {
      where.category = category as Prisma.EnumTalentCategoryFilter;
    }
    if (skill) {
      where.talentSkills = {
        some: { skill: { name: { contains: skill, mode: "insensitive" } } },
      };
    }
    if (maxRate) {
      where.ratePerHour = { lte: Number(maxRate) };
    }
    if (availability) {
      where.availability = availability as Prisma.EnumAvailabilityFilter;
    }
    if (q) {
      where.OR = [
        { user: { fullName: { contains: q, mode: "insensitive" } } },
        { bio: { contains: q, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.TalentProfileOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "rate_asc") orderBy = { ratePerHour: "asc" };
    if (sort === "rate_desc") orderBy = { ratePerHour: "desc" };

    const [talents, total] = await Promise.all([
      prisma.talentProfile.findMany({
        where,
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          talentSkills: { include: { skill: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.talentProfile.count({ where }),
    ]);

    // If job_id provided, fetch match scores for each talent
    let matchScoreMap: Record<string, { score: number; status: string; reasoning: string }> = {};
    if (jobId) {
      const matches = await prisma.jobMatch.findMany({
        where: { jobId },
        select: { talentProfileId: true, matchScore: true, status: true, reasoning: true },
      });
      for (const m of matches) {
        matchScoreMap[m.talentProfileId] = {
          score: Number(m.matchScore),
          status: m.status,
          reasoning: m.reasoning,
        };
      }
    }

    const data = talents.map((t) => {
      const matchInfo = matchScoreMap[t.id];
      return {
        id: t.id,
        full_name: t.user.fullName,
        avatar_url: t.user.avatarUrl,
        category: t.category,
        rate_per_hour: t.ratePerHour,
        availability: t.availability,
        location: t.location,
        skills: t.talentSkills.map((ts) => ts.skill.name),
        match_score: matchInfo?.score ?? null,
        match_status: matchInfo?.status ?? null,
        match_reasoning: matchInfo?.reasoning ?? null,
      };
    });

    // Sort by match_score_desc if requested and job_id is provided
    if (sort === "match_score_desc" && jobId) {
      data.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    }

    return NextResponse.json({
      success: true,
      data: {
        talents: data,
        pagination: buildPaginationMeta(total, page, per_page),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[ClientSearchTalents]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
