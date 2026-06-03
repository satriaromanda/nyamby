import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// PRD §2.4 & §11: Public Routes that do not require authentication
const publicRoutes = ['/', '/talents', '/jobs', '/how-it-works', '/login', '/register', '/api'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, api routes (auth logic is inside), _next
  if (
    pathname.startsWith('/_next') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route))
  );

  // Get session token
  const token = request.cookies.get('nyamby-session')?.value;
  const session = token ? await verifyToken(token) : null;

  // 1. If not logged in and trying to access protected route -> Login
  if (!session && !isPublicRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If logged in...
  if (session) {
    // 2. Prevent accessing login/register if already logged in -> Dashboard
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url));
    }

    // 3. Role Guard: Talent can't access client routes, Client can't access talent routes
    if (session.role === 'talent' && pathname.startsWith('/client')) {
      return NextResponse.redirect(new URL('/talent/dashboard', request.url));
    }
    if (session.role === 'client' && pathname.startsWith('/talent')) {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }

    // 4. Onboarding Guard
    // If onboarding is not complete, they can only access their respective onboarding route
    // Note: session payload doesn't currently contain onboardingComplete. 
    // Wait, let's allow the page component or API to handle the strict checking of onboardingComplete 
    // since the DB call is required to know if onboarding is complete (it's not in the token payload).
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
