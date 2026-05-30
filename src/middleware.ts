import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "nyamby-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /talent/* and /client/* routes
  const isTalentRoute = pathname.startsWith("/talent");
  const isClientRoute = pathname.startsWith("/client");

  if (!isTalentRoute && !isClientRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const loginUrl = new URL("/login", request.url);

  if (!token) {
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token and check role
  if (!JWT_SECRET) {
    console.error("[Middleware] JWT_SECRET is not set");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role as string;

    if (isTalentRoute && role !== "talent") {
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    }
    if (isClientRoute && role !== "client") {
      return NextResponse.redirect(new URL("/talent/dashboard", request.url));
    }
  } catch {
    // Token invalid or expired — redirect to login
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/talent/:path*", "/client/:path*"],
};
