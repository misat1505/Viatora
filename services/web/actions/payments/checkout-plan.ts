'use server';

import { CreateCheckoutDTO } from '@/generated/viatoraAPI.schemas';
import { PaymentsControllerCreateCheckoutResponse } from '@/generated/zod/payments/payments';
import { paymentsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const checkoutPlan = safeServerAction(async (dto: CreateCheckoutDTO) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await paymentsApiClient.paymentsControllerCreateCheckout(dto, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return PaymentsControllerCreateCheckoutResponse.parse(response.data);
});
