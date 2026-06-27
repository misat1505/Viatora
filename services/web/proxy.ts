import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  if (request.headers.get('Next-Action')) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  if (request.headers.get('accept')?.includes('text/html') === false) {
    return NextResponse.next();
  }

  const accessTokenCookie = request.cookies.get('token')?.value;
  if (accessTokenCookie) {
    return NextResponse.next();
  }

  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;
  if (!refreshTokenCookie) {
    return NextResponse.next();
  }

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      refreshToken: refreshTokenCookie,
    });

    const { accessToken, refreshToken } = response.data;

    const nextResponse = NextResponse.next();

    nextResponse.cookies.set('token', accessToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
    });

    nextResponse.cookies.set('refreshToken', refreshToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return nextResponse;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard'],
};
