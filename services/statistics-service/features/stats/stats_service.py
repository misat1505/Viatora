from .models.get_summary import GetSummaryRequest, GetSummaryResponse


class StatsService:
    def get_summary(dto: GetSummaryRequest) -> GetSummaryResponse:
        return GetSummaryResponse(
            total_exams=1,
            pass_rate=0.7,
            average_score=21.37,
            best_score=74,
            current_streak=3,
            longest_streak=6,
            total_time_minutes=1110,
        )
