import logging
import secrets
import uuid

import grpc
from database import AsyncSessionFactory
from generated import auth_pb2, auth_pb2_grpc
from jose import JWTError

from services import google_oauth, token_service, user_service

logger = logging.getLogger(__name__)


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


class AuthServicer(auth_pb2_grpc.AuthServiceServicer):
    async def ValidateToken(self, request, context):
        try:
            payload = token_service.decode_access_token(request.token)
        except JWTError:
            return auth_pb2.ValidateTokenResponse(valid=False)

        # Check revocation list in Redis
        # from app.redis_client import redis_client

        jti = payload.get("jti", "")
        # if await redis_client.exists(f"token:revoked:{jti}"):
        #     return auth_pb2.ValidateTokenResponse(valid=False)

        async with AsyncSessionFactory() as db:
            user = await user_service.get_user_by_id(db, uuid.UUID(payload["sub"]))

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

    async def InitiateOAuth(self, request, context):
        state = request.state or secrets.token_urlsafe(16)
        redirect_url = google_oauth.build_authorization_url(state)
        return auth_pb2.InitiateOAuthResponse(redirect_url=redirect_url, state=state)

    async def HandleOAuthCallback(self, request, context):
        try:
            google_access_token = await google_oauth.exchange_code(request.code)
            user_info = await google_oauth.get_user_info(google_access_token)
        except Exception as e:
            logger.exception("Google OAuth error")
            await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))
            return

        async with AsyncSessionFactory() as db:
            user, is_new = await user_service.get_or_create_user(
                db,
                google_id=user_info.google_id,
                email=user_info.email,
                display_name=user_info.display_name,
                avatar_url=user_info.avatar_url,
            )

            raw_refresh = token_service.generate_refresh_token()
            await user_service.save_refresh_token(db, user.id, raw_refresh)

        access_token, _jti, expires_in = token_service.create_access_token(
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

    async def RefreshToken(self, request, context):
        pass
        # # Decode old token to get user_id (unverified — we verify via DB hash)
        # try:
        #     payload = token_service.decode_access_token.__func__ if False else None
        #     # We don't need to decode the access token here —
        #     # user_id must be looked up from the refresh token record itself.
        #     # For simplicity we accept user_id embedded in a signed JWT refresh token,
        #     # but per spec refresh tokens are opaque: we find user by hash match.
        #     from models.user import RefreshToken as RTModel
        #     from services.token_service import hash_token
        #     from sqlalchemy import select

        #     async with AsyncSessionFactory() as db:
        #         token_hash = hash_token(request.refresh_token)
        #         result = await db.execute(
        #             select(RTModel).where(
        #                 RTModel.token_hash == token_hash,
        #                 RTModel.revoked.is_(False),
        #             )
        #         )
        #         rt = result.scalar_one_or_none()
        #         if not rt or rt.expires_at < datetime.now(UTC):
        #             await context.abort(
        #                 grpc.StatusCode.UNAUTHENTICATED, "Invalid refresh token"
        #             )
        #             return

        #         user, new_raw = await user_service.rotate_refresh_token(
        #             db, request.refresh_token, rt.user_id
        #         )

        # except Exception as e:
        #     logger.exception("RefreshToken error")
        #     await context.abort(grpc.StatusCode.INTERNAL, str(e))
        #     return

        # access_token, _jti, expires_in = token_service.create_access_token(
        #     str(user.id), user.email
        # )
        # return auth_pb2.RefreshTokenResponse(
        #     access_token=access_token,
        #     refresh_token=new_raw,
        #     expires_in=expires_in,
        # )

    async def Logout(self, request, context):
        pass
        # async with AsyncSessionFactory() as db:
        #     await user_service.revoke_refresh_token(
        #         db,
        #         uuid.UUID(request.user_id),
        #         request.refresh_token,
        #     )

        # # Add jti to revocation list in Redis so Gateway cache is invalidated
        # # Gateway will see 401 on next validation attempt after 5-min cache expires.
        # # For immediate revocation, we'd need to push jti — done here best-effort.
        # try:
        #     from app.redis_client import redis_client

        #     payload = token_service.decode_access_token(request.refresh_token)
        #     jti = payload.get("jti")
        #     if jti:
        #         await redis_client.set(f"token:revoked:{jti}", "1", ex=900)
        # except Exception:
        #     pass  # access token already expired or not passed — that's fine

        # return auth_pb2.LogoutResponse(success=True)

    async def GetMe(self, request, context):
        async with AsyncSessionFactory() as db:
            user = await user_service.get_user_by_id(db, uuid.UUID(request.user_id))

        if not user:
            await context.abort(grpc.StatusCode.NOT_FOUND, "User not found")
            return

        return auth_pb2.GetMeResponse(user=_user_profile_proto(user))
