from datetime import datetime
from typing import List

from pydantic import BaseModel


class ExamAnswer(BaseModel):
    id: str
    questionId: str
    questionSlug: str

    selectedOption: str
    correctOption: str

    isCorrect: bool

    answeredAt: datetime


class ExamFinishedPayload(BaseModel):
    sessionId: str
    userId: str

    status: str
    category: str

    totalQuestions: int
    correctAnswers: int

    earnedPoints: int
    maxPoints: int

    scorePercent: float
    passed: bool

    timeLimitSeconds: int

    startedAt: datetime
    completedAt: datetime

    answers: List[ExamAnswer]
