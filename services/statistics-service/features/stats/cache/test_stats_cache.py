from unittest.mock import AsyncMock, Mock

import pytest
from features.stats.cache.stats_cache import StatsCache
from features.stats.models.user_exam_statistics_dto import UserExamStatisticsDTO


@pytest.fixture
def redis():
    redis = Mock()

    redis.set = AsyncMock()
    redis.get = AsyncMock()
    redis.delete = AsyncMock()

    return redis


@pytest.fixture
def cache(redis):
    return StatsCache(
        redis,
        ttl_seconds=300,
    )


def create_stats(
    **kwargs,
):
    defaults = {
        "id": 1,
        "user_id": "user-123",
        "total_exams": 10,
        "passed_exams": 8,
        "pass_rate": 80.0,
        "average_score": 75.5,
        "best_score": 100,
        "current_streak": 3,
        "longest_streak": 5,
        "total_time_minutes": 240,
    }

    defaults.update(kwargs)

    return UserExamStatisticsDTO(**defaults)


@pytest.mark.asyncio
async def test_set_stores_statistics_in_redis(
    cache,
    redis,
):
    stats = create_stats()

    await cache.set(stats)

    redis.set.assert_awaited_once_with(
        "statistics-service:stats:user-123",
        stats.model_dump_json(),
        ex=300,
    )


@pytest.mark.asyncio
async def test_get_returns_statistics_when_exists(
    cache,
    redis,
):
    stats = create_stats()

    redis.get.return_value = stats.model_dump_json()

    result = await cache.get(
        "user-123",
    )

    assert isinstance(
        result,
        UserExamStatisticsDTO,
    )

    assert result == stats

    redis.get.assert_awaited_once_with(
        "statistics-service:stats:user-123",
    )


@pytest.mark.asyncio
async def test_get_returns_none_when_key_missing(
    cache,
    redis,
):
    redis.get.return_value = None

    result = await cache.get(
        "missing-user",
    )

    assert result is None

    redis.get.assert_awaited_once_with(
        "statistics-service:stats:missing-user",
    )


@pytest.mark.asyncio
async def test_update_updates_statistics(
    cache,
    redis,
):
    stats = create_stats(
        total_exams=20,
    )

    await cache.update(stats)

    redis.set.assert_awaited_once_with(
        "statistics-service:stats:user-123",
        stats.model_dump_json(),
        ex=300,
    )


@pytest.mark.asyncio
async def test_delete_removes_statistics(
    cache,
    redis,
):
    await cache.delete(
        "user-123",
    )

    redis.delete.assert_awaited_once_with(
        "statistics-service:stats:user-123",
    )


def test_build_key_returns_correct_key(
    cache,
):
    result = cache.build_key(
        "user-123",
    )

    assert result == "statistics-service:stats:user-123"
