import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getJobCollabAccess } from "@/lib/job-access";

// GET — timeline progress kerja sebuah job (client & talenta terkait)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const access = await getJobCollabAccess(id, session.userId);
    if (!access) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke progress ini" },
        { status: 403 }
      );
    }

    const updates = await prisma.workProgress.findMany({
      where: { jobId: id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true, avatarUrl: true } } },
    });

    const latestPct = updates.length > 0 ? updates[0].progressPct : 0;

    return NextResponse.json({
      success: true,
      data: {
        escrow_held: access.escrowHeld,
        my_role: access.role,
        latest_pct: latestPct,
        updates: updates.map((u) => ({
          id: u.id,
          progress_pct: u.progressPct,
          note: u.note,
          attachment_url: u.attachmentUrl,
          author_name: u.author.fullName,
          author_avatar: u.author.avatarUrl,
          is_mine: u.authorUserId === session.userId,
          created_at: u.createdAt,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[JobProgress GET]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST — tambah update progress (hanya talenta, dan hanya jika escrow ter-hold)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const access = await getJobCollabAccess(id, session.userId);
    if (!access) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke progress ini" },
        { status: 403 }
      );
    }

    if (access.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talenta yang dapat menambahkan update progress" },
        { status: 403 }
      );
    }

    if (!access.escrowHeld) {
      return NextResponse.json(
        { success: false, message: "Progress bisa dicatat setelah dana escrow ditahan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const pct = Number(body.progress_pct);
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const attachmentUrl =
      typeof body.attachment_url === "string" && body.attachment_url.trim()
        ? body.attachment_url.trim()
        : null;

    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      return NextResponse.json(
        { success: false, message: "progress_pct harus angka 0–100" },
        { status: 400 }
      );
    }
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Catatan progress tidak boleh kosong" },
        { status: 400 }
      );
    }
    if (note.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Catatan maksimal 1000 karakter" },
        { status: 400 }
      );
    }

    const update = await prisma.workProgress.create({
      data: {
        jobId: id,
        authorUserId: session.userId,
        progressPct: Math.round(pct),
        note,
        attachmentUrl,
      },
    });

    // Notifikasi client
    await prisma.notification.create({
      data: {
        userId: access.clientUserId,
        type: "progress_update",
        message: `Talenta memperbarui progress (${Math.round(pct)}%) pada job Anda.`,
        relatedJobId: id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: update.id,
          progress_pct: update.progressPct,
          note: update.note,
          attachment_url: update.attachmentUrl,
          is_mine: true,
          created_at: update.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[JobProgress POST]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
