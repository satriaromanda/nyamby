import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setSessionCookie } from "@/lib/auth";
import { exchangeCodeForProfile, OAuthProvider } from "@/lib/oauth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function redirectTo(path: string, params?: Record<string, string>) {
  const url = new URL(path, APP_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "github") {
    return redirectTo("/login", { error: "oauth_invalid_provider" });
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("oauth_state")?.value;
  const roleCookie = request.cookies.get("oauth_role")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return redirectTo("/login", { error: "oauth_invalid_state" });
  }

  try {
    const profile = await exchangeCodeForProfile(provider as OAuthProvider, code);

    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (user) {
      if (user.isSuspended) {
        const res = redirectTo("/login", { error: "suspended" });
        res.cookies.delete("oauth_state");
        res.cookies.delete("oauth_role");
        return res;
      }
      // Security: Only auto-link provider if the OAuth email is verified.
      // This prevents account takeover where an attacker registers a
      // GitHub/Google account with someone else's email.
      if (!profile.emailVerified) {
        const res = redirectTo("/login", { error: "oauth_email_not_verified" });
        res.cookies.delete("oauth_state");
        res.cookies.delete("oauth_role");
        return res;
      }
      // Link this provider to the existing account (password or another provider).
      if (user.provider !== provider || user.providerId !== profile.providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider,
            providerId: profile.providerId,
            emailVerified: new Date(),
            avatarUrl: user.avatarUrl || profile.avatarUrl,
          },
        });
      }
    } else {
      // Brand-new account — role can't come from the OAuth provider, it must
      // have been carried from the register/login page as a query param.
      const role = roleCookie === "talent" || roleCookie === "client" ? roleCookie : null;
      if (!role) {
        return redirectTo("/register", { error: "oauth_role_required" });
      }

      user = await prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          role,
          provider,
          providerId: profile.providerId,
          emailVerified: profile.emailVerified ? new Date() : null,
        },
      });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "talent" | "client" | "admin",
      fullName: user.fullName,
      onboardingComplete: user.onboardingComplete,
    });

    await setSessionCookie(token);

    const destination = user.onboardingComplete ? `/${user.role}/dashboard` : `/${user.role}/onboarding`;
    const res = redirectTo(destination);
    res.cookies.delete("oauth_state");
    res.cookies.delete("oauth_role");
    return res;
  } catch (error) {
    console.error(`[OAuthCallback:${provider}]`, error);
    return redirectTo("/login", { error: "oauth_failed" });
  }
}
