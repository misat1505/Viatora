import logging

from dependency_injector import containers, providers
from features.exams.exam_consumer import ExamConsumer
from features.exams.exam_result_repository import ExamResultRepository
from features.exams.exam_service import ExamService
from features.stats.stats_service import StatsService
from features.stats.stats_servicer import StatsServicer
from utils.settings import Settings

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)


class Container(containers.DeclarativeContainer):
    settings = providers.Dependency(instance_of=Settings).provided

    logger = providers.Object(logging.getLogger())

    exam_result_repository = providers.Factory(
        ExamResultRepository,
    )

    exam_service = providers.Factory(
        ExamService,
        exam_result_repository=exam_result_repository,
    )

    exam_consumer = providers.Factory(
        ExamConsumer,
        exam_service=exam_service,
    )

    stats_service = providers.Factory(StatsService)

    stats_servicer = providers.Factory(StatsServicer, stats_service=stats_service)
