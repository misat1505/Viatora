import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(response: string = 'Too many requests') {
    super(response, HttpStatus.TOO_MANY_REQUESTS);
  }
}
