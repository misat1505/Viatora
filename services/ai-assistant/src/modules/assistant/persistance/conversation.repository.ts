import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly repository: Repository<Conversation>,
  ) {}

  findById(id: string): Promise<Conversation | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<Conversation | null> {
    return this.repository.findOne({ where: { userId, questionId } });
  }

  create(data: {
    userId: string;
    questionId: string;
    questionContent: string;
    questionOptions: string[];
    correctAnswer: string;
  }): Promise<Conversation> {
    const conversation = this.repository.create(data);
    return this.repository.save(conversation);
  }
}
