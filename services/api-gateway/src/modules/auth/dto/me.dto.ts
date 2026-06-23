import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID)',
    example: 'e57a4daf-8079-4946-9076-a407f5c4b023',
  })
  userId!: string;

  @ApiProperty({
    description:
      'User email address (may be empty if not provided by OAuth provider)',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'John Doe',
  })
  displayName!: string;

  @ApiProperty({
    description: 'URL to user avatar image',
    example: 'https://lh3.googleusercontent.com/a/A...',
  })
  avatarUrl!: string;

  @ApiProperty({
    description: 'Indicates whether the user account is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Timestamp when the user account was created',
    example: '2026-06-22T11:34:56.685Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Timestamp of last user login',
    example: '2026-06-23T11:48:15.131Z',
  })
  lastLoginAt!: string;
}

export class MeDto {
  @ApiProperty({
    description: 'Authenticated user profile data',
    type: UserDto,
  })
  user!: UserDto;
}
