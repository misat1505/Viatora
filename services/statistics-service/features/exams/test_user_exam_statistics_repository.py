from unittest.mock import AsyncMock, Mock

import pytest
from features.exams.models.entities.user_exam_statistics import UserExamStatistics
from features.exams.user_exam_statistics_repository import UserExamStatisticsRepository
from features.stats.models.user_exam_statistics_dto import (
    CreateUserExamStatisticsDTO,
    UpdateUserExamStatisticsDTO,
    UserExamStatisticsDTO,
)


@pytest.fixture
def session():
    session = Mock()

    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=None)

    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()

    return session


@pytest.fixture
def session_factory(session):
    return Mock(return_value=session)


@pytest.fixture
def repository(session_factory):
    return UserExamStatisticsRepository(session_factory)


@pytest.mark.asyncio
async def test_get_by_user_id_returns_statistics(
    repository,
    session,
):
    statistics = UserExamStatistics(
        id=1,
        user_id="user-123",
        total_exams=5,
        passed_exams=4,
        pass_rate=80.0,
        average_score=85.0,
        best_score=90,
        current_streak=2,
        longest_streak=3,
        total_time_minutes=120,
    )

    result_mock = Mock()
    result_mock.scalar_one_or_none.return_value = statistics

    session.execute.return_value = result_mock

    result = await repository.get_by_user_id("user-123")

    assert isinstance(result, UserExamStatisticsDTO)

    assert result.id == 1
    assert result.user_id == "user-123"
    assert result.total_exams == 5
    assert result.passed_exams == 4
    assert result.pass_rate == 80.0
    assert result.average_score == 85.0

    session.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_by_user_id_returns_none_when_not_found(
    repository,
    session,
):
    result_mock = Mock()
    result_mock.scalar_one_or_none.return_value = None

    session.execute.return_value = result_mock

    result = await repository.get_by_user_id("missing-user")

    assert result is None

    session.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_create_creates_statistics(
    repository,
    session,
):
    dto = CreateUserExamStatisticsDTO(
        user_id="user-123",
        total_exams=5,
        passed_exams=4,
        average_score=85,
    )

    result = await repository.create(dto)

    session.add.assert_called_once()

    entity = session.add.call_args.args[0]

    assert isinstance(entity, UserExamStatistics)

    assert entity.user_id == "user-123"
    assert entity.total_exams == 5
    assert entity.passed_exams == 4
    assert entity.average_score == 85

    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(entity)

    assert isinstance(result, UserExamStatisticsDTO)

    assert result.user_id == "user-123"
    assert result.total_exams == 5
    assert result.passed_exams == 4


@pytest.mark.asyncio
async def test_create_uses_default_values(
    repository,
    session,
):
    dto = CreateUserExamStatisticsDTO(
        user_id="user-123",
    )

    result = await repository.create(dto)

    entity = session.add.call_args.args[0]

    assert entity.user_id == "user-123"
    assert entity.total_exams == 0
    assert entity.passed_exams == 0
    assert entity.pass_rate == 0.0
    assert entity.average_score == 0.0
    assert entity.best_score == 0
    assert entity.current_streak == 0
    assert entity.longest_streak == 0
    assert entity.total_time_minutes == 0

    assert isinstance(result, UserExamStatisticsDTO)


@pytest.mark.asyncio
async def test_update_updates_existing_statistics(
    repository,
    session,
):
    statistics = UserExamStatistics(
        id=1,
        user_id="user-123",
        total_exams=1,
        passed_exams=1,
        pass_rate=100.0,
        average_score=80.0,
        best_score=80,
        current_streak=1,
        longest_streak=1,
        total_time_minutes=10,
    )

    result_mock = Mock()
    result_mock.scalar_one_or_none.return_value = statistics

    session.execute.return_value = result_mock

    result = await repository.update(
        "user-123",
        UpdateUserExamStatisticsDTO(
            total_exams=10,
            passed_exams=8,
        ),
    )

    assert isinstance(result, UserExamStatisticsDTO)

    assert statistics.total_exams == 10
    assert statistics.passed_exams == 8

    assert result.total_exams == 10
    assert result.passed_exams == 8

    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(statistics)


@pytest.mark.asyncio
async def test_update_does_not_override_missing_fields(
    repository,
    session,
):
    statistics = UserExamStatistics(
        id=1,
        user_id="user-123",
        total_exams=5,
        passed_exams=3,
        best_score=100,
        pass_rate=60.0,
        average_score=70.0,
        current_streak=2,
        longest_streak=5,
        total_time_minutes=50,
    )

    result_mock = Mock()
    result_mock.scalar_one_or_none.return_value = statistics

    session.execute.return_value = result_mock

    await repository.update(
        "user-123",
        UpdateUserExamStatisticsDTO(
            total_exams=10,
        ),
    )

    assert statistics.total_exams == 10
    assert statistics.passed_exams == 3
    assert statistics.best_score == 100
    assert statistics.average_score == 70.0


@pytest.mark.asyncio
async def test_update_returns_none_when_statistics_missing(
    repository,
    session,
):
    result_mock = Mock()
    result_mock.scalar_one_or_none.return_value = None

    session.execute.return_value = result_mock

    result = await repository.update(
        "missing-user",
        UpdateUserExamStatisticsDTO(
            total_exams=10,
        ),
    )

    assert result is None

    session.commit.assert_not_awaited()
    session.refresh.assert_not_awaited()
