import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageRole } from './entities/message.entity';
import { IMessageRepository } from './message.repository.interface';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  findByConversationId(conversationId: string): Promise<Message[]> {
    return this.repository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  create(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
  }): Promise<Message> {
    const message = this.repository.create(data);
    return this.repository.save(message);
  }
}
