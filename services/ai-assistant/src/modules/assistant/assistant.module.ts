import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import {
  CONVERSATION_REPOSITORY,
  ConversationRepository,
} from './persistance/conversation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './persistance/entities/conversation.entity';
import { Message } from './persistance/entities/message.entity';
import {
  MESSAGE_REPOSITORY,
  MessageRepository,
} from './persistance/message.repository';
import {
  QUESTION_REPOSITORY,
  QuestionRepository,
} from './persistance/question.repository';
import { GrpcClientsModule } from 'src/grpc/clients.module';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    GrpcClientsModule,
    OpenAIModule,
  ],
  providers: [
    AssistantService,
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: ConversationRepository,
    },
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MessageRepository,
    },
    {
      provide: QUESTION_REPOSITORY,
      useClass: QuestionRepository,
    },
  ],
  controllers: [AssistantController],
})
export class AssistantModule {}
