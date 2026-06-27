'use server';

import { AuthControllerGetMeResponse } from '@/generated/zod/auth/auth';
import { authApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getCurrentUser = safeServerAction(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const response = await authApiClient.authControllerGetMe({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return AuthControllerGetMeResponse.parse(response.data);
});
