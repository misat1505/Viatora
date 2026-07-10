import { Conversation } from './entities/conversation.entity';

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;

  findByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<Conversation | null>;

  create(data: {
    userId: string;
    questionId: string;
    questionContent: string;
    questionOptions: string[];
    correctAnswer: string;
  }): Promise<Conversation>;
}
