import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc } from '@nestjs/microservices';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AUTH_PACKAGE } from '../../grpc/clients.module';
import { AuthServiceClient } from 'src/generated/auth';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { createHash } from 'crypto';

vi.mock('crypto', () => ({
  createHash: vi.fn(),
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const authServiceMock: Mocked<AuthServiceClient> = {
    validateToken: vi.fn(),
  } as any;

  const grpcMetadataServiceMock: Mocked<GrpcMetadataService> = {
    authMeta: 'service-key',
  } as any;

  const grpcClientMock = {
    getService: vi.fn().mockReturnValue(authServiceMock),
  } as Partial<ClientGrpc>;

  const cacheManagerMock = {
    get: vi.fn(),
    set: vi.fn(),
  } as any;

  const CACHE_KEY = 'api-gateway:token:cache:hashed-token';

  beforeEach(async () => {
    vi.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(createHash).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('hashed-token'),
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: AUTH_PACKAGE,
          useValue: grpcClientMock,
        },
        {
          provide: GrpcMetadataService,
          useValue: grpcMetadataServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    guard.onModuleInit();
  });

  const createContext = (request: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        getRequest: () => request,
      }),
    }) as ExecutionContext;

  describe('onModuleInit', () => {
    it('should initialize auth service', () => {
      expect(grpcClientMock.getService).toHaveBeenCalledWith('AuthService');
    });
  });

  describe('canActivate', () => {
    it('should throw when authorization header is missing', async () => {
      const request = { headers: {} };

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        new UnauthorizedException('Missing token'),
      );
    });

    it('should throw when authorization header is invalid', async () => {
      const request = {
        headers: { authorization: 'invalid-token' },
      };

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        new UnauthorizedException('Missing token'),
      );
    });

    it('should return cached user if exists', async () => {
      cacheManagerMock.get.mockResolvedValue(
        JSON.stringify({
          userId: 'user-1',
          email: 'john@example.com',
          jti: 'jti-123',
        }),
      );

      const request: any = {
        headers: { authorization: 'Bearer valid-token' },
      };

      const result = await guard.canActivate(createContext(request));

      expect(result).toBe(true);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(CACHE_KEY);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.validateToken).not.toHaveBeenCalled();

      expect(request.user).toEqual({
        userId: 'user-1',
        email: 'john@example.com',
        jti: 'jti-123',
      });
    });

    it('should throw when token validation returns invalid', async () => {
      cacheManagerMock.get.mockResolvedValue(null);

      authServiceMock.validateToken.mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        of({ valid: false }) as any,
      );

      const request = {
        headers: { authorization: 'Bearer token' },
      };

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        new UnauthorizedException('Invalid token'),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.validateToken).toHaveBeenCalledWith(
        { token: 'token' },
        'service-key',
      );
    });

    it('should throw when auth service fails', async () => {
      cacheManagerMock.get.mockResolvedValue(null);

      authServiceMock.validateToken.mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throwError(() => new Error('grpc error')) as any,
      );

      const request = {
        headers: { authorization: 'Bearer token' },
      };

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        new UnauthorizedException('Invalid token'),
      );
    });

    it('should attach user to request and cache it', async () => {
      cacheManagerMock.get.mockResolvedValue(null);

      authServiceMock.validateToken.mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        of({
          valid: true,
          userId: 'user-1',
          email: 'john@example.com',
          jti: 'jti-123',
        }) as any,
      );

      const request: any = {
        headers: { authorization: 'Bearer valid-token' },
      };

      const result = await guard.canActivate(createContext(request));

      expect(result).toBe(true);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(CACHE_KEY);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.validateToken).toHaveBeenCalledWith(
        { token: 'valid-token' },
        'service-key',
      );

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        CACHE_KEY,
        JSON.stringify({
          userId: 'user-1',
          email: 'john@example.com',
          jti: 'jti-123',
        }),
      );

      expect(request.user).toEqual({
        userId: 'user-1',
        email: 'john@example.com',
        jti: 'jti-123',
      });
    });
  });
});
