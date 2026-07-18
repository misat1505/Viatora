import { Inject, Injectable } from '@nestjs/common';
import { AUTH_GRPC_CLIENT } from './auth.tokens';
import { type GrpcClientWrapper } from 'src/grpc/utils/create-grpc-client-provider';
import { AuthServiceClient, UserProfile } from 'src/generated/auth';
import { AuthMapper } from './dto/mapper/auth.mapper';
import { GoogleCallbackQueryDTO } from './dto/google-callback.dto';
import {
  InitiateGoogleDTO,
  InitiateGoogleQueryDTO,
} from './dto/initiate-google.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { LogoutDTO } from './dto/logout.dto';
import { AuthTokensDTO } from './dto/auth-tokens.dto';
import { MeDTO } from './dto/me.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_GRPC_CLIENT)
    private readonly authClient: GrpcClientWrapper<AuthServiceClient>,
  ) {}

  async initiateGoogle(
    dto: InitiateGoogleQueryDTO,
  ): Promise<InitiateGoogleDTO> {
    const result = await this.authClient.service.initiateOAuth({
      ...dto,
      state: '',
    });

    return AuthMapper.toInitiateGoogleDTO(result);
  }

  async googleCallback(dto: GoogleCallbackQueryDTO): Promise<string> {
    const result = await this.authClient.service.handleOAuthCallback(dto);
    const { redirectUrl, accessToken, refreshToken } =
      AuthMapper.toOAuthCallbackResult(result);

    const redirectTo = new URL(redirectUrl);
    redirectTo.searchParams.set('token', accessToken);
    redirectTo.searchParams.set('refreshToken', refreshToken);

    return redirectTo.toString();
  }

  async refresh(dto: RefreshTokenDTO): Promise<AuthTokensDTO> {
    const result = await this.authClient.service.refreshToken(dto);
    return AuthMapper.toAuthTokensDto(result);
  }

  async logout(userId: UserProfile['userId'], dto: LogoutDTO) {
    return this.authClient.service.logout({
      userId,
      ...dto,
    });
  }

  async getMe(userId: UserProfile['userId']): Promise<MeDTO> {
    const result = await this.authClient.service.getMe({
      userId,
    });

    return AuthMapper.toMeDto(result);
  }
}
