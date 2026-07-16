'use server';

import { StatsControllerGetStatsSummaryResponse } from '@/generated/zod/stats/stats';
import { statisticsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getStatisticsSummary = safeServerAction(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await statisticsApiClient.statsControllerGetStatsSummary({
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return StatsControllerGetStatsSummaryResponse.parse(response.data);
});
