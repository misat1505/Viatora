import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get('redirect');

  const redirectUrl = new URL('/auth/callback', request.nextUrl.origin);

  if (redirect) {
    redirectUrl.searchParams.set('redirect', redirect);
  }

  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
    params: {
      redirectUrl: redirectUrl.toString(),
    },
  });

  return NextResponse.redirect(response.data.url);
}
