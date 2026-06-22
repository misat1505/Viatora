import uuid
from datetime import UTC, datetime

from models.user import RefreshToken, User
from services.token_service import hash_token, refresh_token_expires_at
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_or_create_user(
    db: AsyncSession,
    google_id: str,
    email: str,
    display_name: str,
    avatar_url: str | None,
) -> tuple[User, bool]:
    """Returns (user, is_new_user)."""
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user:
        user.last_login_at = datetime.now(UTC)
        await db.commit()
        return user, False

    user = User(
        google_id=google_id,
        email=email,
        display_name=display_name,
        avatar_url=avatar_url,
        last_login_at=datetime.now(UTC),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user, True


async def save_refresh_token(
    db: AsyncSession, user_id: uuid.UUID, raw_token: str
) -> RefreshToken:
    token = RefreshToken(
        user_id=user_id,
        token_hash=hash_token(raw_token),
        expires_at=refresh_token_expires_at(),
    )
    db.add(token)
    await db.commit()
    return token


async def rotate_refresh_token(
    db: AsyncSession, raw_old_token: str, user_id: uuid.UUID
) -> tuple[User, str]:
    """Revoke old token, issue new one. Returns (user, new_raw_token)."""
    from services.token_service import generate_refresh_token

    old_hash = hash_token(raw_old_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == old_hash,
            RefreshToken.user_id == user_id,
            RefreshToken.revoked.is_(False),
        )
    )
    old_token = result.scalar_one_or_none()
    if not old_token or old_token.expires_at < datetime.now(UTC):
        raise ValueError("Invalid or expired refresh token")

    old_token.revoked = True

    new_raw = generate_refresh_token()
    new_token = RefreshToken(
        user_id=user_id,
        token_hash=hash_token(new_raw),
        expires_at=refresh_token_expires_at(),
    )
    db.add(new_token)

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()

    await db.commit()
    return user, new_raw


async def revoke_refresh_token(
    db: AsyncSession, user_id: uuid.UUID, raw_token: str
) -> None:
    token_hash = hash_token(raw_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.user_id == user_id,
        )
    )
    token = result.scalar_one_or_none()
    if token:
        token.revoked = True
        await db.commit()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
