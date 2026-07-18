import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class GoogleCallbackQueryDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Authorization code returned by Google after user consent',
    example: '4/0AY0e-g7...',
  })
  code!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'State parameter used to prevent CSRF and carry the original redirectUrl',
    example: 'eyJyZWRpcmVjdFVybCI6Ii9kYXNoYm9hcmQifQ==',
  })
  state!: string;
}

export class GoogleCallbackRawQueryDTO extends GoogleCallbackQueryDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'JWT issuer, present when Google includes an ID token context in the redirect (Google-specific, not used by us)',
    example: 'https://accounts.google.com',
  })
  iss?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Space-delimited list of OAuth scopes granted by the user (Google-specific, not used by us)',
    example: 'email profile openid',
  })
  scope?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Index of the Google account used for authentication, when the user has multiple sessions (Google-specific, not used by us)',
    example: '0',
  })
  authuser?: string;

  @IsOptional()
  @IsIn(['none', 'consent', 'select_account'])
  @ApiPropertyOptional({
    description:
      'Prompt behavior echoed back by Google for this consent flow (Google-specific, not used by us)',
    example: 'consent',
  })
  prompt?: string;
}
