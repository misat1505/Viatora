import { authApiClient } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const oldAccessToken = request.cookies.get('token')?.value;
  const oldRefreshToken = request.cookies.get('refreshToken')?.value;

  if (!oldRefreshToken) return NextResponse.json({ message: 'No refresh token in cookies' });

  try {
    await authApiClient.authControllerLogout(
      {
        refreshToken: oldRefreshToken,
      },
      { headers: { Authorization: `Bearer ${oldAccessToken}` } },
    );
  } catch (e) {
    // Log it out, but we can continue
    console.error(e);
  }

  const response = NextResponse.json({ success: true });

  response.cookies.delete('token');
  response.cookies.delete('refreshToken');

  return response;
}
