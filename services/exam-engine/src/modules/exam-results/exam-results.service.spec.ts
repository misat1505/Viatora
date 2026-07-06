import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExamResultsService } from './exam-results.service';
import { EXAM_RESULT_REPOSITORY_TOKEN } from './persistance/exam-result.repository';
import { EXAM_ANSWER_REPOSITORY_TOKEN } from './persistance/exam-answer.repository';

describe('ExamResultsService', () => {
  let service: ExamResultsService;

  const resultRepoMock = {
    create: vi.fn(),
    save: vi.fn(),
    findBySessionAndUser: vi.fn(),
    findByUserId: vi.fn(),
  };

  const answerRepoMock = {
    create: vi.fn(),
    saveMany: vi.fn(),
    findBySession: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ExamResultsService,
        {
          provide: EXAM_RESULT_REPOSITORY_TOKEN,
          useValue: resultRepoMock,
        },
        {
          provide: EXAM_ANSWER_REPOSITORY_TOKEN,
          useValue: answerRepoMock,
        },
      ],
    }).compile();

    service = moduleRef.get(ExamResultsService);

    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // markExam
  // ─────────────────────────────────────────────

  it('should calculate result and save exam correctly', async () => {
    const exam = {
      sessionId: 'sess_1',
      userId: 'user-1',
      category: 'B',
      totalQuestions: 1,
      timeLimitSeconds: 1000,
      startedAt: '2026-07-06T10:00:00.000Z',
      questions: [
        {
          userAnswer: 'a',
          answeredAt: '2026-07-06T10:01:00.000Z',
          question: {
            id: 'q1',
            slug: 'q-1',
            points: 10,
            answers: {
              correctAnswer: 'a',
            },
          },
        },
      ],
    };

    const createdEntity = {
      id: 'sess_1',
      user_id: 'user-1',
      status: 'COMPLETED',
      category: 'B',
      total_questions: 1,
      correct_answers: 1,
      earned_points: 10,
      max_points: 10,
      passed: true,
      time_limit_seconds: 1000,
      started_at: new Date(exam.startedAt),
      completed_at: new Date(),
    };

    resultRepoMock.create.mockReturnValue(createdEntity);
    resultRepoMock.save.mockResolvedValue(createdEntity);
    answerRepoMock.saveMany.mockResolvedValue([
      {
        id: 'a1',
        question_id: 'q1',
        question_slug: 'q-1',
        selected_option: 'a',
        correct_option: 'a',
        is_correct: true,
        answered_at: new Date(exam.questions[0].answeredAt),
      },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await service.markExam(exam as any);

    expect(resultRepoMock.create).toHaveBeenCalled();
    expect(resultRepoMock.save).toHaveBeenCalledWith(createdEntity);
    expect(answerRepoMock.saveMany).toHaveBeenCalled();

    expect(result.sessionId).toBe('sess_1');
    expect(result.correctAnswers).toBe(1);
    expect(result.earnedPoints).toBe(10);
    expect(result.scorePercent).toBe(100);
  });

  // ─────────────────────────────────────────────
  // getExamResult - success
  // ─────────────────────────────────────────────

  it('should return exam result with answers', async () => {
    resultRepoMock.findBySessionAndUser.mockResolvedValue({
      id: 'sess_1',
      user_id: 'user-1',
      status: 'COMPLETED',
      category: 'B',
      total_questions: 2,
      correct_answers: 1,
      earned_points: 10,
      max_points: 20,
      passed: false,
      time_limit_seconds: 1000,
      started_at: new Date('2026-07-06T10:00:00.000Z'),
      completed_at: new Date('2026-07-06T10:10:00.000Z'),
    });

    answerRepoMock.findBySession.mockResolvedValue([
      {
        id: 'a1',
        question_id: 'q1',
        question_slug: 'q-1',
        selected_option: 'a',
        correct_option: 'b',
        is_correct: false,
        answered_at: new Date('2026-07-06T10:01:00.000Z'),
      },
    ]);

    const result = await service.getExamResult({
      sessionId: 'sess_1',
      userId: 'user-1',
    });

    expect(resultRepoMock.findBySessionAndUser).toHaveBeenCalledWith(
      'sess_1',
      'user-1',
    );

    expect(result.answers).toHaveLength(1);
    expect(result.scorePercent).toBe(50);
    expect(result.sessionId).toBe('sess_1');
  });

  // ─────────────────────────────────────────────
  // getExamResult - not found
  // ─────────────────────────────────────────────

  it('should throw error when result not found', async () => {
    resultRepoMock.findBySessionAndUser.mockResolvedValue(null);

    await expect(
      service.getExamResult({
        sessionId: 'sess_404',
        userId: 'user-1',
      }),
    ).rejects.toThrow('Exam result not found');
  });

  // ─────────────────────────────────────────────
  // edge case: maxPoints = 0
  // ─────────────────────────────────────────────

  it('should return 0 scorePercent when maxPoints is 0', async () => {
    resultRepoMock.findBySessionAndUser.mockResolvedValue({
      id: 'sess_1',
      user_id: 'user-1',
      status: 'COMPLETED',
      category: 'B',
      total_questions: 2,
      correct_answers: 0,
      earned_points: 0,
      max_points: 0,
      passed: false,
      time_limit_seconds: 1000,
      started_at: new Date(),
      completed_at: new Date(),
    });

    answerRepoMock.findBySession.mockResolvedValue([]);

    const result = await service.getExamResult({
      sessionId: 'sess_1',
      userId: 'user-1',
    });

    expect(result.scorePercent).toBe(0);
  });

  it('should return exams list for user', async () => {
    resultRepoMock.findByUserId = vi.fn();

    resultRepoMock.findByUserId.mockResolvedValue([
      {
        id: 'sess_1',
        user_id: 'user-1',
        status: 'COMPLETED',
        category: 'B',
        total_questions: 10,
        correct_answers: 8,
        earned_points: 80,
        max_points: 100,
        passed: true,
        time_limit_seconds: 1000,
        started_at: new Date('2026-07-06T10:00:00.000Z'),
        completed_at: new Date('2026-07-06T10:30:00.000Z'),
      },
    ]);

    const result = await service.getExamsResults({
      userId: 'user-1',
    });

    expect(resultRepoMock.findByUserId).toHaveBeenCalledWith('user-1');

    expect(result.exams).toHaveLength(1);
    expect(result.exams[0]).toEqual(
      expect.objectContaining({
        sessionId: 'sess_1',
        userId: 'user-1',
        scorePercent: 80,
        passed: true,
      }),
    );
  });
});
