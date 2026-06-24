import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

import { GrpcExceptionFilter } from './grpc-exception-filter';

describe('GrpcExceptionFilter', () => {
  let filter: GrpcExceptionFilter;

  beforeEach(() => {
    filter = new GrpcExceptionFilter();
  });

  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      json,
    });

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({
          status,
        }),
      }),
    } as ArgumentsHost;

    return {
      host,
      status,
      json,
    };
  };

  describe('gRPC exceptions', () => {
    it('should map INVALID_ARGUMENT to 400', () => {
      const { host, status, json } = createHost();

      filter.catch(
        {
          code: GrpcStatus.INVALID_ARGUMENT,
          details: 'Invalid email',
        },
        host,
      );

      expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid email',
        error: 'BAD_REQUEST',
      });
    });

    it('should map UNAUTHENTICATED to 401', () => {
      const { host, status, json } = createHost();

      filter.catch(
        {
          code: GrpcStatus.UNAUTHENTICATED,
          details: 'Token expired',
        },
        host,
      );

      expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token expired',
        error: 'UNAUTHORIZED',
      });
    });

    it('should map unknown grpc error to 500', () => {
      const { host, status, json } = createHost();

      filter.catch(
        {
          code: 999,
        },
        host,
      );

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown gRPC error',
        error: 'INTERNAL_ERROR',
      });
    });
  });

  describe('RpcException', () => {
    it('should handle RpcException', () => {
      const { host, status, json } = createHost();

      const exception = new RpcException({
        code: GrpcStatus.NOT_FOUND,
        details: 'User not found',
      });

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: 'NOT_FOUND',
      });
    });
  });

  describe('HttpException', () => {
    it('should handle HttpException', () => {
      const { host, status, json } = createHost();

      const exception = new BadRequestException('Bad request');

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: {
          message: 'Bad request',
          error: 'Bad Request',
          statusCode: 400,
        },
      });
    });
  });

  describe('unknown exceptions', () => {
    it('should return 500 for generic errors', () => {
      const { host, status, json } = createHost();

      filter.catch(new Error('boom'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    });
  });

  describe('mapGrpcToHttp', () => {
    it('should cover all grpc mappings', () => {
      const mapGrpcToHttp = (filter as any).mapGrpcToHttp.bind(filter);

      expect(
        mapGrpcToHttp({
          code: GrpcStatus.PERMISSION_DENIED,
        }),
      ).toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });

      expect(
        mapGrpcToHttp({
          code: GrpcStatus.ALREADY_EXISTS,
        }),
      ).toMatchObject({
        status: HttpStatus.CONFLICT,
      });

      expect(
        mapGrpcToHttp({
          code: GrpcStatus.UNAVAILABLE,
        }),
      ).toMatchObject({
        status: HttpStatus.SERVICE_UNAVAILABLE,
      });

      expect(
        mapGrpcToHttp({
          code: GrpcStatus.DEADLINE_EXCEEDED,
        }),
      ).toMatchObject({
        status: HttpStatus.GATEWAY_TIMEOUT,
      });
    });
  });
});
