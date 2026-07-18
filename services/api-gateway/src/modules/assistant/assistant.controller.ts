import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { UserProfile } from 'src/generated/auth';
import { SendMessageDTO, SendMessageResponseDTO } from './dto/send-message.dto';
import {
  GetConversationHistoryQueryDTO,
  GetConversationHistoryResponseDTO,
} from './dto/get-conversation-history.dto';
import { AssistantService } from './assistant.service';

@Controller('/assistant')
@UseGuards(JwtAuthGuard)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('/message')
  @ApiOkResponse({ type: SendMessageResponseDTO })
  sendMessage(
    @Body() dto: SendMessageDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<SendMessageResponseDTO> {
    return this.assistantService.sendMessage(user.userId, dto);
  }

  @Get('/conversation')
  @ApiOkResponse({ type: GetConversationHistoryResponseDTO })
  getConversationHistory(
    @Query() query: GetConversationHistoryQueryDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<GetConversationHistoryResponseDTO> {
    return this.assistantService.getConversationHistory(user.userId, query);
  }
}
