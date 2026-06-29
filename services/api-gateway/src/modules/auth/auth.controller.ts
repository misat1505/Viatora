import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { AUTH_PACKAGE } from '../../grpc/clients.module';
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
import { GrpcMetadataService } from 'src/grpc/grpc-metadata.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService!: AuthServiceClient;

  constructor(
    @Inject(AUTH_PACKAGE) private readonly grpcClient: ClientGrpc,
    private readonly grpcMetadataService: GrpcMetadataService,
  ) {}

  onModuleInit() {
    this.authService =
      this.grpcClient.getService<AuthServiceClient>('AuthService');
  }

  /** GET /auth/google — kicks off OAuth flow */
  @Get('google')
  async initiateGoogle(@Query('redirectUrl') redirectUrl: string) {
    const { redirectUrl: googleUrl } = await firstValueFrom(
      this.authService.initiateOAuth(
        // @ts-expect-error we will not support CSRF for now, metadata not in generated types
        { redirectUrl },
        this.grpcMetadataService.authMeta,
      ),
    );
    return { url: googleUrl };
  }

  /** GET /auth/google/callback — Google redirects here with ?code=&state= */
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const result = await firstValueFrom(
      this.authService.handleOAuthCallback(
        { code, state },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );

    const redirectUrl = new URL(result.redirectUrl);

    redirectUrl.searchParams.set('token', result.accessToken);
    redirectUrl.searchParams.set('refreshToken', result.refreshToken);

    return res.redirect(redirectUrl.toString());
  }

  /** POST /auth/refresh */
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ type: AuthTokensDto })
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const result = await firstValueFrom(
      this.authService.refreshToken(
        {
          refreshToken: body.refreshToken,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );
    // @ts-expect-error expiresIn is Long in protobuf and we need to pick the low
    result.expiresIn = result.expiresIn.low;
    return result;
  }

  /** POST /auth/logout */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: UserProfile, @Body() body: LogoutDto) {
    return firstValueFrom(
      this.authService.logout(
        {
          userId: user.userId,
          refreshToken: body.refreshToken,
        },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );
  }

  /** GET /auth/me */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @ApiOkResponse({ type: MeDto })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: UserProfile) {
    return firstValueFrom(
      this.authService.getMe(
        { userId: user.userId },
        // @ts-expect-error metadata not in generated types
        this.grpcMetadataService.authMeta,
      ),
    );
  }
}
