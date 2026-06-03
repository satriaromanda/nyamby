import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH() {
  try {
    const session = await requireAuth();

    const result = await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: { updated_count: result.count },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[NotifReadAll]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
