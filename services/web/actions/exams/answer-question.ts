'use server';

import { AnswerQuestionDTO, ExamSessionDTO } from '@/generated/viatoraAPI.schemas';
import { ExamsControllerAnswerQuestionResponse } from '@/generated/zod/exams/exams';
import { examsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const answerQuestion = safeServerAction(
  async (sessionId: ExamSessionDTO['sessionId'], answerDTO: AnswerQuestionDTO) => {
    const response = await examsApiClient.examsControllerAnswerQuestion(sessionId, answerDTO);
    return ExamsControllerAnswerQuestionResponse.parse(response.data);
  },
);
