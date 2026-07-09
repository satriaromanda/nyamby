import { NextRequest, NextResponse } from "next/server";
import { getAuthorizeUrl, OAuthProvider } from "@/lib/oauth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  if (provider !== "google" && provider !== "github") {
    return NextResponse.json({ success: false, message: "Provider OAuth tidak dikenal" }, { status: 400 });
  }

  const clientIdEnv = provider === "google" ? "GOOGLE_CLIENT_ID" : "GITHUB_CLIENT_ID";
  if (!process.env[clientIdEnv]) {
    const url = new URL("/login", APP_URL);
    url.searchParams.set("error", "oauth_not_configured");
    return NextResponse.redirect(url);
  }

  const role = request.nextUrl.searchParams.get("role");
  const state = crypto.randomUUID();

  const authorizeUrl = getAuthorizeUrl(provider as OAuthProvider, state);
  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  if (role === "talent" || role === "client") {
    response.cookies.set("oauth_role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }

  return response;
}
