import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// PATCH /api/admin/users/[id]/status — PRD v3.0 §8.3
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const { status, reason } = body;

    if (!["suspended", "active"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status harus 'suspended' atau 'active'" },
        { status: 400 }
      );
    }

    if (status === "suspended" && (!reason || reason.trim().length === 0)) {
      return NextResponse.json(
        { success: false, message: "Alasan wajib diisi saat melakukan suspend" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prevent suspending admin
    if (user.role === "admin") {
      return NextResponse.json(
        { success: false, message: "Tidak bisa suspend akun admin" },
        { status: 400 }
      );
    }

    const isSuspended = status === "suspended";

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          isSuspended,
          suspendReason: isSuspended ? reason.trim() : null,
        },
      });

      // Notify the user
      await tx.notification.create({
        data: {
          userId: id,
          type: isSuspended ? "account_suspended" : "account_reactivated",
          message: isSuspended
            ? `Akun kamu telah di-suspend. Alasan: ${reason.trim()}`
            : "Akun kamu telah diaktifkan kembali. Selamat datang kembali!",
          metadata: { reason: isSuspended ? reason.trim() : "reactivated" },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: isSuspended
        ? `User ${user.fullName} berhasil di-suspend`
        : `User ${user.fullName} berhasil diaktifkan kembali`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    console.error("[AdminUserStatus]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
