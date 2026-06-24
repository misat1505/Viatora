from generated import auth_pb2_grpc
from services.auth_service import AuthService


class AuthServicer(auth_pb2_grpc.AuthServiceServicer):
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    # ValidateToken
    async def ValidateToken(self, request, _):
        return await self.auth_service.validate_token(request.token)

    # InitiateOAuth
    async def InitiateOAuth(self, request, _):
        return await self.auth_service.initiate_oauth(request.state)

    # HandleOAuthCallback
    async def HandleOAuthCallback(self, request, context):
        return await self.auth_service.handle_oauth_callback(request, context)

    # RefreshToken
    async def RefreshToken(self, request, context):
        return await self.auth_service.refresh_token(request, context)

    # Logout
    async def Logout(self, request, _):
        return await self.auth_service.logout(request.user_id, request.refresh_token)

    # GetMe
    async def GetMe(self, request, context):
        return await self.auth_service.get_me(request, context)
