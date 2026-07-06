import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export class DomainBadRequestException extends RpcException {
  constructor(message = 'Bad request') {
    super({
      code: status.INVALID_ARGUMENT,
      message,
    });
  }
}

export class ExamCategoryNotSupportedException extends DomainBadRequestException {
  constructor(message = 'This exam category is not supported') {
    super(message);
  }
}

export class CannotAnswerCurrentQuestionException extends DomainBadRequestException {
  constructor(message = 'Cannot answer this question right now') {
    super(message);
  }
}

export class InvalidAnswerForQuestionTypeException extends DomainBadRequestException {
  constructor(message = "Invalid answer for 'basic' question") {
    super(message);
  }
}

export class CannotFinishExamException extends DomainBadRequestException {
  constructor(message = 'Exam cannot be finished') {
    super(message);
  }
}
