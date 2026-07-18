import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-current-user';
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

@Controller('/assistant')
export class AssistantController {
  constructor(
    @Inject(ASSISTANT_GRPC_CLIENT)
    private readonly assistantClient: GrpcClientWrapper<AssistantServiceClient>,
  ) {}

  @Post('/message')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SendMessageResponseDTO })
  async sendMessage(
    @Body() dto: SendMessageDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<SendMessageResponseDTO> {
    const result = await this.assistantClient.service.sendMessage({
      userId: user.userId,
      ...dto,
    });

    return AssistantMapper.toSendMessageResponseDTO(result);
  }

  @Get('/conversation')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetConversationHistoryResponseDTO })
  async getConversationHistory(
    @Query() query: GetConversationHistoryQueryDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<GetConversationHistoryResponseDTO> {
    const result = await this.assistantClient.service.getConversationHistory({
      questionId: query.questionId,
      userId: user.userId,
    });

    return AssistantMapper.toGetConversationHistoryResponseDTO(result);
  }
}
