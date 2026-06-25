import base64
import json
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from domain.get_me_dto import GetMeDTO
from domain.handle_oauth_callback_dto import HandleOAuthCallbackDTO
from domain.initiate_oauth_dto import InitiateOAuthDTO
from domain.logout_dto import LogoutDTO
from domain.refresh_token_dto import RefreshTokenDTO
from domain.validate_token_dto import ValidateTokenDTO
from exceptions.not_found_exception import NotFoundException
from exceptions.unuathenticated_exception import UnuathenticatedException
from services.auth_service import AuthService


@pytest.fixture
def user_service():
    return Mock()


@pytest.fixture
def token_service():
    return Mock()


@pytest.fixture
def google_oauth_service():
    return Mock()


@pytest.fixture
def logger():
    return Mock()


@pytest.fixture
def auth_service(
    user_service,
    token_service,
    google_oauth_service,
    logger,
):
    return AuthService(
        user_service=user_service,
        token_service=token_service,
        google_oauth_service=google_oauth_service,
        logger=logger,
    )


@pytest.mark.asyncio
async def test_validate_token_success(
    auth_service,
    token_service,
    user_service,
):
    dto = ValidateTokenDTO(token="token")

    token_service.decode_access_token.return_value = {
        "sub": "123",
        "jti": "jti-1",
    }

    user_service.get_user_by_id = AsyncMock(
        return_value=SimpleNamespace(
            id="123",
            email="test@test.com",
            display_name="John",
            avatar_url="avatar",
            is_active=True,
        )
    )

    result = await auth_service.validate_token(dto)

    assert result.valid is True
    assert result.user_id == "123"
    assert result.jti == "jti-1"


@pytest.mark.asyncio
async def test_validate_token_user_not_found(
    auth_service,
    token_service,
    user_service,
):
    dto = ValidateTokenDTO(token="token")

    token_service.decode_access_token.return_value = {
        "sub": "123",
        "jti": "jti",
    }

    user_service.get_user_by_id = AsyncMock(return_value=None)

    with pytest.raises(UnuathenticatedException):
        await auth_service.validate_token(dto)


@pytest.mark.asyncio
async def test_validate_token_user_inactive(
    auth_service,
    token_service,
    user_service,
):
    dto = ValidateTokenDTO(token="token")

    token_service.decode_access_token.return_value = {
        "sub": "123",
        "jti": "jti",
    }

    user_service.get_user_by_id = AsyncMock(
        return_value=SimpleNamespace(
            is_active=False,
        )
    )

    with pytest.raises(UnuathenticatedException):
        await auth_service.validate_token(dto)


@pytest.mark.asyncio
async def test_initiate_oauth_with_state(
    auth_service,
    google_oauth_service,
):
    dto = InitiateOAuthDTO(
        state=None, redirect_url="http://localhost:3000/auth/callback"
    )

    google_oauth_service.build_authorization_url.return_value = "https://google.com"

    result = await auth_service.initiate_oauth(dto)

    assert result.redirect_url == "https://google.com"

    call_args = google_oauth_service.build_authorization_url.call_args[0][0]
    decoded = json.loads(base64.urlsafe_b64decode(call_args).decode())
    assert decoded["redirectUrl"] == "http://localhost:3000/auth/callback"
    assert "csrf" in decoded


@pytest.mark.asyncio
async def test_handle_oauth_callback_success(
    auth_service,
    google_oauth_service,
    user_service,
    token_service,
):
    state_data = base64.urlsafe_b64encode(
        json.dumps({"csrf": "abc", "redirectUrl": "http://localhost:3000"}).encode()
    ).decode()

    dto = HandleOAuthCallbackDTO(code="code", state=state_data)

    google_oauth_service.exchange_code = AsyncMock(return_value="google-token")

    google_oauth_service.get_user_info = AsyncMock(
        return_value=SimpleNamespace(
            google_id="g1",
            email="test@test.com",
            display_name="John",
            avatar_url="avatar",
        )
    )

    user = SimpleNamespace(
        id="1",
        email="test@test.com",
        display_name="John",
        avatar_url="avatar",
        is_active=True,
        created_at=datetime.now(UTC),
        last_login_at=datetime.now(UTC),
    )

    user_service.get_or_create_user = AsyncMock(return_value=(user, True))

    token_service.generate_refresh_token.return_value = "refresh"
    token_service.save_refresh_token = AsyncMock()

    token_service.create_access_token.return_value = (
        "access",
        "jti",
        3600,
    )

    result = await auth_service.handle_oauth_callback(dto)

    assert result.access_token == "access"
    assert result.refresh_token == "refresh"
    assert result.is_new_user is True


