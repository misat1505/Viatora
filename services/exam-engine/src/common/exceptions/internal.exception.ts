import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class DomainInternalException extends RpcException {
  constructor(message = 'Internal error') {
    super({
      code: status.INTERNAL,
      message,
    });
  }
}

export class ExamInitializationException extends DomainInternalException {
  constructor(message = 'Exam cannot be initialized') {
    super(message);
  }
}
