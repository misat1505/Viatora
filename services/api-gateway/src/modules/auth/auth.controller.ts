import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserProfile } from 'src/generated/auth';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokensDTO } from './dto/auth-tokens.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { LogoutDTO } from './dto/logout.dto';
import { MeDTO } from './dto/me.dto';
import { CurrentUser } from 'src/common/decorators/get-current-user';
import {
  InitiateGoogleDTO,
  InitiateGoogleQueryDTO,
} from './dto/initiate-google.dto';
import { AuthService } from './auth.service';
import { GoogleCallbackRawQueryDTO } from './dto/google-callback.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @ApiOkResponse({ type: InitiateGoogleDTO })
  initiateGoogle(
    @Query() query: InitiateGoogleQueryDTO,
  ): Promise<InitiateGoogleDTO> {
    return this.authService.initiateGoogle(query);
  }

  @Get('google/callback')
  async googleCallback(
    @Query() query: GoogleCallbackRawQueryDTO,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.authService.googleCallback({
      code: query.code,
      state: query.state,
    });

    return res.redirect(url);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ type: AuthTokensDTO })
  @Post('refresh')
  refresh(@Body() body: RefreshTokenDTO): Promise<AuthTokensDTO> {
    return this.authService.refresh(body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@CurrentUser() user: UserProfile, @Body() body: LogoutDTO) {
    return this.authService.logout(user.userId, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user' })
  @ApiOkResponse({ type: MeDTO })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: UserProfile): Promise<MeDTO> {
    return this.authService.getMe(user.userId);
  }
}
