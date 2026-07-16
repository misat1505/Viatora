'use server';

import { CreateCheckoutDTO } from '@/generated/viatoraAPI.schemas';
import { PaymentsControllerCreateCheckoutResponse } from '@/generated/zod/payments/payments';
import { paymentsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const checkoutPlan = safeServerAction(async (dto: CreateCheckoutDTO) => {
  const response = await paymentsApiClient.paymentsControllerCreateCheckout(dto);
  return PaymentsControllerCreateCheckoutResponse.parse(response.data);
});
