import { authApiClient } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const oldRefreshToken = request.cookies.get('refreshToken')?.value;

  if (!oldRefreshToken) return NextResponse.json({ message: 'No refresh token in cookies' });

  const apiResponse = await authApiClient.authControllerRefresh({
    refreshToken: oldRefreshToken,
  });

  const { accessToken, refreshToken } = apiResponse.data;

  const response = NextResponse.json({ success: true });

  response.cookies.set('token', accessToken!, {
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
