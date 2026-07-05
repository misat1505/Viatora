import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class DomainNotFoundException extends RpcException {
  constructor(message = 'Not found') {
    super({
      code: status.NOT_FOUND,
      message,
    });
  }
}

export class ExamSessionNotFoundException extends DomainNotFoundException {
  constructor(message = 'Exam session not found') {
    super(message);
  }
}
