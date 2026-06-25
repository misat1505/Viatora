'use server';

import axios from 'axios';

export async function registerUser() {
  const redirectUrl = 'http://localhost:3000/auth/callback';
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`,
  );
  return response.data.url;
}
