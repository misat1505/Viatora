import logging

from dependency_injector import containers, providers
from features.exams.exam_consumer import ExamConsumer
from features.exams.user_exam_statistics_repository import UserExamStatisticsRepository
from features.stats.cache.stats_cache import StatsCache
from features.stats.stats_service import StatsService
from features.stats.stats_servicer import StatsServicer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from utils.config import create_kafka_consumer
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

    redis = providers.Singleton(
        Redis,
        host=settings.redis_host,
        port=settings.redis_port,
        password=settings.redis_password,
        decode_responses=True,
    )

    kafka_consumer = providers.Singleton(
        create_kafka_consumer,
        settings=settings,
    )

    stats_cache = providers.Factory(StatsCache, redis=redis)

    user_exam_statistics_repository = providers.Factory(
        UserExamStatisticsRepository,
        session_factory=session_factory,
    )

    stats_service = providers.Factory(
        StatsService,
        user_exam_statistics_repository=user_exam_statistics_repository,
        stats_cache=stats_cache,
    )

    exam_consumer = providers.Factory(
        ExamConsumer,
        consumer=kafka_consumer,
        stats_service=stats_service,
    )

    stats_servicer = providers.Factory(StatsServicer, stats_service=stats_service)
