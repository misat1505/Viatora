import datetime
import uuid
from typing import Optional

from models.user import User
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker


class UserRepository:
    def __init__(self, session_factory: async_sessionmaker):
        self.session_factory = session_factory

    async def get_user_by_google_id(self, google_id: str):
        async with self.session_factory() as session:
            result = await session.execute(
                select(User).where(User.google_id == google_id)
            )
            return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        async with self.session_factory() as session:
            result = await session.execute(
                select(User).where(User.id == uuid.UUID(user_id))
            )
            return result.scalar_one_or_none()

    async def create_user(
        self,
        google_id: str,
        email: str,
        display_name: str,
        avatar_url: str | None,
    ) -> User:
        async with self.session_factory() as session:
            user = User(
                google_id=google_id,
                email=email,
                display_name=display_name,
                avatar_url=avatar_url,
                last_login_at=datetime.datetime.now(datetime.UTC),
            )

            session.add(user)
            await session.commit()
            await session.refresh(user)

            return user

    async def update_last_login(self, user_id: str) -> User | None:
        async with self.session_factory() as session:
            result = await session.execute(
                select(User).where(User.id == uuid.UUID(str(user_id)))
            )
            user = result.scalar_one_or_none()

            if not user:
                return None

            user.last_login_at = datetime.datetime.now(datetime.UTC)

            await session.commit()
            await session.refresh(user)

            return user
