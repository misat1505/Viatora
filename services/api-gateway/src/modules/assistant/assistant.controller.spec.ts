import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { ASSISTANT_GRPC_CLIENT } from './assistant.tokens';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';

describe('AssistantController integration', () => {
  let controller: AssistantController;

  const grpcServiceMock = {
    sendMessage: vi.fn(),
    getConversationHistory: vi.fn(),
  };

  const grpcClientMock = {
    service: grpcServiceMock,
  } as unknown as GrpcClientWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AssistantController],
      providers: [
        AssistantService,
        {
          provide: ASSISTANT_GRPC_CLIENT,
          useValue: grpcClientMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(AssistantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send message through grpc and return mapped response', async () => {
      grpcServiceMock.sendMessage.mockResolvedValue({
        conversationId: 'conv-1',
        reply: 'Hello!',
      });

      const result = await controller.sendMessage(
        {
          message: 'Hello assistant',
          questionId: '',
          locale: 'pl',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          userId: 'user-123',
        } as any,
      );

      expect(grpcServiceMock.sendMessage).toHaveBeenCalledWith({
        userId: 'user-123',
        message: 'Hello assistant',
        questionId: '',
        locale: 'pl',
      });

      expect(result).toEqual({
        conversationId: 'conv-1',
        reply: 'Hello!',
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.sendMessage.mockRejectedValue(new Error('grpc error'));

      await expect(
        controller.sendMessage(
          {
            message: 'Hello',
            questionId: '',
            locale: 'pl',
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            userId: 'user-123',
          } as any,
        ),
      ).rejects.toThrow('grpc error');
    });
  });

  describe('getConversationHistory', () => {
    it('should get conversation history through grpc and return mapped response', async () => {
      grpcServiceMock.getConversationHistory.mockResolvedValue({
        messages: [
          {
            id: 'msg-1',
            role: 'assistant',
            content: 'Hello',
            createdAt: '2026-01-01',
          },
        ],
      });

      const result = await controller.getConversationHistory(
        {
          questionId: 'question-123',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          userId: 'user-123',
        } as any,
      );

      expect(grpcServiceMock.getConversationHistory).toHaveBeenCalledWith({
        questionId: 'question-123',
        userId: 'user-123',
      });

      expect(result).toEqual({
        messages: [
          {
            id: 'msg-1',
            role: 'assistant',
            content: 'Hello',
            createdAt: '2026-01-01',
          },
        ],
      });
    });

    it('should return empty conversation history', async () => {
      grpcServiceMock.getConversationHistory.mockResolvedValue({
        messages: [],
      });

      const result = await controller.getConversationHistory(
        {
          questionId: 'question-123',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          userId: 'user-123',
        } as any,
      );

      expect(result).toEqual({
        messages: [],
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.getConversationHistory.mockRejectedValue(
        new Error('grpc error'),
      );

      await expect(
        controller.getConversationHistory(
          {
            questionId: 'question-123',
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            userId: 'user-123',
          } as any,
        ),
      ).rejects.toThrow('grpc error');
    });
  });
});
