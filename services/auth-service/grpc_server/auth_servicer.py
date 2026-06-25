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
from utils.convert_datetimes_to_ints import convert_datetimes_to_ints
from utils.user_to_proto import user_to_proto
from utils.validate_request import ValidateRequest


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
            return auth_pb2.ValidateTokenResponse(**data.model_dump())
        except (JWTError, UnuathenticatedException) as e:
            return await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))

    # InitiateOAuth
    @ValidateRequest(InitiateOAuthDTO)
    async def InitiateOAuth(self, request: InitiateOAuthDTO, _):
        data = await self.auth_service.initiate_oauth(request)
        return auth_pb2.InitiateOAuthResponse(**data.model_dump(), state=request.state)

    # HandleOAuthCallback
    @ValidateRequest(HandleOAuthCallbackDTO)
    async def HandleOAuthCallback(
        self, request: HandleOAuthCallbackDTO, context: grpc.ServicerContext
    ):
        try:
            data = await self.auth_service.handle_oauth_callback(request)
            user_proto = user_to_proto(data.user)
            dumped = data.model_dump(exclude={"user"})
            converted = convert_datetimes_to_ints(dumped)

            return auth_pb2.OAuthCallbackResponse(**converted, user=user_proto)
        except UnuathenticatedException as e:
            return await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(e))

    # RefreshToken
    @ValidateRequest(RefreshTokenDTO)
    async def RefreshToken(
        self, request: RefreshTokenDTO, context: grpc.ServicerContext
    ):
        try:
            data = await self.auth_service.refresh_token(request)
            return auth_pb2.RefreshTokenResponse(**data.model_dump())
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
            return auth_pb2.GetMeResponse(user=user_to_proto(user))
        except NotFoundException as e:
            return await context.abort(grpc.StatusCode.NOT_FOUND, str(e))
