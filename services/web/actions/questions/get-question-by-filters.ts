'use server';

import { GetQuestionsQueryDto } from '@/generated/viatoraAPI.schemas';
import { QuestionsControllerGetQuestionsResponse } from '@/generated/zod/questions/questions';
import { questionsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getQuestionByFilters = safeServerAction(async (dto: GetQuestionsQueryDto) => {
  const response = await questionsApiClient.questionsControllerGetQuestions(dto);
  return QuestionsControllerGetQuestionsResponse.parse(response.data);
});
