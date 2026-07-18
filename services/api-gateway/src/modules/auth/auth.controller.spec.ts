import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_GRPC_CLIENT } from './auth.tokens';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';

describe('AuthController integration', () => {
  let controller: AuthController;

  const grpcServiceMock = {
    initiateOAuth: vi.fn(),
    handleOAuthCallback: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  };

  const grpcClientMock = {
    service: grpcServiceMock,
  } as unknown as GrpcClientWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AUTH_GRPC_CLIENT,
          useValue: grpcClientMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = moduleRef.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initiateGoogle', () => {
    it('should call grpc and return mapped oauth url', async () => {
      grpcServiceMock.initiateOAuth.mockResolvedValue({
        redirectUrl: 'https://google.com/oauth',
      });

      const result = await controller.initiateGoogle({
        redirectUrl: 'http://localhost/callback',
      });

      expect(grpcServiceMock.initiateOAuth).toHaveBeenCalledWith({
        redirectUrl: 'http://localhost/callback',
        state: '',
      });

      expect(result).toEqual({
        url: 'https://google.com/oauth',
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.initiateOAuth.mockRejectedValue(
        new Error('oauth failed'),
      );

      await expect(
        controller.initiateGoogle({
          redirectUrl: 'http://localhost',
        }),
      ).rejects.toThrow('oauth failed');
    });
  });

  describe('googleCallback', () => {
    it('should build redirect url with tokens', async () => {
      grpcServiceMock.handleOAuthCallback.mockResolvedValue({
        redirectUrl: 'http://localhost',
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const res = {
        redirect: vi.fn(),
      };

      await controller.googleCallback(
        {
          code: 'code',
          state: 'state',
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        res as any,
      );

      expect(grpcServiceMock.handleOAuthCallback).toHaveBeenCalledWith({
        code: 'code',
        state: 'state',
      });

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost/?token=access&refreshToken=refresh',
      );
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.handleOAuthCallback.mockRejectedValue(
        new Error('callback failed'),
      );

      await expect(
        controller.googleCallback(
          {
            code: 'code',
            state: 'state',
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          {
            redirect: vi.fn(),
          } as any,
        ),
      ).rejects.toThrow('callback failed');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      grpcServiceMock.refreshToken.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: {
          low: 900,
          high: 0,
          unsigned: true,
        },
      });

      const result = await controller.refresh({
        refreshToken: 'old',
      });

      expect(grpcServiceMock.refreshToken).toHaveBeenCalledWith({
        refreshToken: 'old',
      });

      expect(result).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 900,
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.refreshToken.mockRejectedValue(
        new Error('refresh failed'),
      );

      await expect(
        controller.refresh({
          refreshToken: 'old',
        }),
      ).rejects.toThrow('refresh failed');
    });
  });

  describe('logout', () => {
    const user = {
      userId: 'user-1',
      email: 'test@test.com',
      displayName: 'Test',
      avatarUrl: '',
      isActive: true,
      createdAt: '',
      lastLoginAt: '',
    };

    it('should logout user', async () => {
      grpcServiceMock.logout.mockResolvedValue({
        success: true,
      });

      const result = await controller.logout(user, {
        refreshToken: 'refresh',
      });

      expect(grpcServiceMock.logout).toHaveBeenCalledWith({
        userId: 'user-1',
        refreshToken: 'refresh',
      });

      expect(result).toEqual({
        success: true,
      });
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.logout.mockRejectedValue(new Error('logout failed'));

      await expect(
        controller.logout(user, {
          refreshToken: 'refresh',
        }),
      ).rejects.toThrow('logout failed');
    });
  });

  describe('getMe', () => {
    const user = {
      userId: 'user-1',
      email: '',
      displayName: '',
      avatarUrl: '',
      isActive: false,
      createdAt: '',
      lastLoginAt: '',
    };

    it('should return mapped user profile', async () => {
      grpcServiceMock.getMe.mockResolvedValue({
        user: {
          userId: 'user-1',
          email: 'test@test.com',
          displayName: 'Test',
          avatarUrl: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
      });

      const result = await controller.getMe(user);

      expect(grpcServiceMock.getMe).toHaveBeenCalledWith({
        userId: 'user-1',
      });

      expect(result.user.userId).toBe('user-1');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should propagate grpc error', async () => {
      grpcServiceMock.getMe.mockRejectedValue(new Error('me failed'));

      await expect(controller.getMe(user)).rejects.toThrow('me failed');
    });
  });
});
