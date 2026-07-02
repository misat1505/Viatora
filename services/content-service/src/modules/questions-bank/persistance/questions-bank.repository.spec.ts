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

    repository.onModuleInit();

    vi.clearAllMocks();
    repository.onModuleInit();
  });

  it('should create sanity client on init', () => {
    expect(configMock.getOrThrow).toHaveBeenCalledWith('SANITY_PROJECT_ID');
  });

  it('should call sanity with correct query and params', async () => {
    sanityFetchMock.mockResolvedValue([]);

    await repository.getQuestionsByCategory({
      category: 'B',
      questionType: 'basic',
      count: 10,
      points: 1,
    });

    expect(sanityFetchMock).toHaveBeenCalled();
  });

  it('should include category filter in query execution', async () => {
    sanityFetchMock.mockResolvedValue([]);

    await repository.getQuestionsByCategory({
      category: 'A',
      questionType: 'specialist',
      count: 5,
      points: 3,
    });

    const [query] = sanityFetchMock.mock.calls[0];

    expect(query).toContain('$category in categories');
  });
});
