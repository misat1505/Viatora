import asyncio

from generated import stats_pb2_grpc
from grpc import aio
from utils.database import Base
from utils.di import Container
from utils.settings import settings


async def create_tables(engine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def serve():
    container = Container(settings=settings)

    logger = container.logger()

    await create_tables(container.engine())

    consumer = container.exam_consumer()

    server = aio.server()

    stats_pb2_grpc.add_StatsServiceServicer_to_server(
        container.stats_servicer(),
        server,
    )

    server.add_insecure_port(f"[::]:{settings.grpc_port}")

    await server.start()

    logger.info(
        "Stats gRPC server started on port %s",
        settings.grpc_port,
    )

    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(consumer.start())
            tg.create_task(server.wait_for_termination())
    except* (asyncio.CancelledError, KeyboardInterrupt):
        logger.info("Shutting down...")
    finally:
        await server.stop(grace=2)
        logger.info("Server stopped cleanly")


if __name__ == "__main__":
    try:
        asyncio.run(serve())
    except KeyboardInterrupt:
        pass
