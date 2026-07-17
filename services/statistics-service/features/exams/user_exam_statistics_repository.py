from features.exams.models.entities.user_exam_statistics import UserExamStatistics
from features.stats.models.user_exam_statistics_dto import (
    CreateUserExamStatisticsDTO,
    UpdateUserExamStatisticsDTO,
    UserExamStatisticsDTO,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker


class UserExamStatisticsRepository:
    def __init__(self, session_factory: async_sessionmaker):
        self.session_factory = session_factory

    async def get_by_user_id(
        self,
        user_id: str,
    ) -> UserExamStatisticsDTO | None:
        async with self.session_factory() as session:
            result = await session.execute(
                select(UserExamStatistics).where(UserExamStatistics.user_id == user_id)
            )

            entity = result.scalar_one_or_none()

            if entity is None:
                return None

            return self._to_dto(entity)

    async def create(
        self,
        dto: CreateUserExamStatisticsDTO,
    ) -> UserExamStatisticsDTO:
        async with self.session_factory() as session:
            statistics = UserExamStatistics(**dto.model_dump())

            session.add(statistics)

            await session.commit()
            await session.refresh(statistics)

            return self._to_dto(statistics)

    async def update(
        self,
        user_id: str,
        dto: UpdateUserExamStatisticsDTO,
    ) -> UserExamStatisticsDTO | None:
        async with self.session_factory() as session:
            result = await session.execute(
                select(UserExamStatistics).where(UserExamStatistics.user_id == user_id)
            )

            statistics = result.scalar_one_or_none()

            if statistics is None:
                return None

            for key, value in dto.model_dump(exclude_unset=True).items():
                setattr(statistics, key, value)

            await session.commit()
            await session.refresh(statistics)

            return self._to_dto(statistics)

    def _to_dto(
        self,
        entity: UserExamStatistics,
    ) -> UserExamStatisticsDTO:
        return UserExamStatisticsDTO(
            id=entity.id,
            user_id=entity.user_id,
            total_exams=entity.total_exams,
            passed_exams=entity.passed_exams,
            pass_rate=entity.pass_rate,
            average_score=entity.average_score,
            best_score=entity.best_score,
            current_streak=entity.current_streak,
            longest_streak=entity.longest_streak,
            total_time_minutes=entity.total_time_minutes,
        )
