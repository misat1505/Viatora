import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const refreshToken = request.nextUrl.searchParams.get('refreshToken');

  const response = NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));

  response.cookies.set('token', token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
  });

  response.cookies.set('refreshToken', refreshToken!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
