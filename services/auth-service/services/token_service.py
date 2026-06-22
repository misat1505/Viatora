import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from config import settings
from jose import jwt


def _load_private_key() -> str:
    with open(settings.jwt_private_key_path) as f:
        return f.read()


def _load_public_key() -> str:
    with open(settings.jwt_public_key_path) as f:
        return f.read()


def create_access_token(user_id: str, email: str) -> tuple[str, str, int]:
    """Returns (token, jti, expires_in_seconds)."""
    jti = str(uuid.uuid4())
    expire = datetime.now(UTC) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    payload = {
        "sub": user_id,
        "email": email,
        "jti": jti,
        "iat": datetime.now(UTC),
        "exp": expire,
    }
    token = jwt.encode(payload, _load_private_key(), algorithm="RS256")
    return token, jti, settings.jwt_access_token_expire_minutes * 60


def decode_access_token(token: str) -> dict:
    """Raises JWTError on invalid/expired token."""
    return jwt.decode(token, _load_public_key(), algorithms=["RS256"])


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def refresh_token_expires_at() -> datetime:
    return datetime.now(UTC) + timedelta(days=settings.jwt_refresh_token_expire_days)
