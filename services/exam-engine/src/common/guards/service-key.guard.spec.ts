import { ServiceKeyGuard } from './service-key.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { beforeEach, describe, vi, Mocked, it, expect } from 'vitest';

describe('ServiceKeyGuard', () => {
  let guard: ServiceKeyGuard;
  let configService: Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      getOrThrow: vi.fn(),
    } as any;

    configService.getOrThrow.mockReturnValue('secret-key');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    guard = new ServiceKeyGuard(configService);
    guard.onModuleInit();
  });

  const createContext = (serviceKey?: string) =>
    ({
      switchToRpc: () => ({
        getContext: () => {
          const metadata = new Metadata();

          if (serviceKey) {
            metadata.set('x-service-key', serviceKey);
          }

          return metadata;
        },
      }),
    }) as unknown as ExecutionContext;

  it('should allow request with correct service key', () => {
    const context = createContext('secret-key');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny request with wrong service key', () => {
    const context = createContext('wrong-key');

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny request when service key is missing', () => {
    const context = createContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });
});
