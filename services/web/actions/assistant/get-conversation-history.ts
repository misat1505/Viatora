'use server';

import { AssistantControllerGetConversationHistoryResponse } from '@/generated/zod/assistant/assistant';
import { assistantApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const getConversationHistory = safeServerAction(async (questionId: string) => {
  const response = await assistantApiClient.assistantControllerGetConversationHistory({
    questionId,
  });

  return AssistantControllerGetConversationHistoryResponse.parse(response.data);
});
