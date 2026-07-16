import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StatsController } from './stats.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { STATS_PACKAGE } from 'src/grpc/clients.module';
import { UserProfile } from 'src/generated/auth';

describe('StatsController', () => {
  let controller: StatsController;

  const grpcClientMock = {
    getService: vi.fn(),
  };

  const statsServiceMock = {
    getSummary: vi.fn(),
  };

  const grpcMetadataServiceMock = {
    authMeta: { metadata: 'mock' },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    grpcClientMock.getService.mockReturnValue(statsServiceMock);

    const moduleRef = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: STATS_PACKAGE,
          useValue: grpcClientMock,
        },
        {
          provide: GrpcMetadataService,
          useValue: grpcMetadataServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(StatsController);

    controller.onModuleInit();
  });

  it('should initialize grpc stats service on module init', () => {
    expect(grpcClientMock.getService).toHaveBeenCalledWith('StatsService');
  });

  it('should call gRPC getSummary with correct payload', async () => {
    const user = {
      userId: 'user-123',
    } as UserProfile;

    const grpcResponse = {
      totalExams: 10,
      passRate: 80,
      averageScore: 75.5,
      bestScore: 100,
      currentStreak: 3,
      longestStreak: 5,
      totalTimeMinutes: 240,
    };

    statsServiceMock.getSummary.mockReturnValue(of(grpcResponse));

    const result = await controller.getStatsSummary(user);

    expect(statsServiceMock.getSummary).toHaveBeenCalledWith(
      {
        userId: 'user-123',
      },
      grpcMetadataServiceMock.authMeta,
    );

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for getSummary', async () => {
    const user = {
      userId: 'user-123',
    } as UserProfile;

    statsServiceMock.getSummary.mockReturnValue(
      throwError(() => new Error('grpc failed')),
    );

    await expect(controller.getStatsSummary(user)).rejects.toThrow(
      'grpc failed',
    );
  });
});
