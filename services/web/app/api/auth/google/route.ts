import { authApiClient } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get('redirect');

  const redirectUrl = new URL('/api/auth/callback', request.nextUrl.origin);

  if (redirect) {
    redirectUrl.searchParams.set('redirect', redirect);
  }

  const response = await authApiClient.authControllerInitiateGoogle({
    redirectUrl: redirectUrl.toString(),
  });

  return NextResponse.redirect(response.data.url);
}