@pytest.mark.asyncio
async def test_handle_oauth_callback_google_error(
    auth_service,
    google_oauth_service,
):
    state_data = base64.urlsafe_b64encode(
        json.dumps({"csrf": "abc", "redirectUrl": ""}).encode()
    ).decode()

    dto = HandleOAuthCallbackDTO(code="code", state=state_data)

    google_oauth_service.exchange_code = AsyncMock(side_effect=Exception("boom"))

    with pytest.raises(UnuathenticatedException):
        await auth_service.handle_oauth_callback(dto)


@pytest.mark.asyncio
async def test_refresh_token_success(
    auth_service,
    token_service,
    user_service,
):
    dto = RefreshTokenDTO(refresh_token="old")

    token_service.hash_token.return_value = "hash"

    token_service.get_active_token_by_hash = AsyncMock(
        return_value=SimpleNamespace(
            user_id="123",
            expires_at=datetime.now(UTC) + timedelta(days=1),
        )
    )

    token_service.rotate_refresh_token = AsyncMock(return_value="new-refresh")

    user_service.get_user_by_id = AsyncMock(
        return_value=SimpleNamespace(
            id="123",
            email="test@test.com",
        )
    )

    token_service.create_access_token.return_value = (
        "access",
        "jti",
        3600,
    )

    result = await auth_service.refresh_token(dto)

    assert result.access_token == "access"
    assert result.refresh_token == "new-refresh"


@pytest.mark.asyncio
async def test_refresh_token_not_found(
    auth_service,
    token_service,
):
    dto = RefreshTokenDTO(refresh_token="old")

    token_service.hash_token.return_value = "hash"

    token_service.get_active_token_by_hash = AsyncMock(return_value=None)

    with pytest.raises(UnuathenticatedException):
        await auth_service.refresh_token(dto)


@pytest.mark.asyncio
async def test_refresh_token_expired(
    auth_service,
    token_service,
):
    dto = RefreshTokenDTO(refresh_token="old")

    token_service.hash_token.return_value = "hash"

    token_service.get_active_token_by_hash = AsyncMock(
        return_value=SimpleNamespace(
            user_id="123",
            expires_at=datetime.now(UTC) - timedelta(seconds=1),
        )
    )

    with pytest.raises(UnuathenticatedException):
        await auth_service.refresh_token(dto)


@pytest.mark.asyncio
async def test_logout(
    auth_service,
    token_service,
):
    dto = LogoutDTO(
        user_id="123",
        refresh_token="refresh",
    )

    token_service.revoke_refresh_token = AsyncMock()

    await auth_service.logout(dto)

    token_service.revoke_refresh_token.assert_awaited_once_with(
        "123",
        "refresh",
    )


@pytest.mark.asyncio
async def test_get_me_success(
    auth_service,
    user_service,
):
    dto = GetMeDTO(user_id="123")

    user_service.get_user_by_id = AsyncMock(
        return_value=SimpleNamespace(
            id="123",
            email="test@test.com",
            display_name="John",
            avatar_url="avatar",
            is_active=True,
            created_at=datetime.now(UTC),
            last_login_at=datetime.now(UTC),
        )
    )

    result = await auth_service.get_me(dto)

    assert result.user_id == "123"
    assert result.email == "test@test.com"


@pytest.mark.asyncio
async def test_get_me_not_found(
    auth_service,
    user_service,
):
    dto = GetMeDTO(user_id="123")

    user_service.get_user_by_id = AsyncMock(return_value=None)

    with pytest.raises(NotFoundException):
        await auth_service.get_me(dto)
