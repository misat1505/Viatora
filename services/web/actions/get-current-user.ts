'use server';

import { safeServerAction } from '@/utils/safe-server-action';
import axios from 'axios';
import { cookies } from 'next/headers';

type User = { displayName: string };

export const getCurrentUser = safeServerAction(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const user = response.data.user as User;

  return user;
});
