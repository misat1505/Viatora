from unittest.mock import AsyncMock, Mock

import pytest
from features.exams.models.entities.user_exam_statistics import UserExamStatistics
from features.exams.user_exam_statistics_repository import UserExamStatisticsRepository


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
    factory = Mock(return_value=session)
    return factory


@pytest.fixture
def repository(session_factory):
    return UserExamStatisticsRepository(session_factory)


@pytest.mark.asyncio
async def test_get_by_user_id_returns_statistics(
    repository,
    session,
):
    statistics = UserExamStatistics(
        user_id="user-123",
    )

    result_mock = Mock()
    result_mock.scalar_one_or_none.return_value = statistics

    session.execute.return_value = result_mock

    result = await repository.get_by_user_id("user-123")

    assert result == statistics

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
    values = {
        "total_exams": 5,
        "passed_exams": 4,
        "average_score": 85,
    }

    result = await repository.create(
        "user-123",
        values,
    )

    session.add.assert_called_once()

    session.commit.assert_awaited_once()

    session.refresh.assert_awaited_once_with(result)

    assert isinstance(result, UserExamStatistics)
    assert result.user_id == "user-123"
    assert result.total_exams == 5
    assert result.passed_exams == 4
    assert result.average_score == 85


@pytest.mark.asyncio
async def test_update_updates_existing_statistics(
    repository,
    session,
):
    statistics = UserExamStatistics(
        user_id="user-123",
        total_exams=1,
        passed_exams=1,
    )

    result_mock = Mock()
    result_mock.scalar_one_or_none.return_value = statistics

    session.execute.return_value = result_mock

    result = await repository.update(
        "user-123",
        {
            "total_exams": 10,
            "passed_exams": 8,
        },
    )

    assert result == statistics
    assert statistics.total_exams == 10
    assert statistics.passed_exams == 8

    session.commit.assert_awaited_once()

    session.refresh.assert_awaited_once_with(statistics)


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
        {
            "total_exams": 10,
        },
    )

    assert result is None

    session.commit.assert_not_awaited()
    session.refresh.assert_not_awaited()
