from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock, patch

import grpc
import pytest
from exceptions.internal_exception import InternalException
from exceptions.not_found_exception import NotFoundException
from exceptions.unuathenticated_exception import UnuathenticatedException
from generated import auth_pb2
from grpc_server.auth_servicer import AuthServicer
from jose import JWTError


@pytest.fixture
def auth_service():
    return Mock()


@pytest.fixture
def context():
    ctx = AsyncMock()
    ctx.abort = AsyncMock()
    return ctx


@pytest.fixture
def servicer(auth_service):
    return AuthServicer(auth_service)


@pytest.mark.asyncio
async def test_validate_token_success(servicer, auth_service, context):
    dto = Mock()

    auth_service.validate_token = AsyncMock(
        return_value=SimpleNamespace(
            model_dump=lambda: {
                "user_id": "123",
                "valid": True,
            }
        )
    )

    result = await servicer.ValidateToken.__wrapped__(servicer, dto, context)

    assert isinstance(result, auth_pb2.ValidateTokenResponse)
    assert result.user_id == "123"
    assert result.valid is True


@pytest.mark.asyncio
async def test_validate_token_jwt_error(servicer, auth_service, context):
    dto = Mock()

    auth_service.validate_token = AsyncMock(side_effect=JWTError("invalid token"))

    await servicer.ValidateToken.__wrapped__(servicer, dto, context)

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.UNAUTHENTICATED,
        "invalid token",
    )


@pytest.mark.asyncio
async def test_validate_token_unauthenticated(servicer, auth_service, context):
    dto = Mock()

    auth_service.validate_token = AsyncMock(
        side_effect=UnuathenticatedException("unauthorized")
    )

    await servicer.ValidateToken.__wrapped__(servicer, dto, context)

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.UNAUTHENTICATED,
        "unauthorized",
    )


@pytest.mark.asyncio
async def test_initiate_oauth_success(servicer, auth_service):
    request = Mock()
    request.state = "state123"

    auth_service.initiate_oauth = AsyncMock(
        return_value=SimpleNamespace(
            model_dump=lambda: {"redirect_url": "https://oauth.test"}
        )
    )

    result = await servicer.InitiateOAuth.__wrapped__(servicer, request, None)

    assert isinstance(result, auth_pb2.InitiateOAuthResponse)
    assert result.redirect_url == "https://oauth.test"
    assert result.state == "state123"


@pytest.mark.asyncio
async def test_handle_oauth_callback_success(
    servicer,
    auth_service,
    context,
):
    request = Mock()

    user = Mock()

    service_result = Mock()
    service_result.user = user
    service_result.model_dump.return_value = {
        "access_token": "token",
        "expires_in": 123,
        "user": user,
    }

    auth_service.handle_oauth_callback = AsyncMock(return_value=service_result)

    with (
        patch(
            "grpc_server.auth_servicer.user_to_proto",
            return_value=auth_pb2.UserProfile(),
        ),
        patch(
            "grpc_server.auth_servicer.convert_datetimes_to_ints",
            return_value={
                "access_token": "token",
                "expires_in": 123,
            },
        ),
    ):
        result = await servicer.HandleOAuthCallback.__wrapped__(
            servicer, request, context
        )

    assert isinstance(result, auth_pb2.OAuthCallbackResponse)
    assert result.access_token == "token"


@pytest.mark.asyncio
async def test_handle_oauth_callback_unauthenticated(
    servicer,
    auth_service,
    context,
):
    auth_service.handle_oauth_callback = AsyncMock(
        side_effect=UnuathenticatedException("oauth failed")
    )

    await servicer.HandleOAuthCallback.__wrapped__(servicer, Mock(), context)

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.UNAUTHENTICATED,
        "oauth failed",
    )


@pytest.mark.asyncio
async def test_refresh_token_success(
    servicer,
    auth_service,
    context,
):
    auth_service.refresh_token = AsyncMock(
        return_value=SimpleNamespace(model_dump=lambda: {"access_token": "new-token"})
    )

    result = await servicer.RefreshToken.__wrapped__(servicer, Mock(), context)

    assert isinstance(result, auth_pb2.RefreshTokenResponse)
    assert result.access_token == "new-token"


@pytest.mark.asyncio
async def test_refresh_token_unauthenticated(
    servicer,
    auth_service,
    context,
):
    auth_service.refresh_token = AsyncMock(
        side_effect=UnuathenticatedException("expired")
    )

    await servicer.RefreshToken.__wrapped__(servicer, Mock(), context)

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.UNAUTHENTICATED,
        "expired",
    )


@pytest.mark.asyncio
async def test_refresh_token_internal_error(
    servicer,
    auth_service,
    context,
):
    auth_service.refresh_token = AsyncMock(side_effect=InternalException("redis down"))

    await servicer.RefreshToken.__wrapped__(servicer, Mock(), context)

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.INTERNAL,
        "redis down",
    )


@pytest.mark.asyncio
async def test_logout_success(servicer, auth_service):
    auth_service.logout = AsyncMock()

    result = await servicer.Logout.__wrapped__(servicer, Mock(), None)

    auth_service.logout.assert_awaited_once()

    assert isinstance(result, auth_pb2.LogoutResponse)
    assert result.success is True


@pytest.mark.asyncio
async def test_get_me_success(
    servicer,
    auth_service,
    context,
):
    user = Mock()

    auth_service.get_me = AsyncMock(return_value=user)

    with patch(
        "grpc_server.auth_servicer.user_to_proto",
        return_value=auth_pb2.UserProfile(),
    ):
        result = await servicer.GetMe.__wrapped__(servicer, Mock(), context)

    assert isinstance(result, auth_pb2.GetMeResponse)


@pytest.mark.asyncio
async def test_get_me_not_found(
    servicer,
    auth_service,
    context,
):
    auth_service.get_me = AsyncMock(side_effect=NotFoundException("user not found"))

    await servicer.GetMe.__wrapped__(servicer, Mock(), context)

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.NOT_FOUND,
        "user not found",
    )
