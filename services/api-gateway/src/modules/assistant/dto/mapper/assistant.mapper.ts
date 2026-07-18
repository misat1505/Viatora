import { AssistantServiceClient } from 'src/generated/assistant';
import { GrpcResponse } from 'src/grpc/types/grpc-client';
import { SendMessageResponseDTO } from '../send-message.dto';
import {
  ChatMessageDTO,
  GetConversationHistoryResponseDTO,
} from '../get-conversation-history.dto';

type SendMessageResponse = GrpcResponse<AssistantServiceClient, 'sendMessage'>;
type GetConversationHistoryResponse = GrpcResponse<
  AssistantServiceClient,
  'getConversationHistory'
>;

type GrpcChatMessage = GetConversationHistoryResponse['messages'][number];

export class AssistantMapper {
  static toSendMessageResponseDTO(
    result: SendMessageResponse,
  ): SendMessageResponseDTO {
    return {
      conversationId: result.conversationId,
      reply: result.reply,
    };
  }

  static toChatMessageDTO(message: GrpcChatMessage): ChatMessageDTO {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  static toGetConversationHistoryResponseDTO(
    result: GetConversationHistoryResponse,
  ): GetConversationHistoryResponseDTO {
    return {
      messages: result.messages.map((m) => this.toChatMessageDTO(m)),
    };
  }
}
