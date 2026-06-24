import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from typing import Optional

from config import Settings
from jose import jwt
from models.user import RefreshToken
from repositories.refresh_token_repository import RefreshTokenRepository


class TokenService:
    def __init__(
        self, refresh_token_repository: RefreshTokenRepository, settings: Settings
    ):
        self.refresh_token_repository = refresh_token_repository
        self.settings = settings
        self._private_key = self._load_private_key()
        self._public_key = self._load_public_key()

    def _load_private_key(self) -> str:
        with open(self.settings["jwt_private_key_path"]) as f:
            return f.read()

    def _load_public_key(self) -> str:
        with open(self.settings["jwt_public_key_path"]) as f:
            return f.read()

    def create_access_token(self, user_id: str, email: str) -> tuple[str, str, int]:
        """Returns (token, jti, expires_in_seconds)."""
        jti = str(uuid.uuid4())
        expire = datetime.now(UTC) + timedelta(
            minutes=self.settings["jwt_access_token_expire_minutes"]
        )
        payload = {
            "sub": user_id,
            "email": email,
            "jti": jti,
            "iat": datetime.now(UTC),
            "exp": expire,
        }
        token = jwt.encode(
            payload,
            self._private_key,
            algorithm=self.settings["jwt_access_token_algorithm"],
        )
        return token, jti, self.settings["jwt_access_token_expire_minutes"] * 60

    def decode_access_token(self, token: str) -> dict:
        """Raises JWTError on invalid/expired token."""
        return jwt.decode(
            token,
            self._public_key,
            algorithms=[self.settings["jwt_access_token_algorithm"]],
        )

    def generate_refresh_token(self) -> str:
        return secrets.token_urlsafe(48)

    def hash_token(self, raw: str) -> str:
        return hashlib.sha256(raw.encode()).hexdigest()

    def refresh_token_expires_at(self) -> datetime:
        return datetime.now(UTC) + timedelta(
            days=self.settings["jwt_refresh_token_expire_days"]
        )

    async def create_refresh_token(
        self, user_id: str, new_token_hash: str, expires_at: datetime
    ):
        return await self.refresh_token_repository.create_refresh_token(
            user_id, new_token_hash=new_token_hash, expires_at=expires_at
        )

    async def get_valid_refresh_token(
        self, user_id: str, old_hash: str
    ) -> Optional[RefreshToken]:
        return await self.refresh_token_repository.get_valid_token(user_id, old_hash)

    async def rotate_refresh_token(self, raw_old_token: str, user_id: str) -> str:
        """Revoke old token, issue new one. Returns (user, new_raw_token)."""

        old_hash = self.hash_token(raw_old_token)
        old_token = await self.refresh_token_repository.get_valid_token(
            user_id, old_hash
        )

        if not old_token or old_token.expires_at < datetime.now(UTC):
            raise ValueError("Invalid or expired refresh token")

        new_raw = self.generate_refresh_token()
        new_token_hash = self.hash_token(new_raw)
        new_expires_at = self.refresh_token_expires_at()
        await self.refresh_token_repository.rotate_token(
            user_id, old_token.token_hash, new_token_hash, new_expires_at
        )

        return new_raw

    async def revoke_refresh_token(self, user_id: str, token_hash: str):
        return await self.refresh_token_repository.revoke_token(user_id, token_hash)

    async def save_refresh_token(self, user_id: str, raw_token: str) -> RefreshToken:
        return await self.create_refresh_token(
            user_id=user_id,
            new_token_hash=self.hash_token(raw_token),
            expires_at=self.refresh_token_expires_at(),
        )

    async def get_active_token_by_hash(self, token_hash: str):
        return await self.refresh_token_repository.get_active_token_by_hash(token_hash)
