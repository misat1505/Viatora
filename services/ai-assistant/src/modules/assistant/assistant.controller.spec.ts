import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantController } from './assistant.controller';
import { SendMessageRequest } from 'src/generated/assistant';
import { AssistantService } from './assistant.service';

describe('AssistantController', () => {
  let controller: AssistantController;

  const assistantServiceMock = {
    sendMessage: vi.fn(),
    getConversationHistory: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssistantController],
      providers: [
        {
          provide: AssistantService,
          useValue: assistantServiceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get<AssistantController>(AssistantController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should call assistantService.sendMessage with data', async () => {
      const request = {
        userId: 'user-1',
        message: 'Hello',
      };

      const response = {
        answer: 'Hi!',
      };

      assistantServiceMock.sendMessage.mockResolvedValue(response);

      const result = await controller.sendMessage(
        request as SendMessageRequest,
      );

      expect(assistantServiceMock.sendMessage).toHaveBeenCalledWith(request);

      expect(result).toEqual(response);
    });

    it('should propagate service error', async () => {
      const error = new Error('send message failed');

      assistantServiceMock.sendMessage.mockRejectedValue(error);

      await expect(
        controller.sendMessage({
          userId: 'user-1',
          message: 'Hello',
          questionId: '',
          locale: '',
        }),
      ).rejects.toThrow('send message failed');
    });
  });

  describe('getConversationHistory', () => {
    it('should call assistantService.getConversationHistory with data', async () => {
      const request = {
        userId: 'user-1',
        questionId: 'question-1',
      };

      const response = {
        messages: [
          {
            text: 'Hello',
          },
        ],
      };

      assistantServiceMock.getConversationHistory.mockResolvedValue(response);

      const result = await controller.getConversationHistory(request);

      expect(assistantServiceMock.getConversationHistory).toHaveBeenCalledWith(
        request,
      );

      expect(result).toEqual(response);
    });

    it('should propagate service error', async () => {
      const error = new Error('get history failed');

      assistantServiceMock.getConversationHistory.mockRejectedValue(error);

      await expect(
        controller.getConversationHistory({
          userId: 'user-1',
          questionId: 'question-1',
        }),
      ).rejects.toThrow('get history failed');
    });
  });
});
