from pydantic import BaseModel


class GetSummaryRequest(BaseModel):
    user_id: str


class GetSummaryResponse(BaseModel):
    total_exams: int
    pass_rate: int
    average_score: int
    best_score: int
    current_streak: int
    longest_streak: int
    total_time_minutes: int
