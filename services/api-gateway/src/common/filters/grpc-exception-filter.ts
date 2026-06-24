import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // gRPC error (najczęściej z ClientGrpc)
    if (exception?.code !== undefined) {
      const httpError = this.mapGrpcToHttp(exception);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.status(httpError.status).json({
        statusCode: httpError.status,
        message: httpError.message,
        error: httpError.error,
      });
    }

    // RpcException (Nest wrapper)
    if (exception instanceof RpcException) {
      const err: any = exception.getError();

      const httpError = this.mapGrpcToHttp(err);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.status(httpError.status).json({
        statusCode: httpError.status,
        message: httpError.message,
        error: httpError.error,
      });
    }

    // fallback
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.status(status).json({
      statusCode: status,
      message,
    });
  }

  private mapGrpcToHttp(error: any) {
    const code = error.code ?? error?.status;

    switch (code) {
      case GrpcStatus.INVALID_ARGUMENT:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: error.details ?? 'Invalid argument',
          error: 'BAD_REQUEST',
        };

      case GrpcStatus.UNAUTHENTICATED:
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: error.details ?? 'Unauthenticated',
          error: 'UNAUTHORIZED',
        };

      case GrpcStatus.PERMISSION_DENIED:
        return {
          status: HttpStatus.FORBIDDEN,
          message: error.details ?? 'Forbidden',
          error: 'FORBIDDEN',
        };

      case GrpcStatus.NOT_FOUND:
        return {
          status: HttpStatus.NOT_FOUND,
          message: error.details ?? 'Not found',
          error: 'NOT_FOUND',
        };

      case GrpcStatus.ALREADY_EXISTS:
        return {
          status: HttpStatus.CONFLICT,
          message: error.details ?? 'Already exists',
          error: 'CONFLICT',
        };

      case GrpcStatus.UNAVAILABLE:
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: error.details ?? 'Service unavailable',
          error: 'SERVICE_UNAVAILABLE',
        };

      case GrpcStatus.DEADLINE_EXCEEDED:
        return {
          status: HttpStatus.GATEWAY_TIMEOUT,
          message: error.details ?? 'Timeout',
          error: 'TIMEOUT',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.details ?? 'Unknown gRPC error',
          error: 'INTERNAL_ERROR',
        };
    }
  }
}
