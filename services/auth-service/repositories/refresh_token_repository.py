import datetime
from typing import Optional

from models.user import RefreshToken
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker


class RefreshTokenRepository:
    def __init__(self, session_factory: async_sessionmaker):
        self.session_factory = session_factory

    async def create_refresh_token(
        self, user_id: str, new_token_hash: str, expires_at: datetime.datetime
    ):
        async with self.session_factory() as session:
            token = RefreshToken(
                user_id=user_id,
                token_hash=new_token_hash,
                expires_at=expires_at,
            )
            session.add(token)
            await session.commit()
            return token

    async def get_valid_token(
        self, user_id: str, old_hash: str
    ) -> Optional[RefreshToken]:
        async with self.session_factory() as session:
            result = await session.execute(
                select(RefreshToken).where(
                    RefreshToken.token_hash == old_hash,
                    RefreshToken.user_id == user_id,
                    RefreshToken.revoked.is_(False),
                )
            )
            return result.scalar_one_or_none()

    async def rotate_token(
        self,
        user_id: str,
        old_token_hash: str,
        new_token_hash: str,
        expires_at: datetime.datetime,
    ):
        async with self.session_factory() as session:
            result = await session.execute(
                select(RefreshToken).where(
                    RefreshToken.token_hash == old_token_hash,
                    RefreshToken.user_id == user_id,
                    RefreshToken.revoked.is_(False),
                )
            )

            old_token = result.scalar_one_or_none()

            if old_token is None:
                return None

            old_token.revoked = True

            new_token = RefreshToken(
                user_id=user_id,
                token_hash=new_token_hash,
                expires_at=expires_at,
            )

            session.add(new_token)

            await session.commit()

            return new_token

    async def revoke_token(self, user_id: str, token_hash: str):
        async with self.session_factory() as session:
            result = await session.execute(
                select(RefreshToken).where(
                    RefreshToken.token_hash == token_hash,
                    RefreshToken.user_id == user_id,
                )
            )
            token = result.scalar_one_or_none()

            if token:
                token.revoked = True
                await session.commit()

    async def get_active_token_by_hash(self, token_hash: str):
        async with self.session_factory() as session:
            result = await session.execute(
                select(RefreshToken).where(
                    RefreshToken.token_hash == token_hash,
                    RefreshToken.revoked.is_(False),
                )
            )
            return result.scalar_one_or_none()
