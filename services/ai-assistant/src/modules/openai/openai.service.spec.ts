import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';

import { OpenAIService } from './openai.service';

const createMock = vi.hoisted(() => vi.fn());

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: createMock,
        },
      };

      constructor() {}
    },
  };
});

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    const configService = {
      getOrThrow: vi.fn().mockReturnValue('test-api-key'),
    } as unknown as ConfigService;

    service = new OpenAIService(configService);

    vi.clearAllMocks();
  });

  it('should create OpenAI client', () => {
    expect(service).toBeDefined();
  });

  it('should return assistant response from completion', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Hello from AI',
          },
        },
      ],
    });

    const result = await service.chatCompletion([
      {
        role: 'user',
        content: 'Hello',
      },
    ]);

    expect(createMock).toHaveBeenCalledWith({
      model: 'openrouter/free',
      messages: [
        {
          role: 'user',
          content: 'Hello',
        },
      ],
    });

    expect(result).toBe('Hello from AI');
  });

  it('should return empty string when response has no content', async () => {
    createMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    });

    const result = await service.chatCompletion([
      {
        role: 'user',
        content: 'Hello',
      },
    ]);

    expect(result).toBe('');
  });

  it('should throw error when OpenAI request fails', async () => {
    createMock.mockRejectedValue(new Error('OpenAI error'));

    await expect(
      service.chatCompletion([
        {
          role: 'user',
          content: 'Hello',
        },
      ]),
    ).rejects.toThrow('OpenAI error');
  });
});
