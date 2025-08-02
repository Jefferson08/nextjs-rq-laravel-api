import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to posts (will be handled by client-side auth)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/posts', request.url));
  }

  // Auth routes - allow these
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/register') || 
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password')) {
    return NextResponse.next();
  }

  // Protected routes - let client-side handle auth
  if (pathname.startsWith('/posts') || 
      pathname.startsWith('/settings')) {
    return NextResponse.next();
  }

  // All other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
