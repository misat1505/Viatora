import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantService } from './assistant.service';

import { CONVERSATION_REPOSITORY } from './persistance/conversation.repository';
import { MESSAGE_REPOSITORY } from './persistance/message.repository';
import { QUESTION_REPOSITORY } from './persistance/question.repository';

import { OPENAI_SERVICE } from '../openai/openai.service';

import { MessageRole } from './persistance/entities/message.entity';
import { ExamQuestion } from 'src/generated/content';

describe('AssistantService', () => {
  let service: AssistantService;

  const conversationRepositoryMock = {
    findByUserAndQuestion: vi.fn(),
    create: vi.fn(),
  };

  const messageRepositoryMock = {
    create: vi.fn(),
    findByConversationId: vi.fn(),
  };

  const questionRepositoryMock = {
    getQuestionsById: vi.fn(),
  };

  const openAIServiceMock = {
    chatCompletion: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AssistantService,
        {
          provide: CONVERSATION_REPOSITORY,
          useValue: conversationRepositoryMock,
        },
        {
          provide: MESSAGE_REPOSITORY,
          useValue: messageRepositoryMock,
        },
        {
          provide: QUESTION_REPOSITORY,
          useValue: questionRepositoryMock,
        },
        {
          provide: OPENAI_SERVICE,
          useValue: openAIServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get(AssistantService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send message using existing conversation', async () => {
      const conversation = {
        id: 'conversation-1',
        userId: 'user-1',
        questionId: 'question-1',
        questionContent: 'Question?',
        questionOptions: ['A', 'B'],
        correctAnswer: 'A',
      };

      conversationRepositoryMock.findByUserAndQuestion.mockResolvedValue(
        conversation,
      );

      messageRepositoryMock.findByConversationId.mockResolvedValue([
        {
          role: MessageRole.USER,
          content: 'Previous message',
        },
      ]);

      openAIServiceMock.chatCompletion.mockResolvedValue('AI response');

      const result = await service.sendMessage({
        userId: 'user-1',
        questionId: 'question-1',
        message: 'Help me',
        locale: 'en',
      });

      expect(
        conversationRepositoryMock.findByUserAndQuestion,
      ).toHaveBeenCalledWith('user-1', 'question-1');

      expect(messageRepositoryMock.create).toHaveBeenCalledWith({
        conversationId: 'conversation-1',
        role: MessageRole.USER,
        content: 'Help me',
      });

      expect(openAIServiceMock.chatCompletion).toHaveBeenCalled();

      expect(messageRepositoryMock.create).toHaveBeenCalledWith({
        conversationId: 'conversation-1',
        role: MessageRole.ASSISTANT,
        content: 'AI response',
      });

      expect(result).toEqual({
        conversationId: 'conversation-1',
        reply: 'AI response',
      });
    });

    it('should create conversation when it does not exist', async () => {
      const question = {
        id: 'question-1',
        text: { en: 'What is 2 + 2?' },
        answers: {
          a: {
            en: '3',
            pl: '3',
          },
          b: {
            en: '4',
            pl: '4',
          },
          correctAnswer: 'b',
        },
      } as ExamQuestion;

      conversationRepositoryMock.findByUserAndQuestion.mockResolvedValue(null);

      questionRepositoryMock.getQuestionsById.mockResolvedValue(question);

      conversationRepositoryMock.create.mockResolvedValue({
        id: 'conversation-1',
        userId: 'user-1',
        questionId: 'question-1',
        questionContent: 'What is 2 + 2?',
        questionOptions: ['3', '4'],
        correctAnswer: '4',
      });

      messageRepositoryMock.findByConversationId.mockResolvedValue([]);

      openAIServiceMock.chatCompletion.mockResolvedValue('Answer');

      const result = await service.sendMessage({
        userId: 'user-1',
        questionId: 'question-1',
        message: 'Explain',
        locale: 'en',
      });

      expect(questionRepositoryMock.getQuestionsById).toHaveBeenCalledWith(
        'question-1',
      );

      expect(conversationRepositoryMock.create).toHaveBeenCalledWith({
        userId: 'user-1',
        questionId: 'question-1',
        questionContent: 'What is 2 + 2?',
        questionOptions: ['3', '4'],
        correctAnswer: '4',
      });

      expect(result).toEqual({
        conversationId: 'conversation-1',
        reply: 'Answer',
      });
    });

    it('should throw NotFoundException when question does not exist', async () => {
      conversationRepositoryMock.findByUserAndQuestion.mockResolvedValue(null);

      questionRepositoryMock.getQuestionsById.mockResolvedValue(null);

      await expect(
        service.sendMessage({
          userId: 'user-1',
          questionId: 'question-1',
          message: 'Hello',
          locale: 'en',
        }),
      ).rejects.toThrow("Question of given id doesn't exist");
    });
  });

  describe('getConversationHistory', () => {
    it('should return empty messages when conversation does not exist', async () => {
      conversationRepositoryMock.findByUserAndQuestion.mockResolvedValue(null);

      const result = await service.getConversationHistory({
        userId: 'user-1',
        questionId: 'question-1',
      });

      expect(result).toEqual({
        messages: [],
      });
    });

    it('should return conversation messages', async () => {
      conversationRepositoryMock.findByUserAndQuestion.mockResolvedValue({
        id: 'conversation-1',
      });

      messageRepositoryMock.findByConversationId.mockResolvedValue([
        {
          id: 'message-1',
          role: MessageRole.USER,
          content: 'Hello',
          createdAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.getConversationHistory({
        userId: 'user-1',
        questionId: 'question-1',
      });

      expect(messageRepositoryMock.findByConversationId).toHaveBeenCalledWith(
        'conversation-1',
      );

      expect(result).toEqual({
        messages: [
          {
            id: 'message-1',
            role: MessageRole.USER,
            content: 'Hello',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      });
    });
  });
});
