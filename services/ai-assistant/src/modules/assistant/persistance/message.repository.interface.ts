import { Message, MessageRole } from './entities/message.entity';

export interface IMessageRepository {
  findByConversationId(conversationId: string): Promise<Message[]>;

  create(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
  }): Promise<Message>;
}
