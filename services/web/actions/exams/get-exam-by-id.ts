'use server';

import { ExamsControllerGetExamSessionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getExamById = safeServerAction(async (id: string) => {
  const response = await examsApiClient.examsControllerGetExamSession(id);
  return ExamsControllerGetExamSessionResponse.parse(response.data);
});
