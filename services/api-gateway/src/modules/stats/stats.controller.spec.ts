import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StatsController } from './stats.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserProfile } from 'src/generated/auth';
import { StatsService } from './stats.service';
import { STATS_GRPC_CLIENT } from './stats.tokens';

describe('StatsController', () => {
  let controller: StatsController;

  const grpcClientMock = {
    service: {
      getSummary: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        StatsService,
        {
          provide: STATS_GRPC_CLIENT,
          useValue: grpcClientMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(StatsController);
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

    grpcClientMock.service.getSummary.mockResolvedValue(grpcResponse);

    const result = await controller.getStatsSummary(user);

    expect(grpcClientMock.service.getSummary).toHaveBeenCalledWith({
      userId: 'user-123',
    });

    expect(result).toEqual(grpcResponse);
  });

  it('should propagate gRPC error for getSummary', async () => {
    const user = {
      userId: 'user-123',
    } as UserProfile;

    grpcClientMock.service.getSummary.mockRejectedValue(
      new Error('grpc failed'),
    );

    await expect(controller.getStatsSummary(user)).rejects.toThrow(
      'grpc failed',
    );
  });
});
