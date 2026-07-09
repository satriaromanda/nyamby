import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getJobCollabAccess } from "@/lib/job-access";

// GET — daftar pesan sebuah job (client & talenta terkait)
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
        { success: false, message: "Anda tidak memiliki akses ke percakapan ini" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { jobId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { fullName: true, avatarUrl: true } } },
    });

    // Tandai pesan dari lawan bicara sebagai terbaca
    await prisma.message.updateMany({
      where: { jobId: id, senderUserId: { not: session.userId }, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        escrow_held: access.escrowHeld,
        my_role: access.role,
        messages: messages.map((m) => ({
          id: m.id,
          body: m.body,
          sender_user_id: m.senderUserId,
          sender_name: m.sender.fullName,
          sender_avatar: m.sender.avatarUrl,
          is_mine: m.senderUserId === session.userId,
          created_at: m.createdAt,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[JobMessages GET]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST — kirim pesan (hanya jika escrow sudah ter-hold)
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
        { success: false, message: "Anda tidak memiliki akses ke percakapan ini" },
        { status: 403 }
      );
    }

    if (!access.escrowHeld) {
      return NextResponse.json(
        { success: false, message: "Percakapan terbuka setelah dana escrow ditahan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!text) {
      return NextResponse.json(
        { success: false, message: "Isi pesan tidak boleh kosong" },
        { status: 400 }
      );
    }
    if (text.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Pesan maksimal 2000 karakter" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: { jobId: id, senderUserId: session.userId, body: text },
    });

    // Notifikasi lawan bicara
    const recipientId = access.role === "client" ? access.talentUserId : access.clientUserId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "new_message",
        message: `Pesan baru dari ${session.fullName || "lawan bicara"} pada job Anda.`,
        relatedJobId: id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: message.id,
          body: message.body,
          sender_user_id: message.senderUserId,
          is_mine: true,
          created_at: message.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[JobMessages POST]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
