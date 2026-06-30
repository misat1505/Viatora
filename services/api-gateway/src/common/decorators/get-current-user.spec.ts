import { InternalServerErrorException } from '@nestjs/common';
import { getCurrentUser } from './get-current-user';
import { UserProfile } from 'src/generated/auth';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { describe, it, expect } from 'vitest';

describe('getCurrentUser', () => {
  it('should return user', () => {
    const user = { userId: '123' } as UserProfile;

    const result = getCurrentUser({ user } as AuthenticatedRequest);

    expect(result).toEqual(user);
  });

  it('should throw if user is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    expect(() => getCurrentUser({} as AuthenticatedRequest)).toThrow(
      InternalServerErrorException,
    );
  });
});
