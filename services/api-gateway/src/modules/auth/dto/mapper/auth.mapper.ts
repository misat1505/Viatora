import { AuthServiceClient } from 'src/generated/auth';
import { GrpcResponse } from 'src/grpc/types/grpc-client';
import { AuthTokensDTO } from '../auth-tokens.dto';
import { InitiateGoogleDTO } from '../initiate-google.dto';
import { MeDTO, UserDTO } from '../me.dto';

type InitiateOAuthResponse = GrpcResponse<AuthServiceClient, 'initiateOAuth'>;
type HandleOAuthCallbackResponse = GrpcResponse<
  AuthServiceClient,
  'handleOAuthCallback'
>;
type RefreshTokenResponse = GrpcResponse<AuthServiceClient, 'refreshToken'>;
type GetMeResponse = GrpcResponse<AuthServiceClient, 'getMe'>;
type GrpcUser = GetMeResponse['user'];

function toNumber(
  value: number | { toNumber(): number } | { low: number },
): number {
  if (typeof value === 'number') return value;

  if (typeof (value as { toNumber?: unknown }).toNumber === 'function') {
    return (value as { toNumber(): number }).toNumber();
  }

  return (value as { low: number }).low;
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

export class AuthMapper {
  static toInitiateGoogleDTO(result: InitiateOAuthResponse): InitiateGoogleDTO {
    const dto = new InitiateGoogleDTO();
    dto.url = result.redirectUrl;
    return dto;
  }

  static toOAuthCallbackResult(result: HandleOAuthCallbackResponse) {
    return {
      redirectUrl: result.redirectUrl,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  static toAuthTokensDto(result: RefreshTokenResponse): AuthTokensDTO {
    const dto = new AuthTokensDTO();
    dto.accessToken = result.accessToken;
    dto.refreshToken = result.refreshToken;
    dto.expiresIn = toNumber(result.expiresIn);
    return dto;
  }

  static toUserDto(user: GrpcUser): UserDTO {
    const dto = new UserDTO();
    dto.userId = user?.userId ?? '';
    dto.email = user?.email ?? '';
    dto.displayName = user?.displayName ?? '';
    dto.avatarUrl = user?.avatarUrl ?? '';
    dto.isActive = user?.isActive ?? false;
    dto.createdAt = toIsoString(user?.createdAt ?? new Date(0));
    dto.lastLoginAt = user?.lastLoginAt ? toIsoString(user?.lastLoginAt) : '';
    return dto;
  }

  static toMeDto(result: GetMeResponse): MeDTO {
    const dto = new MeDTO();
    dto.user = this.toUserDto(result.user);
    return dto;
  }
}
