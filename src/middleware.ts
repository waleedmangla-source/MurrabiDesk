import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Check if subdomain is "search." (e.g. search.murrabi-desk.vercel.app or search.localhost:3000)
  const isSearchSubdomain = 
    host.startsWith('search.') || 
    host.includes('search.murrabi-desk.vercel.app');

  if (isSearchSubdomain) {
    // If accessing root or empty path on search subdomain, rewrite to /research
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/research';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, text-logo.png, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
