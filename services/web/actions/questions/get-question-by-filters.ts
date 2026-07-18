'use server';

import { GetQuestionsQueryDTO } from '@/generated/viatoraAPI.schemas';
import { QuestionsControllerGetQuestionsResponse } from '@/generated/zod/questions/questions';
import { questionsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getQuestionByFilters = safeServerAction(async (dto: GetQuestionsQueryDTO) => {
  const response = await questionsApiClient.questionsControllerGetQuestions(dto);
  return QuestionsControllerGetQuestionsResponse.parse(response.data);
});
