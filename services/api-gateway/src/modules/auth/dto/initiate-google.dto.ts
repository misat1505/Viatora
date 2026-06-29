import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InitiateGoogleDTO {
  @ApiProperty({
    description: 'Link to Google OAuth',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  url!: string;
}
