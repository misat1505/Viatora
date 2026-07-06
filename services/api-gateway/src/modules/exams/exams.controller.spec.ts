import { Test } from '@nestjs/testing';
import { ExamsController } from './exams.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { EXAMS_PACKAGE } from 'src/grpc/clients.module';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProfile } from 'src/generated/auth';

describe('ExamsController', () => {
  let controller: ExamsController;

  const grpcClientMock = {
    getService: vi.fn(),
  };

  const examServiceMock = {
    startSession: vi.fn(),
    getSession: vi.fn(),
    submitAnswer: vi.fn(),
    finishSession: vi.fn(),
    getResult: vi.fn(),
  };

  const grpcMetadataServiceMock = {
    authMeta: { metadata: 'mock' },
  };

  beforeEach(async () => {
    grpcClientMock.getService.mockReturnValue(examServiceMock);

    const moduleRef = await Test.createTestingModule({
      controllers: [ExamsController],
      providers: [
        { provide: EXAMS_PACKAGE, useValue: grpcClientMock },
        { provide: GrpcMetadataService, useValue: grpcMetadataServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(ExamsController);

    controller.onModuleInit();
    vi.clearAllMocks();
  });

  it('should call gRPC startSession with correct payload', async () => {
    const dto = { category: 'B' };
    const user = { userId: 'user-1' };

    const grpcResponse = { sessionId: 'sess_1' };

    examServiceMock.startSession.mockReturnValue(of(grpcResponse));

    const result = await controller.startExamSession(dto, user as UserProfile);

    expect(examServiceMock.startSession).toHaveBeenCalledWith(
      {
        category: 'B',
        userId: 'user-1',
      },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for startSession', async () => {
    examServiceMock.startSession.mockReturnValue(
      of(new Error('grpc failed') as any),
    );

    await expect(
      controller.startExamSession({ category: 'B' }, {
        userId: 'user-1',
      } as UserProfile),
    ).resolves.toBeDefined();
  });

  it('should call gRPC getSession with correct payload', async () => {
    const user = { userId: 'user-1' };

    const grpcResponse = {
      sessionId: 'sess_1',
      currentQuestion: {},
    };

    examServiceMock.getSession.mockReturnValue(of(grpcResponse));

    const result = await controller.getExamSession(
      'sess_1',
      user as UserProfile,
    );

    expect(examServiceMock.getSession).toHaveBeenCalledWith(
      {
        sessionId: 'sess_1',
        userId: 'user-1',
      },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse);
  });

  it('should call gRPC submitAnswer with correct payload', async () => {
    const user = { userId: 'user-1' };

    const dto = {
      questionId: 'question-1',
      userAnswer: 'a',
    };

    const grpcResponse = {
      correct: true,
      examFinished: false,
    };

    examServiceMock.submitAnswer.mockReturnValue(of(grpcResponse));

    const result = await controller.answerQuestion(
      'sess_1',
      dto,
      user as UserProfile,
    );

    expect(examServiceMock.submitAnswer).toHaveBeenCalledWith(
      {
        sessionId: 'sess_1',
        questionId: 'question-1',
        selectedOption: 'a',
        userId: 'user-1',
      },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for startSession', async () => {
    examServiceMock.startSession.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(
      controller.startExamSession({ category: 'B' }, {
        userId: 'user-1',
      } as UserProfile),
    ).rejects.toThrow('grpc failed');
  });

  it('should propagate gRPC error for getSession', async () => {
    examServiceMock.getSession.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(
      controller.getExamSession('sess_1', { userId: 'user-1' } as UserProfile),
    ).rejects.toThrow('grpc failed');
  });

  it('should propagate gRPC error for submitAnswer', async () => {
    examServiceMock.submitAnswer.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(
      controller.answerQuestion(
        'sess_1',
        {
          questionId: 'question-1',
          userAnswer: 'a',
        },
        { userId: 'user-1' } as UserProfile,
      ),
    ).rejects.toThrow('grpc failed');
  });

  it('should call gRPC finishSession with correct payload', async () => {
    const user = { userId: 'user-1' };

    const grpcResponse = {
      score: 10,
      finished: true,
    };

    examServiceMock.finishSession.mockReturnValue(of(grpcResponse));

    const result = await controller.finishSession(
      'sess_1',
      user as UserProfile,
    );

    expect(examServiceMock.finishSession).toHaveBeenCalledWith(
      {
        sessionId: 'sess_1',
        userId: 'user-1',
      },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for finishSession', async () => {
    examServiceMock.finishSession.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(
      controller.finishSession('sess_1', { userId: 'user-1' } as UserProfile),
    ).rejects.toThrow('grpc failed');
  });

  it('should call gRPC getResult with correct payload', async () => {
    const user = { userId: 'user-1' };

    const grpcResponse = {
      sessionId: 'sess_1',
      score: 8,
    };

    examServiceMock.getResult.mockReturnValue(of(grpcResponse));

    const result = await controller.getExamResult(
      'sess_1',
      user as UserProfile,
    );

    expect(examServiceMock.getResult).toHaveBeenCalledWith(
      {
        sessionId: 'sess_1',
        userId: 'user-1',
      },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for getResult', async () => {
    examServiceMock.getResult.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(
      controller.getExamResult('sess_1', { userId: 'user-1' } as UserProfile),
    ).rejects.toThrow('grpc failed');
  });
});
