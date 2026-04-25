import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;
  const redirect_uri = `${origin}/api/auth/google/callback`;
  if (code) {
    return NextResponse.redirect(new URL(`/onboarding?code=${code}`, request.url));
  }
  return NextResponse.redirect(new URL('/onboarding', request.url));
}
