import { Test } from '@nestjs/testing';
import { ExamResultsController } from './exam-results.controller';
import { ExamResultsService } from './exam-results.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ExamResultsController', () => {
  let controller: ExamResultsController;

  const examResultsServiceMock = {
    getExamResult: vi.fn(),
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
  // 1. HAPPY PATH
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

  // ─────────────────────────────────────────────
  // 2. ERROR PROPAGATION
  // ─────────────────────────────────────────────
  it('should propagate error from service', async () => {
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

  // ─────────────────────────────────────────────
  // 3. ENSURE PASS THROUGH DTO (no mutation)
  // ─────────────────────────────────────────────
  it('should pass DTO without modification', async () => {
    const dto = {
      sessionId: 'sess_123',
      userId: 'user-999',
    };

    examResultsServiceMock.getExamResult.mockResolvedValue({});

    await controller.getExamResult(dto);

    expect(examResultsServiceMock.getExamResult).toHaveBeenCalledTimes(1);
    expect(examResultsServiceMock.getExamResult).toHaveBeenCalledWith(dto);
  });
});
