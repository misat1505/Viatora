from pydantic import BaseModel

from .user_exam_statistics_dto import UserExamStatisticsDTO


class GetSummaryRequest(BaseModel):
    user_id: str


class GetSummaryResponse(BaseModel):
    total_exams: int
    pass_rate: float
    average_score: float
    best_score: int
    current_streak: int
    longest_streak: int
    total_time_minutes: int

    @classmethod
    def from_statistics(
        cls,
        stats: UserExamStatisticsDTO,
    ) -> "GetSummaryResponse":
        return cls(**stats.model_dump(include=cls.model_fields.keys()))
