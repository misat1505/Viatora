import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuestionsBankService } from './questions-bank.service';
import { QUESTIONS_BANK_REPOSITORY_TOKEN } from './persistance/questions-bank.repository';
import { QuestionNotFoundException } from 'src/common/exceptions/not-found.exception';

describe('QuestionsBankService', () => {
  let service: QuestionsBankService;

  const repositoryMock = {
    getQuestionsByCategory: vi.fn(),
    getQuestionBySlug: vi.fn(),
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

  it('should return question by slug', async () => {
    const question = {
      id: 'q1',
      slug: 'sample-question',
    };

    repositoryMock.getQuestionBySlug.mockResolvedValue(question);

    const result = await service.getQuestionBySlug({
      slug: 'sample-question',
    });

    expect(repositoryMock.getQuestionBySlug).toHaveBeenCalledWith(
      'sample-question',
    );

    expect(result).toEqual(question);
  });

  it('should throw QuestionNotFoundException when question not found', async () => {
    repositoryMock.getQuestionBySlug.mockResolvedValue(null);

    await expect(
      service.getQuestionBySlug({ slug: 'missing' }),
    ).rejects.toBeInstanceOf(QuestionNotFoundException);
  });
});
