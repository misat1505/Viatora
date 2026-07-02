import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';

describe('ExamController', () => {
  let controller: ExamController;

  const examServiceMock = {
    startExamSession: vi.fn(),
    getSessionById: vi.fn(),
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
});
