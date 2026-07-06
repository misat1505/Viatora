'use server';

import { ExamsControllerGetExamsResultsResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getExamsResults = safeServerAction(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await examsApiClient.examsControllerGetExamsResults({
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return ExamsControllerGetExamsResultsResponse.shape.exams.parse(response.data.exams);
});
