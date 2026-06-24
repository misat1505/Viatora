import {
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request';

export const getCurrentUser = (request: AuthenticatedRequest) => {
  if (!request.user) {
    throw new InternalServerErrorException(
      'CurrentUser used without JwtAuthGuard',
    );
  }

  return request.user;
};

export const CurrentUser = createParamDecorator((_, context) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return getCurrentUser(request);
});
