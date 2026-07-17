from exceptions.not_found_exception import NotFoundException
from features.exams.models.exam import ExamFinishedPayload
from features.exams.user_exam_statistics_repository import UserExamStatisticsRepository

from .cache.stats_cache import StatsCache
from .models.get_summary import GetSummaryRequest, GetSummaryResponse
from .models.user_exam_statistics_dto import (
    CreateUserExamStatisticsDTO,
    UpdateUserExamStatisticsDTO,
)


class StatsService:
    def __init__(
        self,
        user_exam_statistics_repository: UserExamStatisticsRepository,
        stats_cache: StatsCache,
    ):
        self.repository = user_exam_statistics_repository
        self.cache = stats_cache

    async def get_summary(
        self,
        dto: GetSummaryRequest,
    ) -> GetSummaryResponse:
        stats = await self.cache.get(dto.user_id)

        if stats is None:
            stats = await self.repository.get_by_user_id(dto.user_id)

            if stats is None:
                raise NotFoundException(f"Statistics not found for user {dto.user_id}")

            await self.cache.set(stats)

        return GetSummaryResponse.from_statistics(stats)

    async def add_exam_result(
        self,
        exam: ExamFinishedPayload,
    ) -> None:
        stats = await self.repository.get_by_user_id(exam.userId)

        if stats is None:
            create_dto = CreateUserExamStatisticsDTO(user_id=exam.userId)
            stats = await self.repository.create(create_dto)

        total_exams = stats.total_exams + 1

        passed_exams = stats.passed_exams + 1 if exam.passed else stats.passed_exams

        pass_rate = passed_exams / total_exams * 100 if total_exams else 0

        average_score = (
            stats.average_score * stats.total_exams + exam.earnedPoints
        ) / total_exams

        current_streak = stats.current_streak + 1 if exam.passed else 0

        update_dto = UpdateUserExamStatisticsDTO(
            total_exams=total_exams,
            passed_exams=passed_exams,
            pass_rate=round(pass_rate, 2),
            average_score=round(average_score, 2),
            best_score=max(
                stats.best_score,
                exam.earnedPoints,
            ),
            current_streak=current_streak,
            longest_streak=max(
                stats.longest_streak,
                current_streak,
            ),
            total_time_minutes=(stats.total_time_minutes + exam.timeLimitSeconds // 60),
        )

        updated_stats = await self.repository.update(
            user_id=exam.userId, dto=update_dto
        )

        if updated_stats:
            await self.cache.set(updated_stats)
