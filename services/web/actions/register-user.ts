'use server';

import { authApiClient } from '@/lib/api';

export async function registerUser(origin: string, redirect?: string) {
  const redirectUrl = new URL(`${origin}/auth/callback`);
  if (redirect) {
    redirectUrl.searchParams.append('redirect', redirect);
  }
  await authApiClient.authControllerInitiateGoogle({
    redirectUrl: redirectUrl.toString(),
  });
}
