import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { ExamService } from './exam.service';
import { QUESTIONS_REPOSITORY_TOKEN } from './persistance/questions.repository';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import {
  DEFAULT_EXAMS_CONFIGS_TOKEN,
  QuestionType,
} from './config/exams-config';

describe('ExamService', () => {
  let service: ExamService;

  const questionsRepositoryMock = {
    getQuestionsByCategory: vi.fn(),
  };

  const examRepositoryMock = {
    createExamSession: vi.fn(),
  };

  const examsConfigurationsMock = {
    B: {
      duration: 1500,
      totalQuestions: 2,
      questionsConfigs: [
        {
          questionType: QuestionType.SPECIALIST,
          points: 3,
          count: 6,
        },
        {
          questionType: QuestionType.SPECIALIST,
          points: 2,
          count: 5,
        },
      ],
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: QUESTIONS_REPOSITORY_TOKEN,
          useValue: questionsRepositoryMock,
        },
        {
          provide: EXAM_REPOSITORY_TOKEN,
          useValue: examRepositoryMock,
        },
        {
          provide: DEFAULT_EXAMS_CONFIGS_TOKEN,
          useValue: examsConfigurationsMock,
        },
      ],
    }).compile();

    service = moduleRef.get(ExamService);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────
  // 1. INVALID CATEGORY
  // ─────────────────────────────────────────────
  it('should throw BadRequestException for invalid category', async () => {
    await expect(
      service.startExamSession({
        category: 'INVALID',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ─────────────────────────────────────────────
  // 2. HAPPY PATH
  // ─────────────────────────────────────────────
  it('should create exam session successfully', async () => {
    questionsRepositoryMock.getQuestionsByCategory.mockResolvedValue([
      { id: 'q1' },
    ]);

    examRepositoryMock.createExamSession.mockResolvedValue({
      sessionId: 'sess_1',
    });

    const result = await service.startExamSession({
      category: 'B',
      userId: 'user-1',
    });

    expect(result).toEqual({ sessionId: 'sess_1' });

    expect(
      questionsRepositoryMock.getQuestionsByCategory,
    ).toHaveBeenCalledTimes(2);
    expect(examRepositoryMock.createExamSession).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // 3. WARN WHEN QUESTIONS MISMATCH
  // ─────────────────────────────────────────────
  it('should warn when question count mismatch', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    questionsRepositoryMock.getQuestionsByCategory.mockResolvedValue([]);

    examRepositoryMock.createExamSession.mockResolvedValue({
      sessionId: 'sess_1',
    });

    await service.startExamSession({
      category: 'B',
      userId: 'user-1',
    });

    expect(warnSpy).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // 4. QUESTIONS MAPPING
  // ─────────────────────────────────────────────
  it('should map questions with empty userAnswer', async () => {
    questionsRepositoryMock.getQuestionsByCategory.mockResolvedValue([
      { id: 'q1' },
    ]);

    let capturedDTO: any;

    examRepositoryMock.createExamSession.mockImplementation((dto) => {
      capturedDTO = dto;
      return Promise.resolve({ sessionId: 'sess_1' });
    });

    await service.startExamSession({
      category: 'B',
      userId: 'user-1',
    });

    expect(capturedDTO.questions[0]).toEqual({
      question: { id: 'q1' },
      userAnswer: '',
    });
  });
});
