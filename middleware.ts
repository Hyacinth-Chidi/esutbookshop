import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — Edge-level route protection.
 *
 * Checks for the presence of an `accessToken` cookie on protected routes.
 * Full JWT signature verification still happens in the API route handlers
 * (via `requireAuth` / `requireRole`), since `jsonwebtoken` is not
 * compatible with the Edge runtime. This middleware acts as a fast
 * first-pass gate that prevents unauthenticated users from even
 * loading the page bundle.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Protected admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }



  // If already logged in, redirect away from login pages
  if (pathname === '/admin/login' && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
