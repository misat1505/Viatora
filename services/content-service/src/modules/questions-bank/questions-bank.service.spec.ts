import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuestionsBankService } from './questions-bank.service';
import { QUESTIONS_BANK_REPOSITORY_TOKEN } from './persistance/questions-bank.repository';

describe('QuestionsBankService', () => {
  let service: QuestionsBankService;

  const repositoryMock = {
    getQuestionsByCategory: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuestionsBankService,
        {
          provide: QUESTIONS_BANK_REPOSITORY_TOKEN,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(QuestionsBankService);

    vi.clearAllMocks();
  });

  it('should return questions with cacheHit miss', async () => {
    const filters = {
      category: 'B',
      questionType: 'basic',
      points: 1,
      count: 10,
    };

    const repoResponse = [{ id: 'q1' }, { id: 'q2' }];

    repositoryMock.getQuestionsByCategory.mockResolvedValue(repoResponse);

    const result = await service.getQuestionsByCategory(filters);

    expect(repositoryMock.getQuestionsByCategory).toHaveBeenCalledWith(filters);

    expect(result).toEqual({
      questions: repoResponse,
      cacheHit: 'miss',
    });
  });
});
