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
        clientProfile: {
          select: {
            bankCode: true,
            bankAccount: true,
            bankAccountName: true,
          }
        }
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
        bank_code: user.clientProfile?.bankCode || null,
        bank_account: user.clientProfile?.bankAccount || null,
        bank_account_name: user.clientProfile?.bankAccountName || null,
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
    const { full_name, avatar_url, bank_code, bank_account, bank_account_name } = body;

    const updateUser: Record<string, string> = {};
    if (full_name !== undefined) updateUser.fullName = full_name;
    if (avatar_url !== undefined) updateUser.avatarUrl = avatar_url;

    const updateProfile: Record<string, string | null> = {};
    if (bank_code !== undefined) updateProfile.bankCode = bank_code;
    if (bank_account !== undefined) updateProfile.bankAccount = bank_account;
    if (bank_account_name !== undefined) updateProfile.bankAccountName = bank_account_name;

    if (Object.keys(updateUser).length === 0 && Object.keys(updateProfile).length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diupdate" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (Object.keys(updateUser).length > 0) {
        await tx.user.update({
          where: { id: session.userId },
          data: updateUser,
        });
      }

      if (Object.keys(updateProfile).length > 0) {
        await tx.clientProfile.update({
          where: { userId: session.userId },
          data: updateProfile,
        });
      }
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
