import { Request } from 'express';

interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isActive: boolean;
  /** ISO 8601 */
  createdAt: string;
  lastLoginAt: string;
}

export type AuthenticatedRequest = Request & {
  user: UserProfile;
};
