import { NextRequest, NextResponse } from 'next/server';
import { authApiClient } from './lib/api';
import { AuthControllerRefreshResponse } from './generated/zod/auth/auth';

const locales = ['pl', 'en'];
const defaultLocale = 'pl';

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

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const refreshTokenCookie = request.cookies.get('refreshToken')?.value;
  if (!refreshTokenCookie) {
    return NextResponse.next();
  }

  try {
    const response = await authApiClient.authControllerRefresh({
      refreshToken: refreshTokenCookie,
    });

    const { accessToken, refreshToken } = AuthControllerRefreshResponse.parse(response.data);

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
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};

// spianata picante e gorgonzola, hawajska
