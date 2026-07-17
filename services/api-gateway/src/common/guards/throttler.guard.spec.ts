import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from './throttler.guard';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { ConfigService } from '@nestjs/config';

describe('ThrottlerGuard', () => {
  let guard: ThrottlerGuard;
  let redisMock: {
    zremrangebyscore: ReturnType<typeof vi.fn>;
    zcard: ReturnType<typeof vi.fn>;
    zadd: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
  };
  let configServiceMock: { getOrThrow: ReturnType<typeof vi.fn> };

  const WINDOW_SECONDS = 60;
  const MAX_REQUESTS = 10;

  const createExecutionContext = (ip?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ ip }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    redisMock = {
      zremrangebyscore: vi.fn().mockResolvedValue(0),
      zcard: vi.fn().mockResolvedValue(0),
      zadd: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
    };

    configServiceMock = {
      getOrThrow: vi.fn((key: string) => {
        if (key === 'THROTTLING_WINDOW_SECONDS') return WINDOW_SECONDS;
        if (key === 'THROTTLING_WINDOW_MAX_REQUESTS') return MAX_REQUESTS;
        throw new Error(`Unexpected config key: ${key}`);
      }),
    };

    guard = new ThrottlerGuard(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      redisMock as any,
      configServiceMock as unknown as ConfigService,
    );

    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads window and limit values from config on construction', () => {
    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
      'THROTTLING_WINDOW_SECONDS',
    );
    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
      'THROTTLING_WINDOW_MAX_REQUESTS',
    );
    expect(guard.windowSeconds).toBe(WINDOW_SECONDS);
    expect(guard.windowMaxRequests).toBe(MAX_REQUESTS);
  });

  it('returns false when the request has no IP', async () => {
    const context = createExecutionContext(undefined);

    const result = await guard.canActivate(context);

    expect(result).toBe(false);
    expect(redisMock.zremrangebyscore).not.toHaveBeenCalled();
  });

  it('allows the request when the limit is not exceeded', async () => {
    redisMock.zcard.mockResolvedValue(MAX_REQUESTS - 1);
    const context = createExecutionContext('1.2.3.4');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(redisMock.zadd).toHaveBeenCalledTimes(1);
    expect(redisMock.expire).toHaveBeenCalledWith(
      expect.any(String),
      WINDOW_SECONDS,
    );
  });

  it('throws TooManyRequestsException when the limit is reached', async () => {
    redisMock.zcard.mockResolvedValue(MAX_REQUESTS);
    const context = createExecutionContext('1.2.3.4');

    await expect(guard.canActivate(context)).rejects.toThrow(
      TooManyRequestsException,
    );

    // we should not add another entry once the limit has been exceeded
    expect(redisMock.zadd).not.toHaveBeenCalled();
  });

  it('throws TooManyRequestsException when the limit is exceeded', async () => {
    redisMock.zcard.mockResolvedValue(MAX_REQUESTS + 5);
    const context = createExecutionContext('1.2.3.4');

    await expect(guard.canActivate(context)).rejects.toThrow(
      TooManyRequestsException,
    );
  });

  it('removes entries older than the window start (windowStart)', async () => {
    const now = 1_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const context = createExecutionContext('1.2.3.4');

    await guard.canActivate(context);

    const expectedWindowStart = now - WINDOW_SECONDS * 1000;

    expect(redisMock.zremrangebyscore).toHaveBeenCalledWith(
      expect.any(String),
      0,
      expectedWindowStart,
    );
  });

  it('hashes the IP before using it as part of the Redis key (does not store the raw IP)', async () => {
    const context = createExecutionContext('9.9.9.9');

    await guard.canActivate(context);

    const [redisKey] = redisMock.zremrangebyscore.mock.calls[0];

    expect(redisKey).not.toContain('9.9.9.9');
    expect(redisKey).toMatch(/^api-gateway:throttler:ip:[a-f0-9]{64}$/);
  });

  it('uses the same Redis key for the same IP across multiple calls', async () => {
    const context = createExecutionContext('5.5.5.5');

    await guard.canActivate(context);
    await guard.canActivate(context);

    const firstKey = redisMock.zremrangebyscore.mock.calls[0][0];
    const secondKey = redisMock.zremrangebyscore.mock.calls[1][0];

    expect(firstKey).toBe(secondKey);
  });

  it('sets the key TTL to windowSeconds', async () => {
    const context = createExecutionContext('1.2.3.4');

    await guard.canActivate(context);

    expect(redisMock.expire).toHaveBeenCalledWith(
      expect.any(String),
      WINDOW_SECONDS,
    );
  });
});
