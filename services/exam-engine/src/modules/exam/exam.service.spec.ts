import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { ExamService } from './exam.service';
import { QUESTIONS_REPOSITORY_TOKEN } from './persistance/questions.repository';
import { EXAM_REPOSITORY_TOKEN } from './persistance/exam.repository';
import {
  DEFAULT_EXAMS_CONFIGS_TOKEN,
  QuestionType,
} from './config/exams-config';
import { ExamQuestion } from 'src/generated/content';

vi.mock('./utils/shuffle-questions', () => ({
  shuffleQuestions: (questions: ExamQuestion[]) => questions,
}));

describe('ExamService', () => {
  let service: ExamService;

  const questionsRepositoryMock = {
    getQuestionsByCategory: vi.fn(),
  };

  const examRepositoryMock = {
    createExamSession: vi.fn(),
    getById: vi.fn(),
    updateById: vi.fn(),
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
    questionsRepositoryMock.getQuestionsByCategory.mockResolvedValue([]);

    examRepositoryMock.createExamSession.mockResolvedValue({
      sessionId: 'sess_1',
    });

    await expect(
      service.startExamSession({
        category: 'B',
        userId: 'user-1',
      }),
    ).rejects.toThrow(InternalServerErrorException);
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

  it('should return exam session when userId matches', async () => {
    examRepositoryMock.getById.mockResolvedValue({
      sessionId: 'sess_1',
      userId: 'user-1',
    });

    const result = await service.getSessionById({
      sessionId: 'sess_1',
      userId: 'user-1',
    });

    expect(result).toEqual({
      sessionId: 'sess_1',
      userId: 'user-1',
    });

    expect(examRepositoryMock.getById).toHaveBeenCalledWith('sess_1');
  });

  it('should throw NotFoundException when session does not exist', async () => {
    examRepositoryMock.getById.mockResolvedValue(null);

    await expect(
      service.getSessionById({
        sessionId: 'sess_404',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw NotFoundException when userId does not match session owner', async () => {
    examRepositoryMock.getById.mockResolvedValue({
      sessionId: 'sess_1',
      userId: 'user-2',
    });

    await expect(
      service.getSessionById({
        sessionId: 'sess_1',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should submit answer successfully', async () => {
    examRepositoryMock.getById.mockResolvedValue({
      sessionId: 'sess_1',
      userId: 'user-1',
      startedAt: new Date().toISOString(),
      currentQuestionId: 'q1',
      totalQuestions: 2,
      questions: [
        {
          question: {
            id: 'q1',
            questionType: 'basic',
          },
          userAnswer: '',
        },
        {
          question: {
            id: 'q2',
            questionType: 'basic',
          },
          userAnswer: '',
        },
      ],
    });

    examRepositoryMock.updateById.mockResolvedValue(undefined);

    const result = await service.submitAnswer({
      sessionId: 'sess_1',
      userId: 'user-1',
      questionId: 'q1',
      selectedOption: 'a',
    });

    expect(examRepositoryMock.updateById).toHaveBeenCalled();

    expect(result.accepted).toBe(true);
    expect(result.answeredCount).toBe(1);
    expect(result.totalQuestions).toBe(2);
  });

  it('should move currentQuestionId to STOP after last answer', async () => {
    const exam = {
      sessionId: 'sess_1',
      userId: 'user-1',
      startedAt: new Date().toISOString(),
      currentQuestionId: 'q1',
      totalQuestions: 1,
      questions: [
        {
          question: {
            id: 'q1',
            questionType: 'basic',
          },
          userAnswer: '',
        },
      ],
    };

    examRepositoryMock.getById.mockResolvedValue(exam);
    examRepositoryMock.updateById.mockResolvedValue(undefined);

    await service.submitAnswer({
      sessionId: 'sess_1',
      userId: 'user-1',
      questionId: 'q1',
      selectedOption: 'a',
    });

    expect(exam.currentQuestionId).toBe('STOP');
  });

  it('should move currentQuestionId to STOP after last answer', async () => {
    const exam = {
      sessionId: 'sess_1',
      userId: 'user-1',
      startedAt: new Date().toISOString(),
      currentQuestionId: 'q1',
      totalQuestions: 1,
      questions: [
        {
          question: {
            id: 'q1',
            questionType: 'basic',
          },
          userAnswer: '',
        },
      ],
    };

    examRepositoryMock.getById.mockResolvedValue(exam);
    examRepositoryMock.updateById.mockResolvedValue(undefined);

    await service.submitAnswer({
      sessionId: 'sess_1',
      userId: 'user-1',
      questionId: 'q1',
      selectedOption: 'a',
    });

    expect(exam.currentQuestionId).toBe('STOP');
  });

  it('should throw when exam does not exist', async () => {
    examRepositoryMock.getById.mockResolvedValue(null);

    await expect(
      service.submitAnswer({
        sessionId: 'sess_1',
        userId: 'user-1',
        questionId: 'q1',
        selectedOption: 'a',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when exam belongs to another user', async () => {
    examRepositoryMock.getById.mockResolvedValue({
      sessionId: 'sess_1',
      userId: 'user-2',
    });

    await expect(
      service.submitAnswer({
        sessionId: 'sess_1',
        userId: 'user-1',
        questionId: 'q1',
        selectedOption: 'a',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when question does not exist', async () => {
    examRepositoryMock.getById.mockResolvedValue({
      sessionId: 'sess_1',
      userId: 'user-1',
      currentQuestionId: 'q1',
      questions: [],
    });

    await expect(
      service.submitAnswer({
        sessionId: 'sess_1',
        userId: 'user-1',
        questionId: 'q1',
        selectedOption: 'a',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("should throw when answer 'c' is selected for basic question", async () => {
    examRepositoryMock.getById.mockResolvedValue({
      sessionId: 'sess_1',
      userId: 'user-1',
      currentQuestionId: 'q1',
      questions: [
        {
          question: {
            id: 'q1',
            questionType: 'basic',
          },
        },
      ],
    });

    await expect(
      service.submitAnswer({
        sessionId: 'sess_1',
        userId: 'user-1',
        questionId: 'q1',
        selectedOption: 'c',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
