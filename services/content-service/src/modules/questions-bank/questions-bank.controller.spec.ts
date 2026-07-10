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
});
