import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, signToken, setSessionCookie } from "@/lib/auth";
import { clientOnboardingSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa mengisi onboarding" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Zod validation
    const result = clientOnboardingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existing = await prisma.clientProfile.findUnique({
      where: { userId: session.userId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Profil sudah ada. Gunakan PATCH untuk update." },
        { status: 409 }
      );
    }

    const { company_name, industry, company_size, location, description, website_url, whatsapp_number } = result.data;

    // Create client profile + set onboarding complete in a transaction
    const profile = await prisma.$transaction(async (tx) => {
      const newProfile = await tx.clientProfile.create({
        data: {
          userId: session.userId,
          companyName: company_name || null,
          industry,
          companySize: company_size || null,
          location,
          description: description || null,
          websiteUrl: website_url || null,
          whatsappNumber: whatsapp_number || null,
        },
      });

      await tx.user.update({
        where: { id: session.userId },
        data: { onboardingComplete: true },
      });

      return newProfile;
    });

    // Refresh token
    const newToken = await signToken({
      userId: session.userId,
      email: session.email,
      role: session.role,
      fullName: session.fullName,
      onboardingComplete: true,
    });
    await setSessionCookie(newToken);

    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil dibuat",
        data: {
          profile: {
            id: profile.id,
            industry: profile.industry,
            location: profile.location,
          },
          redirect: "/dashboard/client",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[ClientOnboarding]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
