'use server';

import { PaymentsControllerGetUserSubscriptionsResponse } from '@/generated/zod/payments/payments';
import { paymentsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getUserSubscriptions = safeServerAction(async () => {
  const response = await paymentsApiClient.paymentsControllerGetUserSubscriptions();
  return PaymentsControllerGetUserSubscriptionsResponse.shape.subscriptions.parse(
    response.data.subscriptions,
  );
});
