'use server';

import axios from 'axios';

export async function registerUser(origin: string, redirect?: string) {
  const redirectUrl = new URL(`${origin}/auth/callback`);
  if (redirect) {
    redirectUrl.searchParams.append('redirect', redirect);
  }
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
    params: {
      redirectUrl: redirectUrl.toString(),
    },
  });
  return response.data.url;
}
