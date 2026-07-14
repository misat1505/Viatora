import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuestionsBankController } from './questions-bank.controller';
import { QuestionsBankService } from './questions-bank.service';

describe('QuestionsBankController', () => {
  let controller: QuestionsBankController;

  const serviceMock = {
    getQuestionsByCategory: vi.fn(),
    getQuestionBySlug: vi.fn(),
    getQuestionById: vi.fn(),
    getQuestionsByFilters: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [QuestionsBankController],
      providers: [
        {
          provide: QuestionsBankService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(QuestionsBankController);

    vi.clearAllMocks();
  });

  it('should call service and return questions list', async () => {
    const dto = {
      category: 'B',
      questionType: 'basic',
      points: 1,
      count: 2,
    };

    const response = {
      questions: [{ id: 'q1' }],
      cacheHit: 'miss',
    };

    serviceMock.getQuestionsByCategory.mockResolvedValue(response);

    const result = await controller.getQuestionsByCategory(dto);

    expect(serviceMock.getQuestionsByCategory).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('should call service and return question by slug', async () => {
    const dto = {
      slug: 'sample-question',
    };

    const response = {
      id: 'q1',
      slug: 'sample-question',
      text: 'Question text',
    };

    serviceMock.getQuestionBySlug.mockResolvedValue(response);

    const result = await controller.getQuestionBySlug(dto);

    expect(serviceMock.getQuestionBySlug).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('should call service and return question by id', async () => {
    const dto = {
      id: 'q1',
    };

    const response = {
      id: 'q1',
      slug: 'sample-question',
      text: 'Question text',
    };

    serviceMock.getQuestionById.mockResolvedValue(response);

    const result = await controller.getQuestionById(dto);

    expect(serviceMock.getQuestionById).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('should call service and return filtered questions', async () => {
    const dto = {
      category: 'B',
      difficulty: 'easy',
      limit: 10,
    };

    const response = {
      questions: [
        {
          id: 'q1',
          slug: 'question-1',
        },
      ],
      total: 1,
    };

    serviceMock.getQuestionsByFilters.mockResolvedValue(response);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await controller.getQuestionsByFilters(dto as any);

    expect(serviceMock.getQuestionsByFilters).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('should propagate error from getQuestionsByFilters', async () => {
    const dto = {
      category: 'B',
    };

    serviceMock.getQuestionsByFilters.mockRejectedValue(
      new Error('service failed'),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(controller.getQuestionsByFilters(dto as any)).rejects.toThrow(
      'service failed',
    );
  });

  it('should propagate error from getQuestionBySlug', async () => {
    serviceMock.getQuestionBySlug.mockRejectedValue(
      new Error('service failed'),
    );

    await expect(
      controller.getQuestionBySlug({ slug: 'test' }),
    ).rejects.toThrow('service failed');
  });
});
