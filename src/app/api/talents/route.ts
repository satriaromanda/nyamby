import { NextRequest, NextResponse } from "next/server";
import { Prisma, TalentCategory, Availability } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaginationParams, buildPaginationMeta } from "@/lib/paginate";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, per_page, skip, take } = getPaginationParams(searchParams);

    const category = searchParams.get("category");
    const skills = searchParams.getAll("skill");
    const availability = searchParams.get("availability");
    const minRate = searchParams.get("min_rate");
    const maxRate = searchParams.get("max_rate");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause
    const where: Prisma.TalentProfileWhereInput = {};

    if (category && Object.values(TalentCategory).includes(category as TalentCategory)) {
      where.category = category as TalentCategory;
    }
    if (skills.length > 0) {
      where.talentSkills = {
        some: { skill: { name: { in: skills, mode: "insensitive" } } },
      };
    }
    if (availability && Object.values(Availability).includes(availability as Availability)) {
      where.availability = availability as Availability;
    }
    if (minRate || maxRate) {
      where.ratePerHour = {};
      if (minRate) where.ratePerHour.gte = Number(minRate);
      if (maxRate) where.ratePerHour.lte = Number(maxRate);
    }
    if (q) {
      where.OR = [
        { user: { fullName: { contains: q, mode: "insensitive" } } },
        { bio: { contains: q, mode: "insensitive" } },
        { talentSkills: { some: { skill: { name: { contains: q, mode: "insensitive" } } } } },
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

    return NextResponse.json({
      success: true,
      data: talents.map((talent) => ({
        id: talent.id,
        full_name: talent.user.fullName,
        avatar_url: talent.user.avatarUrl,
        bio: talent.bio,
        category: talent.category,
        rate_per_hour: talent.ratePerHour,
        availability: talent.availability,
        location: talent.location,
        portfolio_url: talent.portfolioUrl,
        skills: talent.talentSkills.map((ts) => ({
          name: ts.skill.name,
          level: ts.level,
          category: ts.skill.category,
        })),
      })),
      pagination: buildPaginationMeta(total, page, per_page),
    });
  } catch (error) {
    console.error("[ListTalents]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
