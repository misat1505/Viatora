import { Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConversationRepository } from './persistance/conversation.repository';
import { MessageRepository } from './persistance/message.repository';
import { MessageRole } from './persistance/entities/message.entity';
import { buildSystemPrompt } from './utils/build-system-prompt';
import { ConfigService } from '@nestjs/config';
import {
  GetConversationHistoryRequest,
  GetConversationHistoryResponse,
  SendMessageRequest,
  SendMessageResponse,
} from 'src/generated/assistant';
import { QuestionRepository } from './persistance/question.repository';
import { extractQuestionData } from './utils/extract-question-data';
import { Locale } from 'src/generated/content';

@Injectable()
export class AssistantService {
  private readonly client: OpenAI;

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly questionRepository: QuestionRepository,
    configService: ConfigService,
  ) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: configService.getOrThrow<string>('OPENROUTER_API_KEY'),
    });
  }

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

    const completion = await this.client.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const reply = completion.choices[0].message.content ?? '';

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
    const messages = await this.messageRepository.findByConversationId(
      dto.conversationId,
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
