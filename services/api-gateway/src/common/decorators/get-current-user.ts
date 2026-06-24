import { createParamDecorator } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request';

export const CurrentUser = createParamDecorator((data, context) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const request = context.switchToHttp().getRequest() as AuthenticatedRequest;
  return request.user;
});
