import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AssistantController } from './assistant.controller';
import { ASSISTANT_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SendMessageDTO } from './dto/send-message.dto';
import { UserProfile } from 'src/generated/auth';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

describe('AssistantController', () => {
  let controller: AssistantController;

  const mockAssistantService = {
    sendMessage: vi.fn(),
    getConversationHistory: vi.fn(),
  };

  const mockGrpcClient = {
    getService: vi.fn().mockReturnValue(mockAssistantService),
  };

  const mockGrpcMetadataService = {
    authMeta: {
      authorization: 'Bearer token',
    },
  };

  beforeEach(async () => {
    mockGrpcClient.getService.mockReturnValue(mockAssistantService);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssistantController],
      providers: [
        {
          provide: ASSISTANT_PACKAGE,
          useValue: mockGrpcClient,
        },
        {
          provide: GrpcMetadataService,
          useValue: mockGrpcMetadataService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AssistantController>(AssistantController);

    controller.onModuleInit();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send message with userId and dto', async () => {
      const dto = {
        message: 'Hello assistant',
      };

      const user = {
        userId: 'user-123',
      };

      const grpcResponse = {
        id: 'message-1',
        answer: 'Hello!',
      };

      mockAssistantService.sendMessage.mockReturnValue(of(grpcResponse));

      const result = await controller.sendMessage(
        dto as SendMessageDTO,
        user as UserProfile,
      );

      expect(mockAssistantService.sendMessage).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          message: 'Hello assistant',
        },
        mockGrpcMetadataService.authMeta,
      );

      expect(result).toEqual(grpcResponse);
    });

    it('should propagate grpc error', async () => {
      const dto = {
        message: 'Hello',
      };

      const user = {
        userId: 'user-123',
      };

      const error = new Error('grpc error');

      mockAssistantService.sendMessage.mockReturnValue(
        of(Promise.reject(error)),
      );

      await expect(
        controller.sendMessage(dto as SendMessageDTO, user as UserProfile),
      ).rejects.toThrow(error);
    });
  });

  describe('getConversationHistory', () => {
    it('should get conversation history with questionId and userId', async () => {
      const query = {
        questionId: 'question-123',
      };

      const user = {
        userId: 'user-123',
      };

      const grpcResponse = {
        messages: [
          {
            text: 'Hello',
          },
        ],
      };

      mockAssistantService.getConversationHistory.mockReturnValue(
        of(grpcResponse),
      );

      const result = await controller.getConversationHistory(
        query,
        user as UserProfile,
      );

      expect(mockAssistantService.getConversationHistory).toHaveBeenCalledWith(
        {
          questionId: 'question-123',
          userId: 'user-123',
        },
        mockGrpcMetadataService.authMeta,
      );

      expect(result).toEqual(grpcResponse);
    });

    it('should handle empty conversation history', async () => {
      const query = {
        questionId: 'question-123',
      };

      const user = {
        userId: 'user-123',
      };

      const grpcResponse = {
        messages: [],
      };

      mockAssistantService.getConversationHistory.mockReturnValue(
        of(grpcResponse),
      );

      const result = await controller.getConversationHistory(
        query,
        user as UserProfile,
      );

      expect(result).toEqual({
        messages: [],
      });
    });
  });
});
