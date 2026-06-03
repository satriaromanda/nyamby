import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getPaginationParams, buildPaginationMeta } from "@/lib/paginate";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread_only") === "true";
    const { page, per_page, skip, take } = getPaginationParams(searchParams, 20, 50);

    const where: Record<string, unknown> = { userId: session.userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.notification.count({
        where: { userId: session.userId, isRead: false },
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        unread_count: unreadCount,
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          related_job_id: n.relatedJobId,
          is_read: n.isRead,
          metadata: n.metadata,
          created_at: n.createdAt,
        })),
      },
      pagination: buildPaginationMeta(total, page, per_page),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[Notifications]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
