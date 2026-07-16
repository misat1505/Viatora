'use server';

import { QuestionsControllerGetQuestionBySlugResponse } from '@/generated/zod/questions/questions';
import { questionsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getQuestionBySlug = safeServerAction(async (slug: string) => {
  const response = await questionsApiClient.questionsControllerGetQuestionBySlug(slug);
  return QuestionsControllerGetQuestionBySlugResponse.parse(response.data);
});
