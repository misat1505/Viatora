'use server';

import { AuthControllerGetMeResponse } from '@/generated/zod/auth/auth';
import { authApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getCurrentUser = safeServerAction(async () => {
  const response = await authApiClient.authControllerGetMe();
  return AuthControllerGetMeResponse.parse(response.data);
});
