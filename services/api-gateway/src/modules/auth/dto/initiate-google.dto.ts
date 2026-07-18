import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InitiateGoogleQueryDTO {
  @IsString()
  @ApiProperty({
    description: 'URL to redirect the user to after successful authentication',
    example: 'https://app.example.com/dashboard',
  })
  redirectUrl!: string;
}

export class InitiateGoogleDTO {
  @ApiProperty({
    description: 'Link to Google OAuth',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  url!: string;
}
