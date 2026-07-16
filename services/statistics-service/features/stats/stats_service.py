from features.exams.models.exam import ExamFinishedPayload
from features.exams.user_exam_statistics_repository import UserExamStatisticsRepository

from .models.get_summary import GetSummaryRequest, GetSummaryResponse


class StatsService:
    def __init__(self, user_exam_statistics_repository: UserExamStatisticsRepository):
        self.user_exam_statistics_repository = user_exam_statistics_repository

    async def get_summary(self, dto: GetSummaryRequest) -> GetSummaryResponse:
        stats = await self.user_exam_statistics_repository.get_by_user_id(dto.user_id)

        # TODO: throw not found error
        assert stats is not None

        return GetSummaryResponse(
            total_exams=stats.total_exams,
            pass_rate=stats.pass_rate,
            average_score=stats.average_score,
            best_score=stats.best_score,
            current_streak=stats.current_streak,
            longest_streak=stats.longest_streak,
            total_time_minutes=stats.total_time_minutes,
        )

    async def add_exam_result(self, exam: ExamFinishedPayload):
        stats = await self.user_exam_statistics_repository.get_by_user_id(exam.userId)

        if stats is None:
            # TODO: do this on user.created from kafka
            stats = await self.user_exam_statistics_repository.create(
                user_id=exam.userId,
                values={
                    "total_exams": 0,
                    "passed_exams": 0,
                    "pass_rate": 0.0,
                    "average_score": 0.0,
                    "best_score": 0,
                    "current_streak": 0,
                    "longest_streak": 0,
                    "total_time_minutes": 0,
                },
            )

        total_exams = stats.total_exams + 1
        passed_exams = stats.passed_exams + (1 if exam.passed else 0)

        pass_rate = passed_exams / total_exams * 100 if total_exams > 0 else 0

        average_score = (
            stats.average_score * stats.total_exams + exam.earnedPoints
        ) / total_exams

        best_score = max(
            stats.best_score,
            exam.earnedPoints,
        )

        current_streak = stats.current_streak + 1 if exam.passed else 0

        longest_streak = max(
            stats.longest_streak,
            current_streak,
        )

        total_time_minutes = stats.total_time_minutes + (exam.timeLimitSeconds // 60)

        await self.user_exam_statistics_repository.update(
            user_id=exam.userId,
            new_values={
                "total_exams": total_exams,
                "passed_exams": passed_exams,
                "pass_rate": round(pass_rate, 2),
                "average_score": round(average_score, 2),
                "best_score": best_score,
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "total_time_minutes": total_time_minutes,
            },
        )
