from dataclasses import dataclass
from urllib.parse import urlencode

import httpx
from config import Settings

_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

_SCOPES = "openid email profile"


@dataclass
class GoogleUserInfo:
    google_id: str
    email: str
    display_name: str
    avatar_url: str | None


class GoogleOAuthService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def build_authorization_url(self, state: str) -> str:
        params = {
            "client_id": self.settings.google_client_id,
            "redirect_uri": self.settings.google_redirect_uri,
            "response_type": "code",
            "scope": _SCOPES,
            "state": state,
            "access_type": "offline",
        }
        return f"{_GOOGLE_AUTH_URL}?{urlencode(params)}"

    async def exchange_code(self, code: str) -> str:
        """Exchange authorization code for a Google access token."""
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                _GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": self.settings.google_client_id,
                    "client_secret": self.settings.google_client_secret,
                    "redirect_uri": self.settings.google_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            resp.raise_for_status()
            return resp.json()["access_token"]

    async def get_user_info(self, google_access_token: str) -> GoogleUserInfo:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                _GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {google_access_token}"},
            )
            resp.raise_for_status()
            data = resp.json()

        return GoogleUserInfo(
            google_id=data["sub"],
            email=data["email"],
            display_name=data.get("name", data["email"]),
            avatar_url=data.get("picture"),
        )
