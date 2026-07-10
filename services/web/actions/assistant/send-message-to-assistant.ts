'use server';

import { SendMessageDTO } from '@/generated/viatoraAPI.schemas';
import { AssistantControllerSendMessageResponse } from '@/generated/zod/assistant/assistant';
import { assistantApiClient } from '@/lib/api';
import { safeServerAction } from '@/utils/safe-server-action';
import { cookies } from 'next/headers';

export const sendMessageToAssistant = safeServerAction(async (dto: SendMessageDTO) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  const response = await assistantApiClient.assistantControllerSendMessage(dto, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return AssistantControllerSendMessageResponse.parse(response.data);
});
