import secrets
from datetime import UTC, datetime
from logging import Logger

import grpc
from generated import auth_pb2
from jose import JWTError
from services.google_oauth_service import GoogleOAuthService
from services.token_service import TokenService
from services.user_service import UserService


def _user_profile_proto(user) -> auth_pb2.UserProfile:
    return auth_pb2.UserProfile(
        user_id=str(user.id),
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url or "",
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else "",
    )


class AuthService:
    def __init__(
        self,
        user_service: UserService,
        token_service: TokenService,
        google_oauth_service: GoogleOAuthService,
        logger: Logger,
    ):
        self.user_service = user_service
        self.token_service = token_service
        self.google_oauth_service = google_oauth_service
        self.logger = logger

    async def validate_token(self, token):
        try:
            payload = self.token_service.decode_access_token(token)
        except JWTError:
            return auth_pb2.ValidateTokenResponse(valid=False)

        # Check revocation list in Redis
        # from app.redis_client import redis_client

        jti = payload.get("jti", "")
        # if await redis_client.exists(f"token:revoked:{jti}"):
        #     return auth_pb2.ValidateTokenResponse(valid=False)

        user = await self.user_repository.get_user_by_id(payload["sub"])

        if not user or not user.is_active:
            return auth_pb2.ValidateTokenResponse(valid=False)

        return auth_pb2.ValidateTokenResponse(
            valid=True,
            user_id=str(user.id),
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url or "",
            is_active=user.is_active,
            jti=jti,
        )

    async def initiate_oauth(self, state):
        state = state or secrets.token_urlsafe(16)
        redirect_url = self.google_oauth_service.build_authorization_url(state)
        return auth_pb2.InitiateOAuthResponse(redirect_url=redirect_url, state=state)

    async def handle_oauth_callback(self, request, context):
        try:
            google_access_token = await self.google_oauth_service.exchange_code(
                request.code
            )
            user_info = await self.google_oauth_service.get_user_info(
                google_access_token
            )
        except Exception as e:
            self.logger.exception("Google OAuth error")
            await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))
            return

        user, is_new = await self.user_service.get_or_create_user(
            google_id=user_info.google_id,
            email=user_info.email,
            display_name=user_info.display_name,
            avatar_url=user_info.avatar_url,
        )

        raw_refresh = self.token_service.generate_refresh_token()
        await self.token_service.save_refresh_token(user.id, raw_refresh)

        access_token, _, expires_in = self.token_service.create_access_token(
            str(user.id), user.email
        )

        if is_new:
            # await publish_user_registered(str(user.id), user.email, user.display_name)
            pass

        return auth_pb2.OAuthCallbackResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            expires_in=expires_in,
            user=_user_profile_proto(user),
            is_new_user=is_new,
        )

    async def refresh_token(self, request, context):
        # Decode old token to get user_id (unverified — we verify via DB hash)
        try:
            # We don't need to decode the access token here —
            # user_id must be looked up from the refresh token record itself.
            # For simplicity we accept user_id embedded in a signed JWT refresh token,
            # but per spec refresh tokens are opaque: we find user by hash match.
            token_hash = self.token_service.hash_token(request.refresh_token)
            rt = await self.token_service.get_active_token_by_hash(token_hash)
            if not rt or rt.expires_at < datetime.now(UTC):
                await context.abort(
                    grpc.StatusCode.UNAUTHENTICATED, "Invalid refresh token"
                )
                return

            new_raw = await self.token_service.rotate_refresh_token(
                request.refresh_token, rt.user_id
            )

            user = await self.user_service.get_user_by_id(rt.user_id)

        except Exception as e:
            self.logger.exception("RefreshToken error")
            await context.abort(grpc.StatusCode.INTERNAL, str(e))
            return

        access_token, _, expires_in = self.token_service.create_access_token(
            str(user.id), user.email
        )
        return auth_pb2.RefreshTokenResponse(
            access_token=access_token,
            refresh_token=new_raw,
            expires_in=expires_in,
        )

    async def logout(self, user_id, refresh_token):
        await self.token_service.revoke_refresh_token(user_id, refresh_token)

        # Add jti to revocation list in Redis so Gateway cache is invalidated
        # Gateway will see 401 on next validation attempt after 5-min cache expires.
        # For immediate revocation, we'd need to push jti — done here best-effort.
        # try:
        #     from app.redis_client import redis_client

        #     payload = token_service.decode_access_token(request.refresh_token)
        #     jti = payload.get("jti")
        #     if jti:
        #         await redis_client.set(f"token:revoked:{jti}", "1", ex=900)
        # except Exception:
        #     pass  # access token already expired or not passed — that's fine

        return auth_pb2.LogoutResponse(success=True)

    async def get_me(self, request, context):
        user = await self.user_service.get_user_by_id(request.user_id)

        if not user:
            await context.abort(grpc.StatusCode.NOT_FOUND, "User not found")
            return

        return auth_pb2.GetMeResponse(user=_user_profile_proto(user))
