'use server';

import { PaymentsControllerGetAllAvailablePlansResponse } from '@/generated/zod/payments/payments';
import { paymentsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getAllAvailablePlans = safeServerAction(async () => {
  const response = await paymentsApiClient.paymentsControllerGetAllAvailablePlans();

  return PaymentsControllerGetAllAvailablePlansResponse.shape.plans.parse(response.data.plans);
});
