import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';

describe('ExamController', () => {
  let controller: ExamController;

  const examServiceMock = {
    startExamSession: vi.fn(),
    getSessionById: vi.fn(),
    submitAnswer: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [
        {
          provide: ExamService,
          useValue: examServiceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(ExamController);

    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // GRPC METHOD DELEGATION
  // ─────────────────────────────────────────────
  it('should call ExamService.startExamSession with dto', async () => {
    const dto = {
      category: 'B',
      userId: 'user-1',
    };

    const expectedResponse = {
      sessionId: 'sess_1',
    };

    examServiceMock.startExamSession.mockResolvedValue(expectedResponse);

    const result = await controller.startExamSession(dto);

    expect(examServiceMock.startExamSession).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResponse);
  });

  it('should call ExamService.getSessionById with dto', async () => {
    const dto = {
      sessionId: 'sess_1',
      userId: 'user-1',
    };

    const expectedResponse = {
      sessionId: 'sess_1',
      userId: 'user-1',
    };

    examServiceMock.getSessionById.mockResolvedValue(expectedResponse);

    const result = await controller.getSessionById(dto);

    expect(examServiceMock.getSessionById).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResponse);
  });

  it('should call ExamService.submitAnswer with dto', async () => {
    const dto = {
      sessionId: 'sess_1',
      questionId: 'question-1',
      selectedOption: 'a',
      userId: 'user-1',
    };

    const expectedResponse = {
      correct: true,
      examFinished: false,
    };

    examServiceMock.submitAnswer.mockResolvedValue(expectedResponse);

    const result = await controller.submitAnswer(dto);

    expect(examServiceMock.submitAnswer).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResponse);
  });

  it('should propagate errors from startExamSession', async () => {
    examServiceMock.startExamSession.mockRejectedValue(
      new Error('service failed'),
    );

    await expect(
      controller.startExamSession({
        category: 'B',
        userId: 'user-1',
      }),
    ).rejects.toThrow('service failed');
  });

  it('should propagate errors from getSessionById', async () => {
    examServiceMock.getSessionById.mockRejectedValue(
      new Error('service failed'),
    );

    await expect(
      controller.getSessionById({
        sessionId: 'sess_1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('service failed');
  });

  it('should propagate errors from submitAnswer', async () => {
    examServiceMock.submitAnswer.mockRejectedValue(new Error('service failed'));

    await expect(
      controller.submitAnswer({
        sessionId: 'sess_1',
        questionId: 'question-1',
        selectedOption: 'a',
        userId: 'user-1',
      }),
    ).rejects.toThrow('service failed');
  });
});
