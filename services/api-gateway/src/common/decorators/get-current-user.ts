import {
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request';

export const getCurrentUser = (request: any) => {
  if (!request.user) {
    throw new InternalServerErrorException(
      'CurrentUser used without JwtAuthGuard',
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return request.user;
};

export const CurrentUser = createParamDecorator((_, context) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return getCurrentUser(request);
});
