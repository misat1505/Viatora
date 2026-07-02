import { describe, it, expect, beforeEach, vi } from 'vitest';
import Redis from 'ioredis';

import { ExamRepository } from './exam.repository';

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('ExamRepository', () => {
  let repository: ExamRepository;

  const redisMock = {
    set: vi.fn(),
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
});
