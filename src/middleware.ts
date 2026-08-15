import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side route protection.
 * Dashboard pages redirect to /login when not authenticated; auth pages
 * redirect to /dashboard when already authenticated. The auth check uses a
 * presence cookie set at login (the real auth is the JWT on API calls).
 */
export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const authed = Boolean(req.cookies.get('tk_auth')?.value);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (pathname === '/') {
    return NextResponse.redirect(new URL(authed ? '/dashboard' : '/login', req.url));
  }
  if (!isAuthPage && !authed) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isAuthPage && authed) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
