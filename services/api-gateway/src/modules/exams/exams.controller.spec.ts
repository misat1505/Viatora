import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { EXAM_GRPC_CLIENT } from './exams.tokens';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';

describe('ExamsController integration', () => {
  let controller: ExamsController;

  const grpcServiceMock = {
    startSession: vi.fn(),
    getSession: vi.fn(),
    submitAnswer: vi.fn(),
    finishSession: vi.fn(),
    getResult: vi.fn(),
    listResults: vi.fn(),
  };

  const grpcClientMock = {
    service: grpcServiceMock,
  } as unknown as GrpcClientWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [ExamsController],
      providers: [
        ExamsService,
        {
          provide: EXAM_GRPC_CLIENT,
          useValue: grpcClientMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(ExamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startExamSession', () => {
    it('should start exam session', async () => {
      grpcServiceMock.startSession.mockResolvedValue({
        sessionId: 'sess-1',
        userId: 'user-1',
        category: 'B',
        questions: [],
      });

      const result = await controller.startExamSession(
        {
          category: 'B',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          userId: 'user-1',
        } as any,
      );

      expect(grpcServiceMock.startSession).toHaveBeenCalledWith({
        userId: 'user-1',
        category: 'B',
      });

      expect(result).toEqual({
        sessionId: 'sess-1',
        userId: 'user-1',
        category: 'B',
        questions: [],
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.startSession.mockRejectedValue(new Error('grpc failed'));

      await expect(
        controller.startExamSession(
          {
            category: 'B',
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            userId: 'user-1',
          } as any,
        ),
      ).rejects.toThrow('grpc failed');
    });
  });

  describe('getExamSession', () => {
    it('should return mapped exam session', async () => {
      grpcServiceMock.getSession.mockResolvedValue({
        sessionId: 'sess-1',
        userId: 'user-1',
        category: 'B',
        questions: [],
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.getExamSession('sess-1', {
        userId: 'user-1',
      } as any);

      expect(grpcServiceMock.getSession).toHaveBeenCalledWith({
        userId: 'user-1',
        sessionId: 'sess-1',
      });

      expect(result).toEqual({
        sessionId: 'sess-1',
        userId: 'user-1',
        category: 'B',
        questions: [],
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.getSession.mockRejectedValue(new Error('grpc failed'));

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        controller.getExamSession('sess-1', {
          userId: 'user-1',
        } as any),
      ).rejects.toThrow('grpc failed');
    });
  });

  describe('answerQuestion', () => {
    it('should submit answer', async () => {
      grpcServiceMock.submitAnswer.mockResolvedValue({
        accepted: true,
        answeredCount: 1,
        totalQuestions: 20,
        secondsRemaining: 500,
      });

      const result = await controller.answerQuestion(
        'sess-1',
        {
          questionId: 'q-1',
          userAnswer: 'a',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          userId: 'user-1',
        } as any,
      );

      expect(grpcServiceMock.submitAnswer).toHaveBeenCalledWith({
        userId: 'user-1',
        sessionId: 'sess-1',
        questionId: 'q-1',
        selectedOption: 'a',
      });

      expect(result).toEqual({
        accepted: true,
        answeredCount: 1,
        totalQuestions: 20,
        secondsRemaining: 500,
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.submitAnswer.mockRejectedValue(new Error('grpc failed'));

      await expect(
        controller.answerQuestion(
          'sess-1',
          {
            questionId: 'q-1',
            userAnswer: 'a',
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            userId: 'user-1',
          } as any,
        ),
      ).rejects.toThrow('grpc failed');
    });
  });

  describe('finishSession', () => {
    it('should finish exam session', async () => {
      grpcServiceMock.finishSession.mockResolvedValue({
        sessionId: 'sess-1',
        userId: 'user-1',
        passed: true,
        scorePercent: 90,
        answers: [],
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.finishSession('sess-1', {
        userId: 'user-1',
      } as any);

      expect(grpcServiceMock.finishSession).toHaveBeenCalledWith({
        userId: 'user-1',
        sessionId: 'sess-1',
      });

      expect(result).toEqual({
        sessionId: 'sess-1',
        userId: 'user-1',
        passed: true,
        scorePercent: 90,
        answers: [],
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.finishSession.mockRejectedValue(new Error('grpc failed'));

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        controller.finishSession('sess-1', {
          userId: 'user-1',
        } as any),
      ).rejects.toThrow('grpc failed');
    });
  });

  describe('getExamResult', () => {
    it('should return exam result', async () => {
      grpcServiceMock.getResult.mockResolvedValue({
        sessionId: 'sess-1',
        passed: true,
        scorePercent: 80,
        answers: [],
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.getExamResult('sess-1', {
        userId: 'user-1',
      } as any);

      expect(grpcServiceMock.getResult).toHaveBeenCalledWith({
        userId: 'user-1',
        sessionId: 'sess-1',
      });

      expect(result).toEqual({
        sessionId: 'sess-1',
        passed: true,
        scorePercent: 80,
        answers: [],
      });
    });
  });

  describe('getExamsResults', () => {
    it('should return exams results', async () => {
      grpcServiceMock.listResults.mockResolvedValue({
        exams: [],
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await controller.getExamsResults({
        userId: 'user-1',
      } as any);

      expect(grpcServiceMock.listResults).toHaveBeenCalledWith({
        userId: 'user-1',
      });

      expect(result).toEqual({
        exams: [],
      });
    });
  });
});
