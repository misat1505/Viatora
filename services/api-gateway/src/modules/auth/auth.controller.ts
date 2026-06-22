import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Query,
  Res,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { AUTH_PACKAGE } from '../../grpc/clients.module';
import { AuthGrpcService } from './auth.types';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService!: AuthGrpcService;

  constructor(@Inject(AUTH_PACKAGE) private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.grpcClient.getService<AuthGrpcService>('AuthService');
  }

  /** GET /auth/google — kicks off OAuth flow */
  @Get('google')
  async initiateGoogle(@Res() res: Response) {
    const { redirect_url } = await firstValueFrom(
      this.authService.initiateOAuth({}),
    );
    res.redirect(redirect_url);
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
  // @Post('refresh')
  // async refresh(@Req() req: Request) {
  //   const { refresh_token } = req.body;
  //   return firstValueFrom(this.authService.refreshToken({ refresh_token }));
  // }

  /** POST /auth/logout */
  // @Post('logout')
  // @UseGuards(JwtAuthGuard)
  // async logout(@Req() req: any) {
  //   return firstValueFrom(
  //     this.authService.logout({ user_id: req.user.userId }),
  //   );
  // }

  /** GET /auth/me */
  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // async getMe(@Req() req: any) {
  //   return firstValueFrom(this.authService.getMe({ user_id: req.user.userId }));
  // }
}
