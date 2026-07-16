import logging

from dependency_injector import containers, providers
from features.exams.exam_consumer import ExamConsumer
from features.exams.exam_service import ExamService
from features.exams.user_exam_statistics_repository import UserExamStatisticsRepository
from features.stats.stats_service import StatsService
from features.stats.stats_servicer import StatsServicer
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from utils.settings import Settings

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)


class Container(containers.DeclarativeContainer):
    settings = providers.Dependency(instance_of=Settings).provided

    engine = providers.Singleton(
        create_async_engine,
        settings.database_url,
    )

    session_factory = providers.Singleton(
        async_sessionmaker,
        bind=engine,
        expire_on_commit=False,
    )

    logger = providers.Object(logging.getLogger())

    user_exam_statistics_repository = providers.Factory(
        UserExamStatisticsRepository,
        session_factory=session_factory,
    )

    exam_service = providers.Factory(
        ExamService,
        user_exam_statistics_repository=user_exam_statistics_repository,
    )

    exam_consumer = providers.Factory(
        ExamConsumer,
        exam_service=exam_service,
    )

    stats_service = providers.Factory(StatsService)

    stats_servicer = providers.Factory(StatsServicer, stats_service=stats_service)
