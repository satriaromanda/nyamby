import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Zod Validation
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // PRD v3.0: Block suspended users from logging in
    if (user.isSuspended) {
      return NextResponse.json(
        { success: false, message: "Akun Anda telah disuspend. Hubungi admin untuk informasi lebih lanjut." },
        { status: 403 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "talent" | "client",
      fullName: user.fullName,
      onboardingComplete: (user as any).onboardingComplete ?? false,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role, full_name: user.fullName },
        token,
      },
    });
  } catch (error) {
    console.error("[Login]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
