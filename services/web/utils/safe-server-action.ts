import { AxiosError } from 'axios';
import {
  AppError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from './error';

export type ServerActionResponse<T> = [AppError, null] | [null, T];

export function safeServerAction<Args extends unknown[], T>(fn: (...args: Args) => Promise<T>) {
  return async (...args: Args): Promise<ServerActionResponse<T>> => {
    try {
      const data = await fn(...args);
      return [null, data];
    } catch (e) {
      if (e instanceof AxiosError) {
        const status = e.response?.status;

        switch (status) {
          case 400:
            return [new BadRequestError(e.message), null];
          case 401:
            return [new UnauthorizedError(), null];
          case 404:
            return [new NotFoundError(), null];
          case 500:
            return [new InternalServerError(), null];
          default:
            return [new AppError(e.message), null];
        }
      }

      if (e instanceof Error) {
        return [new AppError(e.message), null];
      }

      return [new AppError('Unknown error'), null];
    }
  };
}
