'use server';

import { ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { ExamsControllerGetExamResultResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getExamResult = safeServerAction(async (sessionId: ExamSessionDTO['sessionId']) => {
  const response = await examsApiClient.examsControllerGetExamResult(sessionId);
  return ExamsControllerGetExamResultResponse.parse(response.data);
});
