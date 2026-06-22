import { Observable } from 'rxjs';

// ── Shared ────────────────────────────────────────────────────────

export interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string; // ISO 8601
  last_login_at: string;
}

// ── ValidateToken ─────────────────────────────────────────────────

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  is_active: boolean;
  jti: string;
}

// ── InitiateOAuth ─────────────────────────────────────────────────

export interface InitiateOAuthRequest {
  state?: string;
}

export interface InitiateOAuthResponse {
  redirectUrl: string;
  state: string;
}

// ── HandleOAuthCallback ───────────────────────────────────────────

export interface OAuthCallbackRequest {
  code: string;
  state: string;
}

export interface OAuthCallbackResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserProfile;
  is_new_user: boolean;
}

// ── RefreshToken ──────────────────────────────────────────────────

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ── Logout ────────────────────────────────────────────────────────

export interface LogoutRequest {
  user_id: string;
  refresh_token: string;
}

export interface LogoutResponse {
  success: boolean;
}

// ── GetMe ─────────────────────────────────────────────────────────

export interface GetMeRequest {
  user_id: string;
}

export interface GetMeResponse {
  user: UserProfile;
}

// ── gRPC service interface ────────────────────────────────────────
// NestJS ClientGrpc returns Observables — we convert with firstValueFrom() at call sites.

export interface AuthGrpcService {
  validateToken(data: ValidateTokenRequest): Observable<ValidateTokenResponse>;
  initiateOAuth(data: InitiateOAuthRequest): Observable<InitiateOAuthResponse>;
  handleOAuthCallback(
    data: OAuthCallbackRequest,
  ): Observable<OAuthCallbackResponse>;
  refreshToken(data: RefreshTokenRequest): Observable<RefreshTokenResponse>;
  logout(data: LogoutRequest): Observable<LogoutResponse>;
  getMe(data: GetMeRequest): Observable<GetMeResponse>;
}

// ── Derived type for request.user after JwtAuthGuard ─────────────

export interface AuthenticatedUser {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isActive: boolean;
  jti: string;
}
