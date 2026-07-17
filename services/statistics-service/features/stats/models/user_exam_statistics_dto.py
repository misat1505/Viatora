from pydantic import BaseModel


class UserExamStatisticsDTO(BaseModel):
    id: int | None = None

    user_id: str

    total_exams: int = 0
    passed_exams: int = 0
    pass_rate: float = 0.0
    average_score: float = 0.0
    best_score: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    total_time_minutes: int = 0


class CreateUserExamStatisticsDTO(BaseModel):
    user_id: str

    total_exams: int = 0
    passed_exams: int = 0
    pass_rate: float = 0.0
    average_score: float = 0.0
    best_score: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    total_time_minutes: int = 0


class UpdateUserExamStatisticsDTO(BaseModel):
    total_exams: int | None = None
    passed_exams: int | None = None
    pass_rate: float | None = None
    average_score: float | None = None
    best_score: int | None = None
    current_streak: int | None = None
    longest_streak: int | None = None
    total_time_minutes: int | None = None
