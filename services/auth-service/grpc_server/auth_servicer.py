import grpc
from domain.handle_oauth_callback_dto import HandleOAuthCallbackDTO
from exceptions.unuathenticated_exception import UnuathenticatedException
from generated import auth_pb2, auth_pb2_grpc
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
    async def ValidateToken(self, request, _):
        return await self.auth_service.validate_token(request.token)

    # InitiateOAuth
    async def InitiateOAuth(self, request, _):
        state = request.state
        redirect_url = await self.auth_service.initiate_oauth(state)
        return auth_pb2.InitiateOAuthResponse(redirect_url=redirect_url, state=state)

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
            await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))
            return

    # RefreshToken
    async def RefreshToken(self, request, context):
        return await self.auth_service.refresh_token(request, context)

    # Logout
    async def Logout(self, request, _):
        return await self.auth_service.logout(request.user_id, request.refresh_token)

    # GetMe
    async def GetMe(self, request, context):
        return await self.auth_service.get_me(request, context)
