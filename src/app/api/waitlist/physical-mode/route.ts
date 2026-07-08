import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nama dan email wajib diisi" },
        { status: 400 }
      );
    }

    await prisma.physicalModeWaitlist.upsert({
      where: { email },
      update: { name, role: role || null },
      create: { name, email, role: role || null },
    });

    return NextResponse.json({ success: true, message: "Berhasil didaftarkan" }, { status: 201 });
  } catch (error) {
    console.error("[PhysicalModeWaitlist]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
