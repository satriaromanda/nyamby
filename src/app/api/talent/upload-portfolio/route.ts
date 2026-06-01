import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { extractPortfolioContext } from "@/lib/enrichment";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa upload portofolio" },
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
    const file = formData.get("portfolio_file");
    const portfolioUrl = formData.get("portfolio_url");
    const result = await extractPortfolioContext(
      file instanceof File ? file : null,
      typeof portfolioUrl === "string" ? portfolioUrl : profile.portfolioUrl
    );

    if (!result.context) {
      return NextResponse.json(
        { success: false, message: result.warning || "Portofolio tidak dapat diproses" },
        { status: 400 }
      );
    }

    await prisma.talentProfile.update({
      where: { id: profile.id },
      data: {
        portfolioFile: result.fileName || profile.portfolioFile,
        portfolioUrl: typeof portfolioUrl === "string" && portfolioUrl ? portfolioUrl : profile.portfolioUrl,
        portfolioContext: result.context,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Portofolio berhasil diproses",
      data: {
        portfolio_file: result.fileName,
        portfolio_context_preview: result.context.slice(0, 240),
        warning: result.warning,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[UploadPortfolio]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
