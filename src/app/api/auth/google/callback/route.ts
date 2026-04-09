import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // Redirect to onboarding page with the code for processing
    return NextResponse.redirect(new URL(`/onboarding?code=${code}`, request.url));
  }

  return NextResponse.redirect(new URL('/onboarding', request.url));
}
