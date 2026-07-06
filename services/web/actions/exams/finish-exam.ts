'use server';

import { ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { ExamsControllerFinishSessionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const finishExam = safeServerAction(async (sessionId: ExamSessionDTO['sessionId']) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await examsApiClient.examsControllerFinishSession(sessionId, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  console.log(ExamsControllerFinishSessionResponse.safeParse(response.data));
  console.log(
    JSON.stringify(ExamsControllerFinishSessionResponse.safeParse(response.data), null, 2),
  );
  return ExamsControllerFinishSessionResponse.parse(response.data);
});
