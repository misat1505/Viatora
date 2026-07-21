import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONVERSATION_REPOSITORY } from './persistance/conversation.repository';
import { MESSAGE_REPOSITORY } from './persistance/message.repository';
import { MessageRole } from './persistance/entities/message.entity';
import { buildSystemPrompt } from './utils/build-system-prompt';
import {
  GetConversationHistoryRequest,
  GetConversationHistoryResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'src/generated/assistant';
import { QUESTION_REPOSITORY } from './persistance/question.repository';
import { extractQuestionData } from './utils/extract-question-data';
import { Locale } from 'src/generated/content';
import { OPENAI_SERVICE } from '../openai/openai.service';
import { type IOpenAIService } from '../openai/openai.interface';
import { type IConversationRepository } from './persistance/conversation.repository.interface';
import { type IMessageRepository } from './persistance/message.repository.interface';
import { type IQuestionRepository } from './persistance/question.repository.interface';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Injectable()
export class AssistantService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,

    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,

    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,

    @Inject(OPENAI_SERVICE)
    private readonly openAIService: IOpenAIService,

    private readonly kafkaProducerService: KafkaProducerService,
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

    await this.kafkaProducerService.produce('assistant.responded', {
      conversationId: conversation.id,
      userPrompt: message,
      assiatntReply: reply,
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
        userId,

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
