import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET: Fetch current client profile
export async function GET() {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa akses profil ini" },
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

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Count jobs and stats
    const [totalJobs, activeJobs, completedJobs] = await Promise.all([
      prisma.job.count({ where: { clientUserId: session.userId } }),
      prisma.job.count({ where: { clientUserId: session.userId, status: "active" } }),
      prisma.job.count({ where: { clientUserId: session.userId, status: "completed" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        avatar_url: user.avatarUrl,
        created_at: user.createdAt,
        stats: {
          total_jobs: totalJobs,
          active_jobs: activeJobs,
          completed_jobs: completedJobs,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[ClientProfile]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update client profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa update profil" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { full_name, avatar_url } = body;

    const updateData: Record<string, string> = {};
    if (full_name !== undefined) updateData.fullName = full_name;
    if (avatar_url !== undefined) updateData.avatarUrl = avatar_url;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diupdate" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diupdate",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[ClientProfilePatch]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
