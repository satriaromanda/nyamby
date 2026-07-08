import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  readLogs,
  availableLogDates,
  clearLogFile,
  type LogLevel,
} from "@/lib/logger";

// Jalankan di runtime Node agar bisa akses filesystem.
export const runtime = "nodejs";

function authError(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "Forbidden") {
    return NextResponse.json({ success: false, message: "Hanya admin" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date") || undefined;
    const level = (searchParams.get("level") as LogLevel | "all") || "all";
    const channel = searchParams.get("channel") || "all";
    const q = searchParams.get("q") || undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const result = readLogs({ date, level, channel, q, limit });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        available_dates: availableLogDates(),
      },
    });
  } catch (error) {
    const authRes = authError(error);
    if (authRes) return authRes;
    // Jangan pakai console.error di sini agar tidak menimbulkan loop pembacaan.
    return NextResponse.json(
      { success: false, message: "Gagal membaca log" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const date = request.nextUrl.searchParams.get("date") || undefined;
    const ok = clearLogFile(date);
    return NextResponse.json({
      success: ok,
      message: ok ? "Log dikosongkan" : "Gagal mengosongkan log",
    });
  } catch (error) {
    const authRes = authError(error);
    if (authRes) return authRes;
    return NextResponse.json(
      { success: false, message: "Gagal mengosongkan log" },
      { status: 500 }
    );
  }
}
