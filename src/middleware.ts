import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// PRD §2.4 & §11: Public Routes that do not require authentication
const publicRoutes = ['/', '/talents', '/jobs', '/how-it-works', '/login', '/register', '/api', '/perusahaan', '/fitur', '/physical-mode', '/coming-soon', '/global', '/blog', '/help', '/legal'];

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
    // Check suspension
    if (session.isSuspended) {
      // Clear cookie and redirect to login with error
      const url = new URL('/login?error=suspended', request.url);
      const res = NextResponse.redirect(url);
      res.cookies.delete('nyamby-session');
      return res;
    }

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

    // 4. Admin Guard: Only admin can access /admin/* routes
    if (pathname.startsWith('/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url));
    }
    // Admin skips onboarding checks
    if (session.role === 'admin') {
      return NextResponse.next();
    }

    // 4. Onboarding Guard
    // If onboarding is not complete, they can only access their respective onboarding route
    if (session.onboardingComplete === false) {
      const allowedPath = `/${session.role}/onboarding`;
      if (pathname !== allowedPath) {
        return NextResponse.redirect(new URL(allowedPath, request.url));
      }
    } else if (pathname === `/${session.role}/onboarding`) {
      // If completed, don't allow accessing onboarding again
      return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url));
    }
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
