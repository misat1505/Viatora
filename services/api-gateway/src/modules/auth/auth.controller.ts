import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { AUTH_PACKAGE } from '../../grpc/clients.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthServiceClient } from 'src/generated/auth';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService!: AuthServiceClient;

  constructor(@Inject(AUTH_PACKAGE) private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.grpcClient.getService<AuthServiceClient>('AuthService');
  }

  /** GET /auth/google — kicks off OAuth flow */
  @Get('google')
  async initiateGoogle(@Res() res: Response) {
    const { redirectUrl } = await firstValueFrom(
      // @ts-expect-error we will not support CSRF for now
      this.authService.initiateOAuth({}),
    );
    res.redirect(redirectUrl);
  }

  /** GET /auth/google/callback — Google redirects here with ?code=&state= */
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const tokens = await firstValueFrom(
      this.authService.handleOAuthCallback({ code, state }),
    );

    // Return tokens — in production you may set an httpOnly cookie instead
    res.json(tokens);
  }

  /** POST /auth/refresh */
  @Post('refresh')
  async refresh(@Body() body: any) {
    return firstValueFrom(
      this.authService.refreshToken({ refreshToken: body.refresh_token }),
    );
  }

  /** POST /auth/logout */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any, @Body() body: any) {
    return firstValueFrom(
      this.authService.logout({
        userId: req.user.userId,
        refreshToken: body.refresh_token,
      }),
    );
  }

  /** GET /auth/me */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  // TODO: fix this any
  async getMe(@Req() req: any) {
    return firstValueFrom(this.authService.getMe({ userId: req.user.userId }));
  }
}
