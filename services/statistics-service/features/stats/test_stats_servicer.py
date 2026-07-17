import importlib
from unittest.mock import AsyncMock, Mock

import grpc
import pytest
import utils.decorators
from exceptions.not_found_exception import NotFoundException
from features.stats.models.get_summary import GetSummaryResponse


@pytest.fixture
def stats_servicer_class(monkeypatch):
    monkeypatch.setattr(
        utils.decorators,
        "ValidateRequest",
        lambda *_args, **_kwargs: lambda func: func,
    )

    module = importlib.import_module("features.stats.stats_servicer")

    module = importlib.reload(module)

    return module.StatsServicer


@pytest.fixture
def stats_service():
    service = Mock()

    service.get_summary = AsyncMock()

    return service


@pytest.fixture
def servicer(
    stats_servicer_class,
    stats_service,
):
    return stats_servicer_class(stats_service)


@pytest.fixture
def context():
    context = Mock()

    context.abort = AsyncMock()

    return context


@pytest.mark.asyncio
async def test_get_summary_returns_grpc_response(
    servicer,
    stats_service,
    context,
):
    stats_service.get_summary.return_value = GetSummaryResponse(
        total_exams=10,
        pass_rate=80.0,
        average_score=75.5,
        best_score=100,
        current_streak=3,
        longest_streak=5,
        total_time_minutes=240,
    )

    request = Mock()
    request.user_id = "user-123"

    response = await servicer.GetSummary(
        request,
        context,
    )

    stats_service.get_summary.assert_awaited_once_with(request)

    assert response.total_exams == 10
    assert response.pass_rate == 80.0
    assert response.average_score == 75.5
    assert response.best_score == 100
    assert response.current_streak == 3
    assert response.longest_streak == 5
    assert response.total_time_minutes == 240


@pytest.mark.asyncio
async def test_get_summary_returns_not_found_error(
    servicer,
    stats_service,
    context,
):
    stats_service.get_summary.side_effect = NotFoundException("Statistics not found")

    request = Mock()
    request.user_id = "missing-user"

    await servicer.GetSummary(
        request,
        context,
    )

    context.abort.assert_awaited_once_with(
        grpc.StatusCode.NOT_FOUND,
        "Statistics not found",
    )
