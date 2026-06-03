import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setSessionCookie } from "@/lib/auth";
import { registerTalentSchema, registerClientSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Determine Role
    const role = body.role;
    if (role !== "talent" && role !== "client") {
      return NextResponse.json(
        { success: false, message: "Role tidak valid" },
        { status: 400 }
      );
    }

    // Zod Validation
    const schema = role === "talent" ? registerTalentSchema : registerClientSchema;
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { email, password, full_name } = result.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user (client profile is created during separate onboarding)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        fullName: full_name,
      },
    });

    // Auto-login after register
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "talent" | "client",
      fullName: user.fullName,
      onboardingComplete: false,
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat",
        data: { id: user.id, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
