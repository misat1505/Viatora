import { Controller } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import {
  GetConversationHistoryRequest,
  GetConversationHistoryResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'src/generated/assistant';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @GrpcMethod('AssistantService', 'SendMessage')
  sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.assistantService.sendMessage(data);
  }

  @GrpcMethod('AssistantService', 'GetConversationHistory')
  getConversationHistory(
    data: GetConversationHistoryRequest,
  ): Promise<GetConversationHistoryResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.assistantService.getConversationHistory(data);
  }
}
