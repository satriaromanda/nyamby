import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const { status } = body;

    if (!["active", "matched", "in_progress", "completed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 }
      );
    }

    if (job.clientUserId !== session.userId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses untuk mengubah job ini" },
        { status: 403 }
      );
    }

    await prisma.job.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Status berhasil diupdate",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[JobStatus]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
