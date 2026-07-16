'use server';

import { SendMessageDTO } from '@/generated/viatoraAPI.schemas';
import { AssistantControllerSendMessageResponse } from '@/generated/zod/assistant/assistant';
import { assistantApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';

export const sendMessageToAssistant = safeServerAction(async (dto: SendMessageDTO) => {
  const response = await assistantApiClient.assistantControllerSendMessage(dto);
  return AssistantControllerSendMessageResponse.parse(response.data);
});
