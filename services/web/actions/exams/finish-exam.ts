'use server';

import { ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { ExamsControllerFinishSessionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const finishExam = safeServerAction(async (sessionId: ExamSessionDTO['sessionId']) => {
  const response = await examsApiClient.examsControllerFinishSession(sessionId);
  return ExamsControllerFinishSessionResponse.parse(response.data);
});
