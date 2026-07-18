import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthServiceClient, UserProfile } from 'src/generated/auth';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { MeDto } from './dto/me.dto';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import { InitiateGoogleDTO } from './dto/initiate-google.dto';
import { AUTH_GRPC_CLIENT } from './auth.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { AuthMapper } from './dto/mapper/auth.mapper';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_GRPC_CLIENT)
    private readonly authClient: GrpcClientWrapper<AuthServiceClient>,
  ) {}

  @Get('google')
  @ApiOkResponse({ type: InitiateGoogleDTO })
  async initiateGoogle(@Query('redirectUrl') redirectUrl: string) {
    const result = await this.authClient.service.initiateOAuth({
      redirectUrl,
      state: '',
    });

    return AuthMapper.toInitiateGoogleDTO(result);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const result = await this.authClient.service.handleOAuthCallback({
      code,
      state,
    });
    const { redirectUrl, accessToken, refreshToken } =
      AuthMapper.toOAuthCallbackResult(result);

    const redirectTo = new URL(redirectUrl);
    redirectTo.searchParams.set('token', accessToken);
    redirectTo.searchParams.set('refreshToken', refreshToken);

    return res.redirect(redirectTo.toString());
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ type: AuthTokensDto })
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const result = await this.authClient.service.refreshToken({
      refreshToken: body.refreshToken,
    });

    return AuthMapper.toAuthTokensDto(result);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: UserProfile, @Body() body: LogoutDto) {
    return this.authClient.service.logout({
      userId: user.userId,
      refreshToken: body.refreshToken,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @ApiOkResponse({ type: MeDto })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: UserProfile) {
    const result = await this.authClient.service.getMe({
      userId: user.userId,
    });

    return AuthMapper.toMeDto(result);
  }
}
