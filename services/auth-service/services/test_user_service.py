from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from services.user_service import UserService


@pytest.fixture
def user_repo():
    return AsyncMock()


@pytest.fixture
def token_service():
    return AsyncMock()


@pytest.fixture
def service(user_repo, token_service):
    return UserService(user_repo, token_service)


@pytest.mark.asyncio
async def test_get_or_create_user_existing(service, user_repo):
    fake_user = SimpleNamespace(id="u1", google_id="g1")

    user_repo.get_user_by_google_id.return_value = fake_user

    user, is_new = await service.get_or_create_user(
        google_id="g1",
        email="test@mail.com",
        display_name="Test",
        avatar_url=None,
    )

    assert user == fake_user
    assert is_new is False

    user_repo.update_last_login.assert_awaited_once_with("u1")
    user_repo.create_user.assert_not_called()


@pytest.mark.asyncio
async def test_get_or_create_user_new(service, user_repo):
    created_user = SimpleNamespace(id="u1", google_id="g1")

    user_repo.get_user_by_google_id.return_value = None
    user_repo.create_user.return_value = created_user

    user, is_new = await service.get_or_create_user(
        google_id="g2",
        email="new@mail.com",
        display_name="New User",
        avatar_url="http://img.com/a.png",
    )

    assert user == created_user
    assert is_new is True

    user_repo.create_user.assert_awaited_once_with(
        google_id="g2",
        email="new@mail.com",
        display_name="New User",
        avatar_url="http://img.com/a.png",
    )

    user_repo.update_last_login.assert_not_called()


@pytest.mark.asyncio
async def test_get_user_by_id_returns_user(service, user_repo):
    fake_user = SimpleNamespace(id="u1")

    user_repo.get_user_by_id.return_value = fake_user

    result = await service.get_user_by_id("u1")

    assert result == fake_user
    user_repo.get_user_by_id.assert_awaited_once_with("u1")


@pytest.mark.asyncio
async def test_get_user_by_id_returns_none(service, user_repo):
    user_repo.get_user_by_id.return_value = None

    result = await service.get_user_by_id("missing")

    assert result is None
