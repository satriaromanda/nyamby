import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { businessVerificationSchema } from "@/lib/validations";

// PRD v4.0 §3.3 — Business Verification (KYB Minimal)
// POST /api/client/verify-business
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Only clients can verify business" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const result = businessVerificationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { business_email, company_url } = result.data;

    // Step 1: Check email domain — reject free email providers
    const emailDomain = business_email.split("@")[1]?.toLowerCase();
    const freeProviders = [
      "gmail.com", "yahoo.com", "yahoo.co.id", "hotmail.com", "outlook.com",
      "live.com", "aol.com", "icloud.com", "mail.com", "protonmail.com",
      "ymail.com", "gmx.com", "zoho.com",
    ];

    if (!emailDomain || freeProviders.includes(emailDomain)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please use a business email address (not Gmail, Yahoo, Hotmail, etc.). This helps verify your company identity.",
        },
        { status: 400 }
      );
    }

    // Step 2: Find client profile
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Client profile not found. Complete onboarding first." },
        { status: 404 }
      );
    }

    // Step 3: Update profile with verification data
    const updatedProfile = await prisma.clientProfile.update({
      where: { userId: session.userId },
      data: {
        businessEmailDomain: emailDomain,
        businessVerifiedAt: new Date(),
        // Save company URL to websiteUrl if not already set
        ...(company_url && !profile.websiteUrl ? { websiteUrl: company_url } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Business verification successful. Your profile now shows a Verified Client badge.",
      data: {
        business_email_domain: updatedProfile.businessEmailDomain,
        verified_at: updatedProfile.businessVerifiedAt,
        badge: "verified_client",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[VerifyBusiness]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
