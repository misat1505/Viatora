import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { QuestionsBankCache } from './questions-bank.cache';

const redisMock = {
  get: vi.fn(),
  mset: vi.fn(),
  exists: vi.fn(),
  srandmember: vi.fn(),
  mget: vi.fn(),
  pipeline: vi.fn(),
};

describe('QuestionsBankCache', () => {
  let cache: QuestionsBankCache;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuestionsBankCache,
        {
          provide: 'REDIS',
          useValue: redisMock,
        },
      ],
    }).compile();

    cache = moduleRef.get(QuestionsBankCache);
  });

  it('should return question by id from cache', async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({
        id: 'q1',
        text: 'Question',
      }),
    );

    const result = await cache.getQuestionById('q1');

    expect(redisMock.get).toHaveBeenCalledWith(
      'content-service:questions:id:q1',
    );

    expect(result).toEqual({
      id: 'q1',
      text: 'Question',
    });
  });

  it('should return null when question by id does not exist', async () => {
    redisMock.get.mockResolvedValue(null);

    const result = await cache.getQuestionById('missing');

    expect(result).toBeNull();
  });

  it('should return question by slug from cache', async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({
        id: 'q1',
        slug: 'question-1',
      }),
    );

    const result = await cache.getQuestionBySlug('question-1');

    expect(redisMock.get).toHaveBeenCalledWith(
      'content-service:questions:slug:question-1',
    );

    expect(result).toEqual({
      id: 'q1',
      slug: 'question-1',
    });
  });

  it('should cache question under id and slug keys', async () => {
    redisMock.mset.mockResolvedValue('OK');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await cache.setQuestion({
      id: 'q1',
      slug: 'question-1',
    } as any);

    expect(redisMock.mset).toHaveBeenCalledWith({
      'content-service:questions:id:q1': JSON.stringify({
        id: 'q1',
        slug: 'question-1',
      }),
      'content-service:questions:slug:question-1': JSON.stringify({
        id: 'q1',
        slug: 'question-1',
      }),
    });
  });

  it('should return random question ids from filter cache', async () => {
    redisMock.exists.mockResolvedValue(1);
    redisMock.srandmember.mockResolvedValue(['q1', 'q2']);

    const result = await cache.getRandomQuestionIds({
      category: 'A',
      questionType: 'basic',
      count: 2,
      points: 1,
    });

    expect(redisMock.exists).toHaveBeenCalledTimes(1);
    expect(redisMock.srandmember).toHaveBeenCalledTimes(1);

    expect(result).toEqual(['q1', 'q2']);
  });

  it('should return null when filter cache does not exist', async () => {
    redisMock.exists.mockResolvedValue(0);

    const result = await cache.getRandomQuestionIds({
      category: 'A',
      questionType: 'basic',
      count: 2,
      points: 1,
    });

    expect(redisMock.srandmember).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should cache question ids for filters', async () => {
    const execMock = vi.fn();

    const pipelineMock = {
      sadd: vi.fn(),
      expire: vi.fn(),
      exec: execMock,
    };

    redisMock.pipeline.mockReturnValue(pipelineMock);

    await cache.cacheQuestionFilter(
      {
        category: 'A',
        questionType: 'basic',
        count: 2,
        points: 1,
      },
      ['q1', 'q2'],
    );

    expect(redisMock.pipeline).toHaveBeenCalled();

    expect(pipelineMock.sadd).toHaveBeenCalledWith(
      expect.stringContaining('content-service:questions:filters:'),
      'q1',
      'q2',
    );

    expect(pipelineMock.expire).toHaveBeenCalledWith(
      expect.stringContaining('content-service:questions:filters:'),
      60 * 60 * 24,
    );

    expect(execMock).toHaveBeenCalled();
  });

  it('should get multiple questions by ids', async () => {
    redisMock.mget.mockResolvedValue([
      JSON.stringify({
        id: 'q1',
      }),
      null,
      JSON.stringify({
        id: 'q3',
      }),
    ]);

    const result = await cache.getQuestionsByIds(['q1', 'q2', 'q3']);

    expect(redisMock.mget).toHaveBeenCalledWith([
      'content-service:questions:id:q1',
      'content-service:questions:id:q2',
      'content-service:questions:id:q3',
    ]);

    expect(result).toEqual([
      {
        id: 'q1',
      },
      null,
      {
        id: 'q3',
      },
    ]);
  });

  it('should cache multiple questions using pipeline', async () => {
    const execMock = vi.fn();

    const pipelineMock = {
      set: vi.fn(),
      exec: execMock,
    };

    redisMock.pipeline.mockReturnValue(pipelineMock);

    await cache.cacheQuestions([
      {
        id: 'q1',
        slug: 'question-1',
        categories: [],
        questionType: '',
        text: undefined,
        answers: undefined,
        points: 0,
        tags: [],
        media: undefined,
        explanation: undefined,
      },
      {
        id: 'q2',
        slug: 'question-2',
        categories: [],
        questionType: '',
        text: undefined,
        answers: undefined,
        points: 0,
        tags: [],
        media: undefined,
        explanation: undefined,
      },
    ]);

    expect(pipelineMock.set).toHaveBeenCalledTimes(4);

    expect(execMock).toHaveBeenCalled();
  });
});
