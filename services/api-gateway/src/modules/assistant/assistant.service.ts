import { Body, Inject, Injectable } from '@nestjs/common';
import { UserProfile } from 'src/generated/auth';
import { AssistantServiceClient } from 'src/generated/assistant';
import { SendMessageDTO, SendMessageResponseDTO } from './dto/send-message.dto';
import {
  GetConversationHistoryQueryDTO,
  GetConversationHistoryResponseDTO,
} from './dto/get-conversation-history.dto';
import { ASSISTANT_GRPC_CLIENT } from './assistant.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { AssistantMapper } from './dto/mapper/assistant.mapper';

@Injectable()
export class AssistantService {
  constructor(
    @Inject(ASSISTANT_GRPC_CLIENT)
    private readonly assistantClient: GrpcClientWrapper<AssistantServiceClient>,
  ) {}

  async sendMessage(
    userId: UserProfile['userId'],
    dto: SendMessageDTO,
  ): Promise<SendMessageResponseDTO> {
    const result = await this.assistantClient.service.sendMessage({
      userId,
      ...dto,
    });

    return AssistantMapper.toSendMessageResponseDTO(result);
  }

  async getConversationHistory(
    userId: UserProfile['userId'],
    dto: GetConversationHistoryQueryDTO,
  ): Promise<GetConversationHistoryResponseDTO> {
    const result = await this.assistantClient.service.getConversationHistory({
      questionId: dto.questionId,
      userId,
    });

    return AssistantMapper.toGetConversationHistoryResponseDTO(result);
  }
}
