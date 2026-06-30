from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse

import pytest
from services.google_oauth_service import GoogleOAuthService, GoogleUserInfo


class FakeResponse:
    def __init__(self, json_data, status_code=200):
        self._json = json_data
        self.status_code = status_code

    def json(self):
        return self._json

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception("HTTP error")


class FakeAsyncClient:
    def __init__(self, post_response=None, get_response=None):
        self.post_response = post_response
        self.get_response = get_response

        self.post_called_with = None
        self.get_called_with = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, url, data=None):
        self.post_called_with = (url, data)
        return self.post_response

    async def get(self, url, headers=None):
        self.get_called_with = (url, headers)
        return self.get_response


@dataclass
class SettingsMock:
    google_client_id: str = "test-client-id"
    google_client_secret: str = "test-secret"
    google_redirect_uri: str = "http://localhost/callback"


@pytest.fixture
def settings():
    return SettingsMock()


@pytest.fixture
def service(settings):
    return GoogleOAuthService(settings)


def test_build_authorization_url(service):
    url = service.build_authorization_url("test-state")

    parsed = urlparse(url)
    qs = parse_qs(parsed.query)

    assert parsed.scheme in ("https", "http")
    assert parsed.netloc == "accounts.google.com"
    assert qs["client_id"][0] == "test-client-id"
    assert qs["redirect_uri"][0] == "http://localhost/callback"
    assert qs["response_type"][0] == "code"
    assert qs["state"][0] == "test-state"
    assert "openid email profile" in qs["scope"][0]


@pytest.mark.asyncio
async def test_exchange_code_returns_token(monkeypatch, service):
    fake_client = FakeAsyncClient(
        post_response=FakeResponse({"access_token": "token-123"})
    )

    monkeypatch.setattr("httpx.AsyncClient", lambda: fake_client)

    token = await service.exchange_code("auth-code")

    assert token == "token-123"

    url, data = fake_client.post_called_with
    assert url == "https://oauth2.googleapis.com/token"
    assert data["code"] == "auth-code"
    assert data["client_id"] == "test-client-id"
    assert data["client_secret"] == "test-secret"


@pytest.mark.asyncio
async def test_get_user_info_maps_fields(monkeypatch, service):
    fake_client = FakeAsyncClient(
        get_response=FakeResponse(
            {
                "sub": "google-123",
                "email": "test@example.com",
                "name": "Test User",
                "picture": "http://img.com/avatar.png",
            }
        )
    )

    monkeypatch.setattr("httpx.AsyncClient", lambda: fake_client)

    result = await service.get_user_info("access-token")

    assert isinstance(result, GoogleUserInfo)
    assert result.google_id == "google-123"
    assert result.email == "test@example.com"
    assert result.display_name == "Test User"
    assert result.avatar_url == "http://img.com/avatar.png"


@pytest.mark.asyncio
async def test_get_user_info_fallback_display_name(monkeypatch, service):
    fake_client = FakeAsyncClient(
        get_response=FakeResponse(
            {
                "sub": "google-123",
                "email": "test@example.com",
            }
        )
    )

    monkeypatch.setattr("httpx.AsyncClient", lambda: fake_client)

    result = await service.get_user_info("access-token")

    assert result.display_name == "test@example.com"
    assert result.avatar_url is None
