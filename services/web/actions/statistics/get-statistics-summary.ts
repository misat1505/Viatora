'use server';

import { StatsControllerGetStatsSummaryResponse } from '@/generated/zod/stats/stats';
import { statisticsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getStatisticsSummary = safeServerAction(async () => {
  const response = await statisticsApiClient.statsControllerGetStatsSummary();
  return StatsControllerGetStatsSummaryResponse.parse(response.data);
});
