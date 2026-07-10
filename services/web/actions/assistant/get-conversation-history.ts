'use server';

import { AssistantControllerGetConversationHistoryResponse } from '@/generated/zod/assistant/assistant';
import { assistantApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const getConversationHistory = safeServerAction(async (questionId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await assistantApiClient.assistantControllerGetConversationHistory(
    { questionId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  return AssistantControllerGetConversationHistoryResponse.parse(response.data);
});
