'use server';

import { ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { ExamsControllerGetExamResultResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getExamResult = safeServerAction(async (sessionId: ExamSessionDTO['sessionId']) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await examsApiClient.examsControllerGetExamResult(sessionId, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return ExamsControllerGetExamResultResponse.parse(response.data);
});
