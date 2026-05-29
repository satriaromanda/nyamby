import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await prisma.talentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        talentSkills: { include: { skill: true } },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        full_name: profile.user.fullName,
        avatar_url: profile.user.avatarUrl,
        bio: profile.bio,
        category: profile.category,
        rate_per_hour: profile.ratePerHour,
        rate_per_project: profile.ratePerProject,
        availability: profile.availability,
        location: profile.location,
        portfolio_url: profile.portfolioUrl,
        skills: profile.talentSkills.map((ts) => ({
          name: ts.skill.name,
          level: ts.level,
          category: ts.skill.category,
        })),
      },
    });
  } catch (error) {
    console.error("[ProfileGet]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
