'use server';

import { QuestionsControllerGetQuestionBySlugResponse } from '@/generated/zod/questions/questions';
import { questionsApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getQuestionBySlug = safeServerAction(async (slug: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await questionsApiClient.questionsControllerGetQuestionBySlug(slug, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  console.log(QuestionsControllerGetQuestionBySlugResponse.safeParse(response.data));
  return QuestionsControllerGetQuestionBySlugResponse.parse(response.data);
});
