import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ASSISTANT_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { firstValueFrom } from 'rxjs';
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

@Controller('/assistant')
export class AssistantController implements OnModuleInit {
  private assistantService!: AssistantServiceClient;

  constructor(
    @Inject(ASSISTANT_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.assistantService =
      this.grpcClient.getService<AssistantServiceClient>('AssistantService');
  }

  @Post('/message')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SendMessageResponseDTO })
  async sendMessage(
    @Body() dto: SendMessageDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<SendMessageResponseDTO> {
    const result = await firstValueFrom(
      this.assistantService.sendMessage(
        { userId: user.userId, ...dto },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }

  @Get('/conversation')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GetConversationHistoryResponseDTO })
  async getConversationHistory(
    @Query() query: GetConversationHistoryQueryDTO,
    @CurrentUser() user: UserProfile,
  ): Promise<GetConversationHistoryResponseDTO> {
    const result = await firstValueFrom(
      this.assistantService.getConversationHistory(
        { questionId: query.questionId, userId: user.userId },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    return result;
  }
}
