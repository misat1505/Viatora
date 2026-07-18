import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDTO {
  @ApiProperty({
    description: 'JWT access token used for authenticated API requests',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token used to obtain new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  expiresIn!: number;
}
