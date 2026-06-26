export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
