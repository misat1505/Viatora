import grpc
from domain.get_me_dto import GetMeDTO
from domain.handle_oauth_callback_dto import HandleOAuthCallbackDTO
from domain.initiate_oauth_dto import InitiateOAuthDTO
from domain.logout_dto import LogoutDTO
from domain.refresh_token_dto import RefreshTokenDTO
from domain.validate_token_dto import ValidateTokenDTO
from exceptions.internal_exception import InternalException
from exceptions.not_found_exception import NotFoundException
from exceptions.unuathenticated_exception import UnuathenticatedException
from generated import auth_pb2, auth_pb2_grpc
from jose import JWTError
from services.auth_service import AuthService
from utils.validate_request import ValidateRequest


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
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    # ValidateToken
    @ValidateRequest(ValidateTokenDTO)
    async def ValidateToken(
        self, request: ValidateTokenDTO, context: grpc.ServicerContext
    ):
        try:
            data = await self.auth_service.validate_token(request)
            user, jti = data
            return auth_pb2.ValidateTokenResponse(
                valid=True,
                user_id=str(user.id),
                email=user.email,
                display_name=user.display_name,
                avatar_url=user.avatar_url or "",
                is_active=user.is_active,
                jti=jti,
            )
        except (JWTError, UnuathenticatedException) as e:
            return await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))

    # InitiateOAuth
    @ValidateRequest(InitiateOAuthDTO)
    async def InitiateOAuth(self, request: InitiateOAuthDTO, _):
        redirect_url = await self.auth_service.initiate_oauth(request)
        return auth_pb2.InitiateOAuthResponse(
            redirect_url=redirect_url, state=request.state
        )

    # HandleOAuthCallback
    @ValidateRequest(HandleOAuthCallbackDTO)
    async def HandleOAuthCallback(
        self, request: HandleOAuthCallbackDTO, context: grpc.ServicerContext
    ):
        try:
            data = await self.auth_service.handle_oauth_callback(request)
            (
                access_token,
                raw_refresh,
                expires_in,
                user,
                is_new,
            ) = data
            return auth_pb2.OAuthCallbackResponse(
                access_token=access_token,
                refresh_token=raw_refresh,
                expires_in=expires_in,
                user=_user_profile_proto(user),
                is_new_user=is_new,
            )
        except UnuathenticatedException as e:
            return await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))

    # RefreshToken
    @ValidateRequest(RefreshTokenDTO)
    async def RefreshToken(
        self, request: RefreshTokenDTO, context: grpc.ServicerContext
    ):
        try:
            data = await self.auth_service.refresh_token(request)
            access_token, refresh_token, expires_in = data
            return auth_pb2.RefreshTokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=expires_in,
            )
        except UnuathenticatedException as e:
            return await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))
        except InternalException as e:
            return await context.abort(grpc.StatusCode.INTERNAL, str(e))

    # Logout
    @ValidateRequest(LogoutDTO)
    async def Logout(self, request: LogoutDTO, _):
        await self.auth_service.logout(request)
        return auth_pb2.LogoutResponse(success=True)

    # GetMe
    @ValidateRequest(GetMeDTO)
    async def GetMe(self, request: GetMeDTO, context: grpc.ServicerContext):
        try:
            user = await self.auth_service.get_me(request)
            return auth_pb2.GetMeResponse(user=_user_profile_proto(user))
        except NotFoundException as e:
            return await context.abort(grpc.StatusCode.NOT_FOUND, str(e))
