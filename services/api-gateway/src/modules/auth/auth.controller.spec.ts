import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthServiceClient } from 'src/generated/auth';
import { AuthController } from './auth.controller';
import { AUTH_PACKAGE } from 'src/grpc/clients.module';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock: jest.Mocked<AuthServiceClient> = {
    initiateOAuth: jest.fn(),
    handleOAuthCallback: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
  } as any;

  const grpcClientMock = {
    getService: jest.fn().mockReturnValue(authServiceMock),
  } as Partial<ClientGrpc>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AUTH_PACKAGE,
          useValue: grpcClientMock,
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
    it('should redirect to oauth url', async () => {
      const redirectUrl = 'https://accounts.google.com/oauth';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.initiateOAuth.mockReturnValue(of({ redirectUrl }) as any);

      const response = {
        redirect: jest.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await controller.initiateGoogle(response as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.initiateOAuth).toHaveBeenCalledWith({});
      expect(response.redirect).toHaveBeenCalledWith(redirectUrl);
    });
  });

  describe('googleCallback', () => {
    it('should call handleOAuthCallback', async () => {
      const result = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.handleOAuthCallback.mockReturnValue(of(result) as any);

      const response = await controller.googleCallback(
        'auth-code',
        'state-value',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.handleOAuthCallback).toHaveBeenCalledWith({
        code: 'auth-code',
        state: 'state-value',
      });

      expect(response).toEqual(result);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const result = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.refreshToken.mockReturnValue(of(result) as any);

      const response = await controller.refresh({
        refreshToken: 'old-refresh-token',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.refreshToken).toHaveBeenCalledWith({
        refreshToken: 'old-refresh-token',
      });

      expect(response).toEqual(result);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const user = {
        userId: 'user-123',
      };

      const result = {
        success: true,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.logout.mockReturnValue(of(result) as any);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await controller.logout(user as any, {
        refreshToken: 'refresh-token',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.logout).toHaveBeenCalledWith({
        userId: 'user-123',
        refreshToken: 'refresh-token',
      });

      expect(response).toEqual(result);
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const user = {
        userId: 'user-123',
      };

      const profile = {
        userId: 'user-123',
        email: 'john@example.com',
        username: 'john',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      authServiceMock.getMe.mockReturnValue(of(profile) as any);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await controller.getMe(user as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.getMe).toHaveBeenCalledWith({
        userId: 'user-123',
      });

      expect(response).toEqual(profile);
    });
  });
});
