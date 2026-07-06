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

export class QuestionNotFoundException extends DomainNotFoundException {
  constructor(message = 'Question not found') {
    super(message);
  }
}
