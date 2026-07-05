import { describe, it, expect, beforeEach, vi } from 'vitest';
import Redis from 'ioredis';

import { ExamRepository } from './exam.repository';
import { ExamStatus } from '../types/exam';

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('ExamRepository', () => {
  let repository: ExamRepository;

  const redisMock = {
    set: vi.fn(),
    get: vi.fn(),
  } as unknown as Redis;

  beforeEach(() => {
    repository = new ExamRepository(redisMock);
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // 1. CREATE EXAM SESSION
  // ─────────────────────────────────────────────
  it('should create exam session and store it in redis', async () => {
    const dto = {
      userId: 'user-1',
      timeLimitSeconds: 1500,
      totalQuestions: 10,
      startedAt: '2026-01-01T00:00:00Z',
      questions: [],
      currentQuestionId: 'q2',
      category: 'B',
      status: ExamStatus.IN_PROGRESS,
    };

    const result = await repository.createExamSession(dto);

    // 1. returns session with uuid
    expect(result.sessionId).toBe('mock-uuid');

    // 2. redis key correctness
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(redisMock.set).toHaveBeenCalledTimes(1);

    const [key, value] = (redisMock.set as any).mock.calls[0];

    expect(key).toBe('exam-engine:exams:mock-uuid');

    // 3. stored JSON correctness
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const parsed = JSON.parse(value);

    expect(parsed).toEqual({
      ...dto,
      sessionId: 'mock-uuid',
    });
  });

  // ─────────────────────────────────────────────
  // 2. GET BY ID
  // ─────────────────────────────────────────────
  it('should return exam session from redis by id', async () => {
    const exam = {
      sessionId: 'mock-uuid',
      userId: 'user-1',
      timeLimitSeconds: 1500,
      totalQuestions: 10,
      startedAt: '2026-01-01T00:00:00Z',
      questions: [],
    };

    const key = 'exam-engine:exams:mock-uuid';

    // mock redis GET
    const redisGetMock = vi.fn().mockResolvedValue(JSON.stringify(exam));

    (repository as any).redis.get = redisGetMock;

    const result = await repository.getById('mock-uuid');

    // 1. correct key usage
    expect(redisGetMock).toHaveBeenCalledWith(key);

    // 2. correct parsing result
    expect(result).toEqual(exam);
  });

  it('should return null when exam session does not exist', async () => {
    const redisGetMock = vi.fn().mockResolvedValue(null);

    (repository as any).redis.get = redisGetMock;

    const result = await repository.getById('non-existing');

    expect(redisGetMock).toHaveBeenCalledWith('exam-engine:exams:non-existing');

    expect(result).toBeNull();
  });

  it('should update exam session in redis', async () => {
    const exam = {
      sessionId: 'mock-uuid',
      userId: 'user-1',
      timeLimitSeconds: 1500,
      totalQuestions: 10,
      startedAt: '2026-01-01T00:00:00Z',
      questions: [],
      currentQuestionId: 'q2',
      category: 'B',
      status: ExamStatus.IN_PROGRESS,
    };

    (redisMock.set as any).mockResolvedValue('OK');

    const result = await repository.updateById('ignored-id', exam);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(redisMock.set).toHaveBeenCalledWith(
      'exam-engine:exams:mock-uuid',
      JSON.stringify(exam),
    );

    expect(result).toEqual(exam);
  });
});
