'use server';

import { GetQuestionsQueryDto } from '@/generated/viatoraAPI.schemas';
import { QuestionsControllerGetQuestionsResponse } from '@/generated/zod/questions/questions';
import { questionsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getQuestionByFilters = safeServerAction(async (dto: GetQuestionsQueryDto) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await questionsApiClient.questionsControllerGetQuestions(dto, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return QuestionsControllerGetQuestionsResponse.parse(response.data);
});
