import { Test } from '@nestjs/testing';
import { ExamResultsController } from './exam-results.controller';
import { ExamResultsService } from './exam-results.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ExamResultsController', () => {
  let controller: ExamResultsController;

  const examResultsServiceMock = {
    getExamResult: vi.fn(),
    getExamsResults: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ExamResultsController],
      providers: [
        {
          provide: ExamResultsService,
          useValue: examResultsServiceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(ExamResultsController);

    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // GetExamResult
  // ─────────────────────────────────────────────

  it('should call ExamResultsService.getExamResult and return result', async () => {
    const dto = {
      sessionId: 'sess_1',
      userId: 'user-1',
    };

    const serviceResponse = {
      sessionId: 'sess_1',
      userId: 'user-1',
      scorePercent: 95,
      passed: true,
    };

    examResultsServiceMock.getExamResult.mockResolvedValue(serviceResponse);

    const result = await controller.getExamResult(dto);

    expect(examResultsServiceMock.getExamResult).toHaveBeenCalledWith(dto);
    expect(result).toEqual(serviceResponse);
  });

  it('should propagate error from getExamResult service', async () => {
    examResultsServiceMock.getExamResult.mockRejectedValue(
      new Error('service failed'),
    );

    await expect(
      controller.getExamResult({
        sessionId: 'sess_1',
        userId: 'user-1',
      }),
    ).rejects.toThrow('service failed');
  });

  it('should pass DTO without modification (getExamResult)', async () => {
    const dto = {
      sessionId: 'sess_123',
      userId: 'user-999',
    };

    examResultsServiceMock.getExamResult.mockResolvedValue({});

    await controller.getExamResult(dto);

    expect(examResultsServiceMock.getExamResult).toHaveBeenCalledWith(dto);
  });

  // ─────────────────────────────────────────────
  // ListResults
  // ─────────────────────────────────────────────

  it('should call ExamResultsService.getExamsResults and return result', async () => {
    const dto = {
      userId: 'user-1',
    };

    const serviceResponse = {
      exams: [
        {
          sessionId: 'sess_1',
          scorePercent: 80,
        },
      ],
    };

    examResultsServiceMock.getExamsResults.mockResolvedValue(serviceResponse);

    const result = await controller.getExamsResults(dto);

    expect(examResultsServiceMock.getExamsResults).toHaveBeenCalledWith(dto);
    expect(result).toEqual(serviceResponse);
  });

  it('should propagate error from getExamsResults service', async () => {
    examResultsServiceMock.getExamsResults.mockRejectedValue(
      new Error('list failed'),
    );

    await expect(
      controller.getExamsResults({
        userId: 'user-1',
      }),
    ).rejects.toThrow('list failed');
  });

  it('should pass DTO without modification (getExamsResults)', async () => {
    const dto = {
      userId: 'user-999',
    };

    examResultsServiceMock.getExamsResults.mockResolvedValue({});

    await controller.getExamsResults(dto);

    expect(examResultsServiceMock.getExamsResults).toHaveBeenCalledWith(dto);
  });
});
