# tests/features/exams/test_exam_consumer.py

import importlib
from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock

import pytest
import utils.decorators
from features.exams.models.exam import ExamAnswer, ExamFinishedPayload


def create_dummy_exam() -> ExamFinishedPayload:
    now = datetime.now(timezone.utc)

    return ExamFinishedPayload(
        sessionId="session-123",
        userId="user-123",
        status="completed",
        category="python",
        totalQuestions=3,
        correctAnswers=2,
        earnedPoints=80,
        maxPoints=100,
        scorePercent=80.0,
        passed=True,
        timeLimitSeconds=1800,
        startedAt=now,
        completedAt=now,
        answers=[
            ExamAnswer(
                id="answer-1",
                questionId="question-1",
                questionSlug="python-basics",
                selectedOption="B",
                correctOption="B",
                isCorrect=True,
                answeredAt=now,
            ),
            ExamAnswer(
                id="answer-2",
                questionId="question-2",
                questionSlug="python-functions",
                selectedOption="A",
                correctOption="C",
                isCorrect=False,
                answeredAt=now,
            ),
            ExamAnswer(
                id="answer-3",
                questionId="question-3",
                questionSlug="python-async",
                selectedOption="D",
                correctOption="D",
                isCorrect=True,
                answeredAt=now,
            ),
        ],
    )


@pytest.fixture
def exam_consumer_class(monkeypatch):
    # Disable decorators before importing ExamConsumer

    monkeypatch.setattr(
        utils.decorators,
        "KafkaConsumer",
        lambda cls: cls,
    )

    monkeypatch.setattr(
        utils.decorators,
        "TopicConsumer",
        lambda *_args, **_kwargs: lambda func: func,
    )

    monkeypatch.setattr(
        utils.decorators,
        "ValidatePayload",
        lambda *_args, **_kwargs: lambda func: func,
    )

    module = importlib.import_module("features.exams.exam_consumer")

    module = importlib.reload(module)

    return module.ExamConsumer


@pytest.fixture
def exam_service():
    service = Mock()
    service.add_exam_result = AsyncMock()
    return service


@pytest.fixture
def consumer(exam_consumer_class, exam_service):
    return exam_consumer_class(exam_service)


@pytest.mark.asyncio
async def test_handle_exam_finished_calls_service(
    consumer,
    exam_service,
):
    payload = create_dummy_exam()

    await consumer.handle_exam_finished(payload)

    exam_service.add_exam_result.assert_called_once_with(payload)
