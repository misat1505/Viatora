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

    await create_tables(container.engine())

    asyncio.create_task(container.exam_consumer().start())

    server = aio.server()

    stats_pb2_grpc.add_StatsServiceServicer_to_server(
        container.stats_servicer(),
        server,
    )

    server.add_insecure_port(f"[::]:{settings.grpc_port}")

    await server.start()

    logger = container.logger()
    logger.info("Auth gRPC server started on port %s", settings.grpc_port)

    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
