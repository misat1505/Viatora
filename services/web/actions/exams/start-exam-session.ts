'use server';

import { ExamsControllerStartExamSessionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const startExamSession = safeServerAction(async (category: string) => {
  const response = await examsApiClient.examsControllerStartExamSession({
    category,
  });
  return ExamsControllerStartExamSessionResponse.parse(response.data);
});
