from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import pytest
from services.token_service import TokenService


@pytest.fixture
def settings():
    return {
        "jwt_private_key_path": "private.pem",
        "jwt_public_key_path": "public.pem",
        "jwt_access_token_expire_minutes": 15,
        "jwt_refresh_token_expire_days": 30,
        "jwt_access_token_algorithm": "HS256",
    }


@pytest.fixture
def repo():
    return AsyncMock()


@pytest.fixture
def service(repo, settings, monkeypatch):
    # patch CLASS methods BEFORE instantiation
    monkeypatch.setattr(TokenService, "_load_private_key", lambda self: "secret")
    monkeypatch.setattr(TokenService, "_load_public_key", lambda self: "secret")

    return TokenService(repo, settings)


def test_create_access_token_structure(service):
    token, jti, expires_in = service.create_access_token("user-1", "test@mail.com")

    assert isinstance(token, str)
    assert isinstance(jti, str)
    assert expires_in == 15 * 60


def test_decode_access_token_roundtrip(service):
    token, jti, _ = service.create_access_token("user-1", "test@mail.com")

    decoded = service.decode_access_token(token)

    assert decoded["sub"] == "user-1"
    assert decoded["email"] == "test@mail.com"
    assert decoded["jti"] == jti


def test_hash_token_deterministic(service):
    a = service.hash_token("token")
    b = service.hash_token("token")

    assert a == b
    assert len(a) == 64


def test_generate_refresh_token_unique(service):
    t1 = service.generate_refresh_token()
    t2 = service.generate_refresh_token()

    assert t1 != t2
    assert isinstance(t1, str)


def test_refresh_token_expires_at(service):
    now = datetime.now(UTC)
    expires = service.refresh_token_expires_at()

    assert expires > now


@pytest.mark.asyncio
async def test_create_refresh_token_calls_repo(service, repo):
    repo.create_refresh_token.return_value = "created"

    result = await service.create_refresh_token(
        user_id="u1",
        new_token_hash="hash",
        expires_at=datetime.now(UTC),
    )

    repo.create_refresh_token.assert_awaited_once()
    assert result == "created"


@pytest.mark.asyncio
async def test_get_valid_refresh_token(service, repo):
    repo.get_valid_token.return_value = "token"

    result = await service.get_valid_refresh_token("u1", "hash")

    repo.get_valid_token.assert_awaited_once_with("u1", "hash")
    assert result == "token"


@pytest.mark.asyncio
async def test_rotate_refresh_token_success(service, repo, monkeypatch):
    class FakeToken:
        token_hash = "old_hash"
        expires_at = datetime.now(UTC) + timedelta(days=1)

    repo.get_valid_token.return_value = FakeToken()

    repo.rotate_token.return_value = None

    monkeypatch.setattr(service, "generate_refresh_token", lambda: "new_raw_token")

    result = await service.rotate_refresh_token("old_raw", "user-1")

    assert result == "new_raw_token"

    repo.rotate_token.assert_awaited_once()


@pytest.mark.asyncio
async def test_rotate_refresh_token_invalid(service, repo):
    repo.get_valid_token.return_value = None

    with pytest.raises(ValueError):
        await service.rotate_refresh_token("bad", "user-1")


@pytest.mark.asyncio
async def test_rotate_refresh_token_expired(service, repo):
    class FakeToken:
        token_hash = "old_hash"
        expires_at = datetime.now(UTC) - timedelta(seconds=1)

    repo.get_valid_token.return_value = FakeToken()

    with pytest.raises(ValueError):
        await service.rotate_refresh_token("old_raw", "user-1")


@pytest.mark.asyncio
async def test_revoke_refresh_token(service, repo):
    repo.revoke_token.return_value = True

    result = await service.revoke_refresh_token("user-1", "raw-token")

    repo.revoke_token.assert_awaited_once()
    assert result is True


@pytest.mark.asyncio
async def test_save_refresh_token(service, repo, monkeypatch):
    repo.create_refresh_token.return_value = "saved"

    monkeypatch.setattr(service, "hash_token", lambda x: "hashed")

    result = await service.save_refresh_token("user-1", "raw")

    repo.create_refresh_token.assert_awaited_once()
    assert result == "saved"


@pytest.mark.asyncio
async def test_get_active_token_by_hash(service, repo):
    repo.get_active_token_by_hash.return_value = "active"

    result = await service.get_active_token_by_hash("hash")

    repo.get_active_token_by_hash.assert_awaited_once_with("hash")
    assert result == "active"
