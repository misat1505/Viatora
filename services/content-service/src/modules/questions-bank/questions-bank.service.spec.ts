import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuestionsBankService } from './questions-bank.service';
import { QUESTIONS_BANK_REPOSITORY_TOKEN } from './persistance/questions-bank.repository';
import { QUESTIONS_BANK_CACHE_TOKEN } from './cache/questions-bank.cache';
import { QuestionNotFoundException } from 'src/common/exceptions/not-found.exception';

describe('QuestionsBankService', () => {
  let service: QuestionsBankService;

  const repositoryMock = {
    getQuestionBySlug: vi.fn(),
    getQuestionById: vi.fn(),
    getQuestionIdsByFilters: vi.fn(),
    getQuestionsByIds: vi.fn(),
  };

  const cacheMock = {
    getQuestionBySlug: vi.fn(),
    getQuestionById: vi.fn(),
    setQuestion: vi.fn(),

    getRandomQuestionIds: vi.fn(),
    cacheQuestionFilter: vi.fn(),

    getQuestionsByIds: vi.fn(),
    cacheQuestions: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuestionsBankService,
        {
          provide: QUESTIONS_BANK_REPOSITORY_TOKEN,
          useValue: repositoryMock,
        },
        {
          provide: QUESTIONS_BANK_CACHE_TOKEN,
          useValue: cacheMock,
        },
      ],
    }).compile();

    service = moduleRef.get(QuestionsBankService);

    vi.clearAllMocks();

    cacheMock.getRandomQuestionIds.mockResolvedValue(null);
    cacheMock.cacheQuestionFilter.mockResolvedValue(undefined);
    cacheMock.getQuestionsByIds.mockResolvedValue([]);
    cacheMock.cacheQuestions.mockResolvedValue(undefined);
  });

  describe('getQuestionsByCategory', () => {
    it('should return questions with cache miss when questions are fetched from repository', async () => {
      const filters = {
        category: 'B',
        questionType: 'basic',
        points: 1,
        count: 2,
      };

      cacheMock.getRandomQuestionIds
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(['q1', 'q2']);

      repositoryMock.getQuestionIdsByFilters.mockResolvedValue(['q1', 'q2']);

      cacheMock.getQuestionsByIds.mockResolvedValue([null, null]);

      const detailedQuestions = [
        {
          id: 'q1',
          slug: 'q1',
          text: 'Question 1',
          explanation: 'Explanation 1',
        },
        {
          id: 'q2',
          slug: 'q2',
          text: 'Question 2',
          explanation: 'Explanation 2',
        },
      ];

      repositoryMock.getQuestionsByIds.mockResolvedValue(detailedQuestions);

      const result = await service.getQuestionsByCategory(filters);

      expect(repositoryMock.getQuestionIdsByFilters).toHaveBeenCalledWith(
        filters,
      );

      expect(cacheMock.cacheQuestionFilter).toHaveBeenCalledWith(filters, [
        'q1',
        'q2',
      ]);

      expect(repositoryMock.getQuestionsByIds).toHaveBeenCalledWith([
        'q1',
        'q2',
      ]);

      expect(cacheMock.cacheQuestions).toHaveBeenCalledWith(detailedQuestions);

      expect(result).toEqual({
        questions: [
          {
            id: 'q1',
            slug: 'q1',
            text: 'Question 1',
          },
          {
            id: 'q2',
            slug: 'q2',
            text: 'Question 2',
          },
        ],
        cacheHit: 'miss',
      });
    });

    it('should return questions with cache hit when all questions exist in cache', async () => {
      const filters = {
        category: 'A',
        questionType: 'basic',
        points: 2,
        count: 2,
      };

      cacheMock.getRandomQuestionIds.mockResolvedValue(['q1', 'q2']);

      cacheMock.getQuestionsByIds.mockResolvedValue([
        {
          id: 'q1',
          slug: 'q1',
          text: 'Question 1',
          explanation: 'Explanation',
        },
        {
          id: 'q2',
          slug: 'q2',
          text: 'Question 2',
          explanation: 'Explanation',
        },
      ]);

      const result = await service.getQuestionsByCategory(filters);

      expect(repositoryMock.getQuestionsByIds).not.toHaveBeenCalled();

      expect(cacheMock.cacheQuestions).not.toHaveBeenCalled();

      expect(result).toEqual({
        questions: [
          {
            id: 'q1',
            slug: 'q1',
            text: 'Question 1',
          },
          {
            id: 'q2',
            slug: 'q2',
            text: 'Question 2',
          },
        ],
        cacheHit: 'hit',
      });
    });
  });

  describe('getQuestionBySlug', () => {
    it('should return question from cache', async () => {
      const question = {
        id: 'q1',
        slug: 'sample-question',
      };

      cacheMock.getQuestionBySlug.mockResolvedValue(question);

      const result = await service.getQuestionBySlug({
        slug: 'sample-question',
      });

      expect(cacheMock.getQuestionBySlug).toHaveBeenCalledWith(
        'sample-question',
      );

      expect(repositoryMock.getQuestionBySlug).not.toHaveBeenCalled();

      expect(result).toEqual(question);
    });

    it('should fetch question by slug and cache it when cache misses', async () => {
      const question = {
        id: 'q1',
        slug: 'sample-question',
      };

      cacheMock.getQuestionBySlug.mockResolvedValue(null);
      repositoryMock.getQuestionBySlug.mockResolvedValue(question);

      const result = await service.getQuestionBySlug({
        slug: 'sample-question',
      });

      expect(repositoryMock.getQuestionBySlug).toHaveBeenCalledWith(
        'sample-question',
      );

      expect(cacheMock.setQuestion).toHaveBeenCalledWith(question);

      expect(result).toEqual(question);
    });

    it('should throw QuestionNotFoundException when slug does not exist', async () => {
      cacheMock.getQuestionBySlug.mockResolvedValue(null);
      repositoryMock.getQuestionBySlug.mockResolvedValue(null);

      await expect(
        service.getQuestionBySlug({
          slug: 'missing',
        }),
      ).rejects.toBeInstanceOf(QuestionNotFoundException);
    });
  });

  describe('getQuestionById', () => {
    it('should return question from cache', async () => {
      const question = {
        id: 'q1',
      };

      cacheMock.getQuestionById.mockResolvedValue(question);

      const result = await service.getQuestionById({
        id: 'q1',
      });

      expect(cacheMock.getQuestionById).toHaveBeenCalledWith('q1');

      expect(repositoryMock.getQuestionById).not.toHaveBeenCalled();

      expect(result).toEqual(question);
    });

    it('should fetch question by id and cache it when cache misses', async () => {
      const question = {
        id: 'q1',
      };

      cacheMock.getQuestionById.mockResolvedValue(null);
      repositoryMock.getQuestionById.mockResolvedValue(question);

      const result = await service.getQuestionById({
        id: 'q1',
      });

      expect(repositoryMock.getQuestionById).toHaveBeenCalledWith('q1');

      expect(cacheMock.setQuestion).toHaveBeenCalledWith(question);

      expect(result).toEqual(question);
    });

    it('should throw QuestionNotFoundException when id does not exist', async () => {
      cacheMock.getQuestionById.mockResolvedValue(null);
      repositoryMock.getQuestionById.mockResolvedValue(null);

      await expect(
        service.getQuestionById({
          id: 'missing',
        }),
      ).rejects.toBeInstanceOf(QuestionNotFoundException);
    });
  });
});
