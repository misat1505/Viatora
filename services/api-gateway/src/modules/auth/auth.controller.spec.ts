import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { AuthServiceClient } from 'src/generated/auth';
import { AuthController } from './auth.controller';
import { AUTH_PACKAGE } from 'src/grpc/clients.module';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock: Mocked<AuthServiceClient> = {
    initiateOAuth: vi.fn(),
    handleOAuthCallback: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  } as any;

  const grpcMetadataServiceMock: Mocked<GrpcMetadataService> = {
    authMeta: 'service-key',
  } as any;

  const cacheManagerMock: Mocked<Cache> = {
    get: vi.fn(),
    set: vi.fn(),
  } as any;

  const grpcClientMock = {
    getService: vi.fn().mockReturnValue(authServiceMock),
  } as Partial<ClientGrpc>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
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

    controller = module.get(AuthController);
    controller.onModuleInit();
  });

  describe('onModuleInit', () => {
    it('should initialize auth service', () => {
      expect(grpcClientMock.getService).toHaveBeenCalledWith('AuthService');
    });
  });

  describe('initiateGoogle', () => {
    it('should return oauth url', async () => {
      const redirectUrl = 'https://accounts.google.com/oauth';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.initiateOAuth.mockReturnValue(of({ redirectUrl }) as any);

      const response = await controller.initiateGoogle(
        'http://localhost:3000/auth/callback',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.initiateOAuth).toHaveBeenCalledWith(
        { redirectUrl: 'http://localhost:3000/auth/callback' },
        'service-key',
      );

      expect(response).toEqual({ url: redirectUrl });
    });
  });

  describe('googleCallback', () => {
    it('should redirect with tokens', async () => {
      const result = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        redirectUrl: 'http://localhost:3000',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.handleOAuthCallback.mockReturnValue(of(result) as any);

      const res = {
        redirect: vi.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await controller.googleCallback('auth-code', 'state-value', res as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.handleOAuthCallback).toHaveBeenCalledWith(
        { code: 'auth-code', state: 'state-value' },
        'service-key',
      );

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/?token=access-token&refreshToken=refresh-token',
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const protoResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: { low: 900 },
      };

      const apiResult = {
        ...protoResult,
        expiresIn: protoResult.expiresIn.low,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.refreshToken.mockReturnValue(of(protoResult) as any);

      const response = await controller.refresh({
        refreshToken: 'old-refresh-token',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.refreshToken).toHaveBeenCalledWith(
        { refreshToken: 'old-refresh-token' },
        'service-key',
      );

      expect(response).toEqual(apiResult);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const user = { userId: 'user-123' };
      const result = { success: true };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.logout.mockReturnValue(of(result) as any);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await controller.logout(user as any, {
        refreshToken: 'refresh-token',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.logout).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          refreshToken: 'refresh-token',
        },
        'service-key',
      );

      expect(response).toEqual(result);
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const user = { userId: 'user-123' };
      const profile = {
        userId: 'user-123',
        email: 'john@example.com',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.getMe.mockReturnValue(of(profile) as any);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await controller.getMe(user as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.getMe).toHaveBeenCalledWith(
        { userId: 'user-123' },
        'service-key',
      );

      expect(response).toEqual(profile);
    });
  });
});
