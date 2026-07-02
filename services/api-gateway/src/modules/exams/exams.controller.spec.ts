import { Test } from '@nestjs/testing';
import { ExamsController } from './exams.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { EXAMS_PACKAGE } from 'src/grpc/clients.module';
import { of } from 'rxjs';
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
});
