'use server';

import { PaymentsControllerGetUserSubscriptionsResponse } from '@/generated/zod/payments/payments';
import { paymentsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getUserSubscriptions = safeServerAction(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await paymentsApiClient.paymentsControllerGetUserSubscriptions({
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return PaymentsControllerGetUserSubscriptionsResponse.shape.subscriptions.parse(
    response.data.subscriptions,
  );
});
