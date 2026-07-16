from collections.abc import Mapping
from typing import Any

from features.exams.models.entities.user_exam_statistics import UserExamStatistics
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker


class UserExamStatisticsRepository:
    def __init__(self, session_factory: async_sessionmaker):
        self.session_factory = session_factory

    async def get_by_user_id(self, user_id: str) -> UserExamStatistics | None:
        async with self.session_factory() as session:
            result = await session.execute(
                select(UserExamStatistics).where(UserExamStatistics.user_id == user_id)
            )
            return result.scalar_one_or_none()

    async def update(
        self,
        user_id: str,
        new_values: Mapping[str, Any],
    ) -> UserExamStatistics | None:
        async with self.session_factory() as session:
            result = await session.execute(
                select(UserExamStatistics).where(UserExamStatistics.user_id == user_id)
            )
            statistics = result.scalar_one_or_none()

            if statistics is None:
                return None

            for key, value in new_values.items():
                setattr(statistics, key, value)

            await session.commit()
            await session.refresh(statistics)

            return statistics
