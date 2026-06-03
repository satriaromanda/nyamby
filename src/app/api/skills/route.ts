import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (q) where.name = { contains: q, mode: "insensitive" };

    const skills = await prisma.skill.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
      })),
    });
  } catch (error) {
    console.error("[Skills]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
