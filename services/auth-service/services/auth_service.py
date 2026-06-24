import secrets
from datetime import UTC, datetime
from logging import Logger

from domain.get_me_dto import GetMeDTO
from domain.handle_oauth_callback_dto import (
    HandleOAuthCallbackDTO,
    HandleOAuthCallbackResponseDTO,
)
from domain.initiate_oauth_dto import InitiateOAuthDTO, InitiateOAuthResponseDTO
from domain.logout_dto import LogoutDTO
from domain.refresh_token_dto import RefreshTokenDTO
from domain.user_dto import UserDTO
from domain.validate_token_dto import ValidateTokenDTO
from exceptions.not_found_exception import NotFoundException
from exceptions.unuathenticated_exception import UnuathenticatedException
from services.google_oauth_service import GoogleOAuthService
from services.token_service import TokenService
from services.user_service import UserService


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

    async def validate_token(self, dto: ValidateTokenDTO):
        payload = self.token_service.decode_access_token(dto.token)

        # Check revocation list in Redis
        # from app.redis_client import redis_client

        jti = payload.get("jti", "")
        # if await redis_client.exists(f"token:revoked:{jti}"):
        #     return auth_pb2.ValidateTokenResponse(valid=False)

        user = await self.user_service.get_user_by_id(payload["sub"])

        if not user or not user.is_active:
            raise UnuathenticatedException()

        return user, jti

    async def initiate_oauth(self, dto: InitiateOAuthDTO) -> InitiateOAuthResponseDTO:
        state = dto.state or secrets.token_urlsafe(16)
        url = self.google_oauth_service.build_authorization_url(state)
        return InitiateOAuthResponseDTO(redirect_url=url)

    async def handle_oauth_callback(
        self, dto: HandleOAuthCallbackDTO
    ) -> HandleOAuthCallbackResponseDTO:
        try:
            google_access_token = await self.google_oauth_service.exchange_code(
                dto.code
            )
            user_info = await self.google_oauth_service.get_user_info(
                google_access_token
            )
        except Exception as e:
            raise UnuathenticatedException("Google OAuth error", str(e))

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

        user_dto = UserDTO(
            user_id=str(user.id),
            avatar_url=user.avatar_url,
            created_at=user.created_at,
            display_name=user.display_name,
            email=user.email,
            is_active=user.is_active,
            last_login_at=user.last_login_at,
        )

        return HandleOAuthCallbackResponseDTO(
            access_token=access_token,
            refresh_token=raw_refresh,
            expires_in=expires_in,
            user=user_dto,
            is_new_user=is_new,
        )

    async def refresh_token(self, dto: RefreshTokenDTO):
        # Decode old token to get user_id (unverified — we verify via DB hash)
        # We don't need to decode the access token here —
        # user_id must be looked up from the refresh token record itself.
        # For simplicity we accept user_id embedded in a signed JWT refresh token,
        # but per spec refresh tokens are opaque: we find user by hash match.
        token_hash = self.token_service.hash_token(dto.refresh_token)
        rt = await self.token_service.get_active_token_by_hash(token_hash)
        if not rt or rt.expires_at < datetime.now(UTC):
            raise UnuathenticatedException("Invalid refresh token")

        new_raw = await self.token_service.rotate_refresh_token(
            dto.refresh_token, str(rt.user_id)
        )

        user = await self.user_service.get_user_by_id(str(rt.user_id))

        access_token, _, expires_in = self.token_service.create_access_token(
            str(user.id), user.email
        )

        return access_token, new_raw, expires_in

    async def logout(self, dto: LogoutDTO):
        await self.token_service.revoke_refresh_token(dto.user_id, dto.refresh_token)

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

        return

    async def get_me(self, dto: GetMeDTO):
        user = await self.user_service.get_user_by_id(dto.user_id)

        if not user:
            raise NotFoundException("User not found")

        return user
