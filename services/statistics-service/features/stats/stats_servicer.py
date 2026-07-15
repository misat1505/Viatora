import grpc
from generated import stats_pb2, stats_pb2_grpc
from utils.decorators import ValidateRequest

from .models.get_summary import GetSummaryRequest
from .stats_service import StatsService


class StatsServicer(stats_pb2_grpc.StatsServiceServicer):
    def __init__(self, stats_service: StatsService):
        self.stats_service = stats_service

    @ValidateRequest(GetSummaryRequest)
    async def GetSummary(self, request: GetSummaryRequest, _: grpc.ServicerContext):
        print(request)
        data = await self.stats_service.get_summary(request)
        return stats_pb2.GetSummaryResponse(**data.model_dump())  # type: ignore[attr-defined]
