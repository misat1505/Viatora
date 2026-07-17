from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock

import pytest
from exceptions.not_found_exception import NotFoundException
from features.exams.models.exam import ExamFinishedPayload
from features.stats.models.get_summary import GetSummaryRequest
from features.stats.models.user_exam_statistics_dto import (
    CreateUserExamStatisticsDTO,
    UpdateUserExamStatisticsDTO,
    UserExamStatisticsDTO,
)
from features.stats.stats_service import StatsService


@pytest.fixture
def repository():
    repo = Mock()

    repo.get_by_user_id = AsyncMock()
    repo.create = AsyncMock()
    repo.update = AsyncMock()

    return repo


@pytest.fixture
def cache():
    cache = Mock()

    cache.get = AsyncMock()
    cache.set = AsyncMock()

    return cache


@pytest.fixture
def service(repository, cache):
    return StatsService(
        repository,
        cache,
    )


def create_exam(
    passed=True,
    earned_points=80,
):
    now = datetime.now(timezone.utc)

    return ExamFinishedPayload(
        sessionId="session-123",
        userId="user-123",
        status="completed",
        category="python",
        totalQuestions=10,
        correctAnswers=8,
        earnedPoints=earned_points,
        maxPoints=100,
        scorePercent=float(earned_points),
        passed=passed,
        timeLimitSeconds=1800,
        startedAt=now,
        completedAt=now,
        answers=[],
    )


def create_stats(**kwargs):
    defaults = {
        "id": 1,
        "user_id": "user-123",
        "total_exams": 0,
        "passed_exams": 0,
        "pass_rate": 0.0,
        "average_score": 0.0,
        "best_score": 0,
        "current_streak": 0,
        "longest_streak": 0,
        "total_time_minutes": 0,
    }

    defaults.update(kwargs)

    return UserExamStatisticsDTO(**defaults)


@pytest.mark.asyncio
async def test_get_summary_returns_statistics_from_repository(
    service,
    repository,
    cache,
):
    stats = create_stats(
        total_exams=5,
        pass_rate=80.0,
        average_score=75.0,
        best_score=90,
        current_streak=2,
        longest_streak=3,
        total_time_minutes=120,
    )

    cache.get.return_value = None
    repository.get_by_user_id.return_value = stats

    result = await service.get_summary(
        GetSummaryRequest(
            user_id="user-123",
        )
    )

    assert result.total_exams == 5
    assert result.pass_rate == 80.0
    assert result.average_score == 75.0
    assert result.best_score == 90
    assert result.current_streak == 2
    assert result.longest_streak == 3
    assert result.total_time_minutes == 120

    cache.get.assert_awaited_once_with("user-123")
    repository.get_by_user_id.assert_awaited_once_with("user-123")
    cache.set.assert_awaited_once_with(stats)


@pytest.mark.asyncio
async def test_get_summary_returns_statistics_from_cache(
    service,
    repository,
    cache,
):
    stats = create_stats(
        total_exams=5,
        pass_rate=80.0,
    )

    cache.get.return_value = stats

    result = await service.get_summary(
        GetSummaryRequest(
            user_id="user-123",
        )
    )

    assert result.total_exams == 5
    assert result.pass_rate == 80.0

    repository.get_by_user_id.assert_not_awaited()
    cache.set.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_summary_raises_when_stats_missing(
    service,
    repository,
    cache,
):
    cache.get.return_value = None
    repository.get_by_user_id.return_value = None

    with pytest.raises(NotFoundException):
        await service.get_summary(
            GetSummaryRequest(
                user_id="missing-user",
            )
        )


@pytest.mark.asyncio
async def test_add_exam_result_creates_stats_when_missing(
    service,
    repository,
    cache,
):
    exam = create_exam()

    repository.get_by_user_id.return_value = None

    repository.create.return_value = create_stats()

    repository.update.return_value = create_stats(
        total_exams=1,
        passed_exams=1,
        pass_rate=100.0,
        average_score=80.0,
        best_score=80,
        current_streak=1,
        longest_streak=1,
        total_time_minutes=30,
    )

    await service.add_exam_result(exam)

    repository.create.assert_awaited_once_with(
        CreateUserExamStatisticsDTO(
            user_id="user-123",
        )
    )

    repository.update.assert_awaited_once()

    update_dto = repository.update.call_args.kwargs["dto"]

    assert isinstance(
        update_dto,
        UpdateUserExamStatisticsDTO,
    )

    assert update_dto.total_exams == 1
    assert update_dto.passed_exams == 1
    assert update_dto.pass_rate == 100.0
    assert update_dto.average_score == 80.0
    assert update_dto.best_score == 80
    assert update_dto.current_streak == 1
    assert update_dto.longest_streak == 1
    assert update_dto.total_time_minutes == 30

    cache.set.assert_awaited_once()


@pytest.mark.asyncio
async def test_add_exam_result_updates_existing_stats(
    service,
    repository,
    cache,
):
    exam = create_exam(
        passed=True,
        earned_points=80,
    )

    stats = create_stats(
        total_exams=5,
        passed_exams=4,
        pass_rate=80.0,
        average_score=75.0,
        best_score=90,
        current_streak=2,
        longest_streak=3,
        total_time_minutes=120,
    )

    repository.get_by_user_id.return_value = stats

    repository.update.return_value = stats.model_copy(
        update={
            "total_exams": 6,
            "passed_exams": 5,
            "pass_rate": 83.33,
            "average_score": 75.83,
            "current_streak": 3,
        }
    )

    await service.add_exam_result(exam)

    repository.create.assert_not_awaited()

    update_dto = repository.update.call_args.kwargs["dto"]

    assert update_dto.total_exams == 6
    assert update_dto.passed_exams == 5
    assert update_dto.pass_rate == 83.33
    assert update_dto.average_score == 75.83
    assert update_dto.best_score == 90
    assert update_dto.current_streak == 3
    assert update_dto.longest_streak == 3
    assert update_dto.total_time_minutes == 150

    cache.set.assert_awaited_once()


@pytest.mark.asyncio
async def test_add_exam_result_failed_exam_resets_streak(
    service,
    repository,
    cache,
):
    exam = create_exam(
        passed=False,
        earned_points=50,
    )

    stats = create_stats(
        total_exams=5,
        passed_exams=4,
        pass_rate=80.0,
        average_score=75.0,
        best_score=90,
        current_streak=5,
        longest_streak=5,
        total_time_minutes=120,
    )

    repository.get_by_user_id.return_value = stats

    repository.update.return_value = stats

    await service.add_exam_result(exam)

    update_dto = repository.update.call_args.kwargs["dto"]

    assert update_dto.total_exams == 6
    assert update_dto.passed_exams == 4
    assert update_dto.pass_rate == 66.67
    assert update_dto.average_score == 70.83
    assert update_dto.best_score == 90
    assert update_dto.current_streak == 0
    assert update_dto.longest_streak == 5
    assert update_dto.total_time_minutes == 150
