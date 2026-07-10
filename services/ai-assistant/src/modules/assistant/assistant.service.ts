import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from './persistance/conversation.repository';
import { MessageRepository } from './persistance/message.repository';
import { MessageRole } from './persistance/entities/message.entity';
import { buildSystemPrompt } from './utils/build-system-prompt';
import {
  GetConversationHistoryRequest,
  GetConversationHistoryResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'src/generated/assistant';
import { QuestionRepository } from './persistance/question.repository';
import { extractQuestionData } from './utils/extract-question-data';
import { Locale } from 'src/generated/content';
import { OPENAI_SERVICE } from '../openai/openai.service';
import { type IOpenAIService } from '../openai/openai.interface';

@Injectable()
export class AssistantService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly questionRepository: QuestionRepository,
    @Inject(OPENAI_SERVICE)
    private readonly openAIService: IOpenAIService,
  ) {}

  async sendMessage(params: SendMessageRequest): Promise<SendMessageResponse> {
    const { questionId, userId, message, locale } = params;

    let conversation = await this.conversationRepository.findByUserAndQuestion(
      userId,
      questionId,
    );

    if (!conversation) {
      const question =
        await this.questionRepository.getQuestionsById(questionId);
      if (!question)
        throw new NotFoundException("Question of given id doesn't exist");

      const { questionContent, questionOptions, correctAnswer } =
        extractQuestionData(question, locale as keyof Locale);

      conversation = await this.conversationRepository.create({
        userId,
        questionId,
        questionContent,
        questionOptions,
        correctAnswer,
      });
    }

    await this.messageRepository.create({
      conversationId: conversation.id,
      role: MessageRole.USER,
      content: message,
    });

    const history = await this.messageRepository.findByConversationId(
      conversation.id,
    );

    const systemPrompt = buildSystemPrompt({
      content: conversation.questionContent,
      options: conversation.questionOptions,
      correctAnswer: conversation.correctAnswer,
    });

    const reply = await this.openAIService.chatCompletion([
      {
        role: 'system',
        content: systemPrompt,
      },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]);

    await this.messageRepository.create({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: reply,
    });

    return {
      conversationId: conversation.id,
      reply,
    };
  }

  async getConversationHistory(
    dto: GetConversationHistoryRequest,
  ): Promise<GetConversationHistoryResponse> {
    const { questionId, userId } = dto;

    const conversation =
      await this.conversationRepository.findByUserAndQuestion(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        questionId,
      );

    if (!conversation) {
      return { messages: [] };
    }

    const messages = await this.messageRepository.findByConversationId(
      conversation.id,
    );

    return {
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }
}
