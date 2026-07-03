'use server';

import { AnswerQuestionDTO, ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { ExamsControllerAnswerQuestionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const answerQuestion = safeServerAction(
  async (sessionId: ExamSessionDTO['sessionId'], answerDTO: AnswerQuestionDTO) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('token')?.value;

    const response = await examsApiClient.examsControllerAnswerQuestion(sessionId, answerDTO, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return ExamsControllerAnswerQuestionResponse.parse(response.data);
  },
);
