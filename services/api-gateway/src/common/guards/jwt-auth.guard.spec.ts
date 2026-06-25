import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc } from '@nestjs/microservices';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AUTH_PACKAGE } from '../../grpc/clients.module';
import { AuthServiceClient } from 'src/generated/auth';
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const authServiceMock: jest.Mocked<AuthServiceClient> = {
    validateToken: jest.fn(),
  } as any;

  const grpcMetadataServiceMock: jest.Mocked<GrpcMetadataService> = {
    authMeta: 'service-key',
  } as any;

  const grpcClientMock = {
    getService: jest.fn().mockReturnValue(authServiceMock),
  } as Partial<ClientGrpc>;

  beforeEach(async () => {
    jest.clearAllMocks();

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
      const request = {
        headers: {},
      };

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        new UnauthorizedException('Missing token'),
      );
    });

    it('should throw when authorization header is invalid', async () => {
      const request = {
        headers: {
          authorization: 'invalid-token',
        },
      };

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        new UnauthorizedException('Missing token'),
      );
    });

    it('should throw when token validation returns invalid', async () => {
      authServiceMock.validateToken.mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        of({
          valid: false,
        }) as any,
      );

      const request = {
        headers: {
          authorization: 'Bearer token',
        },
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
      authServiceMock.validateToken.mockReturnValue(
        // @ts-expect-error suppress ts error -> throwing grpc error is fine
        throwError(() => new Error('grpc error')),
      );

      const request = {
        headers: {
          authorization: 'Bearer token',
        },
      };

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        new UnauthorizedException('Invalid token'),
      );
    });

    it('should attach user to request and return true', async () => {
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
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      const result = await guard.canActivate(createContext(request));

      expect(result).toBe(true);

      expect(request.user).toEqual({
        userId: 'user-1',
        email: 'john@example.com',
        jti: 'jti-123',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authServiceMock.validateToken).toHaveBeenCalledWith(
        { token: 'valid-token' },
        'service-key',
      );
    });
  });
});
