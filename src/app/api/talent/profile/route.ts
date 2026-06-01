import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET: Fetch current talent's own profile for editing
export async function GET() {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa akses profil ini" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
      include: {
        talentSkills: { include: { skill: true } },
      },
    });

    if (!user || !profile) {
      return NextResponse.json(
        { success: false, message: "Profil belum dibuat" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profile_id: profile.id,
        user_id: user.id,
        email: user.email,
        full_name: user.fullName,
        avatar_url: user.avatarUrl,
        created_at: user.createdAt,
        bio: profile.bio,
        category: profile.category,
        rate_per_hour: profile.ratePerHour,
        rate_per_project: profile.ratePerProject,
        availability: profile.availability,
        location: profile.location,
        portfolio_url: profile.portfolioUrl,
        portfolio_file: profile.portfolioFile,
        cv_file: profile.cvFile,
        cv_text: profile.cvText,
        portfolio_context: profile.portfolioContext,
        skills: profile.talentSkills.map((ts) => ({
          id: ts.skillId,
          name: ts.skill.name,
          level: ts.level,
          category: ts.skill.category,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[TalentProfileGet]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa update profil" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bio, rate_per_hour, rate_per_project, availability, location, portfolio_url, cv_text, portfolio_context } = body;

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profil belum dibuat. Selesaikan onboarding terlebih dahulu." },
        { status: 404 }
      );
    }

    const updated = await prisma.talentProfile.update({
      where: { id: profile.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(rate_per_hour !== undefined && { ratePerHour: rate_per_hour }),
        ...(rate_per_project !== undefined && { ratePerProject: rate_per_project }),
        ...(availability !== undefined && { availability }),
        ...(location !== undefined && { location }),
        ...(portfolio_url !== undefined && { portfolioUrl: portfolio_url }),
        ...(cv_text !== undefined && { cvText: cv_text }),
        ...(portfolio_context !== undefined && { portfolioContext: portfolio_context }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diupdate",
      data: { id: updated.id },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[ProfilePatch]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
