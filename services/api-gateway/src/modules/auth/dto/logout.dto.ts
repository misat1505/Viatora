import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token that should be revoked to log the user out',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
