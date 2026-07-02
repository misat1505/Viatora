import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuestionsBankController } from './questions-bank.controller';
import { QuestionsBankService } from './questions-bank.service';

describe('QuestionsBankController', () => {
  let controller: QuestionsBankController;

  const serviceMock = {
    getQuestionsByCategory: vi.fn(),
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

  it('should call service and return response', async () => {
    const dto = {
      category: 'B',
      questionType: 'basic',
      points: 1,
      count: 2,
    };

    const response = {
      questions: [{ id: 'q1' }],
    };

    serviceMock.getQuestionsByCategory.mockResolvedValue(response);

    const result = await controller.getQuestionsByCategory(dto);

    expect(serviceMock.getQuestionsByCategory).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });
});
