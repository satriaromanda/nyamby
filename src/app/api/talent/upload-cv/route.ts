import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { extractCvText } from "@/lib/enrichment";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa upload CV" },
        { status: 403 }
      );
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
    });
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Selesaikan onboarding terlebih dahulu" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("cv_file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, message: "File CV wajib diupload" },
        { status: 400 }
      );
    }

    const result = await extractCvText(file);
    if (!result.text) {
      return NextResponse.json(
        { success: false, message: result.warning || "CV tidak dapat dibaca" },
        { status: 400 }
      );
    }

    await prisma.talentProfile.update({
      where: { id: profile.id },
      data: { cvFile: result.fileName, cvText: result.text },
    });

    return NextResponse.json({
      success: true,
      message: "CV berhasil diproses",
      data: {
        cv_file: result.fileName,
        cv_text_preview: result.text.slice(0, 240),
        warning: result.warning,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[UploadCV]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
