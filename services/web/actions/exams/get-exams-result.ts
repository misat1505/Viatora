'use server';

import { ExamsControllerGetExamsResultsResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getExamsResults = safeServerAction(async () => {
  const response = await examsApiClient.examsControllerGetExamsResults();
  return ExamsControllerGetExamsResultsResponse.shape.exams.parse(response.data.exams);
});
