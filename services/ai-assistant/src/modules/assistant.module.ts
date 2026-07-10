import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { ConversationRepository } from './persistance/conversation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './persistance/entities/conversation.entity';
import { Message } from './persistance/entities/message.entity';
import { MessageRepository } from './persistance/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message])],
  providers: [AssistantService, ConversationRepository, MessageRepository],
  controllers: [AssistantController],
})
export class AssistantModule {}
