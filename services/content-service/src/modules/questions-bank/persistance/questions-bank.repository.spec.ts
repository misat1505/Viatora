import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';

import { QuestionsBankRepository } from './questions-bank.repository';

const sanityFetchMock = vi.fn();

vi.mock('@sanity/client', () => {
  return {
    createClient: () => ({
      fetch: sanityFetchMock,
    }),
  };
});

describe('QuestionsBankRepository', () => {
  let repository: QuestionsBankRepository;

  const configMock = {
    getOrThrow: vi.fn((key: string) => {
      const map: Record<string, string> = {
        SANITY_PROJECT_ID: 'project-id',
        SANITY_DATASET: 'dataset',
        SANITY_TOKEN: 'token',
      };
      return map[key];
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        QuestionsBankRepository,
        {
          provide: ConfigService,
          useValue: configMock,
        },
      ],
    }).compile();

    repository = moduleRef.get(QuestionsBankRepository);

    vi.clearAllMocks();
    repository.onModuleInit();
  });

  it('should create sanity client on init', () => {
    expect(configMock.getOrThrow).toHaveBeenCalledWith('SANITY_PROJECT_ID');
    expect(configMock.getOrThrow).toHaveBeenCalledWith('SANITY_DATASET');
    expect(configMock.getOrThrow).toHaveBeenCalledWith('SANITY_TOKEN');
  });

  it('should return null when question not found by slug', async () => {
    sanityFetchMock.mockResolvedValue(null);

    const result = await repository.getQuestionBySlug('missing-slug');

    expect(result).toBeNull();
  });

  it('should map getQuestionBySlug result correctly', async () => {
    sanityFetchMock.mockResolvedValue({
      _id: 'q1',
      text: 'Question detail',
      slug: { current: 'question-detail' },
      points: 5,
      options: { a: 'A', b: 'B' },
      media: {
        type: 'image',
        image: { asset: { _ref: 'img-ref-2' } },
      },
      tags: ['tag2'],
      categories: ['B'],
      questionType: 'advanced',
      correctOption: 'b',
      explanation: 'Because...',
    });

    const result = await repository.getQuestionBySlug('question-detail');

    expect(result).toEqual({
      id: 'q1',
      categories: ['B'],
      slug: 'question-detail',
      points: 5,
      media: {
        type: 'image',
        url: 'img-ref-2',
      },
      answers: {
        a: 'A',
        b: 'B',
        correctAnswer: 'b',
      },
      questionType: 'advanced',
      tags: ['tag2'],
      text: 'Question detail',
      explanation: 'Because...',
    });
  });

  it('should return null when question not found by id', async () => {
    sanityFetchMock.mockResolvedValue(null);

    const result = await repository.getQuestionById('missing-id');

    expect(result).toBeNull();
  });

  it('should map getQuestionById result correctly', async () => {
    sanityFetchMock.mockResolvedValue({
      _id: 'q1',
      text: 'Question detail',
      slug: { current: 'question-detail' },
      points: 5,
      options: { a: 'A', b: 'B' },
      media: {
        type: 'image',
        image: { asset: { _ref: 'img-ref-2' } },
      },
      tags: ['tag2'],
      categories: ['B'],
      questionType: 'advanced',
      correctOption: 'b',
      explanation: 'Because...',
    });

    const result = await repository.getQuestionById('q1');

    expect(result).toEqual({
      id: 'q1',
      categories: ['B'],
      slug: 'question-detail',
      points: 5,
      media: {
        type: 'image',
        url: 'img-ref-2',
      },
      answers: {
        a: 'A',
        b: 'B',
        correctAnswer: 'b',
      },
      questionType: 'advanced',
      tags: ['tag2'],
      text: 'Question detail',
      explanation: 'Because...',
    });
  });

  it('should call sanity with correct query and params (getQuestionIdsByFilters)', async () => {
    sanityFetchMock.mockResolvedValue(['q1', 'q2']);

    const result = await repository.getQuestionIdsByFilters({
      category: 'A',
      questionType: 'basic',
      count: 10,
      points: 2,
    });

    expect(sanityFetchMock).toHaveBeenCalledTimes(1);

    const [query, params] = sanityFetchMock.mock.calls[0];

    expect(query).toContain('_type == "question"');
    expect(query).toContain('$category in categories');
    expect(query).toContain('questionType == $questionType');
    expect(query).toContain('points == $points');

    expect(params).toEqual({
      category: 'A',
      questionType: 'basic',
      count: 10,
      points: 2,
    });

    expect(result).toEqual(['q1', 'q2']);
  });

  it('should return empty array when no question ids found by filters', async () => {
    sanityFetchMock.mockResolvedValue([]);

    const result = await repository.getQuestionIdsByFilters({
      category: 'A',
      questionType: 'basic',
      count: 10,
      points: 2,
    });

    expect(result).toEqual([]);
  });
});
